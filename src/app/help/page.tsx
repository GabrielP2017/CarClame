import Link from "next/link";

const faqs = [
  {
    q: "분석 결과는 어떻게 저장되나요?",
    a: "모든 세션은 로컬 브라우저에 우선 저장되고, 곧 계정 기반 동기화를 붙일 예정입니다.",
  },
  {
    q: "PDF 패키지는 어떤 형식인가요?",
    a: "초안에는 진술서, 증빙 문서 인덱스, 검토 로그가 들어가며, 파트너별 템플릿을 선택할 수 있게 만들고 있습니다.",
  },
  {
    q: "데이터 보안은 어떻게 보장되나요?",
    a: "업로드된 자료는 프로젝트 폴더 내 암호화된 볼륨에 저장되고, 시간 제한이 지나면 자동 삭제됩니다.",
  },
];

export default function HelpPage() {
  return (
    <main className="stub-main">
      <div className="stub-card">
        <p className="eyebrow">도움말</p>
        <h1>자주 묻는 질문을 먼저 정리했어요.</h1>
        <div className="faq-list">
          {faqs.map((faq) => (
            <article key={faq.q}>
              <h2>{faq.q}</h2>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>
        <p className="stub-note">
          더 궁금한 점이 있다면 <a href="mailto:hello@carclame.com">hello@carclame.com</a>
          으로 메일 주세요.
        </p>
        <div className="hero-cta">
          <Link href="/analysis" className="btn primary">
            자동분석 실행
          </Link>
          <Link href="/" className="btn outline">
            메인으로
          </Link>
        </div>
      </div>
    </main>
  );
}
