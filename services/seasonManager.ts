/**
 * Season Manager Service
 * Handles season transitions, aging, retirements, and promotion/relegation
 */

import { GameState, Team, Player, NewsItem, EuropeanCompetition, EuropeanTableRow, Match, CupCompetition, CupChampion, LeagueId, SeasonHistoryRecord, LeagueTableRow } from '../types';
import { generateYouthPlayer, generateSeasonSchedule, generateCupDraw, createInitialLeagueTable, handlePromotionRelegation, generateSwissPhase, generateGroupPhase, createInitialEuropeanTable, sortArgentineZones, simulateMacroMatch } from './simulation';
import { computeArgentineRelegation, computeArgentineInternationalQualification } from './argentinaRegulations';
import { calculatePrizeMoney, generateSponsorMarket } from './economy';
import { formatDate, formatCurrency } from '../utils';
import { evaluateAchievements } from './achievementService';
import { initializeLibertadoresSeason } from './libertadoresEngine';
import { initializeSudamericanaSeason } from './sudamericanaEngine';
import { SOUTH_AMERICAN_EXTRA_TEAMS } from '../data/teams/southAmericanClubs';
import { TOURNAMENT_LOGOS } from './customPacks/argentineLogos';

// Define promotion/relegation pairs locally (mirrors simulation.ts)
const PROMOTION_RELEGATION_PAIRS: [LeagueId, LeagueId][] = [
    [LeagueId.PREMIER_LEAGUE, LeagueId.CHAMPIONSHIP],
    [LeagueId.LA_LIGA, LeagueId.SEGUNDA_DIVISION_ESP],
    [LeagueId.BUNDESLIGA, LeagueId.ZWEITE_BUNDESLIGA],
    [LeagueId.SERIE_A, LeagueId.SERIE_B_ITA],
    [LeagueId.LIGUE_1, LeagueId.LIGUE_2],
    [LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL],
    [LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR],
];

/**
 * Processes the transition to a new season
 * Handles aging, retirements, regens, promotion/relegation, and schedule generation
 */
export function startNewSeason(currentState: GameState): GameState {
    const isSouthAmerica = [
        LeagueId.LIGA_ARGENTINA,
        LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO,
        LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA
    ].includes(currentState.team.leagueId);

    const newSeasonYear = currentState.season + 1;
    const newDate = isSouthAmerica 
        ? new Date(`${newSeasonYear}-01-15T12:00:00`) 
        : new Date(`${newSeasonYear}-08-10T12:00:00`);

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
        [LeagueId.LIGA_ARGENTINA]: 'Liga Profesional de Fútbol',
        [LeagueId.PRIMERA_NACIONAL]: 'Primera Nacional',
        [LeagueId.BRASILEIRAO]: 'Brasileirão Série A',
        [LeagueId.SERIE_B_BR]: 'Brasileirão Série B',
        [LeagueId.COPA_DE_PRIMERA]: 'Copa de Primera (Paraguay)'
    };

    // Leagues
    Object.entries(currentState.leagueTables).forEach(([leagueId, table]) => {
        if (table.length > 0) {
            const sortedTable = [...table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
            const winnerId = sortedTable[0].teamId;
            const leagueName = LEAGUE_TROPHY_NAMES[leagueId] || leagueId.replace(/_/g, ' ');
            trophiesToAward.push({ teamId: winnerId, name: leagueName, type: 'league' });
        }
    });

    // Helper to resolve champion ID from winnerId or final fixture result
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
    const faWinner = getCupWinnerId(currentState.cups.faCup);
    if (faWinner) trophiesToAward.push({ teamId: faWinner, name: 'FA Cup', type: 'cup' });

    const carabaoWinner = getCupWinnerId(currentState.cups.carabaoCup);
    if (carabaoWinner) trophiesToAward.push({ teamId: carabaoWinner, name: 'Carabao Cup', type: 'cup' });

    const cdrWinner = getCupWinnerId(currentState.cups.copaDelRey);
    if (cdrWinner) trophiesToAward.push({ teamId: cdrWinner, name: 'Copa del Rey', type: 'cup' });

    const dfbWinner = getCupWinnerId(currentState.cups.dfbPokal);
    if (dfbWinner) trophiesToAward.push({ teamId: dfbWinner, name: 'DFB-Pokal', type: 'cup' });

    const ciWinner = getCupWinnerId(currentState.cups.coppaItalia);
    if (ciWinner) trophiesToAward.push({ teamId: ciWinner, name: 'Coppa Italia', type: 'cup' });

    const caWinner = getCupWinnerId(currentState.cups.copaArgentina);
    if (caWinner) trophiesToAward.push({ teamId: caWinner, name: 'Copa Argentina', type: 'cup' });

    const apWinner = getCupWinnerId(currentState.cups.aperturaPlayoffs);
    if (apWinner) trophiesToAward.push({ teamId: apWinner, name: 'Torneo Apertura', type: 'cup' });

    const clWinner = getCupWinnerId(currentState.cups.clausuraPlayoffs);
    if (clWinner) trophiesToAward.push({ teamId: clWinner, name: 'Torneo Clausura', type: 'cup' });

    const paWinner = getCupWinnerId(currentState.cups.nacionalPrimerAscenso);
    if (paWinner) trophiesToAward.push({ teamId: paWinner, name: 'Primera Nacional (1º Ascenso)', type: 'cup' });

    const redWinner = getCupWinnerId(currentState.cups.nacionalReducido);
    if (redWinner) trophiesToAward.push({ teamId: redWinner, name: 'Torneo Reducido', type: 'cup' });

    // International Cups
    const uclWinner = getCupWinnerId(currentState.cups.championsLeague);
    if (uclWinner) trophiesToAward.push({ teamId: uclWinner, name: 'UEFA Champions League', type: 'cup' });

    const uelWinner = getCupWinnerId(currentState.cups.europaLeague);
    if (uelWinner) trophiesToAward.push({ teamId: uelWinner, name: 'UEFA Europa League', type: 'cup' });

    const libWinner = getCupWinnerId(currentState.cups.copaLibertadores);
    if (libWinner) trophiesToAward.push({ teamId: libWinner, name: 'Copa Libertadores', type: 'cup' });

    const sudWinner = getCupWinnerId(currentState.cups.copaSudamericana);
    if (sudWinner) trophiesToAward.push({ teamId: sudWinner, name: 'Copa Sudamericana', type: 'cup' });

    const intWinner = getCupWinnerId(currentState.cups.copaIntercontinental);
    if (intWinner) trophiesToAward.push({ teamId: intWinner, name: 'Copa Intercontinental', type: 'cup' });

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
        
        // Dynamic Rating Update (bounded by potential if present)
        if (p.age && p.age < 25 && p.stats.appearances > 10) {
            const maxRating = p.potential ? Math.min(99, p.potential) : 99;
            p.rating = Math.min(maxRating, p.rating + Math.floor(Math.random() * 3));
        }
        if (p.age && p.age > 32) p.rating = Math.max(40, p.rating - Math.floor(Math.random() * 3));

        // Reset stats
        p.stats = { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 };
    });

    const updatedPlayerTeamWithTrophies = processedTeams.find(t => t.id === currentState.team.id)!;

    // 2.5 Finalize any unplayed league matches across all 14 leagues so all tables are 100% complete
    const unplayedLeagueMatches = currentState.schedule.filter(m => m.result === undefined && !m.isCupMatch);
    if (unplayedLeagueMatches.length > 0) {
        const teamMap = new Map<number, Team>(processedTeams.map(t => [t.id, t]));
        unplayedLeagueMatches.forEach(m => {
            const hTeam = teamMap.get(m.homeTeamId);
            const aTeam = teamMap.get(m.awayTeamId);
            if (!hTeam || !aTeam) return;

            const table = currentState.leagueTables[hTeam.leagueId];
            const hRow = table?.find(r => r.teamId === hTeam.id);
            const aRow = table?.find(r => r.teamId === aTeam.id);

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
            }
        });
    }

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
            
            let relegatedNames: string[] = [];
            let promotedNames: string[] = [];

            if (div1 === LeagueId.LIGA_ARGENTINA) {
                const relResult = computeArgentineRelegation(div1Table);
                relegatedNames = relResult.relegatedIds
                    .map(id => processedTeams.find(tm => tm.id === id)?.name)
                    .filter(Boolean) as string[];

                const promo1Id = currentState.cups.nacionalPrimerAscenso?.winnerId || div2Table.filter(r => r.zone === 'A').sort((a,b) => b.points - a.points)[0]?.teamId;
                const promo2Id = currentState.cups.nacionalReducido?.winnerId || div2Table.filter(r => r.zone === 'B').sort((a,b) => b.points - a.points)[0]?.teamId;
                if (promo1Id) {
                    const t = processedTeams.find(tm => tm.id === promo1Id);
                    if (t) promotedNames.push(t.name);
                }
                if (promo2Id && promo2Id !== promo1Id) {
                    const t = processedTeams.find(tm => tm.id === promo2Id);
                    if (t) promotedNames.push(t.name);
                }
            } else {
                relegatedNames = sorted1.slice(-3).map(r => processedTeams.find(t => t.id === r.teamId)?.name).filter(Boolean) as string[];
                promotedNames = sorted2.slice(0, 3).map(p => processedTeams.find(t => t.id === p.teamId)?.name).filter(Boolean) as string[];
            }
            
            if (relegatedNames.length > 0 || promotedNames.length > 0) {
                const leagueName = div1.replace(/_/g, ' ');
                allMovementNews.push(`${leagueName}: ⬆️ ${promotedNames.join(', ')} | ⬇️ ${relegatedNames.join(', ')}`);
            }
        }
    });

    // 4. Generate new season schedule and tables
    const argTeams = teamsAfterProRel.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA);
    // Authentic AFA zone lottery for new season: fixed rivalry pairs 50/50 across Zona A & B
    sortArgentineZones(argTeams);
    const newSeasonSchedule = generateSeasonSchedule(teamsAfterProRel, newSeasonYear);

    const getLeagueTeams = (id: LeagueId) => teamsAfterProRel.filter(t => t.leagueId === id);

    const newLeagueTables: Record<LeagueId, LeagueTableRow[]> = {} as Record<LeagueId, LeagueTableRow[]>;
    Object.values(LeagueId).forEach(lid => {
        const teams = getLeagueTeams(lid);
        const initialTable = createInitialLeagueTable(teams);
        if (lid === LeagueId.LIGA_ARGENTINA) {
            const prevArgTable = currentState.leagueTables[LeagueId.LIGA_ARGENTINA] || [];
            initialTable.forEach(row => {
                const prevRow = prevArgTable.find(r => r.teamId === row.teamId);
                if (prevRow) {
                    // Accumulate completed season into rolling 3-season history (AFA regulation)
                    let playedTotal = (prevRow.playedTotal || 0) + prevRow.played;
                    let pointsTotal = (prevRow.pointsTotal || 0) + prevRow.points;
                    // Cap rolling window to approx. 3 seasons (32 matches/year * 3 = 96 matches)
                    if (playedTotal > 96) {
                        const factor = 96 / playedTotal;
                        playedTotal = 96;
                        pointsTotal = Math.round(pointsTotal * factor);
                    }
                    row.playedTotal = playedTotal;
                    row.pointsTotal = pointsTotal;
                    row.promedio = playedTotal > 0 ? Number((pointsTotal / playedTotal).toFixed(3)) : 0;
                } else {
                    // Newly promoted team divides only by matches played in new season
                    row.playedTotal = 0;
                    row.pointsTotal = 0;
                    row.promedio = 0;
                }
            });
        }
        newLeagueTables[lid] = initialTable;
    });

    const newPlTeams = getLeagueTeams(LeagueId.PREMIER_LEAGUE);
    const newChTeams = getLeagueTeams(LeagueId.CHAMPIONSHIP);
    const newLaTeams = getLeagueTeams(LeagueId.LA_LIGA);
    const newSegTeams = getLeagueTeams(LeagueId.SEGUNDA_DIVISION_ESP);
    const newGerTeams = getLeagueTeams(LeagueId.BUNDESLIGA);
    const newZweiteTeams = getLeagueTeams(LeagueId.ZWEITE_BUNDESLIGA);
    const newItaTeams = getLeagueTeams(LeagueId.SERIE_A);
    const newSerieBTeams = getLeagueTeams(LeagueId.SERIE_B_ITA);
    const newArgTeams = getLeagueTeams(LeagueId.LIGA_ARGENTINA);
    const newNacTeams = getLeagueTeams(LeagueId.PRIMERA_NACIONAL);

    // 5. Generate new cup draws (National Cups)
    const englishTeamsNewSeason = [...newPlTeams, ...newChTeams];
    const spanishTeamsNewSeason = [...newLaTeams, ...newSegTeams];
    const germanTeamsNewSeason = [...newGerTeams, ...newZweiteTeams];
    const italianTeamsNewSeason = [...newItaTeams, ...newSerieBTeams];
    const argentinianTeamsNewSeason = [...newArgTeams, ...newNacTeams];

    const playerTeamId = currentState.team?.id;
    const faCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'FA_Cup', playerTeamId);
    const carabaoCupRound1 = generateCupDraw(englishTeamsNewSeason, 'Round 1', 'Carabao_Cup', playerTeamId);
    const copaDelReyRound1 = generateCupDraw(spanishTeamsNewSeason, 'Round 1', 'Copa_del_Rey', playerTeamId);
    const dfbPokalRound1 = generateCupDraw(germanTeamsNewSeason, 'Round 1', 'DFB_Pokal', playerTeamId);
    const coppaItaliaRound1 = generateCupDraw(italianTeamsNewSeason, 'Round 1', 'Coppa_Italia', playerTeamId);
    const copaArgentinaRound1 = generateCupDraw(argentinianTeamsNewSeason, 'Round 1', 'Copa_Argentina', playerTeamId);

    // Assign cup fixtures to specific weeks (always midweek to prevent clashing with weekend league matches)
    const faCupFixtures = faCupRound1.map(m => ({ ...m, week: 5, isMidweek: true }));
    const carabaoCupFixtures = carabaoCupRound1.map(m => ({ ...m, week: 2, isMidweek: true }));
    const copaDelReyFixtures = copaDelReyRound1.map(m => ({ ...m, week: 4, isMidweek: true }));
    const dfbPokalFixtures = dfbPokalRound1.map(m => ({ ...m, week: 3, isMidweek: true }));
    const coppaItaliaFixtures = coppaItaliaRound1.map(m => ({ ...m, week: 4, isMidweek: true }));
    const copaArgentinaFixtures = copaArgentinaRound1.map(m => ({ ...m, week: 5, isMidweek: true }));

    // 5.5 Generate European & South American Competitions (Dynamic Qualification)
    const getTopTeams = (lid: LeagueId, count: number) => {
        const table = currentState.leagueTables[lid];
        if (!table) return [];
        return [...table].sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference)
            .slice(0, count)
            .map(row => teamsAfterProRel.find(t => t.id === row.teamId))
            .filter(Boolean) as Team[];
    };

    const getTeamsRange = (lid: LeagueId, start: number, count: number) => {
        const table = currentState.leagueTables[lid];
        if (!table) return [];
        return [...table].sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference)
            .slice(start, start + count)
            .map(row => teamsAfterProRel.find(t => t.id === row.teamId))
            .filter(Boolean) as Team[];
    };

    // Champions League Qualification (36 unique teams for 2026 format)
    const clTeamsMap = new Map<number, Team>();
    [
        ...getTopTeams(LeagueId.PREMIER_LEAGUE, 7),
        ...getTopTeams(LeagueId.LA_LIGA, 7),
        ...getTopTeams(LeagueId.BUNDESLIGA, 7),
        ...getTopTeams(LeagueId.SERIE_A, 7),
        ...getTopTeams(LeagueId.LIGUE_1, 6),
        ...getTopTeams(LeagueId.CHAMPIONSHIP, 2)
    ].forEach(t => clTeamsMap.set(t.id, t));
    const clTeams = Array.from(clTeamsMap.values()).slice(0, 36);

    // Europa League Qualification (36 unique teams for 2026 format)
    const elTeamsMap = new Map<number, Team>();
    [
        ...getTeamsRange(LeagueId.PREMIER_LEAGUE, 7, 7),
        ...getTeamsRange(LeagueId.LA_LIGA, 7, 7),
        ...getTeamsRange(LeagueId.BUNDESLIGA, 7, 7),
        ...getTeamsRange(LeagueId.SERIE_A, 7, 7),
        ...getTeamsRange(LeagueId.LIGUE_1, 6, 6),
        ...getTeamsRange(LeagueId.CHAMPIONSHIP, 2, 2)
    ].filter(t => !clTeamsMap.has(t.id)).forEach(t => elTeamsMap.set(t.id, t));
    const elTeams = Array.from(elTeamsMap.values()).slice(0, 36);

    // Copa Libertadores Qualification (32 unique teams: Argentina, Brasil, Paraguay)
    const argTable = currentState.leagueTables[LeagueId.LIGA_ARGENTINA] || [];
    const argQual = computeArgentineInternationalQualification(argTable, currentState.cups);
    const argLibTeams = argQual.libertadores
        .map(q => teamsAfterProRel.find(t => t.id === q.teamId))
        .filter(Boolean) as Team[];

    // CONMEBOL Copa Libertadores (Official 47-team structure)
    const libInit = initializeLibertadoresSeason({
        allTeams: teamsAfterProRel,
        lastLibertadoresWinnerId: getCupWinnerId(currentState.cups.copaLibertadores) || undefined,
        lastSudamericanaWinnerId: getCupWinnerId(currentState.cups.copaSudamericana) || undefined,
        argentineQualifiedIds: argLibTeams.map(t => t.id)
    }, currentState.cups.copaLibertadores);

    // CONMEBOL Copa Sudamericana (Official 56-team structure)
    const argSudTeams = argQual.sudamericana
        .map(q => teamsAfterProRel.find(t => t.id === q.teamId))
        .filter(Boolean) as Team[];

    const libParticipantIds = new Set<number>();
    libInit.cup.groups?.forEach(g => g.teams.forEach(id => libParticipantIds.add(id)));
    libInit.fixtures.forEach(m => {
        libParticipantIds.add(m.homeTeamId);
        libParticipantIds.add(m.awayTeamId);
    });

    const sudInit = initializeSudamericanaSeason({
        allTeams: teamsAfterProRel,
        lastSudamericanaWinnerId: getCupWinnerId(currentState.cups.copaSudamericana) || undefined,
        argentineQualifiedIds: argSudTeams.map(t => t.id),
        libertadoresPhase3Losers: libInit.phase3Losers,
        excludedTeamIds: libParticipantIds
    }, currentState.cups.copaSudamericana);

    const clSwiss = generateSwissPhase(clTeams, 'Champions_League', 8); // 8 matches as per real 2026 format
    const elSwiss = generateSwissPhase(elTeams, 'Europa_League', 8);
    const libGroups = libInit.cup.groups || []; 
    const sudGroups = sudInit.cup.groups || [];

    const clFixtures = clSwiss.fixtures.map(m => ({ ...m, week: m.week + 5, isMidweek: true }));
    const elFixtures = elSwiss.fixtures.map(m => ({ ...m, week: m.week + 5, isMidweek: true }));
    const libGroupFixtures = libInit.fixtures;
    const sudGroupFixtures = sudInit.fixtures;

    // Intercontinental Cup
    const lastLibertadoresWinner = currentState.cups.copaLibertadores?.winnerId;
    const lastChampionsWinner = currentState.cups.championsLeague?.winnerId;
    
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
        ...faCupFixtures, ...carabaoCupFixtures, ...copaDelReyFixtures, ...dfbPokalFixtures, ...coppaItaliaFixtures, ...copaArgentinaFixtures,
        ...clFixtures, ...elFixtures, ...libGroupFixtures, ...sudGroupFixtures, ...intercontinentalFixtures
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
    // Find the player's position in their own league table (works for ANY league)
    const playerLeagueTable = currentState.leagueTables[updatedPlayerTeam.leagueId] || [];
    const sortedPlayerLeague = [...playerLeagueTable].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    const playerPosition = sortedPlayerLeague.findIndex(row => row.teamId === updatedPlayerTeam.id) + 1 || 10;

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
            // Check if player's team won ANY cup competition in any country or Europe, or the league title
            const wonAnyCup = Object.values(currentState.cups || {}).some((cup: any) => cup?.winnerId === updatedPlayerTeam.id);
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
            else if (sponsor.bonus.condition === 'promotion') {
                // Check if our team was in a second division and got promoted
                const secondDivs = PROMOTION_RELEGATION_PAIRS.map(p => p[1]);
                const wasInSecondDiv = secondDivs.includes(currentState.team.leagueId as LeagueId);
                if (wasInSecondDiv && playerPosition <= 3) achieved = true;
            }
            
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
    
    // Pool of all available teams (including extra South American teams) to resolve full metadata & crests
    const allDrawPoolTeams = [...currentState.allTeams, ...teamsAfterProRel, ...SOUTH_AMERICAN_EXTRA_TEAMS];
    const getTeamForDraw = (id: number) => allDrawPoolTeams.find(t => t.id === id);

    // Check if player qualified for Champions League
    const playerInCL = clTeams.find(t => t.id === updatedPlayerTeam.id);
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
                logoUrl: TOURNAMENT_LOGOS.CHAMPIONS_LEAGUE,
                accentColor: '#3b82f6',
                bgClass: 'from-blue-950 via-slate-950 to-slate-950',
                swissOpponents: playerOpponents
            }
        });
    }

    // Check if player qualified for Libertadores
    const playerGroup = libGroups.find(g => g.teams.includes(updatedPlayerTeam.id));
    if (playerGroup) {
        newCinematicQueue.push({
            id: `cinematic_lib_draw_${newSeasonYear}`,
            type: 'GROUP_DRAW',
            title: `CONMEBOL Libertadores`,
            subtitle: `Sorteo de Fase de Grupos`,
            metadata: {
                competition: 'copa_libertadores',
                logoUrl: TOURNAMENT_LOGOS.COPA_LIBERTADORES,
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
    const playerSudGroup = sudGroups.find(g => g.teams.includes(updatedPlayerTeam.id));
    if (playerSudGroup) {
        newCinematicQueue.push({
            id: `cinematic_sud_draw_${newSeasonYear}`,
            type: 'GROUP_DRAW',
            title: `CONMEBOL Sudamericana`,
            subtitle: `Sorteo de Fase de Grupos`,
            metadata: {
                competition: 'copa_sudamericana',
                logoUrl: TOURNAMENT_LOGOS.COPA_SUDAMERICANA,
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
            const d1t = currentState.leagueTables[div1] || [];
            const d2t = currentState.leagueTables[div2] || [];
            const relResult = computeArgentineRelegation(d1t);
            relResult.relegatedIds.forEach(id => {
                const t = processedTeams.find(tm => tm.id === id);
                if (t) relegatedTeamNames.push(t.name);
            });
            const promo1Id = currentState.cups.nacionalPrimerAscenso?.winnerId || d2t.filter(r => r.zone === 'A').sort((a,b) => b.points - a.points)[0]?.teamId;
            const promo2Id = currentState.cups.nacionalReducido?.winnerId || d2t.filter(r => r.zone === 'B').sort((a,b) => b.points - a.points)[0]?.teamId;
            if (promo1Id) {
                const t = processedTeams.find(tm => tm.id === promo1Id);
                if (t) promotedTeamNames.push(t.name);
            }
            if (promo2Id && promo2Id !== promo1Id) {
                const t = processedTeams.find(tm => tm.id === promo2Id);
                if (t) promotedTeamNames.push(t.name);
            }
        } else {
            const d1t = currentState.leagueTables[div1] || [];
            const d2t = currentState.leagueTables[div2] || [];
            const s1 = [...d1t].sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference);
            const s2 = [...d2t].sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference);
            s1.slice(-3).forEach(r => { const t = processedTeams.find(tm => tm.id === r.teamId); if (t) relegatedTeamNames.push(t.name); });
            s2.slice(0, 3).forEach(r => { const t = processedTeams.find(tm => tm.id === r.teamId); if (t) promotedTeamNames.push(t.name); });
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
    const userTable = currentState.leagueTables[userLeagueId] || [];
    const sortedUserTable = [...userTable].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    const userRow = sortedUserTable.find(r => r.teamId === currentState.team.id);
    const leagueChampionTeam = processedTeams.find(t => t.id === sortedUserTable[0]?.teamId)?.name || 'Desconocido';

    const cupWinnersList: { cupName: string; winnerName: string }[] = [];
    Object.entries(currentState.cups).forEach(([_, cup]) => {
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
        leagueName: LEAGUE_TROPHY_NAMES[userLeagueId] || userLeagueId.replace(/_/g, ' '),
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

    // Archive completed cup winners into championsHistory if not already present
    const buildArchiveChampions = (cup?: CupCompetition) => {
        const existing = cup?.statistics?.championsHistory || [];
        const winnerId = getCupWinnerId(cup);
        if (winnerId) {
            const alreadyIn = existing.some(c => c.season === currentSeason);
            if (!alreadyIn) {
                const winnerTeam = processedTeams.find(t => t.id === winnerId);
                return [
                    {
                        season: currentSeason,
                        winnerId: winnerId,
                        winnerName: winnerTeam?.name || 'Desconocido'
                    },
                    ...existing
                ].slice(0, 10);
            }
        }
        return existing;
    };

    // 8. Return updated state
    return {
        ...currentState,
        team: updatedPlayerTeamWithTrophies,
        allTeams: teamsAfterProRel,
        youthAcademy: updatedAcademy,
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
        cups: {
            faCup: {
                id: 'fa_cup', name: 'FA Cup', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: faCupFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.faCup) }
            },
            carabaoCup: {
                id: 'carabao_cup', name: 'Carabao Cup', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: carabaoCupFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.carabaoCup) }
            },
            copaDelRey: {
                id: 'copa_del_rey', name: 'Copa del Rey', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: copaDelReyFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.copaDelRey) }
            },
            dfbPokal: {
                id: 'dfb_pokal', name: 'DFB-Pokal', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: dfbPokalFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.dfbPokal) }
            },
            coppaItalia: {
                id: 'coppa_italia', name: 'Coppa Italia', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: coppaItaliaFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.coppaItalia) }
            },
            copaArgentina: {
                id: 'copa_argentina', name: 'Copa Argentina', 
                type: 'knockout', phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: copaArgentinaFixtures, completed: false }],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.copaArgentina) }
            },
            aperturaPlayoffs: {
                id: 'apertura_playoffs', name: 'Playoffs Apertura', 
                type: 'knockout', phase: 'knockout',
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.aperturaPlayoffs) }
            },
            clausuraPlayoffs: {
                id: 'clausura_playoffs', name: 'Playoffs Clausura', 
                type: 'knockout', phase: 'knockout',
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.clausuraPlayoffs) }
            },
            nacionalPrimerAscenso: {
                id: 'nacional_primer_ascenso', name: 'Final 1º Ascenso', 
                type: 'knockout', phase: 'knockout',
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.nacionalPrimerAscenso) }
            },
            nacionalReducido: {
                id: 'nacional_reducido', name: 'Torneo Reducido', 
                type: 'knockout', phase: 'knockout',
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.nacionalReducido) }
            },
            championsLeague: {
                id: 'champions_league', name: 'Champions League', 
                type: 'swiss', phase: 'swiss',
                swissTable: clSwiss.table, 
                swissFixtures: clFixtures,
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.championsLeague) }
            },
            europaLeague: {
                id: 'europa_league', name: 'Europa League', 
                type: 'swiss', phase: 'swiss',
                swissTable: elSwiss.table,
                swissFixtures: elFixtures,
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.europaLeague) }
            },
            copaLibertadores: {
                id: 'copa_libertadores', name: 'Copa Libertadores', 
                type: 'groups', phase: 'groups',
                groups: libGroups,
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.copaLibertadores) }
            },
            copaSudamericana: {
                id: 'copa_sudamericana', name: 'Copa Sudamericana', 
                logo: 'https://tmssl.akamaized.net/images/logo/header/cpa.png',
                type: 'groups', phase: 'groups',
                groups: sudGroups,
                rounds: [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.copaSudamericana) }
            },
            copaIntercontinental: {
                id: 'copa_intercontinental', name: 'Copa Intercontinental', 
                type: 'knockout', phase: 'knockout',
                rounds: intercontinentalFixtures.length > 0 ? [{ name: 'Final', fixtures: intercontinentalFixtures, completed: false }] : [],
                currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: buildArchiveChampions(currentState.cups.copaIntercontinental) }
            }
        },
        finances: {
            ...currentState.finances,
            balance: newBalance
        },
        availableSponsors: generateSponsorMarket(updatedPlayerTeam.tier),
        cinematicQueue: newCinematicQueue,
        achievements: updatedAchievements,
        seasonHistory: updatedSeasonHistory
    };
}
