"use client";

import { useActionState } from "react";
import type { LearningRecord } from "@prisma/client";
import {
  ACCOUNTS,
  ACCOUNT_LABEL,
  PRIORITIES,
  PRIORITY_LABEL,
  RECORD_ATTACHMENT_ACCEPT,
  RECORD_ATTACHMENT_EXT_LABEL,
  RECORD_TYPES,
  RECORD_TYPE_LABEL,
} from "@/app/lib/types";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";
import { DeleteButton } from "@/app/components/ui/DeleteButton";
import type { RecordFormState } from "@/app/records/actions";

type AttachmentLite = { id: string; fileName: string; fileUrl: string; fileType: string | null };

export function SourceForm({
  record,
  attachments,
  onDeleteAttachment,
  action,
}: {
  record: LearningRecord;
  attachments: AttachmentLite[];
  onDeleteAttachment: (attachmentId: string, formData: FormData) => void;
  action: (prevState: RecordFormState, formData: FormData) => Promise<RecordFormState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <div className="space-y-5">
      {attachments.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">첨부된 파일</p>
          <ul className="space-y-1.5">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs"
              >
                <a href={a.fileUrl} target="_blank" className="min-w-0 flex-1 truncate font-medium text-accent">
                  {a.fileType && RECORD_ATTACHMENT_EXT_LABEL[a.fileType] ? `[${RECORD_ATTACHMENT_EXT_LABEL[a.fileType]}] ` : ""}
                  {a.fileName}
                </a>
                <DeleteButton
                  action={onDeleteAttachment.bind(null, a.id)}
                  label="삭제"
                  confirmMessage="이 첨부파일을 삭제할까요?"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.error}
          </div>
        )}

        <Field label="제목 *" htmlFor="title">
          <input id="title" name="title" required defaultValue={record.title} className={inputClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="종류" htmlFor="type">
            <select id="type" name="type" defaultValue={record.type} className={inputClass}>
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {RECORD_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="계정" htmlFor="account">
            <select id="account" name="account" defaultValue={record.account} className={inputClass}>
              {ACCOUNTS.map((a) => (
                <option key={a} value={a}>
                  {ACCOUNT_LABEL[a]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="우선순위" htmlFor="priority">
            <select id="priority" name="priority" defaultValue={record.priority} className={inputClass}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="태그" htmlFor="tags" hint="쉼표로 구분">
            <input id="tags" name="tags" defaultValue={record.tags ?? ""} className={inputClass} />
          </Field>
        </div>

        <Field label="출처 링크" htmlFor="sourceUrl">
          <input id="sourceUrl" name="sourceUrl" type="url" defaultValue={record.sourceUrl ?? ""} className={inputClass} />
        </Field>

        <Field label="메모" htmlFor="sourceMemo">
          <textarea id="sourceMemo" name="sourceMemo" rows={4} defaultValue={record.sourceMemo ?? ""} className={inputClass} />
        </Field>

        <Field label="내가 가져갈 한 가지" htmlFor="takeaway">
          <textarea id="takeaway" name="takeaway" rows={2} defaultValue={record.takeaway ?? ""} className={`${inputClass} font-medium`} />
        </Field>

        <Field label="첨부파일 추가" htmlFor="attachmentFiles" hint="PDF, PPT, DOC, TXT, 이미지 · 여러 개 선택 가능">
          <input
            id="attachmentFiles"
            name="attachmentFiles"
            type="file"
            accept={RECORD_ATTACHMENT_ACCEPT}
            multiple
            className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent`}
          />
        </Field>

        <SubmitButton>저장</SubmitButton>
      </form>
    </div>
  );
}
