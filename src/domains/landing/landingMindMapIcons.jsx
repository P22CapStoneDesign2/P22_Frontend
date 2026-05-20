import { EduHubProfessorIcon, EduHubStudentIcon } from '../../shared/icons/eduHubIcons.jsx'

export function MindMapIntroIcon() {
  return (
    <svg className="landing-mindmap__node-icon-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="16" fill="currentColor" opacity="0.18" />
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <path
        d="M24 16v2M24 28v4M20 20a4 4 0 118 0c0 2-2 2.5-3 3.5-.8.7-1 1.2-1 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MindMapProfessorIcon() {
  return <EduHubProfessorIcon />
}

export function MindMapStudentIcon() {
  return <EduHubStudentIcon />
}

export function MindMapQuizIcon() {
  return (
    <svg className="landing-mindmap__node-icon-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="8" width="28" height="32" rx="4" fill="currentColor" opacity="0.2" />
      <rect x="10" y="8" width="28" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M16 18h16M16 24h12M16 30h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="32" cy="30" r="5" fill="currentColor" opacity="0.9" />
      <path d="M30.5 30l1 1 2.5-2.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MindMapStartIcon() {
  return (
    <svg className="landing-mindmap__node-icon-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="16" fill="currentColor" opacity="0.18" />
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <path
        d="M21 17l10 7-10 7V17z"
        fill="currentColor"
        opacity="0.92"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
