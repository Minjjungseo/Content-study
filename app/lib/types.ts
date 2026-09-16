// Shared union types + Korean labels + option lists for LearningRecord.
// Values are stored as plain strings in Postgres (no native enum); this file
// is the single source of truth for valid values across the app.

export const RECORD_TYPES = [
  "LECTURE",
  "REFERENCE",
  "SELF_STUDY",
  "CONTENT_REVIEW",
  "COMMERCE_REVIEW",
] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

export const RECORD_TYPE_LABEL: Record<RecordType, string> = {
  LECTURE: "배움",
  REFERENCE: "레퍼런스",
  SELF_STUDY: "내 스터디",
  CONTENT_REVIEW: "콘텐츠 복기",
  COMMERCE_REVIEW: "공구 복기",
};

export const ACCOUNTS = ["HEYELIA", "JAEJAE_MOMMY", "MINJUNG_DOING", "COMMON"] as const;
export type Account = (typeof ACCOUNTS)[number];

export const ACCOUNT_LABEL: Record<Account, string> = {
  HEYELIA: "heyelia",
  JAEJAE_MOMMY: "jaejae mommy",
  MINJUNG_DOING: "민정 또 뭐해?",
  COMMON: "공통",
};

export const PRIORITIES = ["P1", "P2", "P3"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABEL: Record<Priority, string> = {
  P1: "P1 · 지금",
  P2: "P2 · 다음",
  P3: "P3 · 나중",
};

export const DECISIONS = ["REPEAT", "MODIFY", "STOP"] as const;
export type Decision = (typeof DECISIONS)[number];

export const DECISION_LABEL: Record<Decision, string> = {
  REPEAT: "반복",
  MODIFY: "수정",
  STOP: "중단",
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
  CANDIDATE: "검증 중",
  VERIFIED: "검증됨",
};

export const CONTENT_SERIES_OPTIONS: Record<string, string[]> = {
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
  MINJUNG_DOING: ["기타"],
};

// Record attachments: reference documents to keep, not analyze (yet).
// Large video files are intentionally out of scope — use 출처/링크 instead.
export const RECORD_ATTACHMENT_ACCEPT = ".pdf,.ppt,.pptx,.doc,.docx,.txt,image/*";

export const RECORD_ATTACHMENT_EXT_LABEL: Record<string, string> = {
  pdf: "PDF",
  ppt: "PPT",
  pptx: "PPTX",
  doc: "DOC",
  docx: "DOCX",
  txt: "TXT",
};
