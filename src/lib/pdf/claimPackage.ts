import {
  PDFDocument,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

import { applyDebugGridToAllPages } from "./debugHelper"; // 방금 만든 파일 import


export type ClaimDocumentType =
  | "common_insurance_claim"
  // | "warranty_claim" // 삭제됨
  | "dealer_refund";

export interface ClaimPackagePayload {
  claimantName: string;
  claimantPhone: string;
  claimantEmail?: string;
  claimantAddress?: string;
  claimantResidentId?: string;
  vehicleId: string;
  vin: string;
  purchaseDate: string;
  purchasePrice?: string;
  accidentDate?: string;
  purchaseChannel?: string;
  docs?: ClaimDocumentType[];
}

const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NanumGothic.ttf");
const FORM_BASE_PATH = path.join(process.cwd(), "public", "forms");
const TEXT_COLOR = rgb(0, 0, 0);

/**
 * 헬퍼: 텍스트 그리기 (좌표 보정 포함)
 * PDF-Lib은 기본적으로 좌측 하단이 (0,0)입니다.
 * 사용자가 "위에서부터 잰 좌표"를 넣었다면 (height - y) 변환이 필요하지만,
 * 현재 코드는 이미 변환된(하단 기준) 값을 사용하는 것으로 추정됩니다.
 * 다만 안전을 위해 page 높이를 참조합니다.
 */
function drawText(page: PDFPage, text: string | undefined, x: number, y: number, font: PDFFont, size: number = 10) {
  if (!text) return;
  // const { height } = page.getSize();
  // 만약 좌표가 안 맞으면 height - y 로 반전 테스트 필요.
  // 현재는 제공된 좌표(y=665 등)가 A4(842) 기준 상단 위치(하단에서 665 올라간 위치)라고 가정.
  page.drawText(text, { x, y, size, font, color: TEXT_COLOR });
}

function drawCheck(page: PDFPage, x: number, y: number, font: PDFFont) {
  page.drawText("V", { x, y, size: 14, font, color: TEXT_COLOR });
}

/**
 * 1. 삼성화재 보험금 청구서
 */
async function fillInsuranceClaim(
  mergedPdf: PDFDocument,
  payload: ClaimPackagePayload,
  font: PDFFont
) {
  const filePath = path.join(FORM_BASE_PATH, "insurance_claim.pdf");
  if (!fs.existsSync(filePath)) throw new Error(`파일 없음: ${filePath}`);

  const formBytes = fs.readFileSync(filePath);
  const formPdf = await PDFDocument.load(formBytes);
  const pageIndices = formPdf.getPageIndices();
  const copiedPages = await mergedPdf.copyPages(formPdf, pageIndices);

  // [1페이지] 청구서 작성
  const page1 = mergedPdf.addPage(copiedPages[0]);
  const page5 = mergedPdf.addPage(copiedPages[4]);
  const page6 = mergedPdf.addPage(copiedPages[5]);

  // 좌표계 확인: A4 Height = 841.89
  // y=665는 바닥에서 665pt (상단에서 약 177pt) -> "인적사항" 위치 적절
  
  // 1. 인적 사항
  drawText(page1, payload.claimantName, 155, 665, font);        // 성명 ✅
  if (payload.claimantResidentId) {
    drawText(page1, payload.claimantResidentId, 260, 665, font);  // 주민번호
  }

  // 2. 연락처 (휴대폰) ✅
  drawText(page1, payload.claimantPhone, 320, 625, font);

  // 3. 차량번호 ✅
  drawText(page1, payload.vehicleId, 180, 447, font);

  // 4. 예금주 (수령 계좌)
  drawText(page1, payload.claimantName, 510, 337, font);

  // 5. 하단 서명 (작성일 / 성명)
  const today = new Date();
  const signY = 177; 
  drawText(page1, `${today.getFullYear()}`, 80, signY, font);
  drawText(page1, `${today.getMonth() + 1}`, 120, signY, font);
  drawText(page1, `${today.getDate()}`, 145, signY, font);
  drawText(page1, payload.claimantName, 470, signY, font);

  // 나머지 페이지
  for (let i = 1; i < copiedPages.length; i++) {
    const page = mergedPdf.addPage(copiedPages[i]);
    // [2페이지] 필수 동의서
    if (i === 1) {
      const checkX = 500;
      drawCheck(page, checkX, 360, font);
      drawCheck(page, checkX, 270, font);
      drawCheck(page, checkX, 170, font);
    }
    // [4페이지] 상세 동의서
    if (i === 3) {
      const checkX = 500;
      drawCheck(page, checkX, 670, font);
      drawCheck(page, checkX, 580, font);
      drawCheck(page, checkX, 500, font);
      drawCheck(page, checkX, 410, font);
    }
    if (i === 4) {
      const checkX = 500;
      drawCheck(page, checkX, 690, font);
      drawCheck(page, checkX, 610, font);
      drawCheck(page, checkX, 540, font);
    }
    if (i === 5) {
      const checkX = 490;
      drawCheck(page, checkX, 440, font);
      drawCheck(page, checkX, 390, font);
    }
  }

  // 5. 하단 서명 (작성일 / 성명)
  const signY5 = 440; 
  drawText(page5, `${today.getFullYear()}`, 100, signY5, font);
  drawText(page5, `${today.getMonth() + 1}`, 150, signY5, font);
  drawText(page5, `${today.getDate()}`, 190, signY5, font);
  drawText(page5, payload.claimantName, 470, signY5, font);

  // 6. 하단 서명 (작성일 / 성명)
  const signY6 = 330; 
  drawText(page6, `${today.getFullYear()}`, 90, signY6, font);
  drawText(page6, `${today.getMonth() + 1}`, 150, signY6, font);
  drawText(page6, `${today.getDate()}`, 200, signY6, font);
  drawText(page6, payload.claimantName, 450, signY6, font);

}

/**
 * 3. 한국소비자원 환불 신청서
 * (기존 3번 -> 성능기록부 삭제로 인해 2번째 처리)
 */
async function fillDealerRefund(mergedPdf: PDFDocument, payload: ClaimPackagePayload, font: PDFFont) {
  const filePath = path.join(FORM_BASE_PATH, "refund_application.pdf");
  if (!fs.existsSync(filePath)) throw new Error(`파일 없음: ${filePath}`);

  const formBytes = fs.readFileSync(filePath);
  const formPdf = await PDFDocument.load(formBytes);
  const copiedPages = await mergedPdf.copyPages(formPdf, formPdf.getPageIndices());

  // [1페이지] 안내문
  mergedPdf.addPage(copiedPages[0]);

  const page1 = mergedPdf.addPage(copiedPages[0]);
  drawCheck(page1, 420, 500, font);
  drawCheck(page1, 420, 370, font);

  // [2페이지] 신청서 본문 (인덱스 1)
  if (copiedPages.length > 1) {
    const page2 = mergedPdf.addPage(copiedPages[1]);
    // y=735는 상단부 (Height 842 - 107) -> 적절함
    drawText(page2, payload.claimantName, 220, 735, font);    // 성명
    drawText(page2, payload.claimantAddress, 190, 695, font); // 주소
    drawText(page2, payload.claimantPhone, 190, 655, font);   // 연락처
    
    if (payload.purchaseChannel) {
      drawText(page2, payload.purchaseChannel, 170, 500, font); // 피신청인
    }
    drawText(page2, payload.purchaseDate, 250, 130, font);    // 구입일
  }

  // [3페이지] 피해내용 (인덱스 2)
  if (copiedPages.length > 2) {
    const page3 = mergedPdf.addPage(copiedPages[2]);
    drawCheck(page3, 140, 310, font); // 환불 체크
    
    const today = new Date();
    drawText(page3, `${today.getFullYear()}`, 250, 180, font);
    drawText(page3, `${today.getMonth() + 1}`, 320, 180, font);
    drawText(page3, `${today.getDate()}`, 360, 180, font);
    drawText(page3, payload.claimantName, 410, 180, font);
  }

  // 나머지 페이지 (개인정보 동의 등)
  for (let i = 3; i < copiedPages.length; i++) {
    const page = mergedPdf.addPage(copiedPages[i]);
    // [4페이지] 동의서 (인덱스 3)
    if (i === 3) {
       drawCheck(page, 80, 510, font); 
       drawCheck(page, 80, 90, font); 
    }
  }
}

/**
 * Main Generator
 */
export async function generateClaimPackagePdf(payload: ClaimPackagePayload): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  mergedPdf.registerFontkit(fontkit);

  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`폰트 파일 경로 오류: ${FONT_PATH}`);
  }
  const fontBytes = fs.readFileSync(FONT_PATH);

  // [FIX] subset: false -> 한글 깨짐/보이지 않음 현상 해결 (파일 용량은 증가)
  const font = await mergedPdf.embedFont(fontBytes, { subset: false });

  // 기본 생성 목록에서 warranty_claim 제거
  const docsToGenerate = payload.docs && payload.docs.length > 0
      ? payload.docs.filter(doc => doc !== 'warranty_claim' as any) // 타입 강제 캐스팅 방지용 필터
      : ["common_insurance_claim", "dealer_refund"] as ClaimDocumentType[];

  for (const doc of docsToGenerate) {
    switch (doc) {
      case "common_insurance_claim":
        await fillInsuranceClaim(mergedPdf, payload, font);
        break;
      // case "warranty_claim": 제거됨
      case "dealer_refund":
        await fillDealerRefund(mergedPdf, payload, font);
        break;
    }
  }

  // ===============================================
  // [DEBUG] 좌표 따기용 격자 생성 (배포 시 주석 처리)
  // ===============================================
  //applyDebugGridToAllPages(mergedPdf, font); 


  return mergedPdf.save();
}