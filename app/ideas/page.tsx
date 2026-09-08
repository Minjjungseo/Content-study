import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import {
  IDEA_ACCOUNTS,
  ACCOUNT_LABEL,
  Account,
  PRIORITIES,
  Priority,
  CONTENT_STATUSES,
  SHOOT_DIFFICULTIES,
  ShootDifficulty,
  SHOOT_DIFFICULTY_LABEL,
} from "@/app/lib/types";
import { PriorityBadge, StatusBadge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";
import { inputClass } from "@/app/components/ui/Form";

type SearchParams = {
  account?: string;
  priority?: string;
  ip?: string;
  status?: string;
  difficulty?: string;
  studyLinked?: string;
};

const PRIORITY_ORDER: Record<Priority, number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  SOMEDAY: 3,
};

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const ideas = await prisma.idea.findMany({
    where: {
      ...(sp.account ? { account: sp.account } : {}),
      ...(sp.priority ? { myPriority: sp.priority } : {}),
      ...(sp.ip ? { contentIP: sp.ip } : {}),
      ...(sp.status ? { status: sp.status } : {}),
      ...(sp.difficulty ? { shootDifficulty: sp.difficulty } : {}),
    },
    include: { sourceStudy: true, studyLinks: true },
    orderBy: { createdAt: "desc" },
  });

  const filtered = ideas.filter((i) => {
    if (sp.studyLinked === "yes") return i.studyLinks.length > 0;
    if (sp.studyLinked === "no") return i.studyLinks.length === 0;
    return true;
  });

  filtered.sort(
    (a, b) =>
      PRIORITY_ORDER[a.myPriority as Priority] -
      PRIORITY_ORDER[b.myPriority as Priority]
  );

  const ips = [...new Set(ideas.map((i) => i.contentIP).filter(Boolean))] as string[];

  return (
    <div>
      <SectionHeader
        title="Ideas"
        subtitle="콘텐츠 후보를 저장하고 우선순위를 정하는 Idea Bank"
        action={
          <Link
            href="/ideas/new"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            + 새 아이디어
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2 text-xs" method="get">
        <select name="account" defaultValue={sp.account ?? ""} className={`${inputClass} w-auto`}>
          <option value="">전체 계정</option>
          {IDEA_ACCOUNTS.map((a) => (
            <option key={a} value={a}>
              {ACCOUNT_LABEL[a as Account]}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue={sp.priority ?? ""} className={`${inputClass} w-auto`}>
          <option value="">전체 Priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className={`${inputClass} w-auto`}>
          <option value="">전체 상태</option>
          {CONTENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="difficulty" defaultValue={sp.difficulty ?? ""} className={`${inputClass} w-auto`}>
          <option value="">전체 난이도</option>
          {SHOOT_DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {SHOOT_DIFFICULTY_LABEL[d as ShootDifficulty]}
            </option>
          ))}
        </select>
        {ips.length > 0 && (
          <select name="ip" defaultValue={sp.ip ?? ""} className={`${inputClass} w-auto`}>
            <option value="">전체 콘텐츠 시리즈</option>
            {ips.map((ip) => (
              <option key={ip} value={ip}>
                {ip}
              </option>
            ))}
          </select>
        )}
        <select name="studyLinked" defaultValue={sp.studyLinked ?? ""} className={`${inputClass} w-auto`}>
          <option value="">Study 연결 전체</option>
          <option value="yes">연결됨</option>
          <option value="no">미연결</option>
        </select>
        <button className="rounded-lg border border-border px-3 py-2 font-medium hover:bg-surface-hover">
          필터 적용
        </button>
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          title="아이디어가 없어요"
          description="콘텐츠 후보를 저장하고 우선순위를 정해보세요."
          action={
            <Link href="/ideas/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              첫 아이디어 만들기
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((i) => (
            <li key={i.id}>
              <CardLink href={`/ideas/${i.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PriorityBadge priority={i.myPriority} />
                      <StatusBadge status={i.status} />
                      {i.contentIP && (
                        <span className="text-xs text-muted">{i.contentIP}</span>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold">{i.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {ACCOUNT_LABEL[i.account as Account]}
                      {i.studyLinks.length > 0 && ` · Study ${i.studyLinks.length}개 연결`}
                    </p>
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
