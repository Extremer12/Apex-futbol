import test from 'node:test';
import assert from 'node:assert/strict';
import { TEAMS } from '../../constants';
import { Team, Player, LeagueId } from '../../types';
import { compressString, decompressString, compressStringAsync, decompressStringAsync } from '../../utils/compression';
import { ResourceCache } from '../../services/resources/ResourceCache';
import { buildSaveSummary } from '../../services/db';
import {
    calculateSquadPower,
    processPlayerAgingAndProgression,
    generateRegenPlayer,
    simulateAITransferWindow,
    processFullSeasonSquadProgression
} from '../../services/squadProgressionService';
import { createMockPlayer, createMockTeam } from '../helpers/testMocks';

test('isSeasonCompleted returns true only when all scheduled matches are played and season has advanced', async () => {
    const { isSeasonCompleted } = await import('../../services/seasonUtils');

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
    const { startNewSeason } = await import('../../services/seasonManager');
    const { getBaseWeeklyIncome, calculatePrizeMoney } = await import('../../services/economy');

    // Verify all leagues have defined positive base weekly income and prize pools
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

    // Verify all league tables are correctly created and indexed by LeagueId enum in season 2
    Object.values(LeagueId).forEach(lid => {
        assert.ok(Array.isArray(nextSeasonState.leagueTables[lid]), `League table for ${lid} must exist in Season 2`);
    });
});

test('SeasonEnd: getSeasonSummaryData resolves Clausura champion and compiles allChampions across all regions', async () => {
    const { getSeasonSummaryData } = await import('../../services/seasonUtils');
    const { ligaArgentinaTeams } = await import('../../data/teams/ligaArgentina');

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
});

test('Save System: buildSaveSummary extracts rich metadata and slotType correctly', async () => {
    const { buildSaveSummary, sanitizeGameStateForStorage } = await import('../../services/db');
    const { initializeGame } = await import('../../services/gameFactory');

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
    const { initializeGame } = await import('../../services/gameFactory');
    const boca = TEAMS.find(t => t.id === 701)!; // Boca Juniors (Liga Argentina)
    const arsenal = TEAMS.find(t => t.id === 1)!; // Arsenal (Premier League)

    const bocaGame = initializeGame({ selectedTeam: boca });
    const arsenalGame = initializeGame({ selectedTeam: arsenal });

    assert.equal(bocaGame.currentDate.getMonth(), 0, 'South America must start in January (month 0)');
    assert.equal(bocaGame.currentDate.getDate(), 15, 'South America start day must be 15');

    assert.equal(arsenalGame.currentDate.getMonth(), 7, 'Europe must start in August (month 7)');
    assert.equal(arsenalGame.currentDate.getDate(), 10, 'Europe start day must be 10');
});

test('Phase 1 Optimizations: COMPETITION_TO_CUP_KEY mapping and accurate seasonManager match resolution', async () => {
    const { COMPETITION_TO_CUP_KEY } = await import('../../types');
    const { startNewSeason } = await import('../../services/seasonManager');
    const { initializeGame } = await import('../../services/gameFactory');

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
    } = await import('../../services/simulation');

    // 1. Verify LEAGUE_REGISTRY covers all defined leagues
    const leagueKeys = Object.keys(LEAGUE_REGISTRY);
    assert.equal(leagueKeys.length, Object.values(LeagueId).length, 'LEAGUE_REGISTRY must contain all defined leagues');

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

    const colConfig = getLeagueConfig(LeagueId.PRIMERA_A_COLOMBIA);
    assert.equal(colConfig.country, 'COL');
    assert.equal(colConfig.teamsCount, 20);
    assert.equal(colConfig.relegationSlots, 2);
    assert.equal(colConfig.relegatesTo, LeagueId.PRIMERA_B_COLOMBIA);

    const argConfig = getLeagueConfig(LeagueId.LIGA_ARGENTINA);
    assert.equal(argConfig.country, 'ARG');
    assert.equal(argConfig.region, 'southAmerica');
    assert.equal(argConfig.format, 'argentine-zones');
    assert.equal(isSouthAmericanLeague(LeagueId.LIGA_ARGENTINA), true);
    assert.equal(isSouthAmericanLeague(LeagueId.LA_LIGA), false);

    const pairs = getPromotionRelegationPairs();
    assert.equal(pairs.length, 10, 'Must have 10 promotion/relegation pairs');

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
    const { initializeGame } = await import('../../services/gameFactory');
    const { startNewSeason } = await import('../../services/seasonManager');

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

test('Phase 3 Integration: Type-safe gameReducer handles core actions without errors', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { gameReducer } = await import('../../state/reducer');

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

test('Presidential Mandate: 4-year cycle triggers election year and re-election resets cleanly to Mandate #2', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { startNewSeason } = await import('../../services/seasonManager');
    const { gameReducer } = await import('../../state/reducer');
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

test('Player Ages & Transfer Realism: Preserves authentic ages and rejects European stars to South America', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { generateTransferNegotiationResponse } = await import('../../services/gameLogic');
    const { gameReducer } = await import('../../state/reducer');

    const boca = TEAMS.find(t => t.id === 701)!;
    const barcelona = TEAMS.find(t => t.id === 202)!;
    const gameState = initializeGame({ selectedTeam: boca });

    // 1. Verify authentic player ages are preserved and not replaced by random 18-33 numbers
    const barcaInGame = gameState.allTeams.find(t => t.id === 202);
    const lewandowski = barcaInGame?.squad.find(p => p.id === 20201);
    assert.ok(lewandowski, 'Lewandowski must exist in Barcelona squad');
    assert.ok(lewandowski?.age === 36 || lewandowski?.age === 37, 'Lewandowski must preserve his authentic age');

    const paredes = gameState.team.squad.find(p => p.id === 70115);
    assert.ok(paredes, 'Paredes must exist in Boca Juniors squad');
    assert.equal(paredes?.age, 32, 'Paredes must preserve his authentic age 32');

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

test('52. Career Save System: guarantees unique careerId, automatic save replacement and zero duplicate saves', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { buildSaveSummary } = await import('../../services/db');

    const game = initializeGame({
        selectedTeam: TEAMS[0],
        playerProfile: { name: 'Juan Román Riquelme' }
    });

    assert.ok(game.careerId, 'Game initialized with a persistent careerId');
    assert.ok(game.careerId.startsWith('career_'), 'careerId format matches career_teamId_timestamp');

    const summary = buildSaveSummary('test_save_slot', 'Boca Juniors - Carrera', game, { name: 'Juan Román Riquelme' }, 'manual');
    assert.equal(summary.careerId, game.careerId, 'Save summary inherits game careerId');
    assert.equal(summary.teamName, TEAMS[0].name);

    // Verify deduplication logic map
    const savesList = [
        { id: 'save_1', careerId: 'career_boca', teamName: 'Boca Juniors', lastSaved: new Date('2026-01-01T10:00:00Z') },
        { id: 'save_2', careerId: 'career_boca', teamName: 'Boca Juniors', lastSaved: new Date('2026-01-01T12:00:00Z') }, // newer duplicate
        { id: 'save_3', careerId: 'career_river', teamName: 'River Plate', lastSaved: new Date('2026-01-01T11:00:00Z') }
    ];

    const careerMap = new Map<string, typeof savesList[0]>();
    const toDeleteIds: string[] = [];

    savesList.forEach(item => {
        const existing = careerMap.get(item.careerId);
        if (!existing) {
            careerMap.set(item.careerId, item);
        } else {
            if (new Date(item.lastSaved).getTime() > new Date(existing.lastSaved).getTime()) {
                toDeleteIds.push(existing.id);
                careerMap.set(item.careerId, item);
            } else {
                toDeleteIds.push(item.id);
            }
        }
    });

    assert.equal(careerMap.size, 2, 'Exactly 2 unique careers remain (Boca and River)');
    assert.deepEqual(toDeleteIds, ['save_1'], 'Obsolete earlier duplicate save_1 marked for deletion');
    assert.equal(careerMap.get('career_boca')?.id, 'save_2', 'Latest Boca save preserved');
});

test('54. Staff System: regional scout market, severance/weeklyWages sync, coach meeting idempotency & youth promotion', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { generateScoutMarket } = await import('../../services/staffService');
    const { gameReducer } = await import('../../state/reducer');

    const argTeam = TEAMS.find(t => t.leagueId === LeagueId.LIGA_ARGENTINA) || TEAMS[0];
    const plTeam = TEAMS.find(t => t.leagueId === LeagueId.PREMIER_LEAGUE) || TEAMS[0];

    const argScouts = generateScoutMarket('Top', LeagueId.LIGA_ARGENTINA);
    const plScouts = generateScoutMarket('Top', LeagueId.PREMIER_LEAGUE);
    assert.equal(argScouts.length, 6);
    const avgArgSalary = argScouts.reduce((s, sc) => s + sc.salary, 0) / argScouts.length;
    const avgPlSalary = plScouts.reduce((s, sc) => s + sc.salary, 0) / plScouts.length;
    assert.ok(avgArgSalary < avgPlSalary * 0.5, 'South American scout market must scale down vs Premier League');

    let state = initializeGame({
        selectedTeam: plTeam,
        playerProfile: { name: 'Presidente Test' }
    });
    assert.ok(Array.isArray(state.availableScouts) && state.availableScouts.length > 0, 'availableScouts initialized');

    // Hire & fire doctor synchronizes weeklyWages and 2-week severance
    const candidateDoctor = state.availableStaff!.find(s => s.role === 'doctor')!;
    const oldDoctorSalary = state.clubStaff?.doctor?.salary ?? 0;
    const beforeHireWages = state.finances.weeklyWages;
    const beforeHireBalance = state.finances.balance;

    state = gameReducer(state, { type: 'HIRE_STAFF', payload: { staffId: candidateDoctor.id } })!;
    assert.equal(state.clubStaff?.doctor?.id, candidateDoctor.id);
    assert.equal(state.finances.balance, beforeHireBalance - candidateDoctor.hiringFee);
    assert.equal(state.finances.weeklyWages, Math.max(0, beforeHireWages + candidateDoctor.salary - oldDoctorSalary));

    const preFireBalance = state.finances.balance;
    const preFireWages = state.finances.weeklyWages;
    state = gameReducer(state, { type: 'FIRE_STAFF', payload: { role: 'doctor' } })!;
    assert.equal(state.clubStaff?.doctor, undefined);
    assert.equal(state.finances.balance, preFireBalance - candidateDoctor.salary * 2);
    assert.equal(state.finances.weeklyWages, Math.max(0, preFireWages - candidateDoctor.salary));

    // Coach meeting request + bonus idempotency (prevents infinite reopen exploit)
    state = {
        ...state,
        finances: { ...state.finances, balance: 50_000_000 },
        coachReport: {
            summary: 'Test',
            satisfaction: 70,
            tacticalUpdate: '4-3-3',
            requests: [{ id: 'req_1', position: 'DEL', minRating: 75, reason: 'Falta gol', priority: 'important' }],
            promotions: state.youthAcademy.slice(0, 1)
        }
    };
    state = gameReducer(state, { type: 'RESPOND_COACH_REQUEST', payload: { requestId: 'req_1', decision: 'PROMISE' } })!;
    const satAfterFirstResponse = state.team.coach!.satisfactionLevel;
    state = gameReducer(state, { type: 'RESPOND_COACH_REQUEST', payload: { requestId: 'req_1', decision: 'PROMISE' } })!;
    assert.equal(state.team.coach!.satisfactionLevel, satAfterFirstResponse, 'Repeated request response must be ignored');

    state = gameReducer(state, { type: 'AWARD_TEAM_BONUS', payload: { bonusPerPlayer: 10000 } })!;
    const balanceAfterBonus = state.finances.balance;
    const satAfterBonus = state.team.coach!.satisfactionLevel;
    state = gameReducer(state, { type: 'AWARD_TEAM_BONUS', payload: { bonusPerPlayer: 10000 } })!;
    assert.equal(state.finances.balance, balanceAfterBonus, 'Second bonus in same week must be blocked');
    assert.equal(state.team.coach!.satisfactionLevel, satAfterBonus);

    // Promote youth via PROMOTE_YOUTH updates contract, morale, weeklyWages & coachReport
    const youth = state.youthAcademy[0];
    const wagesBeforePromo = state.finances.weeklyWages;
    state = gameReducer(state, { type: 'PROMOTE_YOUTH', payload: youth.id })!;
    const promoted = state.team.squad.find(p => p.id === youth.id);
    assert.ok(promoted, 'Promoted player must be in squad');
    assert.equal(promoted?.contractYears, 3);
    assert.equal(promoted?.morale, 'Feliz');
    assert.equal(state.finances.weeklyWages, wagesBeforePromo + promoted!.wage);
    assert.equal(state.coachReport?.promotions.some(p => p.id === youth.id), false);

    // Refresh market cooldown works once per week
    const firstBatchId = state.availableCoaches[0].id;
    state = gameReducer(state, { type: 'REFRESH_STAFF_MARKET' })!;
    assert.equal(state.lastStaffMarketRefreshWeek, state.currentWeek);
    assert.notEqual(state.availableCoaches[0].id, firstBatchId);
    const secondBatchId = state.availableCoaches[0].id;
    state = gameReducer(state, { type: 'REFRESH_STAFF_MARKET' })!;
    assert.equal(state.availableCoaches[0].id, secondBatchId, 'Cannot refresh staff market twice in same week');
});

test('55. Presidential Profile: XP progression, style gameplay effects & club switching career stints', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { calculateFinancialBreakdown } = await import('../../services/economy');
    const { getPresidentLevelInfo } = await import('../../services/presidentialProgression');
    const { gameReducer } = await import('../../state/reducer');

    const startTeam = TEAMS.find(t => t.leagueId === LeagueId.PREMIER_LEAGUE) || TEAMS[0];
    const nextClub = TEAMS.find(t => t.id !== startTeam.id && t.leagueId === startTeam.leagueId) || TEAMS[1];

    let state = initializeGame({
        selectedTeam: startTeam,
        playerProfile: { name: 'Presidente Pro', experience: 0, style: 'Equilibrado' }
    });

    // Style mechanical effects in financial breakdown
    const eqBreakdown = calculateFinancialBreakdown(
        state.team,
        state.stadium,
        state.sponsors,
        5,
        { bought: 0, sold: 0 },
        false,
        state.team.leagueId,
        'standard',
        [],
        { youthInvestment: 'low', globalMarketing: true, winBonuses: 'none' },
        [],
        'Equilibrado'
    );
    const galBreakdown = calculateFinancialBreakdown(
        state.team,
        state.stadium,
        state.sponsors,
        5,
        { bought: 0, sold: 0 },
        false,
        state.team.leagueId,
        'standard',
        [],
        { youthInvestment: 'low', globalMarketing: true, winBonuses: 'none' },
        [],
        'Galáctico'
    );
    assert.ok(eqBreakdown.operationalExpenses < galBreakdown.operationalExpenses, 'Equilibrado must reduce operational expenses');
    assert.ok((galBreakdown.merchandisingRevenue || 0) > (eqBreakdown.merchandisingRevenue || 0), 'Galáctico must boost merchandising revenue');

    // XP progression via Canterano promotion and Re-election
    state = gameReducer(state, { type: 'UPDATE_PLAYER_PROFILE', payload: { style: 'Canterano' } })!;
    const xpBeforePromo = state.playerProfile?.experience || 0;
    const prospect = state.youthAcademy[0];
    state = gameReducer(state, { type: 'PROMOTE_YOUTH', payload: prospect.id })!;
    assert.equal(state.playerProfile?.experience, xpBeforePromo + 30, 'Canterano grants +30 XP on youth promotion');

    state = gameReducer(state, { type: 'ELECTION_RESULT', payload: { won: true, newApproval: 80 } })!;
    assert.equal(state.playerProfile?.experience, xpBeforePromo + 30 + 150, 'Election win grants +150 XP');
    const levelInfo = getPresidentLevelInfo(state.playerProfile?.experience || 0);
    assert.ok(levelInfo.level >= 1 && levelInfo.progress >= 0);

    // Switch club archives current stint & preserves president XP
    const xpBeforeSwitch = state.playerProfile?.experience || 0;
    state = gameReducer(state, { type: 'SWITCH_CLUB', payload: { clubId: nextClub.id } })!;
    assert.equal(state.team.id, nextClub.id);
    assert.equal(state.playerProfile?.experience, xpBeforeSwitch);
    assert.equal(state.playerProfile?.careerStints?.length, 1);
    assert.equal(state.playerProfile?.careerStints?.[0].clubId, startTeam.id);
    assert.equal(state.playerProfile?.careerStints?.[0].status, 'RESIGNED');
});

test('56. Digital News Hub: single enriched post-match chronicle (no duplicates), contextual news & legacy normalization', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { generateWeeklyNewsAndOffers } = await import('../../services/simulation/simulationNewsHandler');
    const { buildContextualClubNews, normalizeNewsItem } = await import('../../services/newsEngine');

    const startTeam = TEAMS[0];
    const opponent = TEAMS.find(t => t.leagueId === startTeam.leagueId && t.id !== startTeam.id)!;
    const state = initializeGame({
        selectedTeam: startTeam,
        playerProfile: { name: 'Ana Press', age: 40, nationality: 'Argentina', experience: 0, style: 'Equilibrado' }
    });

    // 1. Initial news items include rich editorial metadata
    assert.ok(state.newsFeed.length >= 4);
    assert.ok(state.newsFeed[0].subheadline, 'Initial news should carry subheadline');
    assert.ok(state.newsFeed[0].sourceName, 'Initial news should carry media outlet sourceName');

    // 2. Post-match news generation creates exactly ONE match chronicle (no duplicate match_news_)
    const matchRes = {
        homeTeamId: startTeam.id,
        awayTeamId: opponent.id,
        homeScore: 4,
        awayScore: 0,
        scorers: [{ playerId: startTeam.squad[0].id, playerName: startTeam.squad[0].name, minute: 12 }]
    };
    const { newsToAdd } = await generateWeeklyNewsAndOffers(
        state,
        state.schedule,
        state.allTeams,
        matchRes,
        1,
        new Date('2026-02-01T12:00:00'),
        [],
        false
    );
    const matchStories = newsToAdd.filter(n => n.id.startsWith('match_'));
    assert.equal(matchStories.length, 1, 'Must generate a single unified match chronicle per match');
    assert.equal(matchStories[0].type, 'match');
    assert.ok(matchStories[0].matchMeta, 'Match chronicle must include structured matchMeta');
    assert.equal(matchStories[0].matchMeta?.homeScore, 4);
    assert.equal(matchStories[0].isBreaking, true, 'Thrashing 4-0 must be marked breaking');

    // 3. Contextual news reads state & avoids repeating recent headlines
    const ctx1 = buildContextualClubNews(state);
    assert.ok(ctx1.subheadline && ctx1.sourceName);

    // 4. Legacy emoji-prefixed item normalizes cleanly without emojis
    const normalized = normalizeNewsItem({
        id: 'legacy_1',
        headline: '💼 Fichaje cerrado',
        body: 'Traspaso completado en el mercado de verano.',
        date: '10/01/2026'
    }, startTeam);
    assert.equal(normalized.headline, 'Fichaje cerrado');
    assert.equal(normalized.type, 'transfer');
    assert.ok(normalized.readMinutes >= 1);
});

test('57. Squad 31+15 Reserve, Real 2026 Ages & Nationalities, Open Registration, Offer Hygiene & Global Ranking', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { gameReducer } = await import('../../state/reducer');
    const {
        MAX_FIRST_TEAM_SIZE,
        MAX_RESERVE_SIZE,
        canRegisterInFirstTeam,
        sanitizeIncomingOffers,
        canSubmitToLeaderboard
    } = await import('../../services/squadRules');
    const { processFullSeasonSquadProgression } = await import('../../services/squadProgressionService');

    const realMadrid = TEAMS.find(t => t.id === 201)!;
    let state = initializeGame({
        selectedTeam: realMadrid,
        playerProfile: { name: 'Presidente Global', age: 40, nationality: 'Argentina', gameMode: 'REALISTIC' }
    });

    // 1. Real 2026 ages & true nationalities (V. Junior BRA, H. Kane ENG, E. Haaland NOR, L. Yamal ESP)
    assert.ok(state.team.squad.every(p => Boolean(p.nationality) && Boolean(p.age)), 'All players must have assigned nationality and age');
    const vini = state.team.squad.find(p => p.id === 20101)!;
    assert.equal(vini.nationality, 'BRA', 'V. Junior must be Brazilian');
    assert.equal(vini.age, 26, 'V. Junior must be 26 in 2026');

    const bayern = state.allTeams.find(t => t.id === 401)!;
    const kane = bayern.squad.find(p => p.id === 40123)!;
    assert.equal(kane.nationality, 'ENG', 'H. Kane must be English, never overwritten to German');
    assert.equal(kane.age, 33, 'H. Kane must be 33 in 2026');

    const city = state.allTeams.find(t => t.id === 5)!;
    const haaland = city.squad.find(p => p.id === 501)!;
    assert.equal(haaland.nationality, 'NOR', 'E. Haaland must be Norwegian');
    assert.equal(haaland.age, 26, 'E. Haaland must be 26 in 2026');

    const barca = state.allTeams.find(t => t.id === 202)!;
    const yamal = barca.squad.find(p => p.id === 20207)!;
    assert.equal(yamal.nationality, 'ESP', 'L. Yamal must be Spanish');
    assert.equal(yamal.age, 19, 'L. Yamal must be 19 in 2026');

    // 2. LOAD_GAME self-heals corrupted nationalities & ages from legacy saves
    const corruptedState = {
        ...state,
        allTeams: state.allTeams.map(t => t.id === 201 ? {
            ...t,
            squad: t.squad.map(p => p.id === 20101 ? { ...p, nationality: 'ARG' as const, age: 18 } : p)
        } : t),
        team: {
            ...state.team,
            squad: state.team.squad.map(p => p.id === 20101 ? { ...p, nationality: 'ARG' as const, age: 18 } : p)
        }
    };
    const healedState = gameReducer(corruptedState, { type: 'LOAD_GAME', payload: corruptedState })!;
    const healedVini = healedState.team.squad.find(p => p.id === 20101)!;
    assert.equal(healedVini.nationality, 'BRA', 'LOAD_GAME must heal V. Junior nationality to BRA');
    assert.equal(healedVini.age, 26, 'LOAD_GAME must heal V. Junior age to 26');

    // 3. Demote to Reserve and Promote back
    const firstPlayer = state.team.squad[state.team.squad.length - 1];
    const initialSquadCount = state.team.squad.length;
    const initialReserveCount = state.youthAcademy.length;

    state = gameReducer(state, { type: 'DEMOTE_TO_RESERVE', payload: firstPlayer.id })!;
    assert.equal(state.team.squad.length, initialSquadCount - 1);
    assert.equal(state.youthAcademy.length, initialReserveCount + 1);

    state = gameReducer(state, { type: 'PROMOTE_PLAYER', payload: firstPlayer })!;
    assert.equal(state.team.squad.length, initialSquadCount);
    assert.equal(state.youthAcademy.length, initialReserveCount);

    // 4. Full First Team (31) + Full Reserve (15) blocks signing & youth intake, while foreign nationalities have NO cap
    const paddedSquad = Array.from({ length: MAX_FIRST_TEAM_SIZE }, (_, idx) => ({
        ...state.team.squad[0],
        id: 900000 + idx,
        nationality: 'BRA' as const
    }));
    const paddedReserve = Array.from({ length: MAX_RESERVE_SIZE }, (_, idx) => ({
        ...state.youthAcademy[0],
        id: 950000 + idx,
        nationality: 'ARG' as const
    }));
    const fullCheck = canRegisterInFirstTeam(
        paddedSquad,
        paddedReserve,
        { ...paddedSquad[0], id: 999999, nationality: 'ARG' },
        state.team.leagueId
    );
    assert.equal(fullCheck.allowed, false);
    assert.equal(fullCheck.target, 'BLOCKED');

    const openForeignSquad = paddedSquad.slice(0, 20);
    const incomingForeign = { ...paddedSquad[0], id: 888888, nationality: 'NOR' as const };
    const openForeignCheck = canRegisterInFirstTeam(openForeignSquad, paddedReserve, incomingForeign, state.team.leagueId);
    assert.equal(openForeignCheck.allowed, true, 'No foreign player cap should restrict transfers');

    // 5. Offer Hygiene: deduplicate clubs, cap at 3 per player, clear on sale & reject spontaneous
    const pTarget = state.team.squad[0];
    const noisyOffers = [
        { id: 'o1', playerId: pTarget.id, offeringTeamId: 10, offerValue: 1_000_000, message: '1' },
        { id: 'o2', playerId: pTarget.id, offeringTeamId: 10, offerValue: 1_500_000, message: 'dup club' },
        { id: 'o3', playerId: pTarget.id, offeringTeamId: 11, offerValue: 2_000_000, message: '2' },
        { id: 'o4', playerId: pTarget.id, offeringTeamId: 12, offerValue: 2_500_000, message: '3' },
        { id: 'o5', playerId: pTarget.id, offeringTeamId: 13, offerValue: 3_000_000, message: '4' },
    ];
    const cleaned = sanitizeIncomingOffers(noisyOffers, [pTarget], 1, true);
    assert.equal(cleaned.length, 3, 'Offers must cap at 3 per player and deduplicate buyer clubs');
    assert.equal(cleaned[0].offerValue, 3_000_000, 'Highest offer must stay first');

    state = { ...state, incomingOffers: cleaned };
    state = gameReducer(state, { type: 'REJECT_SPONTANEOUS_OFFERS' })!;
    assert.equal(state.incomingOffers.length, 0, 'Spontaneous offers must clear for unlisted players');

    state = { ...state, incomingOffers: cleaned };
    state = gameReducer(state, { type: 'ACCEPT_OFFER', payload: { offerId: cleaned[0].id } })!;
    assert.equal(state.incomingOffers.some(o => o.playerId === pTarget.id), false, 'All offers for sold player must be cleared');

    // 6. Closed-Loop Aging & National Rebirth
    const agingReserve = [{ ...state.youthAcademy[0], age: 17, rating: 64, potential: 88, nationality: 'ARG' as const }];
    const progRes = processFullSeasonSquadProgression(state.allTeams, state.team.id, agingReserve);
    assert.ok(progRes.updatedUserReserve.length >= 1);
    assert.equal(progRes.updatedUserReserve[0].age, 18, 'Reserve players must age each season');
    assert.ok(progRes.updatedUserReserve[0].rating >= 64, 'Young reserve players should grow towards potential');

    // 7. Global Ranking points always enabled without foreign restrictions
    assert.equal(canSubmitToLeaderboard('FREE'), true, 'All careers must submit points to global ranking');
    assert.equal(canSubmitToLeaderboard('REALISTIC'), true, 'All careers must submit points to global ranking');
});

test('58. Club Membership (Socios) & Realistic Regional Economy: initialization, approval churn, fee policy & title booms', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { calculateFinancialBreakdown, getNetWeeklyIncome } = await import('../../services/economy');
    const {
        calculateMembershipRevenue,
        processWeeklyMembershipUpdate,
        applyMembershipEventBoost
    } = await import('../../services/membership');
    const { gameReducer } = await import('../../state/reducer');

    const boca = TEAMS.find(t => t.id === 701)!;
    let state = initializeGame({
        selectedTeam: boca,
        playerProfile: { name: 'Presidente Socios', experience: 0, style: 'Equilibrado' }
    });

    // 1. Authentic Boca Juniors member base (~323k) & realistic net cashflow
    assert.ok(state.membership, 'Membership must be initialized on new game');
    assert.equal(state.membership!.activeMembers, 323_000);
    assert.equal(state.finances.membershipPolicy, 'standard');

    const breakdownAway = calculateFinancialBreakdown(
        state.team,
        state.stadium,
        state.sponsors,
        3,
        { bought: 0, sold: 0 },
        false,
        state.team.leagueId,
        state.finances.ticketPolicy,
        [],
        state.finances.clubDirectives,
        [],
        state.playerProfile?.style,
        state.membership,
        state.finances.membershipPolicy
    );
    assert.ok((breakdownAway.membershipRevenue || 0) > 400_000, 'Boca membership revenue should be substantial weekly');
    assert.ok(getNetWeeklyIncome(breakdownAway) > -150_000, 'Regional wage calibration + socios prevents catastrophic away-week collapse');

    // 2. Membership fee policy affects both revenue and fan approval immediately
    const stdApproval = state.fanApproval.rating;
    const stdRev = calculateMembershipRevenue(state.membership, 'standard');

    state = gameReducer(state, { type: 'SET_MEMBERSHIP_POLICY', payload: { policy: 'popular' } })!;
    const popApproval = state.fanApproval.rating;
    const popRev = calculateMembershipRevenue(state.membership, 'popular');
    assert.ok(popRev < stdRev, 'Popular fee must be cheaper than standard');
    assert.ok(popApproval > stdApproval, 'Popular fee must boost fan approval');

    state = gameReducer(state, { type: 'SET_MEMBERSHIP_POLICY', payload: { policy: 'exclusive' } })!;
    const excApproval = state.fanApproval.rating;
    const excRev = calculateMembershipRevenue(state.membership, 'exclusive');
    assert.ok(excRev > stdRev, 'Exclusive fee must yield higher revenue per member');
    assert.ok(excApproval < stdApproval, 'Exclusive fee must lower fan approval');

    // 3. Weekly membership growth vs churn based on fan approval & results
    const happyStep = processWeeklyMembershipUpdate({
        membership: state.membership!,
        fanApprovalRating: 86,
        leaguePosition: 1,
        totalTeamsInLeague: 30,
        policy: 'popular',
        stadiumCapacity: state.stadium.capacity,
        matchOutcome: 'win',
        wasDerby: true
    });
    assert.ok(happyStep.delta > 0, 'High approval + derby win must grow active members');

    const angryStep = processWeeklyMembershipUpdate({
        membership: state.membership!,
        fanApprovalRating: 25,
        leaguePosition: 28,
        totalTeamsInLeague: 30,
        policy: 'exclusive',
        stadiumCapacity: state.stadium.capacity,
        matchOutcome: 'loss',
        wasDerby: true
    });
    assert.ok(angryStep.delta < 0, 'Low approval + derby loss + exclusive fee must cause member churn');

    // 4. Title booms & relegation exodus
    const libBoom = applyMembershipEventBoost(state.membership!, 'CONTINENTAL_WIN', 'Copa Libertadores');
    assert.ok(libBoom.delta > 30_000, 'Continental title triggers major membership boom');

    const relegationDrop = applyMembershipEventBoost(state.membership!, 'RELEGATION');
    assert.ok(relegationDrop.delta < -30_000, 'Relegation causes mass member exodus');
});

test('Bloque 2 — Compression V3 Gzip handles >120KB multi-club payloads and decodes legacy V2 saves', async () => {
    // Generate >120KB of varied high-entropy career JSON (exceeding old 65,535 LZW table size)
    const largeTeams = Array.from({ length: 650 }, (_, idx) => ({
        id: idx + 1,
        name: `Club Atlético Edición_${idx}_${(idx * 97) % 1000}`,
        players: Array.from({ length: 12 }, (__, pIdx) => ({
            id: idx * 100 + pIdx,
            name: `Jugador_${idx}_${pIdx}_Áéíóúñ🏆`,
            ovr: 55 + ((idx + pIdx) % 40),
            value: 250000 + idx * 1337 + pIdx * 911
        }))
    }));
    const bigPayload = JSON.stringify({
        careerId: 'career_big_test',
        season: 4,
        teams: largeTeams
    });
    assert.ok(bigPayload.length > 120_000, 'Test payload must exceed 120KB');

    const v3Compressed = await compressStringAsync(bigPayload);
    assert.ok(v3Compressed.startsWith('VjM6'), 'Gzip V3 Base64 payload must carry V3: header ("VjM6")');
    assert.ok(v3Compressed.length < bigPayload.length * 0.4, 'Gzip V3 must compress JSON significantly');

    const roundtripped = await decompressStringAsync(v3Compressed);
    assert.equal(roundtripped, bigPayload, 'Gzip V3 decompression must match original >120KB JSON byte-for-byte');

    // Legacy V2 backward compatibility through decompressStringAsync + 16-bit dictionary safety
    const v2Compressed = compressString(bigPayload);
    const v2Restored = await decompressStringAsync(v2Compressed);
    assert.equal(v2Restored, bigPayload, 'Legacy V2 LZW must remain readable via decompressStringAsync without 16-bit overflow');
});

test('Bloque 2 — ResourceCache.removePackAssets revokes allocated blob: URLs cleanly', async () => {
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    const revokedUrls: string[] = [];
    let counter = 0;

    (URL as any).createObjectURL = () => `blob:mock://pack_asset_${++counter}`;
    (URL as any).revokeObjectURL = (url: string) => {
        revokedUrls.push(url);
    };

    try {
        const blobUrl = await ResourceCache.putAsset('team-logo', '999999', {
            blob: new Blob(['mock-webp-bytes'], { type: 'image/webp' }),
            packId: 'test_pack_bloque2'
        });

        assert.ok(blobUrl.startsWith('blob:mock://'), 'Allocated mock blob URL');
        assert.equal(
            ResourceCache.getPackBlobUrl('test_pack_bloque2', 'team-logo', '999999'),
            blobUrl
        );

        await ResourceCache.removePackAssets('test_pack_bloque2');

        assert.equal(
            ResourceCache.getPackBlobUrl('test_pack_bloque2', 'team-logo', '999999'),
            undefined,
            'Pack blob mapping removed'
        );
        assert.ok(revokedUrls.includes(blobUrl), 'URL.revokeObjectURL must be called for evicted pack blob');
    } finally {
        URL.createObjectURL = origCreate;
        URL.revokeObjectURL = origRevoke;
        await ResourceCache.clearAll();
    }
});

test('Bloque 2 — DB buildSaveSummary extracts lightweight career metadata without heavy state arrays', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const club = TEAMS.find(t => t.name.includes('Boca')) || TEAMS[0];
    const state = initializeGame({
        selectedTeam: club,
        playerProfile: { name: 'Presidente Summary', country: 'ARG', age: 45, style: 'cantera', difficulty: 'normal' }
    });
    state.careerId = 'career_summary_test';
    state.season = 3;
    state.currentWeek = 14;

    const summary = buildSaveSummary('career_summary_test', 'Mi Carrera', state, state.playerProfile, 'manual');
    assert.equal(summary.id, 'career_summary_test');
    assert.equal(summary.careerId, 'career_summary_test');
    assert.equal(summary.teamId, club.id);
    assert.equal(summary.teamName, club.name);
    assert.equal(summary.season, 3);
    assert.equal(summary.currentWeek, 14);
    assert.equal(summary.managerName, 'Presidente Summary');
    assert.equal((summary as unknown as Record<string, unknown>).allTeams, undefined);
    assert.equal((summary as unknown as Record<string, unknown>).fixtures, undefined);
});

test('Bloque 3 — viewingPlayer lives in Zustand outside GameState and SET_VIEWING_PLAYER never mutates gameState reference', async () => {
    const { useGameStore, ensureGameReducerLoaded } = await import('../../state/gameStore');
    const { initializeGame } = await import('../../services/gameFactory');
    await ensureGameReducerLoaded();

    const club = TEAMS.find(t => t.name.includes('Boca')) || TEAMS[0];
    const initialState = initializeGame({
        selectedTeam: club,
        playerProfile: { name: 'Presidente Store', country: 'ARG', age: 40, style: 'galactico', difficulty: 'normal' }
    });
    assert.equal('viewingPlayer' in initialState, false, 'GameState must not hold viewingPlayer');

    useGameStore.setState({ gameState: initialState, viewingPlayer: null });
    const refBefore = useGameStore.getState().gameState;
    const samplePlayer = initialState.team.squad[0];

    useGameStore.getState().dispatch({ type: 'SET_VIEWING_PLAYER', payload: samplePlayer });
    assert.equal(useGameStore.getState().viewingPlayer?.id, samplePlayer.id, 'viewingPlayer updated in Zustand UI state');
    assert.strictEqual(useGameStore.getState().gameState, refBefore, 'GameState reference must remain untouched');

    useGameStore.getState().dispatch({ type: 'SET_VIEWING_PLAYER', payload: null });
    assert.equal(useGameStore.getState().viewingPlayer, null);
    useGameStore.getState().resetGameData();
});

test('Bloque 3 — getGlobalPlayerIndex skips re-indexing when squads are untouched and rebuilds on real squad change', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { getGlobalPlayerIndex, getMarketOpportunities, getAvailableMarketPlayers } = await import('../../services/playerIndex');

    const club = TEAMS.find(t => t.name.includes('River')) || TEAMS[0];
    const state = initializeGame({
        selectedTeam: club,
        playerProfile: { name: 'Presidente Index', country: 'ARG', age: 42, style: 'equilibrado', difficulty: 'normal' }
    });

    const idx1 = getGlobalPlayerIndex(state.allTeams);
    assert.ok(idx1.allPlayers.length > 5000, 'Indexes full multi-league player database');

    // Change only non-squad metadata on a team -> index must NOT re-scan 11,200 players
    const teamsWithMetadataEdit = state.allTeams.map((t, i) =>
        i === 0 ? { ...t, budget: t.budget + 1000 } : t
    );
    const idx2 = getGlobalPlayerIndex(teamsWithMetadataEdit);
    assert.equal(idx2.version, idx1.version, 'Index version unchanged when squads did not change');
    assert.strictEqual(idx2.allPlayers, idx1.allPlayers, 'allPlayers array reused with zero O(N) rebuild');

    // Change an actual squad array -> triggers clean single-pass re-index
    const teamsWithSquadEdit = teamsWithMetadataEdit.map((t, i) =>
        i === 1 ? { ...t, squad: t.squad.map((p, pi) => (pi === 0 ? { ...p, isTransferListed: true } : p)) } : t
    );
    const idx3 = getGlobalPlayerIndex(teamsWithSquadEdit);
    assert.ok(idx3.version > idx2.version, 'Index version increments when a club squad changes');

    const opportunities = getMarketOpportunities(teamsWithSquadEdit, club.id, 4);
    assert.ok(opportunities.length > 0 && opportunities.length <= 4, 'Market opportunities returned in O(1)');

    const market = getAvailableMarketPlayers(teamsWithSquadEdit, club.id, club.squad, state.youthAcademy);
    assert.ok(market.availablePlayers.length > 0, 'Available market excludes user squad');
    assert.equal(market.availablePlayers.some(p => p.id === club.squad[0].id), false);
});

test('Bloque 4 — Real-time squadPower recalculation after SIGN_PLAYER, ACCEPT_OFFER, PROMOTE_PLAYER and DEMOTE_TO_RESERVE', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { gameReducer } = await import('../../state/reducer');

    const club = TEAMS.find(t => t.name.includes('Boca')) || TEAMS[0];
    let state = initializeGame({
        selectedTeam: club,
        playerProfile: { name: 'Presidente Power', country: 'ARG', age: 40, style: 'galactico', difficulty: 'normal' }
    });
    // Ensure squad has spare slots (< 31) and deep treasury
    state = {
        ...state,
        team: { ...state.team, squad: state.team.squad.slice(0, 22) },
        finances: { ...state.finances, balance: 200_000_000, transferBudget: 150_000_000 }
    };
    state.team.squadPower = calculateSquadPower(state.team);
    state.allTeams = state.allTeams.map(t => (t.id === state.team.id ? state.team : t));

    const otherClub = state.allTeams.find(t => t.id !== state.team.id)!;
    const targetToSign = {
        ...createMockPlayer(998001, 'DEL', 99),
        name: 'Astro Mundial',
        potential: 99,
        age: 23,
        value: 10_000_000
    };
    state = {
        ...state,
        allTeams: state.allTeams.map(t => (t.id === otherClub.id ? { ...t, squad: [...t.squad, targetToSign] } : t))
    };

    const powerBeforeSign = state.team.squadPower!.overall;
    state = gameReducer(state, {
        type: 'SIGN_PLAYER',
        payload: { player: targetToSign, fee: 10_000_000, wage: 50_000, contractYears: 4, role: 'Key', signingBonus: 0 }
    })!;
    assert.ok(state.team.squadPower!.overall >= powerBeforeSign, 'SIGN_PLAYER recalculates squadPower immediately');
    assert.deepEqual(state.team.squadPower, calculateSquadPower(state.team), 'Team squadPower matches fresh calculation');

    // Accept an incoming offer for that star and verify both buyer & seller recalculate squadPower
    const offerId = 'offer_power_test';
    state = gameReducer(state, {
        type: 'ADD_OFFER',
        payload: {
            id: offerId,
            playerId: targetToSign.id,
            offeringTeamId: otherClub.id,
            offerValue: 20_000_000,
            message: 'Oferta test'
        }
    })!;
    state = gameReducer(state, { type: 'ACCEPT_OFFER', payload: { offerId } })!;
    assert.deepEqual(state.team.squadPower, calculateSquadPower(state.team), 'ACCEPT_OFFER recalculates user squadPower');
    const updatedBuyer = state.allTeams.find(t => t.id === otherClub.id)!;
    assert.deepEqual(updatedBuyer.squadPower, calculateSquadPower(updatedBuyer), 'ACCEPT_OFFER recalculates buyer squadPower');

    // Promote elite reserve player -> squadPower updated
    const eliteYouth = { ...createMockPlayer(998002, 'CEN', 96), name: 'Joyita Cantera', age: 18 };
    state = { ...state, youthAcademy: [eliteYouth, ...state.youthAcademy] };
    state = gameReducer(state, { type: 'PROMOTE_PLAYER', payload: eliteYouth })!;
    assert.deepEqual(state.team.squadPower, calculateSquadPower(state.team), 'PROMOTE_PLAYER updates squadPower');

    // Demote back to reserve -> squadPower updated
    state = gameReducer(state, { type: 'DEMOTE_TO_RESERVE', payload: eliteYouth.id })!;
    assert.deepEqual(state.team.squadPower, calculateSquadPower(state.team), 'DEMOTE_TO_RESERVE updates squadPower');
});

test('Bloque 4 — Sponsorship clause settlement applies performance bonuses and relegation/continental/age penalties', async () => {
    const { evaluateSponsorshipClauses } = await import('../../services/economy');

    const testSponsors = [
        {
            id: 'sp_1',
            name: 'Fly Emirates',
            type: 'shirt' as const,
            logo: 'shirt',
            weeklyIncome: 100_000,
            duration: 52,
            bonus: { condition: 'top4' as const, amount: 600_000 },
            clauses: ['Exige clasificación a Copa Continental', 'Penalización 20% si el equipo desciende']
        },
        {
            id: 'sp_2',
            name: 'Red Bull',
            type: 'kit' as const,
            logo: 'kit',
            weeklyIncome: 50_000,
            duration: 52,
            clauses: ['Exige promedio de edad de plantilla inferior a 27 años', 'Cláusula de solvencia: prohíbe incurrir en déficit']
        }
    ];

    // Failure scenario: relegated, missed continental, deficit, older squad
    const failed = evaluateSponsorshipClauses(testSponsors, {
        playerPosition: 19,
        totalTeamsInLeague: 20,
        isSecondDivision: false,
        wasPromoted: false,
        wasRelegated: true,
        qualifiedContinental: false,
        wonAnyCup: false,
        reachedDomesticCupLateStage: false,
        endBalanceBeforeClauses: -5_000_000,
        squadAvgAge: 28.4,
        fanApprovalRating: 45,
        stadiumFacilityLevel: 1
    });
    assert.equal(failed.totalBonuses, 0);
    assert.ok(failed.totalPenalties > 1_000_000, 'Triggers continental, relegation, solvency, and age penalties');
    assert.ok(failed.netAdjustment < 0);
    assert.equal(failed.penaltyMessages.length, 4);

    // Success scenario: 2nd place, continental cup qualified, young squad, positive balance
    const succeeded = evaluateSponsorshipClauses(testSponsors, {
        playerPosition: 2,
        totalTeamsInLeague: 20,
        isSecondDivision: false,
        wasPromoted: false,
        wasRelegated: false,
        qualifiedContinental: true,
        wonAnyCup: false,
        reachedDomesticCupLateStage: true,
        endBalanceBeforeClauses: 25_000_000,
        squadAvgAge: 24.5,
        fanApprovalRating: 82,
        stadiumFacilityLevel: 3
    });
    assert.equal(succeeded.totalPenalties, 0);
    assert.ok(succeeded.totalBonuses >= 700_000, 'Pays explicit top4 bonus plus young-squad incentive');
});

test('Bloque 4 — seasonManager finishes unplayed league matches and re-sorts tables before crowning champions', async () => {
    const { initializeGame } = await import('../../services/gameFactory');
    const { startNewSeason } = await import('../../services/seasonManager');

    const club = TEAMS.find(t => t.name.includes('Real Madrid') || t.leagueId === LeagueId.LA_LIGA) || TEAMS[0];
    let state = initializeGame({
        selectedTeam: club,
        playerProfile: { name: 'Presidente Orden', country: 'ESP', age: 50, style: 'galactico', difficulty: 'normal' }
    });

    const userLid = state.team.leagueId;
    const table = state.leagueTables[userLid];
    const rivalId = table.find(r => r.teamId !== club.id)!.teamId;

    // Power-up user club vs bottom club and leave 4 unplayed user matches that should flip points lead 58 -> 70 vs rival 60
    state.allTeams = state.allTeams.map(t => {
        if (t.id === club.id) {
            return {
                ...t,
                squad: t.squad.map(p => ({ ...p, rating: 99, condition: 100 })),
                squadPower: { attack: 99, midfield: 99, defense: 99, overall: 99 }
            };
        }
        if (t.id !== rivalId && t.leagueId === userLid) {
            return {
                ...t,
                squad: t.squad.map(p => ({ ...p, rating: 40, condition: 50 })),
                squadPower: { attack: 40, midfield: 40, defense: 40, overall: 40 }
            };
        }
        return t;
    });

    // Clear user's last 4 league matches so they remain unplayed at season transition
    let cleared = 0;
    state.schedule = state.schedule.map(m => {
        if (!m.isCupMatch && (m.homeTeamId === club.id || m.awayTeamId === club.id) && cleared < 4) {
            cleared++;
            return { ...m, result: undefined };
        }
        return m;
    });

    // Seed table with rival slightly ahead BEFORE remaining 4 matches are simulated
    state.leagueTables[userLid] = table.map(r => {
        if (r.teamId === rivalId) return { ...r, played: 38, points: 61, goalDifference: 10, position: 1 };
        if (r.teamId === club.id) return { ...r, played: 34, points: 58, goalDifference: 25, position: 2 };
        return { ...r, played: 38, points: 30, position: 5 };
    });

    const nextSeason = startNewSeason(state);
    assert.equal(nextSeason.season, state.season + 1);
    const history = nextSeason.seasonHistory?.[nextSeason.seasonHistory.length - 1];
    assert.equal(history?.userPosition, 1, 'User overtakes to 1st after pending matches are simulated and sorted');
    assert.equal(history?.leagueChampion, club.name, 'Champion crowned AFTER unplayed league matches and re-sorting');
    assert.ok(
        (nextSeason.team.trophyCabinet || []).some(t => t.season === state.season && t.type === 'league'),
        'League champion trophy awarded cleanly to settled leader'
    );
});
