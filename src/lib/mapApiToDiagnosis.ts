// src/lib/mapApiToDiagnosis.ts
// API 응답(JSON)을 기존 UI가 사용하는 DiagnosisResult 형태로 변환
import { DiagnosisResult, KahistoryData, OCRData, FormData } from "@/types";
import { MOCK_KAHISTORY, MOCK_OCR } from "@/lib/mockData";

export function mapApiToDiagnosis(api: any, form: FormData): DiagnosisResult {
  // 1) 카히스토리: 현재 API는 요약만 제공 → 목업 기반으로 VIN만 교체
  const kahistory: KahistoryData = {
    ...MOCK_KAHISTORY,
    vin: form.vin || (api?.factCheck?.history?.vin ?? MOCK_KAHISTORY.vin),
  };

  // 2) OCR: API 응답 우선 사용, 없으면 MOCK
  const geminiOcrResult = api?.geminiOcrResult || api?.factCheck?.ocr;

  const ocr: OCRData = geminiOcrResult
    ? {
        noAccidentMarked: geminiOcrResult.noAccidentMarked ?? false,
        categories: {
          engine: geminiOcrResult.categories?.engine || "미확인",
          mission: geminiOcrResult.categories?.mission || "미확인",
          steering: geminiOcrResult.categories?.steering || "미확인",
          brake: geminiOcrResult.categories?.brake || "미확인",
          electric: geminiOcrResult.categories?.electric || "미확인",
        },
        confidence: geminiOcrResult.confidence || "high", // Gemini 결과 그대로 보존
      }
    : MOCK_OCR;

  // 3) 사진 결과 → API summary 파싱
  const photoSummary = String(api?.factCheck?.photo?.summary || "");
  const photoFindings: string[] = [];

  // [구제대상] 파싱
  const criticalMatch = photoSummary.match(/\[구제대상\]\s*([^|]+)/);
  if (criticalMatch && criticalMatch[1] !== "해당 없음") {
    criticalMatch[1].split("/").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed && trimmed !== "해당 없음") {
        photoFindings.push(`[구제대상] ${trimmed}`);
      }
    });
  }

  // [참고] 파싱
  const minorMatch = photoSummary.match(/\[참고\]\s*(.+)/);
  if (minorMatch && minorMatch[1] !== "특이사항 없음") {
    minorMatch[1].split("/").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed && trimmed !== "특이사항 없음") {
        photoFindings.push(`[참고] ${trimmed}`);
      }
    });
  }

  // 아무것도 없으면 기본 메시지
  if (photoFindings.length === 0) {
    photoFindings.push("특이 사항 없음");
  }

  // 4) flags 그대로 사용(없으면 빈 배열)
  const flags: string[] = Array.isArray(api?.flags)
    ? (api.flags as string[])
    : [];

  return { kahistory, ocr, photoFindings, flags };
}
