import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

/**
 * EDU HUB 앱 라우팅
 *
 * - `/`, `/professor` : 교수 대시보드(임시 시작 화면)
 * - `/dev/common-shell` : 공통 UI 컴포넌트 검증용 셸
 * - `/student` : 학생 대시보드
 * - 교수 영역: 퀴즈 관리·생성·수정 구현
 * - 학생 영역: 퀴즈 풀기·결과 구현
 *
 * 교안 파일 관리: `/professor/materials` (교수)
 * 학생 교안 보기(`/student/materials`)는 별도 담당.
 *
 * 주의: `/student/quiz/materials`는 정적 경로이므로,
 *       동적 경로 `/student/quiz/:materialId`보다 위에 두어 `materials`가 ID로 오인되지 않게 합니다.
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── 교수 영역 (루트 = 임시 시작 화면) ─── */}
        <Route path="/" element={<ProfessorDashboardPage />} />
        <Route path="/professor" element={<ProfessorDashboardPage />} />
        {/* 공통 UI 데모 (개발용) */}
        <Route path="/dev/common-shell" element={<EduHubCommonShell />} />
        {/* 교안별 퀴즈 관리 (강의·교안 선택, 목록, 생성/편집 이동) */}
        <Route path="/professor/quizzes" element={<QuizManagementPage />} />
        {/* 특정 퀴즈 수정 (mock preload + 공통 QuizEditorContent) */}
        <Route path="/professor/quizzes/:quizId/edit" element={<QuizEditPage />} />
        {/* 교안 PDF 파일 관리 (mock 상태) */}
        <Route path="/professor/materials" element={<ProfessorMaterialPage />} />
        {/* 특정 교안에서 새 퀴즈 생성 — 반드시 정적 `/professor/materials` 아래가 아닌 동적 세그먼트 조합 */}
        <Route path="/professor/materials/:materialId/quizzes/create" element={<QuizCreatePage />} />

        {/* ─── 학생 영역 ─── */}
        {/* 학생 대시보드: 메뉴 카드(교안 보기, 퀴즈 풀기 등) */}
        <Route path="/student" element={<StudentDashboardPage />} />
        {/*
          교안 보기(`/student/materials`)는 다른 팀원 담당.
          여기서는 라우트를 정의하지 않으며, 담당자가 컴포넌트와 함께 `<Route>` 를 추가합니다.
        */}
        {/*
          퀴즈 풀기 — 강의·교안 선택 (QuizMaterialSelectPage)
          반드시 `/student/quiz/:materialId`보다 먼저 선언 (materials가 동적 파라미터로 잡히지 않도록)
        */}
        <Route path="/student/quiz/materials" element={<QuizMaterialSelectPage />} />
        {/* 퀴즈 응시 결과/해설 (mock 결과 데이터) */}
        <Route path="/student/quiz/result/:attemptId" element={<QuizResultPage />} />
        {/* 특정 교안 퀴즈 풀이 (mock 문항) */}
        <Route path="/student/quiz/:materialId" element={<QuizSolvePage />} />
      </Routes>
    </BrowserRouter>
  )
}
