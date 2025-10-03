"use client";

import { useState } from "react";
import Header from "@/components/Header";
import IntakeForm from "@/components/IntakeForm";
import DiagnosisSection from "@/components/DiagnosisSection";
import OptionsSection from "@/components/OptionsSection";
import PackagerSection from "@/components/PackagerSection";
import DeadlinesSection from "@/components/DeadlinesSection";
import { FormData, DiagnosisResult } from "@/types";
import { MOCK_KAHISTORY, MOCK_OCR } from "@/lib/mockData";
import { daysBetween } from "@/lib/utils";
import { mapApiToDiagnosis } from "@/lib/mapApiToDiagnosis";
import Swal from "sweetalert2";

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    vin: "",
    purchaseDate: "",
    mileage: 0,
    channel: "",
  });

  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showPackager, setShowPackager] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [apiResponse, setApiResponse] = useState<any>(null);

  const runFactCheck = async () => {
    if (
      !formData.vin ||
      !formData.purchaseDate ||
      !formData.mileage ||
      !formData.channel
    ) {
      await Swal.fire({
        icon: "warning",
        text: "필수 입력을 모두 채워주세요.",
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    setShowOptions(false);
    setShowPackager(false);
    setShowDeadlines(false);
    setApiResponse(null);

    try {
      const res = await fetch("/api/match-remedy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: formData.vin,
          purchaseDate: formData.purchaseDate,
          currentMileage: Number(formData.mileage),
          purchaseChannel: formData.channel,
        }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      setApiResponse(data);
      setDiagnosisResult(mapApiToDiagnosis(data, formData));

      setShowOptions(true);
      setShowPackager(true);
      setShowDeadlines(true);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "오류 발생",
        text: "팩트체크 실행 중 문제가 발생했습니다.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseDate = formData.purchaseDate
    ? new Date(formData.purchaseDate)
    : null;
  const today = new Date();
  const daysSince = purchaseDate ? daysBetween(purchaseDate, today) : 0;

  const options = showOptions
    ? {
        warranty: daysSince <= 30 || formData.mileage <= 2000,
        refund: diagnosisResult?.kahistory.accidents.length
          ? "이력 근거로 검토"
          : "사진·이력 기반 의심 시 검토",
        personal:
          (formData.riders || "").toLowerCase().includes("자차") ||
          (formData.riders || "").toLowerCase().includes("자가"),
      }
    : null;

  return (
    <>
      <Header />
      <main className="page">
        <IntakeForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={runFactCheck}
          isLoading={isLoading}
        />
        {diagnosisResult && <DiagnosisSection result={diagnosisResult} />}
        {showOptions && apiResponse && (
          <OptionsSection
            options={options}
            channel={formData.channel}
            daysSince={daysSince}
            mileage={formData.mileage}
            apiResponse={apiResponse}
          />
        )}
        {showPackager && (
          <PackagerSection
            visible={showPackager}
            vin={formData.vin}
            purchaseDate={formData.purchaseDate}
          />
        )}
        {showDeadlines && apiResponse && (
          <DeadlinesSection
            visible={showDeadlines}
            purchaseDate={formData.purchaseDate}
            mileage={formData.mileage}
            apiResponse={apiResponse}
          />
        )}
      </main>
      <footer className="footer__bar">© 2025 카클레임 Prototype</footer>
    </>
  );
}
