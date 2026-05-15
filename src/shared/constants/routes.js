/** 앱 라우트 경로 — 로그인·이동 처리에서 공통 사용 */

export const ROUTES = {
  home: '/',
  professorDashboard: '/professor',
  /** 이메일·카카오 로그인 화면 */
  login: '/login',
  workspace: '/workspace',
  signup: '/signup',
  /** 메일 링크로 진입하는 비밀번호 재설정 (?email=&token= 등 — 백엔드와 쿼리 키 합의) */
  passwordReset: '/reset-password',
  /* 백엔드가 OAuth 성공 후 redirect 시키는 경로 (명세: /oauth2/callback?accessToken=...&refreshToken=...) */
  kakaoCallback: '/oauth2/callback',
  /* 카카오 최초 로그인 시 이름·닉네임 입력 화면 */
  kakaoSignup: '/oauth2/signup',

  professorQuizzes: '/professor/quizzes',
  professorMaterials: '/professor/materials',
  /** `<Route path={ROUTES.professorMaterialViewer} />` — `:materialId` 는 `useParams` */
  professorMaterialViewer: '/professor/materials/:materialId/viewer',

  studentDashboard: '/student',
  studentMaterials: '/student/materials',
  /** `<Route path={ROUTES.studentMaterialViewer} />` */
  studentMaterialViewer: '/student/materials/:materialId/viewer',

  studentQuizMaterials: '/student/quiz/materials',
  /** `<Route path={ROUTES.studentQuizSolve} />` */
  studentQuizSolve: '/student/quiz/:materialId',
  /** `/student/quiz/:materialId` 의 공통 접두 (표시·조립용) */
  studentQuizRoot: '/student/quiz',
}

/**
 * @param {string|number} materialId
 * @returns {string}
 */
export function studentQuizSolvePath(materialId) {
  return `${ROUTES.studentQuizRoot}/${encodeURIComponent(String(materialId))}`
}

/**
 * @param {string|number} materialId
 * @returns {string}
 */
export function studentMaterialViewerPath(materialId) {
  return `${ROUTES.studentMaterials}/${encodeURIComponent(String(materialId))}/viewer`
}

/**
 * @param {string|number} materialId
 * @returns {string}
 */
export function professorMaterialViewerPath(materialId) {
  return `${ROUTES.professorMaterials}/${encodeURIComponent(String(materialId))}/viewer`
}
