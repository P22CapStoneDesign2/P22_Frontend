/** 앱 라우트 경로 — 로그인·이동 처리에서 공통 사용 */

export const ROUTES = {
  /** 앱 진입 — 랜딩(소개) 페이지 */
  home: '/',
  professorDashboard: '/professor',
  /** 로그인 화면 (`home`과 동일 컴포넌트, 북마크용 경로) */
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

  /** 관리자(ADMIN) — 과목 접근 권한 관리 */
  adminSubjectAccess: '/admin/subject-access',
}

/** 학생 교안 목록 — 강의 선택 유지용 query key */
export const STUDENT_MATERIALS_COURSE_QUERY_KEY = 'courseId'

/**
 * @param {string|number} materialId
 * @returns {string}
 */
export function studentQuizSolvePath(materialId) {
  return `${ROUTES.studentQuizRoot}/${encodeURIComponent(String(materialId))}`
}

/**
 * @param {string} attemptId
 * @returns {string}
 */
export function studentQuizResultPath(attemptId) {
  return `${ROUTES.studentQuizRoot}/result/${encodeURIComponent(String(attemptId))}`
}

/**
 * @param {string} [courseId] 선택 강의 유지용 query
 * @returns {string}
 */
export function studentMaterialsPath(courseId) {
  const base = ROUTES.studentMaterials
  const id = typeof courseId === 'string' ? courseId.trim() : ''
  if (!id) return base
  const params = new URLSearchParams({ [STUDENT_MATERIALS_COURSE_QUERY_KEY]: id })
  return `${base}?${params.toString()}`
}

/**
 * @param {string|number} materialId
 * @param {string} [courseId] 뷰어 종료 시 목록 복귀용
 * @returns {string}
 */
export function studentMaterialViewerPath(materialId, courseId) {
  const base = `${ROUTES.studentMaterials}/${encodeURIComponent(String(materialId))}/viewer`
  const cid = typeof courseId === 'string' ? courseId.trim() : ''
  if (!cid) return base
  const params = new URLSearchParams({ [STUDENT_MATERIALS_COURSE_QUERY_KEY]: cid })
  return `${base}?${params.toString()}`
}

/**
 * @param {string|number} materialId
 * @returns {string}
 */
export function professorMaterialViewerPath(materialId) {
  return `${ROUTES.professorMaterials}/${encodeURIComponent(String(materialId))}/viewer`
}

/**
 * @param {string|number} materialId
 * @returns {string}
 */
export function professorQuizCreatePath(materialId) {
  return `${ROUTES.professorMaterials}/${encodeURIComponent(String(materialId))}/quizzes/create`
}

/**
 * @param {string|number} quizId
 * @returns {string}
 */
export function professorQuizEditPath(quizId) {
  return `${ROUTES.professorQuizzes}/${encodeURIComponent(String(quizId))}/edit`
}
