"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SavedPdfRecord,
  clearSavedPdfs,
  readSavedPdfs,
  writeSavedPdfs,
} from "@/lib/pdfStorage";
import titleIcon from "@/img/TitleIcon.png";

const navLinks = [
  { label: "Quick Analysis", href: "/analysis" },
  { label: "PDF Archive", href: "/saved-pdf" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/about", disabled: true },
];

const docLabels: Record<string, string> = {
  common_insurance_claim: "보험 청구서",
  dealer_refund: "딜러 환불 요청서",
  consent: "개인정보 동의서",
  power_of_attorney: "위임장",
};

const getDocLabel = (key: string) => docLabels[key] ?? key;

export default function SavedPdfPage() {
  const [records, setRecords] = useState<SavedPdfRecord[]>([]);

  useEffect(() => {
    setRecords(readSavedPdfs());
  }, []);

  const hasRecords = records.length > 0;

  const totalDocs = useMemo(
    () => records.reduce((acc, cur) => acc + (cur.docs?.length ?? 0), 0),
    [records]
  );

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [records]
  );

  const latestRecord = sortedRecords[0];

  const averageDocsValue = hasRecords ? totalDocs / records.length : 0;
  const averageDocsLabel = hasRecords
    ? Number.isInteger(averageDocsValue)
      ? averageDocsValue.toString()
      : averageDocsValue.toFixed(1)
    : "0";

  const docCounts = useMemo(
    () => records.map((record) => record.docs?.length ?? 0),
    [records]
  );
  const maxDocs = docCounts.length ? Math.max(...docCounts) : 0;
  const minDocs = docCounts.length ? Math.min(...docCounts) : 0;

  const docFrequency = useMemo(() => {
    const frequency = new Map<string, number>();
    records.forEach((record) => {
      record.docs?.forEach((doc) => {
        frequency.set(doc, (frequency.get(doc) ?? 0) + 1);
      });
    });
    return Array.from(frequency.entries()).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const docSpectrumLabel = docFrequency.length
    ? docFrequency
        .slice(0, 2)
        .map(([name]) => getDocLabel(name))
        .join(" · ")
    : "첨부 히스토리 없음";

  const docSpectrumMeta = docFrequency.length
    ? docFrequency
        .slice(0, 3)
        .map(([name, count]) => `${getDocLabel(name)} ${count}회`)
        .join(" · ")
    : undefined;

  const lastSavedLabel = latestRecord
    ? new Date(latestRecord.createdAt).toLocaleString("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "기록 없음";

  const subtitle = hasRecords
    ? `로컬 브라우저에 ${records.length}개의 PDF가 보관 중입니다.`
    : "자동 분석 페이지에서 PDF를 저장하면 히스토리가 이곳에 누적됩니다.";

  const heroStats = [
    { label: "저장된 패키지", value: `${records.length}건` },
    { label: "누적 문서", value: `${totalDocs}개` },
    { label: "평균 첨부", value: `${averageDocsLabel}건` },
  ];

  const insightCards = [
    {
      eyebrow: "문서 깊이",
      title: hasRecords ? `${averageDocsLabel}건` : "데이터 없음",
      body: hasRecords
        ? `PDF 한 건당 평균 ${averageDocsLabel}개의 첨부 서류가 묶여 있습니다.`
        : "자동 분석에서 PDF를 저장하면 첨부 데이터가 여기에 노출됩니다.",
      meta: hasRecords ? `최대 ${maxDocs}건 · 최소 ${minDocs}건` : undefined,
    },
    {
      eyebrow: "저장 시점",
      title: lastSavedLabel,
      body: latestRecord
        ? `${latestRecord.filename} · VIN ${latestRecord.vin || "미입력"}`
        : "최신 저장 기록이 아직 없습니다. 자동 분석을 실행해 주세요.",
      meta: latestRecord?.claimantName ? `${latestRecord.claimantName} 고객` : undefined,
    },
    {
      eyebrow: "주요 첨부",
      title: docFrequency.length ? docSpectrumLabel : "첨부 없음",
      body: docFrequency.length
        ? `${getDocLabel(docFrequency[0][0])} 문서가 가장 자주 포함되었습니다.`
        : "서류를 첨부해 PDF를 저장하면 유형을 분석해 드립니다.",
      meta: docSpectrumMeta,
    },
  ];

  const recentActivity = sortedRecords.slice(0, 4);

  const formatTimestamp = (value: string) =>
    new Date(value).toLocaleString("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const formatDateOnly = (value?: string) => {
    if (!value) return "미입력";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString("ko-KR");
  };

  const handleDownload = useCallback((record: SavedPdfRecord) => {
    const link = document.createElement("a");
    link.href = record.dataUrl;
    link.download = record.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const handleDelete = useCallback((id: string) => {
    setRecords((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeSavedPdfs(next);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setRecords([]);
    clearSavedPdfs();
  }, []);

  return (
    <div className="saved-pdf-shell">
      <header className="marketing-header">
        <div className="marketing-left">
          <Link href="/" className="marketing-logo" aria-label="CarClame 홈">
            <Image src={titleIcon} alt="CarClame" width={36} height={36} />
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

      <main className="saved-pdf-main">
        <section className="saved-pdf-hero saved-pdf-section">
          <div className="saved-pdf-hero__intro">
            <p className="eyebrow">PDF Archive</p>
            <h1>자동 분석 PDF 아카이브</h1>
            <p>{subtitle}</p>
          </div>

          <div className="saved-pdf-stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="saved-pdf-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="saved-pdf-hero__meta">
            <dl>
              <div>
                <dt>최근 저장</dt>
                <dd>{lastSavedLabel}</dd>
              </div>
              <div>
                <dt>최근 VIN</dt>
                <dd>{latestRecord?.vin || "미입력"}</dd>
              </div>
            </dl>
            <div className="saved-pdf-hero__actions">
              <Link href="/analysis" className="btn primary">
                자동 분석 이동
              </Link>
              <button
                type="button"
                className="btn ghost"
                onClick={handleClearAll}
                disabled={!hasRecords}
              >
                전체 비우기
              </button>
            </div>
          </div>
        </section>

        <section className="saved-pdf-insights saved-pdf-section">
          <div className="saved-pdf-insights__grid">
            <p className="eyebrow">Archive Signals</p>
            <div className="saved-pdf-insight-list">
              {insightCards.map((card) => (
                <article key={card.eyebrow} className="saved-pdf-insight">
                  <p className="eyebrow muted">{card.eyebrow}</p>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  {card.meta ? <span>{card.meta}</span> : null}
                </article>
              ))}
            </div>
          </div>
          <div className="saved-pdf-timeline-block">
            <div className="saved-pdf-timeline__head">
              <p className="eyebrow">최근 저장 기록</p>
              {recentActivity.length ? (
                <span>최신 {recentActivity.length}건</span>
              ) : null}
            </div>
            {recentActivity.length ? (
              <ul className="saved-pdf-timeline">
                {recentActivity.map((record) => (
                  <li key={`${record.id}-activity`}>
                    <div>
                      <strong>{record.filename}</strong>
                      <span>VIN {record.vin || "미입력"}</span>
                    </div>
                    <div>
                      <span>{record.docs?.length ?? 0}건 서류</span>
                      <time dateTime={record.createdAt}>
                        {formatTimestamp(record.createdAt)}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="saved-pdf-timeline__empty">
                <h4>아직 저장된 PDF가 없습니다.</h4>
                <p>자동 분석을 실행해 첫 PDF를 보관해 보세요.</p>
                <Link href="/analysis" className="btn outline">
                  분석 시작
                </Link>
              </div>
            )}
          </div>
        </section>

        {hasRecords ? (
          <section className="saved-pdf-collection saved-pdf-section">
            <div className="saved-pdf-collection__head">
              <div>
                <p className="eyebrow">PDF Packages</p>
                <h2>히스토리 {records.length}건</h2>
              </div>
              <span>평균 첨부 {averageDocsLabel}건 · 총 {totalDocs}개 서류</span>
            </div>
            <ul className="saved-pdf-table">
              {records.map((record) => {
                const docCount = record.docs?.length ?? 0;
                return (
                  <li key={record.id} className="saved-pdf-row">
                    <div className="saved-pdf-row__primary">
                      <div>
                        <p className="eyebrow">VIN {record.vin || "미입력"}</p>
                        <h3>{record.filename}</h3>
                      </div>
                      <div className="saved-pdf-row__meta">
                        <div>
                          <span>저장 일시</span>
                          <strong>{formatTimestamp(record.createdAt)}</strong>
                        </div>
                        <div>
                          <span>첨부</span>
                          <strong>{docCount}건</strong>
                        </div>
                      </div>
                    </div>
                    <dl className="saved-pdf-row__details">
                      <div>
                        <dt>구매일</dt>
                        <dd>{formatDateOnly(record.purchaseDate)}</dd>
                      </div>
                      <div>
                        <dt>청구인</dt>
                        <dd>{record.claimantName || "미입력"}</dd>
                      </div>
                      <div>
                        <dt>첨부 묶음</dt>
                        <dd>{docCount ? `${docCount}건` : "없음"}</dd>
                      </div>
                    </dl>
                    {docCount ? (
                      <div className="saved-pdf-row__docs">
                        {record.docs?.map((doc, index) => (
                          <span key={`${record.id}-${doc}-${index}`}>
                            {getDocLabel(doc)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="saved-pdf-row__actions">
                      <button
                        type="button"
                        className="btn primary"
                        onClick={() => handleDownload(record)}
                      >
                        즉시 다운로드
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => handleDelete(record.id)}
                      >
                        기록 삭제
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section className="saved-pdf-empty saved-pdf-section">
            <p className="eyebrow">PDF 기록 없음</p>
            <h2>아직 저장된 문서가 없습니다.</h2>
            <p>자동 분석 페이지에서 PDF를 만들면 이곳에서 모든 기록을 관리할 수 있습니다.</p>
            <Link href="/analysis" className="btn primary">
              자동 분석 시작
            </Link>
          </section>
        )}
      </main>

      <footer className="marketing-footer">
        <p>© {new Date().getFullYear()} CarClame Labs</p>
        <div>
          <Link href="/analysis">Quick Analysis</Link>
          <Link href="/saved-pdf">PDF Archive</Link>
          <Link href="/help">Help</Link>
        </div>
      </footer>
    </div>
  );
}
