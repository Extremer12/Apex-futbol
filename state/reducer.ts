
// FIX: Import React to enable JSX, which is used for the team logo fallback when rehydrating game state.
import React from 'react';
import { GameState, Team, PlayerProfile, NewsItem, Player, Match, LeagueTableRow, Offer } from '../types';
import { TEAMS } from '../constants';
import { generateFixtures, createInitialLeagueTable, generateYouthPlayer } from '../services/simulation';
import { formatDate, formatCurrency } from '../utils';

export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: { team: Team, playerProfile: PlayerProfile } }
    | { type: 'LOAD_GAME'; payload: GameState }
    | { type: 'RESET_GAME' }
    | { type: 'ADVANCE_WEEK_START' }
    | { type: 'ADVANCE_WEEK_SUCCESS'; payload: { newsItems: NewsItem[], newSchedule: Match[], newLeagueTable: LeagueTableRow[], newAllTeams: Team[], newConfidence: number, newOffers?: Offer[] } }
    | { type: 'START_NEW_SEASON' }
    | { type: 'ADD_NEWS'; payload: NewsItem }
    | { type: 'SIGN_PLAYER'; payload: { player: Player, fee: number } }
    | { type: 'PROMOTE_PLAYER'; payload: Player }
    | { type: 'TOGGLE_TRANSFER_LIST'; payload: Player }
    | { type: 'SET_VIEWING_PLAYER'; payload: Player | null }
    | { type: 'ADD_OFFER'; payload: Offer }
    | { type: 'ACCEPT_OFFER'; payload: { offerId: string } }
    | { type: 'REJECT_OFFER'; payload: { offerId: string } };


export const initialState: GameState | null = null;

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
    switch (action.type) {
        case 'INITIALIZE_GAME': {
            const { team, playerProfile } = action.payload;
            const now = new Date('2024-07-01');

            // Clone teams and ASSIGN AGES (Since constants don't have them)
            const allTeamsCopy = TEAMS.map(t => ({
                ...t,
                logo: t.logo,
                squad: t.squad.map(player => ({ 
                    ...player,
                    // Assign random age between 18 and 33 weighted towards 24-28
                    age: Math.floor(18 + Math.random() * 16) 
                })),
            }));
            
            const playerTeamCopy = allTeamsCopy.find(t => t.id === team.id)!;
            
            // Create Initial Youth Academy
            const initialYouthAcademy: Player[] = Array.from({ length: 4 }, () => generateYouthPlayer(playerTeamCopy.tier));

            const totalWages = playerTeamCopy.squad.reduce((sum, player) => sum + player.wage, 0);
            const weeklyIncome = 2_500_000;
            
            const TUTORIAL_NEWS: NewsItem[] = [
                { id: 'tutorial-4', headline: 'La Cantera te Espera', body: 'Hemos ojeado a jóvenes promesas. Revisa la pestaña "Cantera" en tu Plantilla para ver a las futuras estrellas.', date: formatDate(now)},
                { id: 'tutorial-3', headline: '¡Comienza la Temporada!', body: 'La nueva temporada está sobre nosotros. ¡Es hora de llevar a este club a la gloria! Buena suerte, Presidente.', date: formatDate(now)},
                { id: 'tutorial-2', headline: 'Consejo del Día: Mercado de Fichajes', body: `Utiliza la pantalla de 'Fichajes' para ojear jugadores y fortalecer tu equipo. Un buen fichaje puede cambiar tu temporada.`, date: formatDate(now)},
                { id: 'tutorial-1', headline: `Bienvenido a ${team.name}`, body: `¡Felicidades por tu elección, ${playerProfile && playerProfile.name}! La junta y los aficionados confían en ti. El primer paso es revisar tu 'Plantilla' actual.`, date: formatDate(now)},
            ];
            
            const initialConfidence = { 'Top': 65, 'Mid': 75, 'Lower': 80 };

            return {
                team: playerTeamCopy,
                allTeams: allTeamsCopy,
                currentDate: now,
                currentWeek: 0,
                season: 2024,
                newsFeed: TUTORIAL_NEWS,
                schedule: generateFixtures(allTeamsCopy),
                leagueTable: createInitialLeagueTable(allTeamsCopy),
                finances: { balance: team.budget, transferBudget: team.transferBudget, weeklyIncome, weeklyWages: totalWages, balanceHistory: [team.budget] },
                chairmanConfidence: initialConfidence[team.tier],
                viewingPlayer: null,
                incomingOffers: [],
                youthAcademy: initialYouthAcademy,
            };
        }
        
        case 'LOAD_GAME': {
            const rehydratedGameState = action.payload;
            const teamsMap = new Map(TEAMS.map(t => [t.id, t]));
            
            const rehydratedAllTeams = rehydratedGameState.allTeams.map(savedTeam => {
                const originalTeam = teamsMap.get(savedTeam.id);
                return {
                    ...savedTeam,
                    logo: originalTeam ? originalTeam.logo : React.createElement('div', { className: 'w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold' }, '?')
                };
            });

            const rehydratedPlayerTeam = rehydratedAllTeams.find(t => t.id === rehydratedGameState.team.id)!;
            
            return {
                ...rehydratedGameState,
                allTeams: rehydratedAllTeams,
                team: rehydratedPlayerTeam,
                incomingOffers: rehydratedGameState.incomingOffers || [],
                youthAcademy: rehydratedGameState.youthAcademy || [], // Fallback for old saves
                season: rehydratedGameState.season || 2024, // Fallback for old saves
            };
        }

        case 'RESET_GAME':
            return initialState;

        case 'ADVANCE_WEEK_START': {
            if (!state) return null;
            const newDate = new Date(state.currentDate);
            newDate.setDate(newDate.getDate() + 7);
            const weeklyNet = (state.finances.weeklyIncome - state.finances.weeklyWages) / 1_000_000;
            const newBalance = state.finances.balance + weeklyNet;
            return {
                ...state,
                currentDate: newDate,
                currentWeek: state.currentWeek + 1,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance],
                }
            };
        }

        case 'ADVANCE_WEEK_SUCCESS': {
            if (!state) return null;
            const { newsItems, newSchedule, newLeagueTable, newAllTeams, newConfidence, newOffers } = action.payload;
            const teamsMap = new Map(newAllTeams.map(t => [t.id, t]));
            const sortedTable = newLeagueTable.sort((a,b) => {
                if (b.points !== a.points) return b.points - a.points;
                const aGD = a.goalsFor - a.goalsAgainst;
                const bGD = b.goalsFor - b.goalsAgainst;
                if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
                const aTeamName = teamsMap.get(a.teamId)!.name;
                const bTeamName = teamsMap.get(b.teamId)!.name;
                return aTeamName.localeCompare(bTeamName);
            }).map((row, index) => ({
                ...row,
                position: index + 1,
                goalDifference: row.goalsFor - row.goalsAgainst,
            }));

            const updatedPlayerTeam = newAllTeams.find(t => t.id === state.team.id)!;

            return {
                ...state,
                team: updatedPlayerTeam,
                allTeams: newAllTeams,
                schedule: newSchedule,
                leagueTable: sortedTable,
                chairmanConfidence: newConfidence,
                newsFeed: [...newsItems, ...state.newsFeed].slice(0, 20),
                incomingOffers: [...state.incomingOffers, ...(newOffers || [])],
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
            for(let i=0; i<newProspectsCount; i++) {
                updatedAcademy.push(generateYouthPlayer(updatedPlayerTeam.tier));
            }

            // 3. Reset Competition
            const newSchedule = generateFixtures(processedTeams);
            const newTable = createInitialLeagueTable(processedTeams);
            
            // 4. News
            const seasonNews: NewsItem = {
                id: `season_start_${newSeasonYear}`,
                headline: `Temporada ${newSeasonYear}-${newSeasonYear+1}`,
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
                schedule: newSchedule,
                leagueTable: newTable,
                newsFeed: [seasonNews, ...state.newsFeed].slice(0, 20),
                // Reset finances history slightly or keep continuous? Keep continuous.
            };
        }
        
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
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);
            
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
        
        default:
            return state;
    }
}
