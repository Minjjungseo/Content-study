// Safe ratio calculations for Review objective data.
// Any missing or zero denominator yields null instead of throwing/NaN/Infinity.

function ratio(numerator?: number | null, denominator?: number | null): number | null {
  if (numerator == null || denominator == null || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export type PerformanceInput = {
  views?: number | null;
  reach?: number | null;
  avgWatchTime?: number | null;
  retention3s?: number | null;
  completionRate?: number | null;
  likes?: number | null;
  comments?: number | null;
  saves?: number | null;
  shares?: number | null;
  profileVisits?: number | null;
  followsGained?: number | null;
  videoLength?: number | null;
};

export type PerformanceRatios = {
  saveRate: number | null;
  shareRate: number | null;
  commentRate: number | null;
  likeRate: number | null;
  profileVisitRate: number | null;
  followConversionRate: number | null;
  avgWatchRate: number | null;
};

export function computeRatios(p: PerformanceInput): PerformanceRatios {
  return {
    saveRate: ratio(p.saves, p.reach),
    shareRate: ratio(p.shares, p.reach),
    commentRate: ratio(p.comments, p.reach),
    likeRate: ratio(p.likes, p.reach),
    profileVisitRate: ratio(p.profileVisits, p.reach),
    followConversionRate: ratio(p.followsGained, p.profileVisits),
    avgWatchRate: ratio(p.avgWatchTime, p.videoLength),
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
