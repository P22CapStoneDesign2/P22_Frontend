// 어떤 url -> 어떤 페이지인지? (라우팅 지도)

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROUTES } from '../shared/constants/routes.js'
import { ProfessorAreaLayout, StudentAreaLayout } from './RouteLayouts.jsx'
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

//교수 메타데이터
const professorMeta = {
  dashboard: { contentClassName: 'edu-dashboard-app-layout-content' },
  quizzes: {
    contentClassName: 'edu-quiz-mgmt-app-layout-content',
    breadcrumbItems: [{ label: '교안별 퀴즈 관리' }],
  },
  quizEdit: {
    contentClassName: 'edu-quiz-create-app-layout-content',
    breadcrumbItems: [
      { label: '교안별 퀴즈 관리', to: ROUTES.professorQuizzes },
      { label: '퀴즈 수정' },
    ],
  },
  materials: {
    contentClassName: 'edu-mat-app-layout-content',
    breadcrumbItems: [{ label: '교안 관리' }],
  },
  quizCreate: {
    contentClassName: 'edu-quiz-create-app-layout-content',
    breadcrumbItems: [
      { label: '교안별 퀴즈 관리', to: ROUTES.professorQuizzes },
      { label: '퀴즈 생성' },
    ],
  },
}

//학생 메타 데이터
const studentMeta = {
  dashboard: { contentClassName: 'edu-dashboard-app-layout-content' },
  materials: { contentClassName: 'edu-stu-mat-list-app-layout-content' },
  quizMaterials: { contentClassName: 'edu-stu-quiz-mat-app-layout-content' },
  quizResult: { contentClassName: 'edu-quiz-result-app-layout-content' },
  quizSolve: { contentClassName: 'edu-quiz-solve-app-layout-content' },
}

// 앱 라우터
const appRouter = createBrowserRouter([
  { path: ROUTES.home, element: <LoginPage /> },
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.signup, element: <SignUpPage /> },
  { path: ROUTES.passwordReset, element: <PasswordResetPage /> },
  { path: ROUTES.kakaoCallback, element: <KakaoCallbackPage /> },
  { path: ROUTES.kakaoSignup, element: <KakaoSignUpPage /> },
  { path: ROUTES.workspace, element: <LegacyAppShell /> },
  {
    path: '/professor',
    element: <ProfessorAreaLayout />,
    children: [
      {
        index: true,
        element: <ProfessorDashboardPage />,
        handle: { layoutMeta: professorMeta.dashboard },
      },
      {
        path: 'quizzes',
        element: <QuizManagementPage />,
        handle: { layoutMeta: professorMeta.quizzes },
      },
      {
        path: 'quizzes/:quizId/edit',
        element: <QuizEditPage />,
        handle: { layoutMeta: professorMeta.quizEdit },
      },
      {
        path: 'materials',
        element: <ProfessorMaterialPage />,
        handle: { layoutMeta: professorMeta.materials },
      },
      {
        path: 'materials/:materialId/quizzes/create',
        element: <QuizCreatePage />,
        handle: { layoutMeta: professorMeta.quizCreate },
      },
    ],
  },
  {
    path: '/professor/materials/:materialId/viewer',
    element: <MaterialPdfViewerPage />,
  },
  {
    path: '/student',
    element: <StudentAreaLayout />,
    children: [
      {
        index: true,
        element: <StudentDashboardPage />,
        handle: { layoutMeta: studentMeta.dashboard },
      },
      {
        path: 'materials',
        element: <StudentMaterialsPage />,
        handle: { layoutMeta: studentMeta.materials },
      },
      {
        path: 'quiz/materials',
        element: <QuizMaterialSelectPage />,
        handle: { layoutMeta: studentMeta.quizMaterials },
      },
      {
        path: 'quiz/result/:attemptId',
        element: <QuizResultPage />,
        handle: { layoutMeta: studentMeta.quizResult },
      },
      {
        path: 'quiz/:materialId',
        element: <QuizSolvePage />,
        handle: { layoutMeta: studentMeta.quizSolve },
      },
    ],
  },
  {
    path: '/student/materials/:materialId/viewer',
    element: <MaterialPdfViewerPage />,
  },
  { path: '/dev/common-shell', element: <EduHubCommonShell /> },
])



export default function AppRoutes() {
  return <RouterProvider router={appRouter} />
}
