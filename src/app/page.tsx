'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import IntakeForm from '@/components/IntakeForm';
import DiagnosisSection from '@/components/DiagnosisSection';
import OptionsSection from '@/components/OptionsSection';
import PackagerSection from '@/components/PackagerSection';
import DeadlinesSection from '@/components/DeadlinesSection';
import { FormData, DiagnosisResult } from '@/types';
import { MOCK_KAHISTORY, MOCK_OCR } from '@/lib/mockData';
import { daysBetween } from '@/lib/utils';
import { mapApiToDiagnosis } from '@/lib/mapApiToDiagnosis';
import Swal from 'sweetalert2';

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    vin: '',
    purchaseDate: '',
    mileage: 0,
    channel: '',
  });

  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showPackager, setShowPackager] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const runFactCheck = async () => {
    if (!formData.vin || !formData.purchaseDate || !formData.mileage || !formData.channel) {
      await Swal.fire({
        icon: 'warning',
        text: '필수 입력을 모두 채워주세요.'
      });
      return;
    }

    // 로딩 시작 & 결과 섹션 초기화
    if (isLoading) return;        // 중복 클릭 방지
    setIsLoading(true);
    setShowOptions(false);
    setShowPackager(false);
    setShowDeadlines(false);

    // Mock 카히스토리 + OCR + 사진 분석
    const kahistory = { ...MOCK_KAHISTORY, vin: formData.vin };
    const ocr = { ...MOCK_OCR };
    
    // 사진 분석 (파일명 기반 간단한 규칙)
    const photoFindings: string[] = [];
    if (formData.inspectPhotos) {
      Array.from(formData.inspectPhotos).forEach(file => {
        const name = file.name.toLowerCase();
        if (name.includes('mud') || name.includes('흙') || name.includes('진흙')) 
          photoFindings.push('흙탕물 라인 의심');
        if (name.includes('rust') || name.includes('녹')) 
          photoFindings.push('안전벨트 버클/하체 녹 의심');
        if (name.includes('under') || name.includes('언더')) 
          photoFindings.push('언더커버 침수 흔적 의심');
      });
    }

    // 불일치 플래그
    const flags: string[] = [];
    const hasAccident = kahistory.accidents.length > 0;
    if (ocr.noAccidentMarked && hasAccident) flags.push('기록부-이력 불일치');
    if (kahistory.accidents.some(a => a.type.includes('침수')) || photoFindings.length > 0) 
      flags.push('침수 의심');

    const res = await fetch('/api/match-remedy',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({ vehicleId: formData.vin, purchaseDate: formData.purchaseDate, currentMileage: Number(formData.mileage), purchaseChannel: formData.channel })});
    const data = await res.json();
    ;(window as any).__carclameApi = data;
    setDiagnosisResult(mapApiToDiagnosis(data, formData));

    setShowOptions(true);
    setShowPackager(true);
    setShowDeadlines(true);
    setIsLoading(false);   // 로딩 종료
  };

  const purchaseDate = formData.purchaseDate ? new Date(formData.purchaseDate) : null;
  const today = new Date();
  const daysSince = purchaseDate ? daysBetween(purchaseDate, today) : 0;

  const options = showOptions ? {
    warranty: daysSince <= 30 || formData.mileage <= 2000,
    refund: diagnosisResult?.kahistory.accidents.length ? '이력 근거로 검토' : '사진·이력 기반 의심 시 검토',
    personal: (formData.riders || '').toLowerCase().includes('자차') || 
               (formData.riders || '').toLowerCase().includes('자가')
  } : null;

  return (
    <>
      <Header />
      <main className="page">
        <IntakeForm 
            formData={formData}
            setFormData={setFormData} 
            onSubmit={runFactCheck}
            isLoading={isLoading}
          />
        {diagnosisResult && <DiagnosisSection result={diagnosisResult} />}
        {showOptions && (
          <OptionsSection 
            options={options} 
            channel={formData.channel}
            daysSince={daysSince}
            mileage={formData.mileage}
          />
        )}
        {showPackager && (
          <PackagerSection 
            visible={showPackager}
            vin={formData.vin}
            purchaseDate={formData.purchaseDate}
          />
        )}
        {showDeadlines && (
          <DeadlinesSection 
            visible={showDeadlines}
            purchaseDate={formData.purchaseDate}
            mileage={formData.mileage}
          />
        )}
      </main>
      <footer className="footer__bar">© 2025 카클레임 Prototype</footer>
    </>
  );
}