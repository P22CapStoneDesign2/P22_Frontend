/* 카카오 신규 유저 가입 완료 화면
 * 명세: docs/API-SPEC.md §1-1, §3
 * - 진입: 백엔드가 카카오 OIDC 성공 후 /oauth2/register?pendingToken=...&kakaoName=... 로 리다이렉트
 * - 제출: POST /api/auth/usersignup { pendingToken, username, email, nickname }
 * - 성공 시 응답의 accessToken/refreshToken 저장 후 학생 대시보드로 이동
 *
 * 신규 유저의 진짜 토큰은 이 화면 제출 시점에 비로소 발급된다. 진입 시점엔 pendingToken뿐.
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { checkNickname, userSignup } from '../../api/auth'
import { ROUTES } from '../../shared/constants/routes.js'
import { setStoredUserRole } from '../../shared/auth/roleUtils.js'
import {
  DISPLAY_NICKNAME_HINT,
  DISPLAY_NICKNAME_MAX,
  isValidDisplayNickname,
  isValidSignupUsername,
} from '../../shared/validation/signUpProfile.js'
import { EduHubBookIcon } from '../../shared/icons/eduHubIcons.jsx'
import './KakaoRegisterPage.css'

function isValidEmail(value) {
  const v = value.trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function nameFieldStatus(value) {
  if (!value) return 'none'
  return isValidSignupUsername(value) ? 'ok' : 'bad'
}

function emailFieldStatus(value) {
  if (!value) return 'none'
  return isValidEmail(value) ? 'ok' : 'bad'
}

function ProfileFieldStatusIcon({ status }) {
  if (status === 'none') return null
  const ok = status === 'ok'
  return (
    <span
      className={`kakao-register__field-status ${ok ? 'kakao-register__field-status--ok' : 'kakao-register__field-status--bad'}`}
      aria-hidden="true"
    >
      {ok ? '✓' : '×'}
    </span>
  )
}

const PRIVACY_POLICY_TEXT = `EDU HUB 개인정보 처리 방침 (요약)

1. 수집 항목: 카카오 계정의 식별자, 이름, 닉네임, 이메일 등 서비스 제공에 필요한 최소 정보
2. 이용 목적: 회원 식별, 강의·퀴즈 서비스 운영, 공지 전달
3. 보유 기간: 회원 탈퇴 시 지체 없이 파기(법령에 따른 예외는 제외)
4. 동의 철회: 언제든지 동의를 철회할 수 있으며, 철회 시 일부 서비스 이용이 제한될 수 있습니다.

(실제 서비스 연동 시 법무 검토한 전문을 넣어 주세요.)`

export default function KakaoRegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  /* 쿼리는 React state로만 보관 — pendingToken은 10분 수명, localStorage에 저장하지 않는다 */
  const pendingToken = useMemo(() => searchParams.get('pendingToken') ?? '', [searchParams])
  const kakaoName = useMemo(() => searchParams.get('kakaoName') ?? '', [searchParams])

  const [realName, setRealName] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('')
  const [nicknameChecking, setNicknameChecking] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  /* pendingToken 없으면 비정상 진입 — 안내 후 로그인 화면으로 */
  useEffect(() => {
    if (!pendingToken) {
      window.alert('카카오 가입 정보를 찾을 수 없습니다. 카카오 로그인을 다시 시도해 주세요.')
      navigate(ROUTES.login, { replace: true })
    }
  }, [pendingToken, navigate])

  /* kakaoName으로 이름 pre-fill (사용자가 수정 가능) */
  useEffect(() => {
    if (kakaoName) setRealName(kakaoName)
  }, [kakaoName])

  const nameStatus = nameFieldStatus(realName)
  const emailStatus = emailFieldStatus(email)
  const nickStatus = !nicknameCheckMessage ? 'none' : nicknameChecked ? 'ok' : 'bad'

  const canSubmit =
    isValidSignupUsername(realName) &&
    isValidEmail(email) &&
    isValidDisplayNickname(nickname) &&
    nicknameChecked &&
    agreePrivacy &&
    !submitting

  const handleNicknameChange = (e) => {
    setNickname(e.target.value)
    setNicknameChecked(false)
    setNicknameCheckMessage('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidSignupUsername(realName)) {
      window.alert('이름은 2~20자이며, 숫자·한글·영문·공백만 사용할 수 있습니다.')
      return
    }
    if (!isValidEmail(email)) {
      window.alert('이메일 형식이 올바르지 않습니다.')
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
    if (!agreePrivacy) {
      window.alert('개인정보 활용에 동의해 주세요.')
      return
    }

    try {
      setSubmitting(true)
      const res = await userSignup({
        pendingToken,
        username: realName.trim(),
        email: email.trim(),
        nickname: nickname.trim(),
      })
      const { accessToken, refreshToken } = res?.data?.data ?? {}
      if (!accessToken || !refreshToken) {
        throw new Error('서버 응답에 토큰이 없습니다.')
      }
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setStoredUserRole('USER')
      window.alert('가입이 완료되었습니다.')
      navigate(ROUTES.studentDashboard, { replace: true })
    } catch (error) {
      const status = error?.response?.status
      const message = error?.response?.data?.message
      if (status === 401) {
        window.alert(message || '소셜 가입 정보가 만료되었거나 유효하지 않습니다. 카카오 로그인을 다시 시도해 주세요.')
        navigate(ROUTES.login, { replace: true })
        return
      }
      if (status === 409) {
        /* 이메일/닉네임 중복 — 서버 메시지를 그대로 노출. 닉네임 중복이면 사용자가 다시 확인하도록 유도. */
        if (message?.includes('닉네임')) {
          setNicknameChecked(false)
          setNicknameCheckMessage(message)
        }
        window.alert(message || '이미 사용 중인 정보입니다.')
        return
      }
      window.alert(message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="kakao-register">
      <div className="kakao-register__logo kakao-register__logo--left" aria-hidden="true">
        <EduHubBookIcon />
      </div>

      <div className="kakao-register__layout">
        <h1 className="kakao-register__welcome">환영합니다! 👋</h1>

        <form className="kakao-register__card" noValidate onSubmit={handleSubmit}>
          <div className="kakao-register__field">
            <div className="kakao-register__row">
              <span className="kakao-register__label">직책</span>
              <div className="kakao-register__segment" role="group" aria-label="직책 (학생으로 고정)">
                <span className="kakao-register__segment-btn kakao-register__segment-btn--disabled" aria-disabled="true">
                  교수
                </span>
                <span className="kakao-register__segment-current" aria-current="true">
                  학생
                </span>
              </div>
            </div>
          </div>

          <div className="kakao-register__field">
            <label className="kakao-register__row">
              <span className="kakao-register__label">이름</span>
              <span className="kakao-register__input-wrap">
                <input
                  className="kakao-register__input"
                  name="realName"
                  autoComplete="name"
                  placeholder="실명"
                  maxLength={20}
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  aria-invalid={nameStatus === 'bad'}
                />
                <ProfileFieldStatusIcon status={nameStatus} />
              </span>
            </label>
            <p className="kakao-register__hint">서비스에 등록되는 실명입니다. 2~20자, 숫자·한글·영문·공백</p>
          </div>

          <div className="kakao-register__field">
            <label className="kakao-register__row">
              <span className="kakao-register__label">이메일</span>
              <span className="kakao-register__input-wrap">
                <input
                  className="kakao-register__input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={emailStatus === 'bad'}
                />
                <ProfileFieldStatusIcon status={emailStatus} />
              </span>
            </label>
            <p className="kakao-register__hint">로그인 알림·공지 수신에 사용됩니다.</p>
          </div>

          <div className="kakao-register__field">
            <div className="kakao-register__row">
              <span className="kakao-register__label">닉네임</span>
              <span className="kakao-register__input-wrap">
                <input
                  className="kakao-register__input"
                  name="nickname"
                  autoComplete="nickname"
                  placeholder="닉네임"
                  maxLength={DISPLAY_NICKNAME_MAX}
                  value={nickname}
                  onChange={handleNicknameChange}
                  aria-invalid={nickStatus === 'bad'}
                />
                <ProfileFieldStatusIcon status={nickStatus} />
              </span>
              <button
                type="button"
                className="kakao-register__nickname-action"
                onClick={handleCheckNickname}
                disabled={
                  nicknameChecking || !isValidDisplayNickname(nickname) || nicknameChecked
                }
              >
                {nicknameChecked ? '확인 완료' : nicknameChecking ? '확인 중…' : '중복 확인'}
              </button>
            </div>
            <p className="kakao-register__hint">
              {nicknameCheckMessage || DISPLAY_NICKNAME_HINT}
            </p>
          </div>

          <div className="kakao-register__field kakao-register__field--agree">
            <label className="kakao-register__checkbox-label">
              <button
                type="button"
                className="kakao-register__policy-link"
                onClick={() => window.alert(PRIVACY_POLICY_TEXT)}
              >
                개인정보 활용에 관한 동의
              </button>
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
              />
            </label>
          </div>

          <div className="kakao-register__submit-row">
            <button
              type="submit"
              className="btn btn--surface btn--md kakao-register__submit"
              disabled={!canSubmit}
            >
              {submitting ? '가입 중…' : '가입 완료하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
