"use client";

import { useState } from "react";
import type { Idea } from "@prisma/client";
import {
  IDEA_ACCOUNTS,
  ACCOUNT_LABEL,
  Account,
  CONTENT_IP_OPTIONS,
  PRIORITIES,
  PRIORITY_LABEL,
  CONTENT_STATUSES,
  STATUS_LABEL,
  SHOOT_DIFFICULTIES,
  SHOOT_DIFFICULTY_LABEL,
  LEVELS,
  LEVEL_LABEL,
} from "@/app/lib/types";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";

export function IdeaForm({
  idea,
  action,
  submitLabel = "저장",
}: {
  idea?: Idea;
  action: (formData: FormData) => void;
  submitLabel?: string;
}) {
  const [account, setAccount] = useState<string>(idea?.account ?? "HEYELIA");
  const [showMore, setShowMore] = useState(Boolean(idea));
  const ipOptions = CONTENT_IP_OPTIONS[account] ?? [];

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="콘텐츠 제목 *" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              defaultValue={idea?.title}
              className={inputClass}
              autoFocus={!idea}
              placeholder="어떤 콘텐츠인가요?"
            />
          </Field>
        </div>

        <Field label="계정 *" htmlFor="account">
          <select
            id="account"
            name="account"
            required
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className={inputClass}
          >
            {IDEA_ACCOUNTS.map((a) => (
              <option key={a} value={a}>
                {ACCOUNT_LABEL[a as Account]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="콘텐츠 IP / 시리즈" htmlFor="contentIP">
          <input
            id="contentIP"
            name="contentIP"
            list="ip-options"
            defaultValue={idea?.contentIP ?? ""}
            className={inputClass}
          />
          <datalist id="ip-options">
            {ipOptions.map((ip) => (
              <option key={ip} value={ip} />
            ))}
          </datalist>
        </Field>

        <Field label="Priority" htmlFor="myPriority">
          <select
            id="myPriority"
            name="myPriority"
            defaultValue={idea?.myPriority ?? "P3"}
            className={inputClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="상태" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={idea?.status ?? "IDEA"}
            className={inputClass}
          >
            {CONTENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="핵심 메시지" htmlFor="coreMessage">
            <textarea
              id="coreMessage"
              name="coreMessage"
              rows={2}
              defaultValue={idea?.coreMessage ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="간단 메모" htmlFor="memo">
            <textarea
              id="memo"
              name="memo"
              rows={2}
              defaultValue={idea?.memo ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="text-xs font-medium text-accent"
      >
        {showMore ? "상세 항목 접기 ▲" : "상세 항목 더 보기 ▼"}
      </button>

      {showMore && (
        <div className="space-y-4 rounded-xl border border-border bg-background/50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="촬영 난이도" htmlFor="shootDifficulty">
              <select
                id="shootDifficulty"
                name="shootDifficulty"
                defaultValue={idea?.shootDifficulty ?? "MEDIUM"}
                className={inputClass}
              >
                {SHOOT_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {SHOOT_DIFFICULTY_LABEL[d]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="브랜드 가치" htmlFor="brandValue">
              <select
                id="brandValue"
                name="brandValue"
                defaultValue={idea?.brandValue ?? "MEDIUM"}
                className={inputClass}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABEL[l]}
                  </option>
                ))}
              </select>
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="needsShoot"
                defaultChecked={idea?.needsShoot ?? true}
                className="h-4 w-4"
              />
              촬영 필요
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="hasExistingFootage"
                defaultChecked={idea?.hasExistingFootage ?? false}
                className="h-4 w-4"
              />
              기존 촬영본 있음
            </label>
          </div>

          <Field
            label="연결 ONE THING"
            htmlFor="oneThing"
            hint="이번 Experiment에서 실제로 테스트할 ONE THING (Study 연결 시 자동 채워집니다)"
          >
            <textarea
              id="oneThing"
              name="oneThing"
              rows={2}
              defaultValue={idea?.oneThing ?? ""}
              className={`${inputClass} font-medium`}
            />
          </Field>
        </div>
      )}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
