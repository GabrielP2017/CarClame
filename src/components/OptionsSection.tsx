"use client";

interface OptionsSectionProps {
  apiResponse: any;
}

export default function OptionsSection({ apiResponse }: OptionsSectionProps) {
  if (!apiResponse?.remedies) return null;

  const { liabilityInsurance, dealerRefund, personalInsurance } =
    apiResponse.remedies;

  return (
    <section className="card">
      <h2 style={{ fontSize: "22px", fontWeight: "800" }}>구제 경로 분석</h2>
      <p className="sub" style={{ marginBottom: "16px" }}>
        입력하신 정보로 가능한 보상/환불 방법을 분석했습니다.
      </p>

      {/* 불일치 경고 플래그를 최상단으로 */}
      {apiResponse.flags && apiResponse.flags.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>
            ⚠️ 검토 필요 사항
          </h3>
          <div className="flags">
            {apiResponse.flags.map((flag: string, i: number) => (
              <span key={i} className="flag">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid3">
        {/* 성능·상태점검 책임보험 */}
        <div className="panel">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "14px",
            }}
          >
            🛡️ 성능보증보험
          </h3>

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "14px",
                color: "#737373",
                marginBottom: "4px",
              }}
            >
              적용 가능성
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color:
                  liabilityInsurance?.verdict === "가능성 높음"
                    ? "#16a34a"
                    : liabilityInsurance?.verdict?.includes("초과")
                    ? "#dc2626"
                    : "#737373",
              }}
            >
              {liabilityInsurance?.verdict || "확인 불가"}
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "13px",
                color: "#737373",
                marginBottom: "4px",
              }}
            >
              판정 근거
            </div>
            <div
              style={{ fontSize: "15px", lineHeight: "1.6", color: "#3f3f46" }}
            >
              {liabilityInsurance?.reason || "정보 부족"}
            </div>
          </div>

          <p
            className="hint"
            style={{
              fontSize: "12px",
              color: "#737373",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px dashed #e6e6ef",
            }}
          >
            주요 부품 하자 보상 (인도 후 30일 또는 2,000km 이내)
          </p>
        </div>

        {/* 판매사 환불제 */}
        <div className="panel">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "14px",
            }}
          >
            🔄 판매사 환불제
          </h3>

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "13px",
                color: "#737373",
                marginBottom: "4px",
              }}
            >
              적용 가능성
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color:
                  dealerRefund?.verdict === "가능성 높음"
                    ? "#16a34a"
                    : dealerRefund?.verdict === "기간 초과"
                    ? "#dc2626"
                    : "#737373",
              }}
            >
              {dealerRefund?.verdict || "확인 불가"}
            </div>
          </div>

          {dealerRefund?.brand && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "13px",
                  color: "#737373",
                  marginBottom: "4px",
                }}
              >
                해당 정책
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#3f3f46",
                }}
              >
                {dealerRefund.brand} {dealerRefund.windowDays}일 환불제
              </div>
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "13px",
                color: "#737373",
                marginBottom: "4px",
              }}
            >
              판정 근거
            </div>
            <div
              style={{ fontSize: "15px", lineHeight: "1.6", color: "#3f3f46" }}
            >
              {dealerRefund?.reason || "정보 부족"}
            </div>
          </div>

          <p
            className="hint"
            style={{
              fontSize: "12px",
              color: "#737373",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px dashed #e6e6ef",
            }}
          >
            K Car 3일 / 엔카 7일 / 침수 차량 90일 환불 정책 (판매사별 상이)
          </p>
        </div>

        {/* 개인 자동차보험 */}
        <div className="panel">
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "14px",
            }}
          >
            📋 개인 자동차보험
          </h3>

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "13px",
                color: "#737373",
                marginBottom: "4px",
              }}
            >
              청구 가능성
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color:
                  personalInsurance?.verdict === "청구 적극 권장" ||
                  personalInsurance?.verdict === "청구 가능 추정"
                    ? "#16a34a"
                    : personalInsurance?.verdict === "증거 보완 필요" ||
                      personalInsurance?.verdict === "특약 확인 필요"
                    ? "#d97706"
                    : "#737373",
              }}
            >
              {personalInsurance?.verdict || "검토 필요"}
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div
              style={{
                fontSize: "13px",
                color: "#737373",
                marginBottom: "4px",
              }}
            >
              필요 서류
            </div>
            <div
              style={{ fontSize: "15px", lineHeight: "1.6", color: "#3f3f46" }}
            >
              {personalInsurance?.reason || "보험사 확인 필요"}
            </div>
          </div>

          <p
            className="hint"
            style={{
              fontSize: "12px",
              color: "#737373",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px dashed #e6e6ef",
            }}
          >
            자차 담보 가입 시 사고 수리비 청구 가능 (가입 특약 확인 필요)
          </p>
        </div>
      </div>
    </section>
  );
}
