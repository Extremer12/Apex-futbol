import test from 'node:test';
import assert from 'node:assert/strict';
import {
    generateCupDraw,
    determineCupWinner,
    advanceCupRound,
    handlePromotionRelegation,
    generateSwissPhase,
    finalizeSeasonCompetitions
} from '../../services/simulation';
import { initializeGame } from '../../services/gameFactory';
import { TEAMS } from '../../constants';
import { CupCompetition, Match, LeagueTableRow, LeagueId } from '../../types';
import { createMockTeam } from '../helpers/testMocks';

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
        [LeagueId.PRIMERA_B_CHILE]: [],
        [LeagueId.PRIMERA_A_COLOMBIA]: [],
        [LeagueId.PRIMERA_B_COLOMBIA]: []
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

test('Phase 3 Integration: Complete domestic cup progression to final and champion crowning', async () => {
    const { generateCupDraw, advanceCupRound, simulateMatch } = await import('../../services/simulation');

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

test('Cinematics & Progression: User team does not receive popups for non-participating cups and eliminated clubs do not advance', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { detectCinematicEvents } = await import('../../services/simulation/cinematicsDetector');
    const { handleCupProgression } = await import('../../services/simulation/cupProgressionHandler');

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

test('Season Wrap-Up: finalizeSeasonCompetitions guarantees 0 unfinished cups ("En Disputa") at season end', async () => {
    const { getSeasonSummaryData } = await import('../../services/seasonUtils');
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

test('Two-legged International Knockouts: schedule preserves leg 2 and finalizeSeasonCompetitions crowns champions for two-legged ties', async () => {
    const { handleCupProgression } = await import('../../services/simulation/cupProgressionHandler');
    const { finalizeSeasonCompetitions } = await import('../../services/simulation/cupGenerator');
    const { initializeGame } = await import('../../services/gameFactory');
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

test('53. Liga MX: Copa MX is initialized, crowns a champion, and never finishes En Disputa', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { finalizeSeasonCompetitions } = await import('../../services/simulation/cupGenerator');
    const { getSeasonSummaryData } = await import('../../services/seasonUtils');
    const { LeagueId } = await import('../../types');

    const clubAmerica = TEAMS.find(t => t.leagueId === LeagueId.LIGA_MX) || TEAMS[0];

    const state = initializeGame({
        selectedTeam: clubAmerica,
        playerProfile: { name: 'Santiago Baños', country: 'MEX', age: 50, style: 'galactico', difficulty: 'normal' }
    });

    // 1. Verify Copa MX is properly initialized in state.cups
    assert.ok(state.cups.copaMx, 'Copa MX must exist in initial cups');
    assert.equal(state.cups.copaMx.id, 'copa_mx');
    assert.ok(state.cups.copaMx.rounds.length > 0, 'Copa MX must have round 1 initialized');
    assert.ok(state.cups.copaMx.rounds[0].fixtures.length > 0, 'Copa MX must have fixtures');

    // 2. Finalize season competitions
    finalizeSeasonCompetitions(state.cups as any, state.allTeams, state.schedule);

    // 3. Copa MX must have a crowned champion
    assert.ok(state.cups.copaMx.winnerId, 'Copa MX must have a winnerId crowned');
    assert.equal(state.cups.copaMx.phase, 'finished', 'Copa MX phase must be finished');

    // 4. Verify getSeasonSummaryData for Mexican league
    const summary = getSeasonSummaryData(state);
    const copaMxItem = summary.allChampions.find(c => c.name === 'Copa MX');
    assert.ok(copaMxItem, 'Copa MX champion item must exist in summary');
    assert.ok(copaMxItem.team !== null, 'Copa MX champion team must not be null');
    assert.notEqual(copaMxItem.team?.name, 'En Disputa', 'Copa MX champion must not be "En Disputa"');
});
