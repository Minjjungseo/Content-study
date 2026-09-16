-- Lock down Supabase's auto-generated Data API access to every app table.
--
-- This app is server-only: Vercel/Prisma connects directly to Postgres via
-- DATABASE_URL/DIRECT_URL as the table-owning role, never through Supabase's
-- PostgREST Data API. Browsers never talk to Supabase directly, so the
-- anon/authenticated roles (which is what the Data API authenticates
-- requests as) have no legitimate reason to touch any of these tables.
--
-- Two independent layers, matching Supabase's own recommended fix for the
-- "rls_disabled_in_public" advisor warning:
--   1) Enable RLS with zero policies -> default-deny for any non-owner role.
--      FORCE ROW LEVEL SECURITY is intentionally NOT set, so the owner role
--      (what Prisma's DIRECT_URL connects as) keeps bypassing RLS and all
--      existing server-side CRUD keeps working unchanged.
--   2) Revoke the table grants Supabase's project bootstrap gives anon/
--      authenticated on every public table by default, plus the default
--      privileges so future Prisma-created tables aren't auto-exposed either.
--
-- service_role is deliberately left untouched (Supabase internals / future
-- server-side use). _prisma_migrations is Prisma-internal and not touched.

ALTER TABLE "Study" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyIdeaLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Idea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Experiment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PublishedContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Performance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlaybookRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlaybookEvidence" ENABLE ROW LEVEL SECURITY;

-- Guarded so this migration is a harmless no-op on databases that don't have
-- Supabase's anon/authenticated roles (e.g. local Postgres in dev/CI).
DO $$
DECLARE
  api_role TEXT;
  app_table TEXT;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      FOREACH app_table IN ARRAY ARRAY[
        'Study', 'StudyIdeaLink', 'StudyAttachment', 'Idea', 'Experiment',
        'PublishedContent', 'Performance', 'Review', 'PlaybookRule', 'PlaybookEvidence'
      ] LOOP
        EXECUTE format('REVOKE ALL ON TABLE %I FROM %I', app_table, api_role);
      END LOOP;

      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', api_role);
    END IF;
  END LOOP;
END $$;
