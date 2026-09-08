import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ACCOUNT_LABEL, Account } from "@/app/lib/types";
import { ResultBadge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";

// Reads the DB on every request instead of freezing a snapshot at build time.
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const experiments = await prisma.experiment.findMany({
    where: { publishedContents: { some: {} } },
    include: { idea: true, review: true, publishedContents: true },
    orderBy: { createdAt: "desc" },
  });

  const needsReview = experiments.filter((e) => !e.review);
  const reviewed = experiments.filter((e) => e.review);

  return (
    <div>
      <SectionHeader title="Review" subtitle="게시 후 객관적 성과와 주관적 복기를 남기는 곳" />

      {experiments.length === 0 ? (
        <EmptyState
          title="게시된 콘텐츠가 없어요"
          description="Lab에서 Experiment를 게시하면 여기서 복기할 수 있어요."
          action={
            <Link href="/lab" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              Lab으로 이동
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {needsReview.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-rose-600">복기 대기 ({needsReview.length})</p>
              <ul className="space-y-2">
                {needsReview.map((e) => (
                  <li key={e.id}>
                    <CardLink href={`/review/${e.id}`}>
                      <p className="text-sm font-semibold">{e.idea.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {ACCOUNT_LABEL[e.idea.account as Account]} · {e.publishedContents.length}개 플랫폼 게시
                      </p>
                    </CardLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reviewed.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted">복기 완료 ({reviewed.length})</p>
              <ul className="space-y-2">
                {reviewed.map((e) => (
                  <li key={e.id}>
                    <CardLink href={`/review/${e.id}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-semibold">{e.idea.title}</p>
                        {e.review?.result && <ResultBadge result={e.review.result} />}
                      </div>
                      {e.oneThingToTest && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted">{e.oneThingToTest}</p>
                      )}
                    </CardLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
