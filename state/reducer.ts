

// FIX: Import React to enable JSX, which is used for the team logo fallback when rehydrating game state.
import React from 'react';
import { GameState, Team, PlayerProfile, NewsItem, Player, Match, LeagueTableRow, Offer } from '../types';
import { TEAMS } from '../constants';
import { generateSeasonSchedule, createInitialLeagueTable, simulateMatch, generateCupDraw, advanceCupRound, determineCupWinner, handlePromotionRelegation, generateYouthPlayer } from '../services/simulation';
import { generateRandomCoach, generateCoachMarket } from '../services/coaching';
import { generateStadium, generateSponsorMarket, calculateFinancialBreakdown, getNetWeeklyIncome } from '../services/economy';
import { initializeGame } from '../services/gameFactory';
import { startNewSeason } from '../services/seasonManager';
import { formatDate, formatCurrency } from '../utils';

// ... (imports remain the same)

// ... (imports remain the same)

// Define all possible action types
export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: { team: Team; playerProfile: PlayerProfile } }
    | { type: 'LOAD_GAME'; payload: GameState }
    | { type: 'RESET_GAME' }
    | { type: 'ADVANCE_WEEK_START' }
    | { type: 'ADVANCE_WEEK_SUCCESS'; payload: { newsItems: NewsItem[]; newSchedule: Match[]; newLeagueTables: Record<LeagueId, LeagueTableRow[]>; newAllTeams: Team[]; newConfidence: number; newOffers: Offer[]; newCups?: { faCup: any; carabaoCup: any } } }
    | { type: 'START_NEW_SEASON' }
    | { type: 'TRIGGER_ELECTION' }
    | { type: 'ELECTION_RESULT'; payload: { won: boolean; newApproval: number } }
    | { type: 'UPDATE_FAN_APPROVAL'; payload: { delta: number; reason: string } }
    | { type: 'ADD_NEWS'; payload: NewsItem }
    | { type: 'ADD_OFFER'; payload: Offer }
    | { type: 'ACCEPT_OFFER'; payload: { offerId: string } }
    | { type: 'REJECT_OFFER'; payload: { offerId: string } }
    | { type: 'SIGN_PLAYER'; payload: { player: Player; fee: number } }
    | { type: 'PROMOTE_PLAYER'; payload: Player }
    | { type: 'TOGGLE_TRANSFER_LIST'; payload: Player }
    | { type: 'SET_VIEWING_PLAYER'; payload: Player | null }
    | { type: 'HIRE_COACH'; payload: { coachId: string } }
    | { type: 'FIRE_COACH' }
    | { type: 'ACCEPT_SPONSOR'; payload: { sponsorId: string } }
    | { type: 'EXPAND_STADIUM' }
    | { type: 'SET_FAN_APPROVAL'; payload: any } // Using any to avoid circular dependency with types if FanApproval is not exported, but it is.
    | { type: 'UPDATE_FINANCES'; payload: any }
    | { type: 'UPDATE_TEAM'; payload: Team }
    | { type: 'UPDATE_CHAIRMAN_CONFIDENCE'; payload: number }
    | { type: 'UPDATE_STADIUM'; payload: any };

export const initialState: GameState | null = null;

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
    switch (action.type) {
        case 'INITIALIZE_GAME': {
            const { team, playerProfile } = action.payload;

            // Delegate initialization to the game factory service
            return initializeGame({ selectedTeam: team, playerProfile });
        }

        case 'LOAD_GAME': {
            const loadedState = action.payload;

            // MIGRATION: Ensure all new fields exist for legacy saves

            // 1. Political System Migration
            const mandate = loadedState.mandate || {
                startYear: loadedState.season || 2024,
                currentYear: 1,
                nextElectionSeason: (loadedState.season || 2024) + 3,
                isElectionYear: false,
                totalMandates: 1
            };

            const fanApproval = loadedState.fanApproval || {
                rating: 60,
                trend: 'stable',
                factors: { results: 0, transfers: 0, finances: 0, promises: 0 }
            };

            const electoralPromises = loadedState.electoralPromises || [];
            const boardConfidence = loadedState.boardConfidence !== undefined ? loadedState.boardConfidence : (loadedState.chairmanConfidence || 50);

            // 2. Coach System Migration
            const availableCoaches = loadedState.availableCoaches || generateCoachMarket(5);
            // Ensure all teams have a coach
            const allTeamsWithCoaches = loadedState.allTeams.map(t => ({
                ...t,
                coach: t.coach || generateRandomCoach(t.tier)
            }));
            const playerTeamWithCoach = allTeamsWithCoaches.find(t => t.id === loadedState.team.id)!;

            // 3. Economy System Migration
            const stadium = loadedState.stadium || generateStadium(playerTeamWithCoach);
            const sponsors = loadedState.sponsors || [];
            const availableSponsors = loadedState.availableSponsors || generateSponsorMarket(playerTeamWithCoach.tier);

            // Ensure finances has breakdown if missing (will be calculated next week)
            const finances = {
                ...loadedState.finances,
                breakdown: loadedState.finances.breakdown || undefined
            };

            // 4. League Tables Migration
            // @ts-ignore - Handling legacy migration where these properties might exist on loadedState but not on GameState type
            const leagueTables = loadedState.leagueTables || {
                PREMIER_LEAGUE: loadedState.leagueTable || [],
                CHAMPIONSHIP: loadedState.championshipTable || [],
                LA_LIGA: loadedState.laLigaTable || []
            };

            return {
                ...loadedState,
                team: playerTeamWithCoach,
                allTeams: allTeamsWithCoaches,
                mandate,
                fanApproval,
                electoralPromises,
                boardConfidence,
                availableCoaches,
                stadium,
                sponsors,
                availableSponsors,
                finances,
                leagueTables
            };
        }

        case 'RESET_GAME':
            return null;

        case 'ADVANCE_WEEK_START':
            return state;

        case 'ADVANCE_WEEK_SUCCESS': {
            if (!state) return null;
            const { newsItems, newSchedule, newLeagueTables, newAllTeams, newConfidence, newOffers, newCups } = action.payload;

            // Update player team from newAllTeams
            const updatedPlayerTeam = newAllTeams.find(t => t.id === state.team.id)!;

            // Calculate financial breakdown for the week
            // We need to estimate transfers sold/bought this week. 
            // For now, we'll assume 0 unless we track it in payload.
            // Ideally, this should be passed in payload, but we can calculate it roughly or leave it 0 for this tick.
            const playerLeagueId = state.team.leagueId;
            const playerTable = newLeagueTables[playerLeagueId] || [];
            const playerPosition = playerTable.find(row => row.teamId === state.team.id)?.position || 10;

            // Check if there was a home match this week
            const currentMatch = state.schedule.find(m => m.week === state.currentWeek && (m.homeTeamId === state.team.id || m.awayTeamId === state.team.id));
            const wasHomeMatch = currentMatch?.homeTeamId === state.team.id;

            const breakdown = calculateFinancialBreakdown(
                updatedPlayerTeam,
                state.stadium,
                state.sponsors,
                playerPosition,
                { bought: 0, sold: 0 },
                wasHomeMatch,
                playerLeagueId
            );

            // Update balance based on breakdown
            const netIncome = getNetWeeklyIncome(breakdown);
            const newBalance = state.finances.balance + netIncome;

            return {
                ...state,
                currentDate: new Date(state.currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
                currentWeek: state.currentWeek + 1,
                newsFeed: [...newsItems, ...state.newsFeed].slice(0, 50),
                schedule: newSchedule,
                leagueTables: newLeagueTables,
                allTeams: newAllTeams,
                team: updatedPlayerTeam,
                boardConfidence: newConfidence,
                incomingOffers: [...state.incomingOffers, ...newOffers],
                cups: newCups || state.cups,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    weeklyIncome: breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + breakdown.prizeMoneyRevenue + breakdown.transferRevenue,
                    weeklyWages: breakdown.wageExpenses + breakdown.coachExpenses + breakdown.stadiumExpenses + breakdown.operationalExpenses + breakdown.transferExpenses,
                    balanceHistory: [...state.finances.balanceHistory, newBalance],
                    breakdown
                }
            };
        }

        case 'START_NEW_SEASON': {
            if (!state) return null;

            const newSeasonYear = state.season + 1;
            const newDate = new Date(`${newSeasonYear}-07-01`);

            // 1. Process Aging & Retirements & Regens
            const processedTeams = state.allTeams.map(team => {
                let updatedSquad: Player[] = team.squad
                    .map(p => ({
                        ...p,
                        age: (p.age || 25) + 1,
                        contractYears: Math.max(0, p.contractYears - 1)
                    }))
                    .filter(p => {
                        // Retirement logic
                        if (p.age && p.age > 38) return false; // Force retire
                        if (p.age && p.age > 34 && Math.random() < 0.3) return false; // Chance to retire
                        return true;
                    });

                // Regen Logic: If team is too small, add youths
                while (updatedSquad.length < 18) {
                    updatedSquad.push(generateYouthPlayer(team.tier));
                }

                return { ...team, squad: updatedSquad };
            });

            const updatedPlayerTeam = processedTeams.find(t => t.id === state.team.id)!;

            // 2. Refresh Player Academy
            // Remove players who got too old in academy (19+) or randomly replace some
            let updatedAcademy: Player[] = state.youthAcademy
                .map(p => ({ ...p, age: (p.age || 16) + 1 }))
                .filter(p => p.age !== undefined && p.age <= 19);

            // Add new talent
            const newProspectsCount = 3 + Math.floor(Math.random() * 3); // 3-5 new players
            for (let i = 0; i < newProspectsCount; i++) {
                updatedAcademy.push(generateYouthPlayer(updatedPlayerTeam.tier));
            }

            // 3. Reset Competition & Process Promotion/Relegation
            // We need the FINAL tables from the previous season to determine promotion/relegation
            // Identify teams before changes for news
            const sortedPL = [...state.leagueTables.PREMIER_LEAGUE].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
            const sortedCH = [...state.leagueTables.CHAMPIONSHIP].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

            const relegatedIds = sortedPL.slice(-3).map(row => row.teamId);
            const promotedIds = sortedCH.slice(0, 3).map(row => row.teamId);

            const relegatedTeams = relegatedIds.map(id => processedTeams.find(t => t.id === id)?.name || 'Unknown').filter(Boolean);
            const promotedTeams = promotedIds.map(id => processedTeams.find(t => t.id === id)?.name || 'Unknown').filter(Boolean);

            const teamsAfterProRel = handlePromotionRelegation(processedTeams, state.leagueTables.PREMIER_LEAGUE, state.leagueTables.CHAMPIONSHIP);

            const newSeasonSchedule = generateSeasonSchedule(teamsAfterProRel);
            const newPlTeams = teamsAfterProRel.filter(t => t.leagueId === 'PREMIER_LEAGUE');
            const newChTeams = teamsAfterProRel.filter(t => t.leagueId === 'CHAMPIONSHIP');
            const newLaTeams = teamsAfterProRel.filter(t => t.leagueId === 'LA_LIGA');

            const newLeagueTables = {
                PREMIER_LEAGUE: createInitialLeagueTable(newPlTeams),
                CHAMPIONSHIP: createInitialLeagueTable(newChTeams),
                LA_LIGA: createInitialLeagueTable(newLaTeams)
            };

            // Generate New Cup Draws (ONLY English teams for English cups)
            const englishTeamsNewSeason = [...newPlTeams, ...newChTeams];
            const faCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'FA_Cup');
            const carabaoCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'Carabao_Cup');

            const faCupFixtures = faCupRound1.map(m => ({ ...m, week: 5 }));
            const carabaoCupFixtures = carabaoCupRound1.map(m => ({ ...m, week: 2 }));

            const fullSchedule = [...newSeasonSchedule, ...faCupFixtures, ...carabaoCupFixtures];

            // 4. News - Promotion/Relegation and Season Start
            const proRelNews: NewsItem = {
                id: `pro_rel_${newSeasonYear}`,
                headline: `🔄 Cambios en las Ligas - Temporada ${newSeasonYear}`,
                body: `⬆️ ASCENSOS: ${promotedTeams.join(', ')} suben a la Premier League.\n⬇️ DESCENSOS: ${relegatedTeams.join(', ')} descienden al Championship. ¡La nueva temporada promete emociones!`,
                date: formatDate(newDate)
            };

            const seasonNews: NewsItem = {
                id: `season_start_${newSeasonYear}`,
                headline: `Temporada ${newSeasonYear}-${newSeasonYear + 1}`,
                body: `La pretemporada ha terminado. Los veteranos se han retirado y nuevas caras llegan desde la cantera. ¡Objetivo: Ganar!`,
                date: formatDate(newDate)
            };

            return {
                ...state,
                team: updatedPlayerTeam,
                allTeams: processedTeams,
                youthAcademy: updatedAcademy,
                season: newSeasonYear,
                currentDate: newDate,
                currentWeek: 0,
                schedule: fullSchedule,
                leagueTables: newLeagueTables,
                newsFeed: [proRelNews, seasonNews, ...state.newsFeed].slice(0, 20),
                // Update Mandate Year and Check for Elections
                mandate: {
                    ...state.mandate,
                    currentYear: state.mandate.currentYear >= 4 ? state.mandate.currentYear : state.mandate.currentYear + 1,
                    isElectionYear: state.mandate.currentYear + 1 > 4,
                    nextElectionSeason: state.mandate.currentYear + 1 > 4 ? newSeasonYear : state.mandate.nextElectionSeason
                },
                // Update Fan Approval based on season performance
                fanApproval: (() => {
                    const playerPosition = sortedPL.find(row => row.teamId === updatedPlayerTeam.id)?.position ||
                        sortedCH.find(row => row.teamId === updatedPlayerTeam.id)?.position || 10;

                    let approvalDelta = 0;
                    if (playerPosition <= 4) approvalDelta = 15;
                    else if (playerPosition <= 6) approvalDelta = 10;
                    else if (playerPosition >= 18) approvalDelta = -20;
                    else if (playerPosition <= 10) approvalDelta = 5;
                    else approvalDelta = -5;

                    const newRating = Math.max(0, Math.min(100, state.fanApproval.rating + approvalDelta));
                    const trend: 'rising' | 'stable' | 'falling' =
                        approvalDelta > 5 ? 'rising' : approvalDelta < -5 ? 'falling' : 'stable';

                    return {
                        ...state.fanApproval,
                        rating: newRating,
                        trend
                    };
                })(),
                cups: {
                    faCup: {
                        id: 'fa_cup',
                        name: 'FA Cup',
                        rounds: [{ name: 'Round 1', fixtures: faCupFixtures, completed: false }],
                        currentRoundIndex: 0,
                        statistics: { topScorers: [], championsHistory: state.cups.faCup.statistics?.championsHistory || [] }
                    },
                    carabaoCup: {
                        id: 'carabao_cup',
                        name: 'Carabao Cup',
                        rounds: [{ name: 'Round 1', fixtures: carabaoCupFixtures, completed: false }],
                        currentRoundIndex: 0,
                        statistics: { topScorers: [], championsHistory: state.cups.carabaoCup.statistics?.championsHistory || [] }
                    }
                }
            };
        }
        // ...


        case 'ADD_NEWS': {
            if (!state) return null;
            return {
                ...state,
                newsFeed: [action.payload, ...state.newsFeed].slice(0, 20),
            }
        }

        case 'ADD_OFFER': {
            if (!state) return null;
            return {
                ...state,
                incomingOffers: [...state.incomingOffers, action.payload]
            }
        }

        case 'ACCEPT_OFFER': {
            if (!state) return null;
            const offer = state.incomingOffers.find(o => o.id === action.payload.offerId);
            if (!offer) return state;

            const player = state.team.squad.find(p => p.id === offer.playerId);
            if (!player) return state;

            const offeringTeam = state.allTeams.find(t => t.id === offer.offeringTeamId);

            // Update finances
            const newBalance = state.finances.balance + offer.offerValue;
            const newTransferBudget = state.finances.transferBudget + offer.offerValue;
            const newWages = state.finances.weeklyWages - player.wage;

            // Update squad
            const newSquad = state.team.squad.filter(p => p.id !== player.id);
            const newTeam = { ...state.team, squad: newSquad };

            // Add player to offering team
            const updatedOfferingTeam = offeringTeam ? { ...offeringTeam, squad: [...offeringTeam.squad, player] } : null;

            const newAllTeams = state.allTeams.map(t => {
                if (t.id === newTeam.id) return newTeam;
                if (updatedOfferingTeam && t.id === updatedOfferingTeam.id) return updatedOfferingTeam;
                return t;
            });

            // Create news item
            const newsItem: NewsItem = {
                id: `news_${new Date().toISOString()}`,
                headline: `¡VENDIDO! ${player.name} ficha por el ${offeringTeam?.name || 'otro club'}`,
                body: `${player.name} ha completado su traspaso al ${offeringTeam?.name || 'otro club'} por una cifra de ${formatCurrency(offer.offerValue)}. El presidente expresó que era "una buena operación para el club".`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    transferBudget: newTransferBudget,
                    weeklyWages: newWages
                },
                incomingOffers: state.incomingOffers.filter(o => o.id !== offer.id),
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20),
            };
        }

        case 'REJECT_OFFER': {
            if (!state) return null;
            return {
                ...state,
                incomingOffers: state.incomingOffers.filter(o => o.id !== action.payload.offerId)
            };
        }

        case 'SIGN_PLAYER': {
            if (!state) return null;
            const { player, fee } = action.payload;

            const playerToAdd: Player = { ...player, morale: 'Contento', contractYears: 3, isTransferListed: false };
            const newWages = state.finances.weeklyWages + player.wage;
            const newTransferBudget = state.finances.transferBudget - fee;
            const newBalance = state.finances.balance - fee;

            const updatedAllTeams = state.allTeams.map(t => {
                if (t.squad.some(p => p.id === player.id)) {
                    return { ...t, squad: t.squad.filter(p => p.id !== player.id) };
                }
                if (t.id === state.team.id) {
                    return { ...t, squad: [...t.squad, playerToAdd] };
                }
                return t;
            });
            const updatedPlayerTeam = updatedAllTeams.find(t => t.id === state.team.id)!;

            return {
                ...state,
                team: updatedPlayerTeam,
                allTeams: updatedAllTeams,
                finances: { ...state.finances, balance: newBalance, transferBudget: newTransferBudget, weeklyWages: newWages }
            };
        }

        case 'PROMOTE_PLAYER': {
            if (!state) return null;
            const player = action.payload;

            // Remove from academy, add to main squad
            const newAcademy = state.youthAcademy.filter(p => p.id !== player.id);
            const promotedPlayer: Player = {
                ...player,
                contractYears: 3,
                wage: 5000, // Entry level wage
                morale: 'Feliz'
            };
            const newSquad = [...state.team.squad, promotedPlayer];
            const newWages = state.finances.weeklyWages + promotedPlayer.wage;

            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            const newsItem: NewsItem = {
                id: `promote_${Date.now()}`,
                headline: `Nueva Estrella: ${player.name}`,
                body: `El canterano ${player.name} (Edad: ${player.age || 16}) ha sido promovido al primer equipo. La afición está ilusionada con su potencial.`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                youthAcademy: newAcademy,
                finances: { ...state.finances, weeklyWages: newWages },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'TOGGLE_TRANSFER_LIST': {
            if (!state) return null;
            const playerToToggle = action.payload;

            const newSquad = state.team.squad.map(p =>
                p.id === playerToToggle.id
                    ? { ...p, isTransferListed: !p.isTransferListed }
                    : p
            );
            const newTeam = { ...state.team, squad: newSquad };
            const newAllTeams = state.allTeams.map(t =>
                t.id === newTeam.id ? newTeam : t
            );

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                viewingPlayer: state.viewingPlayer && state.viewingPlayer.id === playerToToggle.id
                    ? { ...state.viewingPlayer, isTransferListed: !state.viewingPlayer.isTransferListed }
                    : state.viewingPlayer,
            };
        }

        case 'SET_VIEWING_PLAYER': {
            if (!state) return null;
            return { ...state, viewingPlayer: action.payload };
        }

        case 'TRIGGER_ELECTION': {
            if (!state) return null;
            // This action just flags that elections should be shown
            // The actual election logic happens in the UI
            return state;
        }

        case 'ELECTION_RESULT': {
            if (!state) return null;
            const { won, newApproval } = action.payload;

            if (won) {
                // President won re-election
                return {
                    ...state,
                    mandate: {
                        ...state.mandate,
                        currentYear: 1,
                        startYear: state.season,
                        totalMandates: state.mandate.totalMandates + 1,
                        isElectionYear: false,
                        nextElectionSeason: state.season + 4
                    },
                    fanApproval: {
                        ...state.fanApproval,
                        rating: newApproval
                    },
                    newsFeed: [{
                        id: `election_won_${state.season}`,
                        headline: '🎉 ¡Reelección Exitosa!',
                        body: `Los socios han hablado y confían en tu gestión. Comenzarás tu mandato número ${state.mandate.totalMandates + 1} con ${newApproval}% de aprobación.`,
                        date: formatDate(state.currentDate)
                    }, ...state.newsFeed].slice(0, 20)
                };
            } else {
                // President lost election - this should trigger game over in UI
                return {
                    ...state,
                    mandate: {
                        ...state.mandate,
                        isElectionYear: false
                    },
                    fanApproval: {
                        ...state.fanApproval,
                        rating: newApproval
                    }
                };
            }
        }

        case 'UPDATE_FAN_APPROVAL': {
            if (!state) return null;
            const { delta, reason } = action.payload;

            const newRating = Math.max(0, Math.min(100, state.fanApproval.rating + delta));
            const trend: 'rising' | 'stable' | 'falling' =
                delta > 5 ? 'rising' : delta < -5 ? 'falling' : 'stable';

            return {
                ...state,
                fanApproval: {
                    ...state.fanApproval,
                    rating: newRating,
                    trend
                },
                newsFeed: delta !== 0 ? [{
                    id: `approval_${Date.now()}`,
                    headline: delta > 0 ? '📈 Aprobación en Alza' : '📉 Aprobación Baja',
                    body: `${reason}. Tu aprobación ${delta > 0 ? 'sube' : 'baja'} a ${newRating}%.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20) : state.newsFeed
            };
        }

        case 'HIRE_COACH': {
            if (!state) return null;
            const { coachId } = action.payload;
            const coachToHire = state.availableCoaches.find(c => c.id === coachId);

            if (!coachToHire) return state;

            // Check budget
            if (state.finances.balance < coachToHire.signingBonus) {
                return state;
            }

            const newBalance = state.finances.balance - coachToHire.signingBonus;

            // Update team
            const newTeam = { ...state.team, coach: coachToHire };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            // Remove from market
            const newMarket = state.availableCoaches.filter(c => c.id !== coachId);

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                availableCoaches: newMarket,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `hire_coach_${Date.now()}`,
                    headline: '👔 Nuevo Director Técnico',
                    body: `El club ha contratado a ${coachToHire.name}. Su estilo ${coachToHire.style} promete cambiar la dinámica del equipo.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'FIRE_COACH': {
            if (!state || !state.team.coach) return state;

            const severancePay = state.team.coach.salary * 4; // 1 month severance
            const newBalance = state.finances.balance - severancePay;

            const newTeam = { ...state.team, coach: undefined };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `fire_coach_${Date.now()}`,
                    headline: '👋 Entrenador Despedido',
                    body: `El club ha decidido prescindir de los servicios de su Director Técnico. El puesto está vacante.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'ACCEPT_SPONSOR': {
            if (!state) return null;
            const { sponsorId } = action.payload;
            const sponsor = state.availableSponsors.find(s => s.id === sponsorId);

            if (!sponsor) return state;

            // Check if already have sponsor of this type
            const existingSponsor = state.sponsors.find(s => s.type === sponsor.type);
            if (existingSponsor) {
                // Replace existing sponsor
                const newSponsors = state.sponsors.map(s =>
                    s.type === sponsor.type ? sponsor : s
                );
                const newMarket = state.availableSponsors.filter(s => s.id !== sponsorId && s.type !== sponsor.type);

                return {
                    ...state,
                    sponsors: newSponsors,
                    availableSponsors: newMarket,
                    newsFeed: [{
                        id: `sponsor_${Date.now()}`,
                        headline: '🤝 Nuevo Acuerdo de Patrocinio',
                        body: `${sponsor.name} es ahora nuestro nuevo patrocinador ${sponsor.type === 'shirt' ? 'de camiseta' : sponsor.type === 'stadium' ? 'del estadio' : sponsor.type === 'training' ? 'de entrenamiento' : 'de equipación'}. Ingresos: ${formatCurrency(sponsor.weeklyIncome)}/semana.`,
                        date: formatDate(state.currentDate)
                    }, ...state.newsFeed].slice(0, 20)
                };
            }

            // Add new sponsor
            const newMarket = state.availableSponsors.filter(s => s.id !== sponsorId && s.type !== sponsor.type);

            return {
                ...state,
            } else {
                // Add new sponsor
                return {
                    ...state,
                    sponsors: [...state.sponsors, sponsor],
                    availableSponsors: state.availableSponsors.filter(s => s.id !== sponsorId),
                    newsFeed: [{
                        id: `sponsor_${Date.now()}`,
                        headline: '🤝 Nuevo Acuerdo de Patrocinio',
                        body: `${sponsor.name} es ahora nuestro patrocinador ${sponsor.type === 'shirt' ? 'de camiseta' : sponsor.type === 'stadium' ? 'del estadio' : sponsor.type === 'training' ? 'de entrenamiento' : 'de equipación'}. Ingresos: ${formatCurrency(sponsor.weeklyIncome)}/semana.`,
                        date: formatDate(state.currentDate)
                    }, ...state.newsFeed].slice(0, 20)
                };
            }
        }

        case 'EXPAND_STADIUM': {
            if (!state || !state.stadium.expansionCost || !state.stadium.expansionCapacity) return state;

            if (state.finances.balance < state.stadium.expansionCost) return state;

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: state.finances.balance - state.stadium.expansionCost,
                    balanceHistory: [...state.finances.balanceHistory, state.finances.balance - state.stadium.expansionCost]
                },
                stadium: {
                    ...state.stadium,
                    capacity: state.stadium.expansionCapacity,
                    expansionCost: undefined,
                    expansionCapacity: undefined
                },
                newsFeed: [{
                    id: `stadium_expansion_${Date.now()}`,
                    headline: '🏟️ Estadio Ampliado',
                    body: `Las obras de ampliación del ${state.stadium.name} han finalizado. La nueva capacidad es de ${state.stadium.expansionCapacity} espectadores.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'SET_FAN_APPROVAL':
            return state ? { ...state, fanApproval: action.payload } : null;

        case 'UPDATE_FINANCES':
            return state ? { ...state, finances: { ...state.finances, ...action.payload } } : null;

        case 'UPDATE_TEAM':
            return state ? {
                ...state,
                team: action.payload,
                allTeams: state.allTeams.map(t => t.id === action.payload.id ? action.payload : t)
            } : null;

        case 'UPDATE_CHAIRMAN_CONFIDENCE':
            return state ? { ...state, boardConfidence: action.payload } : null;

        case 'UPDATE_STADIUM':
            return state ? { ...state, stadium: action.payload } : null;

        default:
            return state;
    }
}
```
