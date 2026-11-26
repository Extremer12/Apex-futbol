import test from 'node:test';
import assert from 'node:assert/strict';
import { TEAMS } from '../../constants';
import { LeagueId, Match } from '../../types';
import { initializeGame } from '../../services/gameFactory';
import { startNewSeason } from '../../services/seasonManager';
import { handleCupProgression } from '../../services/simulation/cupProgressionHandler';
import { finalizeSeasonCompetitions } from '../../services/simulation/cupGenerator';
import { selectClubWorldCupParticipants } from '../../services/clubWorldCupEngine';

test('INTERNATIONAL CUPS: Recopa Sudamericana two-legged final and FIFA Club World Cup 32-team lifecycle', () => {
    const boca = TEAMS.find(t => t.id === 701) || TEAMS[0];
    const state = initializeGame({ selectedTeam: boca });

    // 1. Season 1 initializes Recopa Sudamericana (two-legged final)
    const recopa = state.cups.recopaSudamericana;
    assert.ok(recopa, 'Recopa Sudamericana should exist on initial GameState');
    assert.equal(recopa.id, 'recopa_sudamericana');
    assert.equal(recopa.rounds.length, 1);
    assert.equal(recopa.rounds[0].fixtures.length, 1);
    assert.equal(recopa.rounds[0].secondLegFixtures?.length, 1);
    assert.notEqual(recopa.rounds[0].fixtures[0].homeTeamId, recopa.rounds[0].fixtures[0].awayTeamId);

    // 2. Season 1 initializes FIFA Club World Cup with 32 unique teams across 8 groups of 4 (3 matchdays each)
    const cwc = state.cups.clubWorldCup;
    assert.ok(cwc, 'FIFA Club World Cup should exist on initial GameState');
    assert.equal(cwc.id, 'club_world_cup');
    assert.equal(cwc.type, 'groups');
    assert.equal(cwc.phase, 'groups');
    assert.equal(cwc.groups?.length, 8);

    const uniqueParticipants = new Set<number>();
    for (const g of cwc.groups!) {
        assert.equal(g.teams.length, 4);
        assert.equal(g.fixtures.length, 6, 'Each 4-team group must play 6 single round-robin matches');
        g.teams.forEach(id => uniqueParticipants.add(id));
    }
    assert.equal(uniqueParticipants.size, 32, 'Club World Cup must have 32 unique clubs');

    // Verify continental balance (UEFA + CONMEBOL + CONCACAF)
    const selected = selectClubWorldCupParticipants({ allTeams: state.allTeams });
    assert.equal(selected.length, 32);
    const hasLigaMx = selected.some(t => t.leagueId === LeagueId.LIGA_MX);
    const hasMls = selected.some(t => t.leagueId === LeagueId.MLS);
    const hasEuro = selected.some(t => [LeagueId.PREMIER_LEAGUE, LeagueId.LA_LIGA, LeagueId.BUNDESLIGA, LeagueId.SERIE_A, LeagueId.LIGUE_1, LeagueId.PRIMEIRA_LIGA, LeagueId.EREDIVISIE].includes(t.leagueId as LeagueId));
    const hasConmebol = selected.some(t => t.leagueId === LeagueId.BRASILEIRAO || t.leagueId === LeagueId.LIGA_ARGENTINA);
    assert.ok(hasLigaMx && hasMls && hasEuro && hasConmebol, 'Participants must span Europe, South America, Liga MX, and MLS');

    // Verify all 26 playable leagues have generated schedules and tables & UCL includes Portugal/Netherlands
    const playableLeagues = Object.values(LeagueId);
    assert.equal(playableLeagues.length, 26);
    for (const lid of playableLeagues) {
        assert.ok(Array.isArray(state.leagueTables[lid]), `Expected league table for ${lid}`);
    }
    for (const newLid of [LeagueId.PRIMEIRA_LIGA, LeagueId.EREDIVISIE, LeagueId.LIGA_URUGUAYA, LeagueId.LIGA_ECUADOR, LeagueId.MLS]) {
        assert.ok((state.leagueTables[newLid] || []).length >= 12, `Expected at least 12 clubs in ${newLid}`);
    }
    const uclTeamIds = new Set((state.cups.championsLeague.swissTable || []).map(r => r.teamId));
    const uclTeams = state.allTeams.filter(t => uclTeamIds.has(t.id));
    assert.ok(uclTeams.some(t => t.leagueId === LeagueId.PRIMEIRA_LIGA), 'Champions League must include Primeira Liga clubs');
    assert.ok(uclTeams.some(t => t.leagueId === LeagueId.EREDIVISIE), 'Champions League must include Eredivisie clubs');

    // Verify Libertadores pulls from newly promoted playable URU and ECU leagues
    const libIds = new Set<number>();
    state.cups.copaLibertadores.groups?.forEach(g => g.teams.forEach(id => libIds.add(id)));
    const libTeams = state.allTeams.filter(t => libIds.has(t.id));
    assert.ok(libTeams.some(t => t.leagueId === LeagueId.LIGA_URUGUAYA), 'Libertadores must include Liga Uruguaya clubs');
    assert.ok(libTeams.some(t => t.leagueId === LeagueId.LIGA_ECUADOR), 'Libertadores must include Liga Ecuador clubs');

    // 3. Simulate all Club World Cup group fixtures -> progresses cleanly to single-leg Round of 16 -> Quarter -> Semi -> Final
    const schedule = state.schedule.map(m => {
        if (m.competition === 'Club_World_Cup') {
            return { ...m, result: { homeScore: 2, awayScore: 1 } } as Match;
        }
        return m;
    });

    const progOctavos = handleCupProgression(
        state.cups,
        schedule,
        state.allTeams,
        26,
        27,
        state.leagueTables,
        'midweek',
        boca.id
    );
    const cwcKo = progOctavos.updatedCups.clubWorldCup!;
    assert.equal(cwcKo.phase, 'knockout');
    assert.equal(cwcKo.rounds.length, 1);
    assert.equal(cwcKo.rounds[0].name, 'Round of 16');
    assert.equal(cwcKo.rounds[0].fixtures.length, 8);
    assert.equal(cwcKo.rounds[0].secondLegFixtures, undefined, 'FIFA Club World Cup knockouts must be single-leg');

    // 4. Simulate Recopa Leg 1 & Leg 2 and confirm aggregate winner is crowned
    const recopaLeg1 = recopa.rounds[0].fixtures[0];
    const recopaLeg2 = recopa.rounds[0].secondLegFixtures![0];
    const recopaSched = progOctavos.updatedSchedule.map(m => {
        if (m.competition === 'Recopa_Sudamericana' && m.leg === 1) {
            return { ...m, result: { homeScore: 1, awayScore: 0 } };
        }
        if (m.competition === 'Recopa_Sudamericana' && m.leg === 2) {
            return { ...m, result: { homeScore: 0, awayScore: 1 } };
        }
        return m;
    });

    const progRecopa = handleCupProgression(
        progOctavos.updatedCups,
        recopaSched,
        state.allTeams,
        10,
        11,
        state.leagueTables,
        'midweek',
        boca.id
    );
    assert.equal(progRecopa.updatedCups.recopaSudamericana?.winnerId, recopaLeg1.homeTeamId, 'Recopa aggregate 2-0 should crown Leg 1 host');
    assert.equal(progRecopa.updatedCups.recopaSudamericana?.phase, 'finished');

    // 5. Finalize remaining season competitions & transition into Season 2
    finalizeSeasonCompetitions(progRecopa.updatedCups as any, state.allTeams, progRecopa.updatedSchedule);
    assert.ok(progRecopa.updatedCups.clubWorldCup?.winnerId, 'Club World Cup must crown a champion at season finalization');

    const nextSeason = startNewSeason({
        ...state,
        cups: progRecopa.updatedCups,
        schedule: progRecopa.updatedSchedule
    });
    assert.ok(nextSeason.cups.recopaSudamericana?.rounds.length === 1);
    assert.equal(nextSeason.cups.clubWorldCup?.groups?.length, 8);
    assert.equal(nextSeason.cups.clubWorldCup?.statistics?.championsHistory.length, 1);
    assert.equal(nextSeason.cups.recopaSudamericana?.statistics?.championsHistory.length, 1);
});
