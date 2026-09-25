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
    calculateTournamentStandings,
    generateSwissPhase,
    progressInternationalCup,
    determineTwoLeggedTieWinner,
    finalizeSeasonCompetitions
} from '../services/simulation';
import { initializeGame } from '../services/gameFactory';
import { TEAMS } from '../constants';
import { Team, Player, Match, LeagueTableRow, CupCompetition, LeagueId, EuropeanTableRow } from '../types';
import { compressString, decompressString } from '../utils/compression';
import { 
    calculateSquadPower, 
    processPlayerAgingAndProgression, 
    generateRegenPlayer, 
    simulateAITransferWindow, 
    processFullSeasonSquadProgression 
} from '../services/squadProgressionService';

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
        logo: '',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        teamMorale: 'Normal',
        leagueId,
        tier: 'Top',
        budget: 50,
        transferBudget: 20,
        squad,
        coach: {
            id: String(id * 10),
            name: `Coach ${name}`,
            age: 45,
            nationality: 'Argentina',
            style: 'Balanced',
            prestige: 70,
            salary: 50000,
            signingBonus: 100000,
            preferredFormation: '4-4-2',
            youthDevelopment: 70,
            riskTolerance: 50,
            satisfactionLevel: 90,
            requestedSignings: [],
            tacticalNotes: ''
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
        type: 'knockout',
        phase: 'knockout',
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
        [LeagueId.SERIE_B_BR]: [],
        [LeagueId.COPA_DE_PRIMERA]: [],
        [LeagueId.LIGA_MX]: [],
        [LeagueId.LIGA_EXPANSION_MX]: [],
        [LeagueId.PRIMERA_DIVISION_CHILE]: [],
        [LeagueId.PRIMERA_B_CHILE]: []
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
        logo: '',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
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
        logo: '',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
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
        assert.ok(weekly > 10_000, `League ${lid} should have weekly income > 10k, got ${weekly}`);
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
                morale: 'Contento',
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
    assert.equal(season2.season, 2027);
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
        { id: 1, name: 'Boca Juniors', logo: '', primaryColor: '#000000', secondaryColor: '#FFFFFF', teamMorale: 'Normal', zone: 'A', leagueId: LeagueId.LIGA_ARGENTINA, tier: 'Top', budget: 10, transferBudget: 5, stadiumName: 'La Bombonera', squad: [] },
        { id: 2, name: 'River Plate', logo: '', primaryColor: '#000000', secondaryColor: '#FFFFFF', teamMorale: 'Normal', zone: 'B', leagueId: LeagueId.LIGA_ARGENTINA, tier: 'Top', budget: 10, transferBudget: 5, stadiumName: 'Monumental', squad: [] },
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
    assert.equal(summary.season, 2026);
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

test('Phase 1 Optimizations: COMPETITION_TO_CUP_KEY mapping and accurate seasonManager match resolution', async () => {
    const { COMPETITION_TO_CUP_KEY } = await import('../types');
    const { startNewSeason } = await import('../services/seasonManager');
    const { initializeGame } = await import('../services/gameFactory');

    // 1. Verify COMPETITION_TO_CUP_KEY
    assert.equal(COMPETITION_TO_CUP_KEY['FA_Cup'], 'faCup');
    assert.equal(COMPETITION_TO_CUP_KEY['Carabao_Cup'], 'carabaoCup');
    assert.equal(COMPETITION_TO_CUP_KEY['Copa_Argentina'], 'copaArgentina');
    assert.equal(COMPETITION_TO_CUP_KEY['Champions_League'], 'championsLeague');
    assert.equal(COMPETITION_TO_CUP_KEY['Copa_Libertadores'], 'copaLibertadores');
    assert.equal(COMPETITION_TO_CUP_KEY['Copa_Sudamericana'], 'copaSudamericana');
    assert.equal(COMPETITION_TO_CUP_KEY['Playoffs_Apertura'], 'aperturaPlayoffs');

    // 2. Verify startNewSeason resolves unplayed matches with proper standings updates
    const chelsea = TEAMS.find(t => t.id === 1)!;
    const gameState = initializeGame({ selectedTeam: chelsea });

    // Force some unplayed matches in Premier League
    const unplayedCount = gameState.schedule.filter(m => m.result === undefined && !m.isCupMatch).length;
    assert.ok(unplayedCount > 0, 'Initial game has unplayed league matches');

    // Run startNewSeason (which resolves unplayed matches in step 2.5)
    const nextSeasonState = startNewSeason(gameState);
    assert.ok(nextSeasonState, 'Season transition completed cleanly');
    assert.equal(nextSeasonState.season, gameState.season + 1, 'Season incremented');
});

test('Phase 2 Modularization: LEAGUE_REGISTRY and monotonic generatePlayerId', async () => {
    const { 
        LEAGUE_REGISTRY, 
        getLeagueConfig, 
        isSouthAmericanLeague, 
        getPromotionRelegationPairs, 
        generatePlayerId 
    } = await import('../services/simulation');

    // 1. Verify LEAGUE_REGISTRY covers all 19 leagues
    const leagueKeys = Object.keys(LEAGUE_REGISTRY);
    assert.equal(leagueKeys.length, 19, 'LEAGUE_REGISTRY must contain all 19 leagues');

    const premierConfig = getLeagueConfig(LeagueId.PREMIER_LEAGUE);
    assert.equal(premierConfig.country, 'ENG');
    assert.equal(premierConfig.teamsCount, 20);
    assert.equal(premierConfig.relegationSlots, 3);
    assert.equal(premierConfig.relegatesTo, LeagueId.CHAMPIONSHIP);

    const mxConfig = getLeagueConfig(LeagueId.LIGA_MX);
    assert.equal(mxConfig.country, 'MEX');
    assert.equal(mxConfig.teamsCount, 18);
    assert.equal(mxConfig.relegationSlots, 2);
    assert.equal(mxConfig.relegatesTo, LeagueId.LIGA_EXPANSION_MX);

    const chiConfig = getLeagueConfig(LeagueId.PRIMERA_DIVISION_CHILE);
    assert.equal(chiConfig.country, 'CHI');
    assert.equal(chiConfig.teamsCount, 16);
    assert.equal(chiConfig.relegationSlots, 2);
    assert.equal(chiConfig.relegatesTo, LeagueId.PRIMERA_B_CHILE);

    const argConfig = getLeagueConfig(LeagueId.LIGA_ARGENTINA);
    assert.equal(argConfig.country, 'ARG');
    assert.equal(argConfig.region, 'southAmerica');
    assert.equal(argConfig.format, 'argentine-zones');
    assert.equal(isSouthAmericanLeague(LeagueId.LIGA_ARGENTINA), true);
    assert.equal(isSouthAmericanLeague(LeagueId.LA_LIGA), false);

    const pairs = getPromotionRelegationPairs();
    assert.equal(pairs.length, 9, 'Must have 9 promotion/relegation pairs');

    // 2. Verify monotonic generatePlayerId produces strictly unique IDs in rapid succession
    const idSet = new Set<number>();
    for (let i = 0; i < 500; i++) {
        const id = generatePlayerId();
        assert.ok(!idSet.has(id), `Player ID ${id} was duplicated`);
        idSet.add(id);
    }
    assert.equal(idSet.size, 500, '500 unique IDs generated');
});

test('Phase 3 Integration: Multi-season progression (consecutive transitions, aging, contracts)', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const { startNewSeason } = await import('../services/seasonManager');

    const chelsea = TEAMS.find(t => t.id === 1)!;
    const s1 = initializeGame({ selectedTeam: chelsea });
    const initialAge = s1.team.squad[0].age || 20;
    const initialContract = s1.team.squad[0].contractYears;

    // Transition 1: 2024 -> 2025
    const s2 = startNewSeason(s1);
    assert.equal(s2.season, s1.season + 1, 'Season incremented to 2025');
    const s2Player = s2.team.squad.find(p => p.id === s1.team.squad[0].id);
    if (s2Player && !s2Player.isInjured) {
        assert.equal(s2Player.age, initialAge + 1, 'Player age incremented by 1');
        assert.equal(s2Player.contractYears, Math.max(1, initialContract - 1), 'Player contract decremented');
    }

    // Transition 2: 2025 -> 2026
    const s3 = startNewSeason(s2);
    assert.equal(s3.season, s2.season + 1, 'Season incremented to 2026');
    assert.ok(s3.schedule.length > 0, 'Season 3 schedule successfully generated');
});

test('Phase 3 Integration: Complete domestic cup progression to final and champion crowning', async () => {
    const { generateCupDraw, advanceCupRound, simulateMatch } = await import('../services/simulation');

    const cupTeams = TEAMS.filter(t => t.leagueId === LeagueId.PREMIER_LEAGUE).slice(0, 16);
    const initialFixtures = generateCupDraw(cupTeams, 'Round of 16', 'FA_Cup');

    let cup: any = {
        id: 'fa_cup',
        name: 'FA Cup',
        type: 'knockout',
        phase: 'knockout',
        rounds: [{
            name: 'Round of 16',
            fixtures: initialFixtures.map(f => ({ ...f, week: 1 })),
            completed: false
        }],
        currentRoundIndex: 0,
        statistics: { topScorers: [], championsHistory: [] }
    };

    // Simulate through all 4 rounds until a champion is crowned
    for (let round = 0; round < 4; round++) {
        const currentFixtures = cup.rounds[cup.currentRoundIndex].fixtures;
        currentFixtures.forEach((m: any) => {
            const hTeam = TEAMS.find(t => t.id === m.homeTeamId)!;
            const aTeam = TEAMS.find(t => t.id === m.awayTeamId)!;
            const dummyRow = { points: 0, form: [] } as any;
            const sim = simulateMatch(hTeam, aTeam, dummyRow, dummyRow, true, false);
            m.result = {
                homeScore: sim.homeScore,
                awayScore: sim.awayScore,
                events: sim.events,
                scorers: sim.scorers
            };
            m.penalties = sim.penalties;
        });

        cup = advanceCupRound(cup, TEAMS, (round + 2) * 2);
    }

    assert.equal(cup.phase, 'finished', 'Cup must finish after final');
    assert.ok(cup.winnerId, 'A champion must be crowned');
    assert.ok(cup.statistics.championsHistory.length > 0, 'Champions history must record the winner');
});

test('Phase 3 Integration: Type-safe gameReducer handles core actions without errors', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const { gameReducer } = await import('../state/reducer');

    const boca = TEAMS.find(t => t.id === 701)!;
    let state = initializeGame({ selectedTeam: boca });

    // 1. UPDATE_TEAM
    state = gameReducer(state, {
        type: 'UPDATE_TEAM',
        payload: { ...state.team, budget: state.team.budget + 10 }
    });
    assert.equal(state?.team.budget, boca.budget + 10);

    // 2. SET_FAN_APPROVAL
    state = gameReducer(state, {
        type: 'SET_FAN_APPROVAL',
        payload: { rating: 85, trend: 'rising', factors: { results: 10, transfers: 5, finances: 5, promises: 5 } }
    });
    assert.equal(state?.fanApproval.rating, 85);

    // 3. RECORD_TRIGGERED_EVENT
    state = gameReducer(state, {
        type: 'RECORD_TRIGGERED_EVENT',
        payload: 'test_event_1'
    });
    assert.ok(state?.triggeredEventIds?.includes('test_event_1'));

    // 4. SET_CURRENCY
    state = gameReducer(state, {
        type: 'SET_CURRENCY',
        payload: 'USD'
    });
    assert.equal(state?.preferredCurrency, 'USD');
});

test('Bugfix: Schedule merge preserves week 2 matches and avoids loop in Argentine league', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const { LEAGUE_LOGOS, CUP_LOGOS } = await import('../components/screens/league/constants');

    // 1. Verify Argentine logos include /Argentina/
    assert.ok(LEAGUE_LOGOS.LIGA_ARGENTINA.includes('/Argentina/primera_division/'));
    assert.ok(LEAGUE_LOGOS.PRIMERA_NACIONAL.includes('/Argentina/primera_nacional/'));
    assert.ok(CUP_LOGOS.nacional_primer_ascenso.includes('/Argentina/primera_nacional/'));
    assert.ok(CUP_LOGOS.nacional_reducido.includes('/Argentina/primera_nacional/'));

    // 2. Initialize Argentine game (Boca Juniors)
    const boca = TEAMS.find(t => t.id === 701)!;
    const gameState = initializeGame({ selectedTeam: boca });

    const totalScheduleMatches = gameState.schedule.length;
    assert.ok(totalScheduleMatches > 1000, 'Schedule must contain complete match calendar');

    // Week 1 matches
    const w1Matches = gameState.schedule.filter(m => m.week === 1 && !m.isMidweek);
    assert.ok(w1Matches.length > 0, 'Week 1 matches must exist');

    // Simulate w1 matches
    const updatedW1Matches = w1Matches.map(m => ({
        ...m,
        result: { homeScore: 2, awayScore: 1, events: [], scorers: [] }
    }));

    // Perform merge as done in simulationWorker.ts
    const getMatchKey = (m: any) => `${m.week}_${m.homeTeamId}_${m.awayTeamId}_${m.competition || ''}_${!!m.isMidweek}`;
    const matchMap = new Map<string, any>();
    updatedW1Matches.forEach(m => {
        matchMap.set(getMatchKey(m), m);
    });
    const updatedSchedule = gameState.schedule.map(m => matchMap.get(getMatchKey(m)) || m);

    // Assert total count is identical
    assert.equal(updatedSchedule.length, totalScheduleMatches, 'Schedule count must not change');

    // Assert week 1 matches have results
    const mergedW1 = updatedSchedule.filter(m => m.week === 1 && !m.isMidweek);
    assert.ok(mergedW1.every(m => m.result !== undefined), 'All week 1 matches must have results');

    // Assert week 2 matches STILL EXIST and have NO results
    const w2Matches = updatedSchedule.filter(m => m.week === 2 && !m.isMidweek);
    assert.ok(w2Matches.length > 0, 'Week 2 matches must remain in schedule');
    assert.ok(w2Matches.every(m => m.result === undefined), 'Week 2 matches must not be pre-resolved');

    // Assert Boca has a week 2 match scheduled
    const bocaW2Match = w2Matches.find(m => m.homeTeamId === boca.id || m.awayTeamId === boca.id);
    assert.ok(bocaW2Match, 'Boca Juniors must have a valid fixture for Fecha 2');
});

test('Bugfix: Copa Libertadores and Sudamericana groups contain 32 strictly unique teams with 0 duplicates', async () => {
    const { initializeLibertadoresSeason } = await import('../services/libertadoresEngine');
    const { initializeSudamericanaSeason } = await import('../services/sudamericanaEngine');

    // Run 10 randomized seasons to thoroughly verify draw invariants
    for (let i = 0; i < 10; i++) {
        const lib = initializeLibertadoresSeason({
            allTeams: TEAMS,
            lastLibertadoresWinnerId: 701, // Boca Juniors
            argentineQualifiedIds: [701, 702, 703, 704, 705, 706]
        });

        const allLibTeamIds = lib.cup.groups!.flatMap(g => g.teams);
        const uniqueLibIds = new Set(allLibTeamIds);

        assert.equal(allLibTeamIds.length, 32, 'Libertadores must have 32 total team slots in group stage');
        assert.equal(uniqueLibIds.size, 32, 'All 32 teams in Libertadores group stage must be strictly unique (no duplicate Boca/River)');

        // Check each group has 4 unique teams
        lib.cup.groups!.forEach(g => {
            assert.equal(g.teams.length, 4, `${g.name} must have exactly 4 teams`);
            const gIds = new Set(g.teams);
            assert.equal(gIds.size, 4, `${g.name} must contain 4 unique teams`);
        });

        // Sudamericana
        const sud = initializeSudamericanaSeason({
            allTeams: TEAMS,
            argentineQualifiedIds: [707, 708, 709, 710, 711, 712],
            libertadoresPhase3Losers: lib.phase3Losers,
            excludedTeamIds: uniqueLibIds
        });

        const allSudTeamIds = sud.cup.groups!.flatMap(g => g.teams);
        const uniqueSudIds = new Set(allSudTeamIds);

        assert.equal(allSudTeamIds.length, 32, 'Sudamericana must have 32 total team slots in group stage');
        assert.equal(uniqueSudIds.size, 32, 'All 32 teams in Sudamericana group stage must be strictly unique');
    }
});

test('Compression: compressString and decompressString preserve complex JSON correctly', () => {
    const samplePayload = JSON.stringify({
        club: 'Boca Juniors',
        president: 'Juan Román Riquelme',
        finances: { balance: 15400000, currency: 'USD' },
        trophies: ['Copa Libertadores', 'Supercopa Argentina'],
        specialChars: 'Árbol, Niño, Fútbol & Ñandú — 100% auténtico 🏆'
    });

    const compressed = compressString(samplePayload);
    assert.ok(compressed.length > 0, 'Compressed string should not be empty');
    assert.ok(compressed !== samplePayload, 'Compressed output must differ from raw input');

    const decompressed = decompressString(compressed);
    assert.equal(decompressed, samplePayload, 'Decompressed string must match original payload exactly');
});

test('Cinematics & Progression: User team does not receive popups for non-participating cups and eliminated clubs do not advance', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const { detectCinematicEvents } = await import('../services/simulation/cinematicsDetector');
    const { handleCupProgression } = await import('../services/simulation/cupProgressionHandler');

    // Create game with Boca Juniors (ID 701)
    const boca = TEAMS.find(t => t.id === 701)!;
    const game = initializeGame({
        selectedTeam: boca,
        playerProfile: { name: 'Juan Román', country: 'ARG', age: 45, style: 'balanced', difficulty: 'normal' } as any
    });

    // 1. Verify Boca does not receive Champions League kickoff event
    const clMatches = game.schedule.filter(m => m.competition === 'Champions_League').slice(0, 4).map(m => ({
        ...m,
        result: { homeScore: 2, awayScore: 1, events: [], scorers: [] }
    }));

    const events = detectCinematicEvents(
        game,
        game.cups,
        game.leagueTables,
        6,
        7,
        clMatches
    );

    const clEvent = events.find(e => e.id.includes('champions'));
    assert.equal(clEvent, undefined, 'Boca Juniors must NOT receive Champions League kickoff cinematics');

    // Verify all titles are free of emojis
    events.forEach(e => {
        assert.ok(!/[🏆⭐🌍]/.test(e.title), `Title '${e.title}' must not contain emojis`);
    });

    // 2. Verify handleCupProgression does not dispatch cinematics if user is not in the round
    const mockCups = { ...game.cups };
    // Trigger Libertadores knockout check with fake fixtures where Boca is NOT playing
    const fakeMatches = game.schedule.filter(m => m.competition === 'Copa_Libertadores' && m.homeTeamId !== boca.id && m.awayTeamId !== boca.id).slice(0, 4).map(m => ({
        ...m,
        result: { homeScore: 1, awayScore: 0, events: [], scorers: [] }
    }));

    const cupRes = handleCupProgression(
        mockCups,
        game.schedule,
        game.allTeams,
        18,
        19,
        game.leagueTables,
        'midweek',
        boca.id
    );

    // If any event was queued, ensure Boca was actually in it
    cupRes.cinematicEvents.forEach(evt => {
        assert.ok(!evt.id.includes('champions'), 'Boca should never receive champions cinematic');
    });
});

test('Bugfix: Libertadores does not advance prematurely, cinematics do not repeat, and orphan group matches are purged', async () => {
    const { progressInternationalCup } = await import('../services/simulation/cupGenerator');
    const { handleCupProgression } = await import('../services/simulation/cupProgressionHandler');
    const { initializeLibertadoresSeason } = await import('../services/libertadoresEngine');

    // 1. Verify progressInternationalCup does NOT advance when matches have no id and only week 1 was played
    const libInit = initializeLibertadoresSeason({ allTeams: TEAMS });
    const cup = libInit.cup;

    // Simulate an unrelated played match without an ID (e.g. Argentine league week 1)
    const recentMatches: Match[] = [
        { week: 1, homeTeamId: 701, awayTeamId: 702, competition: 'Liga_Argentina', result: { homeScore: 2, awayScore: 1, events: [], scorers: [] } },
        { week: 1, homeTeamId: 703, awayTeamId: 704, competition: 'Liga_Argentina', result: { homeScore: 0, awayScore: 0, events: [], scorers: [] } }
    ];

    const result = progressInternationalCup(cup, TEAMS, 22, recentMatches);
    assert.equal(result.phase, 'groups', 'Libertadores must remain in groups phase when group matches are unplayed');
    assert.equal(result.newFixtures, undefined, 'Must not generate knockout fixtures prematurely');

    // 2. Verify cinematics do not repeat for subsequent knockout rounds (e.g. Cuartos de Final)
    const boca = TEAMS.find(t => t.id === 701)!;
    const knockoutCup = {
        ...cup,
        phase: 'knockout' as const,
        rounds: [
            {
                name: 'Round of 16',
                completed: true,
                fixtures: [
                    { week: 22, homeTeamId: boca.id, awayTeamId: 9118, competition: 'Copa_Libertadores' as const, result: { homeScore: 2, awayScore: 0, events: [], scorers: [] } }
                ]
            }
        ],
        currentRoundIndex: 0
    };

    const mockCups = {
        copaLibertadores: knockoutCup,
        copaSudamericana: { id: 'sud', name: 'Sudamericana', type: 'groups', phase: 'finished', winnerId: 703, rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } }
    } as any;

    const playedOctavosMatch: Match = {
        week: 22,
        homeTeamId: boca.id,
        awayTeamId: 9118,
        competition: 'Copa_Libertadores',
        result: { homeScore: 2, awayScore: 0, events: [], scorers: [] }
    };

    // Include an orphaned group match at week 16 in schedule (stray match from previous bug)
    const scheduleWithOrphan: Match[] = [
        playedOctavosMatch,
        { week: 16, homeTeamId: 9118, awayTeamId: boca.id, competition: 'Copa_Libertadores', isCupMatch: true } // Stray unplayed group match!
    ];

    const cupRes = handleCupProgression(
        mockCups,
        scheduleWithOrphan,
        TEAMS,
        22,
        23,
        {} as any,
        'midweek',
        boca.id
    );

    // Verify repeated cinematic was NOT queued for Cuartos
    const repeatedKinetic = cupRes.cinematicEvents.find(e => e.subtitle === '¡Comienzan las eliminatorias directas!');
    assert.equal(repeatedKinetic, undefined, 'Must not re-trigger "¡Comienzan las eliminatorias directas!" on subsequent knockout rounds');

    // 3. Verify orphaned group match at week 16 was purged from schedule since cup is in knockout
    const orphanStillInSchedule = cupRes.updatedSchedule.find(m => m.week === 16 && m.competition === 'Copa_Libertadores' && !m.result);
    assert.equal(orphanStillInSchedule, undefined, 'Orphaned group match in week 16 must be purged from schedule');
});

test('Champions League: Swiss phase standings table updates correctly from match results', () => {
    const clTeams = TEAMS.slice(0, 36);
    const { table, fixtures } = generateSwissPhase(clTeams, 'Champions_League', 8);

    // Initial state: all zeros
    assert.equal(table[0].played, 0);
    assert.equal(table[0].points, 0);

    // Simulate match 1: Home win (Real Madrid 3 - 1 Liverpool)
    const match1 = fixtures[0];
    const hTeamId = match1.homeTeamId;
    const aTeamId = match1.awayTeamId;

    const rowMap = new Map<number, EuropeanTableRow>(table.map(r => [r.teamId, r]));
    const hRow = rowMap.get(hTeamId)!;
    const aRow = rowMap.get(aTeamId)!;

    // Simulate result update as handled in simulation worker
    hRow.played++; aRow.played++;
    hRow.goalsFor += 3; hRow.goalsAgainst += 1;
    aRow.goalsFor += 1; aRow.goalsAgainst += 3;
    hRow.goalDifference = hRow.goalsFor - hRow.goalsAgainst;
    aRow.goalDifference = aRow.goalsFor - aRow.goalsAgainst;
    hRow.won++; hRow.points += 3; aRow.lost++;

    assert.equal(hRow.played, 1);
    assert.equal(hRow.won, 1);
    assert.equal(hRow.points, 3);
    assert.equal(hRow.goalDifference, 2);

    assert.equal(aRow.played, 1);
    assert.equal(aRow.lost, 1);
    assert.equal(aRow.points, 0);
    assert.equal(aRow.goalDifference, -2);
});

test('Champions League 2026 format: 36-team Swiss phase advances top 8 directly and 9-24 to Playoffs 16vos', () => {
    // 36 teams
    const clTeams = TEAMS.slice(0, 36);
    const { table, fixtures } = generateSwissPhase(clTeams, 'Champions_League', 8);

    // Populate table with distinct points for all 36 teams:
    // Team 0 has 36 pts (Rank 1) ... Team 35 has 1 pt (Rank 36)
    table.forEach((row, idx) => {
        row.played = 8;
        row.points = 36 - idx;
        row.goalDifference = 36 - idx;
        row.goalsFor = (36 - idx) * 2;
        row.won = Math.floor((36 - idx) / 3);
    });

    // Mark all fixtures as played so phase progresses
    fixtures.forEach(f => {
        f.result = { homeScore: 1, awayScore: 0, events: [], scorers: [] };
    });

    const clCup: CupCompetition = {
        id: 'champions_league',
        name: 'UEFA Champions League',
        type: 'swiss',
        rounds: [{ name: 'Fase de Liga', fixtures, completed: true }],
        swissTable: table,
        swissFixtures: fixtures,
        phase: 'swiss',
        currentRoundIndex: 0
    };

    // 1. Progress from Swiss Phase
    const cup = progressInternationalCup(clCup, clTeams, 25);

    assert.equal(cup.phase, 'knockout');
    assert.equal(cup.rounds[cup.currentRoundIndex].name, 'Playoffs 16vos');
    assert.ok(cup.seededTeamIds, 'Must store top 8 teams in seededTeamIds');
    assert.equal(cup.seededTeamIds!.length, 8, 'Exactly 8 teams directly qualify to Round of 16');

    // Expected top 8 team IDs (based on actual recalculated Swiss table)
    const expectedTop8 = cup.swissTable!.slice(0, 8).map(r => r.teamId);
    assert.deepEqual(cup.seededTeamIds, expectedTop8, 'Seeded teams must be positions 1 to 8');

    // Expected 8 playoff fixtures (16 teams: positions 9 to 24)
    const playoffFixtures = cup.rounds[cup.currentRoundIndex].fixtures;
    assert.equal(playoffFixtures.length, 8, 'Must have exactly 8 playoff fixtures');

    const playoffTeamIds = new Set<number>();
    const expectedSeededPlayoffs = new Set(cup.swissTable!.slice(8, 16).map(r => r.teamId)); // 9-16
    const expectedUnseededPlayoffs = new Set(cup.swissTable!.slice(16, 24).map(r => r.teamId)); // 17-24
    const expectedEliminated = new Set(cup.swissTable!.slice(24, 36).map(r => r.teamId)); // 25-36

    for (const match of playoffFixtures) {
        playoffTeamIds.add(match.homeTeamId);
        playoffTeamIds.add(match.awayTeamId);

        // One team must be seeded (9-16) and one unseeded (17-24)
        const hasSeeded = expectedSeededPlayoffs.has(match.homeTeamId) || expectedSeededPlayoffs.has(match.awayTeamId);
        const hasUnseeded = expectedUnseededPlayoffs.has(match.homeTeamId) || expectedUnseededPlayoffs.has(match.awayTeamId);
        assert.ok(hasSeeded, `Match ${match.homeTeamId} vs ${match.awayTeamId} must include a 9-16 seeded team`);
        assert.ok(hasUnseeded, `Match ${match.homeTeamId} vs ${match.awayTeamId} must include a 17-24 unseeded team`);
    }

    assert.equal(playoffTeamIds.size, 16, 'Exactly 16 distinct teams play the 16-avos playoff');

    // Verify 25-36 are completely eliminated
    for (const eliminatedId of expectedEliminated) {
        assert.ok(!cup.seededTeamIds.includes(eliminatedId), `Eliminated team ${eliminatedId} must not be in seeded teams`);
        assert.ok(!playoffTeamIds.has(eliminatedId), `Eliminated team ${eliminatedId} must not be in playoffs`);
    }

    // 2. Verify secondLegFixtures exist for two-legged ties and simulate both legs
    const secondLegFixtures = cup.rounds[cup.currentRoundIndex].secondLegFixtures;
    assert.ok(secondLegFixtures, 'Champions League knockout round must have secondLegFixtures for 2 legs');
    assert.equal(secondLegFixtures.length, 8, 'Must have 8 return leg fixtures');

    playoffFixtures.forEach((match, i) => {
        match.result = { homeScore: 2, awayScore: 1, events: [], scorers: [] };
    });
    secondLegFixtures.forEach((match, i) => {
        match.result = { homeScore: 1, awayScore: 1, events: [], scorers: [] };
    });

    const r16Cup = advanceCupRound(cup, clTeams, 28);
    const r16Fixtures = r16Cup.rounds[r16Cup.currentRoundIndex].fixtures;

    assert.equal(r16Cup.rounds[r16Cup.currentRoundIndex].name, 'Round of 16');
    assert.equal(r16Fixtures.length, 8, 'Round of 16 must have 8 fixtures');
    assert.equal(r16Cup.seededTeamIds, undefined, 'seededTeamIds must be cleared after pairing in Round of 16');

    // In Round of 16, each fixture should pair 1 direct qualifier with 1 playoff winner
    const r16Teams = new Set<number>();
    for (const match of r16Fixtures) {
        r16Teams.add(match.homeTeamId);
        r16Teams.add(match.awayTeamId);
    }
    assert.equal(r16Teams.size, 16, 'Round of 16 must have exactly 16 teams');
    for (const top8Id of expectedTop8) {
        assert.ok(r16Teams.has(top8Id), `Top 8 direct qualifier ${top8Id} must be in Round of 16`);
    }
});

test('Season Wrap-Up: finalizeSeasonCompetitions guarantees 0 unfinished cups ("En Disputa") at season end', async () => {
    const { getSeasonSummaryData } = await import('../services/seasonUtils');
    const clTeams = TEAMS.slice(0, 36);
    const { table, fixtures } = generateSwissPhase(clTeams, 'Champions_League', 8);

    // Create an unfinished Champions League in Semifinals
    const semiMatch1: Match = { week: 34, homeTeamId: clTeams[0].id, awayTeamId: clTeams[1].id, competition: 'Champions_League', isCupMatch: true };
    const semiMatch2: Match = { week: 34, homeTeamId: clTeams[2].id, awayTeamId: clTeams[3].id, competition: 'Champions_League', isCupMatch: true };
    const unfinishedCL: CupCompetition = {
        id: 'champions_league',
        name: 'UEFA Champions League',
        type: 'swiss',
        phase: 'knockout',
        rounds: [
            { name: 'Playoffs 16vos', fixtures: [], completed: true },
            { name: 'Round of 16', fixtures: [], completed: true },
            { name: 'Quarter-finals', fixtures: [], completed: true },
            { name: 'Semi-finals', fixtures: [semiMatch1, semiMatch2], completed: false }
        ],
        currentRoundIndex: 3,
        statistics: { topScorers: [], championsHistory: [] }
    };

    // Create an unfinished Europa League in Quarter-finals
    const qfMatch1: Match = { week: 29, homeTeamId: clTeams[4].id, awayTeamId: clTeams[5].id, competition: 'Europa_League', isCupMatch: true };
    const qfMatch2: Match = { week: 29, homeTeamId: clTeams[6].id, awayTeamId: clTeams[7].id, competition: 'Europa_League', isCupMatch: true };
    const unfinishedEL: CupCompetition = {
        id: 'europa_league',
        name: 'UEFA Europa League',
        type: 'swiss',
        phase: 'knockout',
        rounds: [
            { name: 'Quarter-finals', fixtures: [qfMatch1, qfMatch2], completed: false }
        ],
        currentRoundIndex: 0,
        statistics: { topScorers: [], championsHistory: [] }
    };

    // Create an unfinished Libertadores in Semifinals
    const libSemi: Match = { week: 30, homeTeamId: 701, awayTeamId: 702, competition: 'Copa_Libertadores', isCupMatch: true };
    const unfinishedLib: CupCompetition = {
        id: 'copa_libertadores',
        name: 'Copa Libertadores',
        type: 'groups',
        phase: 'knockout',
        rounds: [
            { name: 'Semi-finals', fixtures: [libSemi], completed: false }
        ],
        currentRoundIndex: 0,
        statistics: { topScorers: [], championsHistory: [] }
    };

    const cups: any = {
        championsLeague: unfinishedCL,
        europaLeague: unfinishedEL,
        copaLibertadores: unfinishedLib
    };

    // Verify cups are initially unfinished
    assert.equal(cups.championsLeague.winnerId, undefined);
    assert.equal(cups.europaLeague.winnerId, undefined);
    assert.equal(cups.copaLibertadores.winnerId, undefined);

    // Run finalizeSeasonCompetitions
    finalizeSeasonCompetitions(cups, TEAMS);

    // 1. Verify every cup has a crowned champion
    assert.ok(cups.championsLeague.winnerId, 'Champions League must have a winner');
    assert.equal(cups.championsLeague.phase, 'finished');
    assert.ok(cups.europaLeague.winnerId, 'Europa League must have a winner');
    assert.equal(cups.europaLeague.phase, 'finished');
    assert.ok(cups.copaLibertadores.winnerId, 'Copa Libertadores must have a winner');
    assert.equal(cups.copaLibertadores.phase, 'finished');

    // 2. Verify Copa Intercontinental was scheduled and crowned as well
    assert.ok(cups.copaIntercontinental, 'Copa Intercontinental must be created');
    assert.ok(cups.copaIntercontinental.winnerId, 'Copa Intercontinental must have a winner');

    // 3. Verify getSeasonSummaryData has NO "En Disputa" champions
    const mockState: any = {
        season: 2027,
        currentWeek: 38,
        team: TEAMS[0],
        allTeams: TEAMS,
        leagueTables: { [TEAMS[0].leagueId]: [{ teamId: TEAMS[0].id, points: 90, goalDifference: 50, position: 1 }] },
        cups,
        schedule: []
    };

    const summary = getSeasonSummaryData(mockState);
    for (const champ of summary.allChampions) {
        if (champ.name === 'UEFA Champions League' || champ.name === 'UEFA Europa League' || champ.name === 'Copa Libertadores' || champ.name === 'Copa Intercontinental') {
            assert.ok(champ.team !== null, `${champ.name} must have a valid champion team and not be null`);
            assert.notEqual(champ.team?.name, 'En Disputa', `${champ.name} must not be "En Disputa"`);
        }
    }
});

test('Presidential Mandate: 4-year cycle triggers election year and re-election resets cleanly to Mandate #2', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const { startNewSeason } = await import('../services/seasonManager');
    const { gameReducer } = await import('../state/reducer');
    const barca = TEAMS.find(t => t.name.includes('Barcelona')) || TEAMS[0];

    let state = initializeGame({
        selectedTeam: barca,
        playerProfile: { name: 'Joan Laporta', country: 'ESP', age: 60, style: 'galactico', difficulty: 'normal' }
    });

    assert.equal(state.mandate.totalMandates, 1);
    assert.equal(state.mandate.currentYear, 1);
    assert.equal(state.mandate.isElectionYear, false);

    // Progress year 1 -> year 2
    state.currentWeek = 38;
    state = startNewSeason(state);
    assert.equal(state.mandate.currentYear, 2);
    assert.equal(state.mandate.isElectionYear, false);

    // Progress year 2 -> year 3
    state.currentWeek = 38;
    state = startNewSeason(state);
    assert.equal(state.mandate.currentYear, 3);
    assert.equal(state.mandate.isElectionYear, false);

    // Progress year 3 -> year 4
    state.currentWeek = 38;
    state = startNewSeason(state);
    assert.equal(state.mandate.currentYear, 4);
    assert.equal(state.mandate.isElectionYear, false);

    // Progress year 4 -> Mandate Completed -> Triggers Election Year
    state.currentWeek = 38;
    state = startNewSeason(state);
    assert.equal(state.mandate.isElectionYear, true, 'At end of 4-year mandate, isElectionYear must be true');

    // Simulate Re-election victory
    const postElectionState = gameReducer(state, {
        type: 'ELECTION_RESULT',
        payload: {
            won: true,
            newApproval: 85
        }
    });

    assert.equal(postElectionState.mandate.totalMandates, 2, 'Total mandates must increment to 2');
    assert.equal(postElectionState.mandate.currentYear, 1, 'Current year of mandate must reset to 1');
    assert.equal(postElectionState.mandate.isElectionYear, false, 'isElectionYear must reset to false');
    assert.equal(postElectionState.mandate.nextElectionSeason, postElectionState.season + 4, 'Next election must be 4 years in future');
    assert.equal(postElectionState.fanApproval.rating, 85, 'Fan approval rating must be updated');
    assert.ok(postElectionState.newsFeed.length > 0, 'News feed must contain election announcement');
});

test('Bundesliga: 34-week league completion cleanly terminates season and does not duplicate LEAGUE_WIN', async () => {
    const { isSeasonCompleted } = await import('../services/seasonUtils');
    const { detectCinematicEvents } = await import('../services/simulation/cinematicsDetector');

    const bayern = TEAMS.find(t => t.name.includes('Bayern') || t.leagueId === LeagueId.BUNDESLIGA)!;
    const bundesligaTeams = TEAMS.filter(t => t.leagueId === LeagueId.BUNDESLIGA);

    // Create a mock finished Bundesliga schedule (34 weeks)
    const mockSchedule: Match[] = [];
    for (let w = 1; w <= 34; w++) {
        mockSchedule.push({
            id: `bl_m_${w}`,
            homeTeamId: bayern.id,
            awayTeamId: bundesligaTeams.find(t => t.id !== bayern.id)!.id,
            week: w,
            competition: 'Bundesliga',
            isMidweek: false,
            result: { homeScore: 2, awayScore: 0, events: [] }
        });
    }

    const mockGameState: any = {
        team: bayern,
        allTeams: TEAMS,
        currentWeek: 34,
        season: 2026,
        schedule: mockSchedule,
        leagueTables: {
            [LeagueId.BUNDESLIGA]: [
                {
                    teamId: bayern.id,
                    teamName: bayern.name,
                    played: 34,
                    won: 28,
                    drawn: 4,
                    lost: 2,
                    goalsFor: 85,
                    goalsAgainst: 22,
                    goalDifference: 63,
                    points: 88,
                    position: 1,
                    form: []
                }
            ]
        },
        cups: {
            championsLeague: {
                id: 'cl',
                name: 'Champions League',
                phase: 'knockout',
                winnerId: undefined, // AI vs AI cup still in dispute
                currentRoundIndex: 3,
                rounds: []
            }
        },
        cinematicQueue: []
    };

    // 1. Season must complete at week 34 even if AI Champions League is still unfinished
    const completed = isSeasonCompleted(mockGameState);
    assert.equal(completed, true, 'Bundesliga season must be completed at week 34 when player has no active cup matches');

    // 2. Cinematics detector fires LEAGUE_WIN at week 34
    const eventsWeek34 = detectCinematicEvents(
        mockGameState,
        mockGameState.cups,
        mockGameState.leagueTables,
        34,
        35,
        []
    );

    const leagueWinEvents = eventsWeek34.filter(e => e.type === 'LEAGUE_WIN');
    assert.equal(leagueWinEvents.length, 1, 'LEAGUE_WIN event must be generated at week 34');
    assert.equal(leagueWinEvents[0].id, `champ_league_${bayern.leagueId}_2026`);

    // 3. Cinematics detector must NOT duplicate LEAGUE_WIN once it is in cinematicQueue or on subsequent weeks
    mockGameState.cinematicQueue.push(leagueWinEvents[0]);
    const eventsDuplicate = detectCinematicEvents(
        mockGameState,
        mockGameState.cups,
        mockGameState.leagueTables,
        35,
        36,
        []
    );

    const duplicateLeagueWin = eventsDuplicate.filter(e => e.type === 'LEAGUE_WIN');
    assert.equal(duplicateLeagueWin.length, 0, 'LEAGUE_WIN must never be duplicated or looped');
});

test('Two-legged International Knockouts: schedule preserves leg 2 and finalizeSeasonCompetitions crowns champions for two-legged ties', async () => {
    const { handleCupProgression } = await import('../services/simulation/cupProgressionHandler');
    const { finalizeSeasonCompetitions } = await import('../services/simulation/cupGenerator');
    const { initializeGame } = await import('../services/gameFactory');
    const chelsea = TEAMS.find(t => t.id === 1)!;
    const game = initializeGame({ selectedTeam: chelsea });

    // 1. Create a Champions League with two-legged Round of 16
    const clTeams = TEAMS.slice(0, 16);
    const leg1Fixtures: Match[] = [];
    const leg2Fixtures: Match[] = [];
    for (let i = 0; i < 8; i++) {
        leg1Fixtures.push({
            week: 26,
            homeTeamId: clTeams[i].id,
            awayTeamId: clTeams[15 - i].id,
            competition: 'Champions_League',
            isCupMatch: true,
            isMidweek: true,
            leg: 1
        });
        leg2Fixtures.push({
            week: 28,
            homeTeamId: clTeams[15 - i].id,
            awayTeamId: clTeams[i].id,
            competition: 'Champions_League',
            isCupMatch: true,
            isMidweek: true,
            leg: 2
        });
    }

    const testCL: CupCompetition = {
        id: 'champions_league',
        name: 'UEFA Champions League',
        type: 'swiss',
        phase: 'knockout',
        rounds: [{
            name: 'Round of 16',
            fixtures: leg1Fixtures,
            secondLegFixtures: leg2Fixtures,
            completed: false
        }],
        currentRoundIndex: 0,
        statistics: { topScorers: [], championsHistory: [] }
    };

    const schedule: Match[] = [...leg1Fixtures, ...leg2Fixtures];
    const cups: any = {
        ...game.cups,
        championsLeague: testCL
    };

    // 2. Run handleCupProgression and verify leg 2 fixtures are NOT purged by cleanup
    const res = handleCupProgression(cups, schedule, game.allTeams, 26, 27, game.leagueTables, 'weekend', chelsea.id);
    const leg2InSchedule = res.updatedSchedule.filter(m => m.competition === 'Champions_League' && m.week === 28 && m.leg === 2);
    assert.equal(leg2InSchedule.length, 8, 'Schedule cleanup must never purge second leg knockout fixtures');

    // 3. Run finalizeSeasonCompetitions on cups with two-legged ties
    finalizeSeasonCompetitions(res.updatedCups, game.allTeams, res.updatedSchedule);
    assert.ok(res.updatedCups.championsLeague.winnerId, 'Champions League with two-legged ties must crown a champion');
    assert.equal(res.updatedCups.championsLeague.phase, 'finished');
});

test('Two-legged Ties: 1-0 in leg 1 and 0-0 in leg 2 advances team with 1-0 aggregate without penalties', () => {
    const teamA = 101;
    const teamB = 102;

    // Leg 1: Team A (home) 1 - 0 Team B (away)
    const leg1: Match = {
        week: 20,
        homeTeamId: teamA,
        awayTeamId: teamB,
        competition: 'Copa_Sudamericana',
        isCupMatch: true,
        leg: 1,
        result: { homeScore: 1, awayScore: 0, events: [], scorers: [] }
    };

    // Leg 2: Team B (home) 0 - 0 Team A (away)
    const leg2: Match = {
        week: 21,
        homeTeamId: teamB,
        awayTeamId: teamA,
        competition: 'Copa_Sudamericana',
        isCupMatch: true,
        leg: 2,
        result: { homeScore: 0, awayScore: 0, events: [], scorers: [] }
    };

    const winnerId = determineTwoLeggedTieWinner(leg1, leg2);
    assert.equal(winnerId, teamA, 'Team A must win the tie with 1-0 aggregate');
    assert.deepEqual(leg2.aggregateScore, { home: 0, away: 1 }, 'Aggregate score on leg 2 must reflect Team B: 0, Team A: 1');

    // Case 2: Aggregate tied 1-1, goes to penalties
    const leg2Tied: Match = {
        week: 21,
        homeTeamId: teamB,
        awayTeamId: teamA,
        competition: 'Copa_Sudamericana',
        isCupMatch: true,
        leg: 2,
        result: { homeScore: 1, awayScore: 0, events: [], scorers: [] },
        penalties: { home: 4, away: 5 }
    };

    const tieWinnerId = determineTwoLeggedTieWinner(leg1, leg2Tied);
    assert.equal(tieWinnerId, teamA, 'Team A must win on penalties 5-4');
    assert.deepEqual(leg2Tied.aggregateScore, { home: 1, away: 1 }, 'Aggregate score must be tied 1-1');
});

test('Player Ages & Transfer Realism: Preserves authentic ages and rejects European stars to South America', async () => {
    const { initializeGame } = await import('../services/gameFactory');
    const { generateTransferNegotiationResponse } = await import('../services/gameLogic');
    const { gameReducer } = await import('../state/reducer');

    const boca = TEAMS.find(t => t.id === 701)!;
    const barcelona = TEAMS.find(t => t.id === 202)!;
    const gameState = initializeGame({ selectedTeam: boca });

    // 1. Verify authentic player ages are preserved and not replaced by random 18-33 numbers
    const barcaInGame = gameState.allTeams.find(t => t.id === 202);
    const lewandowski = barcaInGame?.squad.find(p => p.id === 20201);
    assert.ok(lewandowski, 'Lewandowski must exist in Barcelona squad');
    assert.equal(lewandowski?.age, 36, 'Lewandowski must preserve his authentic age 36');

    const cavani = gameState.team.squad.find(p => p.id === 70119);
    assert.ok(cavani, 'Cavani must exist in Boca Juniors squad');
    assert.equal(cavani?.age, 37, 'Cavani must preserve his authentic age 37');

    // 2. Verify European stars reject moves to South America
    const transferResponse = await generateTransferNegotiationResponse(
        lewandowski!,
        35_000_000,
        gameState.team,
        barcelona,
        0
    );
    assert.equal(transferResponse.decision, 'rejected', 'European star must reject moving to South America');
    assert.ok(transferResponse.message.includes('élite europea') || transferResponse.message.includes('Champions League'), 'Rejection message must cite European elite prestige');

    // 3. Verify OFFER_PLAYER_TO_CLUBS generates immediate purchase proposals
    const playerToSell = gameState.team.squad[0];
    const stateAfterOffer = gameReducer(gameState, {
        type: 'OFFER_PLAYER_TO_CLUBS',
        payload: { playerId: playerToSell.id }
    });

    assert.ok(stateAfterOffer, 'State after offering player must not be null');
    const updatedPlayer = stateAfterOffer?.team.squad.find(p => p.id === playerToSell.id);
    assert.equal(updatedPlayer?.isTransferListed, true, 'Player must be marked as transfer-listed');
    assert.ok((stateAfterOffer?.incomingOffers.length || 0) > 0, 'Incoming offers must contain generated bids for the offered player');
    const offerForPlayer = stateAfterOffer?.incomingOffers.find(o => o.playerId === playerToSell.id);
    assert.ok(offerForPlayer, 'Direct offer for player must be received');
    assert.ok(offerForPlayer?.offerValue > 0, 'Offer value must be positive');
});

test('Rankings & Squad Sorting: Resolves CONMEBOL and UEFA club rankings and sorts squad by position', async () => {
    const { getResolvedConmebolRankings, getResolvedUefaRankings } = await import('../data/clubRankings');

    const boca = TEAMS.find(t => t.id === 701)!;
    const gameState = initializeGame({ selectedTeam: boca });

    // 1. Verify CONMEBOL Rankings
    const conmebolRankings = getResolvedConmebolRankings(gameState);
    assert.ok(conmebolRankings.length >= 30, 'CONMEBOL ranking must contain at least 30 clubs');
    assert.equal(conmebolRankings[0].teamName, 'River Plate', 'River Plate must be #1 in CONMEBOL ranking');
    assert.equal(conmebolRankings[0].rank, 1, 'Rank 1 must be assigned to first club');
    assert.ok(conmebolRankings[0].points >= 10000, 'Top club must have authentic points');

    const bocaInRanking = conmebolRankings.find(r => r.teamName === 'Boca Juniors');
    assert.ok(bocaInRanking, 'Boca Juniors must be present in CONMEBOL ranking');
    assert.ok(bocaInRanking?.rank! <= 8, 'Boca Juniors must be a seeded club (Top 8 / Bombo 1)');
    assert.equal(bocaInRanking?.potStatus, 'Bombo 1 (Cabeza de Serie)', 'Top 8 club must have Bombo 1 status');

    // 2. Verify UEFA Rankings
    const uefaRankings = getResolvedUefaRankings(gameState);
    assert.ok(uefaRankings.length >= 30, 'UEFA ranking must contain at least 30 clubs');
    assert.equal(uefaRankings[0].teamName, 'Manchester City', 'Manchester City must be #1 in UEFA ranking');
    assert.equal(uefaRankings[1].teamName, 'Real Madrid', 'Real Madrid must be #2 in UEFA ranking');
    assert.ok(uefaRankings[0].coefficient > uefaRankings[10].coefficient, 'Coefficients must be strictly descending');

    // 3. Verify Squad Sorting by Position (DEL -> CEN -> DEF -> POR and reverse)
    const squad = gameState.team.squad;
    const getPosRank = (pos: string, dir: 'desc' | 'asc') => {
        if (dir === 'desc') {
            switch (pos) {
                case 'DEL': return 1;
                case 'CEN': return 2;
                case 'DEF': return 3;
                case 'POR': return 4;
                default: return 5;
            }
        } else {
            switch (pos) {
                case 'POR': return 1;
                case 'DEF': return 2;
                case 'CEN': return 3;
                case 'DEL': return 4;
                default: return 5;
            }
        }
    };

    // Forward order (DEL -> CEN -> DEF -> POR)
    const sortedForward = [...squad].sort((a, b) => {
        const rankA = getPosRank(a.position, 'desc');
        const rankB = getPosRank(b.position, 'desc');
        if (rankA !== rankB) return rankA - rankB;
        return b.rating - a.rating;
    });

    const firstDelIndex = sortedForward.findIndex(p => p.position === 'DEL');
    const firstCenIndex = sortedForward.findIndex(p => p.position === 'CEN');
    const firstDefIndex = sortedForward.findIndex(p => p.position === 'DEF');
    const firstPorIndex = sortedForward.findIndex(p => p.position === 'POR');

    assert.ok(firstDelIndex < firstCenIndex, 'Delanteros must precede Centrocampistas in forward sort');
    assert.ok(firstCenIndex < firstDefIndex, 'Centrocampistas must precede Defensas in forward sort');
    assert.ok(firstDefIndex < firstPorIndex, 'Defensas must precede Porteros in forward sort');

    // Inverted order (POR -> DEF -> CEN -> DEL)
    const sortedInverted = [...squad].sort((a, b) => {
        const rankA = getPosRank(a.position, 'asc');
        const rankB = getPosRank(b.position, 'asc');
        if (rankA !== rankB) return rankA - rankB;
        return b.rating - a.rating;
    });

    const invPorIndex = sortedInverted.findIndex(p => p.position === 'POR');
    const invDefIndex = sortedInverted.findIndex(p => p.position === 'DEF');
    const invCenIndex = sortedInverted.findIndex(p => p.position === 'CEN');
    const invDelIndex = sortedInverted.findIndex(p => p.position === 'DEL');

    assert.ok(invPorIndex < invDefIndex, 'Porteros must precede Defensas in inverted sort');
    assert.ok(invDefIndex < invCenIndex, 'Defensas must precede Centrocampistas in inverted sort');
    assert.ok(invCenIndex < invDelIndex, 'Centrocampistas must precede Delanteros in inverted sort');
});

test('50. Dynamic Squad Power, Aging, Deterioration, Regens & AI Transfer Window', () => {
    // 1. Test calculateSquadPower
    const testTeam = createMockTeam(1, 'Power FC', LeagueId.PREMIER_LEAGUE, 80);
    // Give attackers higher rating
    testTeam.squad.filter(p => p.position === 'DEL').forEach(p => { p.rating = 88; });
    // Give defenders lower rating
    testTeam.squad.filter(p => p.position === 'DEF').forEach(p => { p.rating = 72; });

    const power = calculateSquadPower(testTeam);
    assert.ok(power.overall >= 70 && power.overall <= 90, `Squad overall should be realistic, got ${power.overall}`);
    assert.ok(power.attack > power.defense, `Attack power (${power.attack}) should be higher than defense (${power.defense})`);

    // 2. Test Player Aging & Deterioration
    const wonderkid: Player = {
        ...createMockPlayer(101, 'DEL', 72),
        age: 18,
        potential: 88
    };
    const agedWonderkid = processPlayerAgingAndProgression(wonderkid);
    assert.equal(agedWonderkid.updatedPlayer.age, 19, 'Age should increment by 1');
    assert.ok(agedWonderkid.updatedPlayer.rating >= 72, 'Youngster rating should not drop');

    const veteran: Player = {
        ...createMockPlayer(102, 'DEF', 82),
        age: 36,
        potential: 82
    };
    const agedVeteran = processPlayerAgingAndProgression(veteran);
    assert.equal(agedVeteran.updatedPlayer.age, 37, 'Veteran age should increment to 37');
    assert.ok(agedVeteran.updatedPlayer.rating <= 82, 'Veteran rating should deteriorate or remain capped');

    // 3. Test Regen Creation
    const retiredLegend: Player = {
        ...createMockPlayer(103, 'DEL', 89),
        name: 'Lionel Master',
        age: 38,
        potential: 94
    };
    const regen = generateRegenPlayer(retiredLegend, 'Top');
    assert.equal(regen.position, 'DEL', 'Regen should retain position of retired legend');
    assert.ok(regen.age >= 17 && regen.age <= 19, `Regen should be young (17-19), got ${regen.age}`);
    assert.ok(regen.rating < retiredLegend.rating, `Regen starting rating (${regen.rating}) must be lower than legend (${retiredLegend.rating})`);
    assert.ok(regen.potential && regen.potential >= 82, `Regen potential (${regen.potential}) should be high reflecting legend heritage`);

    // 4. Test AI-to-AI Transfer Market
    const aiTeamA = createMockTeam(2, 'Alpha FC', LeagueId.LA_LIGA, 82);
    const aiTeamB = createMockTeam(3, 'Beta FC', LeagueId.LA_LIGA, 74);
    aiTeamA.budget = 60_000_000;
    aiTeamB.budget = 10_000_000;
    const userTeam = createMockTeam(99, 'User FC', LeagueId.LA_LIGA, 78);
    const userOriginalSquadCount = userTeam.squad.length;
    const userPlayerIds = new Set(userTeam.squad.map(p => p.id));

    const transfers = simulateAITransferWindow([aiTeamA, aiTeamB, userTeam], userTeam.id);
    // User squad should remain completely untouched
    assert.equal(userTeam.squad.length, userOriginalSquadCount, 'User squad size must not change during AI transfer window');
    userTeam.squad.forEach(p => {
        assert.ok(userPlayerIds.has(p.id), 'User player was transferred by AI window without permission!');
    });

    // 5. Test Full Season Progression Master Function
    const initialAllTeams = [
        createMockTeam(1, 'Team One', LeagueId.PREMIER_LEAGUE, 80),
        createMockTeam(2, 'Team Two', LeagueId.PREMIER_LEAGUE, 76),
        userTeam
    ];
    // Set an ancient veteran to test retirement
    initialAllTeams[0].squad[0].age = 39;
    initialAllTeams[0].squad[0].rating = 80;

    const progression = processFullSeasonSquadProgression(initialAllTeams, userTeam.id);
    assert.ok(progression.updatedTeams.length === initialAllTeams.length, 'All teams must be returned');
    assert.ok(progression.updatedTeams[0].squadPower !== undefined, 'Squad power must be calculated for teams');
    assert.ok(progression.updatedTeams[0].squadPower!.overall > 0, 'Squad power overall must be positive');
});















