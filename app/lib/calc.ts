// Safe ratio calculations for a LearningRecord's REVIEW numbers.
// Any missing or zero denominator yields null instead of throwing/NaN/Infinity.

function ratio(numerator?: number | null, denominator?: number | null): number | null {
  if (numerator == null || denominator == null || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export type ReviewMetricsInput = {
  reach?: number | null;
  saves?: number | null;
  shares?: number | null;
  comments?: number | null;
  follows?: number | null;
};

export type ReviewMetricRatios = {
  saveRate: number | null;
  shareRate: number | null;
  commentRate: number | null;
  followRate: number | null;
};

export function computeRatios(m: ReviewMetricsInput): ReviewMetricRatios {
  return {
    saveRate: ratio(m.saves, m.reach),
    shareRate: ratio(m.shares, m.reach),
    commentRate: ratio(m.comments, m.reach),
    followRate: ratio(m.follows, m.reach),
  };
}

export function formatPercent(v: number | null): string {
  if (v == null) return "—";
  return `${v.toFixed(1)}%`;
}

export function formatNumber(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toLocaleString("ko-KR");
}
