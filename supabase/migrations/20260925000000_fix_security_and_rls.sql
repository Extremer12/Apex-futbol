-- ==============================================================================
-- Migration: 20260925000000_fix_security_and_rls.sql
-- Description: Fix critical RLS security vulnerabilities:
--              1. Restrict community_packs UPDATE so only owners can edit their packs
--              2. Restrict leaderboards INSERT to require authenticated user_id
-- ==============================================================================

-- 1. Restrict community_packs UPDATE
DROP POLICY IF EXISTS "Packs update policy" ON public.community_packs;
DROP POLICY IF EXISTS "Users can update their own packs" ON public.community_packs;
CREATE POLICY "Users can update their own packs"
    ON public.community_packs FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- 2. Restrict leaderboards INSERT (disallow anonymous / NULL user_id submissions)
DROP POLICY IF EXISTS "Authenticated users can submit leaderboard scores" ON public.leaderboards;
DROP POLICY IF EXISTS "Users can insert their own score" ON public.leaderboards;
CREATE POLICY "Users can insert their own score"
    ON public.leaderboards FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);
