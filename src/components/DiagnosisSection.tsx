"use client";

import { DiagnosisResult } from "@/types";
import { fmt } from "@/lib/utils";

interface DiagnosisSectionProps {
  result: DiagnosisResult | null;
}

function getCategoryStyle(status: string): string {
  if (status === "정상") return "";
  if (status === "점검요망") return "status-warning";
  if (status === "불량") return "status-error";
  return "";
}

export default function DiagnosisSection({ result }: DiagnosisSectionProps) {
  if (!result) return null;

  const riskFindings = result.photoFindings.filter(
    (finding) =>
      finding.includes("침수") ||
      finding.includes("전손") ||
      finding.includes("부식") ||
      finding.includes("구제금")
  );
  const noteFindings = result.photoFindings.filter(
    (finding) =>
      finding.includes("참고") ||
      finding.includes("기스") ||
      finding.includes("도색")
  );

  return (
    <section className="analysis-section">
      <div className="analysis-section__head">
        <div>
          <p className="eyebrow">2단계</p>
          <h2>자동 분석 결과</h2>
        </div>
        <span className="analysis-section__meta">
          VIN {result.kahistory.vin}
        </span>
      </div>

      {result.flags && result.flags.length > 0 && (
        <div className="analysis-flagline">
          <span>검토 필요</span>
          <div className="flags">
            {result.flags.map((flag, i) => (
              <span key={flag + i} className="flag">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-columns analysis-columns--three">
        <article className="analysis-column analysis-card">
          <p className="analysis-label">카히스토리</p>
          <h3>사고 / 보험 이력</h3>
          <div className="analysis-callout warning">
            베타 버전: 카히스토리 API는 기업 제휴 필요
            <br />
            실시간 API 연동은 추후 계획입니다.
          </div>
          <div className="kv">
            <div className="row">
              <span>VIN</span>
              <strong>{result.kahistory.vin}</strong>
            </div>
            <div className="row">
              <span>전손</span>
              <strong>{result.kahistory.writtenOff ? "의심" : "없음"}</strong>
            </div>
            <div className="row">
              <span>도난</span>
              <strong>{result.kahistory.theft ? "의심" : "없음"}</strong>
            </div>
            {result.kahistory.accidents.map((accident, i) => (
              <div key={accident.date + i} className="row">
                <span>사고 {i + 1}</span>
                <strong>
                  {accident.type} / {accident.date} / 보험금
                  {fmt(accident.payout)}원
                </strong>
              </div>
            ))}
          </div>
          <p className="analysis-hint">
            보험 처리 기반 사고 기록이며, 실제 사고 규모나 과실 비율은 포함되지
            않았습니다.
          </p>
        </article>

        <article className="analysis-column analysis-card">
          <p className="analysis-label">성능점검 OCR</p>
          <h3>카테고리 판정</h3>
          {result.ocr.confidence === "none" ? (
            <div className="analysis-callout danger">
              성능점검기록부 이미지가 필요합니다. 명확한 촬영본을 업로드해 주세요.
            </div>
          ) : result.ocr.confidence === "retry" ? (
            <div className="analysis-callout danger">
              이미지 인식에 실패했습니다. 원본이 선명한 이미지를 다시 업로드해
              주세요.
            </div>
          ) : (
            <>
              {result.ocr.confidence === "low" && (
                <div className="analysis-callout warning">
                  OCR 신뢰도가 낮습니다. 아래 결과를 직접 확인해 주세요.
                </div>
              )}
              <div className="kv">
                <div className="row">
                  <span>사고 이력 표기</span>
                  <strong
                    style={{
                      color: result.ocr.noAccidentMarked
                        ? "#16a34a"
                        : "#dc2626",
                    }}
                  >
                    {result.ocr.noAccidentMarked ? "무사고 표기" : "사고 표기"}
                  </strong>
                </div>
                <div className="row">
                  <span>엔진 상태</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.engine)}
                  >
                    {result.ocr.categories.engine}
                  </strong>
                </div>
                <div className="row">
                  <span>변속기 상태</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.mission)}
                  >
                    {result.ocr.categories.mission}
                  </strong>
                </div>
                <div className="row">
                  <span>조향 장치</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.steering)}
                  >
                    {result.ocr.categories.steering}
                  </strong>
                </div>
                <div className="row">
                  <span>제동 장치</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.brake)}
                  >
                    {result.ocr.categories.brake}
                  </strong>
                </div>
                <div className="row">
                  <span>전기 장치</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.electric)}
                  >
                    {result.ocr.categories.electric}
                  </strong>
                </div>
              </div>
            </>
          )}
          <p className="analysis-hint">
            성능점검기록부에서 추출된 항목이며, 이미지 품질에 따라 편차가 있을
            수 있습니다.
          </p>
        </article>

        <article className="analysis-column analysis-card">
          <p className="analysis-label">비전 AI</p>
          <div>
            <span className="analysis-chip danger">위험 · 보상 대상</span>
            <ul className="bullets">
              {riskFindings.length > 0 ? (
                riskFindings.map((finding, i) => (
                  <li key={finding + i}>
                    {finding.replace("[구제금]", "").trim()}
                  </li>
                ))
              ) : (
                <li>해당 없음</li>
              )}
            </ul>
          </div>
          <div>
            <span className="analysis-chip muted">참고 기록</span>
            <ul className="bullets">
              {noteFindings.length > 0 ? (
                noteFindings.map((finding, i) => (
                  <li key={finding + i}>
                    {finding.replace("[참고]", "").trim()}
                  </li>
                ))
              ) : (
                <li>표시할 참고 항목 없음</li>
              )}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}
