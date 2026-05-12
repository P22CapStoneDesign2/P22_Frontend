/**
 * 비밀번호 재설정 (메일함 링크 클릭 후 진입)
 *
 * 백엔드가 메일에 넣을 프론트 URL 예시 (쿼리는 팀 합의 후 조정):
 *   {프론트 Origin}{ROUTES.passwordReset}?email={URL인코딩}&token={재설정토큰}
 */
import { confirmPasswordReset } from './api/auth'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from './shared/constants/routes.js'
import { EduHubBookIcon, EduHubEyeClosedIcon, EduHubEyeOpenIcon } from './shared/icons/eduHubIcons.jsx'
import './PasswordResetPage.css'

function isValidSignUpPassword(value) {
  if (value.length < 8 || value.length > 20) return false
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(value)) return false
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) return false
  return true
}

function passwordFieldStatus(value) {
  if (!value) return 'none'
  return isValidSignUpPassword(value) ? 'ok' : 'bad'
}

function passwordConfirmFieldStatus(password, passwordConfirm) {
  if (!passwordConfirm) return 'none'
  if (password === passwordConfirm && isValidSignUpPassword(password)) return 'ok'
  return 'bad'
}

function FieldStatusIcon({ status }) {
  if (status === 'none') return null
  const ok = status === 'ok'
  return (
    <span
      className={`edu-pw-reset__field-status ${ok ? 'edu-pw-reset__field-status--ok' : 'edu-pw-reset__field-status--bad'}`}
      aria-hidden="true"
    >
      {ok ? '✓' : '×'}
    </span>
  )
}

export default function PasswordResetPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { emailFromUrl, tokenFromUrl } = useMemo(() => {
    const email = searchParams.get('email') ?? ''
    const token = searchParams.get('token') ?? ''
    return {
      emailFromUrl: email ? decodeURIComponent(email) : '',
      tokenFromUrl: token ? decodeURIComponent(token) : '',
    }
  }, [searchParams])

  const linkInvalid = !tokenFromUrl

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const pwdStatus = passwordFieldStatus(password)
  const pwdConfirmStatus = passwordConfirmFieldStatus(password, passwordConfirm)
  const canSubmit =
    !linkInvalid &&
    !!emailFromUrl &&
    isValidSignUpPassword(password) &&
    password === passwordConfirm &&
    !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (linkInvalid) return
    if (!emailFromUrl) {
      window.alert('이메일 정보가 없습니다. 메일의 링크를 다시 확인해 주세요.')
      return
    }
    if (!isValidSignUpPassword(password)) {
      window.alert('비밀번호 규칙을 확인해 주세요. (영문·숫자·특수문자 포함 8~20자)')
      return
    }
    if (password !== passwordConfirm) {
      window.alert('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setSubmitting(true)
      await confirmPasswordReset({
        email: emailFromUrl,
        token: tokenFromUrl,
        password,
        passwordConfirm,
      })
      window.alert('비밀번호가 변경되었습니다. 로그인해 주세요.')
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      const message = error.response?.data?.message
      window.alert(message || '비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="edu-pw-reset">
      <div className="edu-pw-reset__logo-corner">
        <Link to={ROUTES.login} className="edu-pw-reset__brand" aria-label="EDU HUB, 로그인으로">
          <EduHubBookIcon />
        </Link>
      </div>

      <div className="edu-pw-reset__layout">
        <header className="edu-pw-reset__header">
          <h1 className="edu-pw-reset__title">비밀번호 재설정</h1>
          <p className="edu-pw-reset__subtitle">
            메일함의 링크를 클릭하면 이 화면으로 이동합니다. 아이디(이메일)는 링크에서 자동으로 채워집니다.
          </p>
          <div className="edu-pw-reset__divider" aria-hidden="true" />
        </header>

        {linkInvalid ? (
          <div className="edu-pw-reset__invalid" role="alert">
            <p>유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 요청해 주세요.</p>
            <Link className="edu-pw-reset__link-login" to={ROUTES.login}>
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <form className="edu-pw-reset__card" noValidate onSubmit={handleSubmit}>
            <label className="edu-pw-reset__field">
              <span className="edu-pw-reset__label">아이디</span>
              <input
                className="edu-pw-reset__input edu-pw-reset__input--readonly"
                type="email"
                readOnly
                autoComplete="username"
                value={emailFromUrl}
                title="메일 링크에서 전달된 이메일"
              />
            </label>

            {!emailFromUrl ? (
              <p className="edu-pw-reset__warn" role="alert">
                이메일이 링크에 없습니다. 백엔드에서 <code>?email=</code> 쿼리를 포함해 주세요.
              </p>
            ) : null}

            <label className="edu-pw-reset__field">
              <span className="edu-pw-reset__label">새 비밀번호</span>
              <div className="edu-pw-reset__input-wrap edu-pw-reset__input-wrap--password">
                <input
                  className="edu-pw-reset__input"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="새 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={pwdStatus === 'bad'}
                />
                <button
                  type="button"
                  className="edu-pw-reset__password-toggle"
                  aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((v) => !v)}
                >
                  {passwordVisible ? <EduHubEyeClosedIcon /> : <EduHubEyeOpenIcon />}
                </button>
                <FieldStatusIcon status={pwdStatus} />
              </div>
              <p className="edu-pw-reset__hint">영문·숫자·특수문자를 모두 포함한 8~20자</p>
            </label>

            <label className="edu-pw-reset__field">
              <span className="edu-pw-reset__label">새 비밀번호 확인</span>
              <div className="edu-pw-reset__input-wrap edu-pw-reset__input-wrap--password">
                <input
                  className="edu-pw-reset__input"
                  type={passwordConfirmVisible ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="새 비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  aria-invalid={pwdConfirmStatus === 'bad'}
                />
                <button
                  type="button"
                  className="edu-pw-reset__password-toggle"
                  aria-label={passwordConfirmVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                  aria-pressed={passwordConfirmVisible}
                  onClick={() => setPasswordConfirmVisible((v) => !v)}
                >
                  {passwordConfirmVisible ? <EduHubEyeClosedIcon /> : <EduHubEyeOpenIcon />}
                </button>
                <FieldStatusIcon status={pwdConfirmStatus} />
              </div>
            </label>

            <div className="edu-pw-reset__actions">
              <button
                type="submit"
                className="btn btn--surface btn--md edu-pw-reset__submit"
                disabled={!canSubmit || !emailFromUrl}
              >
                {submitting ? '처리 중…' : '변경하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
