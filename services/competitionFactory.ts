import {
    Team,
    Match,
    CupCompetition,
    CupChampion,
    LeagueId,
    LeagueTableRow,
    GameState
} from '../types';
import { generateCupDraw, generateSwissPhase, determineCupWinner } from './simulation/cupGenerator';
import { computeArgentineInternationalQualification } from './argentinaRegulations';
import { initializeLibertadoresSeason } from './libertadoresEngine';
import { initializeSudamericanaSeason } from './sudamericanaEngine';
import { initializeClubWorldCupSeason, generateRecopaSudamericanaFixtures } from './clubWorldCupEngine';
import { resourceManager } from './resources/ResourceManager';

export interface SeasonCompetitionsParams {
    allTeams: Team[];
    playerTeamId?: number;
    leagueTables?: Record<LeagueId, LeagueTableRow[]>;
    previousCups?: GameState['cups'];
    completedSeason?: number;
}

export interface SeasonCompetitionsResult {
    cups: GameState['cups'];
    competitionFixtures: Match[];
}

const getTeamCupWinnerId = (cup?: CupCompetition): number | undefined => {
    if (!cup) return undefined;
    if (cup.winnerId) return cup.winnerId;
    if (cup.rounds && cup.rounds.length > 0) {
        const lastRound = cup.rounds[cup.rounds.length - 1];
        if (lastRound.fixtures?.length === 1 && lastRound.fixtures[0].result) {
            return determineCupWinner(lastRound.fixtures[0]) ?? undefined;
        }
    }
    return undefined;
};

const buildArchiveHistory = (
    cup: CupCompetition | undefined,
    completedSeason: number | undefined,
    allTeams: Team[]
): CupChampion[] => {
    const existing = cup?.statistics?.championsHistory || [];
    if (!cup || completedSeason === undefined) return existing;
    const winnerId = getTeamCupWinnerId(cup);
    if (!winnerId || existing.some(c => c.season === completedSeason)) return existing;
    const winnerTeam = allTeams.find(t => t.id === winnerId);
    return [
        { season: completedSeason, winnerId, winnerName: winnerTeam?.name || 'Desconocido' },
        ...existing
    ].slice(0, 10);
};

const selectClubsByTier = (teams: Team[], start: number, count: number): Team[] => {
    const tierWeight: Record<string, number> = { Top: 3, Mid: 2, Lower: 1 };
    return [...teams]
        .sort((a, b) => {
            const diff = (tierWeight[b.tier] || 1) - (tierWeight[a.tier] || 1);
            return diff !== 0 ? diff : (b.budget || 0) - (a.budget || 0);
        })
        .slice(start, start + count);
};

const selectClubsByTable = (
    table: LeagueTableRow[] | undefined,
    allTeams: Team[],
    start: number,
    count: number
): Team[] => {
    if (!table || table.length === 0) return [];
    return [...table]
        .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
        .slice(start, start + count)
        .map(row => allTeams.find(t => t.id === row.teamId))
        .filter(Boolean) as Team[];
};

const buildKnockoutCup = (
    id: string,
    name: string,
    fixtures: Match[],
    championsHistory: CupChampion[],
    secondLegFixtures?: Match[]
): CupCompetition => {
    const roundName = id === 'copa_intercontinental' || id === 'recopa_sudamericana' ? 'Final' : 'Round 1';
    const rounds =
        fixtures.length > 0
            ? [{ name: roundName, fixtures, ...(secondLegFixtures ? { secondLegFixtures } : {}), completed: false }]
            : [];
    return {
        id,
        name,
        logo: resourceManager.competitionLogo(id, name),
        type: 'knockout',
        phase: 'knockout',
        rounds,
        currentRoundIndex: 0,
        statistics: { topScorers: [], championsHistory }
    };
};

/**
 * Generates all domestic cups, continental competitions, Recopa, Intercontinental,
 * and Club World Cup fixtures on a strictly collision-free 40-week midweek grid.
 * Shared by Season 1 (`gameFactory.ts`) and Season 2+ (`seasonManager.ts`).
 */
export function buildSeasonCompetitions(params: SeasonCompetitionsParams): SeasonCompetitionsResult {
    const { allTeams, playerTeamId, leagueTables, previousCups, completedSeason } = params;

    const byLeague = (lid: LeagueId) => allTeams.filter(t => t.leagueId === lid);

    // 1. Domestic Cups — assigned to non-overlapping odd midweeks avoiding CWC (21..33)
    const englishTeams = [...byLeague(LeagueId.PREMIER_LEAGUE), ...byLeague(LeagueId.CHAMPIONSHIP)];
    const spanishTeams = [...byLeague(LeagueId.LA_LIGA), ...byLeague(LeagueId.SEGUNDA_DIVISION_ESP)];
    const germanTeams = [...byLeague(LeagueId.BUNDESLIGA), ...byLeague(LeagueId.ZWEITE_BUNDESLIGA)];
    const italianTeams = [...byLeague(LeagueId.SERIE_A), ...byLeague(LeagueId.SERIE_B_ITA)];
    const argentinianTeams = [...byLeague(LeagueId.LIGA_ARGENTINA), ...byLeague(LeagueId.PRIMERA_NACIONAL)];
    const mexicanTeams = [...byLeague(LeagueId.LIGA_MX), ...byLeague(LeagueId.LIGA_EXPANSION_MX)];

    const assignMidweek = (fixtures: Match[], week: number): Match[] =>
        fixtures.map(m => ({ ...m, week, isMidweek: true }));

    const faCupFixtures = assignMidweek(generateCupDraw(englishTeams, 'Round 1', 'FA_Cup', playerTeamId), 5);
    const carabaoCupFixtures = assignMidweek(generateCupDraw(englishTeams, 'Round 1', 'Carabao_Cup', playerTeamId), 3);
    const copaDelReyFixtures = assignMidweek(generateCupDraw(spanishTeams, 'Round 1', 'Copa_del_Rey', playerTeamId), 5);
    const dfbPokalFixtures = assignMidweek(generateCupDraw(germanTeams, 'Round 1', 'DFB_Pokal', playerTeamId), 5);
    const coppaItaliaFixtures = assignMidweek(generateCupDraw(italianTeams, 'Round 1', 'Coppa_Italia', playerTeamId), 5);
    const copaArgentinaFixtures = assignMidweek(generateCupDraw(argentinianTeams, 'Round 1', 'Copa_Argentina', playerTeamId), 7);
    const copaMxFixtures = assignMidweek(generateCupDraw(mexicanTeams, 'Round 1', 'Copa_MX', playerTeamId), 3);

    // 2. UEFA Champions League & Europa League (36 teams each, even midweeks W4..W18)
    const selectEuro = (lid: LeagueId, start: number, count: number): Team[] => {
        if (leagueTables) {
            const fromTable = selectClubsByTable(leagueTables[lid], allTeams, start, count);
            if (fromTable.length > 0) return fromTable;
        }
        return selectClubsByTier(byLeague(lid), start, count);
    };

    const clMap = new Map<number, Team>();
    [
        ...selectEuro(LeagueId.PREMIER_LEAGUE, 0, 6),
        ...selectEuro(LeagueId.LA_LIGA, 0, 6),
        ...selectEuro(LeagueId.BUNDESLIGA, 0, 6),
        ...selectEuro(LeagueId.SERIE_A, 0, 6),
        ...selectEuro(LeagueId.LIGUE_1, 0, 5),
        ...selectEuro(LeagueId.PRIMEIRA_LIGA, 0, 3),
        ...selectEuro(LeagueId.EREDIVISIE, 0, 3),
        ...selectEuro(LeagueId.CHAMPIONSHIP, 0, 1)
    ].forEach(t => clMap.set(t.id, t));
    const clTeams = Array.from(clMap.values()).slice(0, 36);

    const elMap = new Map<number, Team>();
    [
        ...selectEuro(LeagueId.PREMIER_LEAGUE, 6, 6),
        ...selectEuro(LeagueId.LA_LIGA, 6, 6),
        ...selectEuro(LeagueId.BUNDESLIGA, 6, 6),
        ...selectEuro(LeagueId.SERIE_A, 6, 6),
        ...selectEuro(LeagueId.LIGUE_1, 5, 5),
        ...selectEuro(LeagueId.PRIMEIRA_LIGA, 3, 3),
        ...selectEuro(LeagueId.EREDIVISIE, 3, 3),
        ...selectEuro(LeagueId.CHAMPIONSHIP, 1, 2)
    ]
        .filter(t => !clMap.has(t.id))
        .forEach(t => elMap.set(t.id, t));
    const elTeams = Array.from(elMap.values()).slice(0, 36);

    const clSwiss = generateSwissPhase(clTeams, 'Champions_League', 8);
    const elSwiss = generateSwissPhase(elTeams, 'Europa_League', 8);
    const clFixtures = clSwiss.fixtures.map(m => ({ ...m, week: m.week + 2, isMidweek: true }));
    const elFixtures = elSwiss.fixtures.map(m => ({ ...m, week: m.week + 2, isMidweek: true }));

    // 3. CONMEBOL Libertadores & Sudamericana
    const prevLibWinner = previousCups ? getTeamCupWinnerId(previousCups.copaLibertadores) : 810;
    const prevSudWinner = previousCups ? getTeamCupWinnerId(previousCups.copaSudamericana) : 703;
    const prevClWinner = previousCups ? getTeamCupWinnerId(previousCups.championsLeague) : 201;
    const prevElWinner = previousCups ? getTeamCupWinnerId(previousCups.europaLeague) : undefined;
    const prevCwcWinner = previousCups ? getTeamCupWinnerId(previousCups.clubWorldCup) : undefined;

    let argLibIds = [702, 703, 707, 706, 711, 719];
    let argSudIds = [701, 704, 708, 721, 724, 715, 714];
    if (leagueTables && previousCups) {
        const argQual = computeArgentineInternationalQualification(
            leagueTables[LeagueId.LIGA_ARGENTINA] || [],
            previousCups
        );
        argLibIds = argQual.libertadores.map(q => q.teamId);
        argSudIds = argQual.sudamericana.map(q => q.teamId);
    }

    const libInit = initializeLibertadoresSeason(
        {
            allTeams,
            leagueTables,
            lastLibertadoresWinnerId: prevLibWinner,
            lastSudamericanaWinnerId: prevSudWinner,
            argentineQualifiedIds: argLibIds
        },
        previousCups?.copaLibertadores
    );

    const libParticipantIds = new Set<number>();
    libInit.cup.groups?.forEach(g => g.teams.forEach(id => libParticipantIds.add(id)));
    libInit.fixtures.forEach(m => {
        libParticipantIds.add(m.homeTeamId);
        libParticipantIds.add(m.awayTeamId);
    });

    const sudInit = initializeSudamericanaSeason(
        {
            allTeams,
            leagueTables,
            lastSudamericanaWinnerId: prevSudWinner,
            argentineQualifiedIds: argSudIds,
            libertadoresPhase3Losers: libInit.phase3Losers,
            excludedTeamIds: libParticipantIds
        },
        previousCups?.copaSudamericana
    );

    // 4. Intercontinental (W2), Recopa (W3/W5) & Club World Cup (W21..W33 odd midweeks)
    let intercontinentalFixtures: Match[] = [];
    if (prevLibWinner && prevClWinner) {
        const teamA = allTeams.find(t => t.id === prevLibWinner);
        const teamB = allTeams.find(t => t.id === prevClWinner);
        if (teamA && teamB) {
            intercontinentalFixtures = [{
                week: 2,
                homeTeamId: teamA.id,
                awayTeamId: teamB.id,
                competition: 'Copa_Intercontinental',
                isCupMatch: true,
                isMidweek: true
            }];
        }
    }

    const recopaFixtures = generateRecopaSudamericanaFixtures(prevLibWinner, prevSudWinner, allTeams, 3);
    const cwcInit = initializeClubWorldCupSeason(
        {
            allTeams,
            leagueTables,
            championsLeagueWinnerId: prevClWinner,
            europaLeagueWinnerId: prevElWinner,
            libertadoresWinnerId: prevLibWinner,
            sudamericanaWinnerId: prevSudWinner,
            defendingClubWorldCupWinnerId: prevCwcWinner,
            startWeek: 21
        },
        previousCups?.clubWorldCup
    );

    const hist = (cup?: CupCompetition) => buildArchiveHistory(cup, completedSeason, allTeams);

    const cups: GameState['cups'] = {
        faCup: buildKnockoutCup('fa_cup', 'FA Cup', faCupFixtures, hist(previousCups?.faCup)),
        carabaoCup: buildKnockoutCup('carabao_cup', 'Carabao Cup', carabaoCupFixtures, hist(previousCups?.carabaoCup)),
        copaDelRey: buildKnockoutCup('copa_del_rey', 'Copa del Rey', copaDelReyFixtures, hist(previousCups?.copaDelRey)),
        dfbPokal: buildKnockoutCup('dfb_pokal', 'DFB-Pokal', dfbPokalFixtures, hist(previousCups?.dfbPokal)),
        coppaItalia: buildKnockoutCup('coppa_italia', 'Coppa Italia', coppaItaliaFixtures, hist(previousCups?.coppaItalia)),
        copaArgentina: buildKnockoutCup('copa_argentina', 'Copa Argentina', copaArgentinaFixtures, hist(previousCups?.copaArgentina)),
        copaMx: buildKnockoutCup('copa_mx', 'Copa MX', copaMxFixtures, hist(previousCups?.copaMx)),
        aperturaPlayoffs: buildKnockoutCup('apertura_playoffs', 'Playoffs Apertura', [], hist(previousCups?.aperturaPlayoffs)),
        clausuraPlayoffs: buildKnockoutCup('clausura_playoffs', 'Playoffs Clausura', [], hist(previousCups?.clausuraPlayoffs)),
        nacionalPrimerAscenso: buildKnockoutCup('nacional_primer_ascenso', 'Final 1º Ascenso', [], hist(previousCups?.nacionalPrimerAscenso)),
        nacionalReducido: buildKnockoutCup('nacional_reducido', 'Torneo Reducido', [], hist(previousCups?.nacionalReducido)),
        copaLibertadores: {
            ...libInit.cup,
            statistics: { topScorers: [], championsHistory: hist(previousCups?.copaLibertadores) }
        },
        copaSudamericana: {
            ...sudInit.cup,
            statistics: { topScorers: [], championsHistory: hist(previousCups?.copaSudamericana) }
        },
        championsLeague: {
            id: 'champions_league',
            name: 'UEFA Champions League',
            logo: resourceManager.competitionLogo('champions_league', 'UEFA Champions League'),
            type: 'swiss',
            phase: 'swiss',
            swissTable: clSwiss.table,
            swissFixtures: clFixtures,
            rounds: [],
            currentRoundIndex: 0,
            statistics: { topScorers: [], championsHistory: hist(previousCups?.championsLeague) }
        },
        europaLeague: {
            id: 'europa_league',
            name: 'UEFA Europa League',
            logo: resourceManager.competitionLogo('europa_league', 'UEFA Europa League'),
            type: 'swiss',
            phase: 'swiss',
            swissTable: elSwiss.table,
            swissFixtures: elFixtures,
            rounds: [],
            currentRoundIndex: 0,
            statistics: { topScorers: [], championsHistory: hist(previousCups?.europaLeague) }
        },
        copaIntercontinental: buildKnockoutCup(
            'copa_intercontinental',
            'Copa Intercontinental',
            intercontinentalFixtures,
            hist(previousCups?.copaIntercontinental)
        ),
        recopaSudamericana: buildKnockoutCup(
            'recopa_sudamericana',
            'Recopa Sudamericana',
            recopaFixtures.length === 2 ? [recopaFixtures[0]] : [],
            hist(previousCups?.recopaSudamericana),
            recopaFixtures.length === 2 ? [recopaFixtures[1]] : undefined
        ),
        clubWorldCup: {
            ...cwcInit.cup,
            statistics: { topScorers: [], championsHistory: hist(previousCups?.clubWorldCup) }
        }
    };

    const competitionFixtures: Match[] = [
        ...faCupFixtures,
        ...carabaoCupFixtures,
        ...copaDelReyFixtures,
        ...dfbPokalFixtures,
        ...coppaItaliaFixtures,
        ...copaArgentinaFixtures,
        ...copaMxFixtures,
        ...intercontinentalFixtures,
        ...recopaFixtures,
        ...libInit.fixtures,
        ...sudInit.fixtures,
        ...clFixtures,
        ...elFixtures,
        ...cwcInit.fixtures
    ];

    return { cups, competitionFixtures };
}
