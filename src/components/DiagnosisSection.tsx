'use client';

import { DiagnosisResult } from '@/types';
import { fmt } from '@/lib/utils';

interface DiagnosisSectionProps {
  result: DiagnosisResult | null;
}

export default function DiagnosisSection({ result }: DiagnosisSectionProps) {
  if (!result) return null;

  return (
    <section className="card">
      <h2>팩트체크 결과</h2>
      <div className="grid3">
        <div className="kahi panel">
          <h3>카히스토리(목업)</h3>
          <div className="kv">
            <div className="row">
              <span>VIN</span>
              <strong>{result.kahistory.vin}</strong>
            </div>
            <div className="row">
              <span>전손</span>
              <strong>{result.kahistory.writtenOff ? '있음' : '없음'}</strong>
            </div>
            <div className="row">
              <span>도난</span>
              <strong>{result.kahistory.theft ? '있음' : '없음'}</strong>
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
          <p className="hint" style={{ fontSize: '12px', color: '#737373', marginTop: '8px' }}>
            ※ 보험 처리 건 중심이며 사고 규모/과실 비율은 한계가 있습니다.
          </p>
        </div>

        <div className="ocr panel">
          <h3>기록부 OCR·불일치</h3>
          <div className="kv">
            <div className="row">
              <span>기록부 표기</span>
              <strong>{result.ocr.noAccidentMarked ? '무사고' : '사고표기'}</strong>
            </div>
            {Object.entries(result.ocr.categories).map(([k, v]) => (
              <div key={k} className="row">
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="photo panel">
          <h3>사진 분석 룰</h3>
          <ul className="bullets">
            {result.photoFindings.length > 0
              ? result.photoFindings.map((finding, i) => <li key={i}>{finding}</li>)
              : <li>특이 사항 없음</li>}
          </ul>
        </div>
      </div>

      <div className="flags">
        {result.flags.map((flag, i) => (
          <span key={i} className="flag">{flag}</span>
        ))}
      </div>
    </section>
  );
}