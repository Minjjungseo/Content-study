-- CreateTable
CREATE TABLE "LearningRecord" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "account" TEXT NOT NULL DEFAULT 'COMMON',
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceMemo" TEXT,
    "takeaway" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "tags" TEXT,
    "applyTitle" TEXT,
    "contentSeries" TEXT,
    "applyPoint" TEXT,
    "hook" TEXT,
    "plan" TEXT,
    "shootingMemo" TEXT,
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER,
    "reach" INTEGER,
    "avgWatchTime" DOUBLE PRECISION,
    "retentionRate" DOUBLE PRECISION,
    "saves" INTEGER,
    "shares" INTEGER,
    "comments" INTEGER,
    "follows" INTEGER,
    "good" TEXT,
    "problem" TEXT,
    "learning" TEXT,
    "nextThing" TEXT,
    "decision" TEXT,
    "playbookSaved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordAttachment" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordPlaybookLink" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "playbookRuleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordPlaybookLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecordPlaybookLink_recordId_playbookRuleId_key" ON "RecordPlaybookLink"("recordId", "playbookRuleId");

-- AddForeignKey
ALTER TABLE "RecordAttachment" ADD CONSTRAINT "RecordAttachment_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "LearningRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordPlaybookLink" ADD CONSTRAINT "RecordPlaybookLink_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "LearningRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordPlaybookLink" ADD CONSTRAINT "RecordPlaybookLink_playbookRuleId_fkey" FOREIGN KEY ("playbookRuleId") REFERENCES "PlaybookRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same lockdown as the earlier RLS migration, extended to the 3 new tables.
-- This app is server-only; Supabase's anon/authenticated Data API roles have
-- no legitimate reason to touch LearningRecord/RecordAttachment/RecordPlaybookLink.
-- FORCE ROW LEVEL SECURITY is intentionally NOT set, so the owner role Prisma
-- connects as (DIRECT_URL/DATABASE_URL) keeps bypassing RLS.

ALTER TABLE "LearningRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecordAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecordPlaybookLink" ENABLE ROW LEVEL SECURITY;

-- Guarded so this is a harmless no-op on databases without Supabase's
-- anon/authenticated roles (e.g. local Postgres in dev/CI). Table-level
-- REVOKE only (the default-privilege REVOKE from the earlier RLS migration
-- already covers these newly-created tables too).
DO $$
DECLARE
  api_role TEXT;
  app_table TEXT;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      FOREACH app_table IN ARRAY ARRAY['LearningRecord', 'RecordAttachment', 'RecordPlaybookLink'] LOOP
        EXECUTE format('REVOKE ALL ON TABLE %I FROM %I', app_table, api_role);
      END LOOP;
    END IF;
  END LOOP;
END $$;
