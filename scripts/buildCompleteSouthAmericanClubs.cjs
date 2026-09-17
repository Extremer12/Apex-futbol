const fs = require('fs');
const path = require('path');

const southAmericanClubsContent = `import { Team, LeagueId } from '../../types';
import { createGenericSquad } from './helpers';

export interface ConmebolTeamMeta {
    country: 'ARG' | 'BRA' | 'BOL' | 'CHI' | 'COL' | 'ECU' | 'PAR' | 'PER' | 'URU' | 'VEN';
    conmebolRanking: number; // 1 (best) to 100+
}

export const SOUTH_AMERICAN_EXTRA_TEAMS: (Team & ConmebolTeamMeta)[] = [
    // --- CHILE (4) ---
    {
        id: 9101,
        name: 'Colo-Colo',
        shortName: 'Colo-Colo',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Chile/colo-colo.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 25000000,
        transferBudget: 10000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#FFFFFF',
        secondaryColor: '#000000',
        country: 'CHI',
        conmebolRanking: 18,
        squad: [
            { id: 910101, name: 'Brayan Cortés', position: 'POR', rating: 77, potential: 79, age: 29, value: 3500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 910102, name: 'Mauricio Isla', position: 'DEF', rating: 76, potential: 76, age: 36, value: 1200000, wage: 28000, morale: 'Contento', contractYears: 1 },
            { id: 910103, name: 'Maximiliano Falcón', position: 'DEF', rating: 76, potential: 78, age: 27, value: 3000000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 910104, name: 'Alan Saldivia', position: 'DEF', rating: 76, potential: 82, age: 22, value: 4000000, wage: 18000, morale: 'Feliz', contractYears: 4 },
            { id: 910105, name: 'Erick Wiemberg', position: 'DEF', rating: 75, potential: 76, age: 30, value: 1800000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 910106, name: 'Esteban Pavez', position: 'CEN', rating: 76, potential: 76, age: 34, value: 1400000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 910107, name: 'Vicente Pizarro', position: 'CEN', rating: 77, potential: 84, age: 21, value: 4500000, wage: 18000, morale: 'Feliz', contractYears: 4 },
            { id: 910108, name: 'Arturo Vidal', position: 'CEN', rating: 79, potential: 79, age: 37, value: 2500000, wage: 48000, morale: 'Feliz', contractYears: 2 },
            { id: 910109, name: 'Carlos Palacios', position: 'DEL', rating: 78, potential: 82, age: 24, value: 5500000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 910110, name: 'Lucas Cepeda', position: 'DEL', rating: 77, potential: 83, age: 22, value: 4000000, wage: 20000, morale: 'Feliz', contractYears: 4 },
            { id: 910111, name: 'Javier Correa', position: 'DEL', rating: 77, potential: 78, age: 31, value: 3000000, wage: 26000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 9102,
        name: 'Universidad de Chile',
        shortName: 'U. de Chile',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Chile/universidad-de-chile.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 20000000,
        transferBudget: 8000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#003DA5',
        secondaryColor: '#C8102E',
        country: 'CHI',
        conmebolRanking: 32,
        squad: [
            { id: 910201, name: 'Gabriel Castellón', position: 'POR', rating: 76, potential: 77, age: 30, value: 2200000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 910202, name: 'Franco Calderón', position: 'DEF', rating: 76, potential: 78, age: 26, value: 2800000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 910203, name: 'Matías Zaldivia', position: 'DEF', rating: 76, potential: 76, age: 33, value: 1600000, wage: 24000, morale: 'Feliz', contractYears: 2 },
            { id: 910204, name: 'Marcelo Morales', position: 'DEF', rating: 76, potential: 83, age: 21, value: 4000000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 910205, name: 'Marcelo Díaz', position: 'CEN', rating: 77, potential: 77, age: 37, value: 1200000, wage: 28000, morale: 'Feliz', contractYears: 1 },
            { id: 910206, name: 'Charles Aránguiz', position: 'CEN', rating: 79, potential: 79, age: 35, value: 3000000, wage: 42000, morale: 'Feliz', contractYears: 2 },
            { id: 910207, name: 'Israel Poblete', position: 'CEN', rating: 76, potential: 77, age: 29, value: 2400000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 910208, name: 'Maximiliano Guerrero', position: 'DEL', rating: 77, potential: 80, age: 24, value: 3800000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 910209, name: 'Leandro Fernández', position: 'DEL', rating: 78, potential: 78, age: 33, value: 3500000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 910210, name: 'Cristian Palacios', position: 'DEL', rating: 76, potential: 76, age: 34, value: 2000000, wage: 24000, morale: 'Contento', contractYears: 1 }
        ]
    },
    {
        id: 9103,
        name: 'Universidad Católica',
        shortName: 'U. Católica',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Chile/universidad-catolica.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 18000000,
        transferBudget: 7000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#003DA5',
        secondaryColor: '#FFFFFF',
        country: 'CHI',
        conmebolRanking: 28,
        squad: [
            { id: 910301, name: 'Sebastián Pérez', position: 'POR', rating: 76, potential: 76, age: 33, value: 2000000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 910302, name: 'Daniel González', position: 'DEF', rating: 75, potential: 81, age: 22, value: 3000000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 910303, name: 'Branco Ampuero', position: 'DEF', rating: 75, potential: 76, age: 31, value: 1800000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 910304, name: 'Eugenio Mena', position: 'DEF', rating: 76, potential: 76, age: 36, value: 1200000, wage: 26000, morale: 'Feliz', contractYears: 1 },
            { id: 910305, name: 'Agustín Farías', position: 'CEN', rating: 75, potential: 75, age: 36, value: 1000000, wage: 22000, morale: 'Normal', contractYears: 1 },
            { id: 910306, name: 'César Pinares', position: 'CEN', rating: 76, potential: 76, age: 33, value: 2000000, wage: 25000, morale: 'Contento', contractYears: 2 },
            { id: 910307, name: 'Gonzalo Tapia', position: 'DEL', rating: 77, potential: 83, age: 22, value: 4500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
            { id: 910308, name: 'Fernando Zampedri', position: 'DEL', rating: 79, potential: 79, age: 36, value: 3500000, wage: 40000, morale: 'Feliz', contractYears: 2 }
        ]
    },
    {
        id: 9104,
        name: 'Huachipato',
        shortName: 'Huachipato',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Chile/huachipato.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 12000000,
        transferBudget: 4000000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#000000',
        secondaryColor: '#003DA5',
        country: 'CHI',
        conmebolRanking: 45,
        squad: createGenericSquad(910400, 'Huachipato', 74)
    },

    // --- BOLIVIA (4) ---
    {
        id: 9105,
        name: 'Club Bolívar',
        shortName: 'Bolívar',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Bolivia/bolivar.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 14000000,
        transferBudget: 4500000,
        tier: 'Mid',
        teamMorale: 'Feliz',
        primaryColor: '#87CEEB',
        secondaryColor: '#003DA5',
        country: 'BOL',
        conmebolRanking: 25,
        squad: [
            { id: 910501, name: 'Carlos Lampe', position: 'POR', rating: 77, potential: 77, age: 37, value: 1800000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 910502, name: 'José Sagredo', position: 'DEF', rating: 75, potential: 75, age: 30, value: 1500000, wage: 18000, morale: 'Feliz', contractYears: 2 },
            { id: 910503, name: 'Renzo Orihuela', position: 'DEF', rating: 75, potential: 79, age: 23, value: 2500000, wage: 16000, morale: 'Contento', contractYears: 3 },
            { id: 910504, name: 'Leonel Justiniano', position: 'CEN', rating: 76, potential: 76, age: 32, value: 1800000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 910505, name: 'Ramiro Vaca', position: 'CEN', rating: 78, potential: 82, age: 25, value: 4500000, wage: 26000, morale: 'Feliz', contractYears: 4 },
            { id: 910506, name: 'Patito Rodríguez', position: 'DEL', rating: 77, potential: 77, age: 34, value: 2200000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 910507, name: 'Bruno Sávio', position: 'DEL', rating: 78, potential: 79, age: 30, value: 4000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 910508, name: 'Fábio Gomes', position: 'DEL', rating: 76, potential: 78, age: 27, value: 3000000, wage: 24000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9106,
        name: 'The Strongest',
        shortName: 'The Strongest',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Bolivia/the-strongest.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 12000000,
        transferBudget: 4000000,
        tier: 'Mid',
        teamMorale: 'Feliz',
        primaryColor: '#FFD700',
        secondaryColor: '#000000',
        country: 'BOL',
        conmebolRanking: 27,
        squad: [
            { id: 910601, name: 'Guillermo Viscarra', position: 'POR', rating: 78, potential: 80, age: 31, value: 3000000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 910602, name: 'Adrián Jusino', position: 'DEF', rating: 75, potential: 75, age: 32, value: 1600000, wage: 20000, morale: 'Feliz', contractYears: 2 },
            { id: 910603, name: 'Luciano Ursino', position: 'CEN', rating: 76, potential: 76, age: 35, value: 1400000, wage: 22000, morale: 'Feliz', contractYears: 1 },
            { id: 910604, name: 'Michael Ortega', position: 'CEN', rating: 77, potential: 77, age: 33, value: 2500000, wage: 26000, morale: 'Feliz', contractYears: 2 },
            { id: 910605, name: 'Jeyson Chura', position: 'DEL', rating: 76, potential: 82, age: 22, value: 3500000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 910606, name: 'Enrique Triverio', position: 'DEL', rating: 78, potential: 78, age: 35, value: 2500000, wage: 30000, morale: 'Feliz', contractYears: 1 }
        ]
    },
    {
        id: 9107,
        name: 'Club Always Ready',
        shortName: 'Always Ready',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Bolivia/always-ready.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 10000000,
        transferBudget: 3200000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        country: 'BOL',
        conmebolRanking: 44,
        squad: createGenericSquad(910700, 'Always Ready', 73)
    },
    {
        id: 9108,
        name: 'Jorge Wilstermann',
        shortName: 'Wilstermann',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Bolivia/jorge-wilstermann.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 2800000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#C8102E',
        secondaryColor: '#003DA5',
        country: 'BOL',
        conmebolRanking: 50,
        squad: createGenericSquad(910800, 'Wilstermann', 72)
    },

    // --- COLOMBIA (4) ---
    {
        id: 9109,
        name: 'Millonarios FC',
        shortName: 'Millonarios',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Colombia/millonarios.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 18000000,
        transferBudget: 6500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#003DA5',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 22,
        squad: [
            { id: 910901, name: 'Álvaro Montero', position: 'POR', rating: 78, potential: 80, age: 29, value: 3800000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 910902, name: 'Andrés Llinás', position: 'DEF', rating: 77, potential: 80, age: 27, value: 4000000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 910903, name: 'Juan Pablo Vargas', position: 'DEF', rating: 77, potential: 78, age: 29, value: 3800000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 910904, name: 'Daniel Cataño', position: 'CEN', rating: 78, potential: 78, age: 32, value: 3500000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 910905, name: 'David Mackalister Silva', position: 'CEN', rating: 77, potential: 77, age: 37, value: 1200000, wage: 28000, morale: 'Feliz', contractYears: 1 },
            { id: 910906, name: 'Radamel Falcao García', position: 'DEL', rating: 80, potential: 80, age: 38, value: 3000000, wage: 65000, morale: 'Feliz', contractYears: 1 },
            { id: 910907, name: 'Leonardo Castro', position: 'DEL', rating: 78, potential: 79, age: 32, value: 4000000, wage: 34000, morale: 'Feliz', contractYears: 2 }
        ]
    },
    {
        id: 9110,
        name: 'Junior de Barranquilla',
        shortName: 'Junior',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Colombia/junior.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 20000000,
        transferBudget: 7500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 20,
        squad: [
            { id: 911001, name: 'Santiago Mele', position: 'POR', rating: 79, potential: 82, age: 27, value: 5000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 911002, name: 'Emanuel Olivera', position: 'DEF', rating: 76, potential: 76, age: 34, value: 1500000, wage: 24000, morale: 'Feliz', contractYears: 1 },
            { id: 911003, name: 'Víctor Cantillo', position: 'CEN', rating: 77, potential: 77, age: 31, value: 3200000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 911004, name: 'José Enamorado', position: 'DEL', rating: 78, potential: 82, age: 25, value: 5500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 911005, name: 'Carlos Bacca', position: 'DEL', rating: 79, potential: 79, age: 38, value: 2500000, wage: 48000, morale: 'Feliz', contractYears: 1 }
        ]
    },
    {
        id: 9111,
        name: 'Atlético Nacional',
        shortName: 'Atl. Nacional',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Colombia/atletico-nacional.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 18000000,
        transferBudget: 6500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#006400',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 15,
        squad: [
            { id: 911101, name: 'David Ospina', position: 'POR', rating: 79, potential: 79, age: 36, value: 3000000, wage: 45000, morale: 'Feliz', contractYears: 2 },
            { id: 911102, name: 'William Tesillo', position: 'DEF', rating: 77, potential: 77, age: 34, value: 2500000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 911103, name: 'Jorman Campuzano', position: 'CEN', rating: 78, potential: 79, age: 28, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 911104, name: 'Edwin Cardona', position: 'CEN', rating: 79, potential: 79, age: 31, value: 4500000, wage: 40000, morale: 'Feliz', contractYears: 2 },
            { id: 911105, name: 'Alfredo Morelos', position: 'DEL', rating: 79, potential: 80, age: 28, value: 6500000, wage: 42000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9112,
        name: 'Independiente Santa Fe',
        shortName: 'Santa Fe',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Colombia/santa-fe.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 14000000,
        transferBudget: 4500000,
        tier: 'Mid',
        teamMorale: 'Feliz',
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        country: 'COL',
        conmebolRanking: 35,
        squad: [
            { id: 911201, name: 'Andrés Mosquera', position: 'POR', rating: 77, potential: 77, age: 33, value: 2000000, wage: 24000, morale: 'Feliz', contractYears: 2 },
            { id: 911202, name: 'Marcelo Ortiz', position: 'DEF', rating: 76, potential: 77, age: 30, value: 2200000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 911203, name: 'Daniel Torres', position: 'CEN', rating: 77, potential: 77, age: 34, value: 2000000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 911204, name: 'Hugo Rodallega', position: 'DEL', rating: 78, potential: 78, age: 39, value: 1800000, wage: 35000, morale: 'Feliz', contractYears: 1 }
        ]
    },

    // --- ECUADOR (4) ---
    {
        id: 9113,
        name: 'LDU Quito',
        shortName: 'LDU Quito',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Ecuador/ldu-quito.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 22000000,
        transferBudget: 8000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#FFFFFF',
        secondaryColor: '#C8102E',
        country: 'ECU',
        conmebolRanking: 11,
        squad: [
            { id: 911301, name: 'Alexander Domínguez', position: 'POR', rating: 78, potential: 78, age: 37, value: 2000000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 911302, name: 'Ricardo Adé', position: 'DEF', rating: 78, potential: 78, age: 34, value: 2500000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 911303, name: 'Lucas Piovi', position: 'CEN', rating: 78, potential: 79, age: 32, value: 3800000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 911304, name: 'Álex Arce', position: 'DEL', rating: 80, potential: 82, age: 29, value: 7500000, wage: 42000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9114,
        name: 'Independiente del Valle',
        shortName: 'Indep. del Valle',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Ecuador/independiente-del-valle.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 20000000,
        transferBudget: 7500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#000000',
        secondaryColor: '#003DA5',
        country: 'ECU',
        conmebolRanking: 10,
        squad: [
            { id: 911401, name: 'Moisés Ramírez', position: 'POR', rating: 78, potential: 82, age: 24, value: 4500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 911402, name: 'Mateo Carabajal', position: 'DEF', rating: 77, potential: 79, age: 27, value: 3800000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 911403, name: 'Junior Sornoza', position: 'CEN', rating: 79, potential: 79, age: 30, value: 5000000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 911404, name: 'Jeison Medina', position: 'DEL', rating: 78, potential: 80, age: 29, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9115,
        name: 'Barcelona SC',
        shortName: 'Barcelona (ECU)',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Ecuador/barcelona-sc.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 18000000,
        transferBudget: 6500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#FFD700',
        secondaryColor: '#000000',
        country: 'ECU',
        conmebolRanking: 19,
        squad: [
            { id: 911501, name: 'Javier Burrai', position: 'POR', rating: 78, potential: 78, age: 33, value: 2800000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 911502, name: 'Jesús Trindade', position: 'CEN', rating: 77, potential: 77, age: 31, value: 3000000, wage: 26000, morale: 'Feliz', contractYears: 2 },
            { id: 911503, name: 'Octavio Rivero', position: 'DEL', rating: 78, potential: 78, age: 32, value: 4000000, wage: 35000, morale: 'Feliz', contractYears: 2 }
        ]
    },
    {
        id: 9116,
        name: 'CS Emelec',
        shortName: 'Emelec',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Ecuador/emelec.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 14000000,
        transferBudget: 4500000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#003DA5',
        secondaryColor: '#C8102E',
        country: 'ECU',
        conmebolRanking: 30,
        squad: createGenericSquad(911600, 'Emelec', 74)
    },

    // --- PERÚ (4) ---
    {
        id: 9117,
        name: 'Club Universitario de Deportes',
        shortName: 'Universitario',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Peru/universitario.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 15000000,
        transferBudget: 5000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#FFF8DC',
        secondaryColor: '#800000',
        country: 'PER',
        conmebolRanking: 29,
        squad: [
            { id: 911701, name: 'Sebastián Britos', position: 'POR', rating: 77, potential: 77, age: 36, value: 1800000, wage: 24000, morale: 'Feliz', contractYears: 2 },
            { id: 911702, name: 'Williams Riveros', position: 'DEF', rating: 77, potential: 77, age: 31, value: 2500000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 911703, name: 'Andy Polo', position: 'DEF', rating: 78, potential: 78, age: 29, value: 4000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 911704, name: 'Rodrigo Ureña', position: 'CEN', rating: 78, potential: 78, age: 31, value: 3800000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 911705, name: 'Edison Flores', position: 'DEL', rating: 78, potential: 78, age: 30, value: 4000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 911706, name: 'Alex Valera', position: 'DEL', rating: 78, potential: 79, age: 28, value: 4200000, wage: 30000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9118,
        name: 'Alianza Lima',
        shortName: 'Alianza Lima',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Peru/alianza-lima.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 15000000,
        transferBudget: 5000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#002B49',
        secondaryColor: '#FFFFFF',
        country: 'PER',
        conmebolRanking: 31,
        squad: [
            { id: 911801, name: 'Carlos Zambrano', position: 'DEF', rating: 78, potential: 78, age: 35, value: 2500000, wage: 38000, morale: 'Feliz', contractYears: 1 },
            { id: 911802, name: 'Sebastián Rodríguez', position: 'CEN', rating: 78, potential: 78, age: 32, value: 3500000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 911803, name: 'Paolo Guerrero', position: 'DEL', rating: 78, potential: 78, age: 40, value: 1500000, wage: 45000, morale: 'Feliz', contractYears: 1 },
            { id: 911804, name: 'Hernán Barcos', position: 'DEL', rating: 77, potential: 77, age: 40, value: 1200000, wage: 30000, morale: 'Feliz', contractYears: 1 }
        ]
    },
    {
        id: 9119,
        name: 'Sporting Cristal',
        shortName: 'Sporting Cristal',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Peru/sporting-cristal.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 14000000,
        transferBudget: 4500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#87CEEB',
        secondaryColor: '#FFFFFF',
        country: 'PER',
        conmebolRanking: 33,
        squad: [
            { id: 911901, name: 'Renato Solís', position: 'POR', rating: 76, potential: 78, age: 26, value: 2200000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 911902, name: 'Santiago González', position: 'DEL', rating: 79, potential: 82, age: 25, value: 6500000, wage: 30000, morale: 'Feliz', contractYears: 4 },
            { id: 911903, name: 'Martín Cauteruccio', position: 'DEL', rating: 80, potential: 80, age: 37, value: 3000000, wage: 40000, morale: 'Feliz', contractYears: 1 }
        ]
    },
    {
        id: 9120,
        name: 'FBC Melgar',
        shortName: 'Melgar',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Peru/fbc-melgar.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 10000000,
        transferBudget: 3200000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#C8102E',
        secondaryColor: '#000000',
        country: 'PER',
        conmebolRanking: 46,
        squad: createGenericSquad(912000, 'Melgar', 73)
    },

    // --- URUGUAY (4) ---
    {
        id: 9121,
        name: 'Peñarol',
        shortName: 'Peñarol',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Uruguay/penarol.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 20000000,
        transferBudget: 7500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#FFD700',
        secondaryColor: '#000000',
        country: 'URU',
        conmebolRanking: 8,
        squad: [
            { id: 912101, name: 'Washington Aguerre', position: 'POR', rating: 78, potential: 79, age: 31, value: 3000000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 912102, name: 'Guzmán Rodríguez', position: 'DEF', rating: 77, potential: 81, age: 24, value: 4000000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 912103, name: 'Damián García', position: 'CEN', rating: 78, potential: 85, age: 21, value: 6500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
            { id: 912104, name: 'Leonardo Fernández', position: 'CEN', rating: 81, potential: 82, age: 25, value: 8500000, wage: 45000, morale: 'Feliz', contractYears: 3 },
            { id: 912105, name: 'Maximiliano Silvera', position: 'DEL', rating: 78, potential: 80, age: 27, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9122,
        name: 'Club Nacional de Football',
        shortName: 'Nacional (URU)',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Uruguay/nacional.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 18000000,
        transferBudget: 6500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#FFFFFF',
        secondaryColor: '#003DA5',
        country: 'URU',
        conmebolRanking: 12,
        squad: [
            { id: 912201, name: 'Luis Mejía', position: 'POR', rating: 77, potential: 77, age: 33, value: 2200000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 912202, name: 'Sebastián Coates', position: 'DEF', rating: 79, potential: 79, age: 33, value: 4000000, wage: 42000, morale: 'Feliz', contractYears: 2 },
            { id: 912203, name: 'Christian Oliva', position: 'CEN', rating: 77, potential: 78, age: 28, value: 3500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 912204, name: 'Lucas Sanabria', position: 'CEN', rating: 76, potential: 83, age: 20, value: 4500000, wage: 15000, morale: 'Feliz', contractYears: 4 },
            { id: 912205, name: 'Rubén Bentancourt', position: 'DEL', rating: 76, potential: 76, age: 31, value: 2200000, wage: 22000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 9123,
        name: 'Defensor Sporting',
        shortName: 'Defensor Sp.',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Uruguay/defensor.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 3000000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#4B0082',
        secondaryColor: '#FFFFFF',
        country: 'URU',
        conmebolRanking: 42,
        squad: createGenericSquad(912300, 'Defensor Sp.', 73)
    },
    {
        id: 9124,
        name: 'Liverpool FC (Montevideo)',
        shortName: 'Liverpool (URU)',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Uruguay/liverpool.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 3000000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#003DA5',
        secondaryColor: '#000000',
        country: 'URU',
        conmebolRanking: 48,
        squad: createGenericSquad(912400, 'Liverpool URU', 72)
    },

    // --- VENEZUELA (4) ---
    {
        id: 9125,
        name: 'Deportivo Táchira',
        shortName: 'Dep. Táchira',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Venezuela/deportivo-tachira.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 3000000,
        tier: 'Mid',
        teamMorale: 'Feliz',
        primaryColor: '#FFD700',
        secondaryColor: '#000000',
        country: 'VEN',
        conmebolRanking: 49,
        squad: [
            { id: 912501, name: 'Alejandro Araque', position: 'POR', rating: 75, potential: 77, age: 28, value: 1800000, wage: 16000, morale: 'Feliz', contractYears: 2 },
            { id: 912502, name: 'Carlos Vivas', position: 'DEF', rating: 75, potential: 80, age: 22, value: 2500000, wage: 14000, morale: 'Feliz', contractYears: 3 },
            { id: 912503, name: 'Maurice Cova', position: 'CEN', rating: 76, potential: 76, age: 32, value: 1800000, wage: 20000, morale: 'Feliz', contractYears: 2 },
            { id: 912504, name: 'Anthony Uribe', position: 'DEL', rating: 75, potential: 75, age: 33, value: 1200000, wage: 18000, morale: 'Normal', contractYears: 1 }
        ]
    },
    {
        id: 9126,
        name: 'Caracas FC',
        shortName: 'Caracas FC',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Venezuela/caracas.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 8000000,
        transferBudget: 2500000,
        tier: 'Lower',
        teamMorale: 'Normal',
        primaryColor: '#C8102E',
        secondaryColor: '#000000',
        country: 'VEN',
        conmebolRanking: 55,
        squad: [
            { id: 912601, name: 'Wuilker Faríñez', position: 'POR', rating: 77, potential: 79, age: 26, value: 3000000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 912602, name: 'Rubert Quijada', position: 'DEF', rating: 74, potential: 74, age: 35, value: 800000, wage: 15000, morale: 'Normal', contractYears: 1 },
            { id: 912603, name: 'Vicente Rodríguez', position: 'CEN', rating: 74, potential: 76, age: 29, value: 1400000, wage: 14000, morale: 'Normal', contractYears: 2 },
            { id: 912604, name: 'Ender Echenique', position: 'DEL', rating: 75, potential: 82, age: 20, value: 2500000, wage: 10000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    {
        id: 9127,
        name: 'Carabobo FC',
        shortName: 'Carabobo',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Venezuela/carabobo.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 6500000,
        transferBudget: 1600000,
        tier: 'Lower',
        teamMorale: 'Normal',
        primaryColor: '#800020',
        secondaryColor: '#FFFFFF',
        country: 'VEN',
        conmebolRanking: 72,
        squad: createGenericSquad(912700, 'Carabobo', 70)
    },
    {
        id: 9128,
        name: 'Monagas SC',
        shortName: 'Monagas',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Venezuela/monagas.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 6000000,
        transferBudget: 1400000,
        tier: 'Lower',
        teamMorale: 'Normal',
        primaryColor: '#0033A0',
        secondaryColor: '#C8102E',
        country: 'VEN',
        conmebolRanking: 78,
        squad: createGenericSquad(912800, 'Monagas', 69)
    },

    // --- CHILE EXTRAS (For Copa Sudamericana & Libertadores) ---
    {
        id: 9129,
        name: 'Palestino',
        shortName: 'Palestino',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Chile/palestino.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 2800000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#000000',
        secondaryColor: '#006400',
        country: 'CHI',
        conmebolRanking: 55,
        squad: createGenericSquad(912900, 'Palestino', 73)
    },
    {
        id: 9130,
        name: 'Everton de Viña del Mar',
        shortName: 'Everton (CHI)',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Football%20Club%20Logos/Chile/everton.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 2800000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#003DA5',
        secondaryColor: '#FFD700',
        country: 'CHI',
        conmebolRanking: 60,
        squad: createGenericSquad(913000, 'Everton CHI', 73)
    }
];

export const KNOWN_CONMEBOL_META: Record<string, { country: ConmebolTeamMeta['country']; ranking: number }> = {
    // Argentina
    'River Plate': { country: 'ARG', ranking: 1 },
    'Palmeiras': { country: 'BRA', ranking: 2 },
    'Flamengo': { country: 'BRA', ranking: 3 },
    'Boca Juniors': { country: 'ARG', ranking: 4 },
    'São Paulo': { country: 'BRA', ranking: 5 },
    'Fluminense': { country: 'BRA', ranking: 6 },
    'Atlético Mineiro': { country: 'BRA', ranking: 7 },
    'Club Nacional de Football': { country: 'URU', ranking: 8 },
    'Peñarol': { country: 'URU', ranking: 9 },
    'Independiente del Valle': { country: 'ECU', ranking: 10 },
    'Club Olimpia': { country: 'PAR', ranking: 11 },
    'LDU Quito': { country: 'ECU', ranking: 12 },
    'Racing Club': { country: 'ARG', ranking: 13 },
    'Sport Club Internacional': { country: 'BRA', ranking: 14 },
    'Grêmio': { country: 'BRA', ranking: 15 },
    'Atlético Nacional': { country: 'COL', ranking: 16 },
    'Cerro Porteño': { country: 'PAR', ranking: 17 },
    'Colo-Colo': { country: 'CHI', ranking: 18 },
    'Estudiantes de La Plata': { country: 'ARG', ranking: 19 },
    'Club Libertad': { country: 'PAR', ranking: 20 },
    'Botafogo': { country: 'BRA', ranking: 21 },
    'Barcelona SC': { country: 'ECU', ranking: 22 },
    'Vélez Sarsfield': { country: 'ARG', ranking: 23 },
    'Corinthians': { country: 'BRA', ranking: 24 },
    'San Lorenzo': { country: 'ARG', ranking: 25 },
    'Talleres (Córdoba)': { country: 'ARG', ranking: 26 },
    'Club Bolívar': { country: 'BOL', ranking: 27 },
    'Junior de Barranquilla': { country: 'COL', ranking: 28 },
    'Defensa y Justicia': { country: 'ARG', ranking: 29 },
    'Millonarios': { country: 'COL', ranking: 30 },
};

export const getTeamConmebolMeta = (team: Team | number): ConmebolTeamMeta => {
    const id = typeof team === 'number' ? team : team.id;
    const name = typeof team === 'object' ? team.name : '';
    const shortName = typeof team === 'object' ? team.shortName : '';
    const leagueId = typeof team === 'object' ? team.leagueId : undefined;

    // Check if team is in extra list
    const extra = SOUTH_AMERICAN_EXTRA_TEAMS.find(t => t.id === id);
    if (extra) {
        return { country: extra.country, conmebolRanking: extra.conmebolRanking };
    }
    // Check by name in known meta
    if (name || shortName) {
        const match = KNOWN_CONMEBOL_META[name] || (shortName ? KNOWN_CONMEBOL_META[shortName] : undefined);
        if (match) {
            return { country: match.country, conmebolRanking: match.ranking };
        }
    }
    // Fallback by leagueId / ID range
    if (leagueId === LeagueId.LIGA_ARGENTINA || (id >= 701 && id <= 740)) {
        return { country: 'ARG', conmebolRanking: 40 + (id % 40) };
    }
    if (leagueId === LeagueId.BRASILEIRAO || (id >= 801 && id <= 830)) {
        return { country: 'BRA', conmebolRanking: 25 + (id % 40) };
    }
    if (leagueId === LeagueId.COPA_DE_PRIMERA || (id >= 981 && id <= 992)) {
        return { country: 'PAR', conmebolRanking: 35 + (id % 35) };
    }
    if (leagueId === LeagueId.PRIMERA_DIVISION_CHILE || (id >= 1201 && id <= 1216)) {
        return { country: 'CHI', conmebolRanking: 40 + (id % 40) };
    }
    return { country: 'ARG', conmebolRanking: 99 };
};
`;

fs.writeFileSync(path.join(__dirname, '..', 'data', 'teams', 'southAmericanClubs.ts'), southAmericanClubsContent, 'utf-8');
console.log('✅ data/teams/southAmericanClubs.ts actualizado con estructura CONMEBOL completa.');
