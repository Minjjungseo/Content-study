import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ACCOUNT_LABEL, Account, EXPERIMENT_STATUSES } from "@/app/lib/types";
import { StatusBadge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";

const STATUS_ORDER: Record<string, number> = Object.fromEntries(
  EXPERIMENT_STATUSES.map((s, i) => [s, i])
);

// Reads the DB on every request instead of freezing a snapshot at build time.
export const dynamic = "force-dynamic";

export default async function LabPage() {
  const experiments = await prisma.experiment.findMany({
    include: { idea: true, review: true },
    orderBy: { createdAt: "desc" },
  });

  experiments.sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));

  return (
    <div>
      <SectionHeader
        title="Lab"
        subtitle="배운 것을 내 것으로 바꾸는 실험실 — 한 콘텐츠 = 한 가지 실험"
      />

      {experiments.length === 0 ? (
        <EmptyState
          title="진행 중인 Experiment가 없어요"
          description="Ideas에서 콘텐츠를 고르고 '실험 시작하기'를 눌러보세요."
          action={
            <Link href="/ideas" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              Ideas로 이동
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {experiments.map((e) => (
            <li key={e.id}>
              <CardLink href={`/lab/${e.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted">
                        {ACCOUNT_LABEL[e.idea.account as Account]}
                      </span>
                      {e.review && (
                        <span className="text-[11px] font-semibold text-emerald-600">
                          복기 완료
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold">{e.idea.title}</p>
                    {e.oneThingToTest && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">
                        ONE THING TO TEST: {e.oneThingToTest}
                      </p>
                    )}
                  </div>
                </div>
              </CardLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
