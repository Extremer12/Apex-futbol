-- ==============================================================================
-- Migration: 20260907000000_security_and_indexes.sql
-- Description: Additional RLS security policies, RPC function, and performance indexes
-- ==============================================================================

-- 1. PROFILES TABLE (Allow user account deletion)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- 2. LEADERBOARDS TABLE (Full CRUD for owners, stricter insert)
DROP POLICY IF EXISTS "Authenticated users can submit leaderboard scores" ON public.leaderboards;

CREATE POLICY "Authenticated users can submit leaderboard scores" 
ON public.leaderboards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard scores" 
ON public.leaderboards FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leaderboard scores" 
ON public.leaderboards FOR DELETE 
USING (auth.uid() = user_id);

-- 3. COMMUNITY PACKS TABLE (Author management + secure download counter)
DROP POLICY IF EXISTS "Authenticated users can upload packs" ON public.community_packs;

CREATE POLICY "Authenticated users can upload packs" 
ON public.community_packs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packs" 
ON public.community_packs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own packs" 
ON public.community_packs FOR DELETE 
USING (auth.uid() = user_id);

-- Secure RPC for incrementing download counts safely without exposing UPDATE on all fields
CREATE OR REPLACE FUNCTION public.increment_pack_downloads(pack_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.community_packs
    SET downloads_count = COALESCE(downloads_count, 0) + 1
    WHERE id = pack_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.increment_pack_downloads(UUID) TO anon, authenticated;

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_cloud_saves_user_id ON public.cloud_saves (user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_saves_updated_at ON public.cloud_saves (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON public.leaderboards (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON public.leaderboards (user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_season ON public.leaderboards (season);
CREATE INDEX IF NOT EXISTS idx_leaderboards_created_at ON public.leaderboards (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_packs_category ON public.community_packs (category);
CREATE INDEX IF NOT EXISTS idx_community_packs_downloads ON public.community_packs (downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_packs_user_id ON public.community_packs (user_id);
