"use client";

import { DiagnosisResult } from "@/types";
import { fmt } from "@/lib/utils";

interface DiagnosisSectionProps {
  result: DiagnosisResult | null;
}

function getCategoryStyle(status: string): string {
  if (status === "정상") return "";
  if (status === "점검요") return "status-warning";
  if (status === "불량") return "status-error";
  return "";
}

export default function DiagnosisSection({ result }: DiagnosisSectionProps) {
  if (!result) return null;

  return (
    <section className="card">
      <h2>팩트체크 결과</h2>
      <div className="grid3">
        <div className="kahi panel">
          <h3>카히스토리(참고용)</h3>
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "12px",
              fontSize: "13px",
              color: "#92400e",
            }}
          >
            ⓘ 데모 버전: 카히스토리 API는 기업 제휴 필요
            <br />
            실제 서비스에서는 VIN 기반 자동 조회 제공 예정
          </div>
          <div className="kv">
            <div className="row">
              <span>VIN</span>
              <strong>{result.kahistory.vin}</strong>
            </div>
            <div className="row">
              <span>전손</span>
              <strong>{result.kahistory.writtenOff ? "있음" : "없음"}</strong>
            </div>
            <div className="row">
              <span>도난</span>
              <strong>{result.kahistory.theft ? "있음" : "없음"}</strong>
            </div>
            {result.kahistory.accidents.map((a, i) => (
              <div key={i} className="row">
                <span>사고 {i + 1}</span>
                <strong>
                  {a.type} / {a.date} / 보험금 {fmt(a.payout)}원
                </strong>
              </div>
            ))}
          </div>
          <p
            className="hint"
            style={{ fontSize: "12px", color: "#737373", marginTop: "8px" }}
          >
            ※ 보험 처리 건 중심이며 사고 규모/과실 비율은 한계가 있습니다.
          </p>
        </div>

        <div className="ocr panel">
          <h3>성능기록부 분석</h3>

          {result.ocr.confidence === "retry" ? (
            <div
              style={{
                background: "#fef2f2",
                border: "2px solid #dc2626",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                fontSize: "14px",
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              ⚠️ 이미지 인식 실패
              <br />
              성능점검기록부 사진을 더 선명하게 다시 촬영하여 업로드하세요
            </div>
          ) : (
            <>
              {result.ocr.confidence === "low" && (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fcd34d",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "12px",
                    fontSize: "13px",
                    color: "#d97706",
                  }}
                >
                  ⚠️ 인식 정확도 낮음: 아래 결과를 직접 확인하세요
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
                      fontWeight: "700",
                    }}
                  >
                    {result.ocr.noAccidentMarked ? "✓ 무사고" : "⚠ 사고 표기"}
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
                  <span>조향장치</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.steering)}
                  >
                    {result.ocr.categories.steering}
                  </strong>
                </div>
                <div className="row">
                  <span>제동장치</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.brake)}
                  >
                    {result.ocr.categories.brake}
                  </strong>
                </div>
                <div className="row">
                  <span>전기장치</span>
                  <strong
                    className={getCategoryStyle(result.ocr.categories.electric)}
                  >
                    {result.ocr.categories.electric}
                  </strong>
                </div>
              </div>
            </>
          )}

          <p
            className="hint"
            style={{ fontSize: "12px", color: "#737373", marginTop: "8px" }}
          >
            ※ AI가 기록부 이미지에서 추출한 정보입니다.
          </p>
        </div>

        <div className="photo panel">
          <h3>사진 분석 결과</h3>

          <div style={{ marginBottom: "12px" }}>
            <h4
              style={{
                fontSize: "14px",
                margin: "8px 0 4px 0",
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              🚨 구제 대상 하자
            </h4>
            <ul className="bullets" style={{ marginTop: "4px" }}>
              {result.photoFindings.filter(
                (f) =>
                  f.includes("침수") ||
                  f.includes("녹") ||
                  f.includes("부식") ||
                  f.includes("구제대상")
              ).length > 0 ? (
                result.photoFindings
                  .filter(
                    (f) =>
                      f.includes("침수") ||
                      f.includes("녹") ||
                      f.includes("부식") ||
                      f.includes("구제대상")
                  )
                  .map((finding, i) => (
                    <li key={i}>{finding.replace("[구제대상]", "").trim()}</li>
                  ))
              ) : (
                <li>해당 없음</li>
              )}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: "14px",
                margin: "8px 0 4px 0",
                color: "#737373",
                fontWeight: "600",
              }}
            >
              ℹ️ 참고 사항 (외관 하자)
            </h4>
            <ul className="bullets" style={{ marginTop: "4px" }}>
              {result.photoFindings.filter(
                (f) =>
                  f.includes("참고") || f.includes("기스") || f.includes("도색")
              ).length > 0 ? (
                result.photoFindings
                  .filter(
                    (f) =>
                      f.includes("참고") ||
                      f.includes("기스") ||
                      f.includes("도색")
                  )
                  .map((finding, i) => (
                    <li key={i}>{finding.replace("[참고]", "").trim()}</li>
                  ))
              ) : (
                <li>특이사항 없음</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flags">
        {result.flags.map((flag, i) => (
          <span key={i} className="flag">
            {flag}
          </span>
        ))}
      </div>
    </section>
  );
}
