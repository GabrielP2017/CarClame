// src/lib/mapApiToDiagnosis.ts
// API 응답(JSON)을 기존 UI가 사용하는 DiagnosisResult 형태로 변환
import { DiagnosisResult, KahistoryData, OCRData, FormData } from '@/types';
import { MOCK_KAHISTORY, MOCK_OCR } from '@/lib/mockData';

export function mapApiToDiagnosis(api: any, form: FormData): DiagnosisResult {
  // 1) 카히스토리: 현재 API는 요약만 제공 → 목업 기반으로 VIN만 교체
  const kahistory: KahistoryData = {
    ...MOCK_KAHISTORY,
    vin: form.vin || (api?.factCheck?.history?.vin ?? MOCK_KAHISTORY.vin),
  };

  // 2) OCR: 상태 텍스트로 noAccidentMarked만 추정, 카테고리는 목업 기본값 유지
  const ocrFromApi = String(api?.factCheck?.ocr?.status || '').trim();
  const noAccident = ocrFromApi === '정상' || ocrFromApi === '무사고';
  const ocr: OCRData = {
    ...MOCK_OCR,
    noAccidentMarked: noAccident,
  };

  // 3) 사진 결과 → 텍스트로 매핑
  const photoStatus = String(api?.factCheck?.photo?.status || '');
  const photoFindings =
    photoStatus === '의심'
      ? ['침수/오염 의심']
      : ['특이 사항 없음'];

  // 4) flags 그대로 사용(없으면 빈 배열)
  const flags: string[] = Array.isArray(api?.flags) ? (api.flags as string[]) : [];

  return { kahistory, ocr, photoFindings, flags };
}
