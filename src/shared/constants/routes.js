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
  /* 카카오 신규 유저 가입 완료 화면 — 백엔드가 pendingToken·kakaoName 쿼리로 리다이렉트 */
  kakaoRegister: '/oauth2/register',

  professorQuizzes: '/professor/quizzes',
  professorMaterials: '/professor/materials',
  /** `<Route path={ROUTES.professorMaterialViewer} />` — `:materialId` 는 `useParams` */
  professorMaterialViewer: '/professor/materials/:materialId/viewer',

  studentDashboard: '/student',
  /** 학생 — 과목(수강) 신청 */
  studentCourseApply: '/student/course-apply',
  studentMaterials: '/student/materials',
  /** `<Route path={ROUTES.studentMaterialViewer} />` */
  studentMaterialViewer: '/student/materials/:materialId/viewer',

  studentQuizMaterials: '/student/quiz/materials',
  /** `<Route path={ROUTES.studentQuizSolve} />` */
  studentQuizSolve: '/student/quiz/:materialId',
  /** `/student/quiz/:materialId` 의 공통 접두 (표시·조립용) */
  studentQuizRoot: '/student/quiz',

  /** 관리자(ADMIN) — 교안 수강 신청 관리 */
  adminSubjectAccess: '/admin/subject-access',
  /** 관리자(ADMIN) — 교수 회원가입 승인 */
  adminProfessorSignups: '/admin/professor-signups',
}

/** 교안 목록 — 강의 선택 유지용 query key (학생·교수 공통 키 이름) */
export const STUDENT_MATERIALS_COURSE_QUERY_KEY = 'courseId'

/** 교수 교안 관리 — 강의 선택 유지용 query key */
export const PROFESSOR_MATERIALS_COURSE_QUERY_KEY = 'courseId'

/** 학생 퀴즈 풀이 — 강의(lesson) 선택 유지용 query key */
export const STUDENT_QUIZ_LESSON_QUERY_KEY = 'lessonId'

/**
 * @param {string|number} materialId
 * @param {string} [lessonId] 강의 선택 유지·API 퀴즈 조회용
 * @returns {string}
 */
export function studentQuizSolvePath(materialId, lessonId) {
  const base = `${ROUTES.studentQuizRoot}/${encodeURIComponent(String(materialId))}`
  const lid = typeof lessonId === 'string' ? lessonId.trim() : ''
  if (!lid) return base
  const params = new URLSearchParams({ [STUDENT_QUIZ_LESSON_QUERY_KEY]: lid })
  return `${base}?${params.toString()}`
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
 * @param {string} [courseId] 선택 강의 유지용 query
 * @returns {string}
 */
export function professorMaterialsPath(courseId) {
  const base = ROUTES.professorMaterials
  const id = typeof courseId === 'string' ? courseId.trim() : ''
  if (!id) return base
  const params = new URLSearchParams({ [PROFESSOR_MATERIALS_COURSE_QUERY_KEY]: id })
  return `${base}?${params.toString()}`
}

/**
 * @param {string|number} materialId
 * @param {string} [courseId] 뷰어 종료 시 목록 복귀용
 * @returns {string}
 */
export function professorMaterialViewerPath(materialId, courseId) {
  const base = `${ROUTES.professorMaterials}/${encodeURIComponent(String(materialId))}/viewer`
  const cid = typeof courseId === 'string' ? courseId.trim() : ''
  if (!cid) return base
  const params = new URLSearchParams({ [PROFESSOR_MATERIALS_COURSE_QUERY_KEY]: cid })
  return `${base}?${params.toString()}`
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
