// Gemini API 요청/응답 타입 정의

export interface ImageAnalysisResult {
  isFloodSuspicious: boolean;
  criticalFindings: string[]; // 침수/녹/부식 등 법적 구제 대상
  minorFindings: string[]; // 기스/흠집 등 참고 사항
  confidence: "high" | "medium" | "low";
}

export interface OcrAnalysisResult {
  noAccidentMarked: boolean;
  categories: {
    engine: string;
    mission: string;
    steering: string;
    brake: string;
    electric: string;
  };
  rawText: string;
  confidence?: "high" | "low" | "retry"; // 신뢰도 필드 추가
}

export interface GeminiAnalysisRequest {
  images?: string[]; // base64 encoded images
  ocrText?: string;
  historyText?: string;
}

export interface GeminiAnalysisResponse {
  imageAnalysis?: ImageAnalysisResult;
  ocrAnalysis?: OcrAnalysisResult;
  historyAnalysis?: {
    hasFloodHistory: boolean;
    accidents: Array<{
      type: string;
      date: string;
      severity: string;
    }>;
  };
}
