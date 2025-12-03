import Image from "next/image";
import Link from "next/link";
import titleIcon from "@/img/TitleIcon.png";

const navLinks = [
  { label: "Quick Analysis", href: "/analysis" },
  { label: "PDF Archive", href: "/saved-pdf" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/about", disabled: true },
];

export default function AboutPage() {
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
          <p className="eyebrow">About</p>
          <h1>팀 소개 페이지를 준비 중입니다</h1>
          <p>서비스 히스토리와 팀 스토리를 정리하고 있으니 곧 업데이트로 찾아뵙겠습니다.</p>
          <div className="hero-cta">
            <Link href="/analysis" className="btn primary">
              자동 분석 바로가기
            </Link>
            <Link href="/" className="btn outline">
              메인으로 돌아가기
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
