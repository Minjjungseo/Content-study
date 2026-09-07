import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  ACCOUNT_LABEL,
  Account,
  PLAYBOOK_CATEGORY_LABEL,
  PlaybookCategory,
} from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import { Card, SectionHeader } from "@/app/components/ui/Card";
import { DeleteButton } from "@/app/components/ui/DeleteButton";
import { inputClass, SubmitButton } from "@/app/components/ui/Form";
import {
  deletePlaybookRule,
  setPlaybookStatus,
  addEvidence,
  removeEvidence,
} from "@/app/playbook/actions";

export default async function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rule = await prisma.playbookRule.findUnique({
    where: { id },
    include: {
      evidence: {
        include: { experiment: { include: { idea: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!rule) notFound();

  const linkedExperimentIds = new Set(rule.evidence.map((e) => e.experimentId));
  const candidateExperiments = await prisma.experiment.findMany({
    where: { id: { notIn: [...linkedExperimentIds] } },
    include: { idea: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const boundDelete = deletePlaybookRule.bind(null, rule.id);
  const boundStatus = setPlaybookStatus.bind(null, rule.id);
  const boundAddEvidence = addEvidence.bind(null, rule.id);

  const accounts = (rule.appliedAccounts ?? "").split(",").filter(Boolean);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-accent-soft text-accent">
            {PLAYBOOK_CATEGORY_LABEL[rule.category as PlaybookCategory]}
          </Badge>
          <Badge
            className={
              rule.status === "VERIFIED"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300"
            }
          >
            {rule.status}
          </Badge>
          <span className="text-xs text-muted">검증 {rule.evidence.length}회</span>
        </div>
        <h1 className="mt-2 text-lg font-bold">{rule.title}</h1>
        {rule.description && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{rule.description}</p>}

        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
          {accounts.length > 0 && (
            <span>적용 계정: {accounts.map((a) => ACCOUNT_LABEL[a as Account] ?? a).join(", ")}</span>
          )}
          {rule.appliedContentIP && <span>· IP: {rule.appliedContentIP}</span>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <form action={boundStatus}>
            <input type="hidden" name="status" value={rule.status === "VERIFIED" ? "CANDIDATE" : "VERIFIED"} />
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover">
              {rule.status === "VERIFIED" ? "Candidate로 되돌리기" : "Verified로 변경"}
            </button>
          </form>
          <Link href={`/playbook/${rule.id}/edit`} className="text-xs font-medium text-accent">
            수정
          </Link>
          <DeleteButton action={boundDelete} />
        </div>
      </div>

      {rule.memo && (
        <Card>
          <SectionHeader title="메모" />
          <p className="whitespace-pre-wrap text-sm text-foreground">{rule.memo}</p>
        </Card>
      )}

      <Card>
        <SectionHeader title="근거가 된 Experiment (Evidence)" />
        {rule.evidence.length === 0 ? (
          <p className="text-sm text-muted">아직 연결된 Experiment가 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {rule.evidence.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <Link href={`/lab/${e.experiment.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">
                  {e.experiment.idea.title}
                </Link>
                <form action={removeEvidence.bind(null, e.id, rule.id)}>
                  <button className="text-xs text-muted hover:text-rose-600">연결 해제</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {candidateExperiments.length > 0 && (
          <form action={boundAddEvidence} className="mt-4 space-y-2 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted">Experiment 연결</p>
            <select name="experimentId" required className={inputClass}>
              <option value="">Experiment 선택</option>
              {candidateExperiments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.idea.title}
                </option>
              ))}
            </select>
            <SubmitButton className="w-full">근거로 추가</SubmitButton>
          </form>
        )}
      </Card>
    </div>
  );
}
