"use client";

import { useState } from "react";
import Swal from "sweetalert2";

// DocType에서 warranty_claim 제거
type DocType =
  | "common_insurance_claim"
  | "dealer_refund"
  | "consent"
  | "power_of_attorney";

interface PackagerSectionProps {
  visible: boolean;
  vin: string;
  purchaseDate: string;
  apiResponse?: any;
}

// 옵션 리스트 수정
const DOC_OPTIONS: { id: DocType; label: string; hint: string }[] = [
  {
    id: "common_insurance_claim",
    label: "자동차 보험사 공통 청구서",
    hint: "삼성화재 보험 청구 기본 양식",
  },
  {
    id: "dealer_refund",
    label: "판매사 환불 신청서",
    hint: "K Car / 엔카 / 기타 판매사 환불 요구",
  },
  {
    id: "consent",
    label: "개인정보 동의서",
    hint: "보험사/판매사 공통 필수에 가까움",
  },
  {
    id: "power_of_attorney",
    label: "위임장",
    hint: "자신이 있는 구청에서 직접 발급 필요",
  },
];

export default function PackagerSection({
  visible,
  vin,
  purchaseDate,
  apiResponse,
}: PackagerSectionProps) {
  const [claimantName, setClaimantName] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [claimantAddress, setClaimantAddress] = useState("");
  const [accidentDate, setAccidentDate] = useState("");
  
  // 초기 선택값에서 warranty_claim 제거
  const [selectedDocs, setSelectedDocs] = useState<DocType[]>([
    "common_insurance_claim",
    "dealer_refund",
    "consent",
    "power_of_attorney",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!visible) return null;

  const toggleDoc = (doc: DocType) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const handleGeneratePackage = async () => {
    if (!claimantName || !claimantPhone) {
      Swal.fire("입력 필요", "신청인 이름과 연락처를 입력해 주세요.", "warning");
      return;
    }
    if (!purchaseDate) {
      Swal.fire("입력 필요", "구매일 정보가 없습니다.", "warning");
      return;
    }
    if (!vin) {
      Swal.fire("입력 필요", "차량번호/VIN 정보가 없습니다.", "warning");
      return;
    }
    if (selectedDocs.length === 0) {
      Swal.fire(
        "선택 필요",
        "생성할 서류 종류를 최소 1개 이상 선택해 주세요.",
        "warning"
      );
      return;
    }

    setIsGenerating(true);
    try {
      const flags: string[] = Array.isArray(apiResponse?.flags)
        ? apiResponse.flags
        : [];

      const purchaseChannel =
        apiResponse?.purchaseChannel ??
        apiResponse?.input?.purchaseChannel ??
        undefined;

      const body = {
        claimantName,
        claimantPhone,
        claimantEmail,
        claimantAddress,
        vehicleId: vin,
        vin,
        purchaseDate,
        accidentDate: accidentDate || undefined,
        purchaseChannel,
        docs: selectedDocs,
        diagnosisFlags: flags,
      };

      const res = await fetch("/api/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.message || `서류 생성 실패 (status ${res.status}) 입니다.`;
        Swal.fire("실패", msg, "error");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `청구패키지_${vin}_${purchaseDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire("완료", "청구 패키지 PDF가 생성되었습니다.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire(
        "에러",
        "서류 패키지 생성 중 알 수 없는 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMailSend = () => {
    Swal.fire(
      "메일 전송 (목업)",
      "실제 이메일 발송 대신, 이 메시지만 표시합니다.",
      "info"
    );
  };

  const checklist = [
    "신분증 사본",
    "매매계약서 / 거래내역",
    "자동차등록증 사본",
    // "성능·상태점검기록부 사본", // UI 상 체크리스트에서도 제거하는 편이 좋음 (선택사항)
    "카히스토리 이력 리포트(목업 가능)",
    "정비 명세서 / 수리 견적서",
    "사고·하자 부위 사진",
  ];

  return (
    <section className="panel">
      <h2>청구 패키지 자동 생성</h2>
      <p className="sub">
        진단 결과를 바탕으로, 보험·환불에 필요한 서류 패키지를 한 번에 생성합니다.
      </p>

      <div className="grid two">
        <div className="panel soft">
          <h3>신청인 / 사고 정보</h3>

          <div className="field">
            <label>신청인 이름</label>
            <input
              type="text"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              placeholder="예: 홍길동"
            />
          </div>

          <div className="field">
            <label>연락처</label>
            <input
              type="tel"
              value={claimantPhone}
              onChange={(e) => setClaimantPhone(e.target.value)}
              placeholder="예: 010-1234-5678"
            />
          </div>

          <div className="field">
            <label>이메일 (선택)</label>
            <input
              type="email"
              value={claimantEmail}
              onChange={(e) => setClaimantEmail(e.target.value)}
              placeholder="예: user@example.com"
            />
          </div>

          <div className="field">
            <label>주소 (선택)</label>
            <input
              type="text"
              value={claimantAddress}
              onChange={(e) => setClaimantAddress(e.target.value)}
              placeholder="청구서 상 표기될 주소"
            />
          </div>

          <div className="field">
            <label>사고/하자 인지일 (선택)</label>
            <input
              type="date"
              value={accidentDate}
              onChange={(e) => setAccidentDate(e.target.value)}
            />
          </div>

          <div className="meta">
            <span>차량번호/VIN: {vin || "—"}</span>
            <span>구매일: {purchaseDate || "—"}</span>
          </div>
        </div>

        <div className="panel soft">
          <h3>생성할 서류 선택</h3>
          <div className="tags">
            {DOC_OPTIONS.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className={
                  selectedDocs.includes(doc.id) ? "tag active" : "tag"
                }
                onClick={() => toggleDoc(doc.id)}
              >
                {doc.label}
              </button>
            ))}
          </div>

          <ul className="bullets compact">
            {DOC_OPTIONS.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.label}:</strong> {doc.hint}
              </li>
            ))}
          </ul>
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
        <button
          className="btn primary"
          type="button"
          onClick={handleGeneratePackage}
          disabled={isGenerating}
        >
          {isGenerating ? "서류 생성 중..." : "서류 패키지 PDF 생성"}
        </button>

        <button
          className="btn outline"
          type="button"
          onClick={() => window.print()}
        >
          <i className="ri-printer-line"></i> 인쇄/저장
        </button>

        <button className="btn" type="button" onClick={handleMailSend}>
          <i className="ri-mail-send-line"></i> 메일 전송 (목업)
        </button>
      </div>
    </section>
  );
}