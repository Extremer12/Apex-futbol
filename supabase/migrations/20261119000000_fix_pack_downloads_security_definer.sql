-- ==============================================================================
-- Migration: 20261119000000_fix_pack_downloads_security_definer.sql
-- Description: Convert increment_pack_downloads to SECURITY DEFINER and grant to anon/authenticated
--              so download counters reliably increment when downloaded by non-author users.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.increment_pack_downloads(pack_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.community_packs
    SET downloads_count = COALESCE(downloads_count, 0) + 1
    WHERE id = pack_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_pack_downloads(uuid) TO anon, authenticated;
