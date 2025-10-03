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
      <h1>사실 확인 ▶ 구제 옵션 ▶ 서류 패키지</h1>
      <p className="sub">
        차량 번호/VIN과 구매일·주행거리만 입력하면, 불일치 탐지 → 환불/보증/보험
        경로 → 원클릭 서류 생성까지 한 번에.
      </p>

      <form
        className="grid2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="field">
          <label>차량번호 또는 VIN*</label>
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
            onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
            required
          />
        </div>
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
          <label>계약서·성능점검기록부 사진(OCR)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={(e) => handleInputChange("docImages", e.target.files)}
          />
        </div>

        <details className="full">
          <summary>선택 입력 펼치기</summary>
          <div className="grid2" style={{ marginTop: "12px" }}>
            <div className="field">
              <label>보험 특약(자차/침수/타이어/형사합의 등)</label>
              <input
                value={formData.riders || ""}
                onChange={(e) => handleInputChange("riders", e.target.value)}
                placeholder="예: 자차, 침수"
              />
            </div>
            <div className="field">
              <label>점검 사진(하체 녹/흙탕물 흔적)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  handleInputChange("inspectPhotos", e.target.files)
                }
              />
            </div>
            <div className="field">
              <label>정비 견적서</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) =>
                  handleInputChange("repairPdf", e.target.files?.[0])
                }
              />
            </div>
          </div>
        </details>

        <div className="actions full">
          <button
            type="submit"
            className="btn primary"
            disabled={!!isLoading}
            aria-busy={!!isLoading}
          >
            <i className="ri-search-line"></i>
            {isLoading ? " 실행 중…" : " 팩트체크 실행"}
          </button>
        </div>
      </form>
    </section>
  );
}
