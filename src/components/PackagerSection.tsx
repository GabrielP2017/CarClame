"use client";

import Swal from "sweetalert2";

interface PackagerSectionProps {
  visible: boolean;
  vin: string;
  purchaseDate: string;
  apiResponse?: any;
}

export default function PackagerSection({
  visible,
  vin,
  purchaseDate,
  apiResponse,
}: PackagerSectionProps) {
  if (!visible) return null;

  const makeDoc = (kind: string) => {
    const title =
      kind === "warranty"
        ? "성능보증보험 청구서"
        : kind === "refund"
        ? "판매사 환불 신청서"
        : "자동차보험 공통 서류";

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body{font-family:Pretendard,Arial,sans-serif;padding:24px;line-height:1.6}
          h1{margin:0 0 12px 0} 
          .kv{border:1px solid #ddd;border-radius:8px;padding:12px}
          .kv div{display:flex;justify-content:space-between;border-bottom:1px dashed #e6e6e6;padding:6px 0}
          .kv div:last-child{border-bottom:0}
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>본 문서는 MVP 데모에서 자동 생성되었습니다. 실제 양식은 제출 기관의 요구 양식으로 대체됩니다.</p>
        <div class="kv">
          <div><span>식별자</span><strong>${vin}</strong></div>
          <div><span>구매(인도)일</span><strong>${purchaseDate}</strong></div>
          <div><span>작성일</span><strong>${new Date().toLocaleString()}</strong></div>
        </div>
        <p>근거 첨부: 계약서 사본, 성능점검기록부, 카히스토리 리포트, 사진 증빙 등</p>
        <button onclick="window.print()">인쇄/저장</button>
      </body>
      </html>
    `);
    win.document.close();
  };

  const handleMailSend = () => {
    Swal.fire({
      icon: "info",
      title: "메일 전송(목업)",
      text: "DEMO: 실제 메일 연동은 API 연결 후 활성화됩니다.",
    });
  };

  // ★ Gemini 분석 결과 기반 증빙 자료 자동 생성
  const baseChecklist = [
    "매매계약서/거래내역",
    "자동차등록증 사본",
    "성능·상태점검기록부 사본",
    "카히스토리 이력 리포트(목업)",
  ];

  const evidenceList = [];

  // OCR 불량 항목 증빙
  if (apiResponse?.geminiOcrResult?.categories) {
    const badParts = Object.entries(apiResponse.geminiOcrResult.categories)
      .filter(
        ([_, status]: [string, any]) => status === "불량" || status === "점검요"
      )
      .map(([part, _]) => {
        const partNames: any = {
          engine: "엔진",
          mission: "변속기",
          steering: "조향장치",
          brake: "제동장치",
          electric: "전기장치",
        };
        return partNames[part] || part;
      });

    if (badParts.length > 0) {
      evidenceList.push(`✓ 성능점검기록부 하자 확인: ${badParts.join(", ")}`);
    }
  }

  // 사진 침수 증빙
  if (apiResponse?.geminiImageResult?.criticalFindings?.length > 0) {
    evidenceList.push(
      `✓ 사진 증빙: ${apiResponse.geminiImageResult.criticalFindings.join(
        ", "
      )}`
    );
  } else {
    evidenceList.push("차량 점검 사진(하체/엔진룸 등)");
  }

  const checklist = [...baseChecklist, ...evidenceList];

  return (
    <section className="card">
      <h2>청구 패키지</h2>
      <div className="grid3">
        <div className="panel">
          <h3>성능보증보험 청구서</h3>
          <button className="btn" onClick={() => makeDoc("warranty")}>
            자동 작성
          </button>
        </div>
        <div className="panel">
          <h3>판매사 환불 신청서</h3>
          <button className="btn" onClick={() => makeDoc("refund")}>
            자동 작성
          </button>
        </div>
        <div className="panel">
          <h3>자동차보험 공통 서류</h3>
          <button className="btn" onClick={() => makeDoc("insurance")}>
            자동 작성
          </button>
        </div>
      </div>

      <div className="panel full">
        <h3>공통 체크리스트</h3>
        <ul className="bullets">
          {checklist.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button className="btn outline" onClick={() => window.print()}>
          <i className="ri-printer-line"></i> 인쇄/저장
        </button>
        <button className="btn" onClick={handleMailSend}>
          <i className="ri-mail-send-line"></i> 메일 전송(목업)
        </button>
      </div>
    </section>
  );
}
