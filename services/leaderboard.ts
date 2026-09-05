import { supabase } from './supabase';

export interface LeaderboardEntry {
    id: string;
    managerName: string;
    teamName: string;
    season: number;
    trophiesCount: number;
    clubValue: number;
    fanApproval: number;
    boardConfidence: number;
    score: number;
    createdAt: string;
}

/**
 * Calculates a presidential score based on trophies, finances, and political stability
 */
export function calculatePresidentialScore(
    trophies: number,
    clubValue: number,
    fanApproval: number,
    boardConfidence: number,
    seasons: number
): number {
    // 10,000 points per trophy
    const trophyPoints = trophies * 10000;
    // 1 point per 100,000 in club value
    const financialPoints = Math.round(clubValue / 100000);
    // Political stability multiplier
    const politicalMultiplier = (fanApproval + boardConfidence) / 100;
    // Longevity bonus
    const seasonBonus = seasons * 1500;

    return Math.round((trophyPoints + financialPoints + seasonBonus) * politicalMultiplier);
}

export async function submitPresidentialScore(data: {
    managerName: string;
    teamName: string;
    season: number;
    trophiesCount: number;
    clubValue: number;
    fanApproval: number;
    boardConfidence: number;
}): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const score = calculatePresidentialScore(
        data.trophiesCount,
        data.clubValue,
        data.fanApproval,
        data.boardConfidence,
        data.season
    );

    const { error } = await supabase.from('leaderboards').insert({
        user_id: user ? user.id : null,
        manager_name: data.managerName,
        team_name: data.teamName,
        season: data.season,
        trophies_count: data.trophiesCount,
        club_value: data.clubValue,
        fan_approval: data.fanApproval,
        board_confidence: data.boardConfidence,
        score,
    });

    if (error) {
        console.error('Error submitting score to leaderboard:', error);
    }
}

export async function getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
        .from('leaderboards')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    return (data || []).map((row) => ({
        id: row.id,
        managerName: row.manager_name,
        teamName: row.team_name,
        season: row.season,
        trophiesCount: row.trophies_count || 0,
        clubValue: Number(row.club_value) || 0,
        fanApproval: row.fan_approval || 50,
        boardConfidence: row.board_confidence || 50,
        score: row.score,
        createdAt: row.created_at,
    }));
}
