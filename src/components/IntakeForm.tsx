"use client";

import { FormData } from "@/types";

interface IntakeFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const riderOptions = [
  { value: "자가", label: "자가 보증 (전손 처리)" },
  { value: "침수", label: "침수 특약" },
  { value: "자손", label: "자손 보험 (본인 피해)" },
  { value: "의무이행", label: "의무이행 특약" },
  { value: "기타", label: "기타 특약" },
];

export default function IntakeForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}: IntakeFormProps) {
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const isRiderSelected = (token: string) =>
    (formData.riders || "").includes(token);

  const updateRider = (token: string, checked: boolean) => {
    const current = formData.riders || "";
    const next = checked
      ? current
        ? `${current}, ${token}`
        : token
      : current
          .replace(new RegExp(`,?\\s*${token}`, "g"), "")
          .replace(/^,\\s*/, "");
    handleInputChange("riders", next);
  };

  return (
    <section className="analysis-section analysis-form">
      <div className="analysis-section__head">
        <div>
          <p className="eyebrow">1단계</p>
          <h2>차량 기본 정보 입력</h2>
        </div>
        <span className="analysis-section__meta">
          필수 항목: VIN / 구매일 / 주행거리 / 채널
        </span>
      </div>
      <p className="analysis-lead">
        필수 정보만 한 번 입력하면 OCR, 비전, 정책 룰셋을 조합해 실행 가능한
        팩트 체크 결과를 돌려드립니다.
      </p>

      <form
        className="analysis-form__grid"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="analysis-form__group">
          <p className="analysis-form__label">차량 기본</p>
          <div className="grid2">
            <div className="field">
              <label>차량번호 또는 VIN*</label>
              <input
                value={formData.vin}
                onChange={(e) => handleInputChange("vin", e.target.value)}
                placeholder="예 12가3456 또는 KMHxxxxxxxxx"
                required
              />
            </div>
            <div className="field">
              <label>구매(등록)일*</label>
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
                placeholder="예 42350"
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
                placeholder="예 42000 (선택)"
              />
              <small className="analysis-hint">
                계약서에 기재된 최초 주행거리
              </small>
            </div>
          </div>
        </div>

        <div className="analysis-form__group">
          <p className="analysis-form__label">구매 채널·문서</p>
          <div className="grid2">
            <div className="field">
              <label>구매 유형*</label>
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
              <label>성능점검기록부(OCR) - 1장</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 1) {
                    alert("성능점검기록부는 1장만 업로드가 가능합니다.");
                    e.target.value = "";
                    return;
                  }
                  handleInputChange("docImages", files);
                }}
              />
              <small className="analysis-hint">
                {formData.docImages?.length ? "1건 업로드됨" : "미첨부"}
              </small>
            </div>
          </div>
        </div>

        <details className="analysis-form__details">
          <summary>선택 증빙 · 특약 정보</summary>
          <div className="analysis-form__stack">
            <div className="field">
              <label>가입한 보험 특약 (중복 선택 가능)</label>
              <div className="analysis-checkbox-group">
                {riderOptions.map((rider) => (
                  <label key={rider.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isRiderSelected(rider.value)}
                      onChange={(e) =>
                        updateRider(rider.value, e.target.checked)
                      }
                    />
                    {rider.label}
                  </label>
                ))}
              </div>
              <small className="analysis-hint">
                {formData.riders ? `선택: ${formData.riders}` : "미선택"}
              </small>
            </div>

            <div className="field">
              <label>차량 사진(외관/하부) - 최대 5장</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 5) {
                    alert("최대 5장까지 업로드가 가능합니다.");
                    e.target.value = "";
                    return;
                  }
                  handleInputChange("inspectPhotos", files);
                }}
              />
              <small className="analysis-hint">
                {formData.inspectPhotos?.length || 0}/5 선택
              </small>
            </div>
          </div>
        </details>

        <div className="analysis-form__actions">
          <button
            type="submit"
            className="btn primary"
            disabled={!!isLoading}
            aria-busy={!!isLoading}
          >
            <i className="ri-search-line" />
            {isLoading ? " 분석 중…" : " 자동 분석 시작"}
          </button>
        </div>
      </form>
    </section>
  );
}
