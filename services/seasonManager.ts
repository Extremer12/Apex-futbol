/**
 * Season Manager Service
 * Handles season transitions, aging, retirements, and promotion/relegation
 */

import { GameState, Team, Player, NewsItem, EuropeanCompetition, EuropeanTableRow } from '../types';
import { generateYouthPlayer, generateSeasonSchedule, generateCupDraw, createInitialLeagueTable, handlePromotionRelegation, generateSwissDraw, createInitialEuropeanTable } from './simulation';
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

    // Cups
    if (currentState.cups.faCup.winnerId) {
        trophiesToAward.push({ teamId: currentState.cups.faCup.winnerId, name: 'FA Cup', type: 'cup' });
    }
    if (currentState.cups.carabaoCup.winnerId) {
        trophiesToAward.push({ teamId: currentState.cups.carabaoCup.winnerId, name: 'Carabao Cup', type: 'cup' });
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

    // 3. Process Promotion/Relegation (English leagues only)
    const sortedPL = [...currentState.leagueTables.PREMIER_LEAGUE].sort(
        (a, b) => b.points - a.points || b.goalDifference - a.goalDifference
    );
    const sortedCH = [...currentState.leagueTables.CHAMPIONSHIP].sort(
        (a, b) => b.points - a.points || b.goalDifference - a.goalDifference
    );

    const relegatedIds = sortedPL.slice(-3).map(row => row.teamId);
    const promotedIds = sortedCH.slice(0, 3).map(row => row.teamId);

    const relegatedTeams = relegatedIds
        .map(id => processedTeams.find(t => t.id === id)?.name || 'Unknown')
        .filter(Boolean);
    const promotedTeams = promotedIds
        .map(id => processedTeams.find(t => t.id === id)?.name || 'Unknown')
        .filter(Boolean);

    const teamsAfterProRel = handlePromotionRelegation(
        processedTeams,
        currentState.leagueTables.PREMIER_LEAGUE,
        currentState.leagueTables.CHAMPIONSHIP
    );

    // 4. Generate new season schedule and tables
    const newSeasonSchedule = generateSeasonSchedule(teamsAfterProRel);
    const newPlTeams = teamsAfterProRel.filter(t => t.leagueId === 'PREMIER_LEAGUE');
    const newChTeams = teamsAfterProRel.filter(t => t.leagueId === 'CHAMPIONSHIP');
    const newLaTeams = teamsAfterProRel.filter(t => t.leagueId === 'LA_LIGA');
    const newGerTeams = teamsAfterProRel.filter(t => t.leagueId === 'BUNDESLIGA');
    const newItaTeams = teamsAfterProRel.filter(t => t.leagueId === 'SERIE_A');

    const newLeagueTables = {
        PREMIER_LEAGUE: createInitialLeagueTable(newPlTeams),
        CHAMPIONSHIP: createInitialLeagueTable(newChTeams),
        LA_LIGA: createInitialLeagueTable(newLaTeams),
        BUNDESLIGA: createInitialLeagueTable(newGerTeams),
        SERIE_A: createInitialLeagueTable(newItaTeams)
    };

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

    // 5.5 Generate European Competitions
    // Get top 8 from each league for Champions League (32 teams)
    const clTeams = [
        ...[...currentState.leagueTables.PREMIER_LEAGUE].sort((a,b)=>b.points-a.points).slice(0, 8),
        ...[...currentState.leagueTables.LA_LIGA].sort((a,b)=>b.points-a.points).slice(0, 8),
        ...[...currentState.leagueTables.BUNDESLIGA].sort((a,b)=>b.points-a.points).slice(0, 8),
        ...[...currentState.leagueTables.SERIE_A].sort((a,b)=>b.points-a.points).slice(0, 8)
    ].map(row => teamsAfterProRel.find(t => t.id === row.teamId)).filter(Boolean) as Team[];

    // Next 8 from each league for Europa League (32 teams)
    const elTeams = [
        ...[...currentState.leagueTables.PREMIER_LEAGUE].sort((a,b)=>b.points-a.points).slice(8, 16),
        ...[...currentState.leagueTables.LA_LIGA].sort((a,b)=>b.points-a.points).slice(8, 16),
        ...[...currentState.leagueTables.BUNDESLIGA].sort((a,b)=>b.points-a.points).slice(8, 16),
        ...[...currentState.leagueTables.SERIE_A].sort((a,b)=>b.points-a.points).slice(8, 16)
    ].map(row => teamsAfterProRel.find(t => t.id === row.teamId)).filter(Boolean) as Team[];

    const clFixtures = generateSwissDraw(clTeams, 'Champions_League').map(m => ({ ...m, week: 2, isMidweek: true })); // They will be distributed in simulation
    const elFixtures = generateSwissDraw(elTeams, 'Europa_League').map(m => ({ ...m, week: 3, isMidweek: true }));

    const fullSchedule = [
        ...newSeasonSchedule, 
        ...faCupFixtures, ...carabaoCupFixtures, ...copaDelReyFixtures, ...dfbPokalFixtures, ...coppaItaliaFixtures,
        ...clFixtures, ...elFixtures
    ];

    // 6. Create news items
    const proRelNews: NewsItem = {
        id: `pro_rel_${newSeasonYear}`,
        headline: `🔄 Cambios en las Ligas - Temporada ${newSeasonYear}`,
        body: `⬆️ ASCENSOS: ${promotedTeams.join(', ')} suben a la Premier League.\n⬇️ DESCENSOS: ${relegatedTeams.join(', ')} descienden al Championship. ¡La nueva temporada promete emociones!`,
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
    
    // Check if player won league
    const playerLeagueWin = trophiesToAward.find(t => t.teamId === updatedPlayerTeam.id && t.type === 'league');
    if (playerLeagueWin) {
        newCinematicQueue.push({
            id: `cinematic_league_win_${newSeasonYear}`,
            type: 'LEAGUE_WIN',
            title: `¡CAMPEONES!`,
            subtitle: `Has ganado la ${playerLeagueWin.name}`
        });
    }

    // Check promotion/relegation for player
    if (promotedIds.includes(updatedPlayerTeam.id)) {
        newCinematicQueue.push({
            id: `cinematic_promotion_${newSeasonYear}`,
            type: 'PROMOTION',
            title: `¡ASCENSO CONSEGUIDO!`,
            subtitle: `El ${updatedPlayerTeam.name} jugará en la Primera División`
        });
    } else if (relegatedIds.includes(updatedPlayerTeam.id)) {
        newCinematicQueue.push({
            id: `cinematic_relegation_${newSeasonYear}`,
            type: 'RELEGATION',
            title: `DESCENSO...`,
            subtitle: `Temporada para el olvido. Volvemos a Segunda.`
        });
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
                id: 'fa_cup', name: 'FA Cup', rounds: [{ name: 'Round 1', fixtures: faCupFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.faCup.statistics?.championsHistory || [] }
            },
            carabaoCup: {
                id: 'carabao_cup', name: 'Carabao Cup', rounds: [{ name: 'Round 1', fixtures: carabaoCupFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.carabaoCup.statistics?.championsHistory || [] }
            },
            copaDelRey: {
                id: 'copa_del_rey', name: 'Copa del Rey', rounds: [{ name: 'Round 1', fixtures: copaDelReyFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.copaDelRey?.statistics?.championsHistory || [] }
            },
            dfbPokal: {
                id: 'dfb_pokal', name: 'DFB-Pokal', rounds: [{ name: 'Round 1', fixtures: dfbPokalFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.dfbPokal?.statistics?.championsHistory || [] }
            },
            coppaItalia: {
                id: 'coppa_italia', name: 'Coppa Italia', rounds: [{ name: 'Round 1', fixtures: coppaItaliaFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: currentState.cups.coppaItalia?.statistics?.championsHistory || [] }
            },
            championsLeague: {
                id: 'champions_league', name: 'Champions League', participants: clTeams.map(t => t.id),
                leagueTable: createInitialEuropeanTable(clTeams.map(t => t.id)), leagueFixtures: clFixtures, knockoutRounds: [], currentPhase: 'league', currentRoundIndex: 0
            },
            europaLeague: {
                id: 'europa_league', name: 'Europa League', participants: elTeams.map(t => t.id),
                leagueTable: createInitialEuropeanTable(elTeams.map(t => t.id)), leagueFixtures: elFixtures, knockoutRounds: [], currentPhase: 'league', currentRoundIndex: 0
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
