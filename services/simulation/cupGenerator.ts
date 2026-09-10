import { Team, Match, CupCompetition, EuropeanTableRow, CupGroup } from '../../types';

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
        return match.penalties.home > match.penalties.away ? match.homeTeamId : match.awayTeamId;
    }
    if (match.result.penalties) {
        return match.result.penalties.home > match.result.penalties.away ? match.homeTeamId : match.awayTeamId;
    }

    return match.homeTeamId;
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
                        (m.id === f.id) ||
                        (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && m.week === f.week && m.result !== undefined)
                    );
                    if (played) {
                        f.result = played.result;
                        f.penalties = played.penalties;
                    }
                }
            });
        }
        const allPlayed = fixtures.every(f => f.result !== undefined);
        if (!allPlayed) return cup;

        // Transition Swiss -> Knockout (Round of 16)
        const sortedTable = [...(cup.swissTable || [])].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });

        const qualifiedIds = sortedTable.slice(0, 16).map(r => r.teamId);
        const qualifiedTeams = qualifiedIds.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
        
        const knockoutFixtures = generateCupDraw(qualifiedTeams, 'Round of 16', cup.id === 'champions_league' ? 'Champions_League' : 'Europa_League');
        const fixturesWithWeek = knockoutFixtures.map(f => ({ ...f, week: nextWeek }));

        return {
            ...cup,
            phase: 'knockout',
            rounds: [{ name: 'Round of 16', fixtures: fixturesWithWeek, completed: false }],
            currentRoundIndex: 0,
            newFixtures: fixturesWithWeek
        };
    }

    if (cup.phase === 'groups') {
        const groups = cup.groups || [];
        if (recentMatches && recentMatches.length > 0) {
            groups.forEach(g => {
                g.fixtures = g.fixtures.map(f => {
                    if (f.result !== undefined) return f;
                    const played = recentMatches.find(m =>
                        (m.id === f.id) ||
                        (m.homeTeamId === f.homeTeamId && m.awayTeamId === f.awayTeamId && m.competition === f.competition && m.week === f.week && m.result !== undefined)
                    );
                    return played ? { ...f, result: played.result, penalties: played.penalties } : f;
                });
            });
        }
        const allPlayed = groups.every(g => g.fixtures.every(f => f.result !== undefined));
        if (!allPlayed) return cup;

        const firsts: Team[] = [];
        const seconds: Team[] = [];

        groups.forEach(group => {
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
        const matchCount = Math.min(shuffledFirsts.length, shuffledSeconds.length);
        for (let i = 0; i < matchCount; i++) {
            fixturesWithWeek.push({
                week: nextWeek,
                homeTeamId: shuffledFirsts[i].id,
                awayTeamId: shuffledSeconds[i].id,
                competition: 'Copa_Libertadores',
                isCupMatch: true,
                isMidweek: true
            });
        }

        return {
            ...cup,
            phase: 'knockout',
            rounds: [{ name: 'Round of 16', fixtures: fixturesWithWeek, completed: false }],
            currentRoundIndex: 0,
            newFixtures: fixturesWithWeek
        };
    }

    if (cup.phase === 'knockout') {
        const updated = advanceCupRound(cup, allTeams, nextWeek, recentMatches);
        const currentRound = updated.rounds[updated.currentRoundIndex];
        return {
            ...updated,
            newFixtures: (updated.currentRoundIndex > cup.currentRoundIndex) ? currentRound.fixtures : undefined
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
                m.homeTeamId === f.homeTeamId && 
                m.awayTeamId === f.awayTeamId && 
                m.competition === f.competition &&
                m.result !== undefined
            );
            return played ? { ...f, result: played.result, penalties: played.penalties || played.result?.penalties } : f;
        });
    }

    const allMatchesPlayed = currentRound.fixtures.every(m => m.result !== undefined);
    if (!allMatchesPlayed) {
        return cup;
    }
    
    const winners: number[] = [];
    currentRound.fixtures.forEach(match => {
        const winnerId = determineCupWinner(match);
        if (winnerId !== null) {
            winners.push(winnerId);
        }
    });

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

    const winnerTeams = winners.map(id => allTeams.find(t => t.id === id)!).filter(Boolean);
    const nextRoundName = getNextRoundName(winners.length);
    
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

    const nextRoundFixtures: Match[] = [];
    for (let i = 0; i < winnerTeams.length; i += 2) {
        if (i + 1 < winnerTeams.length) {
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

    const fixturesWithWeek = nextRoundFixtures.map(f => ({ ...f, week: nextWeek }));

    const updatedRounds = [
        ...cup.rounds.map((r, idx) =>
            idx === cup.currentRoundIndex ? { ...r, completed: true } : r
        ),
        {
            name: nextRoundName,
            fixtures: fixturesWithWeek,
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

    if (championsLeague.winnerId && copaLibertadores.winnerId && (!copaIntercontinental.rounds || copaIntercontinental.rounds.length === 0)) {
        const clWinner = gameState.allTeams.find(t => t.id === championsLeague.winnerId)!;
        const libWinner = gameState.allTeams.find(t => t.id === copaLibertadores.winnerId)!;

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
