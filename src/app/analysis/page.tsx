"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import IntakeForm from "@/components/IntakeForm";
import DiagnosisSection from "@/components/DiagnosisSection";
import OptionsSection from "@/components/OptionsSection";
import PackagerSection from "@/components/PackagerSection";
import DeadlinesSection from "@/components/DeadlinesSection";
import { FormData, DiagnosisResult } from "@/types";
import { daysBetween } from "@/lib/utils";
import { mapApiToDiagnosis } from "@/lib/mapApiToDiagnosis";
import Swal from "sweetalert2";
import titleIcon from "@/img/TitleIcon.png";

const navLinks = [
  { label: "Quick Analysis", href: "/analysis" },
  { label: "PDF Archive", href: "/saved-pdf" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/about" },
];

export default function AnalysisPage() {
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
        text: "필수 입력칸을 모두 채워주세요.",
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
      // 차량 이미지 base64 변환
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

      // 문서 이미지 base64 변환
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
        text: "자동 분석에 문제가 발생했습니다.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseDate = formData.purchaseDate
    ? new Date(formData.purchaseDate)
    : null;
  const purchaseDateLabel = purchaseDate
    ? purchaseDate.toLocaleDateString("ko-KR")
    : null;
  const today = new Date();
  const daysSince = purchaseDate ? daysBetween(purchaseDate, today) : 0;
  const formReady = useMemo(
    () =>
      Boolean(
        formData.vin &&
          formData.purchaseDate &&
          formData.mileage &&
          formData.channel
      ),
    [formData]
  );
  const docCount = formData.docImages?.length ?? 0;
  const photoCount = formData.inspectPhotos?.length ?? 0;

  return (
    <>
      <header className="marketing-header">
        <div className="marketing-left">
          <Link
            href="/"
            className="marketing-logo"
            aria-label="CarClame 메인으로 이동"
          >
            <Image
              src={titleIcon}
              alt="CarClame"
              width={36}
              height={36}
              priority
            />
          </Link>
          <nav className="marketing-nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="marketing-center">CarClame</span>
      </header>
      <div className="analysis-shell">
        <main className="analysis-main">
          <section className="analysis-hero">
          <div className="analysis-hero__copy">
            <p className="eyebrow">자동 분석</p>
            <h1>
              한 번 입력하면
              <br />
              <span className="hero-title-main">팩트 체크</span> 워크플로우가
              완성됩니다
            </h1>
            <p className="analysis-lead">
              메인 페이지에서 쓰던 타이포 리듬을 그대로 옮겨와 간격과 경계선만으로
              단계가 구분되도록 구성했습니다. 박스 없이도 AI 자동화 단계가
              자연스럽게 이어집니다.
            </p>
            <p className="analysis-hero__note">
              VIN, 구매일, 현재 주행거리, 구매 채널 네 가지만 입력하면 자동 분석이
              시작되고 나머지 필드는 선택으로 둘 수 있습니다.
            </p>
          </div>
          <div className="analysis-hero__metrics">
            <div className="analysis-metric">
              <span>구매 후 경과일</span>
              <strong>
                {purchaseDate ? `${daysSince}일` : "구매일을 입력해 주세요"}
              </strong>
              <small>{purchaseDateLabel || "구매일 입력 대기"}</small>
            </div>
            <div className="analysis-metric">
              <span>현재 주행거리</span>
              <strong>
                {formData.mileage
                  ? `${formData.mileage.toLocaleString()}km`
                  : "0km"}
              </strong>
              <small>
                {formData.purchaseMileage
                  ? `구매 시점 ${formData.purchaseMileage.toLocaleString()}km`
                  : "구매 시 주행거리(선택)"}
              </small>
            </div>
            <div className="analysis-metric">
              <span>첨부 현황</span>
              <strong>
                {docCount > 0 || photoCount > 0
                  ? `${docCount + photoCount}건 업로드`
                  : "첨부 없음"}
              </strong>
              <small>
                OCR {docCount}건 / 비전 {photoCount}건
              </small>
            </div>
            <div className="analysis-metric">
              <span>팩트 체크 준비도</span>
              <strong>{formReady ? "준비 완료" : "필수 항목 미입력"}</strong>
              <small>
                {formReady
                  ? "모든 필수 입력 완료"
                  : "VIN / 구매일 / 주행거리 / 채널 입력 필요"}
              </small>
            </div>
          </div>
        </section>
          <IntakeForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={runFactCheck}
            isLoading={isLoading}
          />
          {isLoading && (
            <section className="analysis-section analysis-loading">
              <div className="analysis-loading__spinner" aria-hidden="true" />
              <div>
                <p className="eyebrow">AI 팩트 체크</p>
                <h2>여러 엔진을 동시에 돌리는 중입니다</h2>
                <p className="analysis-lead">
                  OCR, 비전, 정책 룰셋을 병렬로 호출하고 있습니다. 파일 용량에 따라
                  잠시 시간이 걸릴 수 있지만 페이지를 그대로 두면 결과가 아래에
                  실시간으로 나타납니다.
                </p>
              </div>
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
      </div>
      <footer className="footer__bar">© 2025 카클레임 Prototype</footer>
    </>
  );
}
