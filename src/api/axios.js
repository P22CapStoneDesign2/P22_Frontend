/*axios 인스턴스 생성, 인터셉터 세팅*/
import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';
import { ROUTES } from '../shared/constants/routes.js';

const instance = axios.create({ baseURL: API_BASE_URL || undefined });

// 요청 인터셉터 - accessToken 자동 첨부
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
const REISSUE_URL = '/api/auth/reissue';

function clearTokensAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = ROUTES.home;
}

// 응답 인터셉터 - 401 시 토큰 재발급 후 재시도
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      // reissue 요청 자체가 401 → 재귀 중단, 로그아웃
      if (originalRequest.url?.includes(REISSUE_URL)) {
        clearTokensAndRedirect();
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true; // 무한 재시도 방지

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            clearTokensAndRedirect();
            return Promise.reject(error);
          }

          const res = await instance.post(REISSUE_URL, { refreshToken });

          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);

        } catch (e) {
          // 재발급도 실패 → 로그아웃 처리
          clearTokensAndRedirect();
          return Promise.reject(e);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;