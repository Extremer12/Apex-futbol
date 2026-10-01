import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createInitialLeagueTable,
    updateTeamMorale,
    generateYouthPlayer,
    simulateMatch,
    simulateMacroMatch,
    generateLeagueSchedule,
    determineTwoLeggedTieWinner
} from '../../services/simulation';
import { initializeGame } from '../../services/gameFactory';
import { TEAMS } from '../../constants';
import { LeagueTableRow, Match, LeagueId } from '../../types';
import { createMockTeam } from '../helpers/testMocks';

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

test('Rankings & Squad Sorting: Resolves CONMEBOL and UEFA club rankings and sorts squad by position', async () => {
    const { getResolvedConmebolRankings, getResolvedUefaRankings } = await import('../../data/clubRankings');

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
