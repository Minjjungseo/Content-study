import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ACCOUNT_LABEL, Account, RECORD_TYPE_LABEL, RecordType } from "@/app/lib/types";
import { Badge, DecisionBadge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";

// Reads the DB on every request instead of freezing a snapshot at build
// time — this page's whole point is showing the current state of Records.
export const dynamic = "force-dynamic";

function isApplied(r: { applyTitle: string | null; applyPoint: string | null; hook: string | null; plan: string | null }) {
  return Boolean(r.applyTitle || r.applyPoint || r.hook || r.plan);
}

function isReviewed(r: { good: string | null; problem: string | null; learning: string | null; views: number | null }) {
  return Boolean(r.good || r.problem || r.learning || r.views != null);
}

function RecordRow({ record, note }: { record: { id: string; title: string; type: string; account: string }; note?: string }) {
  return (
    <CardLink href={`/records/${record.id}`}>
      <div className="flex items-center gap-1.5">
        <Badge className="bg-accent-soft text-accent">{RECORD_TYPE_LABEL[record.type as RecordType] ?? record.type}</Badge>
        <Badge>{ACCOUNT_LABEL[record.account as Account] ?? record.account}</Badge>
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold">{record.title}</p>
      {note && <p className="mt-1 line-clamp-1 text-xs text-muted">{note}</p>}
    </CardLink>
  );
}

export default async function HomePage() {
  const records = await prisma.learningRecord.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const p1 = records.filter((r) => r.priority === "P1").slice(0, 5);
  const applying = records.filter((r) => isApplied(r) && !isReviewed(r)).slice(0, 5);
  const reviewed = records.filter((r) => isReviewed(r)).slice(0, 5);
  const nextOneThing = records.filter((r) => !isApplied(r) && r.takeaway).slice(0, 5);

  if (records.length === 0) {
    return (
      <EmptyState
        title="아직 기록이 없어요"
        description="배운 것, 본 것을 저장하는 것부터 시작해보세요."
        action={
          <Link href="/records/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
            첫 기록 저장하기
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Home"
        subtitle="지금 가장 중요한 기록부터"
        action={
          <Link href="/records/new" className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
            + 새 기록
          </Link>
        }
      />

      {p1.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-rose-600">지금 P1</p>
          <ul className="space-y-2">
            {p1.map((r) => (
              <li key={r.id}>
                <RecordRow record={r} note={r.applyPoint ?? r.takeaway ?? undefined} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {applying.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">최근 적용 중</p>
          <ul className="space-y-2">
            {applying.map((r) => (
              <li key={r.id}>
                <RecordRow record={r} note={r.applyPoint ?? undefined} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">최근 복기</p>
          <ul className="space-y-2">
            {reviewed.map((r) => (
              <li key={r.id}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <RecordRow record={r} note={r.learning ?? undefined} />
                  </div>
                  {r.decision && <DecisionBadge decision={r.decision} />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nextOneThing.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">다음에 적용할 ONE THING</p>
          <ul className="space-y-2">
            {nextOneThing.map((r) => (
              <li key={r.id}>
                <RecordRow record={r} note={r.takeaway ?? undefined} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
