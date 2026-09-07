import {
  ContentStatus,
  ExperimentResult,
  Priority,
  RESULT_LABEL,
  STATUS_LABEL,
  PRIORITY_LABEL,
} from "@/app/lib/types";

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const BASE =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cx(BASE, "bg-black/5", className)}>{children}</span>;
}

const PRIORITY_STYLE: Record<Priority, string> = {
  P1: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 font-semibold",
  P2: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  P3: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  SOMEDAY: "bg-slate-100 text-slate-400 dark:bg-slate-500/10 dark:text-slate-500",
};

export function PriorityBadge({ priority }: { priority: Priority | string }) {
  const p = priority as Priority;
  return (
    <Badge className={PRIORITY_STYLE[p] ?? PRIORITY_STYLE.P3}>
      {p === "SOMEDAY" ? "Someday" : p}
    </Badge>
  );
}

const STATUS_STYLE: Record<ContentStatus, string> = {
  IDEA: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  PLANNED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  FILMED: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  EDITING: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  READY: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  PUBLISHED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  REVIEWED: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
};

export function StatusBadge({ status }: { status: ContentStatus | string }) {
  const s = status as ContentStatus;
  return (
    <Badge className={STATUS_STYLE[s] ?? STATUS_STYLE.IDEA}>
      {STATUS_LABEL[s] ?? status}
    </Badge>
  );
}

const RESULT_STYLE: Record<ExperimentResult, string> = {
  SUPPORTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  INCONCLUSIVE: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  NOT_SUPPORTED: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function ResultBadge({ result }: { result: ExperimentResult | string }) {
  const r = result as ExperimentResult;
  return (
    <Badge className={RESULT_STYLE[r] ?? "bg-slate-100 text-slate-500"}>
      {RESULT_LABEL[r] ?? result}
    </Badge>
  );
}

export function PriorityLabel({ priority }: { priority: Priority | string }) {
  return <>{PRIORITY_LABEL[priority as Priority] ?? priority}</>;
}
