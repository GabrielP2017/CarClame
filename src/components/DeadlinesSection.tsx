"use client";

import { leftStr, fmt } from "@/lib/utils";

interface DeadlinesSectionProps {
  visible: boolean;
  purchaseDate: string;
  mileage: number;
  apiResponse: any;
}

export default function DeadlinesSection({
  visible,
  purchaseDate,
  mileage,
  apiResponse,
}: DeadlinesSectionProps) {
  if (!visible || !purchaseDate) return null;

  const purchase = new Date(purchaseDate);
  const today = new Date();

  const d3 = new Date(purchase);
  d3.setDate(d3.getDate() + 3);

  const d7 = new Date(purchase);
  d7.setDate(d7.getDate() + 7);

  const d30 = new Date(purchase);
  d30.setDate(d30.getDate() + 30);

  return (
    <section className="analysis-section">
      <div className="analysis-section__head">
        <div>
          <p className="eyebrow">5단계</p>
          <h2>마감 타임라인</h2>
        </div>
        <span className="analysis-section__meta">
          기준 {purchaseDate} / 현재 {fmt(mileage)}km
        </span>
      </div>

      <div className="analysis-timeline">
        <div className="analysis-timeline__item">
          <p className="analysis-label">K Car 3일 환불</p>
          <strong>{d3.toLocaleDateString()}</strong>
          <span>
            {apiResponse?.deadlines?.d3?.label ?? leftStr(today, d3)}
          </span>
        </div>
        <div className="analysis-timeline__item">
          <p className="analysis-label">엔카 7일 환불</p>
          <strong>{d7.toLocaleDateString()}</strong>
          <span>
            {apiResponse?.deadlines?.d7?.label ?? leftStr(today, d7)}
          </span>
        </div>
        <div className="analysis-timeline__item">
          <p className="analysis-label">성능 보증 30일 / 2,000km</p>
          <strong>{d30.toLocaleDateString()}</strong>
          <span>
            {apiResponse?.deadlines?.d30?.label ?? leftStr(today, d30)} ·{" "}
            {apiResponse?.deadlines?.km2000?.label ??
              `주행거리 2,000km - 현재 ${fmt(mileage)}km`}
          </span>
        </div>
      </div>
      <p className="analysis-hint">
        등록일 기준 D-3, D-7, D-30 / 2,000km 등 주요 마감 시점을 한눈에 정렬하여
        상위 우선순위를 빠르게 정리할 수 있습니다.
      </p>
    </section>
  );
}
