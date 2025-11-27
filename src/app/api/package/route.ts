// src/app/api/package/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  generateClaimPackagePdf,
  ClaimPackagePayload,
  ClaimDocumentType,
} from "@/lib/pdf/claimPackage";

// Node 런타임 강제 (Buffer 등 사용 가능)
export const runtime = "nodejs";
// 개발 중 캐싱 회피
export const dynamic = "force-dynamic";

type IncomingBody = Partial<ClaimPackagePayload> & {
  docs?: ClaimDocumentType[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IncomingBody;

    if (!body) {
      return NextResponse.json(
        { error: "validation_error", message: "요청 본문이 비어 있습니다." },
        { status: 400 }
      );
    }

    const {
      claimantName,
      claimantPhone,
      vehicleId,
      purchaseDate,
      claimantEmail,
      claimantAddress,
      vin,
      accidentDate,
      currentMileage,
      purchaseMileage,
      purchaseChannel,
      docs,
      diagnosisFlags,
      extra,
    } = body;

    // 최소 필수 필드 체크
    if (!claimantName || !claimantPhone || !vehicleId || !purchaseDate) {
      return NextResponse.json(
        {
          error: "validation_error",
          message:
            "claimantName, claimantPhone, vehicleId, purchaseDate는 필수입니다.",
        },
        { status: 400 }
      );
    }

    const payload: ClaimPackagePayload = {
      claimantName,
      claimantPhone,
      claimantEmail: claimantEmail ?? "",
      claimantAddress: claimantAddress ?? "",
      vehicleId,
      vin: vin ?? "",
      purchaseDate,
      accidentDate: accidentDate ?? "",
      currentMileage,
      purchaseMileage: purchaseMileage ?? null,
      purchaseChannel,
      docs: docs && docs.length ? docs : ["common_insurance_claim"],
      diagnosisFlags: diagnosisFlags ?? [],
      extra: extra ?? {},
    };

    const pdfBytes = await generateClaimPackagePdf(payload);

    // ✅ Uint8Array → ArrayBuffer 로 변환 (TS의 BodyInit 타입에 맞추기)
    const pdfArrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;

    const safeVehicleId = encodeURIComponent(vehicleId);
    const safePurchaseDate = encodeURIComponent(purchaseDate);
    const fileName = `claim-package-${safeVehicleId}-${safePurchaseDate}.pdf`;

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error("Error in /api/package:", error);
    return NextResponse.json(
      {
        error: "server_error",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
