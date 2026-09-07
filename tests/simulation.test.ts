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
    handlePromotionRelegation
} from '../services/simulation';
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
