import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import {
  PLAYBOOK_CATEGORIES,
  PLAYBOOK_CATEGORY_LABEL,
  PlaybookCategory,
  PLAYBOOK_STATUSES,
  PLAYBOOK_STATUS_LABEL,
  PlaybookStatus,
} from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";
import { inputClass } from "@/app/components/ui/Form";

type SearchParams = { category?: string; status?: string };

export default async function PlaybookPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const rules = await prisma.playbookRule.findMany({
    where: {
      ...(sp.category ? { category: sp.category } : {}),
      ...(sp.status ? { status: sp.status } : {}),
    },
    include: { evidence: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <SectionHeader
        title="Playbook"
        subtitle="실제 콘텐츠에서 검증된 나만의 원칙만 남기는 곳"
        action={
          <Link href="/playbook/new" className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
            + 새 Rule
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2 text-xs" method="get">
        <select name="category" defaultValue={sp.category ?? ""} className={`${inputClass} w-auto`}>
          <option value="">전체 Category</option>
          {PLAYBOOK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {PLAYBOOK_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className={`${inputClass} w-auto`}>
          <option value="">전체 상태</option>
          {PLAYBOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PLAYBOOK_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button className="rounded-lg border border-border px-3 py-2 font-medium hover:bg-surface-hover">
          필터 적용
        </button>
      </form>

      {rules.length === 0 ? (
        <EmptyState
          title="아직 Playbook Rule이 없어요"
          description="Review에서 검증된 원칙을 Playbook 후보로 추가해보세요."
        />
      ) : (
        <ul className="space-y-2">
          {rules.map((r) => (
            <li key={r.id}>
              <CardLink href={`/playbook/${r.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className="bg-accent-soft text-accent">
                        {PLAYBOOK_CATEGORY_LABEL[r.category as PlaybookCategory]}
                      </Badge>
                      <Badge
                        className={
                          r.status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300"
                        }
                      >
                        {PLAYBOOK_STATUS_LABEL[r.status as PlaybookStatus]}
                      </Badge>
                      <span className="text-xs text-muted">검증 {r.evidence.length}회</span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold">{r.title}</p>
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
