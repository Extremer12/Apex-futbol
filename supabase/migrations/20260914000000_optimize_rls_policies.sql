-- ==============================================================================
-- Migration: 20260914000000_optimize_rls_policies.sql
-- Description: Optimize RLS policies with (select auth.uid()) for performance
--              and fix security definer permissions for increment_pack_downloads
-- ==============================================================================

-- 1. Security fix for increment_pack_downloads and check_cloud_saves_limit
REVOKE EXECUTE ON FUNCTION public.increment_pack_downloads(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_pack_downloads(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_pack_downloads(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.check_cloud_saves_limit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_cloud_saves_limit() FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_cloud_saves_limit() FROM authenticated;

-- 2. Optimize profiles policies
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK ((select auth.uid()) = id);

-- 3. Optimize cloud_saves policies
DROP POLICY IF EXISTS "Users can delete their own cloud saves" ON public.cloud_saves;
CREATE POLICY "Users can delete their own cloud saves"
    ON public.cloud_saves FOR DELETE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own cloud saves" ON public.cloud_saves;
CREATE POLICY "Users can update their own cloud saves"
    ON public.cloud_saves FOR UPDATE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own cloud saves" ON public.cloud_saves;
CREATE POLICY "Users can insert their own cloud saves"
    ON public.cloud_saves FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own cloud saves" ON public.cloud_saves;
CREATE POLICY "Users can view their own cloud saves"
    ON public.cloud_saves FOR SELECT
    USING ((select auth.uid()) = user_id);

-- 4. Optimize leaderboards policies
DROP POLICY IF EXISTS "Users can delete their own leaderboard scores" ON public.leaderboards;
CREATE POLICY "Users can delete their own leaderboard scores"
    ON public.leaderboards FOR DELETE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own leaderboard scores" ON public.leaderboards;
CREATE POLICY "Users can update their own leaderboard scores"
    ON public.leaderboards FOR UPDATE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can submit leaderboard scores" ON public.leaderboards;
CREATE POLICY "Authenticated users can submit leaderboard scores"
    ON public.leaderboards FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id OR user_id IS NULL);

-- 5. Optimize community_packs policies
DROP POLICY IF EXISTS "Users can delete their own packs" ON public.community_packs;
CREATE POLICY "Users can delete their own packs"
    ON public.community_packs FOR DELETE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own packs" ON public.community_packs;
CREATE POLICY "Users can update their own packs"
    ON public.community_packs FOR UPDATE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Authenticated users can upload packs" ON public.community_packs;
CREATE POLICY "Authenticated users can upload packs"
    ON public.community_packs FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);
