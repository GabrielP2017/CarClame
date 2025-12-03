import Image from "next/image";
import Link from "next/link";
import titleIcon from "@/img/TitleIcon.png";

const navLinks = [
  { label: "Quick Analysis", href: "/analysis" },
  { label: "PDF Archive", href: "/saved-pdf" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/about", disabled: true },
];

const faqs = [
  {
    q: "분석 결과는 어떻게 저장되나요?",
    a: "모든 세션은 로컬 브라우저에만 저장되며 향후 계정 기반 히스토리를 붙일 예정입니다.",
  },
  {
    q: "PDF 패키지는 어떤 형식인가요?",
    a: "진술서, 증빙 문서 인덱스, 검토 로그가 포함되어 기관별 템플릿을 선택해 만들 수 있습니다.",
  },
  {
    q: "데이터 보안은 어떻게 보장되나요?",
    a: "업로드된 자료는 브라우저 탭 내에서만 처리되고 일정 시간이 지나면 자동 삭제됩니다.",
  },
];

export default function HelpPage() {
  return (
    <div className="landing-shell">
      <header className="marketing-header">
        <div className="marketing-left">
          <Link href="/" className="marketing-logo" aria-label="CarClame 메인으로 이동">
            <Image src={titleIcon} alt="CarClame" width={36} height={36} priority />
          </Link>
          <nav className="marketing-nav">
            {navLinks.map((link) =>
              link.disabled ? (
                <button
                  key={link.label}
                  type="button"
                  className="marketing-nav__disabled"
                  disabled
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
        <span className="marketing-center">CarClame</span>
      </header>

      <main className="stub-main">
        <div className="stub-card">
          <p className="eyebrow">Help Center</p>
          <h1>자주 묻는 질문을 모았습니다</h1>
          <div className="faq-list">
            {faqs.map((faq) => (
              <article key={faq.q}>
                <h2>{faq.q}</h2>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
          <p className="stub-note">
            더 궁금한 점이 있다면 <a href="mailto:hello@carclame.com">hello@carclame.com</a>{" "}
            으로 메일 주세요.
          </p>
          <div className="hero-cta">
            <Link href="/analysis" className="btn primary">
              자동 분석 실행
            </Link>
            <Link href="/" className="btn outline">
              메인으로
            </Link>
          </div>
        </div>
      </main>

      <footer className="marketing-footer">
        <p>© {new Date().getFullYear()} CarClame Labs</p>
        <div>
          <Link href="/analysis">Quick Analysis</Link>
          <Link href="/saved-pdf">PDF Archive</Link>
          <Link href="/help">Help</Link>
        </div>
      </footer>
    </div>
  );
}
