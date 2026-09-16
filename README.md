# Content Study Lab

본 것과 배운 것을 저장하고, 그중 하나를 내 콘텐츠에 적용하고, 실제 결과를 복기해서, 결국 나만의 콘텐츠 기준(Playbook)으로 만드는 개인 학습 기록 앱입니다. 콘텐츠 제작 진행 관리 도구가 아니라 "연구 노트"에 가깝습니다.

```
SOURCE → APPLY → REVIEW → NEXT → (선택) PLAYBOOK
```

하나의 기록(`LearningRecord`) 안에서 SOURCE(본 것/배운 것) → APPLY(적용) → REVIEW(복기) → NEXT(다음)가 이어집니다. 처음엔 SOURCE만 저장하고, 나중에 상세 화면에서 이어서 채울 수 있습니다.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Prisma + Supabase PostgreSQL
- Server Actions로 모든 CRUD 처리 (별도 API 레이어 없음)

## Getting Started

1. Supabase 프로젝트를 만들고 (또는 기존 프로젝트를 사용) `.env`를 준비합니다.

   ```bash
   cp .env.example .env
   # .env를 열어 Supabase 프로젝트의 DATABASE_URL / DIRECT_URL로 채워주세요.
   # Project Settings -> Database -> Connection string 에서 확인할 수 있습니다.
   ```

2. 마이그레이션과 데모 데이터를 적용합니다.

   ```bash
   npm install
   npm run build   # postinstall이 Prisma Client 생성, build가 pending migration 적용 후 next build
   npm run db:seed # 데모 데이터 삽입 (이미 데이터가 있으면 자동 스킵)
   npm run dev
   ```

   `npm run build`(`prisma migrate deploy && next build`)가 마이그레이션까지 적용하므로, 로컬 개발 중에도 이 방식이 배포 때와 동일하게 동작합니다.

http://localhost:3000 에서 확인할 수 있습니다.

### 환경변수

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | 런타임에서 앱이 사용하는 pooled 연결 (Supabase PgBouncer, 6543 포트) |
| `DIRECT_URL` | 마이그레이션 전용 direct 연결 (5432 포트) |

두 값 모두 Supabase 대시보드의 **Project Settings → Database → Connection string**에서 확인할 수 있습니다. `.env`는 커밋하지 않고(`.gitignore`에 포함), `.env.example`만 저장소에 둡니다.

### Vercel 배포

1. GitHub 저장소를 Vercel 프로젝트로 import 합니다.
2. Vercel 프로젝트 설정 → Environment Variables에 `DATABASE_URL`, `DIRECT_URL`을 **Production과 Preview 둘 다** 체크해서 등록합니다 (Supabase Connection string 실제 값, placeholder 아님).
3. 이후로는 그냥 push/redeploy만 하면 됩니다 — 별도 수동 단계가 없습니다.

빌드 파이프라인:

```
npm install          → postinstall: prisma generate       (Prisma Client 생성)
npm run build        → prisma migrate deploy && next build (pending migration 적용 후 빌드)
```

- `prisma migrate deploy`는 **DIRECT_URL**로 연결해 아직 적용 안 된 마이그레이션만 적용합니다. 이미 최신 상태면 "No pending migrations to apply."만 찍고 그냥 지나갑니다 — 매 배포마다 실행해도 안전합니다(`migrate dev`나 리셋 계열 명령은 쓰지 않습니다).
- `DATABASE_URL`/`DIRECT_URL`이 하나라도 없으면 이 단계에서 **빌드 자체가 실패**합니다(`next build`는 시작조차 하지 않음) — 잘못된 설정으로 어중간하게 배포되는 일은 없습니다.

### 알려진 제한사항

- Record의 첨부파일(PDF/PPT/DOC/TXT/이미지)은 로컬 파일시스템(`public/uploads`)에 저장합니다. Vercel 등 서버리스 환경은 배포 시마다 파일시스템이 초기화되고 쓰기가 제한되어 있어, **업로드한 파일이 영구 저장되지 않습니다** (다른 필드 저장에는 영향 없음 — 파일만 저장되지 않고 조용히 건너뜁니다). 파일 첨부를 실제로 계속 쓰실 계획이라면 Supabase Storage 등 별도 파일 스토리지 연동이 필요하며, 이번 작업 범위에는 포함하지 않았습니다. 대용량 원본(영상 강의 등)은 파일 업로드 대신 "출처 링크" 필드에 URL로 연결해두는 것을 권장합니다.

## 메인 메뉴

- **Home** — 지금 P1 기록, 최근 적용 중인 기록, 최근 복기, 다음에 적용할 ONE THING을 가장 먼저 보여줍니다.
- **Records** — 모든 기록을 저장/검색/필터(배움·레퍼런스·내 스터디·콘텐츠 복기·공구 복기)하는 곳입니다. 카드를 누르면 상세로 이동합니다.
- **Playbook** — Record의 REVIEW에서 "내 공식으로 저장"을 누르면 쌓이는, 반복 검증된 나만의 콘텐츠 기준입니다.

## 데이터 구조

```
LearningRecord ─┬─ RecordAttachment
                └─ RecordPlaybookLink ── PlaybookRule
```

하나의 `LearningRecord`가 SOURCE/APPLY/REVIEW/NEXT 필드를 모두 갖는 단일 테이블입니다 (구버전의 Study→Idea→Experiment→PublishedContent→Performance→Review처럼 여러 엔티티로 쪼개지지 않습니다). `PlaybookRule`은 `RecordPlaybookLink`를 통해 여러 Record와 연결되며, "검증 횟수"는 연결된 링크 수입니다.

- 모든 참조는 대상이 삭제돼도 앱이 깨지지 않도록 `onDelete: Cascade`(첨부파일·연결 레코드)로 설계했습니다.
- enum류 필드는 문자열로 저장하고 `app/lib/types.ts`에 union 타입 + 라벨로 제약을 걸어둡니다 (SQLite 시절 설계를 그대로 유지 — PostgreSQL 네이티브 enum으로 바꾸지 않았습니다).

### 구버전 데이터 (Study/Idea/Experiment/...)

`Study`, `Idea`, `StudyIdeaLink`, `Experiment`, `PublishedContent`, `Performance`, `Review`, `PlaybookEvidence` 테이블은 구조 단순화 이전 데이터를 보존하기 위해 **읽기 전용 보관소로 남아 있습니다** (삭제하지 않았습니다). 앱 코드는 더 이상 이 테이블들을 사용하지 않습니다.

`npm run migrate:records`를 실행하면 이 구버전 데이터를 `LearningRecord`로 옮깁니다. 이미 옮겨진 데이터가 있으면(= `LearningRecord`에 데이터가 있으면) 자동으로 아무것도 하지 않고 스킵합니다(`MIGRATE_FORCE=1`로 강제 재실행 가능, 로컬 검증용으로만 사용 권장). 매핑 규칙과 애매한 케이스 처리 방식은 `scripts/migrate-to-learning-record.ts` 상단 주석을 참고하세요.
