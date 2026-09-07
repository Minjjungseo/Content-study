import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import {
  STUDY_TYPES,
  STUDY_TYPE_LABEL,
  ACCOUNTS,
  ACCOUNT_LABEL,
  StudyType,
  Account,
} from "@/app/lib/types";
import {
  computeStudyStatus,
  studyWithProgressInclude,
  LIBRARY_STATUS_LABEL,
} from "@/app/lib/status";
import { Badge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";
import { inputClass } from "@/app/components/ui/Form";

type SearchParams = {
  q?: string;
  type?: string;
  account?: string;
  applied?: string;
};

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const type = sp.type as StudyType | undefined;
  const account = sp.account as Account | undefined;
  const applied = sp.applied;

  const studies = await prisma.study.findMany({
    where: {
      ...(type ? { studyType: type } : {}),
      ...(account ? { account } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { memo: { contains: q } },
              { oneThing: { contains: q } },
              { tags: { contains: q } },
              { sourceName: { contains: q } },
            ],
          }
        : {}),
    },
    include: studyWithProgressInclude,
    orderBy: { createdAt: "desc" },
  });

  const filtered = studies.filter((s) => {
    if (applied === "yes") return s.studyIdeaLinks.length > 0;
    if (applied === "no") return s.studyIdeaLinks.length === 0;
    return true;
  });

  return (
    <div>
      <SectionHeader
        title="Study"
        subtitle="배운 것과 본 것을 저장하고 분석하는 곳"
        action={
          <Link
            href="/study/new"
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            + 새 Study
          </Link>
        }
      />

      <form className="mb-4 space-y-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="제목, 메모, ONE THING, 태그, 출처 검색"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <select name="type" defaultValue={type ?? ""} className={`${inputClass} w-auto`}>
            <option value="">전체 Type</option>
            {STUDY_TYPES.map((t) => (
              <option key={t} value={t}>
                {STUDY_TYPE_LABEL[t]}
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
          <select name="applied" defaultValue={applied ?? ""} className={`${inputClass} w-auto`}>
            <option value="">적용 여부 전체</option>
            <option value="yes">적용됨</option>
            <option value="no">미적용</option>
          </select>
          <button className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-surface-hover">
            필터 적용
          </button>
        </div>
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          title="저장된 Study가 없어요"
          description="강의, 책, 레퍼런스, 인사이트를 저장해보세요."
          action={
            <Link
              href="/study/new"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
            >
              첫 Study 저장하기
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => {
            const libStatus = computeStudyStatus(s);
            return (
              <li key={s.id}>
                <CardLink href={`/study/${s.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className="bg-accent-soft text-accent">
                          {STUDY_TYPE_LABEL[s.studyType as StudyType] ?? s.studyType}
                        </Badge>
                        <Badge>{ACCOUNT_LABEL[s.account as Account] ?? s.account}</Badge>
                        <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300">
                          {LIBRARY_STATUS_LABEL[libStatus]}
                        </Badge>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold">{s.title}</p>
                      {s.oneThing && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          ONE THING: {s.oneThing}
                        </p>
                      )}
                    </div>
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
