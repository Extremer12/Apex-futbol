import { Team } from './types';
import { getRegionalWageScale } from './services/economy';
import { ensureMinimumSquadDepth } from './data/teams/squadHelpers';
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
import { chileanTeams, chileanExpansionTeams } from './data/teams/ligaChile';
import { colombianTeams, colombianExpansionTeams } from './data/teams/ligaColombia';
import { segundaDivisionTeams, zweiteBundesligaTeams, serieBItaTeams } from './data/teams/secondDivisions';
import { primeiraLigaTeams, eredivisieTeams } from './data/teams/europeExpansion';
import { mlsTeams, uruguayExpansionTeams, ecuadorExpansionTeams } from './data/teams/americasExpansion';
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
  ...(chileanTeams || []),
  ...(chileanExpansionTeams || []),
  ...(colombianTeams || []),
  ...(colombianExpansionTeams || []),
  ...(primeiraLigaTeams || []),
  ...(eredivisieTeams || []),
  ...(uruguayExpansionTeams || []),
  ...(ecuadorExpansionTeams || []),
  ...(mlsTeams || []),
  ...(SOUTH_AMERICAN_EXTRA_TEAMS || []),
];

export const TEAMS: Team[] = rawTeams.map(team => {
  const wageScale = getRegionalWageScale(team.leagueId, team.tier);
  const rawSquad = ensureMinimumSquadDepth(team.squad || [], team.id);
  return {
    ...team,
    budget: team.budget && team.budget < 10_000 ? team.budget * 1_000_000 : (team.budget || 10_000_000),
    transferBudget: team.transferBudget && team.transferBudget < 10_000 ? team.transferBudget * 1_000_000 : (team.transferBudget || 5_000_000),
    squad: rawSquad.map(player => ({
      ...player,
      value: player.value && player.value < 10_000 ? player.value * 1_000_000 : (player.value || 1_000_000),
      wage: wageScale !== 1.0
        ? Math.max(1_000, Math.round((player.wage * wageScale) / 250) * 250)
        : player.wage
    }))
  };
});

// Safety guard for sorting to prevent crashes if any team object is malformed
TEAMS.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
