import { Team, Match, CupCompetition, EuropeanTableRow, CupGroup, LeagueTableRow } from '../../types';
import { generateArgentinePlayoffs } from './argentineFormat';
import { calculateTournamentStandings } from '../argentinaRegulations';

/**
 * Helper function to determine the title of the next knockout round.
 */
const getNextRoundName = (teamsRemaining: number): string => {
    if (teamsRemaining === 2) return 'Final';
    if (teamsRemaining <= 4) return 'Semi-Final';
    if (teamsRemaining <= 8) return 'Quarter-Final';
    if (teamsRemaining <= 16) return 'Round of 16';
    return 'Round of 32';
};

/**
 * Generates a knockout cup draw pairing teams in bracket order.
 */
export const generateCupDraw = (
    teams: Team[], 
    roundName: string, 
    competition: Match['competition'] = 'FA_Cup',
    playerTeamId?: number
): Match[] => {
    // Determine the largest power of 2 <= teams.length (capped at 32 for tournament UI symmetry)
    const allowedSizes = [32, 16, 8, 4, 2];
    const targetSize = allowedSizes.find(size => teams.length >= size) || (teams.length >= 2 ? 2 : 0);
    
    if (targetSize < 2) return [];

    let selectedTeams = [...teams];
    if (selectedTeams.length > targetSize) {
        const playerTeam = playerTeamId ? selectedTeams.find(t => t.id === playerTeamId) : null;
        const otherTeams = selectedTeams.filter(t => t.id !== playerTeamId);
        const shuffledOthers = [...otherTeams].sort(() => 0.5 - Math.random());
        if (playerTeam) {
            selectedTeams = [playerTeam, ...shuffledOthers.slice(0, targetSize - 1)];
        } else {
            selectedTeams = shuffledOthers.slice(0, targetSize);
        }
    }

    const shuffled = [...selectedTeams].sort(() => 0.5 - Math.random());
    const fixtures: Match[] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
            fixtures.push({
                week: 0,
                homeTeamId: shuffled[i].id,
                awayTeamId: shuffled[i + 1].id,
                competition: competition,
                isCupMatch: true,
                isMidweek: true
            });
        }
    }
    return fixtures;
};

/**
 * Determines the winner of a match, taking extra time and penalties into account.
 */
export const determineCupWinner = (match: Match): number | null => {
    if (!match.result) return null;

    const { homeScore, awayScore } = match.result;

    if (homeScore > awayScore) return match.homeTeamId;
    if (awayScore > homeScore) return match.awayTeamId;

    if (match.penalties) {
        if (match.penalties.home !== match.penalties.away) {
            return match.penalties.home > match.penalties.away ? match.homeTeamId : match.awayTeamId;
        }
    }
    if (match.result.penalties) {
        if (match.result.penalties.home !== match.result.penalties.away) {
            return match.result.penalties.home > match.result.penalties.away ? match.homeTeamId : match.awayTeamId;
        }
    }

    // Deterministic tiebreak if penalties were not recorded on a drawn cup knockout match:
    // Generate penalty outcome deterministically from match parameters rather than always giving the win to home
    const seed = (match.homeTeamId * 31 + match.awayTeamId * 17 + (match.week || 1)) % 100;
    return seed >= 50 ? match.homeTeamId : match.awayTeamId;
};

/**
 * Checks if a cup competition is international (Champions League, Europa League, Libertadores, Sudamericana)
 */
export const isInternationalCompetition = (cupId?: string): boolean => {
    if (!cupId) return false;
    return ['champions_league', 'europa_league', 'copa_libertadores', 'copa_sudamericana'].includes(cupId);
};

/**
 * Determines the winner of a two-legged tie using aggregate score and penalties in Leg 2.
 */
export const determineTwoLeggedTieWinner = (leg1: Match, leg2: Match): number | null => {
    if (!leg1.result || !leg2.result) return null;

    const teamAId = leg1.homeTeamId; // Home in Leg 1, Away in Leg 2
    const teamBId = leg1.awayTeamId; // Away in Leg 1, Home in Leg 2

    const teamAGoals = leg1.result.homeScore + leg2.result.awayScore;
    const teamBGoals = leg1.result.awayScore + leg2.result.homeScore;

    leg2.aggregateScore = {
        home: teamBGoals,
        away: teamAGoals
    };

    if (teamAGoals > teamBGoals) return teamAId;
    if (teamBGoals > teamAGoals) return teamBId;

    // Aggregate is tied! Check penalty shootout from leg 2
    const pens = leg2.penalties || leg2.result.penalties;
    if (pens && pens.home !== pens.away) {
        return pens.home > pens.away ? teamBId : teamAId;
    }

    // Deterministic tiebreak fallback
    const seed = (teamAId * 31 + teamBId * 17 + (leg2.week || 1)) % 100;
    return seed >= 50 ? teamAId : teamBId;
};

/**
 * Advances international cups (Champions League, Europa League, Libertadores) across Swiss/Group/Knockout phases.
 */
export const progressInternationalCup = (
    cup: CupCompetition, 
    allTeams: Team[], 
    nextWeek: number,
    recentMatches?: Match[]
): CupCompetition & { newFixtures?: Match[] } => {
    if (cup.phase === 'swiss') {
        const fixtures = cup.swissFixtures || [];
        if (recentMatches && recentMatches.length > 0) {
            fixtures.forEach(f => {
                if (f.result === undefined) {
                    const played = recentMatches.find(m =>
                        ((f.id && m.id && f.id === m.id) ||
                        (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && m.week === f.week)) &&
                        m.result !== undefined
                    );
                    if (played) {
                        f.result = played.result;
                        f.penalties = played.penalties;
                    }
                }
            });
        }
        const allPlayed = fixtures.length > 0 && fixtures.every(f => f.result !== undefined);
        if (!allPlayed) return cup;

        // Recalculate Swiss table from fixtures to guarantee absolute precision
        const tableMap = new Map<number, EuropeanTableRow>();
        (cup.swissTable || []).forEach(r => {
            tableMap.set(r.teamId, {
                ...r,
                played: 0, won: 0, drawn: 0, lost: 0,
                goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
            });
        });

        fixtures.forEach(f => {
            if (f.result) {
                const h = tableMap.get(f.homeTeamId);
                const a = tableMap.get(f.awayTeamId);
                if (h && a) {
                    h.played++; a.played++;
                    h.goalsFor += f.result.homeScore; a.goalsFor += f.result.awayScore;
                    h.goalsAgainst += f.result.awayScore; a.goalsAgainst += f.result.homeScore;
                    h.goalDifference = h.goalsFor - h.goalsAgainst;
                    a.goalDifference = a.goalsFor - a.goalsAgainst;
                    if (f.result.homeScore > f.result.awayScore) { h.won++; h.points += 3; a.lost++; }
                    else if (f.result.awayScore > f.result.homeScore) { a.won++; a.points += 3; h.lost++; }
                    else { h.drawn++; h.points += 1; a.drawn++; a.points += 1; }
                }
            }
        });

        // Official UEFA Swiss League Tiebreakers:
        // 1. Points
        // 2. Goal Difference
        // 3. Goals For
        // 4. Won Matches
        // 5. Stable ID fallback
        const sortedTable = Array.from(tableMap.values()).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            if (b.won !== a.won) return b.won - a.won;
            return a.teamId - b.teamId;
        });
        sortedTable.forEach((r, idx) => { r.position = idx + 1; });

        // Official UEFA Knockout Allocation:
        // Positions 1-8: Direct to Round of 16 (Cabezas de Serie directas)
        const top8Ids = sortedTable.slice(0, 8).map(r => r.teamId);

        // Positions 9-24 (16 teams): Playoff Round (Playoffs 16vos)
        // 9-16: Seeded playoff teams
        // 17-24: Unseeded playoff teams
        const seededPlayoffIds = sortedTable.slice(8, 16).map(r => r.teamId);
        const unseededPlayoffIds = sortedTable.slice(16, 24).map(r => r.teamId);

        const compType: Match['competition'] = cup.id === 'champions_league' ? 'Champions_League' : 'Europa_League';
        const playoffFixtures: Match[] = [];
        const secondLegFixtures: Match[] = [];

        // Pair 9-16 with 17-24 (Unseeded at home in 1st leg, Seeded at home in 2nd leg)
        for (let i = 0; i < 8; i++) {
            const homeTeamId = unseededPlayoffIds[7 - i] ?? unseededPlayoffIds[i];
            const awayTeamId = seededPlayoffIds[i];
            playoffFixtures.push({
                week: nextWeek,
                homeTeamId,
                awayTeamId,
                competition: compType,
                isCupMatch: true,
                isMidweek: true,
                leg: 1
            });
            secondLegFixtures.push({
                week: nextWeek + 2,
                homeTeamId: awayTeamId,
                awayTeamId: homeTeamId,
                competition: compType,
                isCupMatch: true,
                isMidweek: true,
                leg: 2
            });
        }

        return {
            ...cup,
            phase: 'knockout',
            swissTable: sortedTable,
            seededTeamIds: top8Ids,
            rounds: [{ 
                name: 'Playoffs 16vos', 
                fixtures: playoffFixtures, 
                secondLegFixtures, 
                completed: false 
            }],
            currentRoundIndex: 0,
            newFixtures: [...playoffFixtures, ...secondLegFixtures]
        };
    }

    if (cup.phase === 'groups') {
        const groups = cup.groups || [];
        if (recentMatches && recentMatches.length > 0) {
            groups.forEach(g => {
                g.fixtures = g.fixtures.map(f => {
                    if (f.result !== undefined) return f;
                    const played = recentMatches.find(m =>
                        ((f.id && m.id && f.id === m.id) ||
                        (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && m.week === f.week)) &&
                        m.result !== undefined
                    );
                    return played ? { ...f, result: played.result, penalties: played.penalties } : f;
                });
            });
        }
        const allPlayed = groups.length === 8 && groups.every(g => g.fixtures.length > 0 && g.fixtures.every(f => f.result !== undefined));
        if (!allPlayed) return cup;

        const firsts: Team[] = [];
        const seconds: Team[] = [];

        groups.forEach(group => {
            // Recalculate table from completed fixtures to ensure exact accuracy
            const tableMap = new Map<number, LeagueTableRow>();
            group.table.forEach((r: LeagueTableRow) => {
                tableMap.set(r.teamId, { ...r, points: 0, goalDifference: 0, goalsFor: 0, goalsAgainst: 0, played: 0, won: 0, drawn: 0, lost: 0, form: [] });
            });
            group.fixtures.forEach((f: Match) => {
                if (f.result) {
                    const h = tableMap.get(f.homeTeamId);
                    const a = tableMap.get(f.awayTeamId);
                    if (h && a) {
                        h.played++; a.played++;
                        h.goalsFor += f.result.homeScore; a.goalsFor += f.result.awayScore;
                        h.goalsAgainst += f.result.awayScore; a.goalsAgainst += f.result.homeScore;
                        h.goalDifference = h.goalsFor - h.goalsAgainst;
                        a.goalDifference = a.goalsFor - a.goalsAgainst;
                        if (f.result.homeScore > f.result.awayScore) { h.won++; h.points += 3; a.lost++; }
                        else if (f.result.awayScore > f.result.homeScore) { a.won++; a.points += 3; h.lost++; }
                        else { h.drawn++; h.points += 1; a.drawn++; a.points += 1; }
                    }
                }
            });
            group.table = Array.from(tableMap.values());

            const sortedTable = [...group.table].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
                return 0;
            });
            const team1 = allTeams.find(t => t.id === sortedTable[0]?.teamId);
            const team2 = allTeams.find(t => t.id === sortedTable[1]?.teamId);
            if (team1) firsts.push(team1);
            if (team2) seconds.push(team2);
        });

        const shuffledFirsts = [...firsts].sort(() => 0.5 - Math.random());
        const shuffledSeconds = [...seconds].sort(() => 0.5 - Math.random());
        const fixturesWithWeek: Match[] = [];
        const secondLegFixtures: Match[] = [];
        const matchCount = Math.min(shuffledFirsts.length, shuffledSeconds.length);
        for (let i = 0; i < matchCount; i++) {
            fixturesWithWeek.push({
                week: nextWeek,
                homeTeamId: shuffledSeconds[i].id, // 2nd place plays home first
                awayTeamId: shuffledFirsts[i].id,  // 1st place plays away first
                competition: 'Copa_Libertadores',
                isCupMatch: true,
                isMidweek: true,
                leg: 1
            });
            secondLegFixtures.push({
                week: nextWeek + 2,
                homeTeamId: shuffledFirsts[i].id,  // 1st place plays return leg at home
                awayTeamId: shuffledSeconds[i].id,
                competition: 'Copa_Libertadores',
                isCupMatch: true,
                isMidweek: true,
                leg: 2
            });
        }

        return {
            ...cup,
            phase: 'knockout',
            rounds: [{ 
                name: 'Round of 16', 
                fixtures: fixturesWithWeek, 
                secondLegFixtures, 
                completed: false 
            }],
            currentRoundIndex: 0,
            newFixtures: [...fixturesWithWeek, ...secondLegFixtures]
        };
    }

    if (cup.phase === 'knockout') {
        const updated = advanceCupRound(cup, allTeams, nextWeek, recentMatches);
        const currentRound = updated.rounds[updated.currentRoundIndex];
        const newFixtures = (updated.currentRoundIndex > cup.currentRoundIndex) 
            ? [...currentRound.fixtures, ...(currentRound.secondLegFixtures || [])] 
            : undefined;
        return {
            ...updated,
            newFixtures
        };
    }

    return cup;
};

/**
 * Advances a knockout cup to the next round, crowns a champion upon final completion.
 */
export const advanceCupRound = (
    cup: CupCompetition, 
    allTeams: Team[], 
    nextWeek: number,
    recentMatches?: Match[]
): CupCompetition => {
    if (!cup || !cup.rounds || cup.rounds.length === 0) return cup;

    const currentRound = cup.rounds[cup.currentRoundIndex];
    if (!currentRound) return cup;
    
    if (recentMatches && recentMatches.length > 0) {
        currentRound.fixtures = currentRound.fixtures.map(f => {
            if (f.result !== undefined) return f;
            const played = recentMatches.find(m => 
                ((f.id && m.id === f.id) ||
                (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && (m.week === f.week || (!m.week && !f.week)))) &&
                m.result !== undefined
            );
            return played ? { ...f, result: played.result, penalties: played.penalties || played.result?.penalties } : f;
        });

        if (currentRound.secondLegFixtures) {
            currentRound.secondLegFixtures = currentRound.secondLegFixtures.map(f => {
                if (f.result !== undefined) return f;
                const played = recentMatches.find(m => 
                    ((f.id && m.id === f.id) ||
                    (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && (m.week === f.week || (!m.week && !f.week)))) &&
                    m.result !== undefined
                );
                return played ? { ...f, result: played.result, penalties: played.penalties || played.result?.penalties } : f;
            });
        }
    }

    const allFirstLegsPlayed = currentRound.fixtures.every(m => m.result !== undefined);
    const allSecondLegsPlayed = !currentRound.secondLegFixtures || currentRound.secondLegFixtures.every(m => m.result !== undefined);

    // If either leg is still incomplete, the round is still in progress
    if (!allFirstLegsPlayed || !allSecondLegsPlayed) {
        return cup;
    }
    
    const winners: number[] = [];
    if (currentRound.secondLegFixtures && currentRound.secondLegFixtures.length > 0) {
        currentRound.fixtures.forEach((leg1, idx) => {
            const leg2 = currentRound.secondLegFixtures![idx];
            if (leg2) {
                const winnerId = determineTwoLeggedTieWinner(leg1, leg2);
                if (winnerId !== null) winners.push(winnerId);
            } else {
                const winnerId = determineCupWinner(leg1);
                if (winnerId !== null) winners.push(winnerId);
            }
        });
    } else {
        currentRound.fixtures.forEach(match => {
            const winnerId = determineCupWinner(match);
            if (winnerId !== null) {
                winners.push(winnerId);
            }
        });
    }

    if (winners.length === 1 && (currentRound.fixtures.length === 1 || currentRound.name.toLowerCase().includes('final'))) {
        const winnerTeam = allTeams.find(t => t.id === winners[0]);
        const updatedStatistics = {
            ...cup.statistics,
            championsHistory: [
                {
                    season: new Date().getFullYear(),
                    winnerId: winners[0],
                    winnerName: winnerTeam?.name || 'Unknown'
                },
                ...(cup.statistics?.championsHistory || [])
            ].slice(0, 10)
        };

        return {
            ...cup,
            winnerId: winners[0],
            phase: 'finished',
            statistics: updatedStatistics,
            rounds: cup.rounds.map((r, idx) =>
                idx === cup.currentRoundIndex ? { ...r, completed: true } : r
            )
        };
    }

    let competitionType: Match['competition'] = 'FA_Cup';
    if (cup.id === 'carabao_cup') competitionType = 'Carabao_Cup';
    if (cup.id === 'copa_del_rey') competitionType = 'Copa_Del_Rey';
    if (cup.id === 'dfb_pokal') competitionType = 'DFB_Pokal';
    if (cup.id === 'coppa_italia') competitionType = 'Coppa_Italia';
    if (cup.id === 'copa_argentina') competitionType = 'Copa_Argentina';
    if (cup.id === 'apertura_playoffs') competitionType = 'Playoffs_Apertura';
    if (cup.id === 'clausura_playoffs') competitionType = 'Playoffs_Clausura';
    if (cup.id === 'nacional_reducido') competitionType = 'Nacional_Reducido';
    if (cup.id === 'champions_league') competitionType = 'Champions_League';
    if (cup.id === 'europa_league') competitionType = 'Europa_League';
    if (cup.id === 'copa_libertadores') competitionType = 'Copa_Libertadores';
    if (cup.id === 'copa_sudamericana') competitionType = 'Copa_Sudamericana';
    if (cup.id === 'copa_intercontinental') competitionType = 'Copa_Intercontinental';

    const isMidweekCompetition = 
        competitionType !== 'Playoffs_Apertura' &&
        competitionType !== 'Playoffs_Clausura' &&
        competitionType !== 'Nacional_Primer_Ascenso' &&
        competitionType !== 'Nacional_Reducido';

    const isInternational = isInternationalCompetition(cup.id);

    // Official UEFA Format: When Playoffs (16vos) finish, the 8 winners meet the 8 direct seeded teams in Octavos de Final
    if (cup.seededTeamIds && cup.seededTeamIds.length === 8 && winners.length === 8) {
        const seededTeams = cup.seededTeamIds.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
        const playoffWinnerTeams = winners.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);

        const octavosFixtures: Match[] = [];
        const octavosSecondLeg: Match[] = [];

        for (let i = 0; i < 8; i++) {
            const homeTeamId = playoffWinnerTeams[i]?.id ?? playoffWinnerTeams[0].id;
            const awayTeamId = seededTeams[7 - i]?.id ?? seededTeams[i].id;
            octavosFixtures.push({
                week: nextWeek,
                homeTeamId,
                awayTeamId,
                competition: competitionType,
                isCupMatch: true,
                isMidweek: isMidweekCompetition,
                leg: 1
            });
            octavosSecondLeg.push({
                week: nextWeek + 2,
                homeTeamId: awayTeamId,
                awayTeamId: homeTeamId,
                competition: competitionType,
                isCupMatch: true,
                isMidweek: isMidweekCompetition,
                leg: 2
            });
        }

        const updatedRounds = [
            ...cup.rounds.map((r, idx) =>
                idx === cup.currentRoundIndex ? { ...r, completed: true } : r
            ),
            {
                name: 'Round of 16',
                fixtures: octavosFixtures,
                secondLegFixtures: octavosSecondLeg,
                completed: false
            }
        ];

        return {
            ...cup,
            seededTeamIds: undefined,
            rounds: updatedRounds,
            currentRoundIndex: cup.currentRoundIndex + 1
        };
    }

    const winnerTeams = winners.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
    const nextRoundName = getNextRoundName(winners.length);
    const isFinalRound = winners.length === 2;

    const nextRoundFixtures: Match[] = [];
    const nextRoundSecondLeg: Match[] = [];

    for (let i = 0; i < winnerTeams.length; i += 2) {
        if (i + 1 < winnerTeams.length) {
            if (isInternational && !isFinalRound) {
                // Two-legged ties for international competitions before the final
                nextRoundFixtures.push({
                    week: nextWeek,
                    homeTeamId: winnerTeams[i].id,
                    awayTeamId: winnerTeams[i + 1].id,
                    competition: competitionType,
                    isCupMatch: true,
                    isMidweek: isMidweekCompetition,
                    leg: 1
                });
                nextRoundSecondLeg.push({
                    week: nextWeek + 2,
                    homeTeamId: winnerTeams[i + 1].id,
                    awayTeamId: winnerTeams[i].id,
                    competition: competitionType,
                    isCupMatch: true,
                    isMidweek: isMidweekCompetition,
                    leg: 2
                });
            } else {
                // Single match for Final or domestic cups (e.g. Copa Argentina)
                nextRoundFixtures.push({
                    week: nextWeek,
                    homeTeamId: winnerTeams[i].id,
                    awayTeamId: winnerTeams[i + 1].id,
                    competition: competitionType,
                    isCupMatch: true,
                    isMidweek: isMidweekCompetition
                });
            }
        }
    }

    const updatedRounds = [
        ...cup.rounds.map((r, idx) =>
            idx === cup.currentRoundIndex ? { ...r, completed: true } : r
        ),
        {
            name: nextRoundName,
            fixtures: nextRoundFixtures,
            secondLegFixtures: nextRoundSecondLeg.length > 0 ? nextRoundSecondLeg : undefined,
            completed: false
        }
    ];

    return {
        ...cup,
        rounds: updatedRounds,
        currentRoundIndex: cup.currentRoundIndex + 1
    };
};

/**
 * Checks if both Champions League and Copa Libertadores are crowned to schedule the Intercontinental Final.
 */
export const checkAndScheduleIntercontinental = (gameState: { cups: Record<string, CupCompetition>, allTeams: Team[] }, nextWeek: number): CupCompetition | null => {
    const { championsLeague, copaLibertadores, copaIntercontinental } = gameState.cups;

    if (championsLeague?.winnerId && copaLibertadores?.winnerId && (!copaIntercontinental?.rounds || copaIntercontinental.rounds.length === 0)) {
        const clWinner = gameState.allTeams?.find(t => t.id === championsLeague.winnerId);
        const libWinner = gameState.allTeams?.find(t => t.id === copaLibertadores.winnerId);

        if (!clWinner || !libWinner) return null;

        const finalFixture: Match = {
            week: nextWeek + 2,
            homeTeamId: clWinner.id,
            awayTeamId: libWinner.id,
            competition: 'Copa_Intercontinental',
            isCupMatch: true,
            isMidweek: true
        };

        return {
            ...copaIntercontinental,
            rounds: [{
                name: 'Final Intercontinental',
                fixtures: [finalFixture],
                completed: false
            }],
            currentRoundIndex: 0
        };
    }

    return null;
};

/**
 * Resolves an unplayed cup match deterministically based on team ratings and form,
 * ensuring cup matches never remain drawn and always determine a winner via penalties if tied.
 */
export const resolveUnplayedCupMatch = (match: Match, allTeams: Team[]): void => {
    if (match.result) return;

    const homeTeam = allTeams.find(t => t.id === match.homeTeamId);
    const awayTeam = allTeams.find(t => t.id === match.awayTeamId);
    const getRating = (team?: Team): number => {
        if (!team) return 75;
        if ((team as any).rating) return (team as any).rating;
        if (team.squad && team.squad.length > 0) {
            return Math.round(team.squad.reduce((acc, p) => acc + p.rating, 0) / team.squad.length);
        }
        return 75;
    };
    const homeRating = getRating(homeTeam);
    const awayRating = getRating(awayTeam);
    const ratingDiff = (homeRating - awayRating) / 10;

    const homeExpected = Math.max(0.6, 1.6 + ratingDiff * 0.4);
    const awayExpected = Math.max(0.4, 1.2 - ratingDiff * 0.4);

    let homeScore = Math.floor(Math.random() * (homeExpected + 1.4));
    let awayScore = Math.floor(Math.random() * (awayExpected + 1.4));

    let penalties: { home: number; away: number } | undefined;
    if (homeScore === awayScore) {
        const homeWinsPenalties = Math.random() + (ratingDiff * 0.1) >= 0.5;
        if (homeWinsPenalties) {
            penalties = { home: 5, away: 4 };
        } else {
            penalties = { home: 3, away: 5 };
        }
    }

    match.result = {
        homeScore,
        awayScore,
        events: [],
        scorers: []
    };
    if (penalties) {
        match.penalties = penalties;
    }
};

/**
 * Progresses an unfinished cup competition all the way to its grand final,
 * guaranteeing that every remaining round is played and a champion is crowned.
 */
export const finalizeSingleCupCompetition = (
    cup: CupCompetition,
    allTeams: Team[]
): CupCompetition => {
    if (!cup) return cup;
    if (cup.winnerId) return cup;

    // 1. If in Swiss Phase, resolve unplayed fixtures and advance to knockout
    if (cup.phase === 'swiss') {
        cup.swissFixtures?.forEach(f => {
            if (!f.result) {
                resolveUnplayedCupMatch(f, allTeams);
            }
        });
        cup = progressInternationalCup(cup, allTeams, 22, cup.swissFixtures);
    }

    // 2. If in Group Stage, resolve unplayed fixtures and advance to knockout
    if (cup.phase === 'groups') {
        const allGroupFixtures: Match[] = [];
        cup.groups?.forEach(g => {
            g.fixtures?.forEach(f => {
                if (!f.result) {
                    resolveUnplayedCupMatch(f, allTeams);
                }
                allGroupFixtures.push(f);
            });
        });
        cup = progressInternationalCup(cup, allTeams, 20, allGroupFixtures);
    }

    // 3. Knockout Phase: play each round sequentially until the champion is crowned
    let maxSafetyRounds = 12;
    while (!cup.winnerId && maxSafetyRounds > 0) {
        maxSafetyRounds--;
        if (!cup.rounds || cup.rounds.length === 0) break;
        const currentRound = cup.rounds[cup.currentRoundIndex];
        if (!currentRound || !currentRound.fixtures || currentRound.fixtures.length === 0) break;

        currentRound.fixtures.forEach(f => {
            if (!f.result) {
                resolveUnplayedCupMatch(f, allTeams);
            }
        });

        const prevIndex = cup.currentRoundIndex;
        cup = advanceCupRound(cup, allTeams, 0, currentRound.fixtures);
        if (cup.winnerId) break;
        if (cup.currentRoundIndex === prevIndex && !cup.winnerId) {
            // Check if final was played in currentRound
            if (currentRound.fixtures.length === 1 && currentRound.fixtures[0].result) {
                const wId = determineCupWinner(currentRound.fixtures[0]);
                if (wId) {
                    cup.winnerId = wId;
                    cup.phase = 'finished';
                    break;
                }
            }
            break;
        }
    }

    // Ensure winner is finalized and recorded in championsHistory
    if (cup.winnerId) {
        cup.phase = 'finished';
        const winningTeam = allTeams.find(t => t.id === cup.winnerId);
        if (winningTeam) {
            const currentYear = new Date().getFullYear();
            if (!cup.statistics) cup.statistics = { topScorers: [], championsHistory: [] };
            if (!cup.statistics.championsHistory) cup.statistics.championsHistory = [];
            const alreadyRecorded = cup.statistics.championsHistory.some(h => h.winnerId === cup.winnerId && h.season === currentYear);
            if (!alreadyRecorded) {
                cup.statistics.championsHistory.unshift({
                    season: currentYear,
                    winnerId: cup.winnerId,
                    winnerName: winningTeam.name
                });
            }
        }
    }

    return cup;
};

/**
 * Ensures all competitions of the season are completely resolved, crowned, and archived,
 * guaranteeing that NO tournament is left in "En Disputa" at season end.
 */
export const finalizeSeasonCompetitions = (
    cups: Record<string, CupCompetition | undefined>,
    allTeams: Team[],
    schedule?: Match[]
): void => {
    if (!cups) return;

    // Check if Clausura Playoffs need initialization from schedule
    if (schedule && (!cups.clausuraPlayoffs || !cups.clausuraPlayoffs.rounds || cups.clausuraPlayoffs.rounds.length === 0)) {
        const { zoneA, zoneB } = calculateTournamentStandings(schedule, 'Torneo_Clausura', allTeams);
        if (zoneA.length >= 8 && zoneB.length >= 8) {
            const octavosFixtures = generateArgentinePlayoffs(zoneA.slice(0, 8), zoneB.slice(0, 8), 'Playoffs_Clausura', 37);
            cups.clausuraPlayoffs = {
                id: 'clausura_playoffs',
                name: 'Playoffs Clausura',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round of 16', fixtures: octavosFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: cups.clausuraPlayoffs?.statistics?.championsHistory || [] }
            };
        }
    }

    const cupKeys = Object.keys(cups);
    for (const key of cupKeys) {
        const cup = cups[key];
        if (cup && !cup.winnerId) {
            cups[key] = finalizeSingleCupCompetition(cup, allTeams);
        }
    }

    // After Champions League and Libertadores are crowned, check & finalize Intercontinental
    if (!cups.copaIntercontinental?.winnerId && cups.championsLeague?.winnerId && cups.copaLibertadores?.winnerId) {
        const interCup = checkAndScheduleIntercontinental({ cups: cups as Record<string, CupCompetition>, allTeams }, 38);
        if (interCup) {
            cups.copaIntercontinental = finalizeSingleCupCompetition(interCup, allTeams);
        }
    }
};

export const createInitialEuropeanTable = (teamIds: number[]): EuropeanTableRow[] => {
    return teamIds.map(id => ({
        teamId: id, position: 0, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
    }));
};

export const generateSwissPhase = (teams: Team[], competition: Match['competition'], numMatches: number = 8): { table: EuropeanTableRow[], fixtures: Match[] } => {
    const teamIds = teams.map(t => t.id);
    const table: EuropeanTableRow[] = teams.map((t, idx) => ({
        teamId: t.id,
        position: idx + 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
    }));

    const balancedFixtures: Match[] = [];

    for (let j = 1; j <= numMatches; j++) {
        const usedThisRound = new Set<number>();
        for (let i = 0; i < teamIds.length; i++) {
            const home = teamIds[i];
            if (usedThisRound.has(home)) continue;
            
            const away = teamIds[(i + j) % teamIds.length];
            if (usedThisRound.has(away)) continue;

            balancedFixtures.push({
                week: j * 2,
                homeTeamId: j % 2 === 0 ? home : away,
                awayTeamId: j % 2 === 0 ? away : home,
                competition,
                isCupMatch: true,
                isMidweek: true
            });

            usedThisRound.add(home);
            usedThisRound.add(away);
        }
    }

    return { table, fixtures: balancedFixtures };
};

export const generateGroupPhase = (teams: Team[], competition: Match['competition']): CupGroup[] => {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const groups: CupGroup[] = [];
    const numGroups = Math.floor(teams.length / 4);

    for (let i = 0; i < numGroups; i++) {
        const groupTeams = shuffled.slice(i * 4, (i + 1) * 4);
        const teamIds = groupTeams.map(t => t.id);
        const groupTable = groupTeams.map(t => ({
            teamId: t.id,
            position: 0,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: [] as ('W' | 'D' | 'L')[]
        }));

        const fixtures: Match[] = [];
        const pairings = [
            [0, 1], [2, 3],
            [0, 2], [1, 3],
            [0, 3], [1, 2],
        ];

        pairings.forEach((p, idx) => {
            fixtures.push({
                week: (idx + 1) * 2,
                homeTeamId: teamIds[p[0]],
                awayTeamId: teamIds[p[1]],
                competition,
                isCupMatch: true,
                isMidweek: true
            });
            fixtures.push({
                week: (idx + 4) * 2,
                homeTeamId: teamIds[p[1]],
                awayTeamId: teamIds[p[0]],
                competition,
                isCupMatch: true,
                isMidweek: true
            });
        });

        groups.push({
            id: `group_${String.fromCharCode(65 + i)}`,
            name: `Grupo ${String.fromCharCode(65 + i)}`,
            teams: teamIds,
            table: groupTable,
            fixtures
        });
    }

    return groups;
};
