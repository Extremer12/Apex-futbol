import { Team } from './types';
import { premierLeagueTeams } from './data/teams/premierLeague';
import { championshipTeams } from './data/teams/championship';
import { laLigaTeams } from './data/teams/laLiga';

export * from './data/teams/helpers';

export const TEAMS: Team[] = [
  ...premierLeagueTeams,
  ...championshipTeams,
  ...laLigaTeams
];

// By separating the sort from the array declaration, TypeScript can correctly
// apply contextual typing to the array literal, avoiding potential type errors.
TEAMS.sort((a, b) => a.name.localeCompare(b.name));
