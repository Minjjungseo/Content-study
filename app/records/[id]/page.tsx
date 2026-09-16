import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  ACCOUNT_LABEL,
  Account,
  RECORD_ATTACHMENT_EXT_LABEL,
  RECORD_TYPE_LABEL,
  RecordType,
  PRIORITY_LABEL,
  Priority,
} from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import { Card, SectionHeader } from "@/app/components/ui/Card";
import { DeleteButton } from "@/app/components/ui/DeleteButton";
import {
  updateApply,
  updateReview,
  updateNext,
  deleteRecord,
  saveAsPlaybook,
} from "@/app/records/actions";
import { ApplySection, ReviewSection, NextSection, SaveAsPlaybookCard } from "@/app/records/RecordSections";

export const dynamic = "force-dynamic";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.learningRecord.findUnique({
    where: { id },
    include: {
      attachments: { orderBy: { createdAt: "desc" } },
      playbookLinks: { include: { playbookRule: true } },
    },
  });
  if (!record) notFound();

  const tags = (record.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  const boundUpdateApply = updateApply.bind(null, record.id);
  const boundUpdateReview = updateReview.bind(null, record.id);
  const boundUpdateNext = updateNext.bind(null, record.id);
  const boundDelete = deleteRecord.bind(null, record.id);
  const boundSaveAsPlaybook = saveAsPlaybook.bind(null, record.id);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-accent-soft text-accent">{RECORD_TYPE_LABEL[record.type as RecordType] ?? record.type}</Badge>
          <Badge>{ACCOUNT_LABEL[record.account as Account] ?? record.account}</Badge>
          <Badge>{PRIORITY_LABEL[record.priority as Priority] ?? record.priority}</Badge>
        </div>
        <h1 className="mt-2 text-lg font-bold">{record.title}</h1>
        {record.sourceUrl && (
          <a href={record.sourceUrl} target="_blank" className="mt-1 inline-block text-xs text-accent underline">
            원본 링크
          </a>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <Badge key={t}>#{t}</Badge>
            ))}
          </div>
        )}
        <div className="mt-3 flex gap-3">
          <Link href={`/records/${record.id}/edit`} className="text-xs font-medium text-accent">
            SOURCE 수정
          </Link>
          <DeleteButton action={boundDelete} confirmMessage="이 기록을 삭제할까요? 되돌릴 수 없습니다." />
        </div>
      </div>

      {(record.sourceMemo || record.takeaway) && (
        <Card>
          <SectionHeader title="SOURCE · 원본" />
          {record.sourceMemo && (
            <p className="whitespace-pre-wrap text-sm text-foreground">{record.sourceMemo}</p>
          )}
          {record.takeaway && (
            <div className="mt-3 rounded-lg bg-accent-soft p-3">
              <p className="text-xs font-medium text-accent">내가 가져갈 한 가지</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{record.takeaway}</p>
            </div>
          )}
        </Card>
      )}

      {record.attachments.length > 0 && (
        <Card>
          <SectionHeader title="첨부파일" />
          <ul className="space-y-1.5">
            {record.attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={a.fileUrl}
                  target="_blank"
                  className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm text-accent hover:bg-surface-hover"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {a.fileType && RECORD_ATTACHMENT_EXT_LABEL[a.fileType] ? `[${RECORD_ATTACHMENT_EXT_LABEL[a.fileType]}] ` : ""}
                    {a.fileName}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ApplySection record={record} account={record.account} defaultApplyPoint={record.takeaway} action={boundUpdateApply} />
      <ReviewSection record={record} action={boundUpdateReview} />
      <NextSection record={record} action={boundUpdateNext} />

      <SaveAsPlaybookCard record={record} action={boundSaveAsPlaybook} />

      {record.playbookLinks.length > 0 && (
        <Card>
          <SectionHeader title="연결된 Playbook" />
          <ul className="space-y-1.5">
            {record.playbookLinks.map((l) => (
              <li key={l.id}>
                <Link href={`/playbook/${l.playbookRule.id}`} className="text-sm text-accent hover:underline">
                  {l.playbookRule.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
