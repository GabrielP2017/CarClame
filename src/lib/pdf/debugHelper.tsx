import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";

/**
 * 모든 페이지에 10pt 단위 정밀 격자를 그립니다.
 * - 50pt 단위: 진한 선 + 좌표 숫자 표시
 * - 10pt 단위: 연한 선 (눈금 역할)
 */
export function applyDebugGridToAllPages(pdfDoc: PDFDocument, font: PDFFont) {
  const pages = pdfDoc.getPages();
  
  pages.forEach((page, index) => {
    // console.log(`Applying grid to page ${index + 1}...`);
    drawFineGrid(page, font);
  });
}

function drawFineGrid(page: PDFPage, font: PDFFont) {
  const { width, height } = page.getSize();
  const fontSize = 6; // 숫자가 겹치지 않게 작게 설정

  // 1. Y축 (가로선) 그리기
  for (let y = 0; y <= height; y += 10) {
    const isMajor = y % 50 === 0;
    const thickness = isMajor ? 1 : 0.5;
    const opacity = isMajor ? 0.5 : 0.2;
    
    // 선 그리기 (빨강 계열)
    page.drawLine({
      start: { x: 0, y },
      end: { x: width, y },
      color: rgb(1, 0, 0),
      thickness,
      opacity,
    });

    // 50단위마다 숫자 표시 (왼쪽 벽 & 오른쪽 벽)
    if (isMajor) {
      const text = Math.round(y).toString();
      // 왼쪽
      page.drawText(text, { x: 2, y: y + 2, size: fontSize, font, color: rgb(1, 0, 0) });
      // 중앙 쯤에도 하나 표시 (폼이 꽉 찼을 때를 대비)
      page.drawText(text, { x: width / 2, y: y + 2, size: fontSize, font, color: rgb(1, 0, 0) });
    }
  }

  // 2. X축 (세로선) 그리기
  for (let x = 0; x <= width; x += 10) {
    const isMajor = x % 50 === 0;
    const thickness = isMajor ? 1 : 0.5;
    const opacity = isMajor ? 0.5 : 0.2;

    // 선 그리기 (파랑 계열)
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      color: rgb(0, 0, 1),
      thickness,
      opacity,
    });

    // 50단위마다 숫자 표시 (위쪽 & 아래쪽)
    if (isMajor) {
      const text = Math.round(x).toString();
      // 하단
      page.drawText(text, { x: x + 2, y: 5, size: fontSize, font, color: rgb(0, 0, 1) });
      // 중간 높이 (글자가 많을 때 식별용)
      page.drawText(text, { x: x + 2, y: height / 2, size: fontSize, font, color: rgb(0, 0, 1) });
    }
  }
}