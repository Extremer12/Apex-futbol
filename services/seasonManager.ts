/**
 * Season Manager Service
 * Handles season transitions, aging, retirements, and promotion/relegation
 */

import { GameState, Team, Player, NewsItem } from '../types';
import { generateYouthPlayer, generateSeasonSchedule, generateCupDraw, createInitialLeagueTable, handlePromotionRelegation } from './simulation';
import { formatDate } from '../utils';

/**
 * Processes the transition to a new season
 * Handles aging, retirements, regens, promotion/relegation, and schedule generation
 */
export function startNewSeason(currentState: GameState): GameState {
    const newSeasonYear = currentState.season + 1;
    const newDate = new Date(`${newSeasonYear}-07-01`);

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

    const newLeagueTables = {
        PREMIER_LEAGUE: createInitialLeagueTable(newPlTeams),
        CHAMPIONSHIP: createInitialLeagueTable(newChTeams),
        LA_LIGA: createInitialLeagueTable(newLaTeams)
    };

    // 5. Generate new cup draws (ONLY English teams for English cups)
    const englishTeamsNewSeason = [...newPlTeams, ...newChTeams];
    const faCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'FA_Cup');
    const carabaoCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'Carabao_Cup');

    const faCupFixtures = faCupRound1.map(m => ({ ...m, week: 5 }));
    const carabaoCupFixtures = carabaoCupRound1.map(m => ({ ...m, week: 2 }));

    const fullSchedule = [...newSeasonSchedule, ...faCupFixtures, ...carabaoCupFixtures];

    // 6. Create news items
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

    // 7. Calculate fan approval changes based on season performance
    const playerPosition = sortedPL.find(row => row.teamId === updatedPlayerTeam.id)?.position ||
        sortedCH.find(row => row.teamId === updatedPlayerTeam.id)?.position || 10;

    let approvalDelta = 0;
    if (playerPosition <= 4) approvalDelta = 15;
    else if (playerPosition <= 6) approvalDelta = 10;
    else if (playerPosition >= 18) approvalDelta = -20;
    else if (playerPosition <= 10) approvalDelta = 5;
    else approvalDelta = -5;

    const newRating = Math.max(0, Math.min(100, currentState.fanApproval.rating + approvalDelta));
    const trend: 'rising' | 'stable' | 'falling' =
        approvalDelta > 5 ? 'rising' : approvalDelta < -5 ? 'falling' : 'stable';

    // 8. Return updated state
    return {
        ...currentState,
        team: updatedPlayerTeam,
        allTeams: processedTeams,
        youthAcademy: updatedAcademy,
        season: newSeasonYear,
        currentDate: newDate,
        currentWeek: 0,
        schedule: fullSchedule,
        leagueTables: newLeagueTables,
        newsFeed: [proRelNews, seasonNews, ...currentState.newsFeed].slice(0, 20),
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
                id: 'fa_cup',
                name: 'FA Cup',
                rounds: [{ name: 'Round 1', fixtures: faCupFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: {
                    topScorers: [],
                    championsHistory: currentState.cups.faCup.statistics?.championsHistory || []
                }
            },
            carabaoCup: {
                id: 'carabao_cup',
                name: 'Carabao Cup',
                rounds: [{ name: 'Round 1', fixtures: carabaoCupFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: {
                    topScorers: [],
                    championsHistory: currentState.cups.carabaoCup.statistics?.championsHistory || []
                }
            }
        },
        availableSponsors: [] // Reset sponsor market (will be regenerated)
    };
}
