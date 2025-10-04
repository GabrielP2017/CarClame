"use client";

import { FormData } from "@/types";

interface IntakeFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function IntakeForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}: IntakeFormProps) {
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <section className="card">
      <h1>자동 분석 ▶ 구제 옵션 ▶ 서류 패키지</h1>
      <p className="sub">
        차량 정보 입력만으로 AI가 자동 분석 → 환불/보증/보험 경로 안내 → 서류
        자동 생성까지 한 번에.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 필수 입력 - 2열 그리드 */}
          <div className="grid2">
            <div className="field">
              <label>차량번호 (또는 VIN)*</label>
              <input
                value={formData.vin}
                onChange={(e) => handleInputChange("vin", e.target.value)}
                placeholder="예: 12가3456 또는 KMHxxxxxxxxx"
                required
              />
            </div>
            <div className="field">
              <label>구매(인도)일*</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) =>
                  handleInputChange("purchaseDate", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label>현재 주행거리(km)*</label>
              <input
                type="number"
                min="0"
                value={formData.mileage}
                onChange={(e) =>
                  handleInputChange("mileage", parseInt(e.target.value))
                }
                placeholder="예: 42350"
                required
              />
            </div>
            <div className="field">
              <label>구매 당시 주행거리(km)</label>
              <input
                type="number"
                min="0"
                value={formData.purchaseMileage || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange(
                    "purchaseMileage",
                    value === "" ? null : parseInt(value)
                  );
                }}
                placeholder="예: 42000 (선택사항)"
              />
              <small style={{ fontSize: "12px", color: "#737373" }}>
                계약서에 적힌 인도 시점 주행거리
              </small>
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label>판매 유형*</label>
              <select
                value={formData.channel}
                onChange={(e) => handleInputChange("channel", e.target.value)}
                required
              >
                <option value="">선택</option>
                <option value="K Car">K Car</option>
                <option value="엔카">엔카</option>
                <option value="개인">개인</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="field">
              <label>성능점검기록부 사진(OCR) - 1장만</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 1) {
                    alert("성능점검기록부는 1장만 업로드 가능합니다.");
                    e.target.value = "";
                    return;
                  }
                  handleInputChange("docImages", files);
                }}
              />
              <small style={{ fontSize: "12px", color: "#737373" }}>
                {formData.docImages?.length ? "✓ 1장 선택됨" : ""}
              </small>
            </div>
          </div>

          {/* 선택 입력 */}
          <details>
            <summary>선택 입력 펼치기</summary>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* 보험 특약 - 단독 영역 */}
              <div className="field">
                <label>가입한 보험 특약 (중복 선택 가능)</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.riders || "").includes("자차")}
                      onChange={(e) => {
                        const current = formData.riders || "";
                        const riders = e.target.checked
                          ? current
                            ? `${current}, 자차`
                            : "자차"
                          : current
                              .replace(/,?\s*자차/g, "")
                              .replace(/^,\s*/, "");
                        handleInputChange("riders", riders);
                      }}
                    />
                    자차 담보 (내 차 수리비)
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.riders || "").includes("침수")}
                      onChange={(e) => {
                        const current = formData.riders || "";
                        const riders = e.target.checked
                          ? current
                            ? `${current}, 침수`
                            : "침수"
                          : current
                              .replace(/,?\s*침수/g, "")
                              .replace(/^,\s*/, "");
                        handleInputChange("riders", riders);
                      }}
                    />
                    침수 특약
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.riders || "").includes("자손")}
                      onChange={(e) => {
                        const current = formData.riders || "";
                        const riders = e.target.checked
                          ? current
                            ? `${current}, 자손`
                            : "자손"
                          : current
                              .replace(/,?\s*자손/g, "")
                              .replace(/^,\s*/, "");
                        handleInputChange("riders", riders);
                      }}
                    />
                    자손 담보 (본인 상해)
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.riders || "").includes("타이어")}
                      onChange={(e) => {
                        const current = formData.riders || "";
                        const riders = e.target.checked
                          ? current
                            ? `${current}, 타이어`
                            : "타이어"
                          : current
                              .replace(/,?\s*타이어/g, "")
                              .replace(/^,\s*/, "");
                        handleInputChange("riders", riders);
                      }}
                    />
                    타이어 특약
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.riders || "").includes("기타")}
                      onChange={(e) => {
                        const current = formData.riders || "";
                        const riders = e.target.checked
                          ? current
                            ? `${current}, 기타`
                            : "기타"
                          : current
                              .replace(/,?\s*기타/g, "")
                              .replace(/^,\s*/, "");
                        handleInputChange("riders", riders);
                      }}
                    />
                    기타 특약
                  </label>
                </div>
                <small
                  style={{
                    fontSize: "12px",
                    color: "#737373",
                    marginTop: "8px",
                    display: "block",
                  }}
                >
                  {formData.riders ? `선택: ${formData.riders}` : "미선택"}
                </small>
              </div>

              {/* 사진/견적서 - grid2로 2열 */}
              {/* 점검 사진 */}
              <div className="field">
                <label>점검 사진(하체 녹/흙탕물 흔적) - 최대 5장</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 5) {
                      alert("최대 5장까지만 업로드 가능합니다.");
                      e.target.value = "";
                      return;
                    }
                    handleInputChange("inspectPhotos", files);
                  }}
                />
                <small style={{ fontSize: "12px", color: "#737373" }}>
                  {formData.inspectPhotos?.length || 0}/5 장 선택됨
                </small>
              </div>
            </div>
          </details>

          {/* 제출 버튼 */}
          <div className="actions">
            <button
              type="submit"
              className="btn primary"
              disabled={!!isLoading}
              aria-busy={!!isLoading}
            >
              <i className="ri-search-line"></i>
              {isLoading ? " 분석 중…" : " 자동 분석 시작"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
