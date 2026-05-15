import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../shared/constants/routes.js'
import LoginPage from '../domains/auth/LoginPage.jsx'
import SignUpPage from '../domains/auth/SignUpPage.jsx'
import KakaoCallbackPage from '../domains/auth/KakaoCallbackPage.jsx'
import KakaoSignUpPage from '../domains/auth/KakaoSignUpPage.jsx'
import PasswordResetPage from '../domains/auth/PasswordResetPage.jsx'
import LegacyAppShell from '../shared/LegacyAppShell.jsx'
import EduHubCommonShell from './EduHubCommonShell.jsx'
import ProfessorDashboardPage from '../domains/professor/ProfessorDashboardPage.jsx'
import StudentDashboardPage from '../domains/student/StudentDashboardPage.jsx'
import QuizManagementPage from '../domains/professor/quiz-management/QuizManagementPage.jsx'
import QuizCreatePage from '../domains/professor/quiz-create/QuizCreatePage.jsx'
import QuizEditPage from '../domains/professor/quiz-edit/QuizEditPage.jsx'
import QuizMaterialSelectPage from '../domains/student/quiz-material-select/QuizMaterialSelectPage.jsx'
import QuizSolvePage from '../domains/student/quiz-solve/QuizSolvePage.jsx'
import QuizResultPage from '../domains/student/quiz-result/QuizResultPage.jsx'
import ProfessorMaterialPage from '../domains/professor/materials/ProfessorMaterialPage.jsx'
import MaterialPdfViewerPage from '../domains/shared/material-viewer/MaterialPdfViewerPage.jsx'
import StudentMaterialsPage from '../domains/student/materials/StudentMaterialsPage.jsx'

/**
 * EDU HUB 앱 라우팅
 *
 * - /login : 로그인 (ROUTES.login)
 * - /signup : 일반 회원가입 (ROUTES.signup)
 * - /reset-password : 메일 링크 비밀번호 재설정 (ROUTES.passwordReset)
 * - /oauth2/callback, /oauth2/signup : 카카오 OAuth (ROUTES.kakaoCallback, ROUTES.kakaoSignup)
 * - /workspace : 레거시 워크스페이스 FAB (ROUTES.workspace)
 * - `/`, `/professor` : 교수 대시보드(임시 시작 화면)
 * - `/dev/common-shell` : 공통 UI 컴포넌트 검증용 셸
 * - `/student` : 학생 대시보드
 * - 교수 영역: 퀴즈 관리·생성·수정 구현
 * - 학생 영역: 퀴즈 풀기·결과 구현
 *
 * 교안 파일 관리: `/professor/materials` (교수)
 * - `/student/materials` : 교안 목록 (ROUTES.studentMaterials)
 * - `/student/materials/:materialId/viewer` : PDF 교안 뷰어 (ROUTES.studentMaterialViewer)
 *
 * 주의: `/student/quiz/materials`는 정적 경로이므로,
 *       동적 경로 `/student/quiz/:materialId`보다 위에 두어 `materials`가 ID로 오인되지 않게 합니다.
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.signup} element={<SignUpPage />} />
        <Route path={ROUTES.passwordReset} element={<PasswordResetPage />} />
        <Route path={ROUTES.kakaoCallback} element={<KakaoCallbackPage />} />
        <Route path={ROUTES.kakaoSignup} element={<KakaoSignUpPage />} />
        <Route path={ROUTES.workspace} element={<LegacyAppShell />} />
        {/* ─── 교수 영역 (루트 = 임시 시작 화면) ─── */}
        <Route path={ROUTES.home} element={<ProfessorDashboardPage />} />
        <Route path={ROUTES.professorDashboard} element={<ProfessorDashboardPage />} />
        {/* 공통 UI 데모 (개발용) */}
        <Route path="/dev/common-shell" element={<EduHubCommonShell />} />
        {/* 교안별 퀴즈 관리 (강의·교안 선택, 목록, 생성/편집 이동) */}
        <Route path={ROUTES.professorQuizzes} element={<QuizManagementPage />} />
        {/* 특정 퀴즈 수정 (mock preload + 공통 QuizEditorContent) */}
        <Route path="/professor/quizzes/:quizId/edit" element={<QuizEditPage />} />
        {/* 교안 PDF 파일 관리 (mock 상태) */}
        <Route path={ROUTES.professorMaterials} element={<ProfessorMaterialPage />} />
        <Route path={ROUTES.professorMaterialViewer} element={<MaterialPdfViewerPage />} />
        {/* 특정 교안에서 새 퀴즈 생성 — 반드시 정적 `/professor/materials` 아래가 아닌 동적 세그먼트 조합 */}
        <Route path="/professor/materials/:materialId/quizzes/create" element={<QuizCreatePage />} />

        {/* ─── 학생 영역 ─── */}
        {/* 학생 대시보드: 메뉴 카드(교안 보기, 퀴즈 풀기 등) */}
        <Route path={ROUTES.studentDashboard} element={<StudentDashboardPage />} />
        <Route path={ROUTES.studentMaterials} element={<StudentMaterialsPage />} />
        <Route path={ROUTES.studentMaterialViewer} element={<MaterialPdfViewerPage />} />
        {/*
          퀴즈 풀기 — 강의·교안 선택 (QuizMaterialSelectPage)
          반드시 `ROUTES.studentQuizSolve`보다 먼저 선언 (materials가 동적 파라미터로 잡히지 않도록)
        */}
        <Route path={ROUTES.studentQuizMaterials} element={<QuizMaterialSelectPage />} />
        {/* 퀴즈 응시 결과/해설 (mock 결과 데이터) */}
        <Route path="/student/quiz/result/:attemptId" element={<QuizResultPage />} />
        {/* 특정 교안 퀴즈 풀이 (mock 문항) */}
        <Route path={ROUTES.studentQuizSolve} element={<QuizSolvePage />} />
      </Routes>
    </BrowserRouter>
  )
}
