import { supabase } from './supabase';
import { GameState, PlayerProfile } from '../types';
import { SCHEMA_VERSION } from './db';
import { compressString, decompressString } from '../utils/compression';
import type { Json } from '../types/supabase';

export const MAX_CLOUD_SAVES = 3;

export interface CloudSaveSummary {
    id: string;
    slotId: string;
    saveName: string;
    teamId: number;
    teamName: string;
    season: number;
    gameDate: string;
    updatedAt: string;
}

export async function uploadSaveToCloud(
    slotId: string,
    saveName: string,
    gameState: GameState,
    playerProfile: PlayerProfile
): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Debes iniciar sesión con Google para guardar en la nube.');
    }

    // Determine canonical slotId for this career to guarantee replacement
    const canonicalSlotId = gameState.careerId || slotId;

    // Check existing saves count and check if user already has a save for this team/career
    const { data: existingSaves } = await supabase
        .from('cloud_saves')
        .select('id, slot_id, team_id')
        .eq('user_id', user.id);

    // If an existing save has the same team_id under an older different slot_id, delete the old slot
    const duplicateSlot = existingSaves?.find(s => 
        s.slot_id !== canonicalSlotId && s.team_id === gameState.team.id
    );

    if (duplicateSlot) {
        await supabase
            .from('cloud_saves')
            .delete()
            .eq('user_id', user.id)
            .eq('slot_id', duplicateSlot.slot_id);
    }

    const remainingSlots = existingSaves?.filter(s => 
        s.slot_id !== canonicalSlotId && (!duplicateSlot || s.slot_id !== duplicateSlot.slot_id)
    ) || [];

    if (remainingSlots.length >= MAX_CLOUD_SAVES) {
        throw new Error(`Has alcanzado el límite máximo de ${MAX_CLOUD_SAVES} carreras en la nube. Sobrescribe una existente o elimina una para continuar.`);
    }

    // Clean non-serializable objects and prune transient/oversized data before serialization
    const stateToSerialize = {
        ...gameState,
        careerId: canonicalSlotId,
        viewingPlayer: null,
        newsFeed: gameState.newsFeed ? gameState.newsFeed.slice(0, 60) : [],
        cinematicQueue: [],
    };
    const replacer = (key: string, value: unknown) => (key === 'logo' ? undefined : value);
    
    // Yield to browser execution so heavy stringification and LZW compression don't freeze frames
    const rawJson = await new Promise<string>(resolve => {
        setTimeout(() => resolve(JSON.stringify(stateToSerialize, replacer)), 0);
    });
    const compressedData = await new Promise<string>(resolve => {
        setTimeout(() => resolve(compressString(rawJson)), 0);
    });

    const storableGameState = {
        __compressed: true,
        data: compressedData
    };
    const storableProfile = JSON.parse(JSON.stringify(playerProfile));

    const { error } = await supabase
        .from('cloud_saves')
        .upsert(
            {
                user_id: user.id,
                slot_id: canonicalSlotId,
                save_name: saveName,
                team_id: gameState.team.id,
                team_name: gameState.team.name,
                season: gameState.season || 1,
                game_date: String(gameState.currentDate),
                game_state: storableGameState as unknown as Json,
                player_profile: storableProfile,
                schema_version: SCHEMA_VERSION,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,slot_id' }
        );

    if (error) {
        console.error('Error uploading save to cloud:', error);
        throw new Error(`Error al guardar en la nube: ${error.message}`);
    }
}

export async function getCloudSaves(): Promise<CloudSaveSummary[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return [];
    }

    const { data, error } = await supabase
        .from('cloud_saves')
        .select('id, slot_id, save_name, team_id, team_name, season, game_date, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching cloud saves:', error);
        return [];
    }

    // Deduplicate by team_id / career so multiple cloud saves of the same career never appear
    const seenTeams = new Map<number, CloudSaveSummary>();
    const duplicateIdsToDelete: string[] = [];

    (data || []).forEach((row) => {
        const item: CloudSaveSummary = {
            id: row.id,
            slotId: row.slot_id,
            saveName: row.save_name,
            teamId: row.team_id,
            teamName: row.team_name,
            season: row.season,
            gameDate: row.game_date,
            updatedAt: row.updated_at,
        };

        if (!seenTeams.has(row.team_id)) {
            seenTeams.set(row.team_id, item);
        } else {
            // Already seen a more recent save for this club (since ordered by updated_at desc)
            duplicateIdsToDelete.push(row.id);
        }
    });

    if (duplicateIdsToDelete.length > 0) {
        Promise.resolve(supabase.from('cloud_saves').delete().in('id', duplicateIdsToDelete))
            .then(() => console.log(`[Apex Cloud] Cleaned up ${duplicateIdsToDelete.length} obsolete duplicate cloud saves`))
            .catch(err => console.warn('[Apex Cloud] Duplicate cleanup failed:', err));
    }

    return Array.from(seenTeams.values());
}

export async function downloadCloudSave(slotId: string): Promise<{
    gameState: GameState;
    playerProfile: PlayerProfile;
    saveName: string;
} | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Debes iniciar sesión con Google para cargar desde la nube.');
    }

    const { data, error } = await supabase
        .from('cloud_saves')
        .select('*')
        .eq('user_id', user.id)
        .eq('slot_id', slotId)
        .single();

    if (error || !data) {
        console.error('Error downloading cloud save:', error);
        return null;
    }

    let loadedGameState: GameState;
    const rawState = data.game_state as any;

    if (rawState && rawState.__compressed && typeof rawState.data === 'string') {
        const decompressedJson = decompressString(rawState.data);
        loadedGameState = JSON.parse(decompressedJson);
    } else {
        loadedGameState = rawState as GameState;
    }

    if (loadedGameState && loadedGameState.currentDate) {
        loadedGameState.currentDate = new Date(loadedGameState.currentDate);
    }

    return {
        gameState: loadedGameState,
        playerProfile: data.player_profile as unknown as PlayerProfile,
        saveName: data.save_name,
    };
}

export async function deleteCloudSave(slotId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Debes iniciar sesión para eliminar una partida de la nube.');
    }

    const { error } = await supabase
        .from('cloud_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('slot_id', slotId);

    if (error) {
        console.error('Error deleting cloud save:', error);
        throw new Error(`Error al eliminar partida en la nube: ${error.message}`);
    }
}
