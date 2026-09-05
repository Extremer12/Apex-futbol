-- ==============================================================================
-- Migration: 20260905000000_initial_schema.sql
-- Description: Initial schema for Apex AI Football President
-- Tables: profiles, cloud_saves, leaderboards, community_packs
-- Security: Row Level Security (RLS) enabled on all tables
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger: Automatically handle new user signup from Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. CLOUD SAVES TABLE
CREATE TABLE IF NOT EXISTS public.cloud_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slot_id TEXT NOT NULL,
    save_name TEXT NOT NULL,
    team_id INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    season INTEGER NOT NULL DEFAULT 1,
    game_date TEXT NOT NULL,
    game_state JSONB NOT NULL,
    player_profile JSONB NOT NULL,
    schema_version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT cloud_saves_user_slot_key UNIQUE (user_id, slot_id)
);

ALTER TABLE public.cloud_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cloud saves" 
ON public.cloud_saves FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cloud saves" 
ON public.cloud_saves FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cloud saves" 
ON public.cloud_saves FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cloud saves" 
ON public.cloud_saves FOR DELETE 
USING (auth.uid() = user_id);


-- 3. LEADERBOARDS TABLE (Salón de la Fama Global)
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    manager_name TEXT NOT NULL,
    team_name TEXT NOT NULL,
    season INTEGER NOT NULL,
    trophies_count INTEGER DEFAULT 0,
    club_value BIGINT DEFAULT 0,
    fan_approval INTEGER DEFAULT 50,
    board_confidence INTEGER DEFAULT 50,
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboards are viewable by everyone" 
ON public.leaderboards FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can submit leaderboard scores" 
ON public.leaderboards FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);


-- 4. COMMUNITY PACKS TABLE
CREATE TABLE IF NOT EXISTS public.community_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    manifest_url TEXT NOT NULL,
    category TEXT DEFAULT 'logos',
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.community_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community packs are viewable by everyone" 
ON public.community_packs FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upload packs" 
ON public.community_packs FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);
