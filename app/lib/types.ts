// Shared union types + Korean labels + option lists.
// SQLite has no enum support, so Prisma stores these as plain strings;
// this file is the single source of truth for valid values across the app.

export const STUDY_TYPES = ["LEARNED", "REFERENCE", "INSIGHT"] as const;
export type StudyType = (typeof STUDY_TYPES)[number];

export const STUDY_TYPE_LABEL: Record<StudyType, string> = {
  LEARNED: "배운 것",
  REFERENCE: "레퍼런스",
  INSIGHT: "인사이트",
};

export const ACCOUNTS = ["HEYELIA", "JAEJAE_MOMMY", "COMMON"] as const;
export type Account = (typeof ACCOUNTS)[number];

export const IDEA_ACCOUNTS = ["HEYELIA", "JAEJAE_MOMMY"] as const;

export const ACCOUNT_LABEL: Record<Account, string> = {
  HEYELIA: "heyelia",
  JAEJAE_MOMMY: "jaejae mommy",
  COMMON: "공통",
};

export const LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
};

export const PRIORITIES = ["P1", "P2", "P3", "SOMEDAY"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABEL: Record<Priority, string> = {
  P1: "P1 · 지금 만들 콘텐츠",
  P2: "P2 · 다음 후보",
  P3: "P3 · 당장은 아님",
  SOMEDAY: "Someday · 보관",
};

export const CONTENT_STATUSES = [
  "IDEA",
  "PLANNED",
  "FILMED",
  "EDITING",
  "READY",
  "PUBLISHED",
  "REVIEWED",
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const EXPERIMENT_STATUSES = CONTENT_STATUSES.filter(
  (s) => s !== "IDEA"
) as Exclude<ContentStatus, "IDEA">[];

export const STATUS_LABEL: Record<ContentStatus, string> = {
  IDEA: "아이디어",
  PLANNED: "기획 중",
  FILMED: "촬영 완료",
  EDITING: "편집 중",
  READY: "게시 준비",
  PUBLISHED: "게시 완료",
  REVIEWED: "복기 완료",
};

export const SHOOT_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type ShootDifficulty = (typeof SHOOT_DIFFICULTIES)[number];

export const SHOOT_DIFFICULTY_LABEL: Record<ShootDifficulty, string> = {
  EASY: "쉬움",
  MEDIUM: "보통",
  HARD: "어려움",
};

export const PLATFORMS = ["INSTAGRAM", "TIKTOK", "YOUTUBE"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABEL: Record<Platform, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

export const EXPERIMENT_RESULTS = [
  "SUPPORTED",
  "INCONCLUSIVE",
  "NOT_SUPPORTED",
] as const;
export type ExperimentResult = (typeof EXPERIMENT_RESULTS)[number];

export const RESULT_LABEL: Record<ExperimentResult, string> = {
  SUPPORTED: "Supported",
  INCONCLUSIVE: "Inconclusive",
  NOT_SUPPORTED: "Not Supported",
};

export const PLAYBOOK_CATEGORIES = [
  "HOOK",
  "STORY",
  "STRUCTURE",
  "VISUAL",
  "CTA",
  "EDITING",
  "CONVERSION",
  "TRUST",
  "OTHER",
] as const;
export type PlaybookCategory = (typeof PLAYBOOK_CATEGORIES)[number];

export const PLAYBOOK_CATEGORY_LABEL: Record<PlaybookCategory, string> = {
  HOOK: "Hook",
  STORY: "Story",
  STRUCTURE: "Structure",
  VISUAL: "Visual",
  CTA: "CTA",
  EDITING: "Editing",
  CONVERSION: "Conversion",
  TRUST: "Trust",
  OTHER: "기타",
};

export const PLAYBOOK_STATUSES = ["CANDIDATE", "VERIFIED"] as const;
export type PlaybookStatus = (typeof PLAYBOOK_STATUSES)[number];

export const PLAYBOOK_STATUS_LABEL: Record<PlaybookStatus, string> = {
  CANDIDATE: "Candidate",
  VERIFIED: "Verified",
};

export const APPLICABLE_ELEMENTS = [
  "Hook",
  "Story",
  "Visual",
  "Editing",
  "CTA",
  "Format",
  "Positioning",
  "Trust",
  "기타",
] as const;

export const CONTENT_IP_OPTIONS: Record<string, string[]> = {
  HEYELIA: [
    "Ask a Korean Shopping Host",
    "10 Minute",
    "Becoming Me Again",
    "Australian Life",
    "기타",
  ],
  JAEJAE_MOMMY: [
    "자료/저장형",
    "경험형",
    "생각/관점",
    "생활",
    "공구",
    "기타",
  ],
};
