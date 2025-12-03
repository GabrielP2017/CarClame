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
  { label: "About", href: "/about", disabled: true },
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
  const attachmentsTotal = docCount + photoCount;
  const channelLabel = formData.channel || "구매 채널을 선택해 주세요";
  const ridersLabel = formData.riders
    ? `특약: ${formData.riders}`
    : "선택 특약을 추가하면 검토 범위에 포함됩니다.";
  const stats = [
    {
      label: "구매 경과",
      value: purchaseDate ? `${daysSince}일` : "대기 중",
      meta: purchaseDateLabel || "구매일을 입력해 주세요",
    },
    {
      label: "현재 주행거리",
      value: formData.mileage
        ? `${formData.mileage.toLocaleString()}km`
        : "0km",
      meta:
        formData.purchaseMileage !== null &&
        formData.purchaseMileage !== undefined
          ? `구매 시 ${formData.purchaseMileage.toLocaleString()}km`
          : "구매 시 주행거리 (선택)",
    },
    {
      label: "첨부 상태",
      value:
        attachmentsTotal > 0 ? `${attachmentsTotal}개 첨부` : "아직 없음",
      meta: `OCR ${docCount} · 비전 ${photoCount}`,
    },
    {
      label: "구매 채널",
      value: channelLabel,
      meta: ridersLabel,
    },
  ];
  const readinessLabel = formReady ? "즉시 실행 가능" : "필수 정보 대기";
  const readinessMeta = formReady
    ? "필수 항목이 모두 채워졌습니다."
    : "VIN, 구매일, 주행거리, 채널을 입력해 주세요.";

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
            {navLinks.map((link) =>
              link.disabled ? (
                <button
                  key={link.label}
                  type="button"
                  className="marketing-nav__disabled"
                  disabled
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
        <span className="marketing-center">CarClame</span>
      </header>
      <main className="analysis-main">
          <section className="analysis-hero">
            <div className="analysis-hero__body">
              <p className="eyebrow">Quick Analysis</p>
              <h1>
                VIN 하나로
                <br />
                <span className="hero-title-main">자동 분석</span>을 시작하세요
              </h1>
              <p className="analysis-lead">
                VIN, 구매일, 주행거리, 구매 채널 네 가지를 입력하면 OCR · 비전 ·
                규칙 룰셋을 결합해 리스크와 대응책을 제안합니다.
              </p>
              <ul className="analysis-bullets">
                <li>실시간 VIN 룩업과 구매 이력 검증</li>
                <li>문서 · 차량 사진 자동 분류와 OCR 추출</li>
                <li>결과 요약, 대응 옵션, 일정까지 한 번에</li>
              </ul>
              <div className="analysis-hero__cta">
                <span className="analysis-pill success">약 3분 소요</span>
                <span className="analysis-pill muted">추가 로그인 불필요</span>
              </div>
              <p className="analysis-hero__note">
                입력 데이터는 세션 안에서만 유지되며 결과에서 바로 PDF 패키지를
                저장할 수 있습니다.
              </p>
            </div>
            <aside className="analysis-hero__panel" aria-label="세션 요약">
              <div className="analysis-panel__header">
                <div>
                  <p className="analysis-panel__eyebrow">세션 상태</p>
                  <h3>{readinessLabel}</h3>
                  <p className="analysis-panel__meta">{readinessMeta}</p>
                </div>
                <span
                  className={`analysis-pill ${formReady ? "success" : "warning"}`}
                >
                  {formReady ? "READY" : "DRAFT"}
                </span>
              </div>
              <div className="analysis-stats">
                {stats.map((stat) => (
                  <div key={stat.label} className="analysis-stat">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                    <small>{stat.meta}</small>
                  </div>
                ))}
              </div>
            </aside>
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
      <footer className="footer__bar">© 2025 카클레임 Prototype</footer>
    </>
  );
}

