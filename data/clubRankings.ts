import { GameState, Team } from '../types';
import { SOUTH_AMERICAN_EXTRA_TEAMS, KNOWN_CONMEBOL_META } from './teams/southAmericanClubs';

export interface ConmebolClubRankingItem {
    rank: number;
    teamName: string;
    shortName?: string;
    country: 'ARG' | 'BRA' | 'URU' | 'PAR' | 'CHI' | 'COL' | 'ECU' | 'BOL' | 'PER' | 'VEN';
    countryName: string;
    flagUrl: string;
    points: number;
    libertadoresTitles: number;
    sudamericanaTitles: number;
    potStatus: 'Bombo 1 (Cabeza de Serie)' | 'Bombo 2' | 'Bombo 3' | 'Bombo 4 / Fases Previas';
    logoUrl?: string;
    teamId?: number;
}

export interface UefaClubRankingItem {
    rank: number;
    teamName: string;
    country: 'ENG' | 'ESP' | 'GER' | 'ITA' | 'FRA' | 'POR' | 'NED' | 'AUT' | 'SCO' | 'BEL';
    countryName: string;
    flagUrl: string;
    coefficient: number;
    championsTitles: number;
    europaTitles: number;
    potStatus: 'Bombo 1 (Cabezas de Serie)' | 'Bombo 2' | 'Bombo 3' | 'Bombo 4 / Fase de Liga';
    logoUrl?: string;
    teamId?: number;
}

export const COUNTRY_META: Record<string, { name: string; flag: string }> = {
    ARG: { name: 'Argentina', flag: 'https://flagcdn.com/ar.svg' },
    BRA: { name: 'Brasil', flag: 'https://flagcdn.com/br.svg' },
    URU: { name: 'Uruguay', flag: 'https://flagcdn.com/uy.svg' },
    PAR: { name: 'Paraguay', flag: 'https://flagcdn.com/py.svg' },
    CHI: { name: 'Chile', flag: 'https://flagcdn.com/cl.svg' },
    COL: { name: 'Colombia', flag: 'https://flagcdn.com/co.svg' },
    ECU: { name: 'Ecuador', flag: 'https://flagcdn.com/ec.svg' },
    BOL: { name: 'Bolivia', flag: 'https://flagcdn.com/bo.svg' },
    PER: { name: 'Perú', flag: 'https://flagcdn.com/pe.svg' },
    VEN: { name: 'Venezuela', flag: 'https://flagcdn.com/ve.svg' },
    ENG: { name: 'Inglaterra', flag: 'https://flagcdn.com/gb-eng.svg' },
    ESP: { name: 'España', flag: 'https://flagcdn.com/es.svg' },
    GER: { name: 'Alemania', flag: 'https://flagcdn.com/de.svg' },
    ITA: { name: 'Italia', flag: 'https://flagcdn.com/it.svg' },
    FRA: { name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
    POR: { name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
    NED: { name: 'Países Bajos', flag: 'https://flagcdn.com/nl.svg' },
    AUT: { name: 'Austria', flag: 'https://flagcdn.com/at.svg' },
    SCO: { name: 'Escocia', flag: 'https://flagcdn.com/gb-sct.svg' },
    BEL: { name: 'Bélgica', flag: 'https://flagcdn.com/be.svg' },
};

/**
 * Authentic CONMEBOL Club Ranking (Official CONMEBOL coefficient standings)
 */
export const OFFICIAL_CONMEBOL_RANKING: Omit<ConmebolClubRankingItem, 'flagUrl' | 'countryName'>[] = [
    { rank: 1, teamName: 'River Plate', country: 'ARG', points: 10204, libertadoresTitles: 4, sudamericanaTitles: 1, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 2, teamName: 'Palmeiras', country: 'BRA', points: 9026, libertadoresTitles: 3, sudamericanaTitles: 0, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 3, teamName: 'Flamengo', country: 'BRA', points: 8894, libertadoresTitles: 3, sudamericanaTitles: 0, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 4, teamName: 'Boca Juniors', country: 'ARG', points: 8272, libertadoresTitles: 6, sudamericanaTitles: 2, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 5, teamName: 'São Paulo', country: 'BRA', points: 5748, libertadoresTitles: 3, sudamericanaTitles: 1, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 6, teamName: 'Fluminense', country: 'BRA', points: 5645, libertadoresTitles: 1, sudamericanaTitles: 0, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 7, teamName: 'Atlético Mineiro', country: 'BRA', points: 5588, libertadoresTitles: 1, sudamericanaTitles: 0, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 8, teamName: 'Club Nacional de Football', country: 'URU', points: 5514, libertadoresTitles: 3, sudamericanaTitles: 0, potStatus: 'Bombo 1 (Cabeza de Serie)' },
    { rank: 9, teamName: 'Peñarol', country: 'URU', points: 5302, libertadoresTitles: 5, sudamericanaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 10, teamName: 'Independiente del Valle', country: 'ECU', points: 4585, libertadoresTitles: 0, sudamericanaTitles: 2, potStatus: 'Bombo 2' },
    { rank: 11, teamName: 'Club Olimpia', country: 'PAR', points: 4539, libertadoresTitles: 3, sudamericanaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 12, teamName: 'LDU Quito', country: 'ECU', points: 4360, libertadoresTitles: 1, sudamericanaTitles: 2, potStatus: 'Bombo 2' },
    { rank: 13, teamName: 'Racing Club', country: 'ARG', points: 4200, libertadoresTitles: 1, sudamericanaTitles: 1, potStatus: 'Bombo 2' },
    { rank: 14, teamName: 'Sport Club Internacional', country: 'BRA', points: 4114, libertadoresTitles: 2, sudamericanaTitles: 1, potStatus: 'Bombo 2' },
    { rank: 15, teamName: 'Grêmio', country: 'BRA', points: 4090, libertadoresTitles: 3, sudamericanaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 16, teamName: 'Atlético Nacional', country: 'COL', points: 3793, libertadoresTitles: 2, sudamericanaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 17, teamName: 'Cerro Porteño', country: 'PAR', points: 3744, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 18, teamName: 'Colo-Colo', country: 'CHI', points: 3380, libertadoresTitles: 1, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 19, teamName: 'Estudiantes de La Plata', country: 'ARG', points: 3374, libertadoresTitles: 4, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 20, teamName: 'Club Libertad', country: 'PAR', points: 3348, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 21, teamName: 'Botafogo', country: 'BRA', points: 3200, libertadoresTitles: 1, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 22, teamName: 'Barcelona SC', country: 'ECU', points: 3006, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 23, teamName: 'Vélez Sarsfield', country: 'ARG', points: 2840, libertadoresTitles: 1, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 24, teamName: 'Corinthians', country: 'BRA', points: 2810, libertadoresTitles: 1, sudamericanaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 25, teamName: 'San Lorenzo', country: 'ARG', points: 2780, libertadoresTitles: 1, sudamericanaTitles: 1, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 26, teamName: 'Talleres (Córdoba)', country: 'ARG', points: 2620, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 27, teamName: 'Club Bolívar', country: 'BOL', points: 2540, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 28, teamName: 'Junior de Barranquilla', country: 'COL', points: 2420, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 29, teamName: 'Defensa y Justicia', country: 'ARG', points: 2360, libertadoresTitles: 0, sudamericanaTitles: 1, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 30, teamName: 'Millonarios', country: 'COL', points: 2150, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 31, teamName: 'The Strongest', country: 'BOL', points: 2080, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 32, teamName: 'Universidad Católica', country: 'CHI', points: 2020, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 33, teamName: 'Rosario Central', country: 'ARG', points: 1940, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 34, teamName: 'Universitario de Deportes', country: 'PER', points: 1850, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 35, teamName: 'Alianza Lima', country: 'PER', points: 1710, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 36, teamName: 'Sporting Cristal', country: 'PER', points: 1680, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 37, teamName: 'Independiente', country: 'ARG', points: 1650, libertadoresTitles: 7, sudamericanaTitles: 2, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 38, teamName: 'Argentinos Juniors', country: 'ARG', points: 1620, libertadoresTitles: 1, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 39, teamName: 'Club Guaraní', country: 'PAR', points: 1590, libertadoresTitles: 0, sudamericanaTitles: 0, potStatus: 'Bombo 4 / Fases Previas' },
    { rank: 40, teamName: 'Lanús', country: 'ARG', points: 1540, libertadoresTitles: 0, sudamericanaTitles: 1, potStatus: 'Bombo 4 / Fases Previas' },
];

/**
 * Authentic UEFA Club Coefficient Ranking (Official 5-year ranking)
 */
export const OFFICIAL_UEFA_RANKING: Omit<UefaClubRankingItem, 'flagUrl' | 'countryName'>[] = [
    { rank: 1, teamName: 'Manchester City', country: 'ENG', coefficient: 146.000, championsTitles: 1, europaTitles: 0, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 2, teamName: 'Real Madrid', country: 'ESP', coefficient: 138.000, championsTitles: 15, europaTitles: 2, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 3, teamName: 'Bayern München', country: 'GER', coefficient: 136.000, championsTitles: 6, europaTitles: 1, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 4, teamName: 'Paris Saint-Germain', country: 'FRA', coefficient: 114.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 5, teamName: 'Liverpool', country: 'ENG', coefficient: 110.000, championsTitles: 6, europaTitles: 3, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 6, teamName: 'Inter de Milán', country: 'ITA', coefficient: 105.000, championsTitles: 3, europaTitles: 3, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 7, teamName: 'Borussia Dortmund', country: 'GER', coefficient: 97.000, championsTitles: 1, europaTitles: 0, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 8, teamName: 'RB Leipzig', country: 'GER', coefficient: 93.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 9, teamName: 'Chelsea', country: 'ENG', coefficient: 92.000, championsTitles: 2, europaTitles: 2, potStatus: 'Bombo 1 (Cabezas de Serie)' },
    { rank: 10, teamName: 'Roma', country: 'ITA', coefficient: 90.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 11, teamName: 'Manchester United', country: 'ENG', coefficient: 88.000, championsTitles: 3, europaTitles: 1, potStatus: 'Bombo 2' },
    { rank: 12, teamName: 'Barcelona', country: 'ESP', coefficient: 87.000, championsTitles: 5, europaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 13, teamName: 'Arsenal', country: 'ENG', coefficient: 86.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 14, teamName: 'Bayer Leverkusen', country: 'GER', coefficient: 85.000, championsTitles: 0, europaTitles: 1, potStatus: 'Bombo 2' },
    { rank: 15, teamName: 'Atlético de Madrid', country: 'ESP', coefficient: 84.000, championsTitles: 0, europaTitles: 3, potStatus: 'Bombo 2' },
    { rank: 16, teamName: 'Atalanta', country: 'ITA', coefficient: 81.000, championsTitles: 0, europaTitles: 1, potStatus: 'Bombo 2' },
    { rank: 17, teamName: 'Juventus', country: 'ITA', coefficient: 80.000, championsTitles: 2, europaTitles: 3, potStatus: 'Bombo 2' },
    { rank: 18, teamName: 'Benfica', country: 'POR', coefficient: 79.000, championsTitles: 2, europaTitles: 0, potStatus: 'Bombo 2' },
    { rank: 19, teamName: 'Porto', country: 'POR', coefficient: 77.000, championsTitles: 2, europaTitles: 2, potStatus: 'Bombo 3' },
    { rank: 20, teamName: 'Napoli', country: 'ITA', coefficient: 71.000, championsTitles: 0, europaTitles: 1, potStatus: 'Bombo 3' },
    { rank: 21, teamName: 'Milan', country: 'ITA', coefficient: 69.000, championsTitles: 7, europaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 22, teamName: 'West Ham United', country: 'ENG', coefficient: 69.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 23, teamName: 'Villarreal', country: 'ESP', coefficient: 68.000, championsTitles: 0, europaTitles: 1, potStatus: 'Bombo 3' },
    { rank: 24, teamName: 'Real Sociedad', country: 'ESP', coefficient: 63.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 25, teamName: 'Aston Villa', country: 'ENG', coefficient: 62.000, championsTitles: 1, europaTitles: 0, potStatus: 'Bombo 3' },
    { rank: 26, teamName: 'Tottenham Hotspur', country: 'ENG', coefficient: 60.000, championsTitles: 0, europaTitles: 2, potStatus: 'Bombo 3' },
    { rank: 27, teamName: 'Sporting CP', country: 'POR', coefficient: 58.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 28, teamName: 'PSV Eindhoven', country: 'NED', coefficient: 57.000, championsTitles: 1, europaTitles: 1, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 29, teamName: 'Feyenoord', country: 'NED', coefficient: 56.000, championsTitles: 1, europaTitles: 2, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 30, teamName: 'Lazio', country: 'ITA', coefficient: 54.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 31, teamName: 'Sevilla', country: 'ESP', coefficient: 52.000, championsTitles: 0, europaTitles: 7, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 32, teamName: 'Eintracht Frankfurt', country: 'GER', coefficient: 51.000, championsTitles: 0, europaTitles: 2, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 33, teamName: 'Club Brugge', country: 'BEL', coefficient: 48.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 34, teamName: 'Ajax', country: 'NED', coefficient: 45.000, championsTitles: 4, europaTitles: 1, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 35, teamName: 'Shakhtar Donetsk', country: 'SCO', coefficient: 43.000, championsTitles: 0, europaTitles: 1, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 36, teamName: 'Rangers', country: 'SCO', coefficient: 42.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 37, teamName: 'Newcastle United', country: 'ENG', coefficient: 40.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 38, teamName: 'Athletic Club', country: 'ESP', coefficient: 38.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 39, teamName: 'Girona', country: 'ESP', coefficient: 35.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
    { rank: 40, teamName: 'Monaco', country: 'FRA', coefficient: 34.000, championsTitles: 0, europaTitles: 0, potStatus: 'Bombo 4 / Fase de Liga' },
];

/**
 * Builds dynamically resolved CONMEBOL Club rankings merged with current game state
 */
export function getResolvedConmebolRankings(gameState: GameState): ConmebolClubRankingItem[] {
    const allKnownTeams = [...(gameState.allTeams || []), ...SOUTH_AMERICAN_EXTRA_TEAMS];

    const results: ConmebolClubRankingItem[] = OFFICIAL_CONMEBOL_RANKING.map(item => {
        const countryMeta = COUNTRY_META[item.country] || { name: item.country, flag: '' };
        const matchedTeam = allKnownTeams.find(t => 
            t.name.toLowerCase() === item.teamName.toLowerCase() ||
            t.shortName?.toLowerCase() === item.teamName.toLowerCase() ||
            (t.name.includes(item.teamName) || item.teamName.includes(t.name))
        );

        return {
            ...item,
            countryName: countryMeta.name,
            flagUrl: countryMeta.flag,
            logoUrl: matchedTeam?.logo || '/sinlogo.png',
            teamId: matchedTeam?.id,
        };
    });

    // Check if player's team is South American and should appear
    const userTeam = gameState.team;
    const isUserSouthAmerican = userTeam.leagueId?.includes('ARG') || 
                               userTeam.leagueId?.includes('BRA') || 
                               userTeam.leagueId?.includes('PAR') || 
                               userTeam.leagueId?.includes('CHILE') || 
                               userTeam.leagueId?.includes('PRIMERA');

    if (isUserSouthAmerican && !results.some(r => r.teamId === userTeam.id || r.teamName.toLowerCase() === userTeam.name.toLowerCase())) {
        const countryCode = userTeam.leagueId?.includes('BRA') ? 'BRA' : 
                           userTeam.leagueId?.includes('PAR') ? 'PAR' : 
                           userTeam.leagueId?.includes('CHILE') ? 'CHI' : 'ARG';
        const countryMeta = COUNTRY_META[countryCode] || { name: 'Argentina', flag: 'https://flagcdn.com/ar.svg' };
        
        // Estimate points based on team tier and reputation
        const basePts = userTeam.tier === 'Top' ? 3100 : userTeam.tier === 'Mid' ? 1800 : 950;
        
        results.push({
            rank: 99,
            teamName: userTeam.name,
            shortName: userTeam.shortName,
            country: countryCode,
            countryName: countryMeta.name,
            flagUrl: countryMeta.flag,
            points: basePts,
            libertadoresTitles: 0,
            sudamericanaTitles: 0,
            potStatus: basePts >= 5000 ? 'Bombo 1 (Cabeza de Serie)' : basePts >= 3500 ? 'Bombo 2' : basePts >= 2500 ? 'Bombo 3' : 'Bombo 4 / Fases Previas',
            logoUrl: userTeam.logo,
            teamId: userTeam.id,
        });
    }

    // Sort by points descending and reassign rank numbers
    results.sort((a, b) => b.points - a.points);
    results.forEach((item, idx) => {
        item.rank = idx + 1;
        if (item.rank <= 8) {
            item.potStatus = 'Bombo 1 (Cabeza de Serie)';
        } else if (item.rank <= 16) {
            item.potStatus = 'Bombo 2';
        } else if (item.rank <= 24) {
            item.potStatus = 'Bombo 3';
        } else {
            item.potStatus = 'Bombo 4 / Fases Previas';
        }
    });

    return results;
}

/**
 * Builds dynamically resolved UEFA Club Coefficient rankings merged with current game state
 */
export function getResolvedUefaRankings(gameState: GameState): UefaClubRankingItem[] {
    const allKnownTeams = gameState.allTeams || [];

    const results: UefaClubRankingItem[] = OFFICIAL_UEFA_RANKING.map(item => {
        const countryMeta = COUNTRY_META[item.country] || { name: item.country, flag: '' };
        const matchedTeam = allKnownTeams.find(t => 
            t.name.toLowerCase() === item.teamName.toLowerCase() ||
            t.shortName?.toLowerCase() === item.teamName.toLowerCase() ||
            (t.name.includes(item.teamName) || item.teamName.includes(t.name))
        );

        return {
            ...item,
            countryName: countryMeta.name,
            flagUrl: countryMeta.flag,
            logoUrl: matchedTeam?.logo || '/sinlogo.png',
            teamId: matchedTeam?.id,
        };
    });

    // Check if player's team is European and should appear
    const userTeam = gameState.team;
    const isUserEuropean = userTeam.leagueId?.includes('PREMIER') || 
                          userTeam.leagueId?.includes('CHAMPIONSHIP') || 
                          userTeam.leagueId?.includes('LIGA') || 
                          userTeam.leagueId?.includes('BUNDES') || 
                          userTeam.leagueId?.includes('SERIE') || 
                          userTeam.leagueId?.includes('LIGUE');

    if (isUserEuropean && !results.some(r => r.teamId === userTeam.id || r.teamName.toLowerCase() === userTeam.name.toLowerCase())) {
        const countryCode = userTeam.leagueId?.includes('PREMIER') || userTeam.leagueId?.includes('CHAMPIONSHIP') ? 'ENG' :
                           userTeam.leagueId?.includes('LIGA') ? 'ESP' :
                           userTeam.leagueId?.includes('BUNDES') ? 'GER' :
                           userTeam.leagueId?.includes('SERIE') ? 'ITA' : 'FRA';
        const countryMeta = COUNTRY_META[countryCode] || { name: 'Europa', flag: '' };

        const baseCoeff = userTeam.tier === 'Top' ? 70.000 : userTeam.tier === 'Mid' ? 38.000 : 18.000;

        results.push({
            rank: 99,
            teamName: userTeam.name,
            country: countryCode,
            countryName: countryMeta.name,
            flagUrl: countryMeta.flag,
            coefficient: baseCoeff,
            championsTitles: 0,
            europaTitles: 0,
            potStatus: baseCoeff >= 92 ? 'Bombo 1 (Cabezas de Serie)' : baseCoeff >= 75 ? 'Bombo 2' : baseCoeff >= 55 ? 'Bombo 3' : 'Bombo 4 / Fase de Liga',
            logoUrl: userTeam.logo,
            teamId: userTeam.id,
        });
    }

    // Sort by coefficient descending and reassign rank numbers
    results.sort((a, b) => b.coefficient - a.coefficient);
    results.forEach((item, idx) => {
        item.rank = idx + 1;
        if (item.rank <= 9) {
            item.potStatus = 'Bombo 1 (Cabezas de Serie)';
        } else if (item.rank <= 18) {
            item.potStatus = 'Bombo 2';
        } else if (item.rank <= 27) {
            item.potStatus = 'Bombo 3';
        } else {
            item.potStatus = 'Bombo 4 / Fase de Liga';
        }
    });

    return results;
}
