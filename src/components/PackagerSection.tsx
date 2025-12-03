"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { readSavedPdfs, writeSavedPdfs } from "@/lib/pdfStorage";

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

const DOC_OPTIONS: { id: DocType; label: string; hint: string }[] = [
  {
    id: "common_insurance_claim",
    label: "자동차 보험 공통 청구서",
    hint: "손해배상/성능 보증 공통 서식",
  },
  {
    id: "dealer_refund",
    label: "딜러/플랫폼 환불 청구서",
    hint: "K Car / 엔카 / 기타 플랫폼 환불 요청",
  },
  {
    id: "consent",
    label: "개인정보 수집·이용 동의서",
    hint: "보험/판매처에 공통 제출",
  },
  {
    id: "power_of_attorney",
    label: "위임장",
    hint: "대리 진행 시 필수 (구청 발급 가능)",
  },
];

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert PDF blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const persistPdfRecord = async (params: {
  blob: Blob;
  filename: string;
  vin: string;
  purchaseDate: string;
  claimantName: string;
  docs: string[];
}) => {
  if (typeof window === "undefined") return;
  try {
    const dataUrl = await blobToDataUrl(params.blob);
    const record = {
      id: window.crypto?.randomUUID?.() ?? String(Date.now()),
      filename: params.filename,
      vin: params.vin,
      purchaseDate: params.purchaseDate,
      claimantName: params.claimantName,
      docs: params.docs,
      createdAt: new Date().toISOString(),
      dataUrl,
    };
    const existing = readSavedPdfs();
    writeSavedPdfs([record, ...existing]);
  } catch (error) {
    console.warn("Failed to store PDF locally", error);
  }
};

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
      Swal.fire(
        "입력 필요",
        "청구인 이름과 연락처를 입력해 주세요.",
        "warning"
      );
      return;
    }
    if (!purchaseDate) {
      Swal.fire("입력 필요", "구매일 정보가 필요합니다.", "warning");
      return;
    }
    if (!vin) {
      Swal.fire("입력 필요", "차량번호/VIN 정보가 필요합니다.", "warning");
      return;
    }
    if (selectedDocs.length === 0) {
      Swal.fire(
        "선택 필요",
        "생성할 서류를 최소 1종 이상 선택해 주세요.",
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
          data?.message || `서류 패키지 생성 실패 (status ${res.status})`;
        Swal.fire("실패", msg, "error");
        return;
      }

      const blob = await res.blob();
      const filename = `서류패키지_${vin}_${purchaseDate}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      await persistPdfRecord({
        blob,
        filename,
        vin,
        purchaseDate,
        claimantName,
        docs: selectedDocs,
      });

      Swal.fire("완료", "서류 패키지 PDF가 생성되었습니다.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire(
        "에러",
        "서류 패키지 생성 도중 예상치 못한 오류가 발생했습니다.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMailSend = () => {
    Swal.fire(
      "메일 전송 (목업)",
      "현재는 이메일 발송을 시뮬레이션합니다.",
      "info"
    );
  };

  const checklist = [
    "신분증 사본",
    "매매계약서 / 거래 내역",
    "자동차등록증 사본",
    "정비 명세서 / 수리 견적서",
    "사고·결함 증빙 사진",
  ];

  return (
    <section className="analysis-section analysis-packager">
      <div className="analysis-section__head">
        <div>
          <p className="eyebrow">4단계</p>
          <h2>서류 패키지 자동 생성</h2>
        </div>
        <span className="analysis-section__meta">
          VIN {vin || "미입력"} / 구매일 {purchaseDate || "미입력"}
        </span>
      </div>
      <p className="analysis-lead">
        진단 결과를 바탕으로 보험·환불 청구에 필요한 문서 묶음을 자동으로
        생성합니다.
      </p>

      <div className="analysis-columns analysis-columns--two">
        <article className="analysis-column">
          <p className="analysis-label">청구인 정보</p>
          <div className="analysis-form__stack">
            <div className="field">
              <label>청구인 이름*</label>
              <input
                type="text"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="예 홍길동"
              />
            </div>
            <div className="field">
              <label>연락처*</label>
              <input
                type="tel"
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                placeholder="예 010-1234-5678"
              />
            </div>
            <div className="grid2">
              <div className="field">
                <label>이메일 (선택)</label>
                <input
                  type="email"
                  value={claimantEmail}
                  onChange={(e) => setClaimantEmail(e.target.value)}
                  placeholder="예 user@example.com"
                />
              </div>
              <div className="field">
                <label>주소 (선택)</label>
                <input
                  type="text"
                  value={claimantAddress}
                  onChange={(e) => setClaimantAddress(e.target.value)}
                  placeholder="거주지 또는 사업장 주소"
                />
              </div>
            </div>
            <div className="field">
              <label>사고/결함 발생일 (선택)</label>
              <input
                type="date"
                value={accidentDate}
                onChange={(e) => setAccidentDate(e.target.value)}
              />
            </div>
            <div className="analysis-metadata">
              <span>VIN: {vin || "미입력"}</span>
              <span>구매일: {purchaseDate || "미입력"}</span>
            </div>
          </div>
        </article>

        <article className="analysis-column">
          <p className="analysis-label">생성할 서류</p>
          <div className="analysis-tags">
            {DOC_OPTIONS.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className={
                  selectedDocs.includes(doc.id)
                    ? "analysis-tag active"
                    : "analysis-tag"
                }
                onClick={() => toggleDoc(doc.id)}
              >
                {doc.label}
              </button>
            ))}
          </div>
          <ul className="analysis-checklist">
            {DOC_OPTIONS.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.label}</strong>
                <span>{doc.hint}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="analysis-subsection">
        <p className="analysis-label">공통 체크리스트</p>
        <ul className="analysis-checklist compact">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="analysis-form__actions">
        <button
          className="btn primary"
          type="button"
          onClick={handleGeneratePackage}
          disabled={isGenerating}
        >
          {isGenerating ? " 서류 생성 중…" : " 서류 패키지 PDF 생성"}
        </button>
        <button
          className="btn outline"
          type="button"
          onClick={() => window.print()}
        >
          인쇄 / 저장
        </button>
        <button className="btn" type="button" onClick={handleMailSend}>
          메일 전송 (목업)
        </button>
      </div>
    </section>
  );
}
