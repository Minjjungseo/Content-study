import { prisma } from "@/app/lib/prisma";
import { PLAYBOOK_CATEGORY_LABEL, PLAYBOOK_STATUS_LABEL, PlaybookCategory, PlaybookStatus } from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import { CardLink, EmptyState, SectionHeader } from "@/app/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const rules = await prisma.playbookRule.findMany({
    include: { links: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <SectionHeader
        title="Playbook"
        subtitle="반복 검증된 나만의 콘텐츠 기준. Record의 REVIEW에서 '내 공식으로 저장'하면 여기 쌓입니다."
      />

      {rules.length === 0 ? (
        <EmptyState
          title="아직 저장된 공식이 없어요"
          description="기록을 복기하고 '내 공식으로 저장'을 눌러보세요."
        />
      ) : (
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li key={rule.id}>
              <CardLink href={`/playbook/${rule.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className="bg-accent-soft text-accent">
                        {PLAYBOOK_CATEGORY_LABEL[rule.category as PlaybookCategory] ?? rule.category}
                      </Badge>
                      <Badge
                        className={
                          rule.status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300"
                        }
                      >
                        {PLAYBOOK_STATUS_LABEL[rule.status as PlaybookStatus] ?? rule.status}
                      </Badge>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold">{rule.title}</p>
                    <p className="mt-0.5 text-xs text-muted">검증 {rule.links.length}회</p>
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
