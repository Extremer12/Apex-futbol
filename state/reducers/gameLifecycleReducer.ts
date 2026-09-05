// FIX: Import React to enable JSX, which is used for the team logo fallback when rehydrating game state.
import React from 'react';
import { GameState, Team, PlayerProfile, NewsItem, Player, Match, LeagueTableRow, Offer, LeagueId, CupCompetition } from '../../types';
import { generateRandomCoach, generateCoachMarket } from '../../services/coaching';
import { generateStadium, generateSponsorMarket, calculateFinancialBreakdown, getNetWeeklyIncome } from '../../services/economy';
import { initializeGame } from '../../services/gameFactory';
import { startNewSeason } from '../../services/seasonManager';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type GameLifecycleAction = Extract<GameAction,
    | { type: 'INITIALIZE_GAME' }
    | { type: 'LOAD_GAME' }
    | { type: 'RESET_GAME' }
    | { type: 'ADVANCE_WEEK_START' }
    | { type: 'ADVANCE_WEEK_SUCCESS' }
    | { type: 'START_NEW_SEASON' }
>;

export function handleGameLifecycleAction(state: GameState | null, action: GameLifecycleAction): GameState | null {
    switch (action.type) {
        case 'INITIALIZE_GAME': {
            const { team, playerProfile, initialPromises } = action.payload;
            return initializeGame({ selectedTeam: team, playerProfile, initialPromises });
        }

        case 'LOAD_GAME': {
            const loadedState = action.payload;

            // MIGRATION: Ensure all new fields exist for legacy saves
            const currentTurn = loadedState.currentTurn || 'weekend';
            const preferredLanguage = loadedState.preferredLanguage || 'es'; // Default to Spanish as requested

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
            const boardConfidence = loadedState.boardConfidence !== undefined ? loadedState.boardConfidence : ((loadedState as any).chairmanConfidence || 50);

            // 2. Coach & Player Stats System Migration
            const availableCoaches = loadedState.availableCoaches || generateCoachMarket(5);
            // Ensure all teams have a coach, trophyCabinet, and all players have stats/condition
            const allTeamsWithCoaches = loadedState.allTeams.map(t => ({
                ...t,
                coach: t.coach || generateRandomCoach(t.tier),
                trophyCabinet: t.trophyCabinet || [],
                squad: t.squad.map(p => ({
                    ...p,
                    stats: p.stats || { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 },
                    condition: p.condition ?? 100,
                    isInjured: p.isInjured || false,
                    isSuspended: p.isSuspended || false
                }))
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
            // Ensure all leagues are present in leagueTables for state stability
            const leagueTables = (loadedState.leagueTables || {}) as GameState['leagueTables'];
            Object.values(LeagueId).forEach(leagueId => {
                if (!leagueTables[leagueId]) {
                    // Try to recover from legacy fields if it's one of the original 3
                    if (leagueId === LeagueId.PREMIER_LEAGUE && (loadedState as any).leagueTable) {
                        leagueTables[leagueId] = (loadedState as any).leagueTable;
                    } else if (leagueId === LeagueId.CHAMPIONSHIP && (loadedState as any).championshipTable) {
                        leagueTables[leagueId] = (loadedState as any).championshipTable;
                    } else if (leagueId === LeagueId.LA_LIGA && (loadedState as any).laLigaTable) {
                        leagueTables[leagueId] = (loadedState as any).laLigaTable;
                    } else {
                        leagueTables[leagueId] = [];
                    }
                }
            });

            // 5. Cups Migration
            const cups = loadedState.cups || {} as any;
            const fullCups: GameState['cups'] = {
                faCup: cups.faCup || { id: 'fa_cup', name: 'FA Cup', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                carabaoCup: cups.carabaoCup || { id: 'carabao_cup', name: 'Carabao Cup', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                copaDelRey: cups.copaDelRey || { id: 'copa_del_rey', name: 'Copa del Rey', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                dfbPokal: cups.dfbPokal || { id: 'dfb_pokal', name: 'DFB-Pokal', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                coppaItalia: cups.coppaItalia || { id: 'coppa_italia', name: 'Coppa Italia', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                championsLeague: cups.championsLeague || { id: 'champions_league', name: 'Champions League', type: 'swiss', phase: 'finished', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                europaLeague: cups.europaLeague || { id: 'europa_league', name: 'Europa League', type: 'swiss', phase: 'finished', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                copaLibertadores: cups.copaLibertadores || { id: 'copa_libertadores', name: 'Copa Libertadores', type: 'groups', phase: 'finished', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
                copaIntercontinental: cups.copaIntercontinental || { id: 'copa_intercontinental', name: 'Copa Intercontinental', type: 'knockout', phase: 'finished', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
            };

            const cinematicQueue = loadedState.cinematicQueue || [];

            return {
                ...loadedState,
                currentTurn,
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
                leagueTables,
                cups: fullCups,
                cinematicQueue,
                preferredCurrency: loadedState.preferredCurrency || 'EUR',
                preferredLanguage,
            };
        }

        case 'RESET_GAME':
            return null;

        case 'ADVANCE_WEEK_START':
            return state;

        case 'ADVANCE_WEEK_SUCCESS': {
            if (!state) return null;
            const { newsItems, newSchedule, newLeagueTables, newAllTeams, newConfidence, newOffers, newCups, newScoutedPlayerIds } = action.payload;

            // Update player team from newAllTeams
            const updatedPlayerTeam = newAllTeams.find(t => t.id === state.team.id)!;

            // Calculate financial breakdown for the week
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
            // Solo cobrar salarios el fin de semana (una vez por semana)
            const incomeToApply = state.currentTurn === 'weekend' ? netIncome : breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + breakdown.prizeMoneyRevenue + breakdown.transferRevenue; // Only apply positive revenue midweek, no wage deduction
            const newBalance = state.finances.balance + incomeToApply;

            const nextTurn = state.currentTurn === 'weekend' ? 'midweek' : 'weekend';
            const nextWeek = state.currentTurn === 'midweek' ? state.currentWeek + 1 : state.currentWeek;
            const daysToAdd = state.currentTurn === 'weekend' ? 3 : 4; // Sat -> Wed (3), Wed -> Sat (4)

            return {
                ...state,
                currentDate: new Date(state.currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000),
                currentWeek: nextWeek,
                currentTurn: nextTurn,
                newsFeed: [...newsItems, ...state.newsFeed].slice(0, 30),
                schedule: newSchedule,
                leagueTables: newLeagueTables,
                allTeams: newAllTeams,
                team: {
                    ...updatedPlayerTeam,
                    coach: action.payload.coachReport ? {
                        ...updatedPlayerTeam.coach!,
                        satisfactionLevel: action.payload.coachReport.satisfaction
                    } : updatedPlayerTeam.coach
                },
                boardConfidence: newConfidence,
                incomingOffers: [...state.incomingOffers, ...newOffers],
                cups: newCups || state.cups,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    weeklyIncome: breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + breakdown.prizeMoneyRevenue + breakdown.transferRevenue,
                    weeklyWages: breakdown.wageExpenses + breakdown.coachExpenses + breakdown.stadiumExpenses + breakdown.operationalExpenses + breakdown.transferExpenses,
                    balanceHistory: [...state.finances.balanceHistory, newBalance].slice(-52),
                    breakdown
                },
                scoutedPlayerIds: newScoutedPlayerIds || state.scoutedPlayerIds,
            };
        }

        case 'START_NEW_SEASON': {
            if (!state) return null;
            return startNewSeason(state);
        }

        default:
            return state;
    }
}
