import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import {
  ACCOUNT_LABEL,
  Account,
  Priority,
  STUDY_TYPE_LABEL,
  StudyType,
} from "@/app/lib/types";
import { PriorityBadge, StatusBadge, ResultBadge } from "@/app/components/ui/Badge";
import { Card, CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";

const PRIORITY_ORDER: Record<Priority, number> = { P1: 0, P2: 1, P3: 2, SOMEDAY: 3 };

// Reads the DB on every request instead of freezing a snapshot at build
// time — this page's whole point is showing the current ONE THING/Idea.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [focusExperimentP1, focusExperimentAny, activeIdeas, recentStudies, recentReviews, counts] =
    await Promise.all([
      prisma.experiment.findFirst({
        where: { status: { not: "REVIEWED" }, idea: { myPriority: "P1" } },
        include: { idea: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.experiment.findFirst({
        where: { status: { not: "REVIEWED" } },
        include: { idea: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.idea.findMany({
        where: { status: { notIn: ["PUBLISHED", "REVIEWED"] } },
        include: { studyLinks: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.study.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
      prisma.experiment.findMany({
        where: { review: { isNot: null } },
        include: { idea: true, review: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      Promise.all([
        prisma.study.count(),
        prisma.idea.count({ where: { studyLinks: { some: {} } } }),
        prisma.experiment.count({ where: { review: { isNot: null } } }),
        prisma.playbookRule.count(),
      ]),
    ]);

  const focusExperiment = focusExperimentP1 ?? focusExperimentAny;

  activeIdeas.sort(
    (a, b) => PRIORITY_ORDER[a.myPriority as Priority] - PRIORITY_ORDER[b.myPriority as Priority]
  );
  const nextContent = activeIdeas.slice(0, 5);

  const [studyCount, appliedCount, reviewedCount, playbookCount] = counts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold">Home</h1>
        <p className="mt-1 text-sm text-muted">
          지금 적용할 ONE THING과 다음에 만들 콘텐츠를 먼저 확인하세요.
        </p>
      </div>

      <div>
        <SectionHeader title="이번 Study Focus" />
        {focusExperiment ? (
          <Card className="border-accent/30 bg-accent-soft">
            <p className="text-xs font-medium text-accent">이번에 연습할 ONE THING</p>
            <p className="mt-1 text-base font-bold text-foreground">
              {focusExperiment.oneThingToTest ?? "ONE THING을 아직 정하지 않았어요"}
            </p>
            <p className="mt-3 text-xs text-muted">연결 콘텐츠</p>
            <p className="text-sm font-medium text-foreground">{focusExperiment.idea.title}</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={focusExperiment.status} />
              <PriorityBadge priority={focusExperiment.idea.myPriority} />
            </div>
            <Link
              href={`/lab/${focusExperiment.id}`}
              className="mt-4 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              실험 계속하기 →
            </Link>
          </Card>
        ) : (
          <EmptyState
            title="진행 중인 실험이 없어요"
            description="Study를 저장하고 ONE THING을 골라 Idea에 적용해보세요."
            action={
              <Link href="/study/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
                Study 저장하기
              </Link>
            }
          />
        )}
      </div>

      <div>
        <SectionHeader
          title="다음에 만들 콘텐츠"
          subtitle="Priority 기준 상위 아이디어"
          action={
            <Link href="/ideas" className="text-xs font-medium text-accent">
              전체 보기 →
            </Link>
          }
        />
        {nextContent.length === 0 ? (
          <EmptyState title="대기 중인 아이디어가 없어요" />
        ) : (
          <ul className="space-y-2">
            {nextContent.map((i) => (
              <li key={i.id}>
                <CardLink href={`/ideas/${i.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <PriorityBadge priority={i.myPriority} />
                        <StatusBadge status={i.status} />
                        <span className="text-xs text-muted">{ACCOUNT_LABEL[i.account as Account]}</span>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold">{i.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {i.contentIP ?? "시리즈 미정"}
                        {" · "}
                        {i.studyLinks.length > 0 ? "Study 연결됨" : "Study 미연결"}
                      </p>
                    </div>
                  </div>
                </CardLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <SectionHeader
            title="최근 Study"
            action={
              <Link href="/study" className="text-xs font-medium text-accent">
                전체 보기 →
              </Link>
            }
          />
          {recentStudies.length === 0 ? (
            <EmptyState title="저장된 Study가 없어요" />
          ) : (
            <ul className="space-y-2">
              {recentStudies.map((s) => (
                <li key={s.id}>
                  <CardLink href={`/study/${s.id}`} className="p-3">
                    <p className="text-xs text-accent">{STUDY_TYPE_LABEL[s.studyType as StudyType]}</p>
                    <p className="mt-0.5 truncate text-sm font-medium">{s.title}</p>
                  </CardLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <SectionHeader
            title="최근 Review"
            action={
              <Link href="/review" className="text-xs font-medium text-accent">
                전체 보기 →
              </Link>
            }
          />
          {recentReviews.length === 0 ? (
            <EmptyState title="아직 복기한 콘텐츠가 없어요" />
          ) : (
            <ul className="space-y-2">
              {recentReviews.map((e) => (
                <li key={e.id}>
                  <CardLink href={`/review/${e.id}`} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-medium">{e.idea.title}</p>
                      {e.review?.result && <ResultBadge result={e.review.result} />}
                    </div>
                  </CardLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Card>
        <p className="mb-3 text-xs font-semibold text-muted">SUMMARY</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{studyCount}</p>
            <p className="text-[11px] text-muted">Study</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-accent">{appliedCount}</p>
            <p className="text-[11px] font-medium text-accent">Applied</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{reviewedCount}</p>
            <p className="text-[11px] text-muted">Reviewed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{playbookCount}</p>
            <p className="text-[11px] text-muted">Playbook</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
