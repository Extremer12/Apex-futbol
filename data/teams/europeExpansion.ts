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

export const primeiraLigaTeams: Team[] = [
    {
        id: 2001, name: 'SL Benfica', shortName: 'Benfica', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA,
        budget: 95000000, transferBudget: 35000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#E83030', secondaryColor: '#FFFFFF',
        squad: buildSquad(2001, 'Benfica', 79, '#E83030', '#FFFFFF', [
            { name: 'Á. Di María', position: 'DEL', rating: 83, value: 14000000, wage: 95000, morale: 'Feliz', contractYears: 1, age: 36 },
            { name: 'V. Pavlidis', position: 'DEL', rating: 81, value: 26000000, wage: 65000, morale: 'Feliz', contractYears: 4, age: 26 },
            { name: 'O. Kökçü', position: 'CEN', rating: 82, value: 30000000, wage: 75000, morale: 'Feliz', contractYears: 4, age: 23 },
            { name: 'N. Otamendi', position: 'DEF', rating: 81, value: 5000000, wage: 80000, morale: 'Feliz', contractYears: 1, age: 36 },
            { name: 'António Silva', position: 'DEF', rating: 81, value: 40000000, wage: 55000, morale: 'Feliz', contractYears: 4, age: 21 },
            { name: 'A. Trubin', position: 'POR', rating: 82, value: 28000000, wage: 60000, morale: 'Feliz', contractYears: 4, age: 23 },
            { name: 'F. Aursnes', position: 'CEN', rating: 80, value: 22000000, wage: 58000, morale: 'Contento', contractYears: 4, age: 28 },
            { name: 'K. Aktürkoğlu', position: 'DEL', rating: 80, value: 24000000, wage: 55000, morale: 'Feliz', contractYears: 4, age: 26 },
        ])
    },
    {
        id: 2002, name: 'Sporting CP', shortName: 'Sporting CP', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA,
        budget: 90000000, transferBudget: 32000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#008057', secondaryColor: '#FFFFFF',
        squad: buildSquad(2002, 'Sporting CP', 80, '#008057', '#FFFFFF', [
            { name: 'V. Gyökeres', position: 'DEL', rating: 86, value: 70000000, wage: 95000, morale: 'Feliz', contractYears: 4, age: 26 },
            { name: 'M. Hjulmand', position: 'CEN', rating: 83, value: 42000000, wage: 65000, morale: 'Feliz', contractYears: 4, age: 25 },
            { name: 'Pedro Gonçalves', position: 'CEN', rating: 83, value: 38000000, wage: 70000, morale: 'Feliz', contractYears: 4, age: 26 },
            { name: 'Francisco Trincão', position: 'DEL', rating: 81, value: 26000000, wage: 62000, morale: 'Feliz', contractYears: 3, age: 24 },
            { name: 'G. Inácio', position: 'DEF', rating: 82, value: 45000000, wage: 58000, morale: 'Feliz', contractYears: 4, age: 23 },
            { name: 'O. Diomande', position: 'DEF', rating: 81, value: 40000000, wage: 52000, morale: 'Feliz', contractYears: 4, age: 20 },
            { name: 'F. Israel', position: 'POR', rating: 78, value: 12000000, wage: 38000, morale: 'Contento', contractYears: 3, age: 24 },
        ])
    },
    {
        id: 2003, name: 'FC Porto', shortName: 'Porto', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA,
        budget: 88000000, transferBudget: 30000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#00429A', secondaryColor: '#FFFFFF',
        squad: buildSquad(2003, 'Porto', 79, '#00429A', '#FFFFFF', [
            { name: 'Diogo Costa', position: 'POR', rating: 84, value: 45000000, wage: 75000, morale: 'Feliz', contractYears: 4, age: 25 },
            { name: 'Samu Aghehowa', position: 'DEL', rating: 82, value: 45000000, wage: 62000, morale: 'Feliz', contractYears: 5, age: 20 },
            { name: 'Pepê', position: 'DEL', rating: 81, value: 30000000, wage: 60000, morale: 'Contento', contractYears: 3, age: 27 },
            { name: 'Alan Varela', position: 'CEN', rating: 81, value: 35000000, wage: 55000, morale: 'Feliz', contractYears: 4, age: 23 },
            { name: 'Nico González', position: 'CEN', rating: 80, value: 24000000, wage: 50000, morale: 'Feliz', contractYears: 4, age: 22 },
            { name: 'Wendell', position: 'DEF', rating: 78, value: 10000000, wage: 48000, morale: 'Contento', contractYears: 2, age: 31 },
            { name: 'Nehuén Pérez', position: 'DEF', rating: 79, value: 20000000, wage: 46000, morale: 'Feliz', contractYears: 4, age: 24 },
        ])
    },
    { id: 2004, name: 'SC Braga', shortName: 'Braga', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 45000000, transferBudget: 14000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(200401, 'SC Braga', 76, '#C8102E', '#FFFFFF') },
    { id: 2005, name: 'Vitória Guimarães', shortName: 'Vitória SC', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 24000000, transferBudget: 8000000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#111827', secondaryColor: '#FFFFFF', squad: createGenericSquad(200501, 'Vitória SC', 74, '#111827', '#FFFFFF') },
    { id: 2006, name: 'FC Famalicão', shortName: 'Famalicão', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 18000000, transferBudget: 6000000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#0033A0', secondaryColor: '#FFFFFF', squad: createGenericSquad(200601, 'Famalicão', 72, '#0033A0', '#FFFFFF') },
    { id: 2007, name: 'Moreirense FC', shortName: 'Moreirense', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 14000000, transferBudget: 4500000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#00843D', secondaryColor: '#FFFFFF', squad: createGenericSquad(200701, 'Moreirense', 71, '#00843D', '#FFFFFF') },
    { id: 2008, name: 'Estoril Praia', shortName: 'Estoril', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 14000000, transferBudget: 4200000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#FFD100', secondaryColor: '#0033A0', squad: createGenericSquad(200801, 'Estoril', 71, '#FFD100', '#0033A0') },
    { id: 2009, name: 'Gil Vicente', shortName: 'Gil Vicente', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 13000000, transferBudget: 4000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#C8102E', secondaryColor: '#002B7F', squad: createGenericSquad(200901, 'Gil Vicente', 70, '#C8102E', '#002B7F') },
    { id: 2010, name: 'Casa Pia AC', shortName: 'Casa Pia', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 12000000, transferBudget: 3600000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#111827', secondaryColor: '#FFFFFF', squad: createGenericSquad(201001, 'Casa Pia', 70, '#111827', '#FFFFFF') },
    { id: 2011, name: 'Rio Ave FC', shortName: 'Rio Ave', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 13000000, transferBudget: 3800000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#00843D', secondaryColor: '#FFFFFF', squad: createGenericSquad(201101, 'Rio Ave', 70, '#00843D', '#FFFFFF') },
    { id: 2012, name: 'FC Arouca', shortName: 'Arouca', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 12000000, transferBudget: 3500000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FFD100', secondaryColor: '#0033A0', squad: createGenericSquad(201201, 'Arouca', 69, '#FFD100', '#0033A0') },
    { id: 2013, name: 'Boavista FC', shortName: 'Boavista', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 11000000, transferBudget: 3000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFFFFF', squad: createGenericSquad(201301, 'Boavista', 69, '#000000', '#FFFFFF') },
    { id: 2014, name: 'CD Santa Clara', shortName: 'Santa Clara', logo: '', leagueId: LeagueId.PRIMEIRA_LIGA, budget: 11000000, transferBudget: 3000000, tier: 'Lower', teamMorale: 'Contento', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(201401, 'Santa Clara', 70, '#C8102E', '#FFFFFF') },
];

export const eredivisieTeams: Team[] = [
    {
        id: 2101, name: 'PSV Eindhoven', shortName: 'PSV', logo: '', leagueId: LeagueId.EREDIVISIE,
        budget: 110000000, transferBudget: 40000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#E30613', secondaryColor: '#FFFFFF',
        squad: buildSquad(2101, 'PSV', 80, '#E30613', '#FFFFFF', [
            { name: 'J. Veerman', position: 'CEN', rating: 82, value: 36000000, wage: 68000, morale: 'Feliz', contractYears: 4, age: 25 },
            { name: 'J. Bakayoko', position: 'DEL', rating: 81, value: 40000000, wage: 58000, morale: 'Feliz', contractYears: 3, age: 21 },
            { name: 'L. de Jong', position: 'DEL', rating: 81, value: 6000000, wage: 65000, morale: 'Feliz', contractYears: 2, age: 34 },
            { name: 'J. Schouten', position: 'CEN', rating: 82, value: 32000000, wage: 60000, morale: 'Feliz', contractYears: 4, age: 27 },
            { name: 'M. Tillman', position: 'CEN', rating: 80, value: 28000000, wage: 52000, morale: 'Feliz', contractYears: 4, age: 22 },
            { name: 'W. Benítez', position: 'POR', rating: 80, value: 14000000, wage: 55000, morale: 'Feliz', contractYears: 2, age: 31 },
            { name: 'O. Boscagli', position: 'DEF', rating: 80, value: 26000000, wage: 52000, morale: 'Contento', contractYears: 2, age: 26 },
        ])
    },
    {
        id: 2102, name: 'Feyenoord', shortName: 'Feyenoord', logo: '', leagueId: LeagueId.EREDIVISIE,
        budget: 88000000, transferBudget: 30000000, tier: 'Top', teamMorale: 'Feliz',
        primaryColor: '#E30613', secondaryColor: '#111827',
        squad: buildSquad(2102, 'Feyenoord', 79, '#E30613', '#111827', [
            { name: 'S. Giménez', position: 'DEL', rating: 82, value: 42000000, wage: 65000, morale: 'Feliz', contractYears: 4, age: 23 },
            { name: 'D. Hancko', position: 'DEF', rating: 82, value: 35000000, wage: 60000, morale: 'Feliz', contractYears: 4, age: 26 },
            { name: 'Q. Timber', position: 'CEN', rating: 81, value: 32000000, wage: 55000, morale: 'Feliz', contractYears: 3, age: 23 },
            { name: 'I. Paixão', position: 'DEL', rating: 79, value: 20000000, wage: 45000, morale: 'Feliz', contractYears: 4, age: 24 },
            { name: 'L. Geertruida', position: 'DEF', rating: 80, value: 28000000, wage: 55000, morale: 'Contento', contractYears: 3, age: 24 },
            { name: 'T. Wellenreuther', position: 'POR', rating: 78, value: 10000000, wage: 38000, morale: 'Contento', contractYears: 3, age: 28 },
        ])
    },
    {
        id: 2103, name: 'Ajax', shortName: 'Ajax', logo: '', leagueId: LeagueId.EREDIVISIE,
        budget: 105000000, transferBudget: 34000000, tier: 'Top', teamMorale: 'Contento',
        primaryColor: '#D2122E', secondaryColor: '#FFFFFF',
        squad: buildSquad(2103, 'Ajax', 79, '#D2122E', '#FFFFFF', [
            { name: 'J. Hato', position: 'DEF', rating: 80, value: 38000000, wage: 45000, morale: 'Feliz', contractYears: 5, age: 18 },
            { name: 'B. Brobbey', position: 'DEL', rating: 80, value: 32000000, wage: 58000, morale: 'Contento', contractYears: 3, age: 22 },
            { name: 'J. Henderson', position: 'CEN', rating: 80, value: 6000000, wage: 75000, morale: 'Feliz', contractYears: 2, age: 34 },
            { name: 'K. Taylor', position: 'CEN', rating: 79, value: 24000000, wage: 48000, morale: 'Feliz', contractYears: 4, age: 22 },
            { name: 'W. Weghorst', position: 'DEL', rating: 78, value: 8000000, wage: 55000, morale: 'Contento', contractYears: 2, age: 32 },
            { name: 'R. Pasveer', position: 'POR', rating: 77, value: 1500000, wage: 30000, morale: 'Feliz', contractYears: 1, age: 40 },
        ])
    },
    { id: 2104, name: 'AZ Alkmaar', shortName: 'AZ', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 48000000, transferBudget: 16000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#D2122E', secondaryColor: '#FFFFFF', squad: createGenericSquad(210401, 'AZ Alkmaar', 76, '#D2122E', '#FFFFFF') },
    { id: 2105, name: 'FC Twente', shortName: 'Twente', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 34000000, transferBudget: 11000000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#D2122E', secondaryColor: '#FFFFFF', squad: createGenericSquad(210501, 'FC Twente', 75, '#D2122E', '#FFFFFF') },
    { id: 2106, name: 'FC Utrecht', shortName: 'Utrecht', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 26000000, transferBudget: 8500000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#D2122E', secondaryColor: '#FFFFFF', squad: createGenericSquad(210601, 'FC Utrecht', 74, '#D2122E', '#FFFFFF') },
    { id: 2107, name: 'Go Ahead Eagles', shortName: 'GA Eagles', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 16000000, transferBudget: 5000000, tier: 'Mid', teamMorale: 'Contento', primaryColor: '#D2122E', secondaryColor: '#FFD100', squad: createGenericSquad(210701, 'GA Eagles', 72, '#D2122E', '#FFD100') },
    { id: 2108, name: 'NEC Nijmegen', shortName: 'NEC', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 18000000, transferBudget: 5500000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#D2122E', secondaryColor: '#00843D', squad: createGenericSquad(210801, 'NEC', 72, '#D2122E', '#00843D') },
    { id: 2109, name: 'SC Heerenveen', shortName: 'Heerenveen', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 17000000, transferBudget: 5000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#00429A', secondaryColor: '#FFFFFF', squad: createGenericSquad(210901, 'Heerenveen', 71, '#00429A', '#FFFFFF') },
    { id: 2110, name: 'Sparta Rotterdam', shortName: 'Sparta', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 15000000, transferBudget: 4500000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#D2122E', secondaryColor: '#FFFFFF', squad: createGenericSquad(211001, 'Sparta', 71, '#D2122E', '#FFFFFF') },
    { id: 2111, name: 'FC Groningen', shortName: 'Groningen', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 16000000, transferBudget: 4800000, tier: 'Lower', teamMorale: 'Contento', primaryColor: '#00843D', secondaryColor: '#FFFFFF', squad: createGenericSquad(211101, 'Groningen', 70, '#00843D', '#FFFFFF') },
    { id: 2112, name: 'Fortuna Sittard', shortName: 'Fortuna', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 13000000, transferBudget: 3800000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FFD100', secondaryColor: '#00843D', squad: createGenericSquad(211201, 'Fortuna', 70, '#FFD100', '#00843D') },
    { id: 2113, name: 'Heracles Almelo', shortName: 'Heracles', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 12000000, transferBudget: 3500000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFFFFF', squad: createGenericSquad(211301, 'Heracles', 69, '#000000', '#FFFFFF') },
    { id: 2114, name: 'Willem II', shortName: 'Willem II', logo: '', leagueId: LeagueId.EREDIVISIE, budget: 12000000, transferBudget: 3400000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#0033A0', secondaryColor: '#D2122E', squad: createGenericSquad(211401, 'Willem II', 69, '#0033A0', '#D2122E') },
];
