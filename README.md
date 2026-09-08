# Content Study Lab

배운 것을 저장하고 → ONE THING을 고르고 → 콘텐츠에 적용하고 → 게시 후 복기해서 → 나만의 콘텐츠 공식(Playbook)으로 쌓는 개인용 콘텐츠 스터디 앱입니다.

```
SAVE → ANALYZE → ONE THING → IDEA → PLAN → PUBLISH → REVIEW → PLAYBOOK
```

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

- Study의 이미지/스크린샷 업로드는 로컬 파일시스템(`public/uploads`)에 저장합니다. Vercel 등 서버리스 환경은 배포 시마다 파일시스템이 초기화되고 쓰기가 제한되어 있어, **업로드한 이미지가 영구 저장되지 않습니다** (다른 필드 저장에는 영향 없음 — 이미지만 저장되지 않고 조용히 건너뜁니다). 이미지 첨부를 실제로 계속 쓰실 계획이라면 Supabase Storage 등 별도 파일 스토리지 연동이 필요하며, 이번 작업 범위에는 포함하지 않았습니다.

## 메인 메뉴

- **Home** — 지금 테스트 중인 ONE THING과 다음에 만들 콘텐츠(Priority 순)를 가장 먼저 보여줍니다.
- **Study** — 강의/책(Learned), 레퍼런스(Reference), 인사이트(Insight)를 저장하고 분석합니다.
- **Ideas** — 콘텐츠 후보를 저장하고 Priority(P1~Someday)로 관리하는 Idea Bank입니다.
- **Lab** — 아이디어를 실제 실험(Experiment)으로 기획하고, 게시 정보를 기록합니다.
- **Review** — 게시 후 객관적 데이터(자동 비율 계산 포함)와 주관적 복기를 남깁니다.
- **Playbook** — 반복 검증된 원칙만 남기는 곳입니다.

## 데이터 구조

```
Study ─┬─ StudyIdeaLink ─┬─ Idea ── Experiment ─┬─ PublishedContent ── Performance
       └─ (sourceStudy)  └─ (source/ONE THING)  ├─ Review ── PlaybookEvidence
                                                  └─ PlaybookEvidence ── PlaybookRule
```

- 모든 참조는 대상이 삭제돼도 앱이 깨지지 않도록 옵션(nullable) FK + `onDelete: SetNull` 또는 하위 데이터만 함께 삭제되는 `onDelete: Cascade`로 설계했습니다.
- enum류 필드는 문자열로 저장하고 `app/lib/types.ts`에 union 타입 + 라벨로 제약을 걸어둡니다 (SQLite 시절 설계를 그대로 유지 — PostgreSQL 네이티브 enum으로 바꾸지 않았습니다).
