import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { ACCOUNT_LABEL, Account, PLAYBOOK_CATEGORY_LABEL, PLAYBOOK_STATUS_LABEL, PlaybookCategory, PlaybookStatus } from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import { Card, SectionHeader } from "@/app/components/ui/Card";
import { DeleteButton } from "@/app/components/ui/DeleteButton";
import { deletePlaybookRule, setPlaybookStatus } from "@/app/playbook/actions";

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rule = await prisma.playbookRule.findUnique({
    where: { id },
    include: {
      links: { include: { record: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!rule) notFound();

  const boundDelete = deletePlaybookRule.bind(null, rule.id);
  const boundStatus = setPlaybookStatus.bind(null, rule.id);

  const accounts = (rule.appliedAccounts ?? "").split(",").filter(Boolean);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
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
          <span className="text-xs text-muted">검증 {rule.links.length}회</span>
        </div>
        <h1 className="mt-2 text-lg font-bold">{rule.title}</h1>
        {rule.description && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{rule.description}</p>}

        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
          {accounts.length > 0 && (
            <span>적용 계정: {accounts.map((a) => ACCOUNT_LABEL[a as Account] ?? a).join(", ")}</span>
          )}
          {rule.appliedContentIP && <span>· 콘텐츠 시리즈: {rule.appliedContentIP}</span>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <form action={boundStatus}>
            <input type="hidden" name="status" value={rule.status === "VERIFIED" ? "CANDIDATE" : "VERIFIED"} />
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover">
              {rule.status === "VERIFIED" ? "검증 중으로 되돌리기" : "검증됨으로 변경"}
            </button>
          </form>
          <DeleteButton action={boundDelete} />
        </div>
      </div>

      <Card>
        <SectionHeader title="관련 원본 Record" />
        {rule.links.length === 0 ? (
          <p className="text-sm text-muted">아직 연결된 기록이 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {rule.links.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/records/${l.record.id}`}
                  className="block rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-accent/40 hover:text-accent"
                >
                  {l.record.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
