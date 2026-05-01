const fs = require('fs');

const constantsPath = 'constants.tsx';
const content = fs.readFileSync(constantsPath, 'utf8');

const plMatch = content.match(/export const TEAMS: Team\[\] = \[\s*\/\/ ... \(Existing Premier League Teams - kept as is\)\s*([\s\S]*?)\/\/ --- CHAMPIONSHIP TEAMS ---/);

const champMatch = content.match(/\/\/ --- CHAMPIONSHIP TEAMS ---\s*([\s\S]*?)\/\/ --- LA LIGA TEAMS ---/);

const laligaMatch = content.match(/\/\/ --- LA LIGA TEAMS ---\s*([\s\S]*?)\];/);

const createTeamFile = (name, data) => {
    return `import { Team, LeagueId } from '../../types';\nimport { createTeamLogo, TEAM_LOGOS, createGenericSquad } from './helpers';\n\nexport const ${name}: Team[] = [\n${data.trim()}\n];\n`;
};

fs.mkdirSync('data/teams', { recursive: true });

if (plMatch) fs.writeFileSync('data/teams/premierLeague.ts', createTeamFile('premierLeagueTeams', plMatch[1]));
if (champMatch) fs.writeFileSync('data/teams/championship.ts', createTeamFile('championshipTeams', champMatch[1]));
if (laligaMatch) fs.writeFileSync('data/teams/laLiga.ts', createTeamFile('laLigaTeams', laligaMatch[1]));

console.log('Split files created.');
