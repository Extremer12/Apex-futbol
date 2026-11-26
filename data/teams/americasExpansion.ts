import { Team, LeagueId, Player } from '../../types';
import { createGenericSquad } from './squadHelpers';

const buildSquad = (
    teamId: number,
    teamName: string,
    avgRating: number,
    primaryColor: string,
    secondaryColor: string,
    stars: Omit<Player, 'id'>[]
): Player[] => {
    const base = stars.map((s, idx) => ({
        id: teamId * 100 + idx + 1,
        ...s,
    }));
    const fill = createGenericSquad(teamId * 100 + stars.length + 1, teamName, avgRating, primaryColor, secondaryColor);
    const needed = Math.max(0, 18 - base.length);
    return [...base, ...fill.slice(0, needed)];
};

// Extra clubs to round out Uruguay (promoted from southAmericanClubs.ts: 9121..9124, 9149..9152 -> 8 + 4 = 12)
export const uruguayExpansionTeams: Team[] = [
    { id: 2201, name: 'CA Boston River', shortName: 'Boston River', logo: '', leagueId: LeagueId.LIGA_URUGUAYA, budget: 6500000, transferBudget: 1800000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#C8102E', secondaryColor: '#00843D', squad: createGenericSquad(220101, 'Boston River', 70, '#C8102E', '#00843D') },
    { id: 2202, name: 'Club Atlético Progreso', shortName: 'Progreso', logo: '', leagueId: LeagueId.LIGA_URUGUAYA, budget: 5500000, transferBudget: 1400000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FFD100', secondaryColor: '#C8102E', squad: createGenericSquad(220201, 'Progreso', 68, '#FFD100', '#C8102E') },
    { id: 2203, name: 'River Plate (Uru)', shortName: 'River Plate UY', logo: '', leagueId: LeagueId.LIGA_URUGUAYA, budget: 6000000, transferBudget: 1600000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(220301, 'River UY', 69, '#C8102E', '#FFFFFF') },
    { id: 2204, name: 'Miramar Misiones', shortName: 'Miramar', logo: '', leagueId: LeagueId.LIGA_URUGUAYA, budget: 5000000, transferBudget: 1200000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFFFFF', squad: createGenericSquad(220401, 'Miramar', 67, '#000000', '#FFFFFF') },
];

// Extra clubs to round out Ecuador (promoted from southAmericanClubs.ts: 9113..9116, 9141..9144 -> 8 + 4 = 12)
export const ecuadorExpansionTeams: Team[] = [
    { id: 2301, name: 'El Nacional', shortName: 'El Nacional', logo: '', leagueId: LeagueId.LIGA_ECUADOR, budget: 8000000, transferBudget: 2400000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#C8102E', secondaryColor: '#002B7F', squad: createGenericSquad(230101, 'El Nacional', 70, '#C8102E', '#002B7F') },
    { id: 2302, name: 'Orense SC', shortName: 'Orense', logo: '', leagueId: LeagueId.LIGA_ECUADOR, budget: 6500000, transferBudget: 1900000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#00843D', secondaryColor: '#FFFFFF', squad: createGenericSquad(230201, 'Orense', 69, '#00843D', '#FFFFFF') },
    { id: 2303, name: 'Mushuc Runa SC', shortName: 'Mushuc Runa', logo: '', leagueId: LeagueId.LIGA_ECUADOR, budget: 6000000, transferBudget: 1700000, tier: 'Lower', teamMorale: 'Contento', primaryColor: '#00843D', secondaryColor: '#C8102E', squad: createGenericSquad(230301, 'Mushuc Runa', 69, '#00843D', '#C8102E') },
    { id: 2304, name: 'CSD Macará', shortName: 'Macará', logo: '', leagueId: LeagueId.LIGA_ECUADOR, budget: 5800000, transferBudget: 1500000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#0072CE', secondaryColor: '#FFFFFF', squad: createGenericSquad(230401, 'Macará', 68, '#0072CE', '#FFFFFF') },
];

// Major League Soccer (MLS - 14 clubs for CONCACAF & FIFA Club World Cup 32 parity)
export const mlsTeams: Team[] = [
    {
        id: 2401, name: 'Inter Miami CF', shortName: 'Inter Miami', logo: '', leagueId: LeagueId.MLS,
        budget: 95000000, transferBudget: 35000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#F7B5CD', secondaryColor: '#231F20',
        squad: buildSquad(2401, 'Inter Miami', 76, '#F7B5CD', '#231F20', [
            { name: 'L. Messi', position: 'DEL', rating: 88, value: 25000000, wage: 180000, morale: 'Feliz', contractYears: 2, age: 37 },
            { name: 'L. Suárez', position: 'DEL', rating: 81, value: 4000000, wage: 85000, morale: 'Feliz', contractYears: 1, age: 37 },
            { name: 'S. Busquets', position: 'CEN', rating: 80, value: 3000000, wage: 75000, morale: 'Feliz', contractYears: 1, age: 36 },
            { name: 'Jordi Alba', position: 'DEF', rating: 79, value: 3000000, wage: 70000, morale: 'Feliz', contractYears: 1, age: 35 },
            { name: 'F. Redondo', position: 'CEN', rating: 76, value: 9000000, wage: 35000, morale: 'Feliz', contractYears: 4, age: 21 },
            { name: 'D. Callender', position: 'POR', rating: 75, value: 4000000, wage: 28000, morale: 'Contento', contractYears: 3, age: 27 },
        ])
    },
    {
        id: 2402, name: 'LAFC', shortName: 'LAFC', logo: '', leagueId: LeagueId.MLS,
        budget: 65000000, transferBudget: 24000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#000000', secondaryColor: '#C39E6D',
        squad: buildSquad(2402, 'LAFC', 75, '#000000', '#C39E6D', [
            { name: 'D. Bouanga', position: 'DEL', rating: 80, value: 14000000, wage: 68000, morale: 'Feliz', contractYears: 3, age: 29 },
            { name: 'O. Giroud', position: 'DEL', rating: 79, value: 4000000, wage: 72000, morale: 'Contento', contractYears: 2, age: 38 },
            { name: 'H. Lloris', position: 'POR', rating: 77, value: 2500000, wage: 45000, morale: 'Feliz', contractYears: 2, age: 37 },
            { name: 'M. Bogusz', position: 'CEN', rating: 77, value: 10000000, wage: 36000, morale: 'Feliz', contractYears: 3, age: 23 },
        ])
    },
    {
        id: 2403, name: 'LA Galaxy', shortName: 'LA Galaxy', logo: '', leagueId: LeagueId.MLS,
        budget: 62000000, transferBudget: 22000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#00245D', secondaryColor: '#FFD200',
        squad: buildSquad(2403, 'LA Galaxy', 75, '#00245D', '#FFD200', [
            { name: 'Riqui Puig', position: 'CEN', rating: 81, value: 20000000, wage: 75000, morale: 'Feliz', contractYears: 4, age: 25 },
            { name: 'Gabriel Pec', position: 'DEL', rating: 78, value: 14000000, wage: 48000, morale: 'Feliz', contractYears: 4, age: 23 },
            { name: 'J. Paintsil', position: 'DEL', rating: 77, value: 11000000, wage: 45000, morale: 'Feliz', contractYears: 4, age: 26 },
        ])
    },
    {
        id: 2404, name: 'Columbus Crew', shortName: 'Columbus', logo: '', leagueId: LeagueId.MLS,
        budget: 56000000, transferBudget: 19000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#FEDD00', secondaryColor: '#000000',
        squad: buildSquad(2404, 'Columbus', 75, '#FEDD00', '#000000', [
            { name: 'Cucho Hernández', position: 'DEL', rating: 81, value: 18000000, wage: 68000, morale: 'Feliz', contractYears: 3, age: 25 },
            { name: 'Diego Rossi', position: 'DEL', rating: 77, value: 11000000, wage: 48000, morale: 'Feliz', contractYears: 3, age: 26 },
            { name: 'D. Nagbe', position: 'CEN', rating: 76, value: 4500000, wage: 42000, morale: 'Feliz', contractYears: 2, age: 34 },
        ])
    },
    {
        id: 2405, name: 'Seattle Sounders FC', shortName: 'Seattle', logo: '', leagueId: LeagueId.MLS,
        budget: 50000000, transferBudget: 16000000, tier: 'Top', teamMorale: 'Contento',
        primaryColor: '#5D9741', secondaryColor: '#005595',
        squad: buildSquad(2405, 'Seattle', 74, '#5D9741', '#005595', [
            { name: 'Jordan Morris', position: 'DEL', rating: 76, value: 7500000, wage: 45000, morale: 'Feliz', contractYears: 3, age: 30 },
            { name: 'Pedro de la Vega', position: 'DEL', rating: 75, value: 8500000, wage: 38000, morale: 'Contento', contractYears: 4, age: 23 },
            { name: 'S. Frei', position: 'POR', rating: 75, value: 2000000, wage: 30000, morale: 'Feliz', contractYears: 2, age: 38 },
        ])
    },
    { id: 2406, name: 'FC Cincinnati', shortName: 'Cincinnati', logo: '', leagueId: LeagueId.MLS, budget: 48000000, transferBudget: 15000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#F05323', secondaryColor: '#263B80', squad: createGenericSquad(240601, 'Cincinnati', 74, '#F05323', '#263B80') },
    { id: 2407, name: 'Atlanta United', shortName: 'Atlanta Utd', logo: '', leagueId: LeagueId.MLS, budget: 52000000, transferBudget: 17000000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#A2001D', secondaryColor: '#000000', squad: createGenericSquad(240701, 'Atlanta Utd', 73, '#A2001D', '#000000') },
    { id: 2408, name: 'New York City FC', shortName: 'NYCFC', logo: '', leagueId: LeagueId.MLS, budget: 44000000, transferBudget: 14000000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#6CACE4', secondaryColor: '#041E42', squad: createGenericSquad(240801, 'NYCFC', 73, '#6CACE4', '#041E42') },
    { id: 2409, name: 'New York Red Bulls', shortName: 'NY Red Bulls', logo: '', leagueId: LeagueId.MLS, budget: 42000000, transferBudget: 13000000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#D50032', secondaryColor: '#FFFFFF', squad: createGenericSquad(240901, 'NY Red Bulls', 73, '#D50032', '#FFFFFF') },
    { id: 2410, name: 'Orlando City SC', shortName: 'Orlando City', logo: '', leagueId: LeagueId.MLS, budget: 40000000, transferBudget: 12000000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#633492', secondaryColor: '#FDE192', squad: createGenericSquad(241001, 'Orlando City', 72, '#633492', '#FDE192') },
    { id: 2411, name: 'Philadelphia Union', shortName: 'Philadelphia', logo: '', leagueId: LeagueId.MLS, budget: 38000000, transferBudget: 11000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#071B2C', secondaryColor: '#B19B69', squad: createGenericSquad(241101, 'Philadelphia', 72, '#071B2C', '#B19B69') },
    { id: 2412, name: 'Houston Dynamo FC', shortName: 'Houston', logo: '', leagueId: LeagueId.MLS, budget: 35000000, transferBudget: 10000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#F68712', secondaryColor: '#101820', squad: createGenericSquad(241201, 'Houston', 72, '#F68712', '#101820') },
    { id: 2413, name: 'Portland Timbers', shortName: 'Portland', logo: '', leagueId: LeagueId.MLS, budget: 34000000, transferBudget: 9500000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#00482B', secondaryColor: '#D69A00', squad: createGenericSquad(241301, 'Portland', 71, '#00482B', '#D69A00') },
    { id: 2414, name: 'Toronto FC', shortName: 'Toronto FC', logo: '', leagueId: LeagueId.MLS, budget: 40000000, transferBudget: 12000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#E31937', secondaryColor: '#455560', squad: createGenericSquad(241401, 'Toronto FC', 71, '#E31937', '#455560') },
];
