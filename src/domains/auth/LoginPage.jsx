/*로그인 화면*/
import { login } from '../../api/auth'
import { KAKAO_OAUTH_AUTHORIZATION_URL } from '../../config/env.js'

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../shared/constants/routes.js'
import FindPasswordModal from './FindPasswordModal.jsx'
import {
  EduHubBookIcon,
  EduHubProfessorIcon,
  EduHubStudentIcon,
  EduHubUserIcon,
  EduHubKeyIcon,
  EduHubEyeOpenIcon,
  EduHubEyeClosedIcon,
  EduHubKakaoIcon,
} from '../../shared/icons/eduHubIcons.jsx'
import './LoginPage.css'

function isValidEmail(value) {
  const v = value.trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [findPasswordOpen, setFindPasswordOpen] = useState(false)
  const [role, setRole] = useState('professor')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const professorFormFilled =
    email.trim().length > 0 && password.trim().length > 0

  const handleProfessorSubmit = async (e) => {
      e.preventDefault()
      if (!professorFormFilled) {
        window.alert('아이디와 비밀번호를 모두 입력해 주세요.')
        return
      }
      if (!isValidEmail(email)) {
        window.alert('이메일 형식이 올바르지 않습니다.')
        return
      }
    
      try {
        const res = await login(email, password)
        const { accessToken, refreshToken } = res.data.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        navigate(ROUTES.workspace)
      } catch (error) {
        const message = error.response?.data?.message
        window.alert(message || '로그인 중 오류가 발생했습니다.')
      }
  }

  const handleKakaoClick = () => {
    if (!KAKAO_OAUTH_AUTHORIZATION_URL) {
      window.alert(
        '카카오 로그인 주소가 설정되지 않았습니다. .env의 VITE_API_BASE_URL(또는 VITE_KAKAO_OAUTH_AUTHORIZATION_URL)을 확인해 주세요.',
      )
      return
    }
    window.location.href = KAKAO_OAUTH_AUTHORIZATION_URL
  }

  return (
    <div className="edu-login">
      <FindPasswordModal isOpen={findPasswordOpen} onClose={() => setFindPasswordOpen(false)} />
      <div className="edu-login__panel">
        <header className="edu-login__header">
          <h1 className="edu-login__title" aria-label="EDU HUB">
            <EduHubBookIcon />
          </h1>
        </header>

        <div className="edu-login__role-row" role="group" aria-label="역할 선택">
          <button
            type="button"
            className={`edu-login__role-btn ${role === 'professor' ? 'edu-login__role-btn--active' : ''}`}
            onClick={() => setRole('professor')}
            aria-pressed={role === 'professor'}
          >
            <EduHubProfessorIcon />
            <span className="edu-login__role-label">교수입니다</span>
          </button>
          <button
            type="button"
            className={`edu-login__role-btn ${role === 'student' ? 'edu-login__role-btn--active' : ''}`}
            onClick={() => setRole('student')}
            aria-pressed={role === 'student'}
          >
            <EduHubStudentIcon />
            <span className="edu-login__role-label">학생입니다</span>
          </button>
        </div>

        <section
          className={`edu-login__frame edu-login__frame--${role}`}
          aria-live="polite"
          aria-label={role === 'professor' ? '교수 로그인' : '학생 로그인'}
        >
          {role === 'professor' ? (
            <form className="edu-login__form" noValidate onSubmit={handleProfessorSubmit}>
              <label className="edu-login__field">
                <span className="edu-login__input-icon">
                  <EduHubUserIcon />
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="아이디(메일주소)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="edu-login__field edu-login__field--password">
                <span className="edu-login__input-icon">
                  <EduHubKeyIcon />
                </span>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="edu-login__password-toggle"
                  aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((v) => !v)}
                >
                  {passwordVisible ? <EduHubEyeClosedIcon /> : <EduHubEyeOpenIcon />}
                </button>
              </label>
              <div className="edu-login__row-link">
                <button
                  type="button"
                  className="edu-login__text-link"
                  onClick={() => setFindPasswordOpen(true)}
                >
                  비밀번호 찾기
                </button>
              </div>
              <button type="submit" className="btn btn--surface btn--md btn--block edu-login__submit">
                로그인
              </button>
              <p className="edu-login__footer-action">
                <Link
                  className="edu-login__text-link edu-login__text-link--emphasis edu-login__signup-link"
                  to={ROUTES.signup}
                >
                  아직 EDU-HUB 회원이 아니신가요?
                  <span className="edu-login__footer-arrow" aria-hidden="true">
                    <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
                      <path d="M0 0 L9 5.5 L0 11 Z" />
                    </svg>
                  </span>
                </Link>
              </p>
            </form>
          ) : (
            <div className="edu-login__student">
              <h2 className="edu-login__student-title">로그인</h2>
              <button
                type="button"
                className="edu-login__kakao"
                onClick={handleKakaoClick}
                aria-label="카카오로 로그인"
              >
                <EduHubKakaoIcon />
              </button>
              <p className="edu-login__kakao-hint">카카오 계정으로 로그인</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
