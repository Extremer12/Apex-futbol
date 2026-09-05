import { GameState, FanApproval, Team } from '../types';

/**
 * Calculate the transfer factor for fan approval (-10 to +10).
 * Measures squad quality vs tier expectations, with bonus for star signings.
 */
const calculateTransferFactor = (gameState: GameState): number => {
    const squad = gameState.team.squad;
    if (squad.length === 0) return 0;

    // Average squad rating
    const avgSquadRating = squad.reduce((sum, p) => sum + p.rating, 0) / squad.length;

    // Expected rating baseline by tier
    const expectedRating = gameState.team.tier === 'Top' ? 78 : gameState.team.tier === 'Mid' ? 68 : 58;

    // Delta: how much better/worse than expected
    const ratingDelta = avgSquadRating - expectedRating;

    // Scale to -10..+10 range (each 1 point above/below expected = ~2 approval points)
    let transfers = Math.round(Math.max(-10, Math.min(10, ratingDelta * 2)));

    // Bonus: recently signed star players (rating >= 85, default 3-year contract = recent signing)
    const hasStarSignings = squad.some(p => p.rating >= 85 && p.contractYears === 3);
    if (hasStarSignings) transfers = Math.min(10, transfers + 3);

    // Penalty: squad too thin (less than 18 players)
    if (squad.length < 18) transfers = Math.max(-10, transfers - 3);

    return transfers;
};

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

    // Factor Transferencias (-10 a +10)
    const transfers = calculateTransferFactor(gameState);

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
 * Update fan approval after a match.
 * Includes bonus/penalty based on opponent strength.
 */
export const updateFanApprovalAfterMatch = (
    gameState: GameState,
    won: boolean,
    draw: boolean,
    opponent?: Team
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
    if (opponent) {
        const playerTier = gameState.team.tier;
        const opponentTier = opponent.tier;

        if (won && opponentTier === 'Top' && playerTier !== 'Top') {
            delta += 2;
            reason = `¡Victoria histórica contra ${opponent.name}!`;
        } else if (won && opponentTier === 'Top') {
            delta += 1;
            reason = `Gran victoria contra ${opponent.name}`;
        } else if (!won && !draw && opponentTier === 'Lower' && playerTier !== 'Lower') {
            delta -= 2;
            reason = `Derrota vergonzosa contra ${opponent.name}`;
        } else if (!won && !draw && opponentTier === 'Lower') {
            delta -= 1;
            reason = `Derrota contra ${opponent.name}`;
        }
    }

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
