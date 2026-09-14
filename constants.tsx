import { Team } from './types';
import { premierLeagueTeams } from './data/teams/premierLeague';
import { championshipTeams } from './data/teams/championship';
import { laLigaTeams } from './data/teams/laLiga';
import { bundesligaTeams } from './data/teams/bundesliga';
import { serieATeams } from './data/teams/serieA';
import { ligue1Teams, ligue2Teams } from './data/teams/ligue1';
import { ligaArgentinaTeams, primeraNacionalTeams } from './data/teams/ligaArgentina';
import { brasileiraoTeams, serieBBrTeams } from './data/teams/brasileirao';
import { copaDePrimeraTeams } from './data/teams/copaDePrimera';
import { ligaMxTeams, ligaExpansionMxTeams } from './data/teams/ligaMx';
import { segundaDivisionTeams, zweiteBundesligaTeams, serieBItaTeams } from './data/teams/secondDivisions';
import { SOUTH_AMERICAN_EXTRA_TEAMS } from './data/teams/southAmericanClubs';

export * from './data/teams/helpers';

const rawTeams: Team[] = [
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
  ...(copaDePrimeraTeams || []),
  ...(ligaMxTeams || []),
  ...(ligaExpansionMxTeams || []),
  ...(SOUTH_AMERICAN_EXTRA_TEAMS || []),
];

export const TEAMS: Team[] = rawTeams.map(team => ({
  ...team,
  budget: team.budget && team.budget < 10_000 ? team.budget * 1_000_000 : (team.budget || 10_000_000),
  transferBudget: team.transferBudget && team.transferBudget < 10_000 ? team.transferBudget * 1_000_000 : (team.transferBudget || 5_000_000),
  squad: (team.squad || []).map(player => ({
    ...player,
    value: player.value && player.value < 10_000 ? player.value * 1_000_000 : (player.value || 1_000_000)
  }))
}));

// Safety guard for sorting to prevent crashes if any team object is malformed
TEAMS.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
