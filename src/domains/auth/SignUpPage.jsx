/*회원가입 화면*/

import {
  checkNickname,
  sendEmailCode,
  signup,
  verifyEmailCode,
} from '../../api/auth'

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../shared/constants/routes.js'
import {
  EduHubBookIcon,
  EduHubEyeClosedIcon,
  EduHubEyeOpenIcon,
} from '../../shared/icons/eduHubIcons.jsx'
import {
  DISPLAY_NICKNAME_HINT,
  DISPLAY_NICKNAME_MAX,
  isValidDisplayNickname,
  isValidSignupUsername,
} from '../../shared/validation/signUpProfile.js'
import PrivacyPolicyModal from './PrivacyPolicyModal.jsx'
import './SignUpPage.css'


const MAIL_CODE_TIMER_SECONDS = 5 * 60

function isValidEmail(value) {
  const v = value.trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function formatCountdownMmSs(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function isValidSignUpPassword(value) {
  if (value.length < 8 || value.length > 20) return false
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(value)) return false
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) return false
  return true
}

function nameFieldStatus(value) {
  if (!value) return 'none'
  return isValidSignupUsername(value) ? 'ok' : 'bad'
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

export default function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('')
  const [nicknameChecking, setNicknameChecking] = useState(false)
  const [email, setEmail] = useState('')
  const [mailSent, setMailSent] = useState(false)
  const [mailSending, setMailSending] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [codeVerifying, setCodeVerifying] = useState(false)
  const [codeVerifyMessage, setCodeVerifyMessage] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [codeTimerSeconds, setCodeTimerSeconds] = useState(0)

  const mailVerified = mailSent && codeVerified
  const codeTimerActive = codeTimerSeconds > 0

  useEffect(() => {
    if (!codeTimerActive) return undefined
    const timerId = window.setInterval(() => {
      setCodeTimerSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [codeTimerActive])

  const nameStatus = nameFieldStatus(name)
  const nickStatus = !nicknameCheckMessage ? 'none' : nicknameChecked ? 'ok' : 'bad'
  const passwordStatus = passwordFieldStatus(password)
  const passwordConfirmStatus = passwordConfirmFieldStatus(password, passwordConfirm)
  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm

  const canSubmit =
    isValidSignupUsername(name) &&
    isValidDisplayNickname(nickname) &&
    nicknameChecked &&
    isValidEmail(email) &&
    mailSent &&
    mailVerified &&
    isValidSignUpPassword(password) &&
    password === passwordConfirm &&
    agreePrivacy

  const handleSendMail = async () => {
    if (!isValidEmail(email)) {
      window.alert('이메일 형식이 올바르지 않습니다.')
      return
    }
    if (mailSending) return
    setMailSending(true)
    setCodeVerifyMessage('')
    try {
      await sendEmailCode(email)
      setMailSent(true)
      setCodeVerified(false)
      setVerifyCode('')
      setCodeTimerSeconds(MAIL_CODE_TIMER_SECONDS)
    } catch (error) {
      const message = error.response?.data?.message
      window.alert(message || '인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setMailSending(false)
    }
  }

  const handleVerifyCode = async () => {
    if (codeVerified) return
    if (!mailSent) {
      window.alert('먼저 인증번호 받기를 눌러 주세요.')
      return
    }
    if (!/^[0-9]{6}$/.test(verifyCode.trim())) {
      window.alert('인증번호 6자리를 입력해 주세요.')
      return
    }
    if (codeVerifying) return
    setCodeVerifying(true)
    setCodeVerifyMessage('')
    try {
      await verifyEmailCode(email, verifyCode.trim())
      setCodeVerified(true)
    } catch (error) {
      const message = error.response?.data?.message
      setCodeVerified(false)
      setCodeVerifyMessage(message || '인증번호가 일치하지 않습니다.')
    } finally {
      setCodeVerifying(false)
    }
  }

  const handleCheckNickname = async () => {
    if (!isValidDisplayNickname(nickname)) {
      setNicknameChecked(false)
      setNicknameCheckMessage(DISPLAY_NICKNAME_HINT)
      return
    }
    if (nicknameChecking) return
    setNicknameChecking(true)
    setNicknameCheckMessage('')
    try {
      const res = await checkNickname(nickname.trim())
      const available = res?.data?.data?.available
      if (available) {
        setNicknameChecked(true)
        setNicknameCheckMessage('사용 가능한 닉네임입니다.')
      } else {
        setNicknameChecked(false)
        setNicknameCheckMessage('이미 사용 중인 닉네임입니다.')
      }
    } catch (error) {
      setNicknameChecked(false)
      const message = error.response?.data?.message
      setNicknameCheckMessage(message || '닉네임 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setNicknameChecking(false)
    }
  }

  const handleNicknameChange = (e) => {
    setNickname(e.target.value)
    setNicknameChecked(false)
    setNicknameCheckMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidSignupUsername(name)) {
      window.alert('이름은 2~20자이며, 숫자·한글·영문·공백만 사용할 수 있습니다.')
      return
    }
    if (!isValidDisplayNickname(nickname)) {
      window.alert(DISPLAY_NICKNAME_HINT)
      return
    }
    if (!nicknameChecked) {
      window.alert('닉네임 중복 확인을 진행해 주세요.')
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
    if (!isValidSignUpPassword(password)) {
      window.alert('비밀번호는 영문, 숫자, 특수문자를 모두 포함한 8~20자로 입력해 주세요.')
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
  
    try {
      await signup({
        username: name.trim(),
        nickname: nickname.trim(),
        email,
        password,
        passwordConfirm,
      })
      window.alert('가입이 완료되었습니다.')
      navigate(ROUTES.login)
    } catch (error) {
      const message = error.response?.data?.message
      const errorCode = error.response?.data?.errorCode
      if (error.response?.status === 403 && errorCode === 'EMAIL_NOT_VERIFIED') {
        window.alert(message || '이메일 인증을 완료한 뒤 다시 시도해 주세요.')
        return
      }
      window.alert(message || '회원가입 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="edu-signup">
      <div className="edu-signup__logo-corner">
        <Link to={ROUTES.login} className="edu-signup__brand" aria-label="EDU HUB, 로그인으로">
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
            <div className="edu-signup__input-wrap">
              <input
                className="edu-signup__input"
                name="name"
                autoComplete="name"
                placeholder="이름을 입력하세요"
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={nameStatus === 'bad'}
              />
              <SignUpFieldStatusIcon status={nameStatus} />
            </div>
            <p className="edu-signup__hint">가입 시 등록되는 이름입니다. 2~20자, 숫자·한글·영문·공백</p>
          </label>

          <div className="edu-signup__field edu-signup__field--narrow">
            <span className="edu-signup__label">닉네임</span>
            <div className="edu-signup__nickname-row">
              <div className="edu-signup__input-wrap edu-signup__input-wrap--grow">
                <input
                  className="edu-signup__input"
                  name="nickname"
                  autoComplete="nickname"
                  placeholder="닉네임"
                  maxLength={DISPLAY_NICKNAME_MAX}
                  value={nickname}
                  onChange={handleNicknameChange}
                  aria-invalid={nickStatus === 'bad'}
                />
                <SignUpFieldStatusIcon status={nickStatus} />
              </div>
              <button
                type="button"
                className="btn btn--surface btn--sm edu-signup__nickname-check-btn"
                disabled={!isValidDisplayNickname(nickname) || nicknameChecking || nicknameChecked}
                onClick={handleCheckNickname}
              >
                {nicknameChecked ? '확인 완료' : nicknameChecking ? '확인 중…' : '중복 확인'}
              </button>
            </div>
            {nicknameCheckMessage ? (
              <p
                className={`edu-signup__hint ${nicknameChecked ? 'edu-signup__hint--ok' : 'edu-signup__hint--sent'}`}
                role={nicknameChecked ? undefined : 'alert'}
              >
                {nicknameCheckMessage}
              </p>
            ) : (
              <p className="edu-signup__hint">{DISPLAY_NICKNAME_HINT}</p>
            )}
          </div>

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
                  onClick={handleSendMail}
                >
                  {mailSending ? '발송 중…' : mailSent ? '재발송' : '인증번호 받기'}
                </button>
                {codeTimerActive ? (
                  <span
                    className="edu-signup__code-timer"
                    role="timer"
                    aria-live="polite"
                    aria-label={`인증번호 유효 시간 ${formatCountdownMmSs(codeTimerSeconds)}`}
                  >
                    {formatCountdownMmSs(codeTimerSeconds)}
                  </span>
                ) : null}
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
                    onClick={handleVerifyCode}
                  >
                    {codeVerifying ? '확인 중…' : '확인'}
                  </button>
                </div>
              </div>
            </div>
            {codeVerifyMessage ? (
              <p className="edu-signup__hint edu-signup__hint--sent" role="alert">
                {codeVerifyMessage}
              </p>
            ) : mailSent ? (
              <p className="edu-signup__hint edu-signup__hint--sent">확인 메일이 전송되었습니다.</p>
            ) : null}
          </div>

          <label className="edu-signup__field edu-signup__field--narrow">
            <span className="edu-signup__label">비밀번호</span>
            <div className="edu-signup__input-wrap edu-signup__input-wrap--password">
              <input
                className="edu-signup__input"
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="비밀번호"
                maxLength={20}
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
            <p className="edu-signup__hint">영문·숫자·특수문자를 모두 포함한 8~20자</p>
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
                  maxLength={20}
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
                      setPrivacyModalOpen(true)
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
      <PrivacyPolicyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
    </div>
  )
}
