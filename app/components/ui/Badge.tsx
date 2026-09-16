import { Decision, DECISION_LABEL, Priority, PRIORITY_LABEL } from "@/app/lib/types";

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
};

export function PriorityBadge({ priority }: { priority: Priority | string }) {
  const p = priority as Priority;
  return <Badge className={PRIORITY_STYLE[p] ?? PRIORITY_STYLE.P3}>{PRIORITY_LABEL[p] ?? priority}</Badge>;
}

const DECISION_STYLE: Record<Decision, string> = {
  REPEAT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  MODIFY: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  STOP: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function DecisionBadge({ decision }: { decision: Decision | string }) {
  const d = decision as Decision;
  return <Badge className={DECISION_STYLE[d] ?? "bg-slate-100 text-slate-500"}>{DECISION_LABEL[d] ?? decision}</Badge>;
}
