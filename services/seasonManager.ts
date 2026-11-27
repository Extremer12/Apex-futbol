/**
 * Season Manager Service
 * Handles season transitions, aging, retirements, and promotion/relegation
 */

import { GameState, Team, Player, NewsItem, Match, CupCompetition, LeagueId, SeasonHistoryRecord, LeagueTableRow } from '../types';
import { generateYouthPlayer, generateSeasonSchedule, createInitialLeagueTable, handlePromotionRelegation, sortArgentineZones, simulateMacroMatch, PROMOTION_RELEGATION_PAIRS, getPromotionRelegationSlots, finalizeSeasonCompetitions } from './simulation';
import { computeArgentineRelegation } from './argentinaRegulations';
import { calculatePrizeMoney, evaluateSponsorshipClauses, generateSponsorMarket, isCalendarYearSeasonLeague, isSouthAmericanClubLeague, isNorthAmericanClubLeague } from './economy';
import { generateClubMembership, applyMembershipEventBoost } from './membership';
import { generateCoachMarket } from './coaching';
import { generateStaffMarket, generateScoutMarket } from './staffService';
import { awardPresidentXp, getPresidentialStyleModifiers } from './presidentialProgression';
import { formatDate, formatCurrency } from '../utils';
import { evaluateAchievements } from './achievementService';
import { buildSeasonCompetitions } from './competitionFactory';
import { SOUTH_AMERICAN_EXTRA_TEAMS } from '../data/teams/southAmericanClubs';
import { processFullSeasonSquadProgression } from './squadProgressionService';
import { getLeagueCountryCode } from './nationalityService';
import { MAX_FIRST_TEAM_SIZE, MAX_RESERVE_SIZE } from './squadRules';

/**
 * Processes the transition to a new season
 * Handles aging, retirements, regens, promotion/relegation, and schedule generation
 */
export function startNewSeason(currentState: GameState): GameState {
    const isSouthAmerica = isCalendarYearSeasonLeague(currentState.team.leagueId);

    const newSeasonYear = currentState.season + 1;
    const newDate = isSouthAmerica 
        ? new Date(`${newSeasonYear}-01-15T12:00:00`) 
        : new Date(`${newSeasonYear}-08-10T12:00:00`);

    // 1. Process Aging, Progressive Decline, Retirements, Regens, and AI Transfers (including User Reserve/Academy)
    const {
        updatedTeams: processedTeams,
        updatedUserReserve,
        retiredLegends,
        notableTransfers,
        regensCount
    } = processFullSeasonSquadProgression(currentState.allTeams, currentState.team.id, currentState.youthAcademy || []);

    const updatedPlayerTeam = processedTeams.find(t => t.id === currentState.team.id)!;
    const homeCountry = getLeagueCountryCode(updatedPlayerTeam.leagueId);

    // 2. Refresh Player Reserve & Academy (keep developed players + add domestic prospects up to MAX_RESERVE_SIZE)
    let updatedAcademy: Player[] = updatedUserReserve.slice(0, MAX_RESERVE_SIZE);
    let youthBlockedByFullRoster = false;

    const youthCoach = currentState.team.clubStaff?.youthCoach || updatedPlayerTeam.clubStaff?.youthCoach;
    const youthBonus = youthCoach ? Math.max(0, Math.min(12, Math.round(((youthCoach.power - 50) / 50) * 10))) : 0;
    const youthInvestment = currentState.finances?.clubDirectives?.youthInvestment;
    const directiveBonus = youthInvestment === 'high' ? 6 : youthInvestment === 'medium' ? 3 : 0;
    const styleYouthBonus = getPresidentialStyleModifiers(currentState.playerProfile?.style).youthBonus;
    const totalYouthBonus = youthBonus + directiveBonus + styleYouthBonus;
    const desiredProspects = (youthInvestment === 'high' ? 4 : 3) + Math.floor(Math.random() * 2);

    if (updatedPlayerTeam.squad.length >= MAX_FIRST_TEAM_SIZE && updatedAcademy.length >= MAX_RESERVE_SIZE) {
        youthBlockedByFullRoster = true;
    } else {
        for (let i = 0; i < desiredProspects; i++) {
            if (updatedAcademy.length >= MAX_RESERVE_SIZE) break;
            updatedAcademy.push(generateYouthPlayer(updatedPlayerTeam.tier, totalYouthBonus, homeCountry));
        }
    }

    // 2.1 Clone and finalize ALL remaining unplayed league matches across ALL 26 leagues
    // and re-sort every table BEFORE crowning champions, awarding trophies, or computing promotion/relegation
    const workingLeagueTables: Record<LeagueId, LeagueTableRow[]> = {} as Record<LeagueId, LeagueTableRow[]>;
    Object.entries(currentState.leagueTables || {}).forEach(([lid, rows]) => {
        workingLeagueTables[lid as LeagueId] = (rows || []).map(r => ({
            ...r,
            form: [...(r.form || [])]
        }));
    });
    const workingSchedule: Match[] = (currentState.schedule || []).map(m => ({ ...m }));
    const workingCups: GameState['cups'] = { ...currentState.cups };

    const unplayedLeagueMatches = workingSchedule.filter(m => m.result === undefined && !m.isCupMatch);
    if (unplayedLeagueMatches.length > 0) {
        const teamMap = new Map<number, Team>(processedTeams.map(t => [t.id, t]));
        const tableRowIndex = new Map<LeagueId, Map<number, LeagueTableRow>>();
        Object.entries(workingLeagueTables).forEach(([lid, rows]) => {
            tableRowIndex.set(lid as LeagueId, new Map(rows.map(r => [r.teamId, r])));
        });

        unplayedLeagueMatches.forEach(m => {
            const hTeam = teamMap.get(m.homeTeamId);
            const aTeam = teamMap.get(m.awayTeamId);
            if (!hTeam || !aTeam) return;

            const leagueRowsMap = tableRowIndex.get(hTeam.leagueId as LeagueId);
            const hRow = leagueRowsMap?.get(hTeam.id);
            const aRow = leagueRowsMap?.get(aTeam.id);

            const simResult = simulateMacroMatch(hTeam, aTeam, hRow, aRow, false);
            const hScore = simResult.homeScore;
            const aScore = simResult.awayScore;

            m.result = {
                homeScore: hScore,
                awayScore: aScore,
                events: simResult.events,
                scorers: simResult.scorers
            };

            if (hRow && aRow) {
                hRow.played++; aRow.played++;
                hRow.goalsFor += hScore;
                hRow.goalsAgainst += aScore;
                aRow.goalsFor += aScore;
                aRow.goalsAgainst += hScore;
                hRow.goalDifference = hRow.goalsFor - hRow.goalsAgainst;
                aRow.goalDifference = aRow.goalsFor - aRow.goalsAgainst;

                if (hScore > aScore) {
                    hRow.won++; hRow.points += 3;
                    aRow.lost++;
                    hRow.form.unshift('W');
                    aRow.form.unshift('L');
                } else if (aScore > hScore) {
                    aRow.won++; aRow.points += 3;
                    hRow.lost++;
                    aRow.form.unshift('W');
                    hRow.form.unshift('L');
                } else {
                    hRow.drawn++; hRow.points += 1;
                    aRow.drawn++; aRow.points += 1;
                    hRow.form.unshift('D');
                    aRow.form.unshift('D');
                }
                hRow.playedTotal = (hRow.playedTotal || 0) + 1;
                hRow.pointsTotal = (hRow.pointsTotal || 0) + (hScore > aScore ? 3 : hScore === aScore ? 1 : 0);
                hRow.promedio = Number((hRow.pointsTotal / Math.max(1, hRow.playedTotal)).toFixed(3));
                aRow.playedTotal = (aRow.playedTotal || 0) + 1;
                aRow.pointsTotal = (aRow.pointsTotal || 0) + (aScore > hScore ? 3 : hScore === aScore ? 1 : 0);
                aRow.promedio = Number((aRow.pointsTotal / Math.max(1, aRow.playedTotal)).toFixed(3));
            }
        });
    }

    // Re-sort all 26 league tables accurately after finishing remaining fixtures
    (Object.keys(workingLeagueTables) as LeagueId[]).forEach(lid => {
        const sorted = [...workingLeagueTables[lid]].sort(
            (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
        );
        sorted.forEach((row, idx) => {
            row.position = idx + 1;
        });
        workingLeagueTables[lid] = sorted;
    });

    // 2.2 Ensure all cup & playoff competitions are finalized before awarding trophies
    finalizeSeasonCompetitions(workingCups, processedTeams, workingSchedule);

    // 2.3 Crown League & Cup Champions from settled tables/cups
    const currentSeason = currentState.season;
    const trophiesToAward: { teamId: number, name: string, type: 'league' | 'cup' }[] = [];

    const LEAGUE_TROPHY_NAMES: Record<string, string> = {
        [LeagueId.PREMIER_LEAGUE]: 'Premier League',
        [LeagueId.CHAMPIONSHIP]: 'Championship',
        [LeagueId.LA_LIGA]: 'LaLiga EA Sports',
        [LeagueId.SEGUNDA_DIVISION_ESP]: 'LaLiga Hypermotion',
        [LeagueId.BUNDESLIGA]: 'Bundesliga',
        [LeagueId.ZWEITE_BUNDESLIGA]: '2. Bundesliga',
        [LeagueId.SERIE_A]: 'Serie A',
        [LeagueId.SERIE_B_ITA]: 'Serie B',
        [LeagueId.LIGUE_1]: 'Ligue 1',
        [LeagueId.LIGUE_2]: 'Ligue 2',
        [LeagueId.LIGA_ARGENTINA]: 'Liga Argentina (Tabla Anual)',
        [LeagueId.PRIMERA_NACIONAL]: 'Primera Nacional',
        [LeagueId.BRASILEIRAO]: 'Brasileirão Série A',
        [LeagueId.SERIE_B_BR]: 'Brasileirão Série B',
        [LeagueId.COPA_DE_PRIMERA]: 'Copa de Primera (Paraguay)',
        [LeagueId.LIGA_MX]: 'Liga MX',
        [LeagueId.LIGA_EXPANSION_MX]: 'Liga de Expansión MX',
        [LeagueId.PRIMERA_DIVISION_CHILE]: 'Primera División de Chile',
        [LeagueId.PRIMERA_B_CHILE]: 'Primera B de Chile',
        [LeagueId.PRIMERA_A_COLOMBIA]: 'Liga BetPlay (Primera A Colombia)',
        [LeagueId.PRIMERA_B_COLOMBIA]: 'Torneo BetPlay (Primera B Colombia)',
        [LeagueId.PRIMEIRA_LIGA]: 'Liga Portugal Betclic',
        [LeagueId.EREDIVISIE]: 'Eredivisie',
        [LeagueId.LIGA_URUGUAYA]: 'Liga AUF Uruguaya',
        [LeagueId.LIGA_ECUADOR]: 'LigaPro Serie A',
        [LeagueId.MLS]: 'Major League Soccer'
    };

    Object.entries(workingLeagueTables).forEach(([leagueId, table]) => {
        if (table.length > 0) {
            const winnerId = table[0].teamId;
            const leagueName = LEAGUE_TROPHY_NAMES[leagueId] || leagueId.replace(/_/g, ' ');
            trophiesToAward.push({ teamId: winnerId, name: leagueName, type: 'league' });
        }
    });

    const getCupWinnerId = (cup?: CupCompetition): number | null => {
        if (!cup) return null;
        if (cup.winnerId) return cup.winnerId;
        if (cup.rounds && cup.rounds.length > 0) {
            const lastRound = cup.rounds[cup.rounds.length - 1];
            if (lastRound.fixtures?.length === 1 && lastRound.fixtures[0].result) {
                const finalMatch = lastRound.fixtures[0];
                const hScore = finalMatch.result.homeScore;
                const aScore = finalMatch.result.awayScore;
                if (hScore > aScore) return finalMatch.homeTeamId;
                if (aScore > hScore) return finalMatch.awayTeamId;
                if (finalMatch.penalties) {
                    return finalMatch.penalties.home > finalMatch.penalties.away ? finalMatch.homeTeamId : finalMatch.awayTeamId;
                }
                if (finalMatch.result.penalties) {
                    return finalMatch.result.penalties.home > finalMatch.result.penalties.away ? finalMatch.homeTeamId : finalMatch.awayTeamId;
                }
            }
        }
        const histWinner = cup.statistics?.championsHistory?.[0];
        if (histWinner?.winnerId) return histWinner.winnerId;
        return null;
    };

    // National Cups
    const faWinner = getCupWinnerId(workingCups.faCup);
    if (faWinner) trophiesToAward.push({ teamId: faWinner, name: 'FA Cup', type: 'cup' });

    const carabaoWinner = getCupWinnerId(workingCups.carabaoCup);
    if (carabaoWinner) trophiesToAward.push({ teamId: carabaoWinner, name: 'Carabao Cup', type: 'cup' });

    const cdrWinner = getCupWinnerId(workingCups.copaDelRey);
    if (cdrWinner) trophiesToAward.push({ teamId: cdrWinner, name: 'Copa del Rey', type: 'cup' });

    const dfbWinner = getCupWinnerId(workingCups.dfbPokal);
    if (dfbWinner) trophiesToAward.push({ teamId: dfbWinner, name: 'DFB-Pokal', type: 'cup' });

    const ciWinner = getCupWinnerId(workingCups.coppaItalia);
    if (ciWinner) trophiesToAward.push({ teamId: ciWinner, name: 'Coppa Italia', type: 'cup' });

    const caWinner = getCupWinnerId(workingCups.copaArgentina);
    if (caWinner) trophiesToAward.push({ teamId: caWinner, name: 'Copa Argentina', type: 'cup' });

    const copaMxWinner = getCupWinnerId(workingCups.copaMx);
    if (copaMxWinner) trophiesToAward.push({ teamId: copaMxWinner, name: 'Copa MX', type: 'cup' });

    const apWinner = getCupWinnerId(workingCups.aperturaPlayoffs);
    if (apWinner) trophiesToAward.push({ teamId: apWinner, name: 'Torneo Apertura', type: 'league' });

    const clWinner = getCupWinnerId(workingCups.clausuraPlayoffs);
    if (clWinner) trophiesToAward.push({ teamId: clWinner, name: 'Torneo Clausura', type: 'league' });

    const paWinner = getCupWinnerId(workingCups.nacionalPrimerAscenso);
    if (paWinner) trophiesToAward.push({ teamId: paWinner, name: 'Primera Nacional (1º Ascenso)', type: 'cup' });

    const redWinner = getCupWinnerId(workingCups.nacionalReducido);
    if (redWinner) trophiesToAward.push({ teamId: redWinner, name: 'Torneo Reducido', type: 'cup' });

    // International Cups
    const uclWinner = getCupWinnerId(workingCups.championsLeague);
    if (uclWinner) trophiesToAward.push({ teamId: uclWinner, name: 'UEFA Champions League', type: 'cup' });

    const uelWinner = getCupWinnerId(workingCups.europaLeague);
    if (uelWinner) trophiesToAward.push({ teamId: uelWinner, name: 'UEFA Europa League', type: 'cup' });

    const libWinner = getCupWinnerId(workingCups.copaLibertadores);
    if (libWinner) trophiesToAward.push({ teamId: libWinner, name: 'Copa Libertadores', type: 'cup' });

    const sudWinner = getCupWinnerId(workingCups.copaSudamericana);
    if (sudWinner) trophiesToAward.push({ teamId: sudWinner, name: 'Copa Sudamericana', type: 'cup' });

    const intWinner = getCupWinnerId(workingCups.copaIntercontinental);
    if (intWinner) trophiesToAward.push({ teamId: intWinner, name: 'Copa Intercontinental', type: 'cup' });

    const recWinner = getCupWinnerId(workingCups.recopaSudamericana);
    if (recWinner) trophiesToAward.push({ teamId: recWinner, name: 'Recopa Sudamericana', type: 'cup' });

    const cwcWinner = getCupWinnerId(workingCups.clubWorldCup);
    if (cwcWinner) trophiesToAward.push({ teamId: cwcWinner, name: 'Mundial de Clubes FIFA', type: 'cup' });

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

    processedTeams.splice(0, processedTeams.length, ...teamsWithTrophies);

    // 2.4 Process Player Awards & Stats Reset
    let ballonDorWinner: Player | null = null;
    let goldenBootWinner: Player | null = null;
    let maxGoals = 0;
    let bestScore = 0;

    const allPlayers = processedTeams.flatMap(t => t.squad);

    allPlayers.forEach(p => {
        if (!p.stats) return;

        if (p.stats.goals > maxGoals) {
            maxGoals = p.stats.goals;
            goldenBootWinner = p;
        }

        const score = (p.stats.goals * 2) + p.stats.assists + (p.rating / 10) + (p.stats.appearances / 2);
        if (score > bestScore) {
            bestScore = score;
            ballonDorWinner = p;
        }

        const performanceBonus = (p.stats.goals * 0.4) + (p.stats.assists * 0.2);
        if (performanceBonus > 0) {
            p.value = Number((p.value + performanceBonus * 0.3).toFixed(1));
        }

        p.stats = { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 };
    });

    const updatedPlayerTeamWithTrophies = processedTeams.find(t => t.id === currentState.team.id)!;

    // 3. Process Promotion/Relegation from settled tables (All leagues)
    const teamsAfterProRel = handlePromotionRelegation(
        processedTeams,
        workingLeagueTables
    );

    const allMovementNews: string[] = [];
    PROMOTION_RELEGATION_PAIRS.forEach(([div1, div2]) => {
        const div1Table = workingLeagueTables[div1] || [];
        const div2Table = workingLeagueTables[div2] || [];
        if (div1Table.length > 0 && div2Table.length > 0) {
            const sorted1 = div1Table;
            const sorted2 = div2Table;

            let relegatedNames: string[] = [];
            let promotedNames: string[] = [];

            if (div1 === LeagueId.LIGA_ARGENTINA) {
                const relResult = computeArgentineRelegation(div1Table);
                relegatedNames = relResult.relegatedIds
                    .map(id => processedTeams.find(tm => tm.id === id)?.name)
                    .filter(Boolean) as string[];

                const promo1Id = workingCups.nacionalPrimerAscenso?.winnerId || div2Table.filter(r => r.zone === 'A').sort((a,b) => b.points - a.points)[0]?.teamId;
                const promo2Id = workingCups.nacionalReducido?.winnerId || div2Table.filter(r => r.zone === 'B').sort((a,b) => b.points - a.points)[0]?.teamId;
                if (promo1Id) {
                    const t = processedTeams.find(tm => tm.id === promo1Id);
                    if (t) promotedNames.push(t.name);
                }
                if (promo2Id && promo2Id !== promo1Id) {
                    const t = processedTeams.find(tm => tm.id === promo2Id);
                    if (t) promotedNames.push(t.name);
                }
            } else {
                const slots = [
                    LeagueId.PRIMERA_DIVISION_CHILE,
                    LeagueId.PRIMERA_A_COLOMBIA,
                    LeagueId.LIGA_MX,
                    LeagueId.BUNDESLIGA,
                    LeagueId.LIGUE_1
                ].includes(div1) ? 2 : (div1 === LeagueId.BRASILEIRAO ? 4 : 3);

                relegatedNames = sorted1.slice(-slots).map(r => processedTeams.find(t => t.id === r.teamId)?.name).filter(Boolean) as string[];
                promotedNames = sorted2.slice(0, slots).map(p => processedTeams.find(t => t.id === p.teamId)?.name).filter(Boolean) as string[];
            }

            if (relegatedNames.length > 0 || promotedNames.length > 0) {
                const leagueName = div1.replace(/_/g, ' ');
                allMovementNews.push(`${leagueName}: ⬆️ ${promotedNames.join(', ')} | ⬇️ ${relegatedNames.join(', ')}`);
            }
        }
    });

    // 4. Generate new season schedule and tables
    const argTeams = teamsAfterProRel.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA);
    sortArgentineZones(argTeams);
    const newSeasonSchedule = generateSeasonSchedule(teamsAfterProRel, newSeasonYear);

    const getLeagueTeams = (id: LeagueId) => teamsAfterProRel.filter(t => t.leagueId === id);

    const newLeagueTables: Record<LeagueId, LeagueTableRow[]> = {} as Record<LeagueId, LeagueTableRow[]>;
    Object.values(LeagueId).forEach(lid => {
        const teams = getLeagueTeams(lid);
        const initialTable = createInitialLeagueTable(teams);
        if (lid === LeagueId.LIGA_ARGENTINA) {
            const prevArgTable = workingLeagueTables[LeagueId.LIGA_ARGENTINA] || [];
            initialTable.forEach(row => {
                const prevRow = prevArgTable.find(r => r.teamId === row.teamId);
                if (prevRow) {
                    let playedTotal = (prevRow.playedTotal || 0) + prevRow.played;
                    let pointsTotal = (prevRow.pointsTotal || 0) + prevRow.points;
                    if (playedTotal > 96) {
                        const factor = 96 / playedTotal;
                        playedTotal = 96;
                        pointsTotal = Math.round(pointsTotal * factor);
                    }
                    row.playedTotal = playedTotal;
                    row.pointsTotal = pointsTotal;
                    row.promedio = playedTotal > 0 ? Number((pointsTotal / playedTotal).toFixed(3)) : 0;
                } else {
                    row.playedTotal = 0;
                    row.pointsTotal = 0;
                    row.promedio = 0;
                }
            });
        }
        newLeagueTables[lid] = initialTable;
    });

    // 5-5.5. Generate Domestic Cups & International Competitions
    const { cups: newSeasonCups, competitionFixtures } = buildSeasonCompetitions({
        allTeams: teamsAfterProRel,
        playerTeamId: currentState.team?.id,
        leagueTables: workingLeagueTables,
        previousCups: workingCups,
        completedSeason: currentSeason
    });

    const fullSchedule = [
        ...newSeasonSchedule,
        ...competitionFixtures
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
    const playerLeagueTable = workingLeagueTables[updatedPlayerTeam.leagueId] || [];
    const sortedPlayerLeague = playerLeagueTable;
    const playerPosition = sortedPlayerLeague.findIndex(row => row.teamId === updatedPlayerTeam.id) + 1 || 10;

    let approvalDelta = 0;
    if (playerPosition <= 4) approvalDelta = 15;
    else if (playerPosition <= 6) approvalDelta = 10;
    else if (playerPosition >= 18) approvalDelta = -20;
    else if (playerPosition <= 10) approvalDelta = 5;
    else approvalDelta = -5;

    // Evaluate Electoral Promises
    let promisesDelta = 0;
    let newlyFulfilledPromisesCount = 0;
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
            // Check if player's team won ANY cup competition in any country or Europe, or the league title
            const wonAnyCup = Object.values(currentState.cups || {}).some((cup: CupCompetition | undefined) => cup?.winnerId === updatedPlayerTeam.id);
            const wonLeague = playerPosition === 1;
            
            if (promise.target === 'QuarterFinal') {
                newlyFulfilled = wonAnyCup || playerPosition <= 8;
            } else if (String(promise.target).includes('Cup') && wonAnyCup) {
                newlyFulfilled = true;
            } else if (String(promise.target).includes('League') && wonLeague) {
                newlyFulfilled = true;
            } else if (promise.target === 'Any' && (wonAnyCup || wonLeague)) {
                newlyFulfilled = true;
            }
        } else if (promise.type === 'transfer') {
            // Check if user has signed a top rated player in the squad
            const minRating = Number(promise.target) || 80;
            const hasStarSigning = updatedPlayerTeam.squad.some(p => p.rating >= minRating);
            if (hasStarSigning) {
                newlyFulfilled = true;
            }
        } else if (promise.type === 'stadium') {
            // Check if stadium capacity increased or upgraded
            const hasExpanded = currentState.stadium && (
                (currentState.stadium.facilityLevel > 1) ||
                (currentState.stadium.capacity > (Number(promise.target) || 25000))
            );
            if (hasExpanded) {
                newlyFulfilled = true;
            }
        } else if (promise.type === 'finances') {
            if (currentState.finances.balance >= Number(promise.target)) {
                newlyFulfilled = true;
            }
        }

        if (newlyFulfilled) {
            newlyFulfilledPromisesCount++;
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

    if (retiredLegends.length > 0) {
        finalNewsFeed.unshift({
            id: `retirements_${newSeasonYear}`,
            headline: `👋 Retiro de Figuras y Leyendas (${newSeasonYear})`,
            body: `Cuelgan las botas destacados futbolistas que marcaron una época:\n${retiredLegends.slice(0, 5).map(r => `• ${r.name} (${r.teamName}, ${r.age} años - Med: ${r.rating})`).join('\n')}\n¡Nuevas promesas surgen de las inferiores con hambre de gloria!`,
            date: formatDate(newDate),
            type: 'standard'
        });
    }

    if (notableTransfers.length > 0) {
        finalNewsFeed.unshift({
            id: `ai_transfers_${newSeasonYear}`,
            headline: `🔥 Mercado Global: Bombazos y Fichajes`,
            body: `Los clubes rivales movieron el mercado intensamente en busca del título:\n${notableTransfers.slice(0, 5).map(t => `• ${t.playerName} (${t.position || 'JUG'}, Med: ${t.rating}): ${t.fromTeam} ➔ ${t.toTeam} (${formatCurrency(t.fee)})`).join('\n')}`,
            date: formatDate(newDate),
            type: 'transfer'
        });
    }

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

    // 8. Calculate Prize Money & Sponsorship Bonuses/Penalties (Clauses Settlement)
    const prizeMoney = calculatePrizeMoney(currentState.team.leagueId, playerPosition);

    const prevLeagueId = currentState.team.leagueId;
    const postProRelTeam = teamsAfterProRel.find(t => t.id === currentState.team.id);
    const nextLeagueId = postProRelTeam?.leagueId;
    const wasPromoted = Boolean(nextLeagueId && nextLeagueId !== prevLeagueId && PROMOTION_RELEGATION_PAIRS.some(([d1, d2]) => prevLeagueId === d2 && nextLeagueId === d1));
    const wasRelegated = Boolean(nextLeagueId && nextLeagueId !== prevLeagueId && PROMOTION_RELEGATION_PAIRS.some(([d1, d2]) => prevLeagueId === d1 && nextLeagueId === d2));
    const secondDivs = PROMOTION_RELEGATION_PAIRS.map(p => p[1]);
    const isSecondDivision = secondDivs.includes(prevLeagueId as LeagueId);
    const wonAnyCup = Object.values(workingCups || {}).some(c => getCupWinnerId(c as CupCompetition) === currentState.team.id);
    const qualifiedContinental = Boolean(
        newSeasonCups.championsLeague?.swissTable?.some(r => r.teamId === updatedPlayerTeam.id) ||
        newSeasonCups.europaLeague?.swissTable?.some(r => r.teamId === updatedPlayerTeam.id) ||
        newSeasonCups.copaLibertadores?.groups?.some(g => g.teams.includes(updatedPlayerTeam.id)) ||
        newSeasonCups.copaSudamericana?.groups?.some(g => g.teams.includes(updatedPlayerTeam.id))
    );
    const reachedDomesticCupLateStage = [
        workingCups.faCup, workingCups.carabaoCup, workingCups.copaDelRey,
        workingCups.dfbPokal, workingCups.coppaItalia, workingCups.copaArgentina, workingCups.copaMx
    ].some(c => c?.rounds?.slice(-2).some(r =>
        r.fixtures?.some(f => f.homeTeamId === currentState.team.id || f.awayTeamId === currentState.team.id)
    ));
    const squadAvgAge = updatedPlayerTeamWithTrophies.squad.length > 0
        ? updatedPlayerTeamWithTrophies.squad.reduce((sum, p) => sum + (p.age || 25), 0) / updatedPlayerTeamWithTrophies.squad.length
        : 25;

    const sponsorSettlement = evaluateSponsorshipClauses(
        currentState.sponsors,
        {
            playerPosition,
            totalTeamsInLeague: playerLeagueTable.length || 20,
            isSecondDivision,
            wasPromoted,
            wasRelegated,
            qualifiedContinental,
            wonAnyCup,
            reachedDomesticCupLateStage,
            endBalanceBeforeClauses: currentState.finances.balance + prizeMoney,
            squadAvgAge,
            fanApprovalRating: currentState.fanApproval?.rating ?? 60,
            stadiumFacilityLevel: currentState.stadium?.facilityLevel ?? 1
        },
        formatCurrency
    );

    const sponsorshipBonuses = sponsorSettlement.netAdjustment;
    const bonusMessages = [...sponsorSettlement.bonusMessages, ...sponsorSettlement.penaltyMessages];

    const totalEndSeasonIncome = prizeMoney + sponsorshipBonuses;
    const newBalance = currentState.finances.balance + totalEndSeasonIncome;

    // 8.5 Update Club Membership (Socios) for major season milestones (Trophies, Promotion, Relegation)
    let updatedMembership = currentState.membership || generateClubMembership(updatedPlayerTeamWithTrophies, currentState.stadium);
    let seasonMembershipDelta = 0;
    const seasonMembershipNotes: string[] = [];

    const userSeasonTrophies = trophiesToAward.filter(t => t.teamId === updatedPlayerTeam.id);
    for (const tr of userSeasonTrophies) {
        const isContinentalMajor = tr.name === 'UEFA Champions League' || tr.name === 'Copa Libertadores';
        const evType = isContinentalMajor ? 'CONTINENTAL_WIN' : tr.type === 'league' ? 'LEAGUE_WIN' : 'CUP_WIN';
        const res = applyMembershipEventBoost(updatedMembership, evType, tr.name);
        updatedMembership = res.updatedMembership;
        seasonMembershipDelta += res.delta;
        if (res.delta !== 0) {
            seasonMembershipNotes.push(`${tr.name}: +${res.delta.toLocaleString()} socios`);
        }
    }

    if (wasPromoted) {
        const res = applyMembershipEventBoost(updatedMembership, 'PROMOTION');
        updatedMembership = res.updatedMembership;
        seasonMembershipDelta += res.delta;
        if (res.delta !== 0) seasonMembershipNotes.push(`Ascenso: +${res.delta.toLocaleString()} socios`);
    } else if (wasRelegated) {
        const res = applyMembershipEventBoost(updatedMembership, 'RELEGATION');
        updatedMembership = res.updatedMembership;
        seasonMembershipDelta += res.delta;
        if (res.delta !== 0) seasonMembershipNotes.push(`Descenso: ${res.delta.toLocaleString()} socios`);
    }
    if (seasonMembershipDelta !== 0) {
        updatedMembership = {
            ...updatedMembership,
            lastWeeklyDelta: seasonMembershipDelta,
            lastDeltaReason: seasonMembershipNotes.join(' · ')
        };
    }

    const membershipLine = seasonMembershipNotes.length > 0
        ? `\nPadrón de Socios: ${seasonMembershipNotes.join(' | ')} (Total: ${updatedMembership.activeMembers.toLocaleString()})`
        : '';

    const prizeNews: NewsItem = {
        id: `prize_${newSeasonYear}`,
        headline: `Balance de Final de Temporada`,
        body: `Premios de Liga: ${formatCurrency(prizeMoney)} por terminar ${playerPosition}º.${bonusMessages.length > 0 ? '\n' + bonusMessages.join('\n') : ''}\nTotal neto ingresado: ${formatCurrency(totalEndSeasonIncome)}${membershipLine}`,
        date: formatDate(newDate),
        type: 'achievement'
    };
    finalNewsFeed.unshift(prizeNews);

    const newRating = Math.max(0, Math.min(100, currentState.fanApproval.rating + approvalDelta));
    const trend: 'rising' | 'stable' | 'falling' =
        approvalDelta > 5 ? 'rising' : approvalDelta < -5 ? 'falling' : 'stable';

    // 7.5 Generar Eventos Cinematográficos
    const newCinematicQueue = [...(currentState.cinematicQueue || [])];
    
    // Pool of all available teams (including extra South American teams) to resolve full metadata & crests
    const allDrawPoolTeams = [...currentState.allTeams, ...teamsAfterProRel, ...SOUTH_AMERICAN_EXTRA_TEAMS];
    const getTeamForDraw = (id: number) => allDrawPoolTeams.find(t => t.id === id);

    // Check if player qualified for Champions League
    const clFixtures = newSeasonCups.championsLeague?.swissFixtures || [];
    const playerInCL = newSeasonCups.championsLeague?.swissTable?.some(r => r.teamId === updatedPlayerTeam.id);
    if (playerInCL) {
        const playerOpponents = clFixtures
            .filter(m => m.homeTeamId === updatedPlayerTeam.id || m.awayTeamId === updatedPlayerTeam.id)
            .map(m => {
                const isHome = m.homeTeamId === updatedPlayerTeam.id;
                const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                const oppTeam = getTeamForDraw(opponentId);
                return {
                    id: opponentId,
                    name: oppTeam?.name || 'Desconocido',
                    team: oppTeam,
                    venue: isHome ? 'home' : 'away'
                };
            });

        newCinematicQueue.push({
            id: `cinematic_cl_draw_${newSeasonYear}`,
            type: 'GROUP_DRAW',
            title: `UEFA Champions League`,
            subtitle: `Sorteo de Fase de Liga ${newSeasonYear}`,
            metadata: {
                competition: 'champions_league',
                accentColor: '#3b82f6',
                bgClass: 'from-blue-950 via-slate-950 to-slate-950',
                swissOpponents: playerOpponents
            }
        });
    }

    // Check if player qualified for Libertadores
    const playerGroup = newSeasonCups.copaLibertadores?.groups?.find(g => g.teams.includes(updatedPlayerTeam.id));
    if (playerGroup) {
        newCinematicQueue.push({
            id: `cinematic_lib_draw_${newSeasonYear}`,
            type: 'GROUP_DRAW',
            title: `CONMEBOL Libertadores`,
            subtitle: `Sorteo de Fase de Grupos`,
            metadata: {
                competition: 'copa_libertadores',
                accentColor: '#facc15',
                bgClass: 'from-amber-950/80 via-slate-950 to-slate-950',
                groups: [{
                    name: playerGroup.name,
                    teams: playerGroup.teams.map((tid, potIdx) => {
                        const tObj = getTeamForDraw(tid);
                        return {
                            id: tid,
                            name: tObj?.name || 'Desconocido',
                            team: tObj,
                            pot: potIdx + 1,
                            isPlayer: tid === updatedPlayerTeam.id
                        };
                    })
                }]
            }
        });
    }

    // Check if player qualified for Sudamericana
    const playerSudGroup = newSeasonCups.copaSudamericana?.groups?.find(g => g.teams.includes(updatedPlayerTeam.id));
    if (playerSudGroup) {
        newCinematicQueue.push({
            id: `cinematic_sud_draw_${newSeasonYear}`,
            type: 'GROUP_DRAW',
            title: `CONMEBOL Sudamericana`,
            subtitle: `Sorteo de Fase de Grupos`,
            metadata: {
                competition: 'copa_sudamericana',
                accentColor: '#d97706',
                bgClass: 'from-yellow-950/70 via-slate-950 to-slate-950',
                groups: [{
                    name: playerSudGroup.name,
                    teams: playerSudGroup.teams.map((tid, potIdx) => {
                        const tObj = getTeamForDraw(tid);
                        return {
                            id: tid,
                            name: tObj?.name || 'Desconocido',
                            team: tObj,
                            pot: potIdx + 1,
                            isPlayer: tid === updatedPlayerTeam.id
                        };
                    })
                }]
            }
        });
    }

    // Collect promoted/relegated team names for the cinematic summary (focused on user's league context)
    const relegatedTeamNames: string[] = [];
    const promotedTeamNames: string[] = [];
    const userLeagueId = currentState.team.leagueId;

    const userPair = PROMOTION_RELEGATION_PAIRS.find(([d1, d2]) => d1 === userLeagueId || d2 === userLeagueId);
    if (userPair) {
        const [div1, div2] = userPair;
        if (div1 === LeagueId.LIGA_ARGENTINA) {
            const d1t = workingLeagueTables[div1] || [];
            const d2t = workingLeagueTables[div2] || [];
            const relResult = computeArgentineRelegation(d1t);
            relResult.relegatedIds.forEach(id => {
                const t = processedTeams.find(tm => tm.id === id);
                if (t) relegatedTeamNames.push(t.name);
            });
            const promo1Id = workingCups.nacionalPrimerAscenso?.winnerId || d2t.filter(r => r.zone === 'A').sort((a,b) => b.points - a.points)[0]?.teamId;
            const promo2Id = workingCups.nacionalReducido?.winnerId || d2t.filter(r => r.zone === 'B').sort((a,b) => b.points - a.points)[0]?.teamId;
            if (promo1Id) {
                const t = processedTeams.find(tm => tm.id === promo1Id);
                if (t) promotedTeamNames.push(t.name);
            }
            if (promo2Id && promo2Id !== promo1Id) {
                const t = processedTeams.find(tm => tm.id === promo2Id);
                if (t) promotedTeamNames.push(t.name);
            }
        } else {
            const d1t = workingLeagueTables[div1] || [];
            const d2t = workingLeagueTables[div2] || [];
            const slots = getPromotionRelegationSlots(div1);
            d1t.slice(-slots).forEach(r => { const t = processedTeams.find(tm => tm.id === r.teamId); if (t) relegatedTeamNames.push(t.name); });
            d2t.slice(0, slots).forEach(r => { const t = processedTeams.find(tm => tm.id === r.teamId); if (t) promotedTeamNames.push(t.name); });
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
            promoted: promotedTeamNames,
            relegated: relegatedTeamNames,
            balance: newBalance
        }
    });

    // 7.6 Build Season History Record
    const userTable = (userLeagueId !== 'CONMEBOL' ? workingLeagueTables[userLeagueId] : []) || [];
    const sortedUserTable = userTable;
    const userRow = sortedUserTable.find(r => r.teamId === currentState.team.id);
    const leagueChampionTeam = processedTeams.find(t => t.id === sortedUserTable[0]?.teamId)?.name || 'Desconocido';

    const cupWinnersList: { cupName: string; winnerName: string }[] = [];
    Object.entries(workingCups).forEach(([_, cup]) => {
        if (cup?.winnerId) {
            const winnerTeam = processedTeams.find(t => t.id === cup.winnerId);
            if (winnerTeam) {
                cupWinnersList.push({ cupName: cup.name, winnerName: winnerTeam.name });
            }
        }
    });

    const seasonRecord: SeasonHistoryRecord = {
        season: currentSeason,
        leagueId: userLeagueId,
        leagueName: (userLeagueId !== 'CONMEBOL' ? LEAGUE_TROPHY_NAMES[userLeagueId] : undefined) || userLeagueId.replace(/_/g, ' '),
        userTeamId: currentState.team.id,
        userTeamName: currentState.team.name,
        userPosition: playerPosition,
        userPoints: userRow?.points || 0,
        userWon: userRow?.won || 0,
        userDrawn: userRow?.drawn || 0,
        userLost: userRow?.lost || 0,
        leagueChampion: leagueChampionTeam,
        cupWinners: cupWinnersList,
        ballonDorWinner: ballonDorWinner ? { 
            name: ballonDorWinner.name, 
            teamName: processedTeams.find(t => t.squad.some(p => p.id === ballonDorWinner!.id))?.name || 'Club', 
            rating: ballonDorWinner.rating 
        } : undefined,
        goldenBootWinner: goldenBootWinner ? { 
            name: goldenBootWinner.name, 
            teamName: processedTeams.find(t => t.squad.some(p => p.id === goldenBootWinner!.id))?.name || 'Club', 
            goals: maxGoals 
        } : undefined,
        promotedTeams: promotedTeamNames,
        relegatedTeams: relegatedTeamNames,
        endBalance: newBalance
    };

    const updatedSeasonHistory = [...(currentState.seasonHistory || []), seasonRecord];

    // Evaluate Achievements
    const tempStateForAchievements: GameState = {
        ...currentState,
        team: updatedPlayerTeamWithTrophies,
        finances: { ...currentState.finances, balance: newBalance },
        seasonHistory: updatedSeasonHistory
    };
    const { updatedAchievements } = evaluateAchievements(tempStateForAchievements);

    const userTrophiesThisSeason = trophiesToAward.filter(t => t.teamId === updatedPlayerTeam.id).length;
    const seasonXpGain = 50 + (userTrophiesThisSeason * 120) + (newlyFulfilledPromisesCount * 45);
    const updatedProfileWithXp = currentState.playerProfile
        ? awardPresidentXp(currentState.playerProfile, seasonXpGain)
        : undefined;

    if (youthBlockedByFullRoster) {
        finalNewsFeed.unshift({
            id: `academy_full_${newSeasonYear}`,
            headline: 'Cupo de Plantel y Reserva Completo',
            subheadline: 'No pudieron incorporarse nuevos juveniles por falta de vacantes.',
            body: `Tu Primer Equipo (${MAX_FIRST_TEAM_SIZE}/${MAX_FIRST_TEAM_SIZE}) y tu Reserva (${MAX_RESERVE_SIZE}/${MAX_RESERVE_SIZE}) están al máximo de capacidad. Vende o libera futbolistas para hacer lugar a futuras promesas.`,
            date: formatDate(newDate),
            type: 'warning',
            sourceName: 'Dirección Deportiva'
        });
    }

    // 8. Return updated state
    return {
        ...currentState,
        playerProfile: updatedProfileWithXp || currentState.playerProfile,
        team: updatedPlayerTeamWithTrophies,
        allTeams: teamsAfterProRel,
        youthAcademy: updatedAcademy,
        incomingOffers: [],
        season: newSeasonYear,
        currentDate: newDate,
        currentWeek: 0,
        currentTurn: 'weekend',
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
        cups: newSeasonCups,
        stadium: currentState.stadium,
        membership: updatedMembership,
        finances: (() => {
            const isSouthAm = isSouthAmericanClubLeague(userLeagueId);
            const isNorthAm = isNorthAmericanClubLeague(userLeagueId);

            let maxBudgetCap = 120_000_000;
            if (isSouthAm) {
                maxBudgetCap = updatedPlayerTeam.tier === 'Top' ? 14_000_000 : updatedPlayerTeam.tier === 'Mid' ? 5_000_000 : 2_000_000;
            } else if (isNorthAm) {
                maxBudgetCap = updatedPlayerTeam.tier === 'Top' ? 25_000_000 : updatedPlayerTeam.tier === 'Mid' ? 10_000_000 : 4_000_000;
            } else if (updatedPlayerTeam.tier !== 'Top') {
                maxBudgetCap = updatedPlayerTeam.tier === 'Mid' ? 35_000_000 : 12_000_000;
            }

            // Presupuesto asignado por la junta: fracción prudente del balance disponible
            const boardTransferBudget = Math.min(
                maxBudgetCap,
                Math.max(500_000, Math.round(newBalance * (isSouthAm ? 0.25 : 0.40)))
            );

            return {
                ...currentState.finances,
                balance: newBalance,
                transferBudget: boardTransferBudget
            };
        })(),
        availableSponsors: generateSponsorMarket(updatedPlayerTeam.tier, userLeagueId),
        availableCoaches: generateCoachMarket(5, userLeagueId, updatedPlayerTeam.tier),
        availableStaff: generateStaffMarket(updatedPlayerTeam.tier, userLeagueId),
        availableScouts: generateScoutMarket(updatedPlayerTeam.tier, userLeagueId),
        coachReport: undefined,
        lastStaffMarketRefreshWeek: undefined,
        cinematicQueue: newCinematicQueue,
        achievements: updatedAchievements,
        seasonHistory: updatedSeasonHistory
    };
}
