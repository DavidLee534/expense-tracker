# 💰 연간 지출 관리 (expense-tracker)

개인의 지출을 손쉽게 기록하고, 카테고리별·기간별 통계로 소비 패턴을 파악할 수 있는 지출 관리 웹 서비스입니다.
고객은 본인의 지출을 기록·조회하고, 관리자는 회원과 서비스 전체 통계를 관리합니다.

> 📎 발표용 포트폴리오: [`portfolio/expense-tracker-portfolio.pptx`](./portfolio/expense-tracker-portfolio.pptx)

---

## 프로젝트 개요

- **문제 정의**: 지출을 기록해도 흩어진 데이터라 카테고리별·월별 흐름을 한눈에 파악하기 어려움
- **핵심 가치**: 간편한 등록 흐름 + 시각적 통계(도넛/막대 차트)로 소비 패턴을 즉시 인지
- **두 가지 역할**: 고객(본인 지출 기록·조회) / 관리자(회원·전체 서비스 통계 관리)

## 핵심 기능

### 고객
- 회원가입 / 로그인 (이메일·비밀번호, 가입 즉시 자동 로그인)
- 지출 CRUD — 등록·조회·수정·삭제, 기간·카테고리 필터, 메모 검색
- 개인 통계 대시보드 — 월별/연별 합계, 카테고리 비중을 도넛·막대 차트 토글로 시각화
- 고정 카테고리 8종 (식비·교통·주거·문화/여가·쇼핑·의료·교육·기타) 공용 사용

### 관리자
- 고정 계정 로그인 (회원가입 없음)
- 전체 통계 대시보드 — 전체 회원 수·총 지출액·이번 달 지출·인기 카테고리 TOP 5
- 회원 관리 — 검색, 계정 정지/해제, 상세 화면에서 최근 지출 5건 확인
- 지출 데이터를 직접 등록하지 않고 조회·관리만 수행 (역할 분리)

## 설계 원칙

1. **코로케이션 (Colocation)** — 각 페이지의 HTML·CSS·JS를 같은 디렉토리에 평탄하게 배치. "이 기능을 고치려면 어느 폴더를 보면 되는가?"에 즉시 답할 수 있는 구조
2. **역할별 분리** — 고객은 루트(`/`, `/auth`, `/expenses`, `/stats`), 관리자는 `/admin` 하위로 완전히 분리하되 동일한 데이터 계층을 공유
3. **클린 URL** — `list` / `create` / `edit` / `index` 등 목적이 드러나는 명확한 경로 설계
4. **고정 공통 데이터** — 카테고리는 CRUD 대상이 아닌 고정 참조 데이터로 취급해 데이터 일관성 보장

## 데이터 모델 (ERD)

```
profiles                    expenses                    categories
─────────────────           ─────────────────           ─────────────────
id (uuid, PK)      1 ─── N  id (uuid, PK)      N ─── 1   id (text, PK)
  → auth.users               user_id (FK)                name / icon / color
name                         category_id (FK)             고정 8종 · 읽기 전용
email (unique)               amount (numeric, >0)         (CRUD 없음, seed 데이터)
role: customer|admin         date
status: active|suspended     memo · created_at
created_at
```

## 기술 스택 진화 — localStorage → Supabase

| | Before | After |
|---|---|---|
| 저장소 | 브라우저 `localStorage` | Supabase (PostgreSQL) |
| 인증 | 비밀번호까지 평문 저장 (데모용) | Supabase Auth로 위임 |
| 데이터 공유 | 브라우저·기기 간 공유 불가 | 서버 DB로 어디서든 동일 데이터 접근 |
| 테이블 | 없음 | `profiles` / `categories` / `expenses` |

## 보안 & 데이터 무결성

- **Row Level Security (RLS)** — 고객은 본인 소유 데이터(profiles/expenses)만 조회·수정 가능, 관리자는 `role` 기반으로 전체 접근
- **재귀 없는 관리자 판별** — `profiles.role`을 정책 안에서 직접 조회하면 무한 재귀가 발생하므로 `SECURITY DEFINER` 함수(`is_admin()`)로 우회
- **최소 권한 원칙** — Supabase Advisor로 내부 함수의 불필요한 RPC 노출을 점검해 `anon`/`authenticated`의 불필요한 `EXECUTE` 권한 회수
- **인증 위임** — 비밀번호 저장·검증을 직접 구현하지 않고 Supabase Auth에 위임해 자체 구현 리스크 제거

## 협업 워크플로우

```
feat/shared → feat/auth → feat/core → main
```

- 공통 자원 → 인증 → 핵심 기능 순으로 브랜치를 나눠 작업 후 Pull Request로 `main`에 병합
- 병합이 끝난 `feat/*` 브랜치와 사용하지 않는 브랜치는 삭제해 원격 저장소를 깔끔하게 유지

## 폴더 구조

```
expense-tracker/
├── index.html / index.css / index.js   # 고객 메인 대시보드
├── auth/                                # 고객 회원가입 / 로그인
├── expenses/                            # 고객 지출 CRUD (list/create/edit)
├── stats/                               # 고객 통계 (월별/연별, 카테고리 비중)
├── admin/                               # 관리자 (auth/users/대시보드)
├── css/variables.css                    # 전역 CSS 변수 (민트/그린 톤)
├── js/data.js, js/utils.js              # 공용 카테고리 데이터 & 유틸리티
└── portfolio/                           # 발표용 포트폴리오 PPT
```

자세한 설계 배경은 [`BLUEPRINT.md`](./BLUEPRINT.md)를 참고하세요.

## 회고 & 다음 단계

**배운 점**
- 정적 데모(localStorage)에서 실제 백엔드(Supabase)로 옮기며 인증·보안을 다시 설계하는 경험
- RLS 정책의 재귀 문제를 `SECURITY DEFINER` 함수 패턴으로 해결
- Security Advisor로 보이지 않는 권한 노출까지 점검하는 습관

**다음 단계**
- 관리자 계정도 Supabase Auth 기반으로 전환 검토
- 프론트엔드(`js/utils.js`)를 Supabase 클라이언트 호출로 교체
- 관리자 페이지에 실시간 통계·알림 기능 확장
