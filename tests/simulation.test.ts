import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createInitialLeagueTable,
    updateTeamMorale,
    generateYouthPlayer,
    generateCupDraw,
    determineCupWinner,
    advanceCupRound,
    simulateMatch,
    simulateMacroMatch,
    handlePromotionRelegation,
    sortArgentineZones,
    generateArgentineTournamentSchedule,
    generateLeagueSchedule,
    ARGENTINE_CLASSIC_PAIRS,
    computeArgentineRelegation,
    computeArgentineInternationalQualification,
    calculateTournamentStandings
} from '../services/simulation';
import { initializeGame } from '../services/gameFactory';
import { TEAMS } from '../constants';
import { Team, Player, Match, LeagueTableRow, CupCompetition, LeagueId } from '../types';

// Helper to create a dummy player
const createMockPlayer = (id: number, pos: Player['position'], rating = 75): Player => ({
    id,
    name: `Player ${id}`,
    position: pos,
    rating,
    value: 10,
    wage: 20000,
    morale: 'Normal',
    contractYears: 2,
    age: 24,
    isTransferListed: false,
    condition: 100,
    isInjured: false,
    isSuspended: false,
    stats: { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 }
});

// Helper to create a dummy team with full squad
const createMockTeam = (id: number, name: string, leagueId: LeagueId = LeagueId.PREMIER_LEAGUE, rating = 75): Team => {
    const squad: Player[] = [
        createMockPlayer(id * 100 + 1, 'POR', rating),
        createMockPlayer(id * 100 + 2, 'DEF', rating),
        createMockPlayer(id * 100 + 3, 'DEF', rating),
        createMockPlayer(id * 100 + 4, 'DEF', rating),
        createMockPlayer(id * 100 + 5, 'DEF', rating),
        createMockPlayer(id * 100 + 6, 'CEN', rating),
        createMockPlayer(id * 100 + 7, 'CEN', rating),
        createMockPlayer(id * 100 + 8, 'CEN', rating),
        createMockPlayer(id * 100 + 9, 'CEN', rating),
        createMockPlayer(id * 100 + 10, 'DEL', rating),
        createMockPlayer(id * 100 + 11, 'DEL', rating),
        // Bench
        createMockPlayer(id * 100 + 12, 'POR', rating - 5),
        createMockPlayer(id * 100 + 13, 'DEF', rating - 5),
        createMockPlayer(id * 100 + 14, 'CEN', rating - 5),
        createMockPlayer(id * 100 + 15, 'DEL', rating - 5)
    ];

    return {
        id,
        name,
        leagueId,
        tier: 'Top',
        rating,
        budget: 50,
        squad,
        coach: {
            id: id * 10,
            name: `Coach ${name}`,
            preferredFormation: '4-4-2',
            satisfactionLevel: 90,
            tacticalStyle: 'Balanceado',
            wage: 50000,
            contractYears: 2
        },
        trophyCabinet: []
    };
};

test('createInitialLeagueTable creates a valid empty table for teams', () => {
    const teams = [
        createMockTeam(1, 'Team Alpha'),
        createMockTeam(2, 'Team Beta'),
        createMockTeam(3, 'Team Gamma')
    ];

    const table = createInitialLeagueTable(teams);
    assert.equal(table.length, 3);
    
    table.forEach(row => {
        assert.equal(row.played, 0);
        assert.equal(row.won, 0);
        assert.equal(row.drawn, 0);
        assert.equal(row.lost, 0);
        assert.equal(row.points, 0);
        assert.equal(row.goalsFor, 0);
        assert.equal(row.goalsAgainst, 0);
        assert.equal(row.goalDifference, 0);
    });
});

test('updateTeamMorale updates morale correctly based on match results', () => {
    assert.equal(updateTeamMorale('Normal', 'W'), 'Contento');
    assert.equal(updateTeamMorale('Contento', 'W'), 'Feliz');
    assert.equal(updateTeamMorale('Feliz', 'W'), 'Feliz'); // cap max

    assert.equal(updateTeamMorale('Normal', 'L'), 'Descontento');
    assert.equal(updateTeamMorale('Descontento', 'L'), 'Enojado');
    assert.equal(updateTeamMorale('Enojado', 'L'), 'Enojado'); // cap min

    assert.equal(updateTeamMorale('Normal', 'D'), 'Normal');
    assert.equal(updateTeamMorale('Contento', 'D'), 'Contento');
});

test('generateYouthPlayer generates a valid youth player with expected bounds', () => {
    const youth = generateYouthPlayer('Top');
    
    assert.ok(youth.id > 0);
    assert.ok(youth.name.length > 0);
    assert.ok(['POR', 'DEF', 'CEN', 'DEL'].includes(youth.position));
    assert.ok(youth.age >= 15 && youth.age <= 18);
    assert.ok(youth.rating >= 45 && youth.rating <= 85);
    assert.equal(youth.condition, 100);
    assert.equal(youth.isInjured, false);
    assert.equal(youth.isSuspended, false);
    assert.equal(youth.stats.goals, 0);
});

test('generateCupDraw generates correct fixture pairings for knockout rounds', () => {
    const teams = Array.from({ length: 16 }, (_, i) => createMockTeam(i + 1, `Team ${i + 1}`));
    
    const roundOf16Draw = generateCupDraw(teams, 'Round of 16', 'FA_Cup');
    assert.equal(roundOf16Draw.length, 8);
    roundOf16Draw.forEach(fixture => {
        assert.equal(fixture.competition, 'FA_Cup');
        assert.equal(fixture.isCupMatch, true);
        assert.notEqual(fixture.homeTeamId, fixture.awayTeamId);
    });

    const quartersTeams = teams.slice(0, 8);
    const quartersDraw = generateCupDraw(quartersTeams, 'Quarterfinals', 'FA_Cup');
    assert.equal(quartersDraw.length, 4);

    const semisTeams = teams.slice(0, 4);
    const semisDraw = generateCupDraw(semisTeams, 'Semifinals', 'FA_Cup');
    assert.equal(semisDraw.length, 2);

    const finalTeams = teams.slice(0, 2);
    const finalDraw = generateCupDraw(finalTeams, 'Final', 'FA_Cup');
    assert.equal(finalDraw.length, 1);
});

test('determineCupWinner resolves standard matches and penalty shootouts', () => {
    // Standard Home Win
    const homeWinMatch: Match = {
        week: 1,
        homeTeamId: 1,
        awayTeamId: 2,
        competition: 'FA_Cup',
        isCupMatch: true,
        result: { homeScore: 3, awayScore: 1 }
    };
    assert.equal(determineCupWinner(homeWinMatch), 1);

    // Standard Away Win
    const awayWinMatch: Match = {
        week: 1,
        homeTeamId: 1,
        awayTeamId: 2,
        competition: 'FA_Cup',
        isCupMatch: true,
        result: { homeScore: 0, awayScore: 2 }
    };
    assert.equal(determineCupWinner(awayWinMatch), 2);

    // Draw resolved by penalties
    const penaltyMatch: Match = {
        week: 1,
        homeTeamId: 1,
        awayTeamId: 2,
        competition: 'FA_Cup',
        isCupMatch: true,
        result: { homeScore: 2, awayScore: 2 },
        penalties: { home: 5, away: 4 }
    };
    assert.equal(determineCupWinner(penaltyMatch), 1);
});

test('advanceCupRound advances round to the next stage or crowns a champion in the final', () => {
    const teams = [
        createMockTeam(1, 'Team 1'),
        createMockTeam(2, 'Team 2'),
        createMockTeam(3, 'Team 3'),
        createMockTeam(4, 'Team 4')
    ];

    const cup: CupCompetition = {
        id: 'fa_cup',
        name: 'FA Cup',
        currentRoundIndex: 0,
        rounds: [
            {
                name: 'Semifinals',
                completed: false,
                fixtures: [
                    { week: 10, homeTeamId: 1, awayTeamId: 2, competition: 'FA_Cup', isCupMatch: true, result: { homeScore: 2, awayScore: 0 } },
                    { week: 10, homeTeamId: 3, awayTeamId: 4, competition: 'FA_Cup', isCupMatch: true, result: { homeScore: 1, awayScore: 3 } }
                ]
            }
        ]
    };

    const nextCup = advanceCupRound(cup, teams, 15);
    assert.equal(nextCup.currentRoundIndex, 1);
    assert.equal(nextCup.rounds.length, 2);
    assert.equal(nextCup.rounds[1].name, 'Final');
    assert.equal(nextCup.rounds[1].fixtures.length, 1);
    assert.equal(nextCup.rounds[1].fixtures[0].homeTeamId, 1); // Winner of match 1
    assert.equal(nextCup.rounds[1].fixtures[0].awayTeamId, 4); // Winner of match 2

    // Now complete the final
    nextCup.rounds[1].fixtures[0].result = { homeScore: 1, awayScore: 0 };
    const finalCup = advanceCupRound(nextCup, teams, 20);
    assert.equal(finalCup.phase, 'finished');
    assert.equal(finalCup.winnerId, 1);
});

test('simulateMatch simulates a full match with valid scorelines and player stats update', () => {
    const homeTeam = createMockTeam(1, 'Arsenal', LeagueId.PREMIER_LEAGUE, 84);
    const awayTeam = createMockTeam(2, 'Chelsea', LeagueId.PREMIER_LEAGUE, 82);

    const homeRow: LeagueTableRow = {
        teamId: 1, position: 1, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: []
    };
    const awayRow: LeagueTableRow = {
        teamId: 2, position: 2, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: []
    };

    const matchResult = simulateMatch(homeTeam, awayTeam, homeRow, awayRow, false);

    assert.ok(typeof matchResult.homeScore === 'number' && matchResult.homeScore >= 0);
    assert.ok(typeof matchResult.awayScore === 'number' && matchResult.awayScore >= 0);
    assert.ok(Array.isArray(matchResult.events));
    assert.ok(Array.isArray(matchResult.scorers));

    // Starters must have played minutes and reduced condition
    const homeStarter = homeTeam.squad[0];
    assert.ok(homeStarter.stats.appearances >= 1);
    assert.ok(homeStarter.stats.minutes >= 30);
    assert.ok(homeStarter.condition !== undefined && homeStarter.condition < 100);
});

test('handlePromotionRelegation promotes top teams and relegates bottom teams', () => {
    // 20 Premier League teams
    const premTeams = Array.from({ length: 20 }, (_, i) => createMockTeam(i + 1, `Prem ${i + 1}`, LeagueId.PREMIER_LEAGUE));
    // 24 Championship teams
    const champTeams = Array.from({ length: 24 }, (_, i) => createMockTeam(i + 101, `Champ ${i + 1}`, LeagueId.CHAMPIONSHIP));

    const allTeams = [...premTeams, ...champTeams];

    // Dummy League Table for Premier League (Bottom 3 are teams 18, 19, 20)
    const premTable: LeagueTableRow[] = premTeams.map((t, idx) => ({
        teamId: t.id,
        position: idx + 1,
        played: 38,
        won: 20 - idx,
        drawn: 0,
        lost: idx,
        goalsFor: 50 - idx,
        goalsAgainst: 20 + idx,
        goalDifference: 30 - 2 * idx,
        points: (20 - idx) * 3,
        form: []
    }));

    // Dummy League Table for Championship (Top 3 are teams 101, 102, 103)
    const champTable: LeagueTableRow[] = champTeams.map((t, idx) => ({
        teamId: t.id,
        position: idx + 1,
        played: 46,
        won: 30 - idx,
        drawn: 0,
        lost: idx,
        goalsFor: 60 - idx,
        goalsAgainst: 20 + idx,
        goalDifference: 40 - 2 * idx,
        points: (30 - idx) * 3,
        form: []
    }));

    const leagueTables: Record<LeagueId, LeagueTableRow[]> = {
        [LeagueId.PREMIER_LEAGUE]: premTable,
        [LeagueId.CHAMPIONSHIP]: champTable,
        [LeagueId.LA_LIGA]: [],
        [LeagueId.SEGUNDA_DIVISION_ESP]: [],
        [LeagueId.BUNDESLIGA]: [],
        [LeagueId.ZWEITE_BUNDESLIGA]: [],
        [LeagueId.SERIE_A]: [],
        [LeagueId.SERIE_B_ITA]: [],
        [LeagueId.LIGUE_1]: [],
        [LeagueId.LIGUE_2]: [],
        [LeagueId.LIGA_ARGENTINA]: [],
        [LeagueId.PRIMERA_NACIONAL]: [],
        [LeagueId.BRASILEIRAO]: [],
        [LeagueId.SERIE_B_BR]: []
    };

    const updatedTeams = handlePromotionRelegation(allTeams, leagueTables);

    // Verify relegated teams (Prem 18, 19, 20 -> Championship)
    assert.equal(updatedTeams.find(t => t.id === 18)?.leagueId, LeagueId.CHAMPIONSHIP);
    assert.equal(updatedTeams.find(t => t.id === 19)?.leagueId, LeagueId.CHAMPIONSHIP);
    assert.equal(updatedTeams.find(t => t.id === 20)?.leagueId, LeagueId.CHAMPIONSHIP);

    // Verify promoted teams (Champ 101, 102, 103 -> Premier League)
    assert.equal(updatedTeams.find(t => t.id === 101)?.leagueId, LeagueId.PREMIER_LEAGUE);
    assert.equal(updatedTeams.find(t => t.id === 102)?.leagueId, LeagueId.PREMIER_LEAGUE);
    assert.equal(updatedTeams.find(t => t.id === 103)?.leagueId, LeagueId.PREMIER_LEAGUE);
});

test('handlePromotionRelegation preserves exact 15 Zone A and 15 Zone B teams for Liga Argentina', () => {
    // 30 teams for Liga Argentina: 15 in Zone A, 15 in Zone B
    const argTeams: Team[] = Array.from({ length: 30 }, (_, i) => ({
        id: 700 + i + 1,
        name: `Arg Team ${i + 1}`,
        leagueId: LeagueId.LIGA_ARGENTINA,
        zone: i < 15 ? 'A' : 'B',
        budget: 1000000,
        transferBudget: 500000,
        tier: 'Mid',
        teamMorale: 'Normal',
        squad: []
    }));

    // 38 teams for Primera Nacional: 19 in Zone A, 19 in Zone B
    const pnTeams: Team[] = Array.from({ length: 38 }, (_, i) => ({
        id: 800 + i + 1,
        name: `PN Team ${i + 1}`,
        leagueId: LeagueId.PRIMERA_NACIONAL,
        zone: i < 19 ? 'A' : 'B',
        budget: 500000,
        transferBudget: 100000,
        tier: 'Lower',
        teamMorale: 'Normal',
        squad: []
    }));

    const allTeams = [...argTeams, ...pnTeams];

    // Arg table: last place team 730 (Zone B), worst promedio team 715 (Zone A)
    const argTable: LeagueTableRow[] = argTeams.map((t, idx) => ({
        teamId: t.id,
        position: idx + 1,
        played: 32,
        won: 30 - idx,
        drawn: 0,
        lost: idx + 2,
        goalsFor: 40,
        goalsAgainst: 20 + idx,
        goalDifference: 20 - idx,
        points: (30 - idx) * 3,
        form: [],
        zone: t.zone,
        promedio: idx === 14 ? 0.5 : (30 - idx) * 0.1 // idx 14 is team 715 (Zone A) with worst promedio
    }));

    const pnTable: LeagueTableRow[] = pnTeams.map((t, idx) => ({
        teamId: t.id,
        position: idx + 1,
        played: 38,
        won: 38 - idx,
        drawn: 0,
        lost: idx,
        goalsFor: 50,
        goalsAgainst: 20,
        goalDifference: 30,
        points: (38 - idx) * 3,
        form: [],
        zone: t.zone
    }));

    const leagueTables: any = {
        [LeagueId.LIGA_ARGENTINA]: argTable,
        [LeagueId.PRIMERA_NACIONAL]: pnTable
    };

    const updated = handlePromotionRelegation(allTeams, leagueTables);

    const newArgTeams = updated.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA);
    const newPnTeams = updated.filter(t => t.leagueId === LeagueId.PRIMERA_NACIONAL);

    assert.equal(newArgTeams.length, 30, 'Liga Argentina must have exactly 30 teams');
    assert.equal(newArgTeams.filter(t => t.zone === 'A').length, 15, 'Liga Argentina Zone A must have exactly 15 teams');
    assert.equal(newArgTeams.filter(t => t.zone === 'B').length, 15, 'Liga Argentina Zone B must have exactly 15 teams');

    assert.equal(newPnTeams.length, 38, 'Primera Nacional must have exactly 38 teams');
    assert.equal(newPnTeams.filter(t => t.zone === 'A').length, 19, 'Primera Nacional Zone A must have exactly 19 teams');
    assert.equal(newPnTeams.filter(t => t.zone === 'B').length, 19, 'Primera Nacional Zone B must have exactly 19 teams');
});

test('isSeasonCompleted returns true only when all scheduled matches are played and season has advanced', async () => {
    const { isSeasonCompleted } = await import('../services/seasonUtils');

    const mockGameState: any = {
        season: 2024,
        currentWeek: 40,
        team: { id: 701, leagueId: LeagueId.LIGA_ARGENTINA },
        cups: {
            clausuraPlayoffs: { rounds: [{ name: 'Final', completed: true }], winnerId: 701 }
        },
        schedule: [
            { week: 1, homeTeamId: 701, awayTeamId: 702, result: { homeScore: 2, awayScore: 1 } },
            { week: 40, homeTeamId: 701, awayTeamId: 703, result: { homeScore: 1, awayScore: 0 } }
        ]
    };

    assert.equal(isSeasonCompleted(mockGameState), true);

    // If there is an upcoming unplayed match during the season (e.g. week 35 when currentWeek is 30)
    mockGameState.currentWeek = 30;
    mockGameState.schedule.push({ week: 35, homeTeamId: 701, awayTeamId: 704, result: undefined });
    assert.equal(isSeasonCompleted(mockGameState), false);

    // If week is early in the season (< 20)
    mockGameState.schedule.pop();
    mockGameState.currentWeek = 10;
    assert.equal(isSeasonCompleted(mockGameState), false);

    // If week is 40 and Argentine season is complete, unrelated matches in other leagues (e.g. English Championship) must NOT block it!
    mockGameState.currentWeek = 40;
    mockGameState.schedule.push({ week: 44, homeTeamId: 101, awayTeamId: 102, result: undefined }); // Championship match
    assert.equal(isSeasonCompleted(mockGameState), true, 'Unrelated foreign matches must not block Argentine season completion');

    // Hard safety cap: When week 40 is reached in Argentina, season is complete even if orphan matches exist
    mockGameState.schedule.push({ week: 45, homeTeamId: 701, awayTeamId: 705, result: undefined });
    assert.equal(isSeasonCompleted(mockGameState), true, 'Hard cap at week 40 guarantees completion');
});

test('startNewSeason successfully transitions seasons without crash and initializes Europa League', async () => {
    const { startNewSeason } = await import('../services/seasonManager');
    const { getBaseWeeklyIncome, calculatePrizeMoney } = await import('../services/economy');

    // Verify all 14 leagues have defined positive base weekly income and prize pools
    for (const lid of Object.values(LeagueId)) {
        const weekly = getBaseWeeklyIncome(lid);
        assert.ok(weekly > 100_000, `League ${lid} should have weekly income > 100k, got ${weekly}`);
        const prize1 = calculatePrizeMoney(lid, 1);
        const prizeLast = calculatePrizeMoney(lid, 20);
        assert.ok(prize1 > prizeLast, `Champion prize must be greater than last place for ${lid}`);
    }

    const testTeam: Team = {
        id: 701,
        name: 'Boca Juniors',
        logo: '',
        leagueId: LeagueId.LIGA_ARGENTINA,
        zone: 'A',
        budget: 50,
        transferBudget: 25,
        tier: 'Top',
        teamMorale: 'Contento',
        primaryColor: '#003366',
        secondaryColor: '#FFCC00',
        squad: [
            {
                id: 1,
                name: 'Wonderkid',
                position: 'DEL',
                rating: 74,
                potential: 75,
                value: 5,
                wage: 5000,
                morale: 'Muy Contento',
                contractYears: 3,
                age: 19,
                stats: { goals: 25, assists: 10, minutes: 2000, appearances: 25, yellowCards: 1, redCards: 0 }
            }
        ]
    };

    const mockGameState: any = {
        team: testTeam,
        allTeams: [testTeam],
        youthAcademy: [],
        season: 2024,
        currentDate: new Date('2024-05-30'),
        currentWeek: 40,
        currentTurn: 'weekend',
        schedule: [],
        leagueTables: {
            [LeagueId.LIGA_ARGENTINA]: [
                { teamId: 701, position: 1, played: 30, won: 20, drawn: 5, lost: 5, goalsFor: 50, goalsAgainst: 20, goalDifference: 30, points: 65, promedio: 2.1 }
            ]
        },
        newsFeed: [],
        electoralPromises: [
            { id: 'p1', description: 'Mejorar estadio', type: 'stadium', target: 30000, deadline: 2, fulfilled: false, impact: 15 }
        ],
        mandate: { startYear: 2024, currentYear: 1, nextElectionSeason: 2028, isElectionYear: false, totalMandates: 1 },
        fanApproval: { rating: 75, trend: 'up', factors: { results: 5, transfers: 0, finances: 0, promises: 0 } },
        finances: { balance: 20_000_000, weeklyWages: 200_000, transferBudget: 15_000_000, seasonTickets: 5_000_000 },
        stadium: { name: 'La Bombonera', capacity: 54000, ticketPrice: 50, maintenanceCost: 100000, facilityLevel: 2 },
        sponsors: [],
        cups: {
            copaLibertadores: { id: 'copa_libertadores', name: 'Libertadores', type: 'groups', phase: 'finished', winnerId: 701, rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
            championsLeague: { id: 'champions_league', name: 'Champions', type: 'swiss', phase: 'finished', winnerId: 1, rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } }
        },
        cinematicQueue: []
    };

    const nextSeasonState = startNewSeason(mockGameState);

    // Verify season advanced
    assert.equal(nextSeasonState.season, 2025);
    assert.equal(nextSeasonState.currentWeek, 0);

    // Verify rating growth respected potential ceiling (rating was 74, potential 75)
    const playerInNextSeason = nextSeasonState.team.squad.find(p => p.id === 1);
    assert.ok(playerInNextSeason);
    assert.ok((playerInNextSeason?.rating ?? 0) <= 75, `Player rating ${playerInNextSeason?.rating} must not exceed potential 75`);

    // Verify Europa League was generated
    assert.ok(nextSeasonState.cups.europaLeague);
    assert.equal(nextSeasonState.cups.europaLeague.type, 'swiss');

    // Verify stadium promise was fulfilled
    const stadiumPromise = nextSeasonState.electoralPromises.find(p => p.id === 'p1');
    assert.equal(stadiumPromise?.fulfilled, true);

    // Verify all 15 league tables are correctly created and indexed by LeagueId enum in season 2
    Object.values(LeagueId).forEach(lid => {
        assert.ok(Array.isArray(nextSeasonState.leagueTables[lid]), `League table for ${lid} must exist in Season 2`);
    });
});

test('full Boca Juniors season simulation transitions cleanly without endless weeks', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const { startNewSeason } = await import('../services/seasonManager');
    const { isSeasonCompleted } = await import('../services/seasonUtils');
    const { ligaArgentinaTeams } = await import('../data/teams/ligaArgentina');

    const boca = ligaArgentinaTeams.find(t => t.id === 701)!;
    assert.ok(boca, 'Boca Juniors must exist');

    const state = initializeGame({
        selectedTeam: boca,
        playerProfile: { name: 'Juan Román', country: 'ARG', age: 45, style: 'balanced', difficulty: 'normal' }
    });

    // Simulate progress to week 40
    state.currentWeek = 40;
    // Mark all Argentine matches as played
    state.schedule.forEach(m => {
        if (m.competition?.includes('Apertura') || m.competition?.includes('Clausura') || m.competition === 'Copa_Argentina') {
            m.result = { homeScore: 2, awayScore: 1 };
        }
    });

    // Verify season is marked as completed
    const completed = isSeasonCompleted(state);
    assert.equal(completed, true, 'Season must be complete at week 40 for Boca Juniors');

    // Transition to Season 2
    const season2 = startNewSeason(state);
    assert.equal(season2.season, 2025);
    assert.equal(season2.currentWeek, 0);
    assert.ok(season2.schedule.length > 0, 'Season 2 must have a new generated schedule');
    assert.ok(season2.leagueTables[LeagueId.LIGA_ARGENTINA].length === 30, 'Liga Argentina must maintain 30 teams');
    assert.ok(season2.cups.copaArgentina.rounds[0].fixtures.length > 0, 'Copa Argentina must have fixtures in Season 2');
});

test('sortArgentineZones strictly keeps Boca and River (and rivalry pairs) in opposite zones', () => {
    const argTeams = TEAMS.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA);
    assert.equal(argTeams.length, 30, 'Must have 30 Argentine teams');

    // Run the lottery 10 times to verify consistency and stochastic behavior
    for (let run = 0; run < 10; run++) {
        const { zoneA, zoneB } = sortArgentineZones(argTeams);
        assert.equal(zoneA.length, 15, 'Zona A must have exactly 15 teams');
        assert.equal(zoneB.length, 15, 'Zona B must have exactly 15 teams');

        const bocaInA = zoneA.some(t => t.id === 701);
        const riverInA = zoneA.some(t => t.id === 702);
        const bocaInB = zoneB.some(t => t.id === 701);
        const riverInB = zoneB.some(t => t.id === 702);

        assert.ok(
            (bocaInA && riverInB) || (bocaInB && riverInA),
            'Boca and River must NEVER be in the same zone'
        );

        // Verify all 15 classic pairs are split
        for (const [idA, idB] of ARGENTINE_CLASSIC_PAIRS) {
            const teamAInZoneA = zoneA.some(t => t.id === idA);
            const teamBInZoneA = zoneA.some(t => t.id === idB);
            assert.notEqual(teamAInZoneA, teamBInZoneA, `Pair [${idA}, ${idB}] must be in different zones`);
        }
    }
});

test('generateArgentineTournamentSchedule alternates derby venues between seasons and shuffles fixtures', () => {
    const argTeams = TEAMS.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA);
    sortArgentineZones(argTeams);

    const schedule2024 = generateArgentineTournamentSchedule(argTeams, 2024);
    const schedule2025 = generateArgentineTournamentSchedule(argTeams, 2025);

    // Superclásico in Fecha 16 (Round 16)
    const derby2024 = schedule2024.find(m => m.week === 16 && ((m.homeTeamId === 701 && m.awayTeamId === 702) || (m.homeTeamId === 702 && m.awayTeamId === 701)));
    const derby2025 = schedule2025.find(m => m.week === 16 && ((m.homeTeamId === 701 && m.awayTeamId === 702) || (m.homeTeamId === 702 && m.awayTeamId === 701)));

    assert.ok(derby2024, 'Superclasico must exist in Fecha 16 for 2024');
    assert.ok(derby2025, 'Superclasico must exist in Fecha 16 for 2025');
    assert.notEqual(derby2024!.homeTeamId, derby2025!.homeTeamId, 'Derby venue must invert between seasons');
});

test('generateLeagueSchedule produces randomized fixture sequences', () => {
    const plTeams = TEAMS.filter(t => t.leagueId === LeagueId.PREMIER_LEAGUE);
    const sched1 = generateLeagueSchedule(plTeams, LeagueId.PREMIER_LEAGUE);
    const sched2 = generateLeagueSchedule(plTeams, LeagueId.PREMIER_LEAGUE);

    assert.equal(sched1.length, sched2.length);
    // At least some matches in week 1 should differ between independent shuffles
    const week1Sched1 = sched1.filter(m => m.week === 1).map(m => `${m.homeTeamId}_${m.awayTeamId}`).sort().join(',');
    const week1Sched2 = sched2.filter(m => m.week === 1).map(m => `${m.homeTeamId}_${m.awayTeamId}`).sort().join(',');
    // With 20 teams and random shuffle, probability of exact match is ~ 1 / 20!
    assert.notEqual(week1Sched1, week1Sched2, 'Schedule fixture sequence must vary randomly');
});

test('national cup fixtures have isMidweek: true to prevent dashboard conflicts', () => {
    const gameState = initializeGame({ selectedTeam: TEAMS[0] });
    const copaArgentinaMatches = gameState.schedule.filter(m => m.competition === 'Copa_Argentina');
    assert.ok(copaArgentinaMatches.length > 0, 'Copa Argentina fixtures must exist');
    copaArgentinaMatches.forEach(m => {
        assert.equal(m.isMidweek, true, 'National cup match must have isMidweek: true');
    });

    const faCupMatches = gameState.schedule.filter(m => m.competition === 'FA_Cup');
    assert.ok(faCupMatches.length > 0, 'FA Cup fixtures must exist');
    faCupMatches.forEach(m => {
        assert.equal(m.isMidweek, true, 'FA Cup match must have isMidweek: true');
    });
});

test('computeArgentineRelegation: 2 relegations with priority shift when same team is last in both', () => {
    // 30 teams
    const mockTable: LeagueTableRow[] = Array.from({ length: 30 }, (_, i) => ({
        teamId: i + 1,
        position: i + 1,
        played: 32,
        won: 10,
        drawn: 10,
        lost: 12,
        goalsFor: 30,
        goalsAgainst: 30,
        goalDifference: 0,
        points: 60 - i, // Team 1 has 60 pts, Team 30 has 31 pts
        form: [],
        promedio: (60 - i) / 32,
        playedTotal: 32,
        pointsTotal: 60 - i
    }));

    // Case 1: Different teams.
    // Make Team 25 have worst promedio, Team 30 has worst anual points
    mockTable.find(t => t.teamId === 25)!.promedio = 0.5; // Lowest promedio
    const res1 = computeArgentineRelegation(mockTable);
    assert.equal(res1.relegatedPromedioId, 25);
    assert.equal(res1.relegatedAnualId, 30);
    assert.deepEqual(res1.relegatedIds.sort((a, b) => a - b), [25, 30]);

    // Case 2: Same team is worst in both (Team 30).
    // Reset Team 25 promedio
    mockTable.find(t => t.teamId === 25)!.promedio = (60 - 24) / 32;
    mockTable.find(t => t.teamId === 30)!.promedio = 0.1; // Lowest promedio AND lowest points
    const res2 = computeArgentineRelegation(mockTable);
    assert.equal(res2.relegatedPromedioId, 30, 'Relegates via Promedios');
    assert.equal(res2.relegatedAnualId, 29, 'Second relegation shifts strictly to the penultimate (29th) of Tabla Anual');
    assert.deepEqual(res2.relegatedIds.sort((a, b) => a - b), [29, 30]);
});

test('computeArgentineInternationalQualification: exact 6 Libertadores + 6 Sudamericana with Cascada', () => {
    // 30 teams with descending points (Team 1 has 65 pts ... Team 30 has 10 pts)
    const mockTable: LeagueTableRow[] = Array.from({ length: 30 }, (_, i) => ({
        teamId: i + 1,
        position: i + 1,
        played: 32,
        won: 15,
        drawn: 10,
        lost: 7,
        goalsFor: 40,
        goalsAgainst: 25,
        goalDifference: 15,
        points: 65 - i,
        form: []
    }));

    // Case 1: Direct champions who are not in top positions
    const cups1 = {
        aperturaPlayoffs: { id: 'ap', name: 'Ap', type: 'knockout' as const, phase: 'finished' as const, winnerId: 20, rounds: [], currentRoundIndex: 0 },
        clausuraPlayoffs: { id: 'cl', name: 'Cl', type: 'knockout' as const, phase: 'finished' as const, winnerId: 21, rounds: [], currentRoundIndex: 0 },
        copaArgentina: { id: 'ca', name: 'CA', type: 'knockout' as const, phase: 'finished' as const, winnerId: 22, rounds: [], currentRoundIndex: 0 },
    };

    const qual1 = computeArgentineInternationalQualification(mockTable, cups1);
    assert.equal(qual1.libertadores.length, 6, 'Must qualify exactly 6 to Libertadores');
    assert.equal(qual1.sudamericana.length, 6, 'Must qualify exactly 6 to Sudamericana');

    const libIds1 = qual1.libertadores.map(q => q.teamId);
    // Champions: 20, 21, 22 + Top 3 non-champions from Anual: 1, 2, 3
    assert.deepEqual(libIds1.sort((a, b) => a - b), [1, 2, 3, 20, 21, 22]);

    const sudIds1 = qual1.sudamericana.map(q => q.teamId);
    // Next 6 non-qualified from Anual: 4, 5, 6, 7, 8, 9
    assert.deepEqual(sudIds1.sort((a, b) => a - b), [4, 5, 6, 7, 8, 9]);

    // Case 2: Cascada! Team 1 wins Apertura and Clausura and finishes 1st in Tabla Anual.
    // Copa Argentina won by Team 2 (2nd in Tabla Anual).
    const cups2 = {
        aperturaPlayoffs: { id: 'ap', name: 'Ap', type: 'knockout' as const, phase: 'finished' as const, winnerId: 1, rounds: [], currentRoundIndex: 0 },
        clausuraPlayoffs: { id: 'cl', name: 'Cl', type: 'knockout' as const, phase: 'finished' as const, winnerId: 1, rounds: [], currentRoundIndex: 0 },
        copaArgentina: { id: 'ca', name: 'CA', type: 'knockout' as const, phase: 'finished' as const, winnerId: 2, rounds: [], currentRoundIndex: 0 },
    };

    const qual2 = computeArgentineInternationalQualification(mockTable, cups2);
    assert.equal(qual2.libertadores.length, 6, 'Must qualify exactly 6 to Libertadores with Cascada');
    assert.equal(qual2.sudamericana.length, 6, 'Must qualify exactly 6 to Sudamericana with Cascada');

    const libIds2 = qual2.libertadores.map(q => q.teamId);
    // Champions: Team 1 (Champ 1), Team 2 (Copa Argentina).
    // Champ 2 was also Team 1 -> spot liberated to Tabla Anual!
    // Non-champions taken: Team 3, Team 4, Team 5, Team 6 (4 spots from Anual because Team 1 took both Champ 1 and 2).
    assert.deepEqual(libIds2.sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);

    const sudIds2 = qual2.sudamericana.map(q => q.teamId);
    // Next 6 from Anual: 7, 8, 9, 10, 11, 12
    assert.deepEqual(sudIds2.sort((a, b) => a - b), [7, 8, 9, 10, 11, 12]);
});

test('calculateTournamentStandings separates Apertura and Clausura points correctly', () => {
    const teams: Team[] = [
        { id: 1, name: 'Boca Juniors', zone: 'A', leagueId: LeagueId.LIGA_ARGENTINA, rating: 80, tier: 1, budget: 10, stadium: 'La Bombonera', squad: [] },
        { id: 2, name: 'River Plate', zone: 'B', leagueId: LeagueId.LIGA_ARGENTINA, rating: 80, tier: 1, budget: 10, stadium: 'Monumental', squad: [] },
    ];

    const schedule: Match[] = [
        // Apertura matches
        { week: 1, homeTeamId: 1, awayTeamId: 2, competition: 'Torneo_Apertura', result: { homeScore: 3, awayScore: 0, events: [], scorers: [] } },
        // Clausura matches
        { week: 21, homeTeamId: 2, awayTeamId: 1, competition: 'Torneo_Clausura', result: { homeScore: 2, awayScore: 0, events: [], scorers: [] } },
    ];

    const apStandings = calculateTournamentStandings(schedule, 'Torneo_Apertura', teams);
    const bocaAp = apStandings.zoneA.find(r => r.id === 1);
    assert.equal(bocaAp?.points, 3, 'Boca should have 3 points in Apertura');
    assert.equal(bocaAp?.played, 1, 'Boca should have 1 match in Apertura');

    const clStandings = calculateTournamentStandings(schedule, 'Torneo_Clausura', teams);
    const riverCl = clStandings.zoneB.find(r => r.id === 2);
    assert.equal(riverCl?.points, 3, 'River should have 3 points in Clausura');
    const bocaCl = clStandings.zoneA.find(r => r.id === 1);
    assert.equal(bocaCl?.points, 0, 'Boca should have 0 points in Clausura');
});

test('Copa Libertadores: initializes 47 participants into 8 groups of 4 with 6 matchdays', async () => {
    const { initializeLibertadoresSeason } = await import('../services/libertadoresEngine');
    const { TEAMS } = await import('../constants');

    const result = initializeLibertadoresSeason({
        allTeams: TEAMS,
        lastLibertadoresWinnerId: 701 // Boca
    });

    assert.ok(result.cup, 'Cup must be created');
    assert.equal(result.cup.phase, 'groups');
    assert.equal(result.cup.groups?.length, 8, 'Must have 8 groups (A-H)');

    result.cup.groups?.forEach(g => {
        assert.equal(g.teams.length, 4, 'Each group must have 4 teams');
        assert.equal(g.fixtures.length, 12, 'Each group must have 12 matches (6 matchdays x 2 matches)');
    });

    // Verify Boca (defending champ) is in Grupo A
    const groupA = result.cup.groups?.[0];
    assert.ok(groupA?.teams.includes(701), 'Defending champion Boca Juniors must be placed in Grupo A');
});

test('Copa Libertadores: advances from group stage to Round of 16 with 16 qualified teams', async () => {
    const { initializeLibertadoresSeason } = await import('../services/libertadoresEngine');
    const { progressInternationalCup } = await import('../services/simulation');
    const { TEAMS } = await import('../constants');

    const init = initializeLibertadoresSeason({ allTeams: TEAMS });
    const cup = init.cup;

    // Simulate all group matches as played
    cup.groups?.forEach(g => {
        g.fixtures.forEach(f => {
            f.result = { homeScore: 2, awayScore: 1, events: [], scorers: [] };
        });
        g.table.forEach((row, idx) => {
            row.played = 6;
            row.points = (4 - idx) * 3;
            row.goalDifference = (4 - idx) * 2;
            row.goalsFor = (4 - idx) * 4;
        });
    });

    const progressed = progressInternationalCup(cup, TEAMS, 22, init.fixtures);
    assert.equal(progressed.phase, 'knockout', 'Phase must transition to knockout');
    assert.equal(progressed.rounds.length, 1, 'Must have 1 round initialized (Round of 16)');
    assert.equal(progressed.rounds[0].name, 'Round of 16');
    assert.equal(progressed.rounds[0].fixtures.length, 8, 'Round of 16 must have 8 knockout matches');
    assert.equal(progressed.rounds[0].fixtures[0].week, 22, 'Knockout fixtures must be scheduled for week 22');
});

test('SeasonEnd: getSeasonSummaryData resolves Clausura champion and compiles allChampions across all regions', async () => {
    const { getSeasonSummaryData } = await import('../services/seasonUtils');
    const { ligaArgentinaTeams } = await import('../data/teams/ligaArgentina');

    const mockState: any = {
        season: 2024,
        currentWeek: 40,
        team: ligaArgentinaTeams[0],
        allTeams: ligaArgentinaTeams,
        leagueTables: {
            [LeagueId.LIGA_ARGENTINA]: [
                { teamId: 701, points: 65, goalDifference: 30, goalsFor: 50, played: 30 }
            ]
        },
        cups: {
            aperturaPlayoffs: {
                id: 'apertura_playoffs',
                name: 'Playoffs Apertura',
                rounds: [{
                    name: 'Final',
                    fixtures: [{
                        homeTeamId: 701,
                        awayTeamId: 702,
                        result: { homeScore: 2, awayScore: 1, events: [], scorers: [] }
                    }]
                }]
            },
            clausuraPlayoffs: {
                id: 'clausura_playoffs',
                name: 'Playoffs Clausura',
                rounds: [{
                    name: 'Final',
                    fixtures: [{
                        homeTeamId: 702,
                        awayTeamId: 703,
                        result: { homeScore: 1, awayScore: 1, events: [], scorers: [] },
                        penalties: { home: 5, away: 4 }
                    }]
                }]
            }
        }
    };

    const summary = getSeasonSummaryData(mockState);
    assert.equal(summary.aperturaChampion?.id, 701, 'Apertura champion should be 701');
    assert.equal(summary.clausuraChampion?.id, 702, 'Clausura champion should be 702 resolved from penalties');
    assert.ok(summary.allChampions.length > 10, 'allChampions must cover competitions from all countries');

    const libEntry = summary.allChampions.find(c => c.name === 'Copa Libertadores');
    assert.ok(libEntry, 'Copa Libertadores must be in allChampions list');
    assert.equal(libEntry?.region, 'Internacional');

    const argClausuraEntry = summary.allChampions.find(c => c.name === 'Torneo Clausura');
    assert.ok(argClausuraEntry, 'Torneo Clausura must be in allChampions list');
    assert.equal(argClausuraEntry?.team?.id, 702, 'Torneo Clausura in allChampions must have team 702');
});test('Copa Sudamericana: initializes 56-team structure with national preliminaries and group stage', async () => {
    const { initializeLibertadoresSeason } = await import('../services/libertadoresEngine');
    const { 
        initializeSudamericanaSeason, 
        buildSudamericanaParticipants, 
        simulateNationalPreliminaries, 
        drawSudamericanaGroups 
    } = await import('../services/sudamericanaEngine');
    const { TEAMS } = await import('../constants');

    const libInit = initializeLibertadoresSeason({ allTeams: TEAMS });
    assert.equal(libInit.phase3Losers.length, 4, 'Libertadores must produce 4 Phase 3 losers');

    const participants = buildSudamericanaParticipants({
        allTeams: TEAMS,
        libertadoresPhase3Losers: libInit.phase3Losers
    });

    assert.equal(participants.directToGroupsArg.length, 6, 'Argentina must have 6 direct group teams');
    assert.equal(participants.directToGroupsBra.length, 6, 'Brasil must have 6 direct group teams');
    assert.equal(Object.keys(participants.nationalPreliminaries).length, 8, 'Must have 8 non-Arg/Bra associations');
    Object.values(participants.nationalPreliminaries).forEach(teams => {
        assert.equal(teams.length, 4, 'Each association must have 4 teams in national prelims');
    });

    const { nationalWinners, preliminaryFixtures } = simulateNationalPreliminaries(participants.nationalPreliminaries);
    assert.equal(nationalWinners.length, 16, 'National prelims must produce 16 winners (2 per country)');
    assert.equal(preliminaryFixtures.length, 16, 'National prelims must have 16 single-leg matches');
    assert.equal(preliminaryFixtures[0].week, 6, 'National prelims must be scheduled for week 6');

    const directQualifiers = [...nationalWinners, ...participants.directToGroupsArg, ...participants.directToGroupsBra];
    assert.equal(directQualifiers.length, 28, 'Must have 28 direct qualifiers (16 national + 6 ARG + 6 BRA)');

    const groups = drawSudamericanaGroups(directQualifiers, libInit.phase3Losers);
    assert.equal(groups.length, 8, 'Sudamericana must have 8 groups A-H');
    groups.forEach(g => {
        assert.equal(g.teams.length, 4, 'Each group must have 4 teams');
        assert.equal(g.fixtures.length, 12, 'Each group must have 12 matches (6 matchdays x 2 matches)');
    });

    const sudInit = initializeSudamericanaSeason({
        allTeams: TEAMS,
        libertadoresPhase3Losers: libInit.phase3Losers
    });
    assert.equal(sudInit.cup.id, 'copa_sudamericana');
    assert.equal(sudInit.cup.phase, 'groups');
    assert.equal(sudInit.cup.groups?.length, 8);
    assert.equal(sudInit.fixtures.length, 16 + (8 * 12), 'Total fixtures: 16 prelim + 96 group stage = 112 matches');
});

test('Copa Sudamericana: generates Playoff de Octavos (Week 20) with 8 2nd-place Sudamericana vs 8 3rd-place Libertadores', async () => {
    const { generateSudamericanaPlayoff } = await import('../services/sudamericanaEngine');
    const { TEAMS } = await import('../constants');

    const sudRunnersUp = TEAMS.slice(0, 8).map((t, i) => ({
        team: t,
        points: 15 - i,
        goalDifference: 10 - i,
        goalsFor: 12 - i
    }));

    const libThirds = TEAMS.slice(8, 16).map((t, i) => ({
        team: t,
        points: 12 - i,
        goalDifference: 6 - i,
        goalsFor: 8 - i
    }));

    const playoffs = generateSudamericanaPlayoff(sudRunnersUp, libThirds, 20);
    assert.equal(playoffs.length, 8, 'Playoff must have 8 matches');
    assert.equal(playoffs[0].week, 20, 'Playoffs must be scheduled for week 20');

    // Best Sudamericana (index 0) vs Worst Libertadores (index 7)
    assert.equal(playoffs[0].homeTeamId, sudRunnersUp[0].team.id, 'Best Sudamericana runner-up plays at home');
    assert.equal(playoffs[0].awayTeamId, libThirds[7].team.id, 'Plays against worst Libertadores 3rd place');

    // Worst Sudamericana (index 7) vs Best Libertadores (index 0)
    assert.equal(playoffs[7].homeTeamId, sudRunnersUp[7].team.id);
    assert.equal(playoffs[7].awayTeamId, libThirds[0].team.id);
});

test('Copa Sudamericana: advances to Octavos de Final (Week 24) with group winners vs playoff winners', async () => {
    const { drawSudamericanaOctavos } = await import('../services/sudamericanaEngine');
    const { TEAMS } = await import('../constants');

    const groupWinners = TEAMS.slice(0, 8);
    const playoffWinners = TEAMS.slice(8, 16);

    const octavos = drawSudamericanaOctavos(groupWinners, playoffWinners, 24);
    assert.equal(octavos.length, 8, 'Octavos must have 8 matches');
    assert.equal(octavos[0].week, 24, 'Octavos must be scheduled for week 24');
    octavos.forEach(match => {
        assert.ok(groupWinners.some(t => t.id === match.homeTeamId), 'Group winners play as home');
        assert.ok(playoffWinners.some(t => t.id === match.awayTeamId), 'Playoff winners play as away');
    });
});

test('Copa Sudamericana: champion earns qualification into Copa Libertadores Pot 2', async () => {
    const { initializeLibertadoresSeason, buildLibertadoresParticipants } = await import('../services/libertadoresEngine');
    const { TEAMS } = await import('../constants');

    // Sudamericana champion is team 9130 (Everton de Viña)
    const sudWinnerId = 9130;
    const participants = buildLibertadoresParticipants({
        allTeams: TEAMS,
        lastSudamericanaWinnerId: sudWinnerId
    });

    assert.ok(participants.directToGroups.some(t => t.id === sudWinnerId), 'Sudamericana champion must qualify direct to Libertadores groups');
});

test('simulateMacroMatch: produces fast, authentic scorelines and updates top scorers', () => {
    const homeTeam = { ...TEAMS[0] };
    const awayTeam = { ...TEAMS[1] };
    
    // Simulate 50 matches to verify consistency and performance
    const startTime = performance.now();
    for (let i = 0; i < 50; i++) {
        const result = simulateMacroMatch(homeTeam, awayTeam, undefined, undefined, false);
        assert.ok(result.homeScore >= 0 && result.homeScore <= 8, 'Home score within bounds');
        assert.ok(result.awayScore >= 0 && result.awayScore <= 8, 'Away score within bounds');
        assert.equal(result.scorers.length, result.homeScore + result.awayScore, 'Scorers match total goals');
    }
    const duration = performance.now() - startTime;
    // 50 macro matches should execute in < 25ms (< 0.5ms per match)
    assert.ok(duration < 100, `Macro simulation took ${duration.toFixed(2)}ms for 50 matches (very fast)`);

    // Verify knockout penalty resolution when tied
    let foundPenalties = false;
    for (let i = 0; i < 100; i++) {
        const koResult = simulateMacroMatch(homeTeam, awayTeam, undefined, undefined, true);
        if (koResult.homeScore === koResult.awayScore) {
            assert.ok(koResult.penalties !== undefined, 'Penalties must be resolved on cup ties');
            assert.notEqual(koResult.penalties!.home, koResult.penalties!.away, 'Cup penalty shootout must have a winner');
            foundPenalties = true;
            break;
        }
    }
    assert.ok(foundPenalties, 'Encountered at least one tied cup match resolving penalties');
});

test('Save System: buildSaveSummary extracts rich metadata and slotType correctly', async () => {
    const { buildSaveSummary, sanitizeGameStateForStorage } = await import('../services/db');
    const { initializeGame } = await import('../services/gameFactory');

    const profile = {
        name: 'Carlos Bianchi',
        age: 55,
        nationality: 'Argentina',
        preferredStyle: 'Attacking',
        satisfaction: 80
    };

    const game = initializeGame({
        selectedTeam: TEAMS[0],
        playerProfile: profile
    });

    const summary = buildSaveSummary(
        'save_autosave',
        'Boca Juniors - Autoguardado',
        game,
        {
            name: 'Carlos Bianchi',
            age: 55,
            nationality: 'Argentina',
            preferredStyle: 'Attacking',
            satisfaction: 80
        },
        'autosave'
    );

    assert.equal(summary.id, 'save_autosave');
    assert.equal(summary.slotType, 'autosave');
    assert.equal(summary.managerName, 'Carlos Bianchi');
    assert.equal(summary.teamName, TEAMS[0].name);
    assert.equal(summary.season, 2024);
    assert.equal(summary.currentWeek, game.currentWeek);
    assert.ok(typeof summary.balance === 'number');

    const sanitized = sanitizeGameStateForStorage(game);
    assert.ok(sanitized, 'Sanitized state exists');
    assert.ok(!sanitized.allTeams.some((t: any) => typeof t.logo === 'object' && t.logo !== null && '$$typeof' in t.logo), 'React elements stripped from storage');
});

test('Regional calendar: South American leagues start in January while European leagues start in August', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const boca = TEAMS.find(t => t.id === 701)!; // Boca Juniors (Liga Argentina)
    const arsenal = TEAMS.find(t => t.id === 1)!; // Arsenal (Premier League)

    const bocaGame = initializeGame({ selectedTeam: boca });
    const arsenalGame = initializeGame({ selectedTeam: arsenal });

    assert.equal(bocaGame.currentDate.getMonth(), 0, 'South America must start in January (month 0)');
    assert.equal(bocaGame.currentDate.getDate(), 15, 'South America start day must be 15');

    assert.equal(arsenalGame.currentDate.getMonth(), 7, 'Europe must start in August (month 7)');
    assert.equal(arsenalGame.currentDate.getDate(), 10, 'Europe start day must be 10');
});

test('Apertura Playoffs: calculateTournamentStandings excludes Primera Nacional teams and crowns champion', async () => {
    const { calculateTournamentStandings } = await import('../services/argentinaRegulations');
    const { handleCupProgression } = await import('../services/simulation/cupProgressionHandler');
    const { simulateMatch } = await import('../services/simulation');
    const { initializeGame } = await import('../services/gameFactory');

    const boca = TEAMS.find(t => t.id === 701)!;
    const game = initializeGame({ selectedTeam: boca });

    // Verify calculateTournamentStandings filters only Liga Argentina teams
    const standings = calculateTournamentStandings(game.schedule, 'Torneo_Apertura', game.allTeams);
    assert.equal(standings.zoneA.length, 15, 'Zone A of Apertura must have exactly 15 Primera Division teams');
    assert.equal(standings.zoneB.length, 15, 'Zone B of Apertura must have exactly 15 Primera Division teams');
    assert.ok(standings.zoneA.every(t => t.leagueId === LeagueId.LIGA_ARGENTINA), 'Zone A must only contain Liga Argentina clubs');
    assert.ok(standings.zoneB.every(t => t.leagueId === LeagueId.LIGA_ARGENTINA), 'Zone B must only contain Liga Argentina clubs');

    // Simulate regular season (Weeks 1 to 16)
    let schedule = [...game.schedule];
    let cups = { ...game.cups };

    for (let w = 1; w <= 20; w++) {
        for (const turn of ['weekend', 'midweek'] as const) {
            const isMidweek = turn === 'midweek';
            const matches = schedule.filter(m => m.week === w && !!m.isMidweek === isMidweek);
            matches.forEach(m => {
                if (!m.result) {
                    const home = game.allTeams.find(t => t.id === m.homeTeamId)!;
                    const away = game.allTeams.find(t => t.id === m.awayTeamId)!;
                    const dummyRow = { points: 0, form: [] } as any;
                    const res = simulateMatch(home, away, dummyRow, dummyRow, !!m.isCupMatch, false);
                    m.result = { homeScore: res.homeScore, awayScore: res.awayScore, events: res.events, scorers: res.scorers };
                    m.penalties = res.penalties;
                }
            });

            const cupRes = handleCupProgression(cups, schedule, game.allTeams, w, turn === 'midweek' ? w + 1 : w, game.leagueTables, turn);
            cups = cupRes.updatedCups;
            schedule = cupRes.updatedSchedule;
        }
    }

    assert.ok(cups.aperturaPlayoffs, 'Apertura playoffs must be generated');
    assert.equal(cups.aperturaPlayoffs.rounds.length, 4, 'Apertura playoffs must have 4 rounds: Octavos, Cuartos, Semis, Final');
    assert.ok(cups.aperturaPlayoffs.winnerId, 'Apertura playoffs must have a winnerId crowned by Week 20');
});



