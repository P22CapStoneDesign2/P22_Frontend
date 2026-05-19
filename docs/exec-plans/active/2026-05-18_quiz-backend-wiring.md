# [진행 중] 퀴즈 화면 — 백엔드 API 연동

- **시작일**: 2026-05-18
- **브랜치**: feat/minsik (작업자: ChoiMinsik)
- **해결할 부채**: TD-FE-006 (퀴즈 화면-API 연동 미완)
- **관련 문서**: `docs/API-SPEC.md` §16~25, `docs/ARCHITECTURE.md` API 레이어 섹션
- **관련 코드**: `src/domains/quiz/api/quizApi.js`, `src/domains/quiz/mappers/*`, `src/domains/professor/quiz-*`, `src/domains/student/quiz-*`

## 목표

팀원이 작성해 둔 퀴즈 도메인 API 모듈(`quizApi.js`)·매퍼 5종을 화면에 연결한다. 현재 퀴즈 관련 화면(교수 4개·학생 3개)은 UI는 완성됐으나 모두 더미 데이터로 동작 중이다. CLAUDE.md 규칙 #1(axios 인스턴스 경유)·#4(401 처리 위임)를 준수하면서 화면 단위로 순차 연동한다.

## 범위

포함:
- 교수 — 퀴즈 관리 목록 (`QuizManagementContent`): `getQuizzes` + `quizManagementMapper`
- 교수 — 퀴즈 생성 (`QuizCreateContent`): `createQuiz` + `addQuestion` (`quizMapper`)
- 교수 — 퀴즈 수정 (`QuizEditContent`): `getQuizDetail` → `mapQuizDetailToEditorBundle` preload, `updateQuiz` + `updateQuestion`/`addQuestion`/`deleteQuestion` 동기화
- 교수 — 퀴즈 삭제: `deleteQuiz`
- 학생 — 퀴즈 풀이 (`QuizSolveContent`): `getQuizDetail` 로드 → 답안 제출 (`submitQuiz` + `quizSubmitMapper`)
- 학생 — 퀴즈 결과 (`QuizResultContent`): 제출 응답 → `mapSubmitResponseToResultBundle`로 결과 화면 구성
- 각 화면에 로딩·실패 상태 표시 (인터셉터 외 화면 레벨 한국어 메시지)
- `quizDetailMapper`의 정답 preload(TODO) 해결 여부는 백엔드 응답 확인 후 결정

제외 (별도 계획):
- 학생 — 오답 정리 화면 신규 (`getWrongAnswers`) — 화면 자체가 미구현
- 퀴즈 미리보기(`QuizPreviewContent`) — 로컬 상태 기반이라 API 미사용
- `src/shared/api/httpClient.js` 제거 (TD-FE-007) — 잔존 사용처 확인 후 별도 PR

## 수용 기준

- [ ] 교수 — 퀴즈 관리 목록이 실제 API에서 로드되어 페이지네이션 동작
- [ ] 교수 — 신규 퀴즈 작성·저장 후 목록에 반영
- [ ] 교수 — 기존 퀴즈 수정 화면이 실제 데이터로 preload, 저장 시 PUT + 문제 추가/수정/삭제가 정확히 호출 (서버에 저장된 questionId 추적은 `isPersistedQuestionId`)
- [ ] 학생 — 풀이 화면이 실제 퀴즈 상세 응답으로 동작, 제출 결과가 결과 화면에 정확히 표시 (객관식 정오답 강조 포함)
- [ ] 모든 API 호출은 `src/api/axios.js`의 `instance` 경유 — `fetch`·`axios` 직접 호출 0건
- [ ] 401·재발급은 인터셉터에서만 처리 — 화면·페이지에 토큰 직접 다루는 코드 없음
- [ ] `npm run lint`·`npm run build` 무에러
- [ ] 골든 패스(교수: 생성→저장→목록→수정→삭제 / 학생: 목록→풀이→제출→결과)를 브라우저에서 수동 확인

## 의사결정 로그

### 2026-05-18 — quizApi.js의 HTTP 클라이언트 결정

- **결정**: `quizApi.js`를 `src/api/axios.js`의 `instance` 기반으로 재작성. 함수는 모두 AxiosResponse 원본을 반환하고 호출부에서 `res.data.data`로 envelope 언래핑.
- **이유**: CLAUDE.md 규칙 #1("모든 API 호출은 `src/api/axios.js`의 `instance`만 사용") 위반 상태였음. 기존 코드는 `src/shared/api/httpClient.js`(fetch 기반)를 사용해 401 자동 재발급이 동작하지 않았다.
- **대안**: ① `httpClient.js`에 401 인터셉터를 추가하는 방안 — 인증·토큰 로직이 두 곳으로 분산되어 규칙 #4도 깨지므로 기각. ② axios 인스턴스로 일원화 — 채택.
- **영향**: 매퍼 파일은 수정 불필요(이미 unwrap된 `data`를 입력으로 받음). 화면에서 호출 시 `const res = await getQuizzes(...); const rows = mapQuizListPageDataToTableRows(res.data.data)` 패턴.

### 2026-05-18 — 화면 연동 순서

- **결정**: 교수 관리 목록 → 교수 생성/수정/삭제 → 학생 풀이/결과 순으로 진행.
- **이유**: 학생 화면은 교수가 만든 실데이터를 필요로 하므로 교수 측 흐름이 먼저 동작해야 통합 테스트가 가능하다.

## 후속 작업 (이번 계획 범위 밖)

- `getWrongAnswers`를 사용하는 학생 오답 정리 화면 신규 (TD-FE-003 일부)
- `quizDetailMapper.js`의 정답 preload TODO — 백엔드가 교수용 응답에 `correctAnswer`·보기별 `correct`를 포함하기 시작하면 해결
- `quizMapper.js`의 `anchorId`/`lessonPage`/`lessonParagraph` 매핑 — 교안 앵커 UI가 생기면 연결
- 퀴즈 결과 화면 — 복수 정답(쉼표 연결) 전체 표시 (현재 첫 정답 보기만 강조)
- `httpClient.js` 잔존 사용처 정리 후 파일 제거 (TD-FE-007)
