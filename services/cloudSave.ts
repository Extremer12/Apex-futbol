import { supabase } from './supabase';
import { GameState, PlayerProfile } from '../types';
import { SCHEMA_VERSION } from './db';

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

    // Clean non-serializable objects (like functions or cyclical references)
    const replacer = (key: string, value: any) => (key === 'logo' ? undefined : value);
    const storableGameState = JSON.parse(JSON.stringify(gameState, replacer));
    const storableProfile = JSON.parse(JSON.stringify(playerProfile));

    const { error } = await supabase
        .from('cloud_saves')
        .upsert(
            {
                user_id: user.id,
                slot_id: slotId,
                save_name: saveName,
                team_id: gameState.team.id,
                team_name: gameState.team.name,
                season: gameState.season || 1,
                game_date: String(gameState.currentDate),
                game_state: storableGameState,
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

    return (data || []).map((row) => ({
        id: row.id,
        slotId: row.slot_id,
        saveName: row.save_name,
        teamId: row.team_id,
        teamName: row.team_name,
        season: row.season,
        gameDate: row.game_date,
        updatedAt: row.updated_at,
    }));
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

    return {
        gameState: data.game_state as unknown as GameState,
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
