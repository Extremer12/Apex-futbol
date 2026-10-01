import test from 'node:test';
import assert from 'node:assert/strict';
import {
    handlePromotionRelegation,
    sortArgentineZones,
    generateArgentineTournamentSchedule,
    ARGENTINE_CLASSIC_PAIRS,
    computeArgentineRelegation,
    computeArgentineInternationalQualification,
    calculateTournamentStandings
} from '../../services/simulation';
import { initializeGame } from '../../services/gameFactory';
import { TEAMS } from '../../constants';
import { Team, Match, LeagueTableRow, LeagueId } from '../../types';

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

test('full Boca Juniors season simulation transitions cleanly without endless weeks', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { startNewSeason } = await import('../../services/seasonManager');
    const { isSeasonCompleted } = await import('../../services/seasonUtils');
    const { ligaArgentinaTeams } = await import('../../data/teams/ligaArgentina');

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

test('Apertura Playoffs: calculateTournamentStandings excludes Primera Nacional teams and crowns champion', async () => {
    const { calculateTournamentStandings } = await import('../../services/argentinaRegulations');
    const { handleCupProgression } = await import('../../services/simulation/cupProgressionHandler');
    const { simulateMatch } = await import('../../services/simulation');
    const { initializeGame } = await import('../../services/gameFactory');

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

test('Bugfix: Schedule merge preserves week 2 matches and avoids loop in Argentine league', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { LEAGUE_LOGOS, CUP_LOGOS } = await import('../../components/screens/league/constants');

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
