/**
 * Season Manager Service
 * Handles season transitions, aging, retirements, and promotion/relegation
 */

import { GameState, Team, Player, NewsItem, EuropeanCompetition, EuropeanTableRow, Match, CupCompetition, CupChampion, LeagueId } from '../types';
import { generateYouthPlayer, generateSeasonSchedule, generateCupDraw, createInitialLeagueTable, handlePromotionRelegation, generateSwissPhase, generateGroupPhase, createInitialEuropeanTable } from './simulation';
import { calculatePrizeMoney, generateSponsorMarket } from './economy';
import { formatDate, formatCurrency } from '../utils';

/**
 * Processes the transition to a new season
 * Handles aging, retirements, regens, promotion/relegation, and schedule generation
 */
export function startNewSeason(currentState: GameState): GameState {
    const newSeasonYear = currentState.season + 1;
    const newDate = new Date(`${newSeasonYear}-08-10`);

    // 1. Process Aging & Retirements & Regens
    const processedTeams = currentState.allTeams.map(team => {
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

    const updatedPlayerTeam = processedTeams.find(t => t.id === currentState.team.id)!;

    // 2. Refresh Player Academy
    let updatedAcademy: Player[] = currentState.youthAcademy
        .map(p => ({ ...p, age: (p.age || 16) + 1 }))
        .filter(p => p.age !== undefined && p.age <= 19);

    // Add new talent
    const newProspectsCount = 3 + Math.floor(Math.random() * 3); // 3-5 new players
    for (let i = 0; i < newProspectsCount; i++) {
        updatedAcademy.push(generateYouthPlayer(updatedPlayerTeam.tier));
    }

    // 2.5 Process Trophies
    const currentSeason = currentState.season;
    const trophiesToAward: { teamId: number, name: string, type: 'league' | 'cup' }[] = [];

    // Leagues
    Object.entries(currentState.leagueTables).forEach(([leagueId, table]) => {
        if (table.length > 0) {
            const sortedTable = [...table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
            const winnerId = sortedTable[0].teamId;
            let leagueName = leagueId;
            switch(leagueId) {
                case 'PREMIER_LEAGUE': leagueName = 'Premier League'; break;
                case 'CHAMPIONSHIP': leagueName = 'Championship'; break;
                case 'LA_LIGA': leagueName = 'La Liga'; break;
                case 'BUNDESLIGA': leagueName = 'Bundesliga'; break;
                case 'SERIE_A': leagueName = 'Serie A'; break;
            }
            trophiesToAward.push({ teamId: winnerId, name: leagueName, type: 'league' });
        }
    });

    if (currentState.cups.faCup.winnerId) {
        trophiesToAward.push({ teamId: currentState.cups.faCup.winnerId, name: 'FA Cup', type: 'cup' });
    }
    if (currentState.cups.carabaoCup.winnerId) {
        trophiesToAward.push({ teamId: currentState.cups.carabaoCup.winnerId, name: 'Carabao Cup', type: 'cup' });
    }
    if (currentState.cups.championsLeague.winnerId) {
        trophiesToAward.push({ teamId: currentState.cups.championsLeague.winnerId, name: 'Champions League', type: 'cup' });
    }
    if (currentState.cups.copaLibertadores.winnerId) {
        trophiesToAward.push({ teamId: currentState.cups.copaLibertadores.winnerId, name: 'Copa Libertadores', type: 'cup' });
    }
    if (currentState.cups.copaIntercontinental.winnerId) {
        trophiesToAward.push({ teamId: currentState.cups.copaIntercontinental.winnerId, name: 'Copa Intercontinental', type: 'cup' });
    }

    // Apply Trophies to processedTeams
    const teamsWithTrophies = processedTeams.map(team => {
        const teamTrophies = trophiesToAward.filter(t => t.teamId === team.id).map((t, idx) => ({
            id: `trophy_${currentSeason}_${team.id}_${idx}`,
            name: t.name,
            season: currentSeason,
            type: t.type
        }));
        
        if (teamTrophies.length > 0) {
            return {
                ...team,
                trophyCabinet: [...(team.trophyCabinet || []), ...teamTrophies]
            };
        }
        return team;
    });

    // Re-assign processedTeams so the rest of the flow uses teams with updated trophies
    processedTeams.splice(0, processedTeams.length, ...teamsWithTrophies);

    // 2.6 Process Player Awards & Stats Reset
    let ballonDorWinner: Player | null = null;
    let goldenBootWinner: Player | null = null;
    let maxGoals = 0;
    let bestScore = 0;

    const allPlayers = processedTeams.flatMap(t => t.squad);

    allPlayers.forEach(p => {
        if (!p.stats) return;

        // Golden Boot
        if (p.stats.goals > maxGoals) {
            maxGoals = p.stats.goals;
            goldenBootWinner = p;
        }

        // Ballon d'Or score (Goals * 2 + Assists * 1 + Rating / 10 + Apps / 2)
        const score = (p.stats.goals * 2) + p.stats.assists + (p.rating / 10) + (p.stats.appearances / 2);
        if (score > bestScore) {
            bestScore = score;
            ballonDorWinner = p;
        }

        // Dynamic Value Update
        const performanceBonus = (p.stats.goals * 0.5) + (p.stats.assists * 0.2);
        const ageMultiplier = p.age && p.age < 23 ? 1.5 : p.age && p.age > 30 ? 0.8 : 1.0;
        p.value = Math.max(0.1, p.value + (performanceBonus * ageMultiplier) - (p.age && p.age > 32 ? 2 : 0));
        
        // Dynamic Rating Update
        if (p.age && p.age < 25 && p.stats.appearances > 10) p.rating = Math.min(99, p.rating + Math.floor(Math.random() * 3));
        if (p.age && p.age > 32) p.rating = Math.max(40, p.rating - Math.floor(Math.random() * 3));

        // Reset stats
        p.stats = { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 };
    });

    const updatedPlayerTeamWithTrophies = processedTeams.find(t => t.id === currentState.team.id)!;

    // 3. Process Promotion/Relegation (All leagues)
    const teamsAfterProRel = handlePromotionRelegation(
        processedTeams,
        currentState.leagueTables
    );

    // Identify which teams actually moved for the news feed
    const allMovementNews: string[] = [];
    PROMOTION_RELEGATION_PAIRS.forEach(([div1, div2]) => {
        const div1Table = currentState.leagueTables[div1] || [];
        const div2Table = currentState.leagueTables[div2] || [];
        if (div1Table.length > 0 && div2Table.length > 0) {
            const sorted1 = [...div1Table].sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference);
            const sorted2 = [...div2Table].sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference);
            
            const relegatedNames = sorted1.slice(-3).map(r => processedTeams.find(t => t.id === r.teamId)?.name).filter(Boolean);
            const promotedNames = sorted2.slice(0, 3).map(p => processedTeams.find(t => t.id === p.id)?.name).filter(Boolean);
            
            if (relegatedNames.length > 0 || promotedNames.length > 0) {
                const leagueName = div1.replace(/_/g, ' ');
                allMovementNews.push(`${leagueName}: ⬆️ ${promotedNames.join(', ')} | ⬇️ ${relegatedNames.join(', ')}`);
            }
        }
    });

    // 4. Generate new season schedule and tables
    const newSeasonSchedule = generateSeasonSchedule(teamsAfterProRel);

    const getLeagueTeams = (id: string) => teamsAfterProRel.filter(t => t.leagueId === id);

    const newLeagueTables: Record<string, any[]> = {};
    [
        'PREMIER_LEAGUE', 'CHAMPIONSHIP',
        'LA_LIGA', 'SEGUNDA_DIVISION_ESP',
        'BUNDESLIGA', 'ZWEITE_BUNDESLIGA',
        'SERIE_A', 'SERIE_B_ITA',
        'LIGUE_1', 'LIGUE_2',
        'LIGA_ARGENTINA', 'PRIMERA_NACIONAL',
        'BRASILEIRAO', 'SERIE_B_BR'
    ].forEach(lid => {
        const teams = getLeagueTeams(lid);
        newLeagueTables[lid] = createInitialLeagueTable(teams);
    });

    const newPlTeams = getLeagueTeams('PREMIER_LEAGUE');
    const newChTeams = getLeagueTeams('CHAMPIONSHIP');
    const newLaTeams = getLeagueTeams('LA_LIGA');
    const newGerTeams = getLeagueTeams('BUNDESLIGA');
    const newItaTeams = getLeagueTeams('SERIE_A');

    // 5. Generate new cup draws (National Cups)
    const englishTeamsNewSeason = [...newPlTeams, ...newChTeams];
    const faCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'FA_Cup');
    const carabaoCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'Carabao_Cup');
    const copaDelReyRound1 = generateCupDraw(newLaTeams, 'Round 1', 'Copa_Del_Rey');
    const dfbPokalRound1 = generateCupDraw(newGerTeams, 'Round 1', 'DFB_Pokal');
    const coppaItaliaRound1 = generateCupDraw(newItaTeams, 'Round 1', 'Coppa_Italia');

    const faCupFixtures = faCupRound1.map(m => ({ ...m, week: 5 }));
    const carabaoCupFixtures = carabaoCupRound1.map(m => ({ ...m, week: 2 }));
    const copaDelReyFixtures = copaDelReyRound1.map(m => ({ ...m, week: 3 }));
    const dfbPokalFixtures = dfbPokalRound1.map(m => ({ ...m, week: 4 }));
    const coppaItaliaFixtures = coppaItaliaRound1.map(m => ({ ...m, week: 5 }));

    // 5.5 Generate European & South American Competitions (Dynamic Qualification)
    const getTopTeams = (lid: LeagueId, count: number) => {
        const table = currentState.leagueTables[lid];
        if (!table) return [];
        return [...table].sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference)
            .slice(0, count)
            .map(row => teamsAfterProRel.find(t => t.id === row.teamId))
            .filter(Boolean) as Team[];
    };

    // Champions League Qualification (36 teams for 2026 format)
    const clTeams = [
        ...getTopTeams(LeagueId.PREMIER_LEAGUE, 7),
        ...getTopTeams(LeagueId.LA_LIGA, 7),
        ...getTopTeams(LeagueId.BUNDESLIGA, 7),
        ...getTopTeams(LeagueId.SERIE_A, 7),
        ...getTopTeams(LeagueId.LIGUE_1, 6),
        ...getTopTeams(LeagueId.LIGA_ARGENTINA, 1), // Wildcards or prestige
        ...getTopTeams(LeagueId.BRASILEIRAO, 1)
    ].slice(0, 36);

    // Copa Libertadores Qualification (32 teams)
    const libTeams = [
        ...getTopTeams(LeagueId.LIGA_ARGENTINA, 12),
        ...getTopTeams(LeagueId.BRASILEIRAO, 12),
        ...getTopTeams(LeagueId.LIGA_ARGENTINA, 4), // Extra spots from lower ranks
        ...getTopTeams(LeagueId.BRASILEIRAO, 4)
    ].slice(0, 32);

    const clSwiss = generateSwissPhase(clTeams, 'Champions_League', 8); // 8 matches as per real 2026 format
    const libGroups = generateGroupPhase(libTeams, 'Copa_Libertadores'); 

    const clFixtures = clSwiss.fixtures.map(m => ({ ...m, week: m.week + 5, isMidweek: true }));
    
    // Libertadores group fixtures
    const libGroupFixtures: Match[] = [];
    libGroups.forEach(g => {
        g.fixtures.forEach(f => {
            libGroupFixtures.push({ ...f, week: f.week + 4, isMidweek: true });
        });
    });

    // Intercontinental Cup
    const lastLibertadoresWinner = currentState.cups.copaLibertadores.winnerId;
    const lastChampionsWinner = currentState.cups.championsLeague.winnerId;
    
    let intercontinentalFixtures: Match[] = [];
    if (lastLibertadoresWinner && lastChampionsWinner) {
        const teamA = teamsAfterProRel.find(t => t.id === lastLibertadoresWinner);
        const teamB = teamsAfterProRel.find(t => t.id === lastChampionsWinner);
        if (teamA && teamB) {
            intercontinentalFixtures = [{
                week: 2, // Jugar en la semana 2 de la nueva temporada
                homeTeamId: teamA.id,
                awayTeamId: teamB.id,
                competition: 'Copa_Intercontinental',
                isCupMatch: true,
                isMidweek: true
            }];
        }
    }

    const fullSchedule = [
        ...newSeasonSchedule, 
        ...faCupFixtures, ...carabaoCupFixtures, ...copaDelReyFixtures, ...dfbPokalFixtures, ...coppaItaliaFixtures,
        ...clFixtures, ...libGroupFixtures, ...intercontinentalFixtures
    ];

    // 6. Create news items
    const proRelNews: NewsItem = {
        id: `pro_rel_${newSeasonYear}`,
        headline: `🔄 Ascensos y Descensos Globales - Temporada ${newSeasonYear}`,
        body: `Resumen de movimientos en las ligas:\n${allMovementNews.join('\n')}`,
        date: formatDate(newDate),
        type: 'standard'
    };

    const seasonNews: NewsItem = {
        id: `season_start_${newSeasonYear}`,
        headline: `Temporada ${newSeasonYear}-${newSeasonYear + 1}`,
        body: `La pretemporada ha terminado. Los veteranos se han retirado y nuevas caras llegan desde la cantera. ¡Objetivo: Ganar!`,
        date: formatDate(newDate),
        type: 'standard'
    };

    const awardNewsItems: NewsItem[] = [];
    if (ballonDorWinner) {
        awardNewsItems.push({
            id: `ballondor_${newSeasonYear}`,
            headline: `🏆 Balón de Oro ${newSeasonYear}`,
            body: `¡${ballonDorWinner.name} ha sido galardonado con el Balón de Oro tras una temporada estelar!`,
            date: formatDate(newDate),
            type: 'standard'
        });
    }
    if (goldenBootWinner) {
        awardNewsItems.push({
            id: `goldenboot_${newSeasonYear}`,
            headline: `👟 Bota de Oro ${newSeasonYear}`,
            body: `¡${goldenBootWinner.name} gana la Bota de Oro con ${maxGoals} goles en la liga!`,
            date: formatDate(newDate),
            type: 'standard'
        });
    }

    // 7. Calculate fan approval changes based on season performance and promises
    const playerPosition = sortedPL.find(row => row.teamId === updatedPlayerTeam.id)?.position ||
        sortedCH.find(row => row.teamId === updatedPlayerTeam.id)?.position || 10;

    let approvalDelta = 0;
    if (playerPosition <= 4) approvalDelta = 15;
    else if (playerPosition <= 6) approvalDelta = 10;
    else if (playerPosition >= 18) approvalDelta = -20;
    else if (playerPosition <= 10) approvalDelta = 5;
    else approvalDelta = -5;

    // Evaluate Electoral Promises
    let promisesDelta = 0;
    let promiseNewsBody = '';
    const updatedPromises = currentState.electoralPromises.map(promise => {
        if (promise.fulfilled) return promise; // Already fulfilled

        let newlyFulfilled = false;
        
        if (promise.type === 'league_position') {
            const targetPos = parseInt(String(promise.target), 10);
            if (!isNaN(targetPos) && playerPosition <= targetPos) {
                newlyFulfilled = true;
            }
        } else if (promise.type === 'trophy') {
            const wonFaCup = currentState.cups.faCup.winnerId === updatedPlayerTeam.id;
            const wonCarabaoCup = currentState.cups.carabaoCup.winnerId === updatedPlayerTeam.id;
            const wonLeague = playerPosition === 1;
            
            if (String(promise.target).includes('Cup') && (wonFaCup || wonCarabaoCup)) newlyFulfilled = true;
            if (String(promise.target).includes('League') && wonLeague) newlyFulfilled = true;
            if (promise.target === 'Any' && (wonFaCup || wonCarabaoCup || wonLeague)) newlyFulfilled = true;
        } else if (promise.type === 'finances') {
             // Let's assume a generic finance target logic if it existed, for now just skip or resolve based on balance
             if (currentState.finances.balance > Number(promise.target)) newlyFulfilled = true;
        }

        if (newlyFulfilled) {
            promisesDelta += promise.impact;
            promiseNewsBody += `✅ Promesa cumplida: ${promise.description} (+${promise.impact} aprobación)\\n`;
            return { ...promise, fulfilled: true };
        } else if (currentState.season >= promise.deadline) {
            // Failed to fulfill by deadline
            promisesDelta -= promise.impact;
            promiseNewsBody += `❌ Promesa incumplida: ${promise.description} (-${promise.impact} aprobación)\\n`;
            // Keep it as unfulfilled but maybe mark as failed or just leave it. The impact is applied once.
            // We should ideally remove it or mark it failed, but let's just leave it and increase the season deadline to avoid double penalty next year if not removed.
            return { ...promise, deadline: promise.deadline + 100 }; // hack to not penalize again
        }
        
        return promise;
    });
    
    // Add Promise News if any
    let finalNewsFeed = [proRelNews, seasonNews, ...awardNewsItems, ...currentState.newsFeed];
    if (promiseNewsBody) {
        finalNewsFeed.unshift({
            id: `promises_${newSeasonYear}`,
            headline: `📊 Evaluación de Promesas Electorales`,
            body: promiseNewsBody,
            date: formatDate(newDate),
            type: promisesDelta >= 0 ? 'achievement' : 'warning'
        });
    }

    approvalDelta += promisesDelta;

    // 8. Calculate Prize Money & Sponsorship Bonuses
    const prizeMoney = calculatePrizeMoney(currentState.team.leagueId, playerPosition);
    
    let sponsorshipBonuses = 0;
    let bonusMessages: string[] = [];
    
    currentState.sponsors.forEach(sponsor => {
        if (sponsor.bonus) {
            let achieved = false;
            if (sponsor.bonus.condition === 'top4' && playerPosition <= 4) achieved = true;
            else if (sponsor.bonus.condition === 'top6' && playerPosition <= 6) achieved = true;
            else if (sponsor.bonus.condition === 'promotion' && promotedIds.includes(currentState.team.id)) achieved = true;
            
            if (achieved) {
                sponsorshipBonuses += sponsor.bonus.amount;
                bonusMessages.push(`Bono por ${sponsor.name}: +${formatCurrency(sponsor.bonus.amount)}`);
            }
        }
    });

    const totalEndSeasonIncome = prizeMoney + sponsorshipBonuses;
    const newBalance = currentState.finances.balance + totalEndSeasonIncome;

    const prizeNews: NewsItem = {
        id: `prize_${newSeasonYear}`,
        headline: `💰 Balance de Final de Temporada`,
        body: `Premios de Liga: ${formatCurrency(prizeMoney)} por terminar ${playerPosition}º.\n${bonusMessages.join('\n')}\nTotal ingresado: ${formatCurrency(totalEndSeasonIncome)}`,
        date: formatDate(newDate),
        type: 'achievement'
    };
    finalNewsFeed.unshift(prizeNews);

    const newRating = Math.max(0, Math.min(100, currentState.fanApproval.rating + approvalDelta));
    const trend: 'rising' | 'stable' | 'falling' =
        approvalDelta > 5 ? 'rising' : approvalDelta < -5 ? 'falling' : 'stable';

    // 7.5 Generar Eventos Cinematográficos
    const newCinematicQueue = [...(currentState.cinematicQueue || [])];
    
    // Check if player qualified for Champions League
    const playerInCL = clTeams.find(t => t.id === updatedPlayerTeam.id);
    if (playerInCL) {
        const playerOpponents = clFixtures
            .filter(m => m.homeTeamId === updatedPlayerTeam.id || m.awayTeamId === updatedPlayerTeam.id)
            .map(m => {
                const isHome = m.homeTeamId === updatedPlayerTeam.id;
                const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                return {
                    name: teamsAfterProRel.find(t => t.id === opponentId)?.name || 'Desconocido',
                    venue: isHome ? 'home' : 'away'
                };
            });

        newCinematicQueue.push({
            id: `cinematic_cl_draw_${newSeasonYear}`,
            type: 'GROUP_DRAW',
            title: `UEFA Champions League`,
            subtitle: `Sorteo de Fase de Liga 2026`,
            metadata: {
                accentColor: '#3b82f6',
                swissOpponents: playerOpponents
            }
        });
    }

    // Check if player qualified for Libertadores
    const playerInLib = libTeams.find(t => t.id === updatedPlayerTeam.id);
    if (playerInLib) {
        const playerGroup = libGroups.find(g => g.teams.includes(updatedPlayerTeam.id));
        if (playerGroup) {
            newCinematicQueue.push({
                id: `cinematic_lib_draw_${newSeasonYear}`,
                type: 'GROUP_DRAW',
                title: `Copa Libertadores`,
                subtitle: `Sorteo de Fase de Grupos`,
                metadata: {
                    accentColor: '#facc15',
                    groups: [{
                        name: playerGroup.name,
                        teams: playerGroup.teams.map(tid => ({
                            name: teamsAfterProRel.find(t => t.id === tid)?.name || 'Desconocido',
                            isPlayer: tid === updatedPlayerTeam.id
                        }))
                    }]
                }
            });
        }
    }

    // Season summary (always at the end of the queue)
    newCinematicQueue.push({
        id: `cinematic_summary_${newSeasonYear}`,
        type: 'SEASON_SUMMARY',
        title: `Resumen de Temporada ${currentSeason}`,
        subtitle: `Resultados finales y premios`,
        metadata: {
            position: playerPosition,
            promoted: promotedTeams,
            relegated: relegatedTeams,
            balance: newBalance
        }
    });

    // 8. Return updated state
    return {
        ...currentState,
        team: updatedPlayerTeamWithTrophies,
        allTeams: teamsAfterProRel,
        youthAcademy: updatedAcademy,
        season: newSeasonYear,
        currentDate: newDate,
        currentWeek: 0,
        schedule: fullSchedule,
        leagueTables: newLeagueTables,
        newsFeed: finalNewsFeed.slice(0, 20),
        electoralPromises: updatedPromises,
        mandate: {
            ...currentState.mandate,
            currentYear: currentState.mandate.currentYear >= 4
                ? currentState.mandate.currentYear
                : currentState.mandate.currentYear + 1,
            isElectionYear: currentState.mandate.currentYear + 1 > 4,
            nextElectionSeason: currentState.mandate.currentYear + 1 > 4
                ? newSeasonYear
                : currentState.mandate.nextElectionSeason
        },
        fanApproval: {
            ...currentState.fanApproval,
            rating: newRating,
            trend
        },
        cups: {
            faCup: {
                id: 'fa_cup', name: 'FA Cup', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: faCupFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.faCup.statistics?.championsHistory || [] }
            },
            carabaoCup: {
                id: 'carabao_cup', name: 'Carabao Cup', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: carabaoCupFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.carabaoCup.statistics?.championsHistory || [] }
            },
            copaDelRey: {
                id: 'copa_del_rey', name: 'Copa del Rey', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: copaDelReyFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.copaDelRey?.statistics?.championsHistory || [] }
            },
            dfbPokal: {
                id: 'dfb_pokal', name: 'DFB-Pokal', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: dfbPokalFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.dfbPokal?.statistics?.championsHistory || [] }
            },
            coppaItalia: {
                id: 'coppa_italia', name: 'Coppa Italia', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: coppaItaliaFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.coppaItalia?.statistics?.championsHistory || [] }
            },
            championsLeague: {
                id: 'champions_league', name: 'Champions League', 
                type: 'swiss', phase: 'swiss',
                swissTable: clSwiss.table, 
                swissFixtures: clFixtures,
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.championsLeague?.statistics?.championsHistory || [] }
            },
            europaLeague: {
                id: 'europa_league', name: 'Europa League', 
                type: 'swiss', phase: 'swiss',
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.europaLeague?.statistics?.championsHistory || [] }
            },
            copaLibertadores: {
                id: 'copa_libertadores', name: 'Copa Libertadores', 
                type: 'groups', phase: 'groups',
                groups: libGroups,
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.copaLibertadores?.statistics?.championsHistory || [] }
            },
            copaIntercontinental: {
                id: 'copa_intercontinental', name: 'Copa Intercontinental', 
                type: 'knockout', phase: 'knockout',
                rounds: intercontinentalFixtures.length > 0 ? [{ name: 'Final', fixtures: intercontinentalFixtures, completed: false }] : [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.copaIntercontinental?.statistics?.championsHistory || [] }
            }
        },
        finances: {
            ...currentState.finances,
            balance: newBalance
        },
        availableSponsors: generateSponsorMarket(updatedPlayerTeam.tier),
        cinematicQueue: newCinematicQueue
    };
}
