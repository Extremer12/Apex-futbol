import { Team, Match, CupCompetition, CupGroup, LeagueId } from '../types';
import { SOUTH_AMERICAN_EXTRA_TEAMS, getTeamConmebolMeta } from '../data/teams/southAmericanClubs';
import { generateCupDraw } from './simulation';

export interface LibertadoresQualificationContext {
    allTeams: Team[];
    lastLibertadoresWinnerId?: number;
    lastSudamericanaWinnerId?: number;
    argentineQualifiedIds?: number[]; // from computeArgentineInternationalQualification
}

export interface LibertadoresInitialState {
    cup: CupCompetition;
    fixtures: Match[];
    phase3Losers: Team[];
}

/**
 * Organizes the 47 teams according to CONMEBOL regulations:
 * - 28 direct group stage qualifiers
 * - 19 preliminary round participants
 */
export function buildLibertadoresParticipants(context: LibertadoresQualificationContext): {
    directToGroups: Team[];
    phase2Direct: Team[];
    phase1Direct: Team[];
    defendingChampion?: Team;
    sudamericanaChampion?: Team;
} {
    const { allTeams, lastLibertadoresWinnerId, lastSudamericanaWinnerId, argentineQualifiedIds = [] } = context;
    const allPool = [...(allTeams || []), ...SOUTH_AMERICAN_EXTRA_TEAMS];
    const findTeam = (id?: number) => id ? allPool.find(t => t.id === id) : undefined;
    const defendingChampion = findTeam(lastLibertadoresWinnerId);
    const sudamericanaChampion = findTeam(lastSudamericanaWinnerId);

    const usedIds = new Set<number>();
    if (defendingChampion) usedIds.add(defendingChampion.id);
    if (sudamericanaChampion) usedIds.add(sudamericanaChampion.id);

    // Helpers to get clubs by country
    const getTeamsByCountry = (countryCode: string, minTierPriority: boolean = true): Team[] => {
        let teams: Team[] = [];
        if (countryCode === 'ARG') {
            // Priority to argentineQualifiedIds
            argentineQualifiedIds.forEach(id => {
                const t = findTeam(id);
                if (t && !usedIds.has(t.id)) teams.push(t);
            });
            // Fallback from league
            const fallbacks = allTeams.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA && !usedIds.has(t.id));
            teams.push(...fallbacks);
        } else if (countryCode === 'BRA') {
            const brTeams = allTeams.filter(t => t.leagueId === LeagueId.BRASILEIRAO && !usedIds.has(t.id));
            teams.push(...brTeams);
        } else if (countryCode === 'PAR') {
            const parTeams = allTeams.filter(t => t.leagueId === LeagueId.COPA_DE_PRIMERA && !usedIds.has(t.id));
            teams.push(...parTeams);
        } else {
            const extras = SOUTH_AMERICAN_EXTRA_TEAMS.filter(t => t.country === countryCode && !usedIds.has(t.id));
            teams.push(...extras);
        }

        // Sort by CONMEBOL Ranking
        return teams.sort((a, b) => {
            const metaA = getTeamConmebolMeta(a);
            const metaB = getTeamConmebolMeta(b);
            return metaA.conmebolRanking - metaB.conmebolRanking;
        });
    };

    const southAmericanPool = [
        ...allTeams.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA || t.leagueId === LeagueId.BRASILEIRAO || t.leagueId === LeagueId.COPA_DE_PRIMERA),
        ...SOUTH_AMERICAN_EXTRA_TEAMS
    ];

    const directToGroups: Team[] = [];
    const phase2Direct: Team[] = [];
    const phase1Direct: Team[] = [];

    // Defending champion & Sudamericana champion
    if (defendingChampion) {
        directToGroups.push(defendingChampion);
        usedIds.add(defendingChampion.id);
    }
    if (sudamericanaChampion && sudamericanaChampion.id !== defendingChampion?.id) {
        directToGroups.push(sudamericanaChampion);
        usedIds.add(sudamericanaChampion.id);
    }

    // 1. Brasil: 7 slots (5 direct, 2 in Phase 2)
    const bra = getTeamsByCountry('BRA').filter(t => !usedIds.has(t.id));
    bra.slice(0, 5).forEach(t => { directToGroups.push(t); usedIds.add(t.id); });
    bra.slice(5, 7).forEach(t => { phase2Direct.push(t); usedIds.add(t.id); });

    // 2. Argentina: 6 slots (5 direct, 1 in Phase 2)
    const arg = getTeamsByCountry('ARG').filter(t => !usedIds.has(t.id));
    arg.slice(0, 5).forEach(t => { directToGroups.push(t); usedIds.add(t.id); });
    arg.slice(5, 6).forEach(t => { phase2Direct.push(t); usedIds.add(t.id); });

    // 3. Chile: 4 slots (2 direct, 2 in Phase 2)
    const chi = getTeamsByCountry('CHI').filter(t => !usedIds.has(t.id));
    chi.slice(0, 2).forEach(t => { directToGroups.push(t); usedIds.add(t.id); });
    chi.slice(2, 4).forEach(t => { phase2Direct.push(t); usedIds.add(t.id); });

    // 4. Colombia: 4 slots (2 direct, 2 in Phase 2)
    const col = getTeamsByCountry('COL').filter(t => !usedIds.has(t.id));
    col.slice(0, 2).forEach(t => { directToGroups.push(t); usedIds.add(t.id); });
    col.slice(2, 4).forEach(t => { phase2Direct.push(t); usedIds.add(t.id); });

    // 5. Rest of CONMEBOL (Bolivia, Ecuador, Paraguay, Perú, Uruguay, Venezuela):
    // Each has 4 slots: 2 direct, 1 in Phase 2, 1 in Phase 1
    const otherCountries = ['BOL', 'ECU', 'PAR', 'PER', 'URU', 'VEN'];
    otherCountries.forEach(code => {
        const list = getTeamsByCountry(code).filter(t => !usedIds.has(t.id));
        list.slice(0, 2).forEach(t => { directToGroups.push(t); usedIds.add(t.id); });
        list.slice(2, 3).forEach(t => { phase2Direct.push(t); usedIds.add(t.id); });
        list.slice(3, 4).forEach(t => { phase1Direct.push(t); usedIds.add(t.id); });
    });

    // Ensure directToGroups has exactly 28 teams (fill with next best available CONMEBOL teams if slot was free)
    if (directToGroups.length < 28) {
        const remaining = southAmericanPool
            .filter(t => !usedIds.has(t.id))
            .sort((a, b) => getTeamConmebolMeta(a).conmebolRanking - getTeamConmebolMeta(b).conmebolRanking);
        for (const t of remaining) {
            if (directToGroups.length >= 28) break;
            directToGroups.push(t);
            usedIds.add(t.id);
        }
    }

    // Ensure phase2Direct has exactly 13 teams
    if (phase2Direct.length < 13) {
        const remaining = southAmericanPool
            .filter(t => !usedIds.has(t.id))
            .sort((a, b) => getTeamConmebolMeta(a).conmebolRanking - getTeamConmebolMeta(b).conmebolRanking);
        for (const t of remaining) {
            if (phase2Direct.length >= 13) break;
            phase2Direct.push(t);
            usedIds.add(t.id);
        }
    }

    // Ensure phase1Direct has exactly 6 teams
    if (phase1Direct.length < 6) {
        const remaining = southAmericanPool
            .filter(t => !usedIds.has(t.id))
            .sort((a, b) => getTeamConmebolMeta(a).conmebolRanking - getTeamConmebolMeta(b).conmebolRanking);
        for (const t of remaining) {
            if (phase1Direct.length >= 6) break;
            phase1Direct.push(t);
            usedIds.add(t.id);
        }
    }

    return {
        directToGroups,
        phase2Direct,
        phase1Direct,
        defendingChampion,
        sudamericanaChampion
    };
}

/**
 * Resolves the 3 preliminary phases and returns the 4 Phase 3 qualifiers (G1..G4)
 * Phase 1: 6 teams -> 3 winners (E1, E2, E3)
 * Phase 2: 16 teams (3 from P1 + 13 direct) -> 8 winners (C1 to C8)
 * Phase 3: 8 teams (C1 vs C8, C2 vs C7, C3 vs C6, C4 vs C5) -> 4 winners
 */
export function simulatePreliminaries(
    phase1Teams: Team[],
    phase2Teams: Team[]
): {
    phase3Winners: Team[];
    phase3Losers: Team[];
    preliminaryFixtures: Match[];
} {
    const preliminaryFixtures: Match[] = [];

    // Helper to simulate one elimination key based on team rating
    const resolveMatchKey = (teamA: Team, teamB: Team, week: number): { winner: Team; loser: Team } => {
        const ratingA = teamA.squad.reduce((s, p) => s + p.rating, 0) / (teamA.squad.length || 1);
        const ratingB = teamB.squad.reduce((s, p) => s + p.rating, 0) / (teamB.squad.length || 1);
        const probA = 0.5 + (ratingA - ratingB) * 0.03;
        const winner = Math.random() < Math.max(0.2, Math.min(0.8, probA)) ? teamA : teamB;
        const loser = winner.id === teamA.id ? teamB : teamA;
        
        const scoreWinner = 2 + Math.floor(Math.random() * 2);
        const scoreLoser = Math.floor(Math.random() * Math.min(2, scoreWinner));
        
        preliminaryFixtures.push({
            week,
            homeTeamId: teamA.id,
            awayTeamId: teamB.id,
            competition: 'Copa_Libertadores',
            isCupMatch: true,
            isMidweek: true,
            result: {
                homeScore: winner.id === teamA.id ? scoreWinner : scoreLoser,
                awayScore: winner.id === teamB.id ? scoreWinner : scoreLoser
            }
        });

        return { winner, loser };
    };

    // Phase 1 (Week 2): 6 teams -> 3 winners
    const e1 = resolveMatchKey(phase1Teams[0] || phase2Teams[0], phase1Teams[1] || phase2Teams[1], 2);
    const e2 = resolveMatchKey(phase1Teams[2] || phase2Teams[2], phase1Teams[3] || phase2Teams[3], 2);
    const e3 = resolveMatchKey(phase1Teams[4] || phase2Teams[4], phase1Teams[5] || phase2Teams[5], 2);

    // Phase 2 (Week 4): 16 teams -> 8 winners (C1..C8)
    const p2Pool = [...phase2Teams, e1.winner, e2.winner, e3.winner];
    const cWinners: Team[] = [];
    for (let i = 0; i < 8; i++) {
        const teamA = p2Pool[i * 2] || p2Pool[0];
        const teamB = p2Pool[i * 2 + 1] || p2Pool[1];
        cWinners.push(resolveMatchKey(teamA, teamB, 4).winner);
    }

    // Phase 3 (Week 6): 4 keys predefined (C1 vs C8, C2 vs C7, C3 vs C6, C4 vs C5)
    const g1 = resolveMatchKey(cWinners[0], cWinners[7], 6);
    const g2 = resolveMatchKey(cWinners[1], cWinners[6], 6);
    const g3 = resolveMatchKey(cWinners[2], cWinners[5], 6);
    const g4 = resolveMatchKey(cWinners[3], cWinners[4], 6);

    return {
        phase3Winners: [g1.winner, g2.winner, g3.winner, g4.winner],
        phase3Losers: [g1.loser, g2.loser, g3.loser, g4.loser],
        preliminaryFixtures
    };
}

/**
 * Conducts the Group Stage Draw for 32 teams into 8 groups (A to H).
 * Enforces:
 * - Bombo 1: Defending champ goes straight to Grupo A. Next 7 best ranking.
 * - Bombo 2: Sudamericana champ + next 7.
 * - Bombo 3: Next 8.
 * - Bombo 4: Last 4 direct qualifiers + 4 from Phase 3 (G1..G4).
 * - Country restriction: NO two teams from the same country in the same group,
 *   EXCEPT the 4 teams from Phase 3 (G1..G4) which are exempt.
 */
export function drawLibertadoresGroups(
    directQualifiers: Team[],
    phase3Qualifiers: Team[],
    defendingChampionId?: number
): CupGroup[] {
    const p3Ids = new Set(phase3Qualifiers.map(t => t.id));

    // Sort direct qualifiers by CONMEBOL ranking
    const sortedDirect = [...directQualifiers].sort((a, b) => {
        if (a.id === defendingChampionId) return -1;
        if (b.id === defendingChampionId) return 1;
        return getTeamConmebolMeta(a).conmebolRanking - getTeamConmebolMeta(b).conmebolRanking;
    });

    // Make sure we have 28 direct teams
    const top28 = sortedDirect.slice(0, 28);

    // Build Pots:
    // Pot 1: Defending champ + 7 best ranking
    const pot1 = top28.slice(0, 8);
    // Pot 2: Next 8
    const pot2 = top28.slice(8, 16);
    // Pot 3: Next 8
    const pot3 = top28.slice(16, 24);
    // Pot 4: Last 4 direct + 4 from Phase 3
    const pot4 = [...top28.slice(24, 28), ...phase3Qualifiers];

    // Initialize 8 empty groups
    const groups: {
        id: string;
        name: string;
        teams: Team[];
    }[] = Array.from({ length: 8 }, (_, i) => ({
        id: `group_${String.fromCharCode(65 + i)}`,
        name: `Grupo ${String.fromCharCode(65 + i)}`,
        teams: []
    }));

    // Pot 1: Place sequentially (Defending champ will be in Grupo A)
    pot1.forEach((team, idx) => {
        if (groups[idx]) {
            groups[idx].teams.push(team);
        }
    });

    // Function to place a pot with country restrictions (1 team per group per pot)
    const placePot = (pot: Team[], targetGroupSize: number) => {
        // Shuffle pot for natural draw excitement
        const shuffled = [...pot].sort(() => 0.5 - Math.random());

        shuffled.forEach(team => {
            const isExempt = p3Ids.has(team.id);
            const teamCountry = getTeamConmebolMeta(team).country;

            // Find valid group that currently has fewer than targetGroupSize teams
            let placed = false;
            for (let gIdx = 0; gIdx < 8; gIdx++) {
                const group = groups[gIdx];
                if (group.teams.length >= targetGroupSize) continue;

                if (isExempt) {
                    group.teams.push(team);
                    placed = true;
                    break;
                }

                // Check country collision
                const hasCountryConflict = group.teams.some(existing => {
                    if (p3Ids.has(existing.id)) return false; // p3 teams don't block
                    return getTeamConmebolMeta(existing).country === teamCountry;
                });

                if (!hasCountryConflict) {
                    group.teams.push(team);
                    placed = true;
                    break;
                }
            }

            // Fallback if strict country restriction blocked placement in an available group
            if (!placed) {
                const firstAvailable = groups.find(g => g.teams.length < targetGroupSize);
                if (firstAvailable) {
                    firstAvailable.teams.push(team);
                } else {
                    const anyFree = groups.find(g => g.teams.length < 4);
                    if (anyFree) anyFree.teams.push(team);
                }
            }
        });
    };

    placePot(pot2, 2);
    placePot(pot3, 3);
    placePot(pot4, 4);

    // Build official CupGroup objects with 6-matchday synchronized schedule
    return groups.map(g => {
        const teamIds = g.teams.map(t => t.id);
        const groupTable = g.teams.map(t => ({
            teamId: t.id,
            position: 0,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: []
        }));

        // Matchday calendar: 6 fixed midweeks (Weeks 8, 10, 12, 14, 16, 18)
        // 4 teams: 0, 1, 2, 3
        const matchdays: [number, [number, number], [number, number]][] = [
            [8,  [0, 1], [2, 3]], // Matchday 1
            [10, [0, 2], [3, 1]], // Matchday 2
            [12, [3, 0], [1, 2]], // Matchday 3
            [14, [1, 0], [3, 2]], // Matchday 4
            [16, [2, 0], [1, 3]], // Matchday 5
            [18, [0, 3], [2, 1]], // Matchday 6
        ];

        const fixtures: Match[] = [];
        matchdays.forEach(([week, m1, m2]) => {
            if (teamIds[m1[0]] && teamIds[m1[1]]) {
                fixtures.push({
                    week,
                    homeTeamId: teamIds[m1[0]],
                    awayTeamId: teamIds[m1[1]],
                    competition: 'Copa_Libertadores',
                    isCupMatch: true,
                    isMidweek: true
                });
            }
            if (teamIds[m2[0]] && teamIds[m2[1]]) {
                fixtures.push({
                    week,
                    homeTeamId: teamIds[m2[0]],
                    awayTeamId: teamIds[m2[1]],
                    competition: 'Copa_Libertadores',
                    isCupMatch: true,
                    isMidweek: true
                });
            }
        });

        return {
            id: g.id,
            name: g.name,
            teams: teamIds,
            table: groupTable,
            fixtures
        };
    });
}

/**
 * Sorts group standings using official CONMEBOL tiebreakers:
 * 1. Puntos
 * 2. Diferencia de gol
 * 3. Goles a favor
 * 4. Ranking CONMEBOL
 */
export function sortLibertadoresGroupTable(table: CupGroup['table'], allTeams: Team[]): CupGroup['table'] {
    return [...table].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

        const teamA = allTeams.find(t => t.id === a.teamId);
        const teamB = allTeams.find(t => t.id === b.teamId);
        const rankA = teamA ? getTeamConmebolMeta(teamA).conmebolRanking : 99;
        const rankB = teamB ? getTeamConmebolMeta(teamB).conmebolRanking : 99;
        return rankA - rankB;
    });
}

/**
 * Initializes the full Copa Libertadores tournament for the season:
 * - 47 participants
 * - Preliminaries (Fases 1, 2 y 3)
 * - 8 groups of 4 teams
 * - Fixtures for calendar
 */
export function initializeLibertadoresSeason(
    context: LibertadoresQualificationContext,
    existingCup?: CupCompetition
): LibertadoresInitialState {
    const participants = buildLibertadoresParticipants(context);
    const { phase3Winners, phase3Losers, preliminaryFixtures } = simulatePreliminaries(
        participants.phase1Direct,
        participants.phase2Direct
    );

    const groups = drawLibertadoresGroups(
        participants.directToGroups,
        phase3Winners,
        context.lastLibertadoresWinnerId
    );

    const groupFixtures: Match[] = [];
    groups.forEach(g => {
        groupFixtures.push(...g.fixtures);
    });

    const cup: CupCompetition = {
        id: 'copa_libertadores',
        name: 'Copa Libertadores',
        type: 'groups',
        phase: 'groups',
        groups,
        rounds: [],
        currentRoundIndex: 0,
        statistics: {
            topScorers: [],
            championsHistory: existingCup?.statistics?.championsHistory || []
        }
    };

    return {
        cup,
        fixtures: [...preliminaryFixtures, ...groupFixtures],
        phase3Losers
    };
}
