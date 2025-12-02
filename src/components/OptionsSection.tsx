"use client";

interface OptionsSectionProps {
  apiResponse: any;
}

export default function OptionsSection({ apiResponse }: OptionsSectionProps) {
  if (!apiResponse?.remedies) return null;

  const { liabilityInsurance, dealerRefund, personalInsurance } =
    apiResponse.remedies;

  const liabilityTone =
    liabilityInsurance?.verdict === "가능성 높음"
      ? "positive"
      : liabilityInsurance?.verdict?.includes("초과")
      ? "danger"
      : "muted";

  const dealerTone =
    dealerRefund?.verdict === "가능성 높음"
      ? "positive"
      : dealerRefund?.verdict === "기간 초과"
      ? "danger"
      : "muted";

  const personalTone =
    personalInsurance?.verdict === "손해 배상 권장" ||
    personalInsurance?.verdict === "손해 배상 가능추정"
      ? "positive"
      : personalInsurance?.verdict === "증거 보완 필요" ||
        personalInsurance?.verdict === "계약 확인 필요"
      ? "warning"
      : "muted";

  return (
    <section className="analysis-section">
      <div className="analysis-section__head">
        <div>
          <p className="eyebrow">3단계</p>
          <h2>구제 경로 분석</h2>
        </div>
        <span className="analysis-section__meta">보험 · 환불 · 소송 검토</span>
      </div>
      <p className="analysis-lead">
        진단 결과를 근거로 가장 빠르게 접근할 수 있는 경로를 추천합니다.
        박스가 아닌 타이포 레이어만으로 세 축을 나누어 집중도를 높였습니다.
      </p>

      {apiResponse.flags && apiResponse.flags.length > 0 && (
        <div className="analysis-flagline">
          <span>주의</span>
          <div className="flags">
            {apiResponse.flags.map((flag: string, i: number) => (
              <span key={flag + i} className="flag">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-columns analysis-columns--three">
        <article className="analysis-column analysis-card">
          <p className="analysis-label">성능·상태보증보험</p>
          <h3>책임보험</h3>
          <div className={`analysis-value ${liabilityTone}`}>
            {liabilityInsurance?.verdict || "확인 불가"}
          </div>
          <p className="analysis-hint">적용 가능성</p>
          <p className="analysis-body">
            {liabilityInsurance?.reason || "근거 데이터 부족"}
          </p>
          <p className="analysis-hint">
            주요 부품 결함 (30일 또는 2,000km 이내) 기준
          </p>
        </article>

        <article className="analysis-column analysis-card">
          <p className="analysis-label">구매처 환불 정책</p>
          <h3>딜러 / 플랫폼</h3>
          <div className={`analysis-value ${dealerTone}`}>
            {dealerRefund?.verdict || "확인 불가"}
          </div>
          <p className="analysis-hint">
            {dealerRefund?.brand
              ? `${dealerRefund.brand} ${dealerRefund.windowDays}일`
              : "브랜드 환불 정책 정보 부족"}
          </p>
          <p className="analysis-body">
            {dealerRefund?.reason || "추가 정보가 필요합니다."}
          </p>
          <p className="analysis-hint">K Car 3일 / 엔카 7일 / 침수 90일 (유형별 차이)</p>
        </article>

        <article className="analysis-column analysis-card">
          <p className="analysis-label">개인 자동차 보험</p>
          <h3>자차 / 특약</h3>
          <div className={`analysis-value ${personalTone}`}>
            {personalInsurance?.verdict || "검토 필요"}
          </div>
          <p className="analysis-hint">필요 서류 / 증거</p>
          <p className="analysis-body">
            {personalInsurance?.reason || "보험사 확인이 필요합니다."}
          </p>
          <p className="analysis-hint">
            자차 특약 활성화 여부에 따라 진행 방식이 달라집니다.
          </p>
        </article>
      </div>
    </section>
  );
}
