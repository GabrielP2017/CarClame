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
  { label: "About", href: "/about" },
];

export default function SavedPdfPage() {
  const [records, setRecords] = useState<SavedPdfRecord[]>([]);

  useEffect(() => {
    setRecords(readSavedPdfs());
  }, []);

  const hasRecords = records.length > 0;
  const totalDocs = records.reduce((acc, cur) => acc + (cur.docs?.length ?? 0), 0);

  const handleDownload = useCallback((record: SavedPdfRecord) => {
    const link = document.createElement("a");
    link.href = record.dataUrl;
    link.download = record.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const next = records.filter((item) => item.id !== id);
      setRecords(next);
      writeSavedPdfs(next);
    },
    [records]
  );

  const handleClearAll = useCallback(() => {
    setRecords([]);
    clearSavedPdfs();
  }, []);

  const subtitle = useMemo(() => {
    if (!hasRecords) {
      return "자동분석 페이지에서 PDF를 한번 저장하면 이곳에 자동으로 기록됩니다.";
    }
    return `${records.length}개의 PDF가 로컬에 저장되어 있습니다.`;
  }, [hasRecords, records.length]);

  const stats = [
    { label: "아카이브 PDF", value: `${records.length}개` },
    { label: "포함 문서 수", value: `${totalDocs}건` },
  ];

  return (
    <div className="saved-pdf-shell">
      <header className="marketing-header">
        <div className="marketing-left">
          <Link href="/" className="marketing-logo" aria-label="CarClame 홈으로">
            <Image src={titleIcon} alt="CarClame" width={36} height={36} />
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

      <main className="saved-pdf-main">
        <section className="saved-pdf-hero">
          <div>
            <p className="eyebrow">PDF Archive</p>
            <h1>자동분석에서 저장한 PDF 관리</h1>
            <p>{subtitle}</p>
            <div className="saved-pdf-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="saved-pdf-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="saved-pdf-hero__actions">
            <Link href="/analysis" className="btn primary">
              자동분석으로 이동
            </Link>
            <button
              type="button"
              className="btn outline"
              onClick={handleClearAll}
              disabled={!hasRecords}
            >
              전체 삭제
            </button>
          </div>
        </section>

        {hasRecords ? (
          <ul className="saved-pdf-list">
            {records.map((record) => (
              <li key={record.id} className="saved-pdf-card">
                <header>
                  <div>
                    <p className="eyebrow">VIN {record.vin || "미입력"}</p>
                    <h2>{record.filename}</h2>
                  </div>
                  <span>
                    저장일{" "}
                    {new Date(record.createdAt).toLocaleString("ko-KR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </header>
                <dl>
                  <div>
                    <dt>구매일</dt>
                    <dd>{record.purchaseDate || "미입력"}</dd>
                  </div>
                  <div>
                    <dt>청구인</dt>
                    <dd>{record.claimantName || "미입력"}</dd>
                  </div>
                  <div>
                    <dt>문서 묶음</dt>
                    <dd>{record.docs?.length ?? 0}개</dd>
                  </div>
                </dl>
                {record.docs?.length ? (
                  <div className="saved-pdf-tags">
                    {record.docs.map((doc) => (
                      <span key={doc}>{doc}</span>
                    ))}
                  </div>
                ) : null}
                <div className="saved-pdf-actions">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => handleDownload(record)}
                  >
                    다시 다운로드
                  </button>
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => handleDelete(record.id)}
                  >
                    기록 삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="saved-pdf-empty stub-card">
            <p className="eyebrow">PDF 기록 없음</p>
            <h2>아직 저장된 문서가 없습니다.</h2>
            <p>자동분석 페이지에서 PDF를 만들면 이곳에 자동으로 보관됩니다.</p>
            <Link href="/analysis" className="btn primary">
              자동분석 시작하기
            </Link>
          </div>
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
