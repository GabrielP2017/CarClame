// src/app/api/match-remedy/route.ts
// 입력(JSON) → 규칙 엔진 → 표준 응답(JSON)
// 사진/ocr 미제공이어도 빈칸 없이 항상 채워진 응답을 반환합니다.

import { NextRequest, NextResponse } from 'next/server';
import { evaluateAll, type MatchRemedyInput } from '@/lib/rules';

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
    } = body ?? {};

    // --- 최소 유효성 검사(필수 필드) ---
    const channels = ['개인', 'K Car', '엔카', '기타'];
    const valid =
      typeof vehicleId === 'string' &&
      typeof purchaseDate === 'string' &&
      (typeof currentMileage === 'number' || typeof currentMileage === 'string') &&
      channels.includes(purchaseChannel);

    if (!valid) {
      return NextResponse.json(
        { error: 'invalid_request', message: '필수 필드(vehicleId, purchaseDate, currentMileage, purchaseChannel)를 확인하세요.' },
        { status: 400 },
      );
    }

    // --- 수치 정규화(음수 방지/정수화) ---
    const currentKm = Math.max(0, Math.round(Number(currentMileage)));
    const purchaseKm =
      purchaseMileage == null || purchaseMileage === ''
        ? null
        : Math.max(0, Math.round(Number(purchaseMileage)));

    const input: MatchRemedyInput = {
      vehicleId,
      purchaseDate,
      currentMileage: currentKm,
      purchaseMileage: purchaseKm,
      purchaseChannel,
      ocrText,
      carImages,
    };

    const result = evaluateAll(input);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'bad_json', message: 'JSON 본문을 확인하세요.' },
      { status: 400 },
    );
  }
}

// 개발 중 캐싱 회피(빌드 없이 최신 로직 반영)
export const dynamic = 'force-dynamic';
