import { Team, Match, CupCompetition, CupGroup, LeagueId, LeagueTableRow } from '../types';
import { getTeamConmebolMeta, SOUTH_AMERICAN_EXTRA_TEAMS } from '../data/teams/southAmericanClubs';

export interface ClubWorldCupQualificationContext {
    allTeams: Team[];
    leagueTables?: Partial<Record<LeagueId, LeagueTableRow[]>>;
    championsLeagueWinnerId?: number;
    europaLeagueWinnerId?: number;
    libertadoresWinnerId?: number;
    sudamericanaWinnerId?: number;
    defendingClubWorldCupWinnerId?: number;
    startWeek?: number;
}

export interface ClubWorldCupInitialState {
    cup: CupCompetition;
    fixtures: Match[];
}

const UEFA_FIRST_DIVS = new Set<string>([
    LeagueId.PREMIER_LEAGUE,
    LeagueId.LA_LIGA,
    LeagueId.BUNDESLIGA,
    LeagueId.SERIE_A,
    LeagueId.LIGUE_1,
    LeagueId.PRIMEIRA_LIGA,
    LeagueId.EREDIVISIE,
]);

const CONMEBOL_FIRST_DIVS = new Set<string>([
    LeagueId.BRASILEIRAO,
    LeagueId.LIGA_ARGENTINA,
    LeagueId.LIGA_URUGUAYA,
    LeagueId.LIGA_ECUADOR,
    LeagueId.PRIMERA_A_COLOMBIA,
    LeagueId.PRIMERA_DIVISION_CHILE,
    LeagueId.COPA_DE_PRIMERA,
]);

function getTeamStrengthScore(team: Team): number {
    const tierScore = team.tier === 'Top' ? 3000 : team.tier === 'Mid' ? 1500 : 500;
    const avgOvr = team.squad?.length
        ? team.squad.reduce((sum, p) => sum + p.rating, 0) / team.squad.length
        : 70;
    const budgetFactor = Math.min(800, Math.floor((team.budget || 0) / 500_000));
    return tierScore + avgOvr * 30 + budgetFactor;
}

/**
 * Selects 32 unique teams for the FIFA Club World Cup (32-team format):
 * - 16 UEFA slots (UCL/UEL champions + top league performers across ENG, ESP, GER, ITA, FRA)
 * - 12 CONMEBOL slots (Libertadores/Sudamericana champions + top BRA/ARG/URU/ECU/COL/PAR/CHI clubs)
 * - 4 CONCACAF slots (top Liga MX powerhouses)
 */
export function selectClubWorldCupParticipants(context: ClubWorldCupQualificationContext): Team[] {
    const {
        allTeams,
        leagueTables,
        championsLeagueWinnerId,
        europaLeagueWinnerId,
        libertadoresWinnerId,
        sudamericanaWinnerId,
        defendingClubWorldCupWinnerId,
    } = context;

    const poolMap = new Map<number, Team>();
    for (const t of [...allTeams, ...SOUTH_AMERICAN_EXTRA_TEAMS]) {
        if (!poolMap.has(t.id)) poolMap.set(t.id, t);
    }
    const pool = Array.from(poolMap.values());
    const findTeam = (id?: number) => (id ? poolMap.get(id) : undefined);

    const pickedIds = new Set<number>();
    const uefaTeams: Team[] = [];
    const conmebolTeams: Team[] = [];
    const concacafTeams: Team[] = [];

    const tryPush = (bucket: Team[], team: Team | undefined, limit: number): boolean => {
        if (!team || pickedIds.has(team.id) || bucket.length >= limit) return false;
        pickedIds.add(team.id);
        bucket.push(team);
        return true;
    };

    const orderedFromLeague = (leagueId: LeagueId): Team[] => {
        const table = leagueTables?.[leagueId];
        if (table && table.length > 0) {
            return [...table]
                .sort((a, b) => a.position - b.position || b.points - a.points || b.goalDifference - a.goalDifference)
                .map(row => poolMap.get(row.teamId))
                .filter((t): t is Team => Boolean(t));
        }
        return pool
            .filter(t => t.leagueId === leagueId)
            .sort((a, b) => getTeamStrengthScore(b) - getTeamStrengthScore(a));
    };

    // 1. Reigning champions
    const defChamp = findTeam(defendingClubWorldCupWinnerId);
    if (defChamp) {
        if (UEFA_FIRST_DIVS.has(defChamp.leagueId)) tryPush(uefaTeams, defChamp, 16);
        else if (defChamp.leagueId === LeagueId.LIGA_MX || defChamp.leagueId === LeagueId.MLS) tryPush(concacafTeams, defChamp, 4);
        else tryPush(conmebolTeams, defChamp, 12);
    }

    tryPush(uefaTeams, findTeam(championsLeagueWinnerId), 16);
    tryPush(uefaTeams, findTeam(europaLeagueWinnerId), 16);
    tryPush(conmebolTeams, findTeam(libertadoresWinnerId), 12);
    tryPush(conmebolTeams, findTeam(sudamericanaWinnerId), 12);

    // 2. Fill UEFA (16 total): Round-robin across Top 5 + Portugal + Netherlands
    const euroLeagues: LeagueId[] = [
        LeagueId.PREMIER_LEAGUE,
        LeagueId.LA_LIGA,
        LeagueId.BUNDESLIGA,
        LeagueId.SERIE_A,
        LeagueId.LIGUE_1,
        LeagueId.PRIMEIRA_LIGA,
        LeagueId.EREDIVISIE,
    ];
    const euroRankedByLeague = euroLeagues.map(l => orderedFromLeague(l));
    for (let rank = 0; rank < 5 && uefaTeams.length < 16; rank++) {
        for (const list of euroRankedByLeague) {
            if (uefaTeams.length >= 16) break;
            tryPush(uefaTeams, list[rank], 16);
        }
    }

    // 3. Fill CONMEBOL (12 total): BRA (up to 4), ARG (up to 3), plus URU/ECU/COL/PAR/CHI
    const braList = orderedFromLeague(LeagueId.BRASILEIRAO);
    const argList = orderedFromLeague(LeagueId.LIGA_ARGENTINA);
    const uruList = orderedFromLeague(LeagueId.LIGA_URUGUAYA);
    const ecuList = orderedFromLeague(LeagueId.LIGA_ECUADOR);
    const colList = orderedFromLeague(LeagueId.PRIMERA_A_COLOMBIA);
    const parList = orderedFromLeague(LeagueId.COPA_DE_PRIMERA);
    const chiList = orderedFromLeague(LeagueId.PRIMERA_DIVISION_CHILE);
    const extraConmebol = pool
        .filter(t => t.leagueId === 'CONMEBOL')
        .sort((a, b) => getTeamConmebolMeta(a).conmebolRanking - getTeamConmebolMeta(b).conmebolRanking);

    for (let i = 0; i < 4 && conmebolTeams.length < 12; i++) {
        tryPush(conmebolTeams, braList[i], 12);
    }
    for (let i = 0; i < 3 && conmebolTeams.length < 12; i++) {
        tryPush(conmebolTeams, argList[i], 12);
    }
    tryPush(conmebolTeams, uruList[0], 12);
    tryPush(conmebolTeams, ecuList[0], 12);
    tryPush(conmebolTeams, colList[0], 12);
    tryPush(conmebolTeams, parList[0], 12);
    tryPush(conmebolTeams, chiList[0], 12);

    const remainingConmebolPool = [
        ...braList,
        ...argList,
        ...uruList,
        ...ecuList,
        ...extraConmebol,
        ...colList,
        ...parList,
        ...chiList,
    ].sort((a, b) => getTeamStrengthScore(b) - getTeamStrengthScore(a));

    for (const c of remainingConmebolPool) {
        if (conmebolTeams.length >= 12) break;
        if (CONMEBOL_FIRST_DIVS.has(c.leagueId) || c.leagueId === 'CONMEBOL') {
            tryPush(conmebolTeams, c, 12);
        }
    }

    // 4. Fill CONCACAF (4 total): Mix of top Liga MX + MLS clubs
    const mxList = orderedFromLeague(LeagueId.LIGA_MX);
    const mlsList = orderedFromLeague(LeagueId.MLS);
    for (let i = 0; i < 2 && concacafTeams.length < 4; i++) {
        tryPush(concacafTeams, mxList[i], 4);
        tryPush(concacafTeams, mlsList[i], 4);
    }
    for (const mx of [...mxList, ...mlsList]) {
        if (concacafTeams.length >= 4) break;
        tryPush(concacafTeams, mx, 4);
    }

    const combined = [...uefaTeams, ...conmebolTeams, ...concacafTeams];
    if (combined.length < 32) {
        const overflow = pool
            .filter(t => !pickedIds.has(t.id))
            .sort((a, b) => getTeamStrengthScore(b) - getTeamStrengthScore(a));
        for (const t of overflow) {
            if (combined.length >= 32) break;
            pickedIds.add(t.id);
            combined.push(t);
        }
    }

    return combined.slice(0, 32);
}

/**
 * Organizes 32 qualified clubs into 8 balanced 4-team groups (Grupos A-H) with a
 * 3-matchday single round-robin schedule (FIFA Club World Cup official format).
 */
export function generateClubWorldCupGroups(teams: Team[], startWeek: number = 22): CupGroup[] {
    const sortedByStrength = [...teams].slice(0, 32).sort((a, b) => getTeamStrengthScore(b) - getTeamStrengthScore(a));

    // Seed into 4 pots of 8 teams, rotating pot order so European, South American, and Mexican clubs mix across all 8 groups
    const pot1 = sortedByStrength.slice(0, 8);
    const pot2 = sortedByStrength.slice(8, 16).sort(() => 0.5 - Math.random());
    const pot3 = sortedByStrength.slice(16, 24).sort(() => 0.5 - Math.random());
    const pot4 = sortedByStrength.slice(24, 32).sort(() => 0.5 - Math.random());

    const groups: CupGroup[] = [];
    for (let i = 0; i < 8; i++) {
        const groupTeams = [pot1[i], pot2[i], pot3[i], pot4[i]].filter(Boolean);
        const teamIds = groupTeams.map(t => t.id);

        const groupTable: LeagueTableRow[] = groupTeams.map((t, idx) => ({
            teamId: t.id,
            position: idx + 1,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: [] as ('W' | 'D' | 'L')[],
        }));

        // Single round-robin (3 matchdays): J1, J2, J3
        const matchdays: Array<[[number, number], [number, number]]> = [
            [[0, 1], [2, 3]],
            [[0, 2], [3, 1]],
            [[3, 0], [1, 2]],
        ];

        const fixtures: Match[] = [];
        matchdays.forEach((pairs, mdIdx) => {
            const matchWeek = startWeek + mdIdx * 2;
            for (const [hIdx, aIdx] of pairs) {
                if (teamIds[hIdx] && teamIds[aIdx]) {
                    fixtures.push({
                        week: matchWeek,
                        homeTeamId: teamIds[hIdx],
                        awayTeamId: teamIds[aIdx],
                        competition: 'Club_World_Cup',
                        isCupMatch: true,
                        isMidweek: true,
                    });
                }
            }
        });

        groups.push({
            id: `cwc_group_${String.fromCharCode(65 + i)}`,
            name: `Grupo ${String.fromCharCode(65 + i)}`,
            teams: teamIds,
            table: groupTable,
            fixtures,
        });
    }

    return groups;
}

export function initializeClubWorldCupSeason(
    context: ClubWorldCupQualificationContext,
    previousCup?: CupCompetition
): ClubWorldCupInitialState {
    const startWeek = context.startWeek ?? 22;
    const participants = selectClubWorldCupParticipants(context);
    const groups = generateClubWorldCupGroups(participants, startWeek);
    const fixtures = groups.flatMap(g => g.fixtures);

    const cup: CupCompetition = {
        id: 'club_world_cup',
        name: 'Mundial de Clubes FIFA',
        type: 'groups',
        phase: 'groups',
        groups,
        rounds: [],
        currentRoundIndex: 0,
        statistics: {
            topScorers: [],
            championsHistory: previousCup?.statistics?.championsHistory || [],
        },
    };

    return { cup, fixtures };
}

/**
 * Generates the two-legged CONMEBOL Recopa Sudamericana final:
 * - Leg 1 hosted by Copa Sudamericana champion
 * - Leg 2 hosted by Copa Libertadores champion
 */
export function generateRecopaSudamericanaFixtures(
    libertadoresWinnerId: number | undefined,
    sudamericanaWinnerId: number | undefined,
    allTeams: Team[],
    startWeek: number = 8
): Match[] {
    const pool = [...allTeams, ...SOUTH_AMERICAN_EXTRA_TEAMS];
    let libChamp = libertadoresWinnerId ? pool.find(t => t.id === libertadoresWinnerId) : undefined;
    let sudChamp = sudamericanaWinnerId ? pool.find(t => t.id === sudamericanaWinnerId) : undefined;

    if (!libChamp) libChamp = pool.find(t => t.id === 810) || pool.find(t => t.leagueId === LeagueId.BRASILEIRAO);
    if (!sudChamp || sudChamp.id === libChamp?.id) {
        sudChamp = pool.find(t => t.id === 703 && t.id !== libChamp?.id)
            || pool.find(t => t.leagueId === LeagueId.LIGA_ARGENTINA && t.id !== libChamp?.id);
    }

    if (!libChamp || !sudChamp) return [];

    return [
        {
            week: startWeek,
            homeTeamId: sudChamp.id,
            awayTeamId: libChamp.id,
            competition: 'Recopa_Sudamericana',
            isCupMatch: true,
            isMidweek: true,
            leg: 1,
        },
        {
            week: startWeek + 2,
            homeTeamId: libChamp.id,
            awayTeamId: sudChamp.id,
            competition: 'Recopa_Sudamericana',
            isCupMatch: true,
            isMidweek: true,
            leg: 2,
        },
    ];
}
