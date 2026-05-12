/* 카카오 최초 로그인 시 실명·닉네임 설정 화면 (1회)
 * - 직책: 학생 고정
 * - 이름 → API `username`, 닉네임 → API `nickname` (서로 다른 필드)
 * - 제출 시 PATCH /api/users/me
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, updateMe } from '../../api/auth'
import { ROUTES } from '../../shared/constants/routes.js'
import { isValidDisplayNickname, isValidSignupUsername } from '../../shared/validation/signUpProfile.js'
import { EduHubBookIcon } from '../../shared/icons/eduHubIcons.jsx'
import './KakaoSignUpPage.css'

function nameFieldStatus(value) {
  if (!value) return 'none'
  return isValidSignupUsername(value) ? 'ok' : 'bad'
}

function nicknameFieldStatus(value) {
  if (!value) return 'none'
  return isValidDisplayNickname(value) ? 'ok' : 'bad'
}

function ProfileFieldStatusIcon({ status }) {
  if (status === 'none') return null
  const ok = status === 'ok'
  return (
    <span
      className={`kakao-signup__field-status ${ok ? 'kakao-signup__field-status--ok' : 'kakao-signup__field-status--bad'}`}
      aria-hidden="true"
    >
      {ok ? '✓' : '×'}
    </span>
  )
}

const PRIVACY_POLICY_TEXT = `EDU HUB 개인정보 처리 방침 (요약)

1. 수집 항목: 카카오 계정의 식별자, 이름, 닉네임 등 서비스 제공에 필요한 최소 정보
2. 이용 목적: 회원 식별, 강의·퀴즈 서비스 운영, 공지 전달
3. 보유 기간: 회원 탈퇴 시 지체 없이 파기(법령에 따른 예외는 제외)
4. 동의 철회: 언제든지 동의를 철회할 수 있으며, 철회 시 일부 서비스 이용이 제한될 수 있습니다.

(실제 서비스 연동 시 법무 검토한 전문을 넣어 주세요.)`

export default function KakaoSignUpPage() {
  const navigate = useNavigate()
  const [realName, setRealName] = useState('')
  const [nickname, setNickname] = useState('')
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getMe()
        if (cancelled) return
        const me = res.data?.data ?? {}
        const u = (me.username ?? '').trim()
        const n = (me.nickname ?? '').trim()
        if (u) setRealName(u)
        if (n) setNickname(n)
      } catch {
        /* 토큰 없음 등 — 입력만 진행 */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const nameStatus = nameFieldStatus(realName)
  const nickStatus = nicknameFieldStatus(nickname)
  const canSubmit =
    isValidSignupUsername(realName) && isValidDisplayNickname(nickname) && agreePrivacy && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidSignupUsername(realName)) {
      window.alert('이름은 2~20자이며, 숫자·한글·영문·공백만 사용할 수 있습니다.')
      return
    }
    if (!isValidDisplayNickname(nickname)) {
      window.alert('닉네임은 특수문자를 제외한 2~20자로 입력해 주세요.')
      return
    }
    if (!agreePrivacy) {
      window.alert('개인정보 활용에 동의해 주세요.')
      return
    }

    try {
      setSubmitting(true)
      await updateMe({
        username: realName.trim(),
        nickname: nickname.trim(),
      })
      window.alert('가입이 완료되었습니다.')
      navigate(ROUTES.workspace, { replace: true })
    } catch (error) {
      const message = error.response?.data?.message
      window.alert(message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="kakao-signup">
      <div className="kakao-signup__logo kakao-signup__logo--left" aria-hidden="true">
        <EduHubBookIcon />
      </div>

      <div className="kakao-signup__layout">
        <h1 className="kakao-signup__welcome">환영합니다! 👋</h1>

        <form className="kakao-signup__card" noValidate onSubmit={handleSubmit}>
          <div className="kakao-signup__field">
            <div className="kakao-signup__row">
              <span className="kakao-signup__label">직책</span>
              <div className="kakao-signup__segment" role="group" aria-label="직책 (학생으로 고정)">
                <span className="kakao-signup__segment-btn kakao-signup__segment-btn--disabled" aria-disabled="true">
                  교수
                </span>
                <span className="kakao-signup__segment-current" aria-current="true">
                  학생
                </span>
              </div>
            </div>
          </div>

          <div className="kakao-signup__field">
            <label className="kakao-signup__row">
              <span className="kakao-signup__label">이름</span>
              <span className="kakao-signup__input-wrap">
                <input
                  className="kakao-signup__input"
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
            <p className="kakao-signup__hint">서비스에 등록되는 실명입니다. 2~20자, 숫자·한글·영문·공백</p>
          </div>

          <div className="kakao-signup__field">
            <label className="kakao-signup__row">
              <span className="kakao-signup__label">닉네임</span>
              <span className="kakao-signup__input-wrap">
                <input
                  className="kakao-signup__input"
                  name="nickname"
                  autoComplete="nickname"
                  placeholder="닉네임"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  aria-invalid={nickStatus === 'bad'}
                />
                <ProfileFieldStatusIcon status={nickStatus} />
              </span>
            </label>
            <p className="kakao-signup__hint">앱에서 보이는 호칭입니다. 특수문자를 제외한 2~20자</p>
          </div>

          <div className="kakao-signup__field kakao-signup__field--agree">
            <label className="kakao-signup__checkbox-label">
              <button
                type="button"
                className="kakao-signup__policy-link"
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

          <div className="kakao-signup__submit-row">
            <button
              type="submit"
              className="btn btn--surface btn--md kakao-signup__submit"
              disabled={!canSubmit}
            >
              가입 완료하기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
