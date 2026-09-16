"use client";

import { useActionState, useState } from "react";
import type { LearningRecord } from "@prisma/client";
import {
  CONTENT_SERIES_OPTIONS,
  DECISIONS,
  DECISION_LABEL,
  Decision,
} from "@/app/lib/types";
import { computeRatios, formatNumber, formatPercent } from "@/app/lib/calc";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";
import { Card, SectionHeader } from "@/app/components/ui/Card";
import type { RecordFormState } from "@/app/records/actions";

type UpdateAction = (prevState: RecordFormState, formData: FormData) => Promise<RecordFormState>;

function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
      {error}
    </div>
  );
}

function SectionShell({
  title,
  filled,
  emptyLabel,
  children,
}: {
  title: string;
  filled: boolean;
  emptyLabel: string;
  children: (editing: boolean, setEditing: (v: boolean) => void) => React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <SectionHeader title={title} />
        {filled && !editing && (
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-accent">
            수정
          </button>
        )}
      </div>
      {!filled && !editing ? (
        <button
          onClick={() => setEditing(true)}
          className="w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent"
        >
          + {emptyLabel}
        </button>
      ) : (
        children(editing, setEditing)
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// APPLY
// ---------------------------------------------------------------------------

export function ApplySection({
  record,
  account,
  defaultApplyPoint,
  action,
}: {
  record: LearningRecord;
  account: string;
  defaultApplyPoint: string | null;
  action: UpdateAction;
}) {
  const [state, formAction] = useActionState(action, {});
  const filled = Boolean(record.applyTitle || record.applyPoint || record.hook || record.plan);
  const ipOptions = CONTENT_SERIES_OPTIONS[account] ?? [];

  return (
    <SectionShell title="APPLY · 적용" filled={filled} emptyLabel="적용 기록하기">
      {(editing, setEditing) =>
        editing ? (
          <form action={formAction} className="space-y-3">
            <ErrorBanner error={state?.error} />
            <Field label="적용 콘텐츠 제목" htmlFor="applyTitle">
              <input
                id="applyTitle"
                name="applyTitle"
                defaultValue={record.applyTitle ?? ""}
                className={inputClass}
                placeholder="실제로 만들 콘텐츠 제목"
              />
            </Field>
            <Field label="콘텐츠 시리즈" htmlFor="contentSeries" hint="선택 사항">
              <input
                id="contentSeries"
                name="contentSeries"
                list="content-series-options"
                defaultValue={record.contentSeries ?? ""}
                className={inputClass}
              />
              <datalist id="content-series-options">
                {ipOptions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="이번에 적용할 한 가지" htmlFor="applyPoint">
              <textarea
                id="applyPoint"
                name="applyPoint"
                rows={2}
                defaultValue={record.applyPoint ?? defaultApplyPoint ?? ""}
                className={`${inputClass} font-medium`}
              />
            </Field>
            <Field label="Hook" htmlFor="hook">
              <input id="hook" name="hook" defaultValue={record.hook ?? ""} className={inputClass} />
            </Field>
            <Field label="간단한 기획" htmlFor="plan">
              <textarea id="plan" name="plan" rows={3} defaultValue={record.plan ?? ""} className={inputClass} />
            </Field>
            <Field label="촬영 메모" htmlFor="shootingMemo">
              <textarea
                id="shootingMemo"
                name="shootingMemo"
                rows={2}
                defaultValue={record.shootingMemo ?? ""}
                className={inputClass}
              />
            </Field>
            <div className="flex gap-2">
              <SubmitButton>저장</SubmitButton>
              {filled && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-xs font-medium text-muted"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        ) : (
          <dl className="space-y-2 text-sm">
            {record.applyTitle && (
              <div>
                <dt className="text-xs font-medium text-muted">적용 콘텐츠 제목</dt>
                <dd className="font-semibold text-foreground">{record.applyTitle}</dd>
              </div>
            )}
            {record.contentSeries && (
              <div>
                <dt className="text-xs font-medium text-muted">콘텐츠 시리즈</dt>
                <dd className="text-foreground">{record.contentSeries}</dd>
              </div>
            )}
            {record.applyPoint && (
              <div>
                <dt className="text-xs font-medium text-muted">이번에 적용할 한 가지</dt>
                <dd className="font-medium text-foreground">{record.applyPoint}</dd>
              </div>
            )}
            {record.hook && (
              <div>
                <dt className="text-xs font-medium text-muted">Hook</dt>
                <dd className="text-foreground">{record.hook}</dd>
              </div>
            )}
            {record.plan && (
              <div>
                <dt className="text-xs font-medium text-muted">간단한 기획</dt>
                <dd className="whitespace-pre-wrap text-foreground">{record.plan}</dd>
              </div>
            )}
            {record.shootingMemo && (
              <div>
                <dt className="text-xs font-medium text-muted">촬영 메모</dt>
                <dd className="whitespace-pre-wrap text-foreground">{record.shootingMemo}</dd>
              </div>
            )}
          </dl>
        )
      }
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// REVIEW
// ---------------------------------------------------------------------------

export function ReviewSection({ record, action }: { record: LearningRecord; action: UpdateAction }) {
  const [state, formAction] = useActionState(action, {});
  const filled = Boolean(
    record.publishedUrl || record.good || record.problem || record.learning || record.views != null
  );
  const ratios = computeRatios({
    reach: record.reach,
    saves: record.saves,
    shares: record.shares,
    comments: record.comments,
    follows: record.follows,
  });

  return (
    <SectionShell title="REVIEW · 복기" filled={filled} emptyLabel="복기 기록하기">
      {(editing, setEditing) =>
        editing ? (
          <form action={formAction} className="space-y-4">
            <ErrorBanner error={state?.error} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="게시 링크" htmlFor="publishedUrl">
                <input id="publishedUrl" name="publishedUrl" type="url" defaultValue={record.publishedUrl ?? ""} className={inputClass} />
              </Field>
              <Field label="게시일" htmlFor="publishedAt">
                <input
                  id="publishedAt"
                  name="publishedAt"
                  type="date"
                  defaultValue={record.publishedAt ? record.publishedAt.toISOString().slice(0, 10) : ""}
                  className={inputClass}
                />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-foreground">객관 데이터 (확인 가능한 값만)</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="조회수" htmlFor="views">
                  <input id="views" name="views" type="number" defaultValue={record.views ?? ""} className={inputClass} />
                </Field>
                <Field label="도달" htmlFor="reach">
                  <input id="reach" name="reach" type="number" defaultValue={record.reach ?? ""} className={inputClass} />
                </Field>
                <Field label="평균 시청(초)" htmlFor="avgWatchTime">
                  <input id="avgWatchTime" name="avgWatchTime" type="number" step="0.1" defaultValue={record.avgWatchTime ?? ""} className={inputClass} />
                </Field>
                <Field label="유지율(%)" htmlFor="retentionRate">
                  <input id="retentionRate" name="retentionRate" type="number" step="0.1" defaultValue={record.retentionRate ?? ""} className={inputClass} />
                </Field>
                <Field label="저장" htmlFor="saves">
                  <input id="saves" name="saves" type="number" defaultValue={record.saves ?? ""} className={inputClass} />
                </Field>
                <Field label="공유" htmlFor="shares">
                  <input id="shares" name="shares" type="number" defaultValue={record.shares ?? ""} className={inputClass} />
                </Field>
                <Field label="댓글" htmlFor="comments">
                  <input id="comments" name="comments" type="number" defaultValue={record.comments ?? ""} className={inputClass} />
                </Field>
                <Field label="팔로우" htmlFor="follows">
                  <input id="follows" name="follows" type="number" defaultValue={record.follows ?? ""} className={inputClass} />
                </Field>
              </div>
            </div>

            <Field label="잘된 것" htmlFor="good">
              <textarea id="good" name="good" rows={2} defaultValue={record.good ?? ""} className={inputClass} />
            </Field>
            <Field label="아쉬운 것" htmlFor="problem">
              <textarea id="problem" name="problem" rows={2} defaultValue={record.problem ?? ""} className={inputClass} />
            </Field>
            <Field label="그래서 배운 것" htmlFor="learning">
              <textarea id="learning" name="learning" rows={2} defaultValue={record.learning ?? ""} className={`${inputClass} font-medium`} />
            </Field>

            <div className="flex gap-2">
              <SubmitButton>저장</SubmitButton>
              {filled && (
                <button type="button" onClick={() => setEditing(false)} className="text-xs font-medium text-muted">
                  취소
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-sm">
            {record.views != null || record.reach != null ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="조회수" value={formatNumber(record.views)} />
                <Stat label="도달" value={formatNumber(record.reach)} />
                <Stat label="저장률" value={formatPercent(ratios.saveRate)} />
                <Stat label="공유율" value={formatPercent(ratios.shareRate)} />
                <Stat label="댓글률" value={formatPercent(ratios.commentRate)} />
                <Stat label="팔로우율" value={formatPercent(ratios.followRate)} />
                <Stat label="평균 시청" value={record.avgWatchTime != null ? `${record.avgWatchTime}초` : "—"} />
                <Stat label="유지율" value={record.retentionRate != null ? `${record.retentionRate}%` : "—"} />
              </div>
            ) : null}
            {record.publishedUrl && (
              <a href={record.publishedUrl} target="_blank" className="text-xs text-accent underline">
                게시물 보기
              </a>
            )}
            <dl className="space-y-2">
              {record.good && (
                <div>
                  <dt className="text-xs font-medium text-muted">잘된 것</dt>
                  <dd className="text-foreground">{record.good}</dd>
                </div>
              )}
              {record.problem && (
                <div>
                  <dt className="text-xs font-medium text-muted">아쉬운 것</dt>
                  <dd className="text-foreground">{record.problem}</dd>
                </div>
              )}
              {record.learning && (
                <div>
                  <dt className="text-xs font-medium text-muted">그래서 배운 것</dt>
                  <dd className="font-medium text-foreground">{record.learning}</dd>
                </div>
              )}
            </dl>
          </div>
        )
      }
    </SectionShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/60 p-2 text-center">
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NEXT
// ---------------------------------------------------------------------------

export function NextSection({ record, action }: { record: LearningRecord; action: UpdateAction }) {
  const [state, formAction] = useActionState(action, {});
  const filled = Boolean(record.nextThing || record.decision);

  return (
    <SectionShell title="NEXT · 다음" filled={filled} emptyLabel="다음 기록하기">
      {(editing, setEditing) =>
        editing ? (
          <form action={formAction} className="space-y-3">
            <ErrorBanner error={state?.error} />
            <Field label="다음에 바꿀 한 가지" htmlFor="nextThing">
              <textarea id="nextThing" name="nextThing" rows={2} defaultValue={record.nextThing ?? ""} className={`${inputClass} font-medium`} />
            </Field>
            <Field label="판정" htmlFor="decision">
              <select id="decision" name="decision" defaultValue={record.decision ?? ""} className={inputClass}>
                <option value="">선택 안 함</option>
                {DECISIONS.map((d) => (
                  <option key={d} value={d}>
                    {DECISION_LABEL[d]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2">
              <SubmitButton>저장</SubmitButton>
              {filled && (
                <button type="button" onClick={() => setEditing(false)} className="text-xs font-medium text-muted">
                  취소
                </button>
              )}
            </div>
          </form>
        ) : (
          <dl className="space-y-2 text-sm">
            {record.nextThing && (
              <div>
                <dt className="text-xs font-medium text-muted">다음에 바꿀 한 가지</dt>
                <dd className="font-medium text-foreground">{record.nextThing}</dd>
              </div>
            )}
            {record.decision && (
              <div>
                <dt className="text-xs font-medium text-muted">판정</dt>
                <dd className="text-foreground">{DECISION_LABEL[record.decision as Decision] ?? record.decision}</dd>
              </div>
            )}
          </dl>
        )
      }
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// Save as Playbook
// ---------------------------------------------------------------------------

export function SaveAsPlaybookCard({
  record,
  action,
}: {
  record: LearningRecord;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  if (record.playbookSaved) {
    return (
      <Card className="border-accent/30 bg-accent-soft">
        <p className="text-sm font-medium text-accent">이 기록은 내 공식(Playbook)으로 저장되어 있어요.</p>
      </Card>
    );
  }
  if (!record.learning) return null;

  return (
    <Card>
      <SectionHeader title="내 공식으로 저장" />
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          내 공식으로 저장
        </button>
      ) : (
        <form action={action} className="space-y-3">
          <Field label="Rule 제목" htmlFor="pb-title">
            <input id="pb-title" name="title" defaultValue={record.learning ?? ""} className={inputClass} />
          </Field>
          <SubmitButton>저장</SubmitButton>
        </form>
      )}
    </Card>
  );
}
