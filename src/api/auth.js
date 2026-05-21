/* 인증·사용자 API
 * API Base URL은 `VITE_API_BASE_URL` → `src/config/env.js` — JWT Bearer는 axios 인터셉터에서 첨부
 */
import instance from './axios';
import { APP_PUBLIC_URL } from '../config/env.js';

/** 백엔드 Redis 키(`ev:*:{email}`)와 동일하게 trim + 소문자 */
export function normalizeSignupEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

/* POST /api/auth/email/send — 이메일 인증번호 발송 (PROF 가입 전)
 * { email } */
export const sendEmailCode = (email) =>
  instance.post('/api/auth/email/send', { email: normalizeSignupEmail(email) });

/* POST /api/auth/email/verify — 이메일 인증번호 검증
 * { email, code } */
export const verifyEmailCode = (email, code) =>
  instance.post('/api/auth/email/verify', {
    email: normalizeSignupEmail(email),
    code: String(code ?? '').trim(),
  });

/* POST /api/auth/profsignup — 교수(PROF) 로컬 회원가입
 * { username(이름), nickname, email, password, passwordConfirm } */
export const signup = (data) =>
  instance.post('/api/auth/profsignup', {
    ...data,
    email: normalizeSignupEmail(data.email),
  });

/* POST /api/auth/usersignup — 학생(USER) 카카오 소셜 가입 완료
 * { pendingToken, username, email, nickname } */
export const userSignup = (data) => instance.post('/api/auth/usersignup', data);

/* GET /api/auth/check-nickname — 닉네임 중복 확인
 * 응답 data.available: true(사용 가능) / false(중복) */
export const checkNickname = (nickname) =>
  instance.get('/api/auth/check-nickname', { params: { nickname } });

/* POST /api/auth/login — { email, password } */
export const login = (email, password) =>
  instance.post('/api/auth/login', {
    email: normalizeSignupEmail(email),
    password,
  });

/**
 * 비밀번호 재설정 메일 요청.
 * `frontendBaseUrl`은 메일 링크 조립용 — 백엔드 DTO 필드명이 다르면 여기 키만 변경.
 * 값은 `.env`의 `VITE_APP_PUBLIC_URL` (끝 `/` 없이, 예: http://localhost:5174)
 */
export const requestPasswordReset = (email) => {
  const body = { email }
  if (APP_PUBLIC_URL) body.frontendBaseUrl = APP_PUBLIC_URL
  return instance.post('/api/auth/password/reset-request', body)
}

/** 메일의 재설정 링크 클릭 후 — 토큰·새 비밀번호 전송 (백엔드 DTO에 맞게 필드명 조정) */
export const confirmPasswordReset = (data) =>
  instance.post('/api/auth/password/reset', data);

/* POST /api/auth/reissue — { refreshToken } */
export const reissue = (refreshToken) =>
  instance.post('/api/auth/reissue', { refreshToken });

/* POST /api/auth/logout (인증 필요) — { refreshToken } */
export const logout = (refreshToken) =>
  instance.post('/api/auth/logout', { refreshToken }, { skipAuthRefresh: true });

/* GET /api/users/me (인증 필요) — 회원 정보 조회
 * 카카오 등에서 username(이름)·nickname(닉네임) 설정 여부 판별에 사용한다.
 */
export const getMe = () => instance.get('/api/users/me');

/* PATCH /api/users/me (인증 필요) — 회원 정보 수정 (username=이름, nickname=닉네임 등) */
export const updateMe = (data) => instance.patch('/api/users/me', data);

/* DELETE /api/users/me (인증 필요) — 회원 탈퇴 */
export const deleteMe = () => instance.delete('/api/users/me');
