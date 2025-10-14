// src/app/api/match-remedy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { evaluateAll, type MatchRemedyInput } from "@/lib/rules";
import { analyzeCarImages, analyzeDocumentImage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      vehicleId,
      purchaseDate,
      currentMileage,
      purchaseMileage = null,
      purchaseChannel,
      ocrText,
      carImages,
      docImages,
    } = body ?? {};

    // --- 최소 유효성 검사(필수 필드) ---
    const channels = ["개인", "K Car", "엔카", "기타"];
    const valid =
      typeof vehicleId === "string" &&
      typeof purchaseDate === "string" &&
      (typeof currentMileage === "number" ||
        typeof currentMileage === "string") &&
      channels.includes(purchaseChannel);

    if (!valid) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message:
            "필수 필드(vehicleId, purchaseDate, currentMileage, purchaseChannel)를 확인하세요.",
        },
        { status: 400 }
      );
    }

    // --- 수치 정규화(음수 방지/정수화) ---
    const currentKm = Math.max(0, Math.round(Number(currentMileage)));
    const purchaseKm =
      purchaseMileage == null || purchaseMileage === ""
        ? null
        : Math.max(0, Math.round(Number(purchaseMileage)));

    // --- Gemini AI 분석 먼저 실행 (이미지/OCR 있을 경우만) ---
    let geminiImageResult = null;
    let geminiOcrResult = null;

    // 이미지 분석
    if (carImages && Array.isArray(carImages) && carImages.length > 0) {
      try {
        geminiImageResult = await analyzeCarImages(carImages);
        console.log("Gemini Image Analysis:", geminiImageResult);
      } catch (err) {
        console.error("Image analysis failed:", err);
      }
    }

    // 문서 이미지 직접 분석 (Vision)
    if (docImages && Array.isArray(docImages) && docImages.length > 0) {
      try {
        geminiOcrResult = await analyzeDocumentImage(docImages[0]);
        console.log("Gemini Document Analysis:", geminiOcrResult);
      } catch (err) {
        console.error("Document analysis failed:", err);
      }
    } else {
      // 이미지 미업로드 시 명시적으로 "none" 상태 설정
      geminiOcrResult = {
        noAccidentMarked: false,
        categories: {
          engine: "미확인",
          mission: "미확인",
          steering: "미확인",
          brake: "미확인",
          electric: "미확인",
        },
        rawText: "이미지 미업로드",
        confidence: "none" as "high" | "low" | "retry",
      };
      console.log("No document image uploaded - set to 'none'");
    }

    // ★ Gemini 결과를 포함한 입력 객체 생성
    const input: MatchRemedyInput = {
      vehicleId,
      purchaseDate,
      currentMileage: currentKm,
      purchaseMileage: purchaseKm,
      purchaseChannel,
      ocrText,
      carImages,
      riders: body.riders,
      geminiOcrResult,
      geminiImageResult,
    };

    // 규칙 엔진 실행 (Gemini 결과가 반영된 판정)
    const result = evaluateAll(input);

    // --- Gemini 결과를 factCheck에 병합 ---
    if (geminiImageResult) {
      const criticalText = geminiImageResult.criticalFindings?.length
        ? geminiImageResult.criticalFindings.join(" / ")
        : "해당 없음";

      const minorText = geminiImageResult.minorFindings?.length
        ? geminiImageResult.minorFindings.join(" / ")
        : "특이사항 없음";

      result.factCheck.photo = {
        status: geminiImageResult.isFloodSuspicious ? "의심" : "정상",
        summary: `[구제대상] ${criticalText} | [참고] ${minorText}`,
      };
    }

    if (geminiOcrResult) {
      // confidence 값 안전하게 가져오기
      const confidence = geminiOcrResult.confidence || "high";

      // confidence가 "retry"면 상태를 "재촬영 필요"로 변경
      const ocrStatus =
        confidence === "retry"
          ? "재촬영 필요"
          : geminiOcrResult.noAccidentMarked
          ? "무사고 표기"
          : "사고 표기";

      result.factCheck.ocr = {
        status: ocrStatus,
        summary: `엔진:${geminiOcrResult.categories.engine}, 미션:${geminiOcrResult.categories.mission}`,
        evidence: [geminiOcrResult.rawText],
      };
    }

    // 불일치 플래그 추가
    if (
      geminiOcrResult?.noAccidentMarked &&
      geminiImageResult?.isFloodSuspicious
    ) {
      result.flags.push("기록부-사진 불일치: 무사고 표기이나 침수 의심");
    }

    // 최종 응답 반환
    // 최종 응답 반환
    return NextResponse.json(
      {
        ...result,
        geminiOcrResult, // Gemini OCR 결과 추가
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        error: "server_error",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

// 개발 중 캐싱 회피(빌드 없이 최신 로직 반영)
export const dynamic = "force-dynamic";
