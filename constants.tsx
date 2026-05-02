import { Team } from './types';
import { premierLeagueTeams } from './data/teams/premierLeague';
import { championshipTeams } from './data/teams/championship';
import { laLigaTeams } from './data/teams/laLiga';
import { bundesligaTeams } from './data/teams/bundesliga';
import { serieATeams } from './data/teams/serieA';

export * from './data/teams/helpers';

export const TEAMS: Team[] = [
  ...premierLeagueTeams,
  ...championshipTeams,
  ...laLigaTeams,
  ...bundesligaTeams,
  ...serieATeams
];

// By separating the sort from the array declaration, TypeScript can correctly
// apply contextual typing to the array literal, avoiding potential type errors.
TEAMS.sort((a, b) => a.name.localeCompare(b.name));
