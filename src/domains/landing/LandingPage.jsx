import introduceGif from '../../assets/introduce_1.gif'
import AppLayout from '../../components/layout/AppLayout/AppLayout.jsx'
import { ROUTES } from '../../shared/constants/routes.js'
import { EduHubBookIcon } from '../../shared/icons/eduHubIcons.jsx'
import LandingFloatingDock from './LandingFloatingDock.jsx'
import LandingMindMap from './LandingMindMap.jsx'
import './LandingPage.css'

const LANDING_HEADER = {
  variant: 'public',
  logoImageOnly: true,
  logoHref: ROUTES.home,
  loginHref: ROUTES.login,
}

export default function LandingPage() {
  return (
    <AppLayout
      className="landing"
      contentClassName="landing__content"
      headerProps={LANDING_HEADER}
    >
      <div className="landing-waves" aria-hidden="true">
        <div className="landing-waves__blob landing-waves__blob--1" />
        <div className="landing-waves__blob landing-waves__blob--2" />
        <div className="landing-waves__blob landing-waves__blob--3" />
        <svg
          className="landing-waves__svg landing-waves__svg--back"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
        >
          <path d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,138.7C672,128,768,128,864,144C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,240L0,240Z" />
        </svg>
        <svg
          className="landing-waves__svg landing-waves__svg--front"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
        >
          <path d="M0,128L60,122.7C120,117,240,107,360,117.3C480,128,600,160,720,165.3C840,171,960,149,1080,138.7C1200,128,1320,128,1380,128L1440,128L1440,240L0,240Z" />
        </svg>
      </div>

      <div className="landing-scroll">
        <main className="landing-main">
          <header id="landing-intro" className="landing-intro" aria-label="EDU HUB">
            <div className="landing-intro__logo-wrap">
              <EduHubBookIcon />
            </div>
            <p className="landing-intro__tagline">학습자료 연계형 통합 퀴즈 운영 시스템</p>
          </header>

          <section id="landing-bridge" className="landing-bridge" aria-labelledby="landing-bridge-title">
            <h2 id="landing-bridge-title" className="landing-bridge__title">
              EDU HUB에서의 특별한 경험
            </h2>
            <p className="landing-bridge__lead">교안과 퀴즈를 연결지어 학습하는 경험을 시작하세요.</p>
            <div className="landing-bridge__visual">
              <img
                className="landing-bridge__gif"
                src={introduceGif}
                alt="교안과 퀴즈를 연결해 학습하는 EDU HUB 화면 안내"
                loading="lazy"
                decoding="async"
              />
            </div>
          </section>

          <LandingMindMap />
        </main>

        <footer className="landing-footer">
          <p className="landing-footer__text">© EDU HUB — 학습자료 연계형 통합 퀴즈 운영 시스템</p>
        </footer>
      </div>

      <LandingFloatingDock />
    </AppLayout>
  )
}
