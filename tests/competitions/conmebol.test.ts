import test from 'node:test';
import assert from 'node:assert/strict';
import { TEAMS } from '../../constants';
import { Match, LeagueId } from '../../types';

test('Copa Libertadores: initializes 47 participants into 8 groups of 4 with 6 matchdays', async () => {
    const { initializeLibertadoresSeason } = await import('../../services/libertadoresEngine');

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
    const { initializeLibertadoresSeason } = await import('../../services/libertadoresEngine');
    const { progressInternationalCup } = await import('../../services/simulation');

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

test('Copa Sudamericana: initializes 56-team structure with national preliminaries and group stage', async () => {
    const { initializeLibertadoresSeason } = await import('../../services/libertadoresEngine');
    const { 
        initializeSudamericanaSeason, 
        buildSudamericanaParticipants, 
        simulateNationalPreliminaries, 
        drawSudamericanaGroups 
    } = await import('../../services/sudamericanaEngine');

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
    const { generateSudamericanaPlayoff } = await import('../../services/sudamericanaEngine');

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
    const { drawSudamericanaOctavos } = await import('../../services/sudamericanaEngine');

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
    const { buildLibertadoresParticipants } = await import('../../services/libertadoresEngine');

    // Sudamericana champion is team 9130 (Everton de Viña)
    const sudWinnerId = 9130;
    const participants = buildLibertadoresParticipants({
        allTeams: TEAMS,
        lastSudamericanaWinnerId: sudWinnerId
    });

    assert.ok(participants.directToGroups.some(t => t.id === sudWinnerId), 'Sudamericana champion must qualify direct to Libertadores groups');
});

test('Bugfix: Copa Libertadores and Sudamericana groups contain 32 strictly unique teams with 0 duplicates', async () => {
    const { initializeLibertadoresSeason } = await import('../../services/libertadoresEngine');
    const { initializeSudamericanaSeason } = await import('../../services/sudamericanaEngine');

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

test('Bugfix: Libertadores does not advance prematurely, cinematics do not repeat, and orphan group matches are purged', async () => {
    const { progressInternationalCup } = await import('../../services/simulation/cupGenerator');
    const { handleCupProgression } = await import('../../services/simulation/cupProgressionHandler');
    const { initializeLibertadoresSeason } = await import('../../services/libertadoresEngine');

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

test('51. Chilean and Colombian Leagues: CONMEBOL Libertadores/Sudamericana integration and Season-End Champions Summary', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { getSeasonSummaryData } = await import('../../services/seasonUtils');
    const { initializeLibertadoresSeason } = await import('../../services/libertadoresEngine');
    const { initializeSudamericanaSeason, buildSudamericanaParticipants } = await import('../../services/sudamericanaEngine');

    // 1. Verify Colombian and Chilean clubs exist in TEAMS with valid logos
    const colTeams = TEAMS.filter(t => t.leagueId === LeagueId.PRIMERA_A_COLOMBIA);
    const chiTeams = TEAMS.filter(t => t.leagueId === LeagueId.PRIMERA_DIVISION_CHILE);
    assert.equal(colTeams.length, 20, '20 Colombian Primera A teams');
    assert.equal(chiTeams.length, 16, '16 Chilean Primera Division teams');

    colTeams.forEach(t => {
        assert.ok(t.logo && t.logo.length > 10, `Colombian club ${t.name} must have a valid logo URL`);
        assert.ok(t.squad.length >= 11, `Colombian club ${t.name} must have squad >= 11`);
    });

    // 2. Initialize Game with a Colombian Club (e.g. Atlético Nacional)
    const nac = colTeams.find(t => t.name.includes('Nacional')) || colTeams[0];
    const gameState = initializeGame({ selectedTeam: nac });

    assert.equal(gameState.team.leagueId, LeagueId.PRIMERA_A_COLOMBIA);
    assert.ok(gameState.leagueTables[LeagueId.PRIMERA_A_COLOMBIA], 'Colombian league table initialized');
    assert.ok(gameState.leagueTables[LeagueId.PRIMERA_DIVISION_CHILE], 'Chilean league table initialized');

    // 3. Test Season End Summary
    const summary = getSeasonSummaryData(gameState);
    assert.ok(summary.allChampions.some(c => c.region === 'Colombia' && c.name.includes('Primera A')), 'Colombia Primera A in allChampions');
    assert.ok(summary.allChampions.some(c => c.region === 'Colombia' && c.name.includes('Primera B')), 'Colombia Primera B in allChampions');
    assert.ok(summary.allChampions.some(c => c.region === 'Chile' && c.name.includes('Primera División')), 'Chile Primera Division in allChampions');
    assert.ok(summary.allChampions.some(c => c.region === 'Chile' && c.name.includes('Primera B')), 'Chile Primera B in allChampions');

    // 4. Test CONMEBOL Libertadores & Sudamericana inclusion of Chile & Colombia
    const libInit = initializeLibertadoresSeason({
        allTeams: TEAMS,
        lastLibertadoresWinnerId: undefined,
        lastSudamericanaWinnerId: undefined,
        argentineQualifiedIds: []
    });

    const libParticipants = new Set<number>();
    libInit.cup.groups?.forEach(g => g.teams.forEach(id => libParticipants.add(id)));
    libInit.fixtures.forEach(m => { libParticipants.add(m.homeTeamId); libParticipants.add(m.awayTeamId); });

    const colInLib = TEAMS.filter(t => t.leagueId === LeagueId.PRIMERA_A_COLOMBIA && libParticipants.has(t.id));
    const chiInLib = TEAMS.filter(t => t.leagueId === LeagueId.PRIMERA_DIVISION_CHILE && libParticipants.has(t.id));

    assert.ok(colInLib.length >= 2, `At least 2 Colombian clubs in Libertadores (found ${colInLib.length})`);
    assert.ok(chiInLib.length >= 2, `At least 2 Chilean clubs in Libertadores (found ${chiInLib.length})`);

    const sudParticipants = buildSudamericanaParticipants({
        allTeams: TEAMS,
        lastSudamericanaWinnerId: undefined,
        argentineQualifiedIds: [],
        libertadoresPhase3Losers: []
    });

    assert.ok(sudParticipants.nationalPreliminaries['COL'].length === 4, '4 Colombian clubs in Sudamericana preliminary');
    assert.ok(sudParticipants.nationalPreliminaries['CHI'].length === 4, '4 Chilean clubs in Sudamericana preliminary');

    const sudSeason = initializeSudamericanaSeason({
        allTeams: TEAMS,
        lastSudamericanaWinnerId: undefined,
        argentineQualifiedIds: [],
        libertadoresPhase3Losers: []
    });
    assert.ok(sudSeason.cup.groups?.length === 8, '8 groups in Sudamericana');
    assert.ok(sudSeason.fixtures.length > 0, 'Sudamericana fixtures generated');
});
