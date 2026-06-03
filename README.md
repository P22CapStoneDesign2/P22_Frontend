# 학습자료 연계형 통합 퀴즈 운영 시스템 구축 (Edu-Quiz Hub)
## P22_Frontend

Figma를 이용해 와이어프레임을 그리고, API 명세서를 기반으로 화면을 구현해 기능이 동작할 수 있게 하는 것을 목표로 합니다.
<br>

### 🌟팀원
| 정세영 | 윤정수 |
|------|------|
홈 랜딩 화면 구현 | 학생/교수 메인페이지 UI 설계 및 구현
로그인 / 회원가입 화면 구현 | 교안 조회-PDF 뷰어 화면 구현
학생 강의 수강 신청 화면 구현 | 교수 퀴즈 생성 화면 구현
pdf 교안 뷰어 화면 구현 | 퀴즈 결과 및 해설 조회 화면 구현
관리자 화면 구현-학생 강의 수강 신청 승인 | 객관식·주관식 퀴즈 응시 화면 구현
관리자 화면 구현-교수 회원가입 신청 승인 |

<br><br>

### 🌟사용 기술
| 구분 | 기술 |
|------|------|
언어 | JavaScript (JSX)
UI | React 19
빌드/개발 서버 | Vite 8
라우팅 | React Router v7
HTTP | Axios
PDF | react-pdf + pdfjs-dist

<br><br>

### 🌟프로그램 구조
```
src/
├── main.jsx                          # 앱 진입점 — React DOM 마운트, AppRoutes 로드
├── index.css                         # 전역 베이스 스타일
│
├── app/                              # 라우팅·레이아웃 (앱 골격)
│   ├── AppRoutes.jsx                 # URL → 페이지 매핑 (React Router v7)
│   ├── RouteLayouts.jsx              # ADMIN / PROF / USER 영역 공통 레이아웃
│   ├── EduHubCommonShell.jsx         # 공통 셸 UI (개발용)
│   ├── headerLogoutHandler.js        # 헤더 로그아웃 처리
│   └── layoutMetaFromMatches.js      # 라우트별 breadcrumb·content class 메타
│
├── config/
│   └── env.js                        # VITE_* 환경 변수 export (API URL, OAuth 등)
│
├── api/                              # 백엔드 REST API 호출
│   ├── axios.js                      # Axios 인스턴스, JWT 첨부, 401 재발급 인터셉터
│   ├── auth.js                       # 로그인·회원가입·로그아웃·내 정보
│   ├── lessons.js                    # 교안(강의) API
│   ├── quiz.js                       # 퀴즈 API
│   ├── adminUsers.js                 # 관리자 사용자 API
│   ├── apiResponse.js                # ApiResponse<T> 파싱 유틸
│   └── apiErrorMessage.js            # API 오류 메시지 추출
│
├── components/                       # 도메인 공통 UI 컴포넌트
│   ├── layout/
│   │   ├── AppLayout/                # 페이지 공통 레이아웃 (헤더 + 본문)
│   │   └── Header/                   # 상단 헤더, 세션 타이머
│   ├── media/
│   │   └── PdfViewerSection/         # PDF 뷰어 UI 블록
│   └── ui/
│       ├── Button/                   # 공통 버튼
│       ├── ConfirmModal/             # 확인 모달
│       ├── MenuCard/                 # 대시보드 메뉴 카드
│       ├── PageBackButton/           # 뒤로가기 버튼
│       ├── SelectDropdown/           # 드롭다운 선택
│       └── Toast/                    # 토스트 알림
│
├── shared/                           # 전역 공통 유틸·상수
│   ├── constants/
│   │   └── routes.js                 # ROUTES 상수 (경로 문자열 단일 출처)
│   ├── auth/
│   │   ├── tokenStorage.js           # localStorage 토큰 read/write
│   │   ├── roleUtils.js              # PROF / USER / ADMIN 역할 판별
│   │   ├── RoleAreaGuard.jsx         # 역할별 URL 접근 가드
│   │   ├── useUserRole.js            # JWT claim 기반 역할 훅
│   │   └── performLogout.js          # 로그아웃·토큰 삭제
│   ├── session/
│   │   ├── SessionIdleProvider.jsx   # 세션 유휴 타이머 Provider
│   │   └── useSessionIdle.js         # 남은 세션 시간 표시
│   ├── navigation/
│   │   ├── getRoleHomePath.js        # 역할별 홈 경로
│   │   └── usePageBackNavigation.js  # 뒤로가기 네비게이션
│   ├── styles/
│   │   ├── eduTokens.css             # 디자인 토큰 (색상·간격)
│   │   ├── buttons.css               # 공통 버튼 스타일
│   │   └── index.css                 # shared 스타일 진입점
│   ├── icons/
│   │   └── eduHubIcons.jsx           # SVG 아이콘 컴포넌트
│   └── utils/
│       └── pdfMeta.js                # PDF 메타데이터 유틸
│
├── domains/                          # 기능별 화면 (도메인 단위)
│   │
│   ├── landing/                      # 랜딩 페이지
│   │   ├── LandingPage.jsx           # 메인 랜딩 (로고·소개·마인드맵)
│   │   ├── LandingFloatingDock.jsx   # 우측 플로팅 네비 (소개/알아보기/시작하기)
│   │   ├── LandingTypewriterText.jsx # 소개 문구 타이프라이터 효과
│   │   ├── LandingMindMap.jsx        # 서비스 마인드맵 섹션
│   │   └── landingDockScrollLock.js  # 도크 클릭 스크롤 중 UI 잠금
│   │
│   ├── auth/                         # 인증·회원가입
│   │   ├── LoginPage.jsx             # 로그인
│   │   ├── SignUpPage.jsx            # 일반 회원가입
│   │   ├── KakaoCallbackPage.jsx     # 카카오 OAuth 콜백 (토큰 수신)
│   │   ├── KakaoRegisterPage.jsx     # 카카오 신규 가입 완료
│   │   ├── PasswordResetPage.jsx     # 비밀번호 재설정
│   │   └── FindPasswordModal.jsx     # 비밀번호 찾기 모달
│   │
│   ├── professor/                    # 교수(강사) 영역
│   │   ├── ProfessorDashboardPage.jsx    # 교수 대시보드
│   │   ├── materials/
│   │   │   ├── ProfessorMaterialPage.jsx # 교안 관리 목록
│   │   │   └── ProfessorMaterialContent.jsx
│   │   ├── quiz-management/
│   │   │   ├── QuizManagementPage.jsx    # 교안별 퀴즈 관리
│   │   │   └── QuizManagementContent.jsx
│   │   ├── quiz-create/
│   │   │   ├── QuizCreatePage.jsx        # 퀴즈 추가
│   │   │   ├── MultipleChoiceEditor.jsx  # 객관식 문항 편집
│   │   │   └── ShortAnswerEditor.jsx     # 단답형 문항 편집
│   │   ├── quiz-edit/
│   │   │   └── QuizEditPage.jsx          # 퀴즈 수정
│   │   └── quiz-preview/
│   │       └── QuizPreviewPage.jsx       # 퀴즈 미리보기
│   │
│   ├── student/                      # 학생 영역
│   │   ├── StudentDashboardPage.jsx      # 학생 대시보드
│   │   ├── course-apply/
│   │   │   └── StudentCourseApplyPage.jsx # 강의 수강 신청
│   │   ├── materials/
│   │   │   └── StudentMaterialsPage.jsx  # 교안 목록·보기
│   │   ├── quiz-material-select/
│   │   │   └── QuizMaterialSelectPage.jsx # 퀴즈 풀 교안 선택
│   │   ├── quiz-solve/
│   │   │   ├── QuizSolvePage.jsx         # 퀴즈 풀이
│   │   │   └── QuizSolveContent.jsx
│   │   └── quiz-result/
│   │       ├── QuizResultPage.jsx        # 퀴즈 결과·해설
│   │       └── QuizResultContent.jsx
│   │
│   ├── admin/                        # 관리자 영역
│   │   ├── subject-access/
│   │   │   └── AdminSubjectAccessPage.jsx  # 강의 수강 신청 관리
│   │   └── professor-signup/
│   │       └── AdminProfessorSignupPage.jsx # 교수 가입 승인
│   │
│   ├── shared/                       # 역할 공통 도메인 UI
│   │   └── material-viewer/
│   │       └── MaterialPdfViewerPage.jsx   # PDF 교안 뷰어
│   │
│   ├── quiz/                         # 퀴즈 공통 로직
│   │   ├── api/quizApi.js            # 퀴즈 도메인 API
│   │   ├── mappers/                  # API 응답 → 화면 모델 변환
│   │   │   ├── quizDetailMapper.js
│   │   │   ├── quizManagementMapper.js
│   │   │   └── quizResultMapper.js
│   │   └── quizPersistenceService.js # 퀴즈 임시 저장(localStorage)
│   │
│   └── catalog/                      # 교안·퀴즈 카탈로그 조회
│       ├── lessonCatalogService.js
│       └── quizCatalogService.js
│
└── assets/                           # 정적 리소스 (이미지, GIF 등)
    ├── introduce_1.gif
    ├── introduce_2.png
    └── introduce_3.png
```
<br><br>

### 🌟화면

#### 🔥랜딩 페이지
<img width="1919" height="939" alt="image" src="https://github.com/user-attachments/assets/6cf29017-a004-40ed-a3ba-4ddedf9b54b4" />

<br><br>

#### 🔥로그인
<img width="1919" height="941" alt="image" src="https://github.com/user-attachments/assets/cffec67b-d2ce-4da7-a05b-cc896e23d58f" />
<img width="1919" height="939" alt="image" src="https://github.com/user-attachments/assets/26f1cb94-7742-4147-b683-4969b9299a73" />

<br><br>

#### 🔥회원가입/비밀번호 찾기-재설정
<img width="1919" height="946" alt="image" src="https://github.com/user-attachments/assets/433a185c-e70c-463e-8237-1674f5277cb2" />
<img width="1919" height="939" alt="image" src="https://github.com/user-attachments/assets/58ee5a74-331f-475e-9d02-c7e773e4b951" />
<img width="1919" height="930" alt="image" src="https://github.com/user-attachments/assets/6e32a2d7-5366-42eb-ad28-99f28d5efdb8" />
<img width="1919" height="941" alt="image" src="https://github.com/user-attachments/assets/e0ca619c-9230-4162-bf2a-c80585d6c809" />

<br><br>

#### 🔥교수(PROFESSOR)

<img width="1919" height="937" alt="image" src="https://github.com/user-attachments/assets/45b20a31-4350-42c9-b9af-c9fffd72cf55" />
<img width="1918" height="938" alt="image" src="https://github.com/user-attachments/assets/8f99df10-5f16-4e2e-a3c3-b81091983e2b" />
<img width="1919" height="939" alt="image" src="https://github.com/user-attachments/assets/70016445-0ae5-420a-adab-34bc4cb88919" />
<img width="1919" height="937" alt="image" src="https://github.com/user-attachments/assets/bcad2027-be9b-4bef-96c1-a420a676647c" />

<br><br>

#### 🔥학생(STUDENT)
<img width="1918" height="940" alt="image" src="https://github.com/user-attachments/assets/cb57a416-f575-4720-9edf-6d8adf0338d9" />
<img width="1919" height="936" alt="image" src="https://github.com/user-attachments/assets/ac5fa5ec-3a2b-4e83-b838-e7ddfcfef2a6" />
<img width="1919" height="939" alt="image" src="https://github.com/user-attachments/assets/480aae87-94be-441b-8c75-0d532f946fa3" />
<img width="1919" height="941" alt="image" src="https://github.com/user-attachments/assets/d3b2adce-a240-4ac1-b478-0f71e736dd10" />
<img width="1919" height="943" alt="image" src="https://github.com/user-attachments/assets/1e52fbcb-0e54-40f3-8c17-030a04748421" />
<img width="1919" height="936" alt="image" src="https://github.com/user-attachments/assets/1ea8a4d8-550d-4f88-bc81-8acb1d578cd4" />
<img width="1919" height="937" alt="image" src="https://github.com/user-attachments/assets/ffaa818e-f13b-4f2a-a490-4318fd7c0ba8" />


<br><br>

#### 🔥관리자(ADMIN)
<img width="1917" height="939" alt="image" src="https://github.com/user-attachments/assets/bd41f37f-c7e8-4747-8ad0-e25d41ebc667" />
<img width="1917" height="935" alt="image" src="https://github.com/user-attachments/assets/23cf5574-52db-4895-8426-47eac15f83ef" />

<br><br>
