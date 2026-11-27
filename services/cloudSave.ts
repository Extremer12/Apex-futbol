import { supabase } from './supabase';
import { GameState, PlayerProfile } from '../types';
import { SCHEMA_VERSION } from './db';
import { compressStringAsync, decompressStringAsync } from '../utils/compression';
import type { Json } from '../types/supabase';

export const MAX_CLOUD_SAVES = 3;

/**
 * Checks the locally cached Supabase session before touching Auth HTTP endpoints,
 * preventing unnecessary network errors/traffic when playing offline or as a guest.
 */
async function getLocalSessionUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
        return null;
    }
    return session.user;
}

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
    const user = await getLocalSessionUser();

    if (!user) {
        throw new Error('Debes iniciar sesión con Google para guardar en la nube.');
    }

    // Determine canonical slotId for this career to guarantee replacement by careerId (never by team_id)
    const canonicalSlotId = gameState.careerId || slotId;

    const { data: existingSaves } = await supabase
        .from('cloud_saves')
        .select('id, slot_id')
        .eq('user_id', user.id);

    const otherSlotsCount = (existingSaves || []).filter(s => s.slot_id !== canonicalSlotId).length;

    if (otherSlotsCount >= MAX_CLOUD_SAVES) {
        throw new Error(`Has alcanzado el límite máximo de ${MAX_CLOUD_SAVES} carreras en la nube. Sobrescribe una existente o elimina una para continuar.`);
    }

    // Clean non-serializable objects and prune transient/oversized data before serialization
    const stateToSerialize = {
        ...gameState,
        careerId: canonicalSlotId,
        newsFeed: gameState.newsFeed ? gameState.newsFeed.slice(0, 60) : [],
        cinematicQueue: [],
    };
    const replacer = (key: string, value: unknown) => (key === 'logo' ? undefined : value);
    
    // Yield a frame before JSON serialization, then compress off the main thread via Web Worker + Gzip V3
    const rawJson = await new Promise<string>(resolve => {
        setTimeout(() => resolve(JSON.stringify(stateToSerialize, replacer)), 0);
    });
    const compressedData = await compressStringAsync(rawJson);

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
    const user = await getLocalSessionUser();

    if (!user) {
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

    // Deduplicate strictly by canonical slot_id / careerId so distinct careers managing the same club are preserved
    const seenSlots = new Map<string, CloudSaveSummary>();

    (data || []).forEach((row) => {
        if (!seenSlots.has(row.slot_id)) {
            seenSlots.set(row.slot_id, {
                id: row.id,
                slotId: row.slot_id,
                saveName: row.save_name,
                teamId: row.team_id,
                teamName: row.team_name,
                season: row.season,
                gameDate: row.game_date,
                updatedAt: row.updated_at,
            });
        }
    });

    return Array.from(seenSlots.values());
}

export async function downloadCloudSave(slotId: string): Promise<{
    gameState: GameState;
    playerProfile: PlayerProfile;
    saveName: string;
} | null> {
    const user = await getLocalSessionUser();

    if (!user) {
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
        const decompressedJson = await decompressStringAsync(rawState.data);
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
    const user = await getLocalSessionUser();

    if (!user) {
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

/**
 * Permanently deletes all user data stored in the cloud (cloud saves, leaderboard entries, profile)
 * and signs out. Required for Google Play Store Account/Data Deletion Policy compliance.
 */
export async function deleteAllUserDataFromCloud(): Promise<void> {
    const user = await getLocalSessionUser();

    if (!user) {
        return;
    }

    try {
        // 1. Delete all cloud saves for this user
        await supabase.from('cloud_saves').delete().eq('user_id', user.id);

        // 2. Delete user's leaderboard entries
        await supabase.from('leaderboards').delete().eq('user_id', user.id);

        // 3. Delete user's profile record
        await supabase.from('profiles').delete().eq('id', user.id);

        // 4. Delete the auth account itself via SECURITY DEFINER RPC (Play Store Account Deletion compliance)
        try {
            await (supabase.rpc as any)('delete_own_account');
        } catch (rpcErr) {
            console.warn('RPC delete_own_account notice:', rpcErr);
        }

        // 5. Sign out
        await supabase.auth.signOut();
    } catch (err) {
        console.error('Error deleting cloud user data:', err);
        throw err;
    }
}
