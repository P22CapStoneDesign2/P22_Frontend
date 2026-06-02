/** EDU HUB 로그인·브랜딩용 아이콘 */

import eduhubLogo from '../../assets/eduhub_logo.png'

export function EduHubBookIcon() {
  return (
    <img
      className="edu-login__brand-icon"
      src={eduhubLogo}
      alt=""
      draggable={false}
      decoding="async"
    />
  )
}

export function EduHubProfessorIcon() {
  return (
    <svg className="edu-login__role-icon" width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden>
      <ellipse cx="24" cy="41" rx="13" ry="5" fill="currentColor" opacity="0.12" />
      {/* 학위모 상단 */}
      <path d="M24 7l13 6-13 6-13-6 13-6z" fill="currentColor" opacity="0.95" />
      {/* 학위모 띠 */}
      <path
        d="M11 14h26v4a2 2 0 01-2 2H13a2 2 0 01-2-2v-4z"
        fill="currentColor"
        opacity="0.88"
      />
      {/* 태슬 */}
      <circle cx="36.5" cy="15" r="1.8" fill="currentColor" opacity="0.75" />
      <path d="M36.5 15v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
      {/* 얼굴 */}
      <circle cx="24" cy="24" r="9" fill="currentColor" opacity="0.92" />
      {/* 안경 */}
      <ellipse cx="19" cy="23" rx="4.2" ry="3.8" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.95" />
      <ellipse cx="29" cy="23" rx="4.2" ry="3.8" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.95" />
      <path d="M23.2 23h1.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      {/* 눈 */}
      <circle cx="19" cy="23" r="1.3" fill="#fff" opacity="0.95" />
      <circle cx="29" cy="23" r="1.3" fill="#fff" opacity="0.95" />
      {/* 가운 깃 */}
      <path
        d="M14 33c2-2 4-3 10-3s8 1 10 3v6H14v-6z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  )
}

export function EduHubStudentIcon() {
  return (
    <svg className="edu-login__role-icon" width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden>
      <ellipse cx="24" cy="41" rx="13" ry="5" fill="currentColor" opacity="0.12" />
      {/* 상의 */}
      <path
        d="M13 27c2.5-1.5 5-2.5 11-2.5s8.5 1 11 2.5v12H13V27z"
        fill="currentColor"
        opacity="0.42"
      />
      {/* 팔 (책 뒤) */}
      <ellipse cx="14" cy="29.5" rx="3.8" ry="5" fill="currentColor" opacity="0.52" />
      <ellipse cx="34" cy="29.5" rx="3.8" ry="5" fill="currentColor" opacity="0.52" />
      {/* 머리 · 얼굴 */}
      <circle cx="24" cy="18.5" r="8.5" fill="currentColor" opacity="0.9" />
      <circle cx="19.5" cy="17.5" r="1.5" fill="#fff" opacity="0.95" />
      <circle cx="28.5" cy="17.5" r="1.5" fill="#fff" opacity="0.95" />
      {/* 책 (양손으로 든 앞쪽) */}
      <rect
        x="13"
        y="27.5"
        width="22"
        height="13"
        rx="1.5"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.15"
        opacity="0.98"
      />
      <path d="M24 27.5v13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function EduHubUserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" strokeLinecap="round" />
    </svg>
  )
}

export function EduHubKeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="8" cy="16" r="3" />
      <path d="M11 13l8-8M15 9l2 2M18 6l2 2" strokeLinecap="round" />
    </svg>
  )
}

/** 비밀번호 숨김 상태 — 클릭 시 표시 (테두리만: 안쪽 원과 이중으로 안 보이게) */
export function EduHubEyeOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        d="M2 12s3.5-6.5 10-6.5 10 6.5 10 6.5-3.5 6.5-10 6.5S2 12 2 12z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** 비밀번호 표시 중 — 클릭 시 숨김 */
export function EduHubEyeClosedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 01-4.24-4.24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1 1l22 22" strokeLinecap="round" />
      <path d="M9 9a3 3 0 004 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EduHubKakaoIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 9c-6.6 0-12 4.1-12 9.2 0 3.2 2.1 6 5.2 7.6l-1.2 4.4c-.1.4.3.7.7.5l5.2-2.8c.7.1 1.4.2 2.1.2 6.6 0 12-4.1 12-9.2S28.6 9 22 9z"
        fill="#000"
        opacity="0.9"
      />
    </svg>
  )
}
