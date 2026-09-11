import { Team, Match, CupCompetition, CupGroup, LeagueId } from '../types';
import { SOUTH_AMERICAN_EXTRA_TEAMS, getTeamConmebolMeta } from '../data/teams/southAmericanClubs';

export interface SudamericanaQualificationContext {
    allTeams: Team[];
    lastSudamericanaWinnerId?: number;
    argentineQualifiedIds?: number[]; // Puestos 7 a 12 en Tabla Anual
    libertadoresPhase3Losers: Team[]; // 4 losers from Libertadores Phase 3
    excludedTeamIds?: Set<number>; // Teams already participating in Copa Libertadores
}

export interface SudamericanaInitialState {
    cup: CupCompetition;
    fixtures: Match[];
}

/**
 * Organizes the 56 teams according to official CONMEBOL Copa Sudamericana regulations:
 * - 12 direct group stage qualifiers (6 ARG, 6 BRA)
 * - 32 preliminary national phase participants (4 from each of BOL, CHI, COL, ECU, PAR, PER, URU, VEN)
 * - 4 transferred from Libertadores Phase 3 (into groups Bombo 4)
 * - 8 transferred from Libertadores Group Stage (into Playoff de Octavos)
 */
export function buildSudamericanaParticipants(context: SudamericanaQualificationContext): {
    directToGroupsArg: Team[];
    directToGroupsBra: Team[];
    nationalPreliminaries: Record<string, Team[]>; // country -> 4 teams
    phase3Transfers: Team[];
} {
    const { allTeams, argentineQualifiedIds = [], libertadoresPhase3Losers = [], excludedTeamIds = new Set() } = context;

    const allPool = [...allTeams, ...SOUTH_AMERICAN_EXTRA_TEAMS];
    const findTeam = (id?: number) => id ? allPool.find(t => t.id === id) : undefined;
    const usedIds = new Set<number>(excludedTeamIds);

    // Helpers to get clubs by country, excluding clubs already participating in Libertadores
    const getTeamsByCountry = (countryCode: string): Team[] => {
        let teams: Team[] = [];
        const seen = new Set<number>(usedIds);

        if (countryCode === 'ARG') {
            if (argentineQualifiedIds.length > 0) {
                argentineQualifiedIds.forEach(id => {
                    const t = findTeam(id);
                    if (t && !seen.has(t.id)) {
                        teams.push(t);
                        seen.add(t.id);
                    }
                });
            }
            // Fallback from league
            const fallbacks = allTeams.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA && !seen.has(t.id));
            fallbacks.forEach(t => {
                teams.push(t);
                seen.add(t.id);
            });
        } else if (countryCode === 'BRA') {
            const brTeams = allTeams.filter(t => t.leagueId === LeagueId.BRASILEIRAO && !seen.has(t.id));
            brTeams.forEach(t => {
                teams.push(t);
                seen.add(t.id);
            });
        } else if (countryCode === 'PAR') {
            const parTeams = allTeams.filter(t => t.leagueId === LeagueId.COPA_DE_PRIMERA && !seen.has(t.id));
            parTeams.forEach(t => {
                teams.push(t);
                seen.add(t.id);
            });
        } else {
            const extras = SOUTH_AMERICAN_EXTRA_TEAMS.filter(t => t.country === countryCode && !seen.has(t.id));
            extras.forEach(t => {
                teams.push(t);
                seen.add(t.id);
            });
        }

        // Sort by CONMEBOL Ranking
        return teams.sort((a, b) => {
            const metaA = getTeamConmebolMeta(a);
            const metaB = getTeamConmebolMeta(b);
            return metaA.conmebolRanking - metaB.conmebolRanking;
        });
    };

    // 1. Argentina: 6 slots direct to group stage
    const directToGroupsArg: Team[] = [];
    const argList = getTeamsByCountry('ARG');
    argList.slice(0, 6).forEach(t => {
        directToGroupsArg.push(t);
        usedIds.add(t.id);
    });

    // 2. Brasil: 6 slots direct to group stage
    const directToGroupsBra: Team[] = [];
    const braList = getTeamsByCountry('BRA');
    braList.slice(0, 6).forEach(t => {
        directToGroupsBra.push(t);
        usedIds.add(t.id);
    });

    // 3. National Preliminary Phase: 8 countries x 4 clubs = 32 clubs
    const otherCountries = ['BOL', 'CHI', 'COL', 'ECU', 'PAR', 'PER', 'URU', 'VEN'];
    const nationalPreliminaries: Record<string, Team[]> = {};

    otherCountries.forEach(code => {
        const list = getTeamsByCountry(code);
        const selected = list.slice(0, 4);
        selected.forEach(t => usedIds.add(t.id));
        nationalPreliminaries[code] = selected;
    });

    // 4. Transferred from Libertadores Phase 3: exactly 4 clubs
    const phase3Transfers = [...libertadoresPhase3Losers];

    return {
        directToGroupsArg,
        directToGroupsBra,
        nationalPreliminaries,
        phase3Transfers
    };
}

/**
 * Simulates the National Preliminary Phase (Fase Preliminar Nacional - Week 6).
 * 32 teams (4 per federation) compete in single-leg matches within their country:
 * - Country Team 1 vs Country Team 3
 * - Country Team 2 vs Country Team 4
 * Returns 16 winners (2 per country) and 16 preliminary fixtures.
 */
export function simulateNationalPreliminaries(
    nationalPreliminaries: Record<string, Team[]>
): {
    nationalWinners: Team[];
    preliminaryFixtures: Match[];
} {
    const preliminaryFixtures: Match[] = [];
    const nationalWinners: Team[] = [];

    const resolveMatchKey = (teamA: Team, teamB: Team, week: number): Team => {
        const ratingA = teamA.squad.reduce((s, p) => s + p.rating, 0) / (teamA.squad.length || 1);
        const ratingB = teamB.squad.reduce((s, p) => s + p.rating, 0) / (teamB.squad.length || 1);
        const probA = 0.5 + (ratingA - ratingB) * 0.03;
        const winner = Math.random() < Math.max(0.2, Math.min(0.8, probA)) ? teamA : teamB;
        
        const scoreWinner = 2 + Math.floor(Math.random() * 2);
        const scoreLoser = Math.floor(Math.random() * Math.min(2, scoreWinner));
        
        preliminaryFixtures.push({
            week,
            homeTeamId: teamA.id,
            awayTeamId: teamB.id,
            competition: 'Copa_Sudamericana',
            isCupMatch: true,
            isMidweek: true,
            result: {
                homeScore: winner.id === teamA.id ? scoreWinner : scoreLoser,
                awayScore: winner.id === teamB.id ? scoreWinner : scoreLoser
            }
        });

        return winner;
    };

    Object.entries(nationalPreliminaries).forEach(([_country, teams]) => {
        if (teams.length >= 4) {
            // Key 1: 1 vs 3
            const w1 = resolveMatchKey(teams[0], teams[2], 6);
            nationalWinners.push(w1);
            // Key 2: 2 vs 4
            const w2 = resolveMatchKey(teams[1], teams[3], 6);
            nationalWinners.push(w2);
        } else if (teams.length >= 2) {
            const w1 = resolveMatchKey(teams[0], teams[1], 6);
            nationalWinners.push(w1);
            if (teams[2]) nationalWinners.push(teams[2]);
        }
    });

    return {
        nationalWinners,
        preliminaryFixtures
    };
}

/**
 * Conducts the Sudamericana Group Stage Draw:
 * 32 teams:
 * - 16 winners of Fase Nacional
 * - 6 Argentina direct
 * - 6 Brasil direct
 * - 4 transferred from Libertadores Phase 3
 *
 * Pots:
 * - Direct 28 teams sorted by CONMEBOL Ranking:
 *   - Bombo 1: Top 8
 *   - Bombo 2: Next 8
 *   - Bombo 3: Next 8
 *   - Bombo 4: Last 4 + 4 transferred from Libertadores Phase 3
 *
 * Rule:
 * - No 2 teams from same federation in same group, EXCEPT the 4 transferred from Phase 3 which are exempt.
 * - Calendar: Weeks 8, 10, 12, 14, 16, 18 (midweek).
 */
export function drawSudamericanaGroups(
    directQualifiers: Team[], // 16 national winners + 6 ARG + 6 BRA = 28
    phase3Transfers: Team[]    // 4 from Lib Phase 3
): CupGroup[] {
    const globalPlacedIds = new Set<number>();

    // Deduplicate directQualifiers
    const uniqueDirect: Team[] = [];
    directQualifiers.forEach(t => {
        if (!globalPlacedIds.has(t.id)) {
            globalPlacedIds.add(t.id);
            uniqueDirect.push(t);
        }
    });

    // Fill up to 28 direct teams if needed
    while (uniqueDirect.length < 28) {
        const remaining = SOUTH_AMERICAN_EXTRA_TEAMS.filter(t => !globalPlacedIds.has(t.id));
        if (remaining.length === 0) break;
        uniqueDirect.push(remaining[0]);
        globalPlacedIds.add(remaining[0].id);
    }

    // Sort the 28 direct qualifiers by CONMEBOL ranking
    const sortedDirect = [...uniqueDirect].sort((a, b) => {
        return getTeamConmebolMeta(a).conmebolRanking - getTeamConmebolMeta(b).conmebolRanking;
    });

    const top28 = sortedDirect.slice(0, 28);
    const top28Ids = new Set(top28.map(t => t.id));

    // Ensure phase 3 transfers never duplicate a direct qualifier
    const uniquePhase3 = phase3Transfers.filter(t => !top28Ids.has(t.id));
    while (uniquePhase3.length < 4) {
        const remaining = SOUTH_AMERICAN_EXTRA_TEAMS.filter(t => !top28Ids.has(t.id) && !uniquePhase3.some(p => p.id === t.id));
        if (remaining.length === 0) break;
        uniquePhase3.push(remaining[0]);
    }
    const p3Ids = new Set(uniquePhase3.map(t => t.id));

    globalPlacedIds.clear();

    const pot1 = top28.slice(0, 8);
    const pot2 = top28.slice(8, 16);
    const pot3 = top28.slice(16, 24);
    const pot4 = [...top28.slice(24, 28), ...uniquePhase3];

    const groups: {
        id: string;
        name: string;
        teams: Team[];
    }[] = Array.from({ length: 8 }, (_, i) => ({
        id: `group_${String.fromCharCode(65 + i)}`,
        name: `Grupo ${String.fromCharCode(65 + i)}`,
        teams: []
    }));

    // Pot 1 placed sequentially
    pot1.forEach((team, idx) => {
        if (groups[idx] && !globalPlacedIds.has(team.id)) {
            groups[idx].teams.push(team);
            globalPlacedIds.add(team.id);
        }
    });

    // Place remaining pots with country restrictions
    const placePot = (pot: Team[], targetGroupSize: number) => {
        const shuffled = [...pot].sort(() => 0.5 - Math.random());

        shuffled.forEach(team => {
            if (globalPlacedIds.has(team.id)) return; // Strictly prevent placing team twice

            const isExempt = p3Ids.has(team.id);
            const teamCountry = getTeamConmebolMeta(team).country;

            let placed = false;
            for (let gIdx = 0; gIdx < 8; gIdx++) {
                const group = groups[gIdx];
                if (group.teams.length >= targetGroupSize) continue;

                if (isExempt) {
                    group.teams.push(team);
                    globalPlacedIds.add(team.id);
                    placed = true;
                    break;
                }

                const hasCountryConflict = group.teams.some(existing => {
                    if (p3Ids.has(existing.id)) return false;
                    return getTeamConmebolMeta(existing).country === teamCountry;
                });

                if (!hasCountryConflict) {
                    group.teams.push(team);
                    globalPlacedIds.add(team.id);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                const firstAvailable = groups.find(g => g.teams.length < targetGroupSize);
                if (firstAvailable) {
                    firstAvailable.teams.push(team);
                    globalPlacedIds.add(team.id);
                } else {
                    const anyFree = groups.find(g => g.teams.length < 4);
                    if (anyFree) {
                        anyFree.teams.push(team);
                        globalPlacedIds.add(team.id);
                    }
                }
            }
        });
    };

    placePot(pot2, 2);
    placePot(pot3, 3);
    placePot(pot4, 4);

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

        const matchdays: [number, [number, number], [number, number]][] = [
            [8,  [0, 1], [2, 3]],
            [10, [0, 2], [3, 1]],
            [12, [3, 0], [1, 2]],
            [14, [1, 0], [3, 2]],
            [16, [2, 0], [1, 3]],
            [18, [0, 3], [2, 1]],
        ];

        const fixtures: Match[] = [];
        matchdays.forEach(([week, m1, m2]) => {
            if (teamIds[m1[0]] && teamIds[m1[1]]) {
                fixtures.push({
                    week,
                    homeTeamId: teamIds[m1[0]],
                    awayTeamId: teamIds[m1[1]],
                    competition: 'Copa_Sudamericana',
                    isCupMatch: true,
                    isMidweek: true
                });
            }
            if (teamIds[m2[0]] && teamIds[m2[1]]) {
                fixtures.push({
                    week,
                    homeTeamId: teamIds[m2[0]],
                    awayTeamId: teamIds[m2[1]],
                    competition: 'Copa_Sudamericana',
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
export function sortSudamericanaGroupTable(table: CupGroup['table'], allTeams: Team[]): CupGroup['table'] {
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
 * Generates the Playoff de Octavos de Final (Week 20):
 * - 8 2nd-place teams from Sudamericana vs 8 3rd-place teams from Libertadores.
 * - Ranked 1 to 8 within their pool by performance (Pts, GD, GF).
 * - Matchups:
 *   S1 vs L8, S2 vs L7, S3 vs L6, S4 vs L5, S5 vs L4, S6 vs L3, S7 vs L2, S8 vs L1.
 * - Sudamericana runner-up plays as local.
 */
export function generateSudamericanaPlayoff(
    sudamericanaRunnersUp: { team: Team; points: number; goalDifference: number; goalsFor: number }[],
    libertadoresThirds: { team: Team; points: number; goalDifference: number; goalsFor: number }[],
    week: number = 20
): Match[] {
    const sortPool = (pool: { team: Team; points: number; goalDifference: number; goalsFor: number }[]) => {
        return [...pool].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
    };

    const sortedSud = sortPool(sudamericanaRunnersUp);
    const sortedLib = sortPool(libertadoresThirds);

    const fixtures: Match[] = [];
    const count = Math.min(sortedSud.length, sortedLib.length, 8);

    for (let i = 0; i < count; i++) {
        const sudTeam = sortedSud[i].team;
        const libTeam = sortedLib[count - 1 - i].team;

        fixtures.push({
            week,
            homeTeamId: sudTeam.id,
            awayTeamId: libTeam.id,
            competition: 'Copa_Sudamericana',
            isCupMatch: true,
            isMidweek: true
        });
    }

    return fixtures;
}

/**
 * Generates Octavos de Final (Week 24):
 * - 8 1st-place teams from Sudamericana group stage vs 8 winners from Playoff round.
 * - Sudamericana group winners play as home.
 */
export function drawSudamericanaOctavos(
    groupWinners: Team[],
    playoffWinners: Team[],
    week: number = 24
): Match[] {
    const shuffledWinners = [...groupWinners].sort(() => 0.5 - Math.random());
    const shuffledPlayoff = [...playoffWinners].sort(() => 0.5 - Math.random());
    const fixtures: Match[] = [];
    const count = Math.min(shuffledWinners.length, shuffledPlayoff.length);

    for (let i = 0; i < count; i++) {
        fixtures.push({
            week,
            homeTeamId: shuffledWinners[i].id,
            awayTeamId: shuffledPlayoff[i].id,
            competition: 'Copa_Sudamericana',
            isCupMatch: true,
            isMidweek: true
        });
    }

    return fixtures;
}

/**
 * Initializes the full CONMEBOL Copa Sudamericana for the season:
 * - 56 participants
 * - National preliminaries (Fase Nacional - Week 6)
 * - 8 groups of 4 teams (Weeks 8, 10, 12, 14, 16, 18)
 * - Fixtures for calendar
 */
export function initializeSudamericanaSeason(
    context: SudamericanaQualificationContext,
    existingCup?: CupCompetition
): SudamericanaInitialState {
    const participants = buildSudamericanaParticipants(context);

    const { nationalWinners, preliminaryFixtures } = simulateNationalPreliminaries(
        participants.nationalPreliminaries
    );

    const directQualifiers = [
        ...nationalWinners,
        ...participants.directToGroupsArg,
        ...participants.directToGroupsBra
    ];

    const groups = drawSudamericanaGroups(
        directQualifiers,
        participants.phase3Transfers
    );

    const groupFixtures: Match[] = [];
    groups.forEach(g => {
        groupFixtures.push(...g.fixtures);
    });

    const cup: CupCompetition = {
        id: 'copa_sudamericana',
        name: 'Copa Sudamericana',
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
        fixtures: [...preliminaryFixtures, ...groupFixtures]
    };
}
