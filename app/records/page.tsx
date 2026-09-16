import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import {
  RECORD_TYPES,
  RECORD_TYPE_LABEL,
  RecordType,
  ACCOUNTS,
  ACCOUNT_LABEL,
  Account,
  PRIORITY_LABEL,
  Priority,
} from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";
import { inputClass } from "@/app/components/ui/Form";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  type?: string;
  account?: string;
};

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type as RecordType | undefined;
  const account = sp.account as Account | undefined;

  const records = await prisma.learningRecord.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(account ? { account } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { sourceMemo: { contains: q } },
              { takeaway: { contains: q } },
              { learning: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <SectionHeader
        title="Records"
        subtitle="배우고, 적용하고, 복기한 기록들"
        action={
          <Link
            href="/records/new"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            + 새 기록
          </Link>
        }
      />

      <form className="mb-4 space-y-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="제목, 메모, 가져갈 한 가지, 배운 점, 태그 검색"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <select name="type" defaultValue={type ?? ""} className={`${inputClass} w-auto`}>
            <option value="">전체</option>
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {RECORD_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          <select name="account" defaultValue={account ?? ""} className={`${inputClass} w-auto`}>
            <option value="">전체 계정</option>
            {ACCOUNTS.map((a) => (
              <option key={a} value={a}>
                {ACCOUNT_LABEL[a]}
              </option>
            ))}
          </select>
          <button className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-surface-hover">
            필터 적용
          </button>
        </div>
      </form>

      {records.length === 0 ? (
        <EmptyState
          title="아직 기록이 없어요"
          description="배운 것, 본 것을 저장하는 것부터 시작해보세요."
          action={
            <Link href="/records/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              첫 기록 저장하기
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {records.map((r) => {
            const excerpt = r.learning ?? r.takeaway ?? r.sourceMemo ?? "";
            const date = r.updatedAt.toISOString().slice(0, 10);
            return (
              <li key={r.id}>
                <CardLink href={`/records/${r.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className="bg-accent-soft text-accent">{RECORD_TYPE_LABEL[r.type as RecordType] ?? r.type}</Badge>
                        <Badge>{ACCOUNT_LABEL[r.account as Account] ?? r.account}</Badge>
                        <span className="text-[11px] text-muted">{date}</span>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold">{r.title}</p>
                      {excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted">{excerpt}</p>}
                    </div>
                    {r.priority === "P1" && (
                      <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        {PRIORITY_LABEL[r.priority as Priority]}
                      </span>
                    )}
                  </div>
                </CardLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
