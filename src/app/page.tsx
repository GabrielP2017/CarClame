"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import titleIcon from "@/img/TitleIcon.png";

const navLinks = [
  { label: "Quick Analysis", href: "/analysis" },
  { label: "PDF Archive", href: "/saved-pdf" },
  { label: "Help", href: "/help" },
  { label: "About", href: "/about" },
];

const heroHighlights = [
  {
    title: "PDF 자동화",
    desc: "청구 서류·양식을 1분 내 패키징",
  },
  {
    title: "Vision AI",
    desc: "침수/사고 흔적 0.1초당 추적",
  },
  {
    title: "문서 OCR",
    desc: "정비/보증 문서 15초 내 Fact Check",
  },
];

const heroMetrics = [
  { value: "97%", label: "위험 패턴 탐지 정확도" },
  { value: "3분", label: "평균 청구 패키지 생성" },
  { value: "24h", label: "데모 공유 SLA" },
];

const heroPanelSteps = [
  { title: "PDF Auto Build", desc: "청구 양식 자동 생성", badge: "0.8s" },
  { title: "OCR Fact Check", desc: "불일치 필드 탐지", badge: "1.4s" },
  { title: "Vision Review", desc: "침수/사고 흔적 스캔", badge: "2.2s" },
  { title: "PDF 저장", desc: "완성본 패키지 즉시 공유", badge: "Auto" },
];

const problemPoints = [
  {
    title: "사고 이력 확인의 한계",
    body: "카히스토리로 사고·침수 이력을 확인해도 실제 보상으로 이어지지 않는 경우가 대부분입니다.",
  },
  {
    title: "제각각인 마감 기한",
    body: "K Car 3일, 엔카 7일 등 플랫폼마다 보증 기한이 달라 소비자가 기회를 놓치기 쉽습니다.",
  },
  {
    title: "복잡한 청구 절차",
    body: "전문 지식 없는 개인이 서류를 준비하고 책임 소재를 증명하는 일은 사실상 불가능합니다.",
  },
];

const solutionHighlights = [
  {
    title: "AI Fact Check",
    body: "카히스토리, 성능점검기록부, 사진 데이터를 자동 분석해 기록과 실제 상태의 불일치를 탐지합니다.",
  },
  {
    title: "Auto Packaging",
    body: "환불, 보증, 보험 등 상황에 맞는 청구 양식을 자동으로 채우고, 필수 증빙 서류를 패키징합니다.",
  },
];

const strategySteps = [
  { title: "팩트 체크", desc: "OCR & Vision AI로 서류·사진 정밀 진단" },
  { title: "옵션 매칭", desc: "환불/책임보험 등 최적 보상 경로 추천" },
  { title: "패키징", desc: "청구서 자동 생성 및 증빙 서류 번들링" },
  { title: "전환 UX", desc: "마감 카운트다운 & 원클릭 제출 유도" },
];

const flowSteps = [
  {
    label: "정보 입력",
    detail: "차량번호, 사고일시, 주행거리 등 필수값을 간단히 입력합니다.",
  },
  {
    label: "AI 분석",
    detail: "차량 상태와 보험 적용 여부를 판단하고 위험도를 수치화합니다.",
  },
  {
    label: "청구서 생성",
    detail: "환불/보증/보험 양식을 자동 작성하고 PDF 패키지를 만듭니다.",
  },
  {
    label: "결과 제공",
    detail: "분석 리포트와 제출 가이드를 함께 제공합니다.",
  },
];

const keyFeatures = [
  {
    tag: "History",
    title: "차량 이력 통합",
    body: "카히스토리와 연동해 사고, 침수, 도난, 전손 등 보험 기반 이력을 한 번에 확인합니다.",
  },
  {
    tag: "OCR",
    title: "문서 정밀 분석",
    body: "성능점검기록부와 각종 서류를 OCR로 읽어 미세한 불일치를 자동 탐지합니다.",
  },
  {
    tag: "Vision",
    title: "사진 AI 분석",
    body: "흙탕물 라인, 하부 녹 등을 Vision AI로 감지해 침수 의심 지수를 산출합니다.",
  },
  {
    tag: "Doc Ops",
    title: "자동 청구 패키징",
    body: "필요한 증빙 서류와 양식을 묶어 원클릭으로 제출 가능한 PDF 패키지를 생성합니다.",
  },
];

const marketFacts = [
  {
    label: "국내 중고차 시장 성장률",
    value: "CAGR 11.8%",
    detail: "신차 거래 대비 1.4배 규모",
  },
  {
    label: "보증 기한 편차",
    value: "3~7일",
    detail: "플랫폼마다 규정이 달라 소비자 혼란",
  },
  {
    label: "우리가 푸는 문제",
    value: "확인 → 보상",
    detail: "단순 진단을 넘어 실질 보상 성사율 향상",
  },
];

const comparisonRows = [
  {
    metric: "접근 방식",
    carclame: "진단 + 청구 자동화",
    kcar: "책임 환불제",
    encar: "진단/보증 서비스",
  },
  {
    metric: "기술력",
    carclame: "AI 통합 분석 (OCR+이미지)",
    kcar: "전문 인력 육안 진단",
    encar: "성능점검장 제휴 진단",
  },
  {
    metric: "사용자 편의",
    carclame: "서류 자동 생성 & 가이드",
    kcar: "환불 절차 복잡",
    encar: "약관 숙지 필요",
  },
  {
    metric: "커버리지",
    carclame: "모든 차량 (개인/상사)",
    kcar: "자사 직영차 한정",
    encar: "제휴 차량 한정",
  },
];

const businessModels = [
  {
    segment: "B2C (개인)",
    items: [
      "Light (9,900원): OCR 기반 기본 진단 리포트",
      "Pro (29,000원): 청구 패키저 + 증빙 체크리스트",
      "성공 보수: 환불/보증 승인 시 정액 보너스",
    ],
  },
  {
    segment: "B2B (제휴/기업)",
    items: [
      "API 구독: 플랫폼용 화이트라벨 솔루션",
      "제휴 수수료: 정비소 연결 (CPL/CPA)",
      "보험 연계: 특약 가입/정산 수익",
    ],
  },
];

const teamResponsibilities = [
  {
    title: "데이터 & 로직",
    body: "외부 데이터(OCR)를 가공해 시스템에 맞게 적재하고 불일치를 탐지하는 로직을 맡습니다.",
    owner: "이강민",
  },
  {
    title: "비즈니스 규칙",
    body: "진단 결과를 바탕으로 환불/보증 기간 등 규칙을 적용하고 PDF 청구 패키지를 생성합니다.",
    owner: "이승엽",
  },
  {
    title: "UX / UI & 전달",
    body: "사용자 인증, 제출 트래킹, 결과물 전달 등 전체 UX/UI를 책임집니다.",
    owner: "이동민",
  },
];

const roadmap = [
  { phase: "v0.1 (2주)", detail: "MVP 구현 · 목업 데이터 진단 & PDF 생성" },
  { phase: "v0.2 (4주)", detail: "OCR 정밀도 향상 · 타임라인 캘린더" },
  {
    phase: "v0.3 (6~8주)",
    detail: "API 제공 · 화이트라벨 테스트 · 제휴 온보딩",
  },
  {
    phase: "v1.0 (런칭)",
    detail: "실제 연동 · 결제 시스템 · 제출 상태 트래킹",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.08,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom = 1) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: custom * 0.06,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function HomePage() {
  return (
    <div className="landing-shell">
      <header className="marketing-header">
        <div className="marketing-left">
          <Link
            href="/"
            className="marketing-logo"
            aria-label="CarClame 홈으로 이동"
          >
            <Image
              src={titleIcon}
              alt="CarClame"
              width={36}
              height={36}
              priority
            />
          </Link>
          <nav className="marketing-nav">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="marketing-center">CarClame</span>
      </header>

      <main className="landing-main">
        <motion.section
          className="hero"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="hero-bg">
            <div className="hero-gridlines" />
            <div className="hero-blur hero-blur-one" />
            <div className="hero-blur hero-blur-two" />
            <div className="scan-line" />
          </div>
          <div className="hero-inner">
            <div className="hero-layout">
              <div className="hero-copy">
                <motion.p
                  className="hero-pill floating-pill"
                  variants={fadeUp}
                  custom={0}
                >
                  확인에서 멈추지 말고, 바로 보상으로
                </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="hero-title">
              <span className="hero-title-sub">중고차 보상까지</span>
              <br />
              <span className="hero-title-main">원스톱</span>으로 연결
            </motion.h1>
                <motion.p className="hero-sub" variants={fadeUp} custom={2}>
                  투명한 중고차 시장을 위한 AI 기반 원스톱 보상 솔루션입니다.
                  진단 결과가 곧바로 환불·보증·보험 청구로 이어지도록
                  설계했습니다.
                </motion.p>
                <motion.div className="hero-cta" variants={fadeUp} custom={3}>
                  <Link href="/analysis" className="btn primary lg glow">
                    지금 바로 Fact Check
                  </Link>
                  <Link href="/saved-pdf" className="btn outline lg">
                    청구 패키지 샘플 보기
                  </Link>
                </motion.div>
                <motion.div className="hero-meta" variants={fadeUp} custom={4}>
                  <span>ⓘ 목업 데이터로 즉시 데모 가능</span>
                  <div className="meta-sep" />
                  <span>VIN · OCR · Vision AI 통합</span>
                </motion.div>
              </div>
              <motion.div
                className="hero-panel"
                variants={scaleIn}
                custom={4}
                whileHover={{ translateY: -6 }}
              >
                <div className="hero-panel__header">
                  <span>실시간 Fact Check</span>
                  <strong>Live Preview</strong>
                </div>
                <ul className="hero-panel__list">
                  {heroPanelSteps.map((step) => (
                    <li key={step.title} className="hero-panel__item">
                      <span className="hero-panel__dot" />
                      <div>
                        <p>{step.title}</p>
                        <small>{step.desc}</small>
                      </div>
                      <span className="hero-panel__badge">{step.badge}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <motion.ul className="hero-checklist" variants={fadeUp} custom={5}>
              {heroHighlights.map((item, idx) => (
                <motion.li key={item.title} variants={fadeUp} custom={idx + 1}>
                  <span className="hero-check-icon" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div className="hero-metrics" variants={fadeUp} custom={6}>
              {heroMetrics.map((metric) => (
                <div key={metric.value} className="hero-metric">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div
            className="hero-orb hero-orb-one"
            aria-hidden="true"
            animate={{ y: [-10, 12, -10], rotate: [0, 8, 0] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
          <motion.div
            className="hero-orb hero-orb-two"
            aria-hidden="true"
            animate={{ y: [8, -12, 8], rotate: [0, -6, 0] }}
            transition={{
              duration: 22,
              repeat: Infinity,
              repeatType: "mirror",
              delay: 2,
            }}
          />
        </motion.section>

        <div className="section-divider" aria-hidden="true" />

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Problem</p>
              <h2>“알고도 당하고, 몰라서 못 받는다”</h2>
            </div>
          </div>
          <div className="lined-grid three">
            {problemPoints.map((item, idx) => (
              <motion.div
                key={item.title}
                className="lined-item"
                variants={fadeUp}
                custom={idx * 0.4}
              >
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Solution</p>
              <h2>사실 확인부터 보상 청구까지 한 번에</h2>
            </div>
          </div>
          <div className="lined-grid two">
            {solutionHighlights.map((item, idx) => (
              <motion.div
                key={item.title}
                className="lined-item"
                variants={scaleIn}
                custom={idx * 0.3}
              >
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">4-Step Strategy</p>
              <h2>현장 workflow를 그대로 디지털화</h2>
            </div>
          </div>
          <div className="numbered-list">
            {strategySteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="numbered-item"
                variants={fadeUp}
                custom={index * 0.3}
              >
                <span className="numbered-index">{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Service Flow</p>
              <h2>사용자는 복잡한 입력 없이 결과만 받습니다.</h2>
            </div>
          </div>
          <div className="numbered-list subtle">
            {flowSteps.map((step, index) => (
              <motion.div
                key={step.label}
                className="numbered-item"
                variants={fadeUp}
                custom={index * 0.3}
              >
                <span className="numbered-index">{index + 1}</span>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="feature-stack"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={fadeUp}
        >
          <motion.div className="stack-copy" variants={fadeUp}>
            <p className="eyebrow">Key Features</p>
            <h2>세 가지 데이터 소스를 묶어 실질적 증거를 만듭니다.</h2>
            <p>
              카히스토리 + 문서 OCR + 사진 AI가 결합돼 “단순 확인”을 넘어 “보상
              가능성이 보이는” 리포트를 만듭니다. 이 결과는 곧바로 청구 패키지로
              재사용됩니다.
            </p>
          </motion.div>
          <div className="stack-card-grid lined-grid two">
            {keyFeatures.map((feature, idx) => (
              <motion.article
                key={feature.title}
                className="stack-card lined-item"
                variants={scaleIn}
                custom={idx * 0.2}
              >
                <span>{feature.tag}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Market</p>
              <h2>폭발적으로 성장하는 시장, 아직 비어있는 보상 OS</h2>
            </div>
          </div>
          <div className="stat-ribbon">
            {marketFacts.map((fact, idx) => (
              <motion.article
                key={fact.label}
                variants={fadeUp}
                custom={idx * 0.2}
              >
                <p>{fact.label}</p>
                <strong>{fact.value}</strong>
                <span>{fact.detail}</span>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Competitive Edge</p>
              <h2>
                진단에서 멈추는 기존 서비스와 달리, CarClame은 보상까지
                닿습니다.
              </h2>
            </div>
          </div>
          <div className="comparison-grid">
            <div className="comparison-header">
              <span>구분</span>
              <span>CarClame</span>
              <span>K Car</span>
              <span>엔카</span>
            </div>
            {comparisonRows.map((row, idx) => (
              <motion.div
                key={row.metric}
                className="comparison-row"
                variants={fadeUp}
                custom={idx * 0.2}
              >
                <span>{row.metric}</span>
                <span>{row.carclame}</span>
                <span>{row.kcar}</span>
                <span>{row.encar}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Business Model</p>
              <h2>B2C와 B2B가 맞물리는 구조</h2>
            </div>
          </div>
          <div className="list-columns two">
            {businessModels.map((model, idx) => (
              <motion.div
                key={model.segment}
                className="column-item"
                variants={scaleIn}
                custom={idx * 0.2}
              >
                <div className="column-title">{model.segment}</div>
                <ul>
                  {model.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          variants={fadeUp}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Roadmap</p>
              <h2>8주 안에 제휴 가능한 수준으로 성장</h2>
            </div>
          </div>
          <div className="numbered-list subtle">
            {roadmap.map((item, index) => (
              <motion.div
                key={item.phase}
                className="numbered-item"
                variants={fadeUp}
                custom={index * 0.2}
              >
                <span className="numbered-index">{index + 1}</span>
                <div>
                  <strong>{item.phase}</strong>
                  <p>{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <section className="cta-band">
        <h3>오늘 바로 VIN과 서류를 올리고, 보상 패키지를 받아보세요.</h3>
        <div>
          <Link href="/analysis" className="btn primary lg">
            자동분석 체험하기
          </Link>
          <Link href="/about" className="btn ghost lg">
            팀 소개 보기
          </Link>
        </div>
      </section>

      <footer className="marketing-footer">
        <p>© {new Date().getFullYear()} CarClame Labs · “확인에서 보상으로”</p>
        <div>
          <Link href="/analysis">자동분석</Link>
          <Link href="/saved-pdf">샘플 패키지</Link>
          <Link href="/help">도움말</Link>
        </div>
      </footer>
    </div>
  );
}