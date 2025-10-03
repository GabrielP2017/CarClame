"use client";

interface OptionsSectionProps {
  options: {
    warranty: boolean;
    refund: string;
    personal: boolean;
  } | null;
  channel: string;
  daysSince: number;
  mileage: number;
  apiResponse: any;
}

export default function OptionsSection({
  options,
  channel,
  daysSince,
  mileage,
  apiResponse,
}: OptionsSectionProps) {
  if (!options) return null;

  const within3 = daysSince <= 3;
  const within7 = daysSince <= 7;
  const within30 = daysSince <= 30;
  const within2000 = mileage <= 2000;

  return (
    <section className="card">
      <h2>추천 경로</h2>
      <div className="grid3">
        <div className="panel">
          <h3>성능·상태점검 책임보험</h3>
          <div className="kv">
            <div className="row">
              <span>적격(30일/2,000km)</span>
              <strong>
                {apiResponse?.remedies?.liabilityInsurance?.verdict ??
                  (within30 || within2000 ? "가능성 높음" : "기간/주행 초과")}
              </strong>
            </div>
            <div className="row">
              <span>보증 범주</span>
              <strong>
                {apiResponse?.remedies?.liabilityInsurance?.reason ??
                  "엔진·미션·조향·제동·전기장치 매핑"}
              </strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>판매사 환불제(K Car/엔카)</h3>
          {channel === "K Car" || channel === "엔카" ? (
            <div className="kv">
              <div className="row">
                <span>K Car 3일 환불</span>
                <strong>
                  {apiResponse?.remedies?.dealerRefund?.brand === "K Car"
                    ? apiResponse?.remedies?.dealerRefund?.verdict ?? ""
                    : within3
                    ? "대상 가능성"
                    : "기간 초과"}
                </strong>
              </div>
              <div className="row">
                <span>엔카 7일 환불</span>
                <strong>
                  {apiResponse?.remedies?.dealerRefund?.brand === "엔카"
                    ? apiResponse?.remedies?.dealerRefund?.verdict ?? ""
                    : within7
                    ? "대상 가능성"
                    : "기간 초과"}
                </strong>
              </div>
              <div className="row">
                <span>침수 90일 환불</span>
                <strong>{options.refund}</strong>
              </div>
            </div>
          ) : (
            <p>개인 거래는 판매사 환불제 대상이 아닐 수 있습니다.</p>
          )}
        </div>

        <div className="panel">
          <h3>개인 자동차보험</h3>
          <div className="kv">
            <div className="row">
              <span>자차 담보</span>
              <strong>
                {apiResponse?.remedies?.personalInsurance?.verdict ??
                  (options.personal ? "가입(추정)" : "미확인")}
              </strong>
            </div>
            <div className="row">
              <span>추천 서류</span>
              <strong>
                {apiResponse?.remedies?.personalInsurance?.reason ??
                  "청구서·개인정보동의서·위임장"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
