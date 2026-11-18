-- ==============================================================================
-- Migration: 20261118000000_user_data_deletion.sql
-- Description: Allow users to delete their own profiles and leaderboards entries
--              to comply with Google Play Account Deletion Policy
-- ==============================================================================

-- 1. Profiles DELETE policy
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE
    USING ((select auth.uid()) = id);

-- 2. Leaderboards DELETE policy
DROP POLICY IF EXISTS "Users can delete their own leaderboard score" ON public.leaderboards;
CREATE POLICY "Users can delete their own leaderboard score"
    ON public.leaderboards FOR DELETE
    USING ((select auth.uid()) = user_id);
