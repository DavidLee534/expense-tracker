# 💰 연간 지출 관리 — 프로젝트 청사진

## 설계 원칙

### 코로케이션 (Colocation)
각 페이지의 HTML · CSS · JS를 **같은 디렉토리에 평탄하게** 배치한다.
"이 기능을 고치려면 어느 폴더를 보면 되는가?"에 즉시 답할 수 있는 구조.
파일명은 HTML과 동일하게 매칭한다 (`list.html` → `list.css`, `list.js`).

### 역할별 분리 (고객 / 관리자)
- **고객**: 루트(`/`, `/auth/`, `/expenses/`, `/stats/`)에서 본인의 지출을 기록·조회한다.
- **관리자**: `/admin/` 하위에서 회원 계정을 관리하고 서비스 전체 통계를 확인한다. 지출 데이터를 직접 등록하지는 않는다.
- 두 영역은 `js/utils.js`가 제공하는 동일한 localStorage 데이터를 읽고 쓴다.

### 인증 (Auth)
백엔드 서버가 없는 정적 사이트이므로 인증도 `localStorage`로 구현한다.

- **고객**: 이메일/비밀번호로 **회원가입 → 로그인** (비밀번호는 데모 목적상 평문 저장). `auth/`를 제외한 고객 페이지는 진입 시 로그인 여부를 확인하고, 비로그인 상태면 `auth/login.html?next=`로 리다이렉트한다.
- **관리자**: 회원가입 없이 **고정 계정**(`admin` / `admin123`)으로만 로그인한다. `admin/` 하위 모든 페이지(로그인 페이지 제외)는 진입 시 관리자 로그인 여부를 확인하고, 로그인하지 않았다면 `admin/auth/login.html`로 리다이렉트한다.
- 관리자가 회원을 **정지(suspended)** 시키면 해당 계정은 고객 로그인이 차단된다.

### 카테고리는 고정 공통 데이터
카테고리는 관리자든 고객이든 CRUD로 편집하지 않는다. `js/data.js`의 `DEFAULT_CATEGORIES`(식비·교통·주거·문화/여가·쇼핑·의료·교육·기타)를 모든 사용자가 그대로 공유해서 지출 등록 시 선택한다.

### 클린 URL

| URL | 설명 |
|-----|------|
| `/index.html` | 고객 — 메인 대시보드 (로그인 필요) |
| `/auth/login.html` | 고객 로그인 |
| `/auth/signup.html` | 고객 회원가입 |
| `/expenses/list.html` | 고객 — 지출 내역 목록 (기간·카테고리 필터, 검색) |
| `/expenses/create.html` | 고객 — 지출 추가 |
| `/expenses/edit.html?id=…` | 고객 — 지출 수정 |
| `/stats/index.html` | 고객 — 개인 월별/연별 통계 |
| `/admin/auth/login.html` | 관리자 로그인 (고정 계정) |
| `/admin/index.html` | 관리자 — 전체 통계 대시보드 (로그인 필요) |
| `/admin/users/list.html` | 관리자 — 회원 목록, 검색, 정지/해제 (로그인 필요) |
| `/admin/users/detail.html?id=…` | 관리자 — 회원 상세(가입일·지출 요약) + 정지/삭제 (로그인 필요) |

---

## 📁 폴더 구조

```
expense-tracker/
├── index.html                        # 고객 메인 대시보드
├── index.css
├── index.js
│
├── 👤 고객 - 인증
│   └── auth/
│       ├── auth.css                  # 로그인·회원가입 공용 카드 스타일
│       ├── login.html / login.js
│       └── signup.html / signup.js   # 가입 즉시 자동 로그인
│
├── 👤 고객 - 지출 내역
│   └── expenses/
│       ├── list.html / list.css / list.js       # 목록 (기간/카테고리 필터, 검색, 삭제)
│       ├── create.html / create.css / create.js # 지출 추가
│       └── edit.html / edit.css / edit.js       # 지출 수정 (create.css 재사용)
│
├── 👤 고객 - 통계
│   └── stats/
│       └── index.html / index.css / index.js    # 월별/연별 통계, 카테고리 비중 도넛 차트
│
├── 🔴 관리자
│   └── admin/
│       ├── auth/
│       │   └── login.html / login.css / login.js   # 고정 계정(admin/admin123) 로그인
│       │
│       ├── index.html / index.css / index.js       # 대시보드 — 전체 회원수·총지출액·인기 카테고리
│       │
│       └── users/
│           ├── list.html / list.css / list.js       # 회원 목록, 검색, 정지/해제
│           └── detail.html / detail.css / detail.js # 회원 상세 + 지출 요약 + 정지/삭제
│
├── 📦 공유 자원
│   ├── css/
│   │   └── variables.css             # 전역 CSS 변수(민트/그린 톤) + 리셋
│   └── js/
│       ├── data.js                   # 기본 카테고리 데이터 (DEFAULT_CATEGORIES, 고정)
│       └── utils.js                  # 공통 유틸리티 (고객/관리자 인증, 지출 CRUD, 통계 계산, 회원 관리, 포맷)
```

## 🧩 데이터 모델

| 엔티티 | 필드 |
|--------|------|
| **User** | `id`, `name`, `email`, `password`, `status`(`active`\|`suspended`), `createdAt` |
| **Category** | `id`, `name`, `icon`(이모지), `color` — `data.js`의 고정 배열, CRUD 없음 |
| **Expense** | `id`, `userId`, `categoryId`, `amount`, `date`(YYYY-MM-DD), `memo`, `createdAt` |

localStorage 키: `expense_users`, `expense_session`, `expense_admin_session`, `expense_records`

## 🎨 디자인

- **테마**: 라이트 + 민트/그린 톤 (재무 신뢰감). 관리자 영역은 고객 영역과 동일한 톤을 유지하되 사이드바 등 어두운 강조색(`--color-admin`)으로 구분한다.
- **분위기**: 미니멀 + 모던, 카드형 대시보드
- **차트**: 외부 라이브러리 없이 CSS/SVG로 직접 구현. 카테고리 비중은 **도넛/막대 전환 토글**을 제공하고(둘 다 CSS 기반), 월별 추이는 막대 차트로 표시
- **레이아웃**: 반응형 (모바일/데스크톱), 관리자는 사이드바 레이아웃

## 📐 코로케이션 원칙

- **HTML과 동일한 디렉토리에 css, js 파일을 평탄하게 배치** (별도 하위 폴더 없음)
- **파일명은 HTML 파일명과 동일하게 매칭** (`index.html` → `index.css`, `index.js`)
- 전역 공통 자원만 `/css/`, `/js/` 폴더에 분리
- 역할별(고객/관리자) 독립 폴더로 관심사를 분리
