import Link from "next/link";

const milestones = [
  {
    title: "2023 Q4",
    body: "Lemon Law 케이스 20건을 수기로 분석하며 문제 정의",
  },
  {
    title: "2024 Q2",
    body: "VIN 기반 위험 진단 엔진과 PDF 패키저 알파 버전 완성",
  },
  {
    title: "2025 Q1",
    body: "CarClame 베타 공개 — 지금 보시는 이 버전",
  },
];

export default function AboutPage() {
  return (
    <main className="stub-main">
      <div className="stub-card">
        <p className="eyebrow">About</p>
        <h1>CarClame은 중고차 소비자 보호 워크플로를 자동화합니다.</h1>
        <p>
          우리는 자동차/법률/AI 백그라운드를 가진 4명의 팀으로, 복잡한
          환불·보상 절차를 누구나 접근할 수 있게 만드는 것을 목표로 합니다.
        </p>
        <div className="timeline simple">
          {milestones.map((item) => (
            <div key={item.title} className="timeline-step">
              <div className="timeline-index">{item.title}</div>
              <div>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="stub-note">
          팀에 합류하거나 협업을 제안하고 싶다면{" "}
          <a href="mailto:team@carclame.com">team@carclame.com</a> 으로 연락주세요.
        </p>
        <div className="hero-cta">
          <Link href="/analysis" className="btn primary">
            프로덕트 살펴보기
          </Link>
          <Link href="/" className="btn outline">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
