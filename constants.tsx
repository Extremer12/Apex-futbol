import { Team } from './types';
import { premierLeagueTeams } from './data/teams/premierLeague';
import { championshipTeams } from './data/teams/championship';
import { laLigaTeams } from './data/teams/laLiga';
import { bundesligaTeams } from './data/teams/bundesliga';
import { serieATeams } from './data/teams/serieA';
import { ligue1Teams, ligue2Teams } from './data/teams/ligue1';
import { ligaArgentinaTeams, primeraNacionalTeams } from './data/teams/ligaArgentina';
import { brasileiraoTeams, serieBBrTeams } from './data/teams/brasileirao';
import { segundaDivisionTeams, zweiteBundesligaTeams, serieBItaTeams } from './data/teams/secondDivisions';

export * from './data/teams/helpers';

export const TEAMS: Team[] = [
  ...(premierLeagueTeams || []),
  ...(championshipTeams || []),
  ...(laLigaTeams || []),
  ...(segundaDivisionTeams || []),
  ...(bundesligaTeams || []),
  ...(zweiteBundesligaTeams || []),
  ...(serieATeams || []),
  ...(serieBItaTeams || []),
  ...(ligue1Teams || []),
  ...(ligue2Teams || []),
  ...(ligaArgentinaTeams || []),
  ...(primeraNacionalTeams || []),
  ...(brasileiraoTeams || []),
  ...(serieBBrTeams || []),
];

// Safety guard for sorting to prevent crashes if any team object is malformed
TEAMS.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
