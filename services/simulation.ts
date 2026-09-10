/**
 * Central Simulation Barrel
 * Re-exports all specialized simulation modules to preserve 100% backward compatibility.
 */

// Morale & Match Engine
export {
    FORMATION_CONFIG,
    updateTeamMorale,
    generatePlayerId,
    generateYouthPlayer,
    selectMatchSquad,
    getTeamStatsFromSquad,
    simulateMatch,
    simulateMacroMatch
} from './simulation/matchEngine';

// Schedule Generator & Tables
export {
    generateLeagueSchedule,
    createInitialLeagueTable,
    generateSeasonSchedule
} from './simulation/scheduleGenerator';

// Argentine Competition & Formats
export {
    ARGENTINE_CLASSIC_PAIRS,
    ARGENTINE_SECONDARY_DERBIES,
    sortArgentineZones,
    generateArgentineTournamentSchedule,
    generateArgentinePlayoffs,
    generatePrimeraNacionalSchedule,
    generateNacionalPrimerAscenso,
    generateNacionalReducidoPhase1,
    generateNacionalReducidoCuartos
} from './simulation/argentineFormat';

// Argentine Regulations & Standings
export {
    computeArgentineRelegation,
    computeArgentineInternationalQualification,
    calculateTournamentStandings
} from './argentinaRegulations';
export type { ArgentineQualification, ArgentineRelegationResult } from './argentinaRegulations';

// Cup Competitions & Progressions
export {
    generateCupDraw,
    determineCupWinner,
    progressInternationalCup,
    advanceCupRound,
    checkAndScheduleIntercontinental,
    createInitialEuropeanTable,
    generateSwissPhase,
    generateGroupPhase
} from './simulation/cupGenerator';

// Promotion & Relegation
export {
    PROMOTION_RELEGATION_PAIRS,
    handlePromotionRelegation
} from './simulation/promotionRelegation';

// League Registry & Configurations
export {
    LEAGUE_REGISTRY,
    getLeagueConfig,
    isSouthAmericanLeague,
    getPromotionRelegationPairs
} from './simulation/leagueRegistry';
export type { LeagueConfig } from './simulation/leagueRegistry';
