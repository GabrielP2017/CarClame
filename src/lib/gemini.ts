// Gemini API 호출 래퍼 함수
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ImageAnalysisResult, OcrAnalysisResult } from "@/types/gemini";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 이미지 분석: 침수 흔적 감지
export async function analyzeCarImages(
  images: string[]
): Promise<ImageAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1, // 0에 가까울수록 일관성 높음 (0~2 범위)
      topP: 0.8,
      topK: 10,
    },
  });

  const prompt = `당신은 중고차 침수 여부를 판정하는 전문 감정사입니다. 업로드된 차량 사진을 면밀히 분석하세요.

다음 증거 중 하나라도 발견되면 침수 의심(isFloodSuspicious: true)으로 판단하세요:

**구제 대상 하자 (criticalFindings):**
1. 녹/부식 - 하체, 프레임, 볼트의 심한 녹, 광범위한 부식
2. 물 얼룩/흙탕물 라인
3. 엔진룸/트렁크 이물질/퇴적물
4. 전기 부품 부식

**참고 사항 (minorFindings):**
- 범퍼/보닛/도어 기스, 찍힘
- 도색 차이, 색 바램
- 휠 스크래치
- 경미한 외관 손상

판단 기준:
- "심한 녹", "광범위한 부식" 발견 → isFloodSuspicious를 TRUE로 설정
- 하체/구조 부품의 녹 → confidence를 "high" 또는 "medium"으로
- 여러 부위에서 녹 발견 → isFloodSuspicious를 TRUE로 설정

**중요: 일관성 유지 규칙**
- 같은 부위는 항상 같은 용어 사용 (예: "배기관"으로 통일, "파이프" 사용 금지)
- 발견 항목을 중요도 순으로 정렬
- 경미한 녹은 무시하고 "심한 녹", "광범위한 부식"만 포함
- 최대 3개 핵심 발견만 criticalFindings에 포함

반드시 아래 JSON 형식으로만 답변하세요:
{
  "isFloodSuspicious": boolean,
  "criticalFindings": ["최대 3개의 핵심 발견사항만"],
  "minorFindings": ["최대 2개의 외관 하자만"],
  "confidence": "high" | "medium" | "low"
}

criticalFindings 예시: "하체 프레임 광범위한 부식", "엔진룸 침수 흔적"
minorFindings 예시: "범퍼 좌측 찍힘", "도어 도색 차이", "휠 스크래치"`;

  try {
    // 이미지를 Gemini 형식으로 변환
    const imageParts = images.map((base64) => ({
      inlineData: {
        data: base64.split(",")[1], // "data:image/jpeg;base64," 제거
        mimeType: "image/jpeg",
      },
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();

    // JSON 파싱 (```json ``` 제거)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini image analysis error:", error);
    return {
      isFloodSuspicious: false,
      criticalFindings: [],
      minorFindings: [],
      confidence: "low",
    };
  }
}

// OCR 텍스트 분석: 성능점검기록부 해석
export async function analyzeOcrText(
  ocrText: string
): Promise<OcrAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `당신은 자동차 성능점검기록부를 분석하는 전문가입니다.

아래 OCR로 추출된 한국어 성능점검기록부 텍스트를 분석하여 다음 정보를 추출하세요:

1. 무사고 표기 여부: "무사고", "사고없음", "사고이력없음" 등의 문구가 있으면 true
2. 각 부품별 상태:
   - 엔진, 미션(변속기), 조향, 제동, 전기 항목 찾기
   - 각 항목마다 "정상", "점검요", "불량" 중 하나로 분류
   - 해당 항목이 없으면 "미확인"으로 표시

반드시 아래 JSON 형식으로만 답변하세요:
{
  "noAccidentMarked": boolean,
  "categories": {
    "engine": "정상" | "점검요" | "불량" | "미확인",
    "mission": "정상" | "점검요" | "불량" | "미확인",
    "steering": "정상" | "점검요" | "불량" | "미확인",
    "brake": "정상" | "점검요" | "불량" | "미확인",
    "electric": "정상" | "점검요" | "불량" | "미확인"
  },
  "rawText": "원본 텍스트 중 핵심 발췌"
}

분석할 OCR 텍스트:
${ocrText}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini OCR analysis error:", error);
    return {
      noAccidentMarked: false,
      categories: {
        engine: "미확인",
        mission: "미확인",
        steering: "미확인",
        brake: "미확인",
        electric: "미확인",
      },
      rawText: ocrText,
    };
  }
}

// 문서 이미지 직접 분석 (Vision)
export async function analyzeDocumentImage(
  imageBase64: string
): Promise<OcrAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 10,
    },
  });

  const prompt = `You are analyzing a Korean vehicle inspection report (자동차 성능·상태 점검기록부).

  **CRITICAL: Document Validation First**
  Before analyzing, verify this is actually a vehicle inspection report:
  - Must contain Korean text "성능" or "점검기록부" or "자동차"
  - Must have a table structure with multiple rows and checkboxes
  - Must NOT be a photo of a damaged car, accident scene, or random image
  
  If this is NOT a valid inspection report (e.g., just a car photo):
  - Set ALL categories to "미확인"
  - Set noAccidentMarked to false
  - Set rawText to "문서 형식 불일치 - 성능점검기록부가 아님"
  - Return immediately with this JSON structure
  
  This is a complex table-based document. Follow these steps:
  
  **STEP 1: Find accident history - CRITICAL LOCATION**
  - Look at the BOTTOM LEFT of the document
  - Find text "사고교환수리 등 이력" (Accident/Repair History)
  - Below this text, there's a car diagram with 4 views
  - IMMEDIATELY TO THE RIGHT of the car diagram, find:
    * "사고이력" (Accident History) section
    * Look for checkboxes: "□ 있음" (Yes) or "□ 없음" (No)
  - If "없음" (No) is checked → noAccidentMarked = true
  - If "있음" (Yes) is checked → noAccidentMarked = false
  
  **STEP 2: Locate component status table**
  - This is on the RIGHT SIDE of the document
  - Large vertical table with many checkboxes
  - Each row = one component
  
  **STEP 3: Extract component status - CRITICAL RULES**
  Find these sections in the right table:
  
  1. **전기** (Electric/Electrical) section:
     - Look for rows with "전기" label
     - Status indicators: "양호" (Good) / "교환" (Replace) / "불량" (Bad)
     - If all items show "양호" → "정상"
     - If any "교환" or "불량" → "점검요"
  
  2. **고전원 전기장치** (High-voltage electrical) section:
     - This is SEPARATE from regular "전기"
     - If NO checkmarks at all in this section → ignore it, use "전기" result
     - If checkmarks exist → evaluate separately
  
  3. Other components (엔진/변속기/조향장치/제동장치):
     - Find them in the right table
     - Check if boxes are marked as "양호" or have check marks
     - Default to "정상" if found with good indicators
  
  **IMPORTANT:**
  - "전기" section with "양호" markings = "정상"
  - Empty "고전원 전기장치" section = ignore it
  - Focus on actual marked checkboxes, not empty ones
  
  Example output:
  {
    "noAccidentMarked": true,
    "categories": {
      "engine": "정상",
      "mission": "정상",
      "steering": "정상",
      "brake": "정상",
      "electric": "정상"
    },
    "rawText": "2013년 검사"
  }
  
  Now analyze the image and output JSON only:`;
  try {
    const imagePart = {
      inlineData: {
        data: imageBase64.split(",")[1],
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    console.log("=== Gemini Document Response (Raw) ===");
    console.log(text);
    console.log("======================================");

    // 코드블록 제거 (```json ``` 또는 ``` ```)
    let cleanedText = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to extract JSON from response");
      throw new Error("Invalid JSON response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log("✓ Successfully parsed JSON:", parsed);

    // 신뢰도 검증
    const confidence = calculateConfidence(parsed);

    return {
      ...parsed,
      confidence, // "high" | "low" | "retry"
    };
  } catch (error) {
    console.error("Gemini document analysis error:", error);
    return {
      noAccidentMarked: false,
      categories: {
        engine: "미확인",
        mission: "미확인",
        steering: "미확인",
        brake: "미확인",
        electric: "미확인",
      },
      rawText: "이미지 분석 실패",
      confidence: "retry", // 명시적으로 재촬영 요청
    };
  }
}

// 카히스토리 텍스트 분석
export async function analyzeHistoryText(historyText: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `당신은 자동차 이력 분석 전문가입니다.

아래 카히스토리 텍스트를 분석하여 사고 이력을 추출하세요:

1. 침수 이력 여부 판단 (텍스트에 "침수" 키워드가 있으면 true)
2. 모든 사고 기록을 배열로 정리:
   - type: "침수", "단순수리", "대물사고", "자손사고" 등
   - date: YYYY-MM-DD 형식
   - severity: "경미", "중간", "심각" 중 하나 (보험금/내용 기반 판단)

반드시 아래 JSON 형식으로만 답변하세요:
{
  "hasFloodHistory": boolean,
  "accidents": [
    {
      "type": "사고 종류",
      "date": "YYYY-MM-DD",
      "severity": "경미" | "중간" | "심각"
    }
  ]
}

분석할 카히스토리 텍스트:
${historyText}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini history analysis error:", error);
    return {
      hasFloodHistory: false,
      accidents: [],
    };
  }
}

// OCR 결과 신뢰도 계산
function calculateConfidence(
  result: OcrAnalysisResult
): "high" | "low" | "retry" {
  const categories = result.categories;
  const rawText = result.rawText || "";

  // "미확인" 개수 세기
  const unknownCount = Object.values(categories).filter(
    (status) => status === "미확인"
  ).length;

  // **CRITICAL: 문서 형식 불일치 감지**
  if (
    rawText.includes("문서 형식 불일치") ||
    rawText.includes("성능점검기록부가 아님") ||
    rawText.includes("이미지 분석 실패")
  ) {
    return "retry";
  }

  // 모든 항목이 미확인 → 재촬영 필요
  if (unknownCount === 5) {
    return "retry";
  }

  // 3개 이상 미확인 → 낮은 신뢰도
  if (unknownCount >= 3) {
    return "low";
  }

  // 정상
  return "high";
}
