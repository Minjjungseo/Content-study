"use client";

import { useActionState } from "react";
import {
  ACCOUNTS,
  ACCOUNT_LABEL,
  PRIORITIES,
  PRIORITY_LABEL,
  RECORD_TYPES,
  RECORD_TYPE_LABEL,
} from "@/app/lib/types";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";
import type { RecordFormState } from "@/app/records/actions";

export function RecordForm({
  action,
}: {
  action: (prevState: RecordFormState, formData: FormData) => Promise<RecordFormState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      <Field label="제목 *" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          autoFocus
          placeholder="무엇을 저장하나요?"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="종류" htmlFor="type">
          <select id="type" name="type" defaultValue="LECTURE" className={inputClass}>
            {RECORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {RECORD_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="계정" htmlFor="account">
          <select id="account" name="account" defaultValue="COMMON" className={inputClass}>
            {ACCOUNTS.map((a) => (
              <option key={a} value={a}>
                {ACCOUNT_LABEL[a]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="출처 링크" htmlFor="sourceUrl" hint="선택 사항">
        <input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://" className={inputClass} />
      </Field>

      <Field label="메모" htmlFor="sourceMemo">
        <textarea
          id="sourceMemo"
          name="sourceMemo"
          rows={3}
          placeholder="무엇을 보고 배웠는지 편하게 적어두세요"
          className={inputClass}
        />
      </Field>

      <Field
        label="내가 가져갈 한 가지"
        htmlFor="takeaway"
        hint="이 자료에서 다음 콘텐츠에 딱 하나 적용한다면?"
      >
        <textarea id="takeaway" name="takeaway" rows={2} className={`${inputClass} font-medium`} />
      </Field>

      <Field label="우선순위" htmlFor="priority">
        <select id="priority" name="priority" defaultValue="P2" className={inputClass}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </Field>

      <SubmitButton>저장하기</SubmitButton>
    </form>
  );
}
