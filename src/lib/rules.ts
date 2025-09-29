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
  } from '@/lib/timeMileage';
  
  // ====== 입/출력 타입 (1단계 계약과 동일) ======
  export type MatchRemedyInput = {
    vehicleId: string;
    purchaseDate: string;                 // YYYY-MM-DD
    currentMileage: number;               // 현재 주행거리
    purchaseMileage?: number | null;      // 구매시 주행거리(옵션)
    purchaseChannel: '개인' | 'K Car' | '엔카' | '기타';
    // 아래 필드는 3단계에서는 사용하지 않지만, 4~8단계에서 활용 예정
    ocrText?: string;
    carImages?: string[];
  };
  
  type FactHistory = { status: string; summary: string; evidence: string[] };
  type FactOCR     = { status: string; summary: string; evidence: string[] };
  type FactPhoto   = { status: string; summary: string };
  
  type Liability = { verdict: string; reason: string };
  type DealerRefund = {
    verdict: string;
    reason: string;
    brand?: 'K Car' | '엔카';
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
    if (dayOk && (kmOk === true || kmOk === null)) return '가능성 높음';
    if (!dayOk && kmOk === false) return '기간/주행 초과';
    if (!dayOk) return '기간 초과';           // kmOk가 true 또는 null
    return '주행 초과';                        // dayOk 이고 kmOk === false
  }
  
  // 이유 문구 생성(설명 통일)
  function buildLiabilityReason(
    elapsedDays: number,
    usedKm: number | null,
  ): string {
    const dayPart = `구매 ${elapsedDays}일 경과`;
    const kmPart =
      usedKm == null
        ? '주행거리 미입력 → km 판정 제외'
        : `구매 후 주행 ${usedKm}km`;
    return `${dayPart}. ${kmPart}`;
  }
  
  // 판매사 환불 판정(브랜드별 3일/7일 적용)
  function evaluateDealerRefund(
    purchaseChannel: MatchRemedyInput['purchaseChannel'],
    elapsedDays: number,
  ): DealerRefund {
    if (purchaseChannel === 'K Car') {
      const dayOk = elapsedDays <= 3;
      return {
        verdict: dayOk ? '가능성 높음' : '기간 초과',
        reason: dayOk
          ? 'K Car 3일 환불 정책 창구 대상 가능성'
          : 'K Car 3일 환불 정책 기간 초과',
        brand: 'K Car',
        windowDays: 3,
      };
    }
    if (purchaseChannel === '엔카') {
      const dayOk = elapsedDays <= 7;
      return {
        verdict: dayOk ? '가능성 높음' : '기간 초과',
        reason: dayOk
          ? '엔카 7일 환불 정책 창구 대상 가능성'
          : '엔카 7일 환불 정책 기간 초과',
        brand: '엔카',
        windowDays: 7,
      };
    }
    // 개인/기타 채널: 판매사 환불 정책 비대상 → 표준 라벨 '검토 필요' 적용
    return {
      verdict: '검토 필요',
      reason: '개인/기타 채널은 판매사 환불 정책 대상이 아님 — 다른 구제수단(책임보험/개인보험) 검토 필요',
    };
  }
  
  // 팩트체크 카드 기본값(외부 연동/AI 없을 때도 빈칸 방지)
  function buildFactCheckDefaults(): MatchRemedyOutput['factCheck'] {
    return {
      history: {
        status: '불명',
        summary: '외부 이력 미연동(목업)',
        evidence: [],
      },
      ocr: {
        status: '확인 불가',
        summary: '기록부 이미지/텍스트 미제공',
        evidence: [],
      },
      photo: {
        status: '업로드 없음',
        summary: '점검 사진 미제공',
      },
    };
  }
  
  // ====== 메인 엔트리: 규칙 엔진 ======
  export function evaluateAll(input: MatchRemedyInput): MatchRemedyOutput {
    // 1) 기본 D-day/주행 윈도우 계산
    const d30 = window30d(input.purchaseDate);
    const d3  = window3d(input.purchaseDate);
    const d7  = window7d(input.purchaseDate);
    const d90 = window90d(input.purchaseDate);
    const km2000 = window2000km(input.purchaseMileage ?? null, input.currentMileage);
  
    // 2) 책임보험(30일/2,000km) 판정
    const elapsedDays = daysSince(input.purchaseDate);
    const usedKm = mileageDelta(input.purchaseMileage ?? null, input.currentMileage);
    const dayOk = elapsedDays <= 30;
    const kmOk = usedKm == null ? null : usedKm <= 2000;
    const liabilityVerdict = verdictByDayKm(dayOk, kmOk);
    const liabilityReason  = buildLiabilityReason(elapsedDays, usedKm);
  
    // 3) 판매사 환불 판정
    const dealer = evaluateDealerRefund(input.purchaseChannel, elapsedDays);
  
    // 4) 개인보험(기본: 검토 필요 + 공통 서류 안내)
    const personal: Personal = {
      verdict: '검토 필요',
      reason: '개인 자동차보험 청구는 사건 유형별로 상이. 공통 서류 안내 필요',
    };
  
    // 5) 팩트체크 카드(기본값)
    const fact = buildFactCheckDefaults();
  
    // 6) 불일치/경고 플래그(3단계에서는 기본 없음)
    const flags: string[] = [];
  
    return {
      factCheck: fact,
      flags,
      remedies: {
        liabilityInsurance: { verdict: liabilityVerdict, reason: liabilityReason },
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
  