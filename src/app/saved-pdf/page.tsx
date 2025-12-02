import Link from "next/link";

export default function SavedPdfPage() {
  return (
    <main className="stub-main">
      <div className="stub-card">
        <p className="eyebrow">저장된 PDF</p>
        <h1>보관된 클레임 패키지가 곧 여기에 표시됩니다.</h1>
        <p>
          자동분석에서 생성한 패키지를 모아두는 공간을 마련하는 중입니다. 지금은
          MVP 기능을 빠르게 붙이는 단계라, 먼저 자동 분석 워크플로를 살펴봐 주실
          수 있을까요?
        </p>
        <div className="hero-cta">
          <Link href="/analysis" className="btn primary">
            자동분석 페이지로 이동
          </Link>
          <Link href="/" className="btn outline">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
