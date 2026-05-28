import introduceGif from '../../assets/introduce_1.gif'
import AppLayout from '../../components/layout/AppLayout/AppLayout.jsx'
import { EduHubBookIcon } from '../../shared/icons/eduHubIcons.jsx'
import LandingFloatingDock from './LandingFloatingDock.jsx'
import LandingMindMap from './LandingMindMap.jsx'
import { useLandingHeaderProps } from './useLandingHeaderProps.js'
import {
  LANDING_WAVE_BACK_PATH,
  LANDING_WAVE_FRONT_PATH,
  LANDING_WAVE_MID_PATH,
} from './landingWavePaths.js'
import './LandingPage.css'

export default function LandingPage() {
  const { headerProps, logoutConfirmModal } = useLandingHeaderProps()

  return (
    <>
      {logoutConfirmModal}
      <AppLayout
      className="landing"
      contentClassName="landing__content"
      headerProps={headerProps}
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
          <path d={LANDING_WAVE_BACK_PATH} />
        </svg>
        <svg
          className="landing-waves__svg landing-waves__svg--mid"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
        >
          <path d={LANDING_WAVE_MID_PATH} />
        </svg>
        <svg
          className="landing-waves__svg landing-waves__svg--front"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
        >
          <path d={LANDING_WAVE_FRONT_PATH} />
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
    </>
  )
}
