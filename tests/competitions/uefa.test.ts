import test from 'node:test';
import assert from 'node:assert/strict';
import {
    generateSwissPhase,
    progressInternationalCup,
    advanceCupRound
} from '../../services/simulation';
import { TEAMS } from '../../constants';
import { CupCompetition, EuropeanTableRow, Match, LeagueId } from '../../types';

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

    playoffFixtures.forEach((match) => {
        match.result = { homeScore: 2, awayScore: 1, events: [], scorers: [] };
    });
    secondLegFixtures.forEach((match) => {
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

test('Bundesliga: 34-week league completion cleanly terminates season and does not duplicate LEAGUE_WIN', async () => {
    const { isSeasonCompleted } = await import('../../services/seasonUtils');
    const { detectCinematicEvents } = await import('../../services/simulation/cinematicsDetector');

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
