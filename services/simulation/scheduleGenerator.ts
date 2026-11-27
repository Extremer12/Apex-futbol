import { Team, Match, LeagueTableRow, LeagueId } from '../../types';
import { generateArgentineTournamentSchedule, generatePrimeraNacionalSchedule } from './argentineFormat';

/**
 * Generates a balanced double round-robin schedule using the circle method,
 * inserting a bye week when the league has an odd number of teams.
 */
export const buildDoubleRoundRobin = (
    teams: Team[],
    competition: Match['competition'] = 'League'
): Match[] => {
    if (teams.length < 2) return [];
    const shuffledIds: Array<number | null> = [...teams]
        .sort(() => 0.5 - Math.random())
        .map(t => t.id);
    if (shuffledIds.length % 2 !== 0) {
        shuffledIds.push(null); // Bye slot for odd-sized leagues
    }
    const schedule: Match[] = [];
    const numWeeks = shuffledIds.length - 1;
    const halfSeasonSize = shuffledIds.length / 2;
    const teamsSlice = shuffledIds.slice(1);

    for (let week = 0; week < numWeeks; week++) {
        const weekFixtures: { home: number | null; away: number | null }[] = [];
        const awayTeamIndex = week % teamsSlice.length;
        weekFixtures.push({ home: shuffledIds[0], away: teamsSlice[awayTeamIndex] });
        for (let i = 1; i < halfSeasonSize; i++) {
            const homeIndex = (week + i) % teamsSlice.length;
            const awayIndex = (week + teamsSlice.length - i) % teamsSlice.length;
            weekFixtures.push({ home: teamsSlice[homeIndex], away: teamsSlice[awayIndex] });
        }
        weekFixtures.forEach(fixture => {
            if (fixture.home === null || fixture.away === null) return;
            schedule.push({
                week: week + 1,
                homeTeamId: fixture.home,
                awayTeamId: fixture.away,
                competition,
                isCupMatch: false
            });
        });
    }
    const secondHalf = schedule.map(match => ({
        week: match.week + numWeeks,
        homeTeamId: match.awayTeamId,
        awayTeamId: match.homeTeamId,
        competition,
        isCupMatch: false
    }));
    return [...schedule, ...secondHalf];
};

/**
 * Generates a standard double round-robin league schedule.
 */
export const generateLeagueSchedule = (teams: Team[], _leagueId: string): Match[] => {
    return buildDoubleRoundRobin(teams, 'League');
};

/**
 * Initializes a clean league table for an array of teams.
 */
export const createInitialLeagueTable = (teams: Team[]): LeagueTableRow[] => {
    return teams.map(team => ({
        teamId: team.id, position: 0, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [],
        zone: team.zone,
        promedio: 0,
        playedTotal: 0,
        pointsTotal: 0,
    })).sort((a, b) => teams.find(t => t.id === a.teamId)!.name.localeCompare(teams.find(t => t.id === b.teamId)!.name));
};

/**
 * Generates the unified season schedule across all supported leagues.
 */
export const generateSeasonSchedule = (allTeams: Team[], season: number = 2026): Match[] => {
    const leaguesToSchedule = Object.values(LeagueId);

    let fullSchedule: Match[] = [];

    for (const leagueId of leaguesToSchedule) {
        const teamsInLeague = allTeams.filter(t => t.leagueId === leagueId);
        if (teamsInLeague.length > 0) {
            if (leagueId === LeagueId.LIGA_ARGENTINA) {
                const schedule = generateArgentineTournamentSchedule(teamsInLeague, season);
                fullSchedule = [...fullSchedule, ...schedule];
            } else if (leagueId === LeagueId.PRIMERA_NACIONAL) {
                const schedule = generatePrimeraNacionalSchedule(teamsInLeague);
                fullSchedule = [...fullSchedule, ...schedule];
            } else {
                const schedule = generateLeagueSchedule(teamsInLeague, leagueId);
                fullSchedule = [...fullSchedule, ...schedule];
            }
        }
    }

    return fullSchedule;
};
