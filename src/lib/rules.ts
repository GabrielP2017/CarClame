// src/lib/rules.ts
// 규칙 엔진: 입력(사진·OCR 없어도 됨)만으로
// - 책임보험(30일/2,000km)
// - 판매사 환불(K Car 3일 / 엔카 7일)
// - 개인보험(공통서류 안내)
// - D-day/남은 km 라벨
// - 팩트체크 카드 기본값
// 을 산출하여 1단계에서 합의한 출력 스키마로 반환합니다.

import {
  window30d,
  window3d,
  window7d,
  window90d,
  window2000km,
  daysSince,
  mileageDelta,
} from "@/lib/timeMileage";

// ====== 입/출력 타입 ======
export type MatchRemedyInput = {
  vehicleId: string;
  purchaseDate: string;
  currentMileage: number;
  purchaseMileage?: number | null;
  purchaseChannel: "개인" | "K Car" | "엔카" | "기타";
  ocrText?: string;
  carImages?: string[];
  riders?: string; // 보험 특약
  geminiOcrResult?: any;
  geminiImageResult?: any;
};

type FactHistory = { status: string; summary: string; evidence: string[] };
type FactOCR = { status: string; summary: string; evidence: string[] };
type FactPhoto = { status: string; summary: string };

type Liability = { verdict: string; reason: string };
type DealerRefund = {
  verdict: string;
  reason: string;
  brand?: "K Car" | "엔카";
  windowDays?: number; // 3 또는 7
};
type Personal = { verdict: string; reason: string };

export type MatchRemedyOutput = {
  factCheck: {
    history: FactHistory;
    ocr: FactOCR;
    photo: FactPhoto;
  };
  flags: string[];
  remedies: {
    liabilityInsurance: Liability;
    dealerRefund: DealerRefund;
    personalInsurance: Personal;
  };
  deadlines: {
    d30: { daysLeft: number | null; label: string };
    km2000: { kmLeft: number | null; label: string };
    d3: { daysLeft: number | null; label: string };
    d7: { daysLeft: number | null; label: string };
    d90: { daysLeft: number | null; label: string };
  };
};

// ====== 내부 도움 함수 ======

// 책임보험 판정 라벨을 날짜/주행 조건 조합으로 생성
function verdictByDayKm(dayOk: boolean, kmOk: boolean | null): string {
  if (dayOk && (kmOk === true || kmOk === null)) return "가능성 높음";
  if (!dayOk && kmOk === false) return "기간/주행 초과";
  if (!dayOk) return "기간 초과"; // kmOk가 true 또는 null
  return "주행 초과"; // dayOk 이고 kmOk === false
}

// 이유 문구 생성(설명 통일)
function buildLiabilityReason(
  elapsedDays: number,
  usedKm: number | null
): string {
  const dayPart = `구매 후 ${elapsedDays}일 경과`;
  const kmPart =
    usedKm == null
      ? "구매시 주행거리 미기재 → 주행거리 조건 판정 불가"
      : `구매 후 ${usedKm}km 주행`;
  return `${dayPart} / ${kmPart}`;
}

// 판매사 환불 판정(브랜드별 3일/7일 적용)
function evaluateDealerRefund(
  purchaseChannel: MatchRemedyInput["purchaseChannel"],
  elapsedDays: number
): DealerRefund {
  if (purchaseChannel === "K Car") {
    const dayOk = elapsedDays <= 3;
    return {
      verdict: dayOk ? "가능성 높음" : "기간 초과",
      reason: dayOk
        ? "K Car 3일 환불 정책 창구 대상 가능성"
        : "K Car 3일 환불 정책 기간 초과",
      brand: "K Car",
      windowDays: 3,
    };
  }
  if (purchaseChannel === "엔카") {
    const dayOk = elapsedDays <= 7;
    return {
      verdict: dayOk ? "가능성 높음" : "기간 초과",
      reason: dayOk
        ? "엔카 7일 환불 정책 창구 대상 가능성"
        : "엔카 7일 환불 정책 기간 초과",
      brand: "엔카",
      windowDays: 7,
    };
  }
  // 개인/기타 채널: 판매사 환불 정책 비대상 → 표준 라벨 '검토 필요' 적용
  return {
    verdict: "검토 필요",
    reason:
      "개인/기타 채널은 판매사 환불 정책 대상이 아님 — 다른 구제수단(책임보험/개인보험) 검토 필요",
  };
}

// 팩트체크 카드 기본값(외부 연동/AI 없을 때도 빈칸 방지)
function buildFactCheckDefaults(): MatchRemedyOutput["factCheck"] {
  return {
    history: {
      status: "불명",
      summary: "외부 이력 미연동(목업)",
      evidence: [],
    },
    ocr: {
      status: "확인 불가",
      summary: "기록부 이미지/텍스트 미제공",
      evidence: [],
    },
    photo: {
      status: "업로드 없음",
      summary: "점검 사진 미제공",
    },
  };
}

// ====== 메인 엔트리: 규칙 엔진 ======
export function evaluateAll(input: MatchRemedyInput): MatchRemedyOutput {
  // 1) 기본 D-day/주행 윈도우 계산
  const d30 = window30d(input.purchaseDate);
  const d3 = window3d(input.purchaseDate);
  const d7 = window7d(input.purchaseDate);
  const d90 = window90d(input.purchaseDate);
  const km2000 = window2000km(
    input.purchaseMileage ?? null,
    input.currentMileage
  );

  // 2) 책임보험(30일/2,000km) 판정
  const elapsedDays = daysSince(input.purchaseDate);
  const usedKm = mileageDelta(
    input.purchaseMileage ?? null,
    input.currentMileage
  );
  const dayOk = elapsedDays <= 30;
  const kmOk = usedKm == null ? null : usedKm <= 2000;
  let liabilityVerdict = verdictByDayKm(dayOk, kmOk);
  let liabilityReason = buildLiabilityReason(elapsedDays, usedKm);

  // ★ OCR 결과 반영: 불량 항목이 있으면 보험 청구 권장
  if (input.geminiOcrResult?.categories) {
    const badCategories = Object.values(
      input.geminiOcrResult.categories
    ).filter((v: any) => v === "불량" || v === "점검요");

    if (badCategories.length >= 2) {
      liabilityReason += ` ⚠️ 성능점검기록부상 ${badCategories.length}개 부품 하자 확인됨 - 보험 청구 강력 권장`;
    } else if (badCategories.length === 1) {
      liabilityReason += ` (성능점검기록부상 1개 부품 하자 확인)`;
    }
  }

  // 3) 판매사 환불 판정
  let dealer = evaluateDealerRefund(input.purchaseChannel, elapsedDays);

  // ★ 사진 분석 결과 반영: 침수 의심 시 90일 환불 안내
  if (input.geminiImageResult?.isFloodSuspicious) {
    dealer.reason += " | 침수 의심 흔적 발견 시 90일 환불 정책 검토 가능";
  }

  // 4) 개인보험 판정 (보험 특약 기반)
  let personal: Personal;

  if (input.riders) {
    const ridersLower = input.riders.toLowerCase();
    const hasJacha =
      ridersLower.includes("자차") || ridersLower.includes("자가");
    const hasFlood = ridersLower.includes("침수");

    // 침수 특약 + 사진에서 침수 의심 확인
    if (hasFlood && input.geminiImageResult?.isFloodSuspicious) {
      personal = {
        verdict: "청구 적극 권장",
        reason:
          "침수 특약 가입 + 침수 흔적 발견. 청구서·개인정보동의서·위임장 준비",
      };
    }
    // 침수 특약만 있고 사진 증거 없음
    else if (hasFlood && !input.geminiImageResult?.isFloodSuspicious) {
      personal = {
        verdict: "증거 보완 필요",
        reason: "침수 특약 확인되나 사진 증거 부족. 추가 증빙 후 청구 가능",
      };
    }
    // 자차 특약만 있음
    else if (hasJacha) {
      personal = {
        verdict: "청구 가능 추정",
        reason: "자차 담보 특약 확인됨. 청구서·개인정보동의서·위임장 준비",
      };
    }
    // 기타 특약
    else {
      personal = {
        verdict: "특약 확인 필요",
        reason: `입력 특약: ${input.riders}. 보험사 확인 후 청구 가능 여부 판단`,
      };
    }
  } else {
    // 특약 미입력
    personal = {
      verdict: "검토 필요",
      reason: "가입 특약 미확인. 보험증권 확인 후 청구 가능 여부 판단",
    };
  }

  // 5) 팩트체크 카드(기본값)
  const fact = buildFactCheckDefaults();

  // 6) 불일치/경고 플래그
  const flags: string[] = [];

  return {
    factCheck: fact,
    flags,
    remedies: {
      liabilityInsurance: {
        verdict: liabilityVerdict,
        reason: liabilityReason,
      },
      dealerRefund: dealer,
      personalInsurance: personal,
    },
    deadlines: {
      d30,
      km2000,
      d3,
      d7,
      d90,
    },
  };
}
