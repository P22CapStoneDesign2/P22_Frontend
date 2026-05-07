/** 앱 라우트 경로 — 로그인·이동 처리에서 공통 사용 */

export const ROUTES = {
  home: '/',
  workspace: '/workspace',
  signup: '/signup',
  /* 백엔드가 OAuth 성공 후 redirect 시키는 경로 (명세: /oauth2/callback?accessToken=...&refreshToken=...) */
  kakaoCallback: '/oauth2/callback',
  /* 카카오 최초 로그인 시 닉네임 입력 화면 */
  kakaoSignup: '/oauth2/signup',
}
