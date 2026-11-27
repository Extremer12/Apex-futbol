-- ==============================================================================
-- Migration: 20261127000000_harden_leaderboards_and_pack_downloads.sql
-- Description:
--   1. Add career_id + UNIQUE(user_id, career_id) to public.leaderboards so
--      each career updates a single canonical row via upsert instead of
--      duplicating entries across seasons.
--   2. Add BEFORE INSERT OR UPDATE trigger enforce_leaderboard_score() to
--      validate ranges and recompute score deterministically on the server.
--   3. Restrict leaderboards INSERT/UPDATE policies strictly to authenticated
--      owners ((select auth.uid()) = user_id).
--   4. Harden public.increment_pack_downloads(uuid) with existence check,
--      transaction advisory lock, and 1-hour cooldown deduplication via private
--      pack_download_events log table (no public policies).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. LEADERBOARDS: career_id column + cleanup + UNIQUE constraint
-- ------------------------------------------------------------------------------
ALTER TABLE public.leaderboards
    ADD COLUMN IF NOT EXISTS career_id TEXT;

-- Clean up any out-of-range legacy metrics before applying constraints
UPDATE public.leaderboards
SET
    season = GREATEST(1, LEAST(COALESCE(season, 1), 200)),
    trophies_count = GREATEST(0, LEAST(COALESCE(trophies_count, 0), GREATEST(1, LEAST(COALESCE(season, 1), 200)) * 10)),
    club_value = GREATEST(0, LEAST(COALESCE(club_value, 0), 100000000000::bigint)),
    fan_approval = GREATEST(0, LEAST(COALESCE(fan_approval, 50), 100)),
    board_confidence = GREATEST(0, LEAST(COALESCE(board_confidence, 50), 100));

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'leaderboards_user_career_key'
          AND conrelid = 'public.leaderboards'::regclass
    ) THEN
        ALTER TABLE public.leaderboards
            ADD CONSTRAINT leaderboards_user_career_key UNIQUE (user_id, career_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'leaderboards_bounds_check'
          AND conrelid = 'public.leaderboards'::regclass
    ) THEN
        ALTER TABLE public.leaderboards
            ADD CONSTRAINT leaderboards_bounds_check CHECK (
                season BETWEEN 1 AND 200
                AND COALESCE(trophies_count, 0) >= 0
                AND COALESCE(club_value, 0) >= 0
                AND COALESCE(fan_approval, 50) BETWEEN 0 AND 100
                AND COALESCE(board_confidence, 50) BETWEEN 0 AND 100
                AND score >= 0
            );
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. LEADERBOARDS: Deterministic server-side score calculation & anti-tampering
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_leaderboard_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    v_season INTEGER;
    v_trophies INTEGER;
    v_club_value BIGINT;
    v_fan INTEGER;
    v_board INTEGER;
    v_trophy_pts NUMERIC;
    v_financial_pts NUMERIC;
    v_season_pts NUMERIC;
    v_multiplier NUMERIC;
BEGIN
    v_season := GREATEST(1, LEAST(COALESCE(NEW.season, 1), 200));
    v_trophies := GREATEST(0, LEAST(COALESCE(NEW.trophies_count, 0), v_season * 10));
    v_club_value := GREATEST(0, LEAST(COALESCE(NEW.club_value, 0), 100000000000::bigint));
    v_fan := GREATEST(0, LEAST(COALESCE(NEW.fan_approval, 50), 100));
    v_board := GREATEST(0, LEAST(COALESCE(NEW.board_confidence, 50), 100));

    NEW.season := v_season;
    NEW.trophies_count := v_trophies;
    NEW.club_value := v_club_value;
    NEW.fan_approval := v_fan;
    NEW.board_confidence := v_board;
    NEW.manager_name := LEFT(BTRIM(COALESCE(NULLIF(NEW.manager_name, ''), 'Presidente')), 80);
    NEW.team_name := LEFT(BTRIM(COALESCE(NULLIF(NEW.team_name, ''), 'Club')), 80);

    -- Matches client formula calculatePresidentialScore(trophies, clubValue, fanApproval, boardConfidence, seasons)
    v_trophy_pts := v_trophies * 10000.0;
    v_financial_pts := ROUND(v_club_value::numeric / 100000.0);
    v_season_pts := v_season * 1500.0;
    v_multiplier := (v_fan + v_board)::numeric / 100.0;

    NEW.score := GREATEST(0, ROUND((v_trophy_pts + v_financial_pts + v_season_pts) * v_multiplier))::integer;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leaderboards_enforce_score ON public.leaderboards;
CREATE TRIGGER trg_leaderboards_enforce_score
    BEFORE INSERT OR UPDATE ON public.leaderboards
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_leaderboard_score();

-- ------------------------------------------------------------------------------
-- 3. LEADERBOARDS RLS POLICIES (INSERT + UPDATE restricted to authenticated owner)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert their own score" ON public.leaderboards;
CREATE POLICY "Users can insert their own score"
    ON public.leaderboards FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own score" ON public.leaderboards;
CREATE POLICY "Users can update their own score"
    ON public.leaderboards FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------------------
-- 4. PACK DOWNLOADS: Rate-limited & validated increment_pack_downloads(uuid)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pack_download_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pack_id UUID NOT NULL REFERENCES public.community_packs(id) ON DELETE CASCADE,
    requester_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pack_download_events ENABLE ROW LEVEL SECURITY;

-- Explicitly no permissive RLS policies: table is accessible only via SECURITY DEFINER RPC
CREATE INDEX IF NOT EXISTS idx_pack_download_events_lookup
    ON public.pack_download_events (pack_id, requester_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pack_download_events_created_at
    ON public.pack_download_events (created_at);

CREATE OR REPLACE FUNCTION public.increment_pack_downloads(pack_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_requester TEXT;
    v_exists BOOLEAN;
BEGIN
    IF pack_id IS NULL THEN
        RETURN;
    END IF;

    -- Confirm target pack exists before recording anything
    SELECT EXISTS (
        SELECT 1 FROM public.community_packs WHERE id = pack_id
    ) INTO v_exists;

    IF NOT v_exists THEN
        RETURN;
    END IF;

    v_requester := COALESCE(
        'u:' || (select auth.uid())::text,
        'ip:' || COALESCE(inet_client_addr()::text, 'anon')
    );

    -- Serialize concurrent bursts from the same caller for the same pack
    PERFORM pg_advisory_xact_lock(hashtext(pack_id::text || ':' || v_requester));

    IF EXISTS (
        SELECT 1
        FROM public.pack_download_events e
        WHERE e.pack_id = increment_pack_downloads.pack_id
          AND e.requester_key = v_requester
          AND e.created_at > timezone('utc'::text, now()) - INTERVAL '1 hour'
    ) THEN
        RETURN;
    END IF;

    INSERT INTO public.pack_download_events (pack_id, requester_key)
    VALUES (pack_id, v_requester);

    UPDATE public.community_packs
    SET downloads_count = COALESCE(downloads_count, 0) + 1
    WHERE id = pack_id;

    -- Keep recent audit window clean (purge events older than 24h)
    DELETE FROM public.pack_download_events
    WHERE created_at < timezone('utc'::text, now()) - INTERVAL '24 hours';
END;
$$;

REVOKE ALL ON FUNCTION public.increment_pack_downloads(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_pack_downloads(uuid) TO anon, authenticated;
