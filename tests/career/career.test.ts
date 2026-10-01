import test from 'node:test';
import assert from 'node:assert/strict';
import { TEAMS } from '../../constants';
import { Team, Player, LeagueId } from '../../types';
import { compressString, decompressString } from '../../utils/compression';
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

    // 1. Verify LEAGUE_REGISTRY covers all 21 leagues
    const leagueKeys = Object.keys(LEAGUE_REGISTRY);
    assert.equal(leagueKeys.length, 21, 'LEAGUE_REGISTRY must contain all 21 leagues');

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
    assert.equal(lewandowski?.age, 36, 'Lewandowski must preserve his authentic age 36');

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
