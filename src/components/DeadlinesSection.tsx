'use client';

import { leftStr, fmt } from '@/lib/utils';

interface DeadlinesSectionProps {
  visible: boolean;
  purchaseDate: string;
  mileage: number;
}

export default function DeadlinesSection({ visible, purchaseDate, mileage }: DeadlinesSectionProps) {
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
    <section className="card">
      <h2>마감 카운트다운</h2>
      <div className="grid3 timers">
        <div className="timer">
          <div><strong>K Car 3일 환불</strong></div>
          <div className="due">{d3.toLocaleDateString()}</div>
          <div>{leftStr(today, d3)}</div>
        </div>
        <div className="timer">
          <div><strong>엔카 7일 환불</strong></div>
          <div className="due">{d7.toLocaleDateString()}</div>
          <div>{leftStr(today, d7)}</div>
        </div>
        <div className="timer">
          <div><strong>성능보증 30일/2,000km</strong></div>
          <div className="due">{d30.toLocaleDateString()}</div>
          <div>{leftStr(today, d30)} · 주행거리 2,000km - 현재 {fmt(mileage)}km</div>
        </div>
      </div>
      <p className="hint" style={{ fontSize: '13px', color: '#737373', marginTop: '12px' }}>
        인도일 기준 D-3, D-7, D-30/2,000km 등 주요 마감까지 남은 기간을 표시합니다.
      </p>
    </section>
  );
}