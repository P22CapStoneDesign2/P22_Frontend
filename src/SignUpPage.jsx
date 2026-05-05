import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from './shared/constants/routes.js'
import {
  EduHubBookIcon,
  EduHubEyeClosedIcon,
  EduHubEyeOpenIcon,
} from './shared/icons/eduHubIcons.jsx'
import './SignUpPage.css'


function isValidEmail(value) {
  const v = value.trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function isValidNickname(value) {
  if (value.length < 3 || value.length > 8) return false
  return /^[0-9A-Za-z가-힣]+$/.test(value)
}

function isValidSignUpPassword(value) {
  if (value.length < 4 || value.length > 12) return false
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(value)) return false
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) return false
  return true
}

function nicknameFieldStatus(value) {
  if (!value) return 'none'
  return isValidNickname(value) ? 'ok' : 'bad'
}

function passwordFieldStatus(value) {
  if (!value) return 'none'
  return isValidSignUpPassword(value) ? 'ok' : 'bad'
}

/** 일치 + 비밀번호 규칙 통과 시에만 ok */
function passwordConfirmFieldStatus(password, passwordConfirm) {
  if (!passwordConfirm) return 'none'
  if (password === passwordConfirm && isValidSignUpPassword(password)) return 'ok'
  return 'bad'
}

function SignUpFieldStatusIcon({ status }) {
  if (status === 'none') return null
  const ok = status === 'ok'
  return (
    <span
      className={`edu-signup__field-status ${ok ? 'edu-signup__field-status--ok' : 'edu-signup__field-status--bad'}`}
      aria-hidden="true"
    >
      {ok ? '✓' : '×'}
    </span>
  )
}

const PRIVACY_POLICY_TEXT = `EDU HUB 개인정보 처리 방침 (요약)

1. 수집 항목: 이름, 이메일, 닉네임 등 서비스 제공에 필요한 최소 정보
2. 이용 목적: 회원 식별, 강의·퀴즈 서비스 운영, 공지 전달
3. 보유 기간: 회원 탈퇴 시 지체 없이 파기(법령에 따른 예외는 제외)
4. 동의 철회: 언제든지 동의를 철회할 수 있으며, 철회 시 일부 서비스 이용이 제한될 수 있습니다.

(실제 서비스 연동 시 법무 검토한 전문을 넣어 주세요.)`

export default function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mailSent, setMailSent] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  const mailVerified = mailSent && codeVerified

  const nickStatus = nicknameFieldStatus(nickname)
  const passwordStatus = passwordFieldStatus(password)
  const passwordConfirmStatus = passwordConfirmFieldStatus(password, passwordConfirm)
  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm

  const canSubmit =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    mailSent &&
    mailVerified &&
    isValidNickname(nickname) &&
    isValidSignUpPassword(password) &&
    password === passwordConfirm &&
    agreePrivacy

  const handleSendMail = () => {
    if (!isValidEmail(email)) {
      window.alert('이메일 형식이 올바르지 않습니다.')
      return
    }
    setMailSent(true)
    setCodeVerified(false)
    setVerifyCode('')
  }

  const handleVerifyCode = () => {
    if (!mailSent) {
      window.alert('먼저 인증번호 받기를 눌러 주세요.')
      return
    }
    if (!/^[0-9]{6}$/.test(verifyCode.trim())) {
      window.alert('인증번호 6자리를 입력해 주세요.')
      return
    }
    setCodeVerified(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      window.alert('이름을 입력해 주세요.')
      return
    }
    if (!isValidEmail(email)) {
      window.alert('이메일 형식이 올바르지 않습니다.')
      return
    }
    if (!mailSent) {
      window.alert('이메일 인증을 진행해 주세요.')
      return
    }
    if (!mailVerified) {
      window.alert('인증번호를 확인해 주세요.')
      return
    }
    if (!isValidNickname(nickname)) {
      window.alert('닉네임은 특수문자를 제외한 3~8자로 입력해 주세요.')
      return
    }
    if (!isValidSignUpPassword(password)) {
      window.alert('비밀번호는 영문, 숫자, 특수문자를 모두 포함한 4~12자로 입력해 주세요.')
      return
    }
    if (password !== passwordConfirm) {
      window.alert('비밀번호가 일치하지 않습니다.')
      return
    }
    if (!agreePrivacy) {
      window.alert('개인정보 활용에 동의해 주세요.')
      return
    }
    window.alert('가입이 완료되었습니다.')
    navigate(ROUTES.home)
  }

  const sendCodeDisabled = mailVerified

  return (
    <div className="edu-signup">
      <div className="edu-signup__logo-corner">
        <Link to={ROUTES.home} className="edu-signup__brand" aria-label="EDU HUB, 로그인으로">
          <EduHubBookIcon />
        </Link>
      </div>

      <div className="edu-signup__layout">
        <h1 className="edu-signup__welcome">환영합니다! 👋</h1>

        <form className="edu-signup__card" noValidate onSubmit={handleSubmit}>
          <div className="edu-signup__field">
            <span className="edu-signup__label">직책</span>
            <div className="edu-signup__segment" role="group" aria-label="직책 (교수로 고정)">
              <span className="edu-signup__segment-current" aria-current="true">
                교수
              </span>
              <button
                type="button"
                className="edu-signup__segment-btn edu-signup__segment-btn--disabled"
                disabled
                aria-disabled="true"
                title="현재 학생 회원가입은 지원하지 않습니다"
              >
                학생
              </button>
            </div>
          </div>

          <label className="edu-signup__field edu-signup__field--narrow">
            <span className="edu-signup__label">이름</span>
            <input
              className="edu-signup__input"
              name="name"
              autoComplete="name"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="edu-signup__field">
            <span className="edu-signup__label">아이디(메일주소)</span>
            <div className="edu-signup__mail-verify-block">
              <div className="edu-signup__email-row edu-signup__email-row--mail-line">
                <input
                  className="edu-signup__input edu-signup__input--grow"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="example@school.ac.kr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn--primary btn--sm edu-signup__send-code-btn"
                  disabled={sendCodeDisabled}
                  onClick={handleSendMail}
                >
                  인증번호 받기
                </button>
                {mailSent ? (
                  <span className="edu-signup__sent-mark" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </div>
              <div className="edu-signup__code-line">
                <div className="edu-signup__code-confirm-cluster">
                  <div className="edu-signup__input-wrap edu-signup__input-wrap--verify-inline">
                    <input
                      className="edu-signup__input edu-signup__input--verify-code"
                      inputMode="numeric"
                      name="verifyCode"
                      autoComplete="one-time-code"
                      maxLength={6}
                      aria-label="인증번호"
                      placeholder="인증번호"
                      value={verifyCode}
                      onChange={(e) => {
                        setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        setCodeVerified(false)
                      }}
                    />
                    <span className={`edu-signup__check ${codeVerified ? 'edu-signup__check--ok' : ''}`} aria-hidden>
                      {codeVerified ? '✓' : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--surface btn--sm edu-signup__verify-confirm-btn"
                    disabled={codeVerified || !mailSent}
                    onClick={handleVerifyCode}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
            {mailSent ? (
              <p className="edu-signup__hint edu-signup__hint--sent">확인 메일이 전송되었습니다.</p>
            ) : null}
          </div>

          <label className="edu-signup__field edu-signup__field--narrow">
            <span className="edu-signup__label">닉네임</span>
            <div className="edu-signup__input-wrap">
              <input
                className="edu-signup__input"
                name="nickname"
                autoComplete="username"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                aria-invalid={nickStatus === 'bad'}
              />
              <SignUpFieldStatusIcon status={nickStatus} />
            </div>
            <p className="edu-signup__hint">특수문자를 제외한 3~8자</p>
          </label>

          <label className="edu-signup__field edu-signup__field--narrow">
            <span className="edu-signup__label">비밀번호</span>
            <div className="edu-signup__input-wrap edu-signup__input-wrap--password">
              <input
                className="edu-signup__input"
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={passwordStatus === 'bad'}
              />
              <button
                type="button"
                className="edu-signup__password-toggle"
                aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                aria-pressed={passwordVisible}
                onClick={() => setPasswordVisible((v) => !v)}
              >
                {passwordVisible ? <EduHubEyeClosedIcon /> : <EduHubEyeOpenIcon />}
              </button>
              <SignUpFieldStatusIcon status={passwordStatus} />
            </div>
            <p className="edu-signup__hint">영문·숫자·특수문자를 모두 포함한 4~12자</p>
          </label>

          <label className="edu-signup__field edu-signup__field--confirm-row">
            <span className="edu-signup__label">비밀번호 확인</span>
            <div className="edu-signup__confirm-side-row">
              <div className="edu-signup__input-wrap edu-signup__input-wrap--password">
                <input
                  className="edu-signup__input"
                  type={passwordConfirmVisible ? 'text' : 'password'}
                  name="passwordConfirm"
                  autoComplete="new-password"
                  placeholder="비밀번호 다시 입력"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  aria-invalid={passwordConfirmStatus === 'bad'}
                  aria-describedby={passwordMismatch ? 'signup-password-mismatch' : undefined}
                />
                <button
                  type="button"
                  className="edu-signup__password-toggle"
                  aria-label={passwordConfirmVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                  aria-pressed={passwordConfirmVisible}
                  onClick={() => setPasswordConfirmVisible((v) => !v)}
                >
                  {passwordConfirmVisible ? <EduHubEyeClosedIcon /> : <EduHubEyeOpenIcon />}
                </button>
                <SignUpFieldStatusIcon status={passwordConfirmStatus} />
              </div>
              {passwordMismatch ? (
                <span
                  id="signup-password-mismatch"
                  className="edu-signup__field-error"
                  role="alert"
                >
                  비밀번호가 일치하지 않습니다
                </span>
              ) : null}
            </div>
          </label>

          <div className="edu-signup__sign-block">
            <div className="edu-signup__field edu-signup__field--row">
              <label className="edu-signup__checkbox-label">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                <span>
                  <button
                    type="button"
                    className="edu-signup__policy-link"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.alert(PRIVACY_POLICY_TEXT)
                    }}
                  >
                    개인정보 활용에 관한 동의
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn--surface btn--md edu-signup__submit"
              disabled={!canSubmit}
            >
              가입하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
