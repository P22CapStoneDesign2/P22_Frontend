/*axios 인스턴스 생성, 인터셉터 세팅*/
import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';
import { ROUTES } from '../shared/constants/routes.js';

const instance = axios.create({ baseURL: API_BASE_URL || undefined });

const REISSUE_URL = '/api/auth/reissue';

/** 401이어도 access 재발급을 시도하지 않는 URL (공개 인증 API·재발급 자체 등) */
const AUTH_REFRESH_EXCLUDED_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/profsignup',
  '/api/auth/usersignup',
  REISSUE_URL,
  '/api/auth/email/send',
  '/api/auth/email/verify',
  '/api/auth/check-nickname',
  '/api/v1/auth/password/reset-request',
  '/api/v1/auth/password/reset',
  '/api/auth/logout',
])

function requestPathWithoutQuery(config) {
  if (!config?.url) return ''
  const raw = String(config.url).split('?')[0]
  return raw.startsWith('/') ? raw : `/${raw}`
}

function isRefreshSkippedRequest(config) {
  if (!config || config.skipAuthRefresh) return true
  return AUTH_REFRESH_EXCLUDED_PATHS.has(requestPathWithoutQuery(config))
}

function clearTokensAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = ROUTES.home;
}

// 요청 인터셉터 - accessToken 자동 첨부
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터 - 401 시 토큰 재발급 후 재시도
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshSkippedRequest(originalRequest)

    if (shouldRefresh) {
      originalRequest._retry = true; // 동일 요청 무한 재시도 방지

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('no refresh token')
        }
        // 재발급 요청은 인터셉터에서 다시 401 처리하지 않도록 제외(재귀 방지)
        const res = await instance.post(
          REISSUE_URL,
          { refreshToken },
          { skipAuthRefresh: true },
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);

      } catch {
        // 재발급도 실패 → 로그아웃 처리
        clearTokensAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
