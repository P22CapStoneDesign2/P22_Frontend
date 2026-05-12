/* 인증·사용자 API
 * 명세 기준: Base URL https://api.example.com, JWT Bearer (axios 인터셉터에서 자동 첨부)
 */
import instance from './axios';

/* POST /api/auth/signup — { username, email, password, passwordConfirm } */
export const signup = (data) => instance.post('/api/auth/signup', data);

/* POST /api/auth/login — { email, password } */
export const login = (email, password) =>
  instance.post('/api/auth/login', { email, password });

/** 비밀번호 재설정 메일 요청 — 백엔드 경로는 합의 후 수정 */
export const requestPasswordReset = (email) =>
  instance.post('/api/auth/password/reset-request', { email });

/* POST /api/auth/reissue — { refreshToken } */
export const reissue = (refreshToken) =>
  instance.post('/api/auth/reissue', { refreshToken });

/* POST /api/auth/logout (인증 필요) — { refreshToken } */
export const logout = (refreshToken) =>
  instance.post('/api/auth/logout', { refreshToken });

/* GET /api/users/me (인증 필요) — 회원 정보 조회
 * 카카오 최초 로그인 후 username(닉네임) 존재 여부로 신규/기존 사용자 판별에 사용한다.
 */
export const getMe = () => instance.get('/api/users/me');

/* PATCH /api/users/me (인증 필요) — 회원 정보 수정 (닉네임 등 부분 갱신) */
export const updateMe = (data) => instance.patch('/api/users/me', data);

/* DELETE /api/users/me (인증 필요) — 회원 탈퇴 */
export const deleteMe = () => instance.delete('/api/users/me');
