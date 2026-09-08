"use client";

import type { PlaybookRule } from "@prisma/client";
import {
  ACCOUNTS,
  ACCOUNT_LABEL,
  Account,
  PLAYBOOK_CATEGORIES,
  PLAYBOOK_CATEGORY_LABEL,
  PLAYBOOK_STATUSES,
  PLAYBOOK_STATUS_LABEL,
} from "@/app/lib/types";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";

export function PlaybookForm({
  rule,
  action,
  submitLabel = "저장",
}: {
  rule?: PlaybookRule;
  action: (formData: FormData) => void;
  submitLabel?: string;
}) {
  const selectedAccounts = new Set((rule?.appliedAccounts ?? "").split(",").filter(Boolean));

  return (
    <form action={action} className="space-y-4">
      <Field label="Rule 제목 *" htmlFor="title">
        <input id="title" name="title" required defaultValue={rule?.title} className={inputClass} autoFocus={!rule} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category">
          <select id="category" name="category" defaultValue={rule?.category ?? "OTHER"} className={inputClass}>
            {PLAYBOOK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PLAYBOOK_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="상태" htmlFor="status">
          <select id="status" name="status" defaultValue={rule?.status ?? "CANDIDATE"} className={inputClass}>
            {PLAYBOOK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PLAYBOOK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Rule 설명" htmlFor="description">
        <textarea id="description" name="description" rows={3} defaultValue={rule?.description ?? ""} className={inputClass} />
      </Field>

      <Field label="적용 계정">
        <div className="flex flex-wrap gap-2">
          {ACCOUNTS.map((a) => (
            <label
              key={a}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
            >
              <input type="checkbox" name="appliedAccounts" value={a} defaultChecked={selectedAccounts.has(a)} className="h-3 w-3" />
              {ACCOUNT_LABEL[a as Account]}
            </label>
          ))}
        </div>
      </Field>

      <Field label="적용하기 좋은 콘텐츠 시리즈" htmlFor="appliedContentIP">
        <input id="appliedContentIP" name="appliedContentIP" defaultValue={rule?.appliedContentIP ?? ""} className={inputClass} />
      </Field>

      <Field label="메모" htmlFor="memo">
        <textarea id="memo" name="memo" rows={2} defaultValue={rule?.memo ?? ""} className={inputClass} />
      </Field>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
