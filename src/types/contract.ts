// src/types/contract.ts
// 계약(Contract) 타입 고정 및 기본 문구 제공

// ------------------------------
// 입력 스키마
// ------------------------------
export type PurchaseChannel = '개인' | 'K Car' | '엔카' | '기타';

export interface MatchRemedyInput {
  vehicleId: string;              // 차량번호 또는 VIN
  purchaseDate: string;           // YYYY-MM-DD
  currentMileage: number;         // 현재 주행거리
  purchaseMileage?: number | null; // 구매 시 주행거리(선택)
  purchaseChannel: PurchaseChannel;
  ocrText?: string;               // 선택: OCR 원문
  carImages?: string[];           // 선택: 이미지 URL/경로 배열
}

// ------------------------------
// 출력 스키마
// ------------------------------
export type EvidenceSource =
  | '카히스토리'
  | '기록부'
  | 'OCR'
  | '사진'
  | '사용자'
  | '시스템'
  | (string & {}); // 확장 허용

export interface Evidence {
  source: EvidenceSource;
  text: string;
}

export interface FactCheck {
  history: {
    status: string;
    summary: string;
    evidence: Evidence[];
  };
  ocr: {
    status: string;   // 기본: "확인 불가"
    summary: string;  // 기본: "OCR 미제공"
    evidence: Evidence[];
  };
  photo: {
    status: string;   // 기본: "업로드 없음"
    summary: string;  // 기본: "사진 미제공"
  };
  flags: string[];     // 불일치·경고 메시지
}

export interface VerdictBlock {
  verdict: string;            // 예: "가능성 높음" | "기간/주행 초과" | "검토 필요"
  reason: string;             // 판단 근거 문장
  brand?: 'K Car' | '엔카';   // 판매사 환불 판단 시 표시
}

export interface Remedies {
  liabilityInsurance: VerdictBlock; // 30일·2,000km
  dealerRefund: VerdictBlock;       // K Car 3일 / 엔카 7일 / 침수 90일 등
  personalInsurance: VerdictBlock;  // 공통 서류 안내
}

export interface Dday {
  value: number | null; // 음수: D+N, 양수: D-N, null: 산출 불가/비대상
  label: string;        // 예: "D-3", "D+2", "N/A"
}

export interface Deadlines {
  d30: Dday;     // 책임보험 30일
  km2000: Dday;  // 책임보험 2,000km (미입력 시 null/"미입력")
  d3: Dday;      // K Car 3일
  d7: Dday;      // 엔카 7일
  d90: Dday;     // 침수 90일
}

export interface MatchRemedyOutput {
  factCheck: FactCheck;
  remedies: Remedies;
  deadlines: Deadlines;
}

// ------------------------------
// 기본 문구(사진·OCR 미제공 시 빈칸 방지)
// ------------------------------
export const DEFAULT_OCR: FactCheck['ocr'] = {
  status: '확인 불가',
  summary: 'OCR 미제공',
  evidence: [],
};

export const DEFAULT_PHOTO: FactCheck['photo'] = {
  status: '업로드 없음',
  summary: '사진 미제공',
};

// 선택: history/flags의 안전 기본값
export const DEFAULT_HISTORY: FactCheck['history'] = {
  status: '검토 필요',
  summary: '입력 기반 자동 점검(초안)',
  evidence: [],
};

export const EMPTY_FLAGS: string[] = [];
