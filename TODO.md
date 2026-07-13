# 💰 연간 지출 관리 — 구현 TODO

## 1단계 — 공유 자원 (`css/`, `js/`)

- [x] `css/variables.css` — 전역 CSS 변수(민트/그린 톤 컬러·타이포·간격·그림자, 관리자 강조색 포함) + 리셋
- [x] `js/data.js` — 기본 카테고리 데이터 (`DEFAULT_CATEGORIES`: 식비·교통·주거·문화/여가·쇼핑·의료·교육·기타, 고정값·CRUD 없음)
- [x] `js/utils.js` — 공통 유틸리티 모듈 (`Utils`)
  - [x] 포맷: `formatCurrency`, `formatDate`
  - [x] 카테고리: `getCategories`, `getCategory` (읽기 전용, `DEFAULT_CATEGORIES` 그대로 반환)
  - [x] 고객 인증: `signup`, `login`(정지 계정 로그인 차단), `logout`, `getCurrentUser`, `isLoggedIn`
  - [x] 관리자 인증: `adminLogin`, `adminLogout`, `isAdminLoggedIn` — 고정 계정 `admin`/`admin123`
  - [x] 지출 내역 CRUD (현재 로그인한 고객 소유만): `getExpenses({from, to, categoryId, search})`, `getExpense`, `addExpense`, `updateExpense`, `deleteExpense`
  - [x] 개인 통계: `getMonthlyStats(year, month)`, `getYearlyStats(year)`, `getCategoryTotals({from, to})`
  - [x] 관리자 — 회원 관리: `getUsers({search})`, `getUser(id)`, `suspendUser(id)`, `unsuspendUser(id)`, `deleteUser(id)`(소유 지출 내역도 함께 삭제)
  - [x] 관리자 — 전체 통계: `getAdminStats()` (회원수, 총지출액, 이번 달 지출액, 인기 카테고리 TOP5, 최근 가입자)

---

## 2단계 — 고객 인증 (`auth/`)

- [x] `auth.css` — 로그인/회원가입 공용 카드 스타일
- [x] `signup.html` / `signup.js` — 이름·이메일·비밀번호 검증, 가입 즉시 자동 로그인
- [x] `login.html` / `login.js` — 이메일/비밀번호 로그인, `?next=` 파라미터로 로그인 후 원래 위치 복귀, 정지 계정 에러 메시지
- [x] 이미 로그인 상태면 두 페이지 모두 자동으로 홈(`/index.html`)으로 리다이렉트

---

## 3단계 — 관리자 인증 (`admin/auth/`)

- [x] `login.html` / `login.css` / `login.js`
  - [x] 고정 계정(`admin`/`admin123`) 검증
  - [x] 이미 로그인 상태면 `admin/index.html`로 자동 리다이렉트

---

## 4단계 — 고객 - 지출 내역 CRUD (`expenses/`, 전부 로그인 가드 적용)

- [x] `list.html` / `list.css` / `list.js`
  - [x] 기간 필터(전체/이번 달/올해), 카테고리 필터, 검색(메모)
  - [x] 목록 테이블 + 합계 표시
  - [x] 삭제, 수정 페이지 링크
- [x] `create.html` / `create.css` / `create.js` — 금액·날짜·카테고리·메모 입력 폼 + 검증
- [x] `edit.html` / `edit.css` / `edit.js` — 기존 값 프리필 + 삭제 버튼 (`create.css` 재사용)

---

## 5단계 — 고객 - 통계 대시보드 (`stats/`, 로그인 가드)

- [x] `index.html` / `index.css` / `index.js`
  - [x] 월 선택기 + 연 선택기
  - [x] 카테고리별 비중 차트 — 도넛/막대 전환 토글 버튼 (도넛: CSS `conic-gradient` 기반, 막대: 카테고리별 가로 막대), 선택 상태는 로컬 상태로 유지
  - [x] 월별 지출 추이 막대 차트
  - [x] 카테고리 랭킹 리스트 (금액/비율)

---

## 6단계 — 고객 - 메인 대시보드 (`index.html`, 로그인 가드)

- [x] `index.html` / `index.css` / `index.js`
  - [x] 상단 네비게이션 (대시보드/지출내역/통계 + 로그아웃)
  - [x] 이번 달 총지출 요약 카드, 전월 대비 증감
  - [x] 카테고리별 비중 미니 차트
  - [x] 최근 지출 내역 5건

---

## 7단계 — 관리자 - 회원 관리 (`admin/users/`, 전부 관리자 로그인 가드 적용)

- [x] `list.html` / `list.css` / `list.js`
  - [x] 회원 목록 테이블(이름·이메일·가입일·상태), 검색
  - [x] 정지/해제 토글, 상세 페이지 링크
- [x] `detail.html` / `detail.css` / `detail.js`
  - [x] 회원 기본 정보 + 해당 회원의 지출 요약(총액, 최근 내역)
  - [x] 정지/해제, 계정 삭제(소유 지출 내역 함께 삭제)

---

## 8단계 — 관리자 - 대시보드 (`admin/index.html`, 관리자 로그인 가드)

- [x] `index.html` / `index.css` / `index.js`
  - [x] 사이드바 (회원 관리 / 대시보드 네비게이션 + 로그아웃)
  - [x] 통계 카드: 전체 회원수, 총 지출액, 이번 달 지출액
  - [x] 인기 카테고리 TOP5 차트
  - [x] 최근 가입 회원 리스트

---

## 향후 확장 (미착수)

- [ ] 예산 설정 및 초과 알림
- [ ] 지출 내보내기 (CSV)
- [ ] 반복 지출(구독 등) 자동 등록
- [ ] 비밀번호 해싱 등 보안 강화 (현재는 데모 목적의 평문 저장)
