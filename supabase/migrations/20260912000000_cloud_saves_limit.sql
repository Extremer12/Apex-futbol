-- ==============================================================================
-- Migration: 20260912000000_cloud_saves_limit.sql
-- Description: Enforce max 3 cloud save slots per user at database level
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_cloud_saves_limit()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_save_count INTEGER;
    slot_exists BOOLEAN;
BEGIN
    -- Check if this user already has this specific slot_id
    SELECT EXISTS (
        SELECT 1 FROM public.cloud_saves 
        WHERE user_id = NEW.user_id AND slot_id = NEW.slot_id
    ) INTO slot_exists;

    -- If this is an update or an upsert on an existing slot, allow it
    IF slot_exists THEN
        RETURN NEW;
    END IF;

    -- Count existing slots for this user
    SELECT COUNT(*) INTO current_save_count
    FROM public.cloud_saves
    WHERE user_id = NEW.user_id;

    -- Enforce maximum of 3 slots per user
    IF current_save_count >= 3 THEN
        RAISE EXCEPTION 'Límite alcanzado: Cada cuenta tiene un máximo de 3 ranuras de guardado en la nube. Sobrescribe o elimina una existente para continuar.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT before execution
DROP TRIGGER IF EXISTS trigger_check_cloud_saves_limit ON public.cloud_saves;
CREATE TRIGGER trigger_check_cloud_saves_limit
    BEFORE INSERT ON public.cloud_saves
    FOR EACH ROW
    EXECUTE FUNCTION public.check_cloud_saves_limit();
