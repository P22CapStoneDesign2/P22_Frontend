import eduhubLogo from '../../assets/eduhub_logo.png'
import LandingStartLink from './LandingStartLink.jsx'
import {
  LANDING_WAVE_BACK_PATH,
  LANDING_WAVE_FRONT_PATH,
  LANDING_WAVE_MID_PATH,
} from './landingWavePaths.js'
import {
  MindMapProfessorIcon,
  MindMapQuizIcon,
  MindMapStudentIcon,
} from './landingMindMapIcons.jsx'

/** @typedef {{ id: string, label: string, title: string, body: string, angle: number, Icon: function(): import('react').ReactNode }} MindMapNode */

/** @type {MindMapNode[]} */
const MINDMAP_NODES = [
  {
    id: 'professor',
    label: '교수',
    title: '교수를 위한 기능',
    body: '교안 업로드·관리, 교안별 퀴즈 생성·수정, 학습자 응시 현황 확인 등 강의 운영에 필요한 도구를 제공합니다.',
    angle: -52,
    Icon: MindMapProfessorIcon,
  },
  {
    id: 'student',
    label: '학생',
    title: '학생을 위한 기능',
    body: '배정된 교안 열람, 퀴즈 풀이·결과 확인 등 수업 참여에 필요한 화면을 제공합니다.',
    angle: 52,
    Icon: MindMapStudentIcon,
  },
  {
    id: 'quiz',
    label: '퀴즈',
    title: '퀴즈 · 문제 은행',
    body: '교안 단위로 퀴즈를 구성하고 퀴즈를를 관리합니다. 학생은 교안 관련 퀴즈에 응시하고 채점 결과를 연결된 교안과 함께 한 눈에 확인합니다.',
    angle: 168,
    Icon: MindMapQuizIcon,
  },
]

const RADIUS = 40
/** 로고(중앙)와 겹치지 않도록 간선 안쪽·바깥 반경 (viewBox % 기준) */
const LINE_INNER_RADIUS = 21.5
const LINE_OUTER_RADIUS = 36

/** 말풍선 테두리 밖 흰 강조선 — angle(deg), len(px), delay(ms) */
const POP_LINES = [
  { angle: -88, len: 20, delay: 0 },
  { angle: -62, len: 16, delay: 28 },
  { angle: -38, len: 18, delay: 12 },
  { angle: -14, len: 14, delay: 42 },
  { angle: 12, len: 19, delay: 18 },
  { angle: 36, len: 15, delay: 48 },
  { angle: 58, len: 17, delay: 8 },
  { angle: 82, len: 14, delay: 36 },
  { angle: 108, len: 20, delay: 22 },
  { angle: 132, len: 15, delay: 6 },
  { angle: 158, len: 18, delay: 32 },
  { angle: 182, len: 14, delay: 52 },
  { angle: -118, len: 16, delay: 14 },
  { angle: 204, len: 15, delay: 38 },
]

/** 표창형 흰 반짝이 — angle(deg), size(px), len(바깥 거리), delay(ms) */
const POP_SPARKLES = [
  { angle: -72, size: 13, len: 22, delay: 24 },
  { angle: -28, size: 11, len: 20, delay: 0 },
  { angle: 22, size: 12, len: 24, delay: 40 },
  { angle: 68, size: 10, len: 21, delay: 20 },
  { angle: 118, size: 12, len: 23, delay: 10 },
  { angle: 162, size: 11, len: 20, delay: 34 },
  { angle: -152, size: 10, len: 22, delay: 16 },
  { angle: 198, size: 12, len: 21, delay: 46 },
]

/**
 * @param {number} angleDeg
 * @param {number} [radius]
 * @returns {{ x: number, y: number }}
 */
function polarToPercent(angleDeg, radius = RADIUS) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: 50 + radius * Math.cos(rad),
    y: 50 + radius * Math.sin(rad),
  }
}

export default function LandingMindMap() {
  const lineSegments = MINDMAP_NODES.map((node) => ({
    id: node.id,
    start: polarToPercent(node.angle, LINE_INNER_RADIUS),
    end: polarToPercent(node.angle, LINE_OUTER_RADIUS),
  }))

  return (
    <section id="landing-mindmap" className="landing-mindmap" aria-label="EDU HUB 소개 마인드맵">
      <div className="landing-mindmap__canvas">
        <svg
          className="landing-mindmap__lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {lineSegments.map((seg) => (
            <line
              key={seg.id}
              x1={seg.start.x}
              y1={seg.start.y}
              x2={seg.end.x}
              y2={seg.end.y}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="landing-mindmap__center" aria-hidden="true">
          <img className="landing-mindmap__center-logo" src={eduhubLogo} alt="" />
        </div>

        {MINDMAP_NODES.map((node) => {
          const pos = polarToPercent(node.angle)
          const Icon = node.Icon
          return (
            <div
              key={node.id}
              className="landing-mindmap__node"
              style={{ '--node-x': `${pos.x}%`, '--node-y': `${pos.y}%` }}
            >
              <div className="landing-mindmap__node-wrap">
                <button type="button" className="landing-mindmap__bubble" aria-label={node.label}>
                  <span className="landing-mindmap__bubble-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="landing-mindmap__bubble-content">
                    <span className="landing-mindmap__bubble-title">{node.title}</span>
                    <span className="landing-mindmap__bubble-body">{node.body}</span>
                  </span>
                </button>
                <span className="landing-mindmap__pop-fx" aria-hidden="true">
                  {POP_LINES.map((line, i) => (
                    <span
                      key={`line-${i}`}
                      className="landing-mindmap__pop-line"
                      style={{
                        '--pop-angle': `${line.angle}deg`,
                        '--pop-len': `${line.len}px`,
                        '--pop-delay': `${line.delay}ms`,
                      }}
                    />
                  ))}
                  {POP_SPARKLES.map((s, i) => (
                    <span
                      key={`sparkle-${i}`}
                      className="landing-mindmap__pop-sparkle"
                      style={{
                        '--pop-angle': `${s.angle}deg`,
                        '--pop-len': `${s.len}px`,
                        '--sparkle-size': `${s.size}px`,
                        '--pop-delay': `${s.delay}ms`,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div id="landing-start" className="landing-mindmap__start">
        <div className="landing-mindmap__start-scene">
          <div className="landing-mindmap__start-waves" aria-hidden="true">
            <svg className="landing-mindmap__start-waves-svg landing-mindmap__start-waves-svg--back" viewBox="0 0 1440 240" preserveAspectRatio="none">
              <path d={LANDING_WAVE_BACK_PATH} />
            </svg>
            <svg className="landing-mindmap__start-waves-svg landing-mindmap__start-waves-svg--mid" viewBox="0 0 1440 240" preserveAspectRatio="none">
              <path d={LANDING_WAVE_MID_PATH} />
            </svg>
            <svg className="landing-mindmap__start-waves-svg landing-mindmap__start-waves-svg--front" viewBox="0 0 1440 240" preserveAspectRatio="none">
              <path d={LANDING_WAVE_FRONT_PATH} />
            </svg>
          </div>
          <div className="landing-mindmap__start-boat-wrap">
            <div className="landing-mindmap__start-click-hint" aria-hidden="true">
              <p className="landing-mindmap__start-click-text">
                <span className="landing-mindmap__start-click-accent">C</span>lick!
              </p>
              <span className="landing-mindmap__start-click-arrow" />
            </div>
            <LandingStartLink className="landing-mindmap__start-boat-btn">
              <span className="landing-mindmap__start-boat-visual">
                <svg className="landing-mindmap__start-boat-icon" viewBox="0 0 400 220" aria-hidden="true">
                  <polygon
                    className="landing-mindmap__start-boat-shape"
                    points="68,108 332,108 300,180 100,180"
                  />
                  <rect className="landing-mindmap__start-boat-shape" x="196" y="18" width="10" height="92" rx="2" />
                  <polygon
                    className="landing-mindmap__start-boat-shape"
                    points="206,22 206,102 312,98"
                  />
                </svg>
                <span className="landing-mindmap__start-label">
                  <span className="landing-mindmap__start-label-line">EDU-HUB와 함께하는 여정을</span>
                  <span className="landing-mindmap__start-label-line landing-mindmap__start-label-line--cta">
                    시작하세요
                  </span>
                </span>
              </span>
            </LandingStartLink>
          </div>
        </div>
      </div>
    </section>
  )
}
