"use client";

import { useState } from "react";
import Header from "@/components/Header";
import IntakeForm from "@/components/IntakeForm";
import DiagnosisSection from "@/components/DiagnosisSection";
import OptionsSection from "@/components/OptionsSection";
import PackagerSection from "@/components/PackagerSection";
import DeadlinesSection from "@/components/DeadlinesSection";
import { FormData, DiagnosisResult } from "@/types";
import { daysBetween } from "@/lib/utils";
import { mapApiToDiagnosis } from "@/lib/mapApiToDiagnosis";
import Swal from "sweetalert2";

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    vin: "",
    purchaseDate: "",
    mileage: 0,
    purchaseMileage: null,
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
      // 점검 사진을 base64로 변환 (침수/녹 분석용)
      const imagePromises: Promise<string>[] = [];
      if (formData.inspectPhotos) {
        Array.from(formData.inspectPhotos).forEach((file) => {
          imagePromises.push(
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            })
          );
        });
      }
      const carImages = await Promise.all(imagePromises);

      // 문서 이미지를 base64로 변환 (OCR 분석용)
      const docImagePromises: Promise<string>[] = [];
      if (formData.docImages) {
        Array.from(formData.docImages).forEach((file) => {
          docImagePromises.push(
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            })
          );
        });
      }
      const docImages = await Promise.all(docImagePromises);

      const res = await fetch("/api/match-remedy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: formData.vin,
          purchaseDate: formData.purchaseDate,
          currentMileage: Number(formData.mileage),
          purchaseMileage: formData.purchaseMileage || null,
          purchaseChannel: formData.channel,
          riders: formData.riders || undefined,
          carImages: carImages.length > 0 ? carImages : undefined,
          docImages: docImages.length > 0 ? docImages : undefined,
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
        text: "자동 분석 중 문제가 발생했습니다.",
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
        {isLoading && (
          <section
            className="card"
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <div className="loading-spinner"></div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginTop: "20px",
                color: "#0074c3",
              }}
            >
              AI 자동 분석 중...
            </h2>
            <p style={{ fontSize: "15px", color: "#737373", marginTop: "8px" }}>
              차량 정보를 분석하고 있습니다. 잠시만 기다려주세요.
            </p>
          </section>
        )}
        {diagnosisResult && <DiagnosisSection result={diagnosisResult} />}
        {showOptions && apiResponse && (
          <OptionsSection apiResponse={apiResponse} />
        )}
        {showPackager && (
          <PackagerSection
            visible={showPackager}
            vin={formData.vin}
            purchaseDate={formData.purchaseDate}
            apiResponse={apiResponse}
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
