# Content Study Lab

배운 것을 저장하고 → ONE THING을 고르고 → 콘텐츠에 적용하고 → 게시 후 복기해서 → 나만의 콘텐츠 공식(Playbook)으로 쌓는 개인용 콘텐츠 스터디 앱입니다.

```
SAVE → ANALYZE → ONE THING → IDEA → PLAN → PUBLISH → REVIEW → PLAYBOOK
```

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Prisma + SQLite (로컬 파일 DB, `prisma/dev.db`)
- Server Actions로 모든 CRUD 처리 (별도 API 레이어 없음)

## Getting Started

```bash
npm install
npx prisma migrate dev   # DB 생성 + 마이그레이션 적용
npm run db:seed          # 데모 데이터 삽입 (이미 데이터가 있으면 스킵)
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

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
- SQLite는 네이티브 enum을 지원하지 않아, enum류 필드는 문자열로 저장하고 `app/lib/types.ts`에 union 타입 + 라벨로 제약을 걸어둡니다.
