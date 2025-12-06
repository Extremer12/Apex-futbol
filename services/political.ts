import { GameState, FanApproval } from '../types';

/**
 * Calculate fan approval based on team performance
 */
export const calculateFanApproval = (gameState: GameState): FanApproval => {
    const playerTable = gameState.leagueTables[gameState.team.leagueId] || [];
    const playerPosition = playerTable.find(
        row => row.teamId === gameState.team.id
    )?.position || 10;

    // Factor Resultados (-20 a +20)
    let results = 0;
    if (playerPosition <= 4) results = 20;
    else if (playerPosition <= 6) results = 10;
    else if (playerPosition <= 10) results = 0;
    else if (playerPosition <= 15) results = -10;
    else results = -20;

    // Factor Finanzas (-10 a +10)
    const finances = gameState.finances.balance > 0 ? 10 : -10;

    // Factor Promesas (-20 a +20)
    const fulfilledPromises = gameState.electoralPromises?.filter(p => p.fulfilled).length || 0;
    const failedPromises = gameState.electoralPromises?.filter(
        p => !p.fulfilled && gameState.season > p.deadline
    ).length || 0;
    const promises = (fulfilledPromises * 10) - (failedPromises * 10);

    // Factor Transferencias (placeholder for now)
    const transfers = 0;

    // Total
    const baseRating = 60; // Start at 60%
    const totalRating = Math.max(0, Math.min(100,
        baseRating + results + finances + promises + transfers
    ));

    // Determine trend
    const currentRating = gameState.fanApproval?.rating || 60;
    let trend: 'rising' | 'stable' | 'falling';
    if (totalRating > currentRating + 5) trend = 'rising';
    else if (totalRating < currentRating - 5) trend = 'falling';
    else trend = 'stable';

    return {
        rating: totalRating,
        trend,
        factors: { results, transfers, finances, promises }
    };
};

/**
 * Update fan approval after a match
 */
export const updateFanApprovalAfterMatch = (
    gameState: GameState,
    won: boolean,
    draw: boolean
): { delta: number; reason: string } => {
    let delta = 0;
    let reason = '';

    if (won) {
        delta = 2;
        reason = 'Victoria del equipo';
    } else if (draw) {
        delta = 0;
        reason = 'Empate';
    } else {
        delta = -2;
        reason = 'Derrota del equipo';
    }

    // Bonus/penalty based on opponent strength
    // TODO: Implement opponent tier comparison

    return { delta, reason };
};

/**
 * Update fan approval at end of season
 */
export const updateFanApprovalEndOfSeason = (gameState: GameState): { delta: number; reason: string } => {
    const playerTable = gameState.leagueTables[gameState.team.leagueId] || [];
    const playerPosition = playerTable.find(
        row => row.teamId === gameState.team.id
    )?.position || 10;

    let delta = 0;
    let reason = '';

    if (playerPosition <= 4) {
        delta = 15;
        reason = 'Clasificación a Champions League';
    } else if (playerPosition <= 6) {
        delta = 10;
        reason = 'Clasificación a Europa League';
    } else if (playerPosition >= 18) {
        delta = -20;
        reason = 'Descenso de categoría';
    } else if (playerPosition <= 10) {
        delta = 5;
        reason = 'Temporada sólida en media tabla';
    } else {
        delta = -5;
        reason = 'Temporada decepcionante';
    }

    return { delta, reason };
};
