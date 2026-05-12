/**
 * Vite 환경 변수 중앙 관리 (VITE_ 접두사 필수).
 * API 연동 시 이 모듈에서만 import.meta.env를 읽도록 유지합니다.
 */
const raw = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL =
  typeof raw === 'string' && raw.length > 0 ? raw.replace(/\/$/, '') : ''
