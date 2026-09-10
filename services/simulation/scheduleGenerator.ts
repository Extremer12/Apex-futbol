import { Team, Match, LeagueTableRow, LeagueId } from '../../types';
import { generateArgentineTournamentSchedule, generatePrimeraNacionalSchedule } from './argentineFormat';

/**
 * Generates a standard double round-robin league schedule.
 */
export const generateLeagueSchedule = (teams: Team[], leagueId: string): Match[] => {
    // Shuffle teams before round-robin generation so match calendar varies every season
    const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
    const teamIds = shuffledTeams.map(t => t.id);
    if (teamIds.length % 2 !== 0) return []; // Should handle odd teams with byes ideally
    const schedule: Match[] = [];
    const numWeeks = teamIds.length - 1;
    const halfSeasonSize = teamIds.length / 2;
    const teamsSlice = teamIds.slice(1);

    for (let week = 0; week < numWeeks; week++) {
        const weekFixtures: { home: number, away: number }[] = [];
        const awayTeamIndex = week % teamsSlice.length;
        weekFixtures.push({ home: teamIds[0], away: teamsSlice[awayTeamIndex] });
        for (let i = 1; i < halfSeasonSize; i++) {
            const homeIndex = (week + i) % teamsSlice.length;
            const awayIndex = (week + teamsSlice.length - i) % teamsSlice.length;
            weekFixtures.push({ home: teamsSlice[homeIndex], away: teamsSlice[awayIndex] });
        }
        weekFixtures.forEach(fixture => schedule.push({
            week: week + 1,
            homeTeamId: fixture.home,
            awayTeamId: fixture.away,
            competition: 'League' as const,
            isCupMatch: false
        }));
    }
    const secondHalf = schedule.map(match => ({
        week: match.week + numWeeks,
        homeTeamId: match.awayTeamId,
        awayTeamId: match.homeTeamId,
        competition: 'League' as const,
        isCupMatch: false
    }));
    return [...schedule, ...secondHalf];
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
export const generateSeasonSchedule = (allTeams: Team[], season: number = 2024): Match[] => {
    const leaguesToSchedule = [
        LeagueId.PREMIER_LEAGUE, LeagueId.CHAMPIONSHIP,
        LeagueId.LA_LIGA, LeagueId.SEGUNDA_DIVISION_ESP,
        LeagueId.BUNDESLIGA, LeagueId.ZWEITE_BUNDESLIGA,
        LeagueId.SERIE_A, LeagueId.SERIE_B_ITA,
        LeagueId.LIGUE_1, LeagueId.LIGUE_2,
        LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA
    ];

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
