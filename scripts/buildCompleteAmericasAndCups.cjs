const fs = require('fs');
const path = require('path');

// 1. COPA DE PRIMERA (PARAGUAY)
const copaDePrimeraContent = `import { Team, LeagueId } from '../../types';

export const copaDePrimeraTeams: Team[] = [
    {
        id: 981,
        name: 'Club Olimpia',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Copa%20de%20Primera/paraguay_olimpia.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 22000000,
        transferBudget: 8500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        squad: [
            { id: 98101, name: 'Gastón Olveira', position: 'POR', rating: 78, potential: 80, age: 31, value: 2500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 98102, name: 'Saúl Salcedo', position: 'DEF', rating: 75, potential: 77, age: 27, value: 2000000, wage: 18000, morale: 'Feliz', contractYears: 2 },
            { id: 98103, name: 'Junior Barreto', position: 'DEF', rating: 75, potential: 78, age: 26, value: 2200000, wage: 16000, morale: 'Contento', contractYears: 3 },
            { id: 98104, name: 'Facundo Zabala', position: 'DEF', rating: 76, potential: 79, age: 25, value: 2800000, wage: 18000, morale: 'Feliz', contractYears: 3 },
            { id: 98105, name: 'Richard Ortiz', position: 'CEN', rating: 75, potential: 75, age: 34, value: 1000000, wage: 22000, morale: 'Feliz', contractYears: 1 },
            { id: 98106, name: 'Marcos Gómez', position: 'CEN', rating: 75, potential: 81, age: 22, value: 3000000, wage: 16000, morale: 'Contento', contractYears: 3 },
            { id: 98107, name: 'Derlis González', position: 'DEL', rating: 79, potential: 80, age: 30, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 98108, name: 'Lucas Pratto', position: 'DEL', rating: 74, potential: 74, age: 36, value: 800000, wage: 25000, morale: 'Contento', contractYears: 1 },
            { id: 98109, name: 'Facundo Bruera', position: 'DEL', rating: 74, potential: 77, age: 25, value: 2000000, wage: 16000, morale: 'Normal', contractYears: 2 },
            { id: 98110, name: 'Hugo Fernández', position: 'DEL', rating: 74, potential: 76, age: 26, value: 1800000, wage: 14000, morale: 'Normal', contractYears: 2 },
            { id: 98111, name: 'Carlos Arrúa', position: 'CEN', rating: 74, potential: 77, age: 27, value: 1800000, wage: 15000, morale: 'Contento', contractYears: 2 },
            { id: 98112, name: 'César Olmedo', position: 'DEF', rating: 74, potential: 82, age: 21, value: 2500000, wage: 12000, morale: 'Contento', contractYears: 4 }
        ]
    },
    {
        id: 982,
        name: 'Cerro Porteño',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Copa%20de%20Primera/paraguay_cerro-porteno.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 20000000,
        transferBudget: 8000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#003DA5',
        secondaryColor: '#C8102E',
        squad: [
            { id: 98201, name: 'Jean Fernandes', position: 'POR', rating: 78, potential: 79, age: 28, value: 3500000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 98202, name: 'Eduardo Brock', position: 'DEF', rating: 74, potential: 74, age: 33, value: 1200000, wage: 18000, morale: 'Contento', contractYears: 2 },
            { id: 98203, name: 'Jorge Morel', position: 'DEF', rating: 76, potential: 78, age: 26, value: 3000000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 98204, name: 'Alan Benítez', position: 'DEF', rating: 75, potential: 76, age: 30, value: 2000000, wage: 18000, morale: 'Contento', contractYears: 2 },
            { id: 98205, name: 'Robert Piris da Motta', position: 'CEN', rating: 76, potential: 77, age: 30, value: 2800000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 98206, name: 'Federico Carrizo', position: 'CEN', rating: 76, potential: 76, age: 33, value: 1800000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 98207, name: 'Cecilio Domínguez', position: 'DEL', rating: 78, potential: 78, age: 30, value: 4000000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 98208, name: 'Diego Churín', position: 'DEL', rating: 74, potential: 74, age: 34, value: 1000000, wage: 20000, morale: 'Normal', contractYears: 1 },
            { id: 98209, name: 'Juan Manuel Iturbe', position: 'DEL', rating: 76, potential: 76, age: 31, value: 2500000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 98210, name: 'Fabrizio Peralta', position: 'CEN', rating: 75, potential: 83, age: 21, value: 3800000, wage: 15000, morale: 'Feliz', contractYears: 4 },
            { id: 98211, name: 'Santiago Arzamendia', position: 'DEF', rating: 76, potential: 78, age: 26, value: 3000000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 98212, name: 'Fernando Fernández', position: 'DEL', rating: 74, potential: 74, age: 32, value: 1200000, wage: 16000, morale: 'Normal', contractYears: 2 }
        ]
    },
    {
        id: 983,
        name: 'Libertad',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Copa%20de%20Primera/paraguay_libertad.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 20000000,
        transferBudget: 7500000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        squad: [
            { id: 98301, name: 'Martín Silva', position: 'POR', rating: 76, potential: 76, age: 41, value: 800000, wage: 22000, morale: 'Feliz', contractYears: 1 },
            { id: 98302, name: 'Diego Viera', position: 'DEF', rating: 74, potential: 74, age: 33, value: 1200000, wage: 16000, morale: 'Contento', contractYears: 2 },
            { id: 98303, name: 'Néstor Giménez', position: 'DEF', rating: 74, potential: 77, age: 27, value: 1800000, wage: 15000, morale: 'Normal', contractYears: 3 },
            { id: 98304, name: 'Matías Espinoza', position: 'DEF', rating: 76, potential: 78, age: 26, value: 2800000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 98305, name: 'Álvaro Campuzano', position: 'CEN', rating: 75, potential: 77, age: 28, value: 2200000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 98306, name: 'Hernesto Caballero', position: 'CEN', rating: 75, potential: 76, age: 33, value: 1600000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 98307, name: 'Óscar Cardozo', position: 'DEL', rating: 75, potential: 75, age: 41, value: 600000, wage: 25000, morale: 'Feliz', contractYears: 1 },
            { id: 98308, name: 'Lorenzo Melgarejo', position: 'DEL', rating: 78, potential: 78, age: 33, value: 3800000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 98309, name: 'Roque Santa Cruz', position: 'DEL', rating: 73, potential: 73, age: 42, value: 400000, wage: 20000, morale: 'Feliz', contractYears: 1 },
            { id: 98310, name: 'Rubén Lezcano', position: 'CEN', rating: 76, potential: 84, age: 20, value: 4500000, wage: 15000, morale: 'Feliz', contractYears: 4 },
            { id: 98311, name: 'Rodrigo Villalba', position: 'DEL', rating: 74, potential: 83, age: 18, value: 3200000, wage: 12000, morale: 'Contento', contractYears: 4 },
            { id: 98312, name: 'Gustavo Aguilar', position: 'DEL', rating: 74, potential: 76, age: 24, value: 1800000, wage: 14000, morale: 'Normal', contractYears: 3 }
        ]
    },
    {
        id: 984,
        name: 'Club Guaraní',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Copa%20de%20Primera/paraguay_guarani.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 11000000,
        transferBudget: 4000000,
        tier: 'Mid',
        teamMorale: 'Contento',
        primaryColor: '#FFD700',
        secondaryColor: '#000000',
        squad: [
            { id: 98401, name: 'Gaspar Servio', position: 'POR', rating: 75, potential: 75, age: 32, value: 1800000, wage: 18000, morale: 'Feliz', contractYears: 2 },
            { id: 98402, name: 'Paul Riveros', position: 'DEF', rating: 74, potential: 76, age: 26, value: 1600000, wage: 14000, morale: 'Contento', contractYears: 2 },
            { id: 98403, name: 'Mario López', position: 'DEF', rating: 74, potential: 75, age: 28, value: 1500000, wage: 14000, morale: 'Normal', contractYears: 2 },
            { id: 98404, name: 'Daniel Pérez', position: 'DEF', rating: 73, potential: 76, age: 24, value: 1200000, wage: 12000, morale: 'Contento', contractYears: 3 },
            { id: 98405, name: 'Agustín Manzur', position: 'CEN', rating: 75, potential: 78, age: 23, value: 2200000, wage: 16000, morale: 'Feliz', contractYears: 3 },
            { id: 98406, name: 'Bruno Piñatares', position: 'CEN', rating: 74, potential: 74, age: 34, value: 1000000, wage: 16000, morale: 'Normal', contractYears: 1 },
            { id: 98407, name: 'Richard Prieto', position: 'DEL', rating: 74, potential: 76, age: 27, value: 1800000, wage: 15000, morale: 'Contento', contractYears: 2 },
            { id: 98408, name: 'Adrián Alcaraz', position: 'DEL', rating: 76, potential: 79, age: 24, value: 2800000, wage: 18000, morale: 'Feliz', contractYears: 3 },
            { id: 98409, name: 'Walter González', position: 'DEL', rating: 74, potential: 75, age: 29, value: 1600000, wage: 16000, morale: 'Contento', contractYears: 2 },
            { id: 98410, name: 'Danilo Santacruz', position: 'DEL', rating: 74, potential: 75, age: 29, value: 1600000, wage: 15000, morale: 'Normal', contractYears: 2 }
        ]
    },
    {
        id: 985,
        name: 'Club Nacional',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Copa%20de%20Primera/paraguay_nacional.football-logos.cc.svg',
        leagueId: LeagueId.COPA_DE_PRIMERA,
        budget: 9000000,
        transferBudget: 3000000,
        tier: 'Mid',
        teamMorale: 'Normal',
        primaryColor: '#FFFFFF',
        secondaryColor: '#003DA5',
        squad: [
            { id: 98501, name: 'Santiago Rojas', position: 'POR', rating: 75, potential: 77, age: 28, value: 1800000, wage: 16000, morale: 'Feliz', contractYears: 2 },
            { id: 98502, name: 'Claudio Núñez', position: 'DEF', rating: 74, potential: 75, age: 26, value: 1500000, wage: 13000, morale: 'Contento', contractYears: 2 },
            { id: 98503, name: 'Juan Fernando Alfaro', position: 'CEN', rating: 75, potential: 78, age: 24, value: 2200000, wage: 15000, morale: 'Feliz', contractYears: 3 },
            { id: 98504, name: 'Leandro Meza', position: 'CEN', rating: 74, potential: 76, age: 26, value: 1600000, wage: 13000, morale: 'Normal', contractYears: 2 },
            { id: 98505, name: 'Diego Duarte', position: 'DEL', rating: 75, potential: 80, age: 22, value: 2500000, wage: 15000, morale: 'Feliz', contractYears: 3 },
            { id: 98506, name: 'Tiago Caballero', position: 'DEL', rating: 74, potential: 81, age: 19, value: 2200000, wage: 10000, morale: 'Feliz', contractYears: 4 },
            { id: 98507, name: 'Gustavo Caballero', position: 'DEL', rating: 74, potential: 78, age: 22, value: 2000000, wage: 12000, morale: 'Contento', contractYears: 3 }
        ]
    }
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'data', 'teams', 'copaDePrimera.ts'), copaDePrimeraContent, 'utf-8');
console.log('✅ data/teams/copaDePrimera.ts actualizado.');

// 2. LIGA MX (MÉXICO)
const ligaMxContent = `import { Team, LeagueId } from '../../types';

export const ligaMxTeams: Team[] = [
    {
        id: 1101,
        name: 'Club América',
        shortName: 'América',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_club-america.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 35000000,
        transferBudget: 15000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#FFF4D0',
        secondaryColor: '#001E62',
        squad: [
            { id: 110101, name: 'Luis Malagón', position: 'POR', rating: 80, potential: 82, age: 27, value: 6500000, wage: 45000, morale: 'Feliz', contractYears: 3 },
            { id: 110102, name: 'Sebastián Cáceres', position: 'DEF', rating: 79, potential: 83, age: 25, value: 7000000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 110103, name: 'Israel Reyes', position: 'DEF', rating: 77, potential: 81, age: 24, value: 5000000, wage: 30000, morale: 'Contento', contractYears: 3 },
            { id: 110104, name: 'Cristian Calderón', position: 'DEF', rating: 76, potential: 77, age: 27, value: 3500000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 110105, name: 'Álvaro Fidalgo', position: 'CEN', rating: 82, potential: 84, age: 27, value: 10500000, wage: 55000, morale: 'Feliz', contractYears: 3 },
            { id: 110106, name: 'Jonathan dos Santos', position: 'CEN', rating: 77, potential: 77, age: 34, value: 2000000, wage: 35000, morale: 'Feliz', contractYears: 1 },
            { id: 110107, name: 'Diego Valdés', position: 'CEN', rating: 81, potential: 81, age: 30, value: 8500000, wage: 50000, morale: 'Feliz', contractYears: 2 },
            { id: 110108, name: 'Alejandro Zendejas', position: 'DEL', rating: 79, potential: 81, age: 26, value: 6500000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 110109, name: 'Henry Martín', position: 'DEL', rating: 82, potential: 82, age: 31, value: 8000000, wage: 55000, morale: 'Feliz', contractYears: 2 },
            { id: 110110, name: 'Brian Rodríguez', position: 'DEL', rating: 78, potential: 81, age: 24, value: 5500000, wage: 32000, morale: 'Contento', contractYears: 3 },
            { id: 110111, name: 'Javairô Dilrosun', position: 'DEL', rating: 77, potential: 80, age: 26, value: 4800000, wage: 36000, morale: 'Contento', contractYears: 3 },
            { id: 110112, name: 'Rodrigo Aguirre', position: 'DEL', rating: 77, potential: 78, age: 29, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 1102,
        name: 'CD Guadalajara',
        shortName: 'Chivas',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_cd-guadalajara.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 28000000,
        transferBudget: 11000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#C8102E',
        secondaryColor: '#002B49',
        squad: [
            { id: 110201, name: 'Raúl Rangel', position: 'POR', rating: 78, potential: 83, age: 24, value: 4500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 110202, name: 'Gilberto Sepúlveda', position: 'DEF', rating: 76, potential: 78, age: 25, value: 3800000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 110203, name: 'Jesús Orozco Chiquete', position: 'DEF', rating: 79, potential: 85, age: 22, value: 7500000, wage: 32000, morale: 'Feliz', contractYears: 4 },
            { id: 110204, name: 'Alan Mozo', position: 'DEF', rating: 78, potential: 79, age: 27, value: 5000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 110205, name: 'Fernando Beltrán', position: 'CEN', rating: 79, potential: 82, age: 26, value: 6500000, wage: 36000, morale: 'Feliz', contractYears: 3 },
            { id: 110206, name: 'Érick Gutiérrez', position: 'CEN', rating: 78, potential: 78, age: 29, value: 5000000, wage: 40000, morale: 'Contento', contractYears: 2 },
            { id: 110207, name: 'Víctor Guzmán', position: 'CEN', rating: 77, potential: 77, age: 29, value: 4500000, wage: 38000, morale: 'Contento', contractYears: 2 },
            { id: 110208, name: 'Roberto Alvarado', position: 'DEL', rating: 81, potential: 83, age: 25, value: 9500000, wage: 48000, morale: 'Feliz', contractYears: 4 },
            { id: 110209, name: 'Chicharito Hernández', position: 'DEL', rating: 76, potential: 76, age: 36, value: 2000000, wage: 45000, morale: 'Feliz', contractYears: 1 },
            { id: 110210, name: 'Cade Cowell', position: 'DEL', rating: 77, potential: 84, age: 20, value: 6000000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 110211, name: 'Armando González', position: 'DEL', rating: 75, potential: 84, age: 21, value: 4000000, wage: 18000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    {
        id: 1103,
        name: 'Cruz Azul',
        shortName: 'Cruz Azul',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_cruz-azul.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 32000000,
        transferBudget: 13000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#0033A0',
        secondaryColor: '#FFFFFF',
        squad: [
            { id: 110301, name: 'Kevin Mier', position: 'POR', rating: 81, potential: 85, age: 24, value: 8500000, wage: 45000, morale: 'Feliz', contractYears: 4 },
            { id: 110302, name: 'Willer Ditta', position: 'DEF', rating: 78, potential: 80, age: 27, value: 5500000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 110303, name: 'Gonzalo Piovi', position: 'DEF', rating: 78, potential: 79, age: 29, value: 5000000, wage: 36000, morale: 'Feliz', contractYears: 3 },
            { id: 110304, name: 'Jorge Sánchez', position: 'DEF', rating: 77, potential: 79, age: 26, value: 4800000, wage: 35000, morale: 'Contento', contractYears: 3 },
            { id: 110305, name: 'Carlos Rodríguez', position: 'CEN', rating: 79, potential: 81, age: 27, value: 7000000, wage: 42000, morale: 'Feliz', contractYears: 3 },
            { id: 110306, name: 'Erik Lira', position: 'CEN', rating: 78, potential: 82, age: 24, value: 6000000, wage: 34000, morale: 'Feliz', contractYears: 4 },
            { id: 110307, name: 'Lorenzo Faravelli', position: 'CEN', rating: 77, potential: 77, age: 31, value: 3800000, wage: 32000, morale: 'Contento', contractYears: 2 },
            { id: 110308, name: 'Ignacio Rivero', position: 'CEN', rating: 78, potential: 78, age: 32, value: 4000000, wage: 36000, morale: 'Feliz', contractYears: 2 },
            { id: 110309, name: 'Alexis Gutiérrez', position: 'DEL', rating: 76, potential: 80, age: 24, value: 4000000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 110310, name: 'Ángel Sepúlveda', position: 'DEL', rating: 78, potential: 78, age: 33, value: 4000000, wage: 35000, morale: 'Feliz', contractYears: 2 },
            { id: 110311, name: 'Giorgos Giakoumakis', position: 'DEL', rating: 80, potential: 81, age: 29, value: 8500000, wage: 50000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 1104,
        name: 'CF Monterrey',
        shortName: 'Rayados',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_cf-monterrey.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 40000000,
        transferBudget: 18000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#002244',
        secondaryColor: '#FFFFFF',
        squad: [
            { id: 110401, name: 'Esteban Andrada', position: 'POR', rating: 79, potential: 79, age: 33, value: 4000000, wage: 42000, morale: 'Feliz', contractYears: 2 },
            { id: 110402, name: 'Víctor Guzmán', position: 'DEF', rating: 78, potential: 84, age: 22, value: 6500000, wage: 30000, morale: 'Feliz', contractYears: 4 },
            { id: 110403, name: 'Héctor Moreno', position: 'DEF', rating: 76, potential: 76, age: 36, value: 1500000, wage: 32000, morale: 'Contento', contractYears: 1 },
            { id: 110404, name: 'Gerardo Arteaga', position: 'DEF', rating: 78, potential: 81, age: 25, value: 6000000, wage: 36000, morale: 'Feliz', contractYears: 3 },
            { id: 110405, name: 'Jorge Rodríguez (Corcho)', position: 'CEN', rating: 79, potential: 81, age: 28, value: 6500000, wage: 42000, morale: 'Feliz', contractYears: 3 },
            { id: 110406, name: 'Óliver Torres', position: 'CEN', rating: 80, potential: 80, age: 29, value: 8000000, wage: 52000, morale: 'Feliz', contractYears: 3 },
            { id: 110407, name: 'Sergio Canales', position: 'CEN', rating: 83, potential: 83, age: 33, value: 11000000, wage: 68000, morale: 'Feliz', contractYears: 2 },
            { id: 110408, name: 'Lucas Ocampos', position: 'DEL', rating: 81, potential: 81, age: 30, value: 9000000, wage: 58000, morale: 'Feliz', contractYears: 3 },
            { id: 110409, name: 'Jordi Cortizo', position: 'DEL', rating: 78, potential: 79, age: 28, value: 5000000, wage: 34000, morale: 'Contento', contractYears: 3 },
            { id: 110410, name: 'Germán Berterame', position: 'DEL', rating: 80, potential: 82, age: 25, value: 8500000, wage: 48000, morale: 'Feliz', contractYears: 4 },
            { id: 110411, name: 'Brandon Vázquez', position: 'DEL', rating: 78, potential: 81, age: 25, value: 6500000, wage: 40000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 1105,
        name: 'Tigres UANL',
        shortName: 'Tigres',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_tigres-uanl.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 38000000,
        transferBudget: 16000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#F7A800',
        secondaryColor: '#002B49',
        squad: [
            { id: 110501, name: 'Nahuel Guzmán', position: 'POR', rating: 80, potential: 80, age: 38, value: 2500000, wage: 48000, morale: 'Feliz', contractYears: 1 },
            { id: 110502, name: 'Joaquim', position: 'DEF', rating: 78, potential: 82, age: 25, value: 6000000, wage: 35000, morale: 'Feliz', contractYears: 4 },
            { id: 110503, name: 'Guido Pizarro', position: 'DEF', rating: 78, potential: 78, age: 34, value: 2500000, wage: 42000, morale: 'Feliz', contractYears: 1 },
            { id: 110504, name: 'Jesús Angulo', position: 'DEF', rating: 78, potential: 81, age: 26, value: 6000000, wage: 36000, morale: 'Feliz', contractYears: 3 },
            { id: 110505, name: 'Rafael Carioca', position: 'CEN', rating: 79, potential: 79, age: 35, value: 2800000, wage: 45000, morale: 'Feliz', contractYears: 1 },
            { id: 110506, name: 'Fernando Gorriarán', position: 'CEN', rating: 80, potential: 81, age: 29, value: 8000000, wage: 48000, morale: 'Feliz', contractYears: 3 },
            { id: 110507, name: 'Juan Brunetta', position: 'CEN', rating: 82, potential: 83, age: 27, value: 11000000, wage: 55000, morale: 'Feliz', contractYears: 4 },
            { id: 110508, name: 'Diego Lainez', position: 'DEL', rating: 78, potential: 82, age: 24, value: 6000000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 110509, name: 'Sebastián Córdova', position: 'DEL', rating: 78, potential: 80, age: 27, value: 5500000, wage: 40000, morale: 'Contento', contractYears: 3 },
            { id: 110510, name: 'André-Pierre Gignac', position: 'DEL', rating: 81, potential: 81, age: 38, value: 3500000, wage: 65000, morale: 'Feliz', contractYears: 1 },
            { id: 110511, name: 'Nicolás Ibáñez', position: 'DEL', rating: 78, potential: 79, age: 29, value: 5500000, wage: 42000, morale: 'Contento', contractYears: 3 },
            { id: 110512, name: 'Uriel Antuna', position: 'DEL', rating: 79, potential: 80, age: 27, value: 6500000, wage: 44000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    {
        id: 1106,
        name: 'Deportivo Toluca',
        shortName: 'Toluca',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_deportivo-toluca.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 28000000,
        transferBudget: 11000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#C8102E',
        secondaryColor: '#FFFFFF',
        squad: [
            { id: 110601, name: 'Tiago Volpi', position: 'POR', rating: 79, potential: 79, age: 33, value: 3500000, wage: 40000, morale: 'Feliz', contractYears: 2 },
            { id: 110602, name: 'Federico Pereira', position: 'DEF', rating: 78, potential: 82, age: 24, value: 6000000, wage: 32000, morale: 'Feliz', contractYears: 4 },
            { id: 110603, name: 'Luan Garcia', position: 'DEF', rating: 78, potential: 78, age: 31, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 110604, name: 'Jesús Gallardo', position: 'DEF', rating: 78, potential: 78, age: 30, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 2 },
            { id: 110605, name: 'Marcel Ruiz', position: 'CEN', rating: 80, potential: 85, age: 23, value: 8500000, wage: 36000, morale: 'Feliz', contractYears: 4 },
            { id: 110606, name: 'Claudio Baeza', position: 'CEN', rating: 77, potential: 77, age: 30, value: 3500000, wage: 30000, morale: 'Contento', contractYears: 2 },
            { id: 110607, name: 'Jesús Angulo (Canelo)', position: 'CEN', rating: 78, potential: 80, age: 27, value: 5000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 110608, name: 'Alexis Vega', position: 'DEL', rating: 81, potential: 82, age: 26, value: 9000000, wage: 52000, morale: 'Feliz', contractYears: 3 },
            { id: 110609, name: 'Paulinho', position: 'DEL', rating: 82, potential: 82, age: 31, value: 9500000, wage: 55000, morale: 'Feliz', contractYears: 3 },
            { id: 110610, name: 'Robert Morales', position: 'DEL', rating: 76, potential: 79, age: 25, value: 3800000, wage: 26000, morale: 'Contento', contractYears: 3 }
        ]
    },
    {
        id: 1107,
        name: 'Club Universidad Nacional',
        shortName: 'Pumas UNAM',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_club-universidad-nacional.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 22000000,
        transferBudget: 8000000,
        tier: 'Mid',
        teamMorale: 'Feliz',
        primaryColor: '#002B49',
        secondaryColor: '#C49A45',
        squad: [
            { id: 110701, name: 'Julio González', position: 'POR', rating: 78, potential: 78, age: 33, value: 3000000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 110702, name: 'Lisandro Magallán', position: 'DEF', rating: 77, potential: 77, age: 30, value: 3500000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 110703, name: 'Nathan Silva', position: 'DEF', rating: 78, potential: 80, age: 27, value: 5000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 110704, name: 'Pablo Bennevendo', position: 'DEF', rating: 75, potential: 78, age: 24, value: 2500000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 110705, name: 'José Caicedo', position: 'CEN', rating: 77, potential: 82, age: 22, value: 4500000, wage: 24000, morale: 'Feliz', contractYears: 4 },
            { id: 110706, name: 'Piero Quispe', position: 'CEN', rating: 77, potential: 84, age: 22, value: 5000000, wage: 25000, morale: 'Feliz', contractYears: 4 },
            { id: 110707, name: 'Ulises Rivas', position: 'CEN', rating: 76, potential: 77, age: 28, value: 3000000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 110708, name: 'César Huerta (Chino)', position: 'DEL', rating: 81, potential: 84, age: 23, value: 9500000, wage: 45000, morale: 'Feliz', contractYears: 3 },
            { id: 110709, name: 'Jorge Ruvalcaba', position: 'DEL', rating: 76, potential: 82, age: 23, value: 3500000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 110710, name: 'Guillermo Martínez', position: 'DEL', rating: 78, potential: 79, age: 29, value: 4800000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 110711, name: 'Ignacio Pussetto', position: 'DEL', rating: 78, potential: 78, age: 28, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 1108,
        name: 'CF Pachuca',
        shortName: 'Pachuca',
        logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Liga%20MX/mexico_cf-pachuca.football-logos.cc.svg',
        leagueId: LeagueId.LIGA_MX,
        budget: 24000000,
        transferBudget: 9000000,
        tier: 'Top',
        teamMorale: 'Feliz',
        primaryColor: '#002B49',
        secondaryColor: '#FFFFFF',
        squad: [
            { id: 110801, name: 'Carlos Moreno', position: 'POR', rating: 77, potential: 80, age: 26, value: 3500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 110802, name: 'Gustavo Cabral', position: 'DEF', rating: 76, potential: 76, age: 38, value: 1000000, wage: 28000, morale: 'Feliz', contractYears: 1 },
            { id: 110803, name: 'Sergio Barreto', position: 'DEF', rating: 77, potential: 79, age: 25, value: 4500000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 110804, name: 'Bryan González', position: 'DEF', rating: 77, potential: 84, age: 21, value: 5500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 110805, name: 'Pedro Pedraza', position: 'CEN', rating: 76, potential: 80, age: 24, value: 3500000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 110806, name: 'Nelson Deossa', position: 'CEN', rating: 79, potential: 83, age: 24, value: 7000000, wage: 32000, morale: 'Feliz', contractYears: 4 },
            { id: 110807, name: 'Alfonso González (Ponchito)', position: 'CEN', rating: 77, potential: 77, age: 29, value: 4000000, wage: 30000, morale: 'Contento', contractYears: 3 },
            { id: 110808, name: 'Oussama Idrissi', position: 'DEL', rating: 82, potential: 82, age: 28, value: 11000000, wage: 55000, morale: 'Feliz', contractYears: 3 },
            { id: 110809, name: 'Owen González', position: 'DEL', rating: 75, potential: 83, age: 21, value: 3000000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 110810, name: 'Salomón Rondón', position: 'DEL', rating: 81, potential: 81, age: 34, value: 6000000, wage: 52000, morale: 'Feliz', contractYears: 2 },
            { id: 110811, name: 'Borja Bastón', position: 'DEL', rating: 75, potential: 75, age: 31, value: 2000000, wage: 26000, morale: 'Normal', contractYears: 2 }
        ]
    }
];

export const ligaExpansionMxTeams: Team[] = [
    { id: 1151, name: 'Atlante', logo: 'https://tmssl.akamaized.net/images/wappen/head/10008.png', leagueId: LeagueId.LIGA_EXPANSION_MX, budget: 6000000, transferBudget: 1500000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#C8102E', squad: [] },
    { id: 1152, name: 'Cancún FC', logo: 'https://tmssl.akamaized.net/images/wappen/head/81261.png', leagueId: LeagueId.LIGA_EXPANSION_MX, budget: 5000000, transferBudget: 1200000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#00B4D8', secondaryColor: '#000000', squad: [] },
    { id: 1153, name: 'Celaya', logo: 'https://tmssl.akamaized.net/images/wappen/head/14087.png', leagueId: LeagueId.LIGA_EXPANSION_MX, budget: 4500000, transferBudget: 1000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#FFFFFF', squad: [] },
    { id: 1154, name: 'Leones Negros', logo: 'https://tmssl.akamaized.net/images/wappen/head/20398.png', leagueId: LeagueId.LIGA_EXPANSION_MX, budget: 5000000, transferBudget: 1200000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFD700', squad: [] },
    { id: 1155, name: 'Atlético Morelia', logo: 'https://tmssl.akamaized.net/images/wappen/head/81262.png', leagueId: LeagueId.LIGA_EXPANSION_MX, budget: 5000000, transferBudget: 1200000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#FFD700', secondaryColor: '#C8102E', squad: [] }
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'data', 'teams', 'ligaMx.ts'), ligaMxContent, 'utf-8');
console.log('✅ data/teams/ligaMx.ts actualizado.');

// 3. CONMEBOL EXTRA CLUBS (URUGUAY, COLOMBIA, ECUADOR, BOLIVIA, PERU, VENEZUELA)
const southAmericanClubsContent = `import { Team, LeagueId } from '../../types';
import { chileanTeams } from './ligaChile';

export interface ConmebolTeamMeta {
    country: 'ARG' | 'BRA' | 'BOL' | 'CHI' | 'COL' | 'ECU' | 'PAR' | 'PER' | 'URU' | 'VEN';
    conmebolRanking: number; // 1 (best) to 100+
}

export const SOUTH_AMERICAN_EXTRA_TEAMS: (Team & ConmebolTeamMeta)[] = [
    // --- CHILE (4) ---
    {
        ...chileanTeams[0], // Colo-Colo (1201)
        id: 9101,
        country: 'CHI',
        conmebolRanking: 18
    },
    {
        ...chileanTeams[1], // Universidad de Chile (1202)
        id: 9102,
        country: 'CHI',
        conmebolRanking: 32
    },
    {
        ...chileanTeams[2], // Universidad Católica (1203)
        id: 9103,
        country: 'CHI',
        conmebolRanking: 28
    },
    {
        ...chileanTeams[4], // Huachipato (1205)
        id: 9104,
        country: 'CHI',
        conmebolRanking: 45
    },

    // --- URUGUAY (4) ---
    {
        id: 9201,
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
            { id: 920101, name: 'Washington Aguerre', position: 'POR', rating: 78, potential: 79, age: 31, value: 3000000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 920102, name: 'Guzmán Rodríguez', position: 'DEF', rating: 77, potential: 81, age: 24, value: 4000000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 920103, name: 'Javier Méndez', position: 'DEF', rating: 76, potential: 77, age: 31, value: 2000000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 920104, name: 'Maxi Olivera', position: 'DEF', rating: 76, potential: 76, age: 32, value: 1800000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 920105, name: 'Pedro Milans', position: 'DEF', rating: 76, potential: 82, age: 22, value: 3500000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 920106, name: 'Damián García', position: 'CEN', rating: 78, potential: 85, age: 21, value: 6500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
            { id: 920107, name: 'Eduardo Darias', position: 'CEN', rating: 76, potential: 78, age: 26, value: 3000000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 920108, name: 'Leonardo Fernández', position: 'CEN', rating: 81, potential: 82, age: 25, value: 8500000, wage: 45000, morale: 'Feliz', contractYears: 3 },
            { id: 920109, name: 'Javier Cabrera', position: 'DEL', rating: 76, potential: 76, age: 32, value: 1800000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 920110, name: 'Jaime Báez', position: 'DEL', rating: 76, potential: 77, age: 29, value: 2500000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 920111, name: 'Maximiliano Silvera', position: 'DEL', rating: 78, potential: 80, age: 27, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9202,
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
            { id: 920201, name: 'Luis Mejía', position: 'POR', rating: 77, potential: 77, age: 33, value: 2200000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 920202, name: 'Sebastián Coates', position: 'DEF', rating: 79, potential: 79, age: 33, value: 4000000, wage: 42000, morale: 'Feliz', contractYears: 2 },
            { id: 920203, name: 'Diego Polenta', position: 'DEF', rating: 76, potential: 76, age: 32, value: 1800000, wage: 24000, morale: 'Feliz', contractYears: 2 },
            { id: 920204, name: 'Leandro Lozano', position: 'DEF', rating: 76, potential: 78, age: 25, value: 3000000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 920205, name: 'Gabriel Báez', position: 'DEF', rating: 75, potential: 76, age: 28, value: 2000000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 920206, name: 'Christian Oliva', position: 'CEN', rating: 77, potential: 78, age: 28, value: 3500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 920207, name: 'Lucas Sanabria', position: 'CEN', rating: 76, potential: 83, age: 20, value: 4500000, wage: 15000, morale: 'Feliz', contractYears: 4 },
            { id: 920208, name: 'Mauricio Pereyra', position: 'CEN', rating: 77, potential: 77, age: 34, value: 2000000, wage: 30000, morale: 'Feliz', contractYears: 1 },
            { id: 920209, name: 'Jeremía Recoba', position: 'DEL', rating: 75, potential: 83, age: 20, value: 3800000, wage: 14000, morale: 'Feliz', contractYears: 4 },
            { id: 920210, name: 'Antonio Galeano', position: 'DEL', rating: 76, potential: 79, age: 24, value: 3200000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 920211, name: 'Rubén Bentancourt', position: 'DEL', rating: 76, potential: 76, age: 31, value: 2200000, wage: 22000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 9203,
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
        squad: [
            { id: 920301, name: 'Sebastián Lentinelly', position: 'POR', rating: 75, potential: 77, age: 26, value: 1800000, wage: 15000, morale: 'Feliz', contractYears: 2 },
            { id: 920302, name: 'Ignacio Rodríguez', position: 'DEF', rating: 74, potential: 79, age: 20, value: 2200000, wage: 10000, morale: 'Contento', contractYears: 4 },
            { id: 920303, name: 'Martín Barrios', position: 'CEN', rating: 75, potential: 78, age: 25, value: 2000000, wage: 14000, morale: 'Feliz', contractYears: 3 },
            { id: 920304, name: 'Diego García', position: 'DEL', rating: 75, potential: 76, age: 27, value: 1800000, wage: 16000, morale: 'Normal', contractYears: 2 },
            { id: 920305, name: 'Renzo Machado', position: 'DEL', rating: 74, potential: 82, age: 19, value: 2500000, wage: 8000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    {
        id: 9204,
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
        squad: [
            { id: 920401, name: 'Kevin Dawson', position: 'POR', rating: 76, potential: 76, age: 32, value: 1800000, wage: 20000, morale: 'Feliz', contractYears: 2 },
            { id: 920402, name: 'Renzo Giampaoli', position: 'DEF', rating: 75, potential: 78, age: 24, value: 2000000, wage: 15000, morale: 'Contento', contractYears: 3 },
            { id: 920403, name: 'Agustín Soria', position: 'CEN', rating: 75, potential: 83, age: 19, value: 3000000, wage: 10000, morale: 'Feliz', contractYears: 4 },
            { id: 920404, name: 'Joaquín Valiente', position: 'DEL', rating: 75, potential: 80, age: 23, value: 2500000, wage: 14000, morale: 'Feliz', contractYears: 3 },
            { id: 920405, name: 'Claudio Spinelli', position: 'DEL', rating: 75, potential: 76, age: 27, value: 2000000, wage: 18000, morale: 'Normal', contractYears: 2 }
        ]
    },

    // --- ECUADOR (4) ---
    {
        id: 9301,
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
            { id: 930101, name: 'Alexander Domínguez', position: 'POR', rating: 78, potential: 78, age: 37, value: 2000000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 930102, name: 'Ricardo Adé', position: 'DEF', rating: 78, potential: 78, age: 34, value: 2500000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 930103, name: 'Richard Mina', position: 'DEF', rating: 76, potential: 78, age: 25, value: 3000000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 930104, name: 'Leonel Quiñónez', position: 'DEF', rating: 76, potential: 76, age: 31, value: 2000000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 930105, name: 'José Quintero', position: 'DEF', rating: 76, potential: 76, age: 34, value: 1500000, wage: 22000, morale: 'Feliz', contractYears: 1 },
            { id: 930106, name: 'Lucas Piovi', position: 'CEN', rating: 78, potential: 79, age: 32, value: 3800000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 930107, name: 'Marco Angulo', position: 'CEN', rating: 76, potential: 81, age: 22, value: 4000000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 930108, name: 'Fernando Cornejo', position: 'CEN', rating: 76, potential: 78, age: 28, value: 3200000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 930109, name: 'Jhojan Julio', position: 'DEL', rating: 77, potential: 78, age: 26, value: 3800000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 930110, name: 'Lisandro Alzugaray', position: 'DEL', rating: 77, potential: 77, age: 34, value: 2200000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 930111, name: 'Álex Arce', position: 'DEL', rating: 80, potential: 82, age: 29, value: 7500000, wage: 42000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9302,
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
            { id: 930201, name: 'Moisés Ramírez', position: 'POR', rating: 78, potential: 82, age: 24, value: 4500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 930202, name: 'Mateo Carabajal', position: 'DEF', rating: 77, potential: 79, age: 27, value: 3800000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 930203, name: 'Richard Schunke', position: 'DEF', rating: 77, potential: 77, age: 32, value: 2500000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 930204, name: 'Matías Fernández', position: 'DEF', rating: 76, potential: 77, age: 29, value: 2800000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 930205, name: 'Beder Caicedo', position: 'DEF', rating: 75, potential: 75, age: 32, value: 1600000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 930206, name: 'Cristian Zabala', position: 'CEN', rating: 77, potential: 79, age: 26, value: 4000000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 930207, name: 'Patrik Mercado', position: 'CEN', rating: 76, potential: 84, age: 21, value: 4500000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 930208, name: 'Keny Arroyo', position: 'DEL', rating: 76, potential: 86, age: 18, value: 6000000, wage: 12000, morale: 'Feliz', contractYears: 5 },
            { id: 930209, name: 'Junior Sornoza', position: 'CEN', rating: 79, potential: 79, age: 30, value: 5000000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 930210, name: 'Renato Ibarra', position: 'DEL', rating: 77, potential: 77, age: 33, value: 2500000, wage: 30000, morale: 'Contento', contractYears: 2 },
            { id: 930211, name: 'Jeison Medina', position: 'DEL', rating: 78, potential: 80, age: 29, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9303,
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
            { id: 930301, name: 'Javier Burrai', position: 'POR', rating: 78, potential: 78, age: 33, value: 2800000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 930302, name: 'Luca Sosa', position: 'DEF', rating: 76, potential: 77, age: 30, value: 2200000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 930303, name: 'Nicolás Ramírez', position: 'DEF', rating: 76, potential: 79, age: 27, value: 3000000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 930304, name: 'Byron Castillo', position: 'DEF', rating: 77, potential: 78, age: 25, value: 3800000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 930305, name: 'Aníbal Chalá', position: 'DEF', rating: 75, potential: 76, age: 28, value: 2000000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 930306, name: 'Jesús Trindade', position: 'CEN', rating: 77, potential: 77, age: 31, value: 3000000, wage: 26000, morale: 'Feliz', contractYears: 2 },
            { id: 930307, name: 'Leonai Souza', position: 'CEN', rating: 76, potential: 78, age: 29, value: 2800000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 930308, name: 'Braian Oyola', position: 'DEL', rating: 76, potential: 78, age: 28, value: 3000000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 930309, name: 'Eduard Bello', position: 'DEL', rating: 77, potential: 77, age: 29, value: 3500000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 930310, name: 'Janner Corozo', position: 'DEL', rating: 78, potential: 79, age: 28, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 930311, name: 'Octavio Rivero', position: 'DEL', rating: 78, potential: 78, age: 32, value: 4000000, wage: 35000, morale: 'Feliz', contractYears: 2 }
        ]
    },
    {
        id: 9304,
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
        squad: [
            { id: 930401, name: 'Pedro Ortiz', position: 'POR', rating: 77, potential: 77, age: 34, value: 2000000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 930402, name: 'Luis Fernando León', position: 'DEF', rating: 76, potential: 76, age: 31, value: 2500000, wage: 24000, morale: 'Feliz', contractYears: 2 },
            { id: 930403, name: 'Marcelo Meli', position: 'CEN', rating: 75, potential: 75, age: 32, value: 1600000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 930404, name: 'Jaime Ayoví', position: 'DEL', rating: 74, potential: 74, age: 36, value: 800000, wage: 18000, morale: 'Normal', contractYears: 1 }
        ]
    },

    // --- COLOMBIA (4) ---
    {
        id: 9401,
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
            { id: 940101, name: 'Álvaro Montero', position: 'POR', rating: 78, potential: 80, age: 29, value: 3800000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 940102, name: 'Andrés Llinás', position: 'DEF', rating: 77, potential: 80, age: 27, value: 4000000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 940103, name: 'Juan Pablo Vargas', position: 'DEF', rating: 77, potential: 78, age: 29, value: 3800000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 940104, name: 'Delvin Alfonzo', position: 'DEF', rating: 75, potential: 77, age: 24, value: 2500000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 940105, name: 'Danovis Banguero', position: 'DEF', rating: 75, potential: 75, age: 34, value: 1200000, wage: 20000, morale: 'Normal', contractYears: 1 },
            { id: 940106, name: 'Stiven Vega', position: 'CEN', rating: 76, potential: 78, age: 26, value: 3000000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 940107, name: 'Daniel Giraldo', position: 'CEN', rating: 76, potential: 76, age: 32, value: 2000000, wage: 22000, morale: 'Normal', contractYears: 2 },
            { id: 940108, name: 'Daniel Cataño', position: 'CEN', rating: 78, potential: 78, age: 32, value: 3500000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 940109, name: 'David Mackalister Silva', position: 'CEN', rating: 77, potential: 77, age: 37, value: 1200000, wage: 28000, morale: 'Feliz', contractYears: 1 },
            { id: 940110, name: 'Jhon Córdoba', position: 'DEL', rating: 76, potential: 80, age: 23, value: 3500000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 940111, name: 'Radamel Falcao García', position: 'DEL', rating: 80, potential: 80, age: 38, value: 3000000, wage: 65000, morale: 'Feliz', contractYears: 1 },
            { id: 940112, name: 'Leonardo Castro', position: 'DEL', rating: 78, potential: 79, age: 32, value: 4000000, wage: 34000, morale: 'Feliz', contractYears: 2 }
        ]
    },
    {
        id: 9402,
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
            { id: 940201, name: 'Santiago Mele', position: 'POR', rating: 79, potential: 82, age: 27, value: 5000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 940202, name: 'Emanuel Olivera', position: 'DEF', rating: 76, potential: 76, age: 34, value: 1500000, wage: 24000, morale: 'Feliz', contractYears: 1 },
            { id: 940203, name: 'Jermein Peña', position: 'DEF', rating: 76, potential: 78, age: 25, value: 3000000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 940204, name: 'Gabriel Fuentes', position: 'DEF', rating: 76, potential: 77, age: 27, value: 3000000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 940205, name: 'Didier Moreno', position: 'CEN', rating: 76, potential: 76, age: 32, value: 2000000, wage: 24000, morale: 'Normal', contractYears: 2 },
            { id: 940206, name: 'Víctor Cantillo', position: 'CEN', rating: 77, potential: 77, age: 31, value: 3200000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 940207, name: 'José Enamorado', position: 'DEL', rating: 78, potential: 82, age: 25, value: 5500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 940208, name: 'Déiber Caicedo', position: 'DEL', rating: 77, potential: 80, age: 24, value: 4500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 940209, name: 'Yimmi Chará', position: 'DEL', rating: 77, potential: 77, age: 33, value: 3000000, wage: 38000, morale: 'Feliz', contractYears: 2 },
            { id: 940210, name: 'Carlos Bacca', position: 'DEL', rating: 79, potential: 79, age: 38, value: 2500000, wage: 48000, morale: 'Feliz', contractYears: 1 }
        ]
    },
    {
        id: 9403,
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
            { id: 940301, name: 'David Ospina', position: 'POR', rating: 79, potential: 79, age: 36, value: 3000000, wage: 45000, morale: 'Feliz', contractYears: 2 },
            { id: 940302, name: 'William Tesillo', position: 'DEF', rating: 77, potential: 77, age: 34, value: 2500000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 940303, name: 'Felipe Aguirre', position: 'DEF', rating: 76, potential: 78, age: 27, value: 3000000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 940304, name: 'Jorman Campuzano', position: 'CEN', rating: 78, potential: 79, age: 28, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 940305, name: 'Edwin Cardona', position: 'CEN', rating: 79, potential: 79, age: 31, value: 4500000, wage: 40000, morale: 'Feliz', contractYears: 2 },
            { id: 940306, name: 'Marino Hinestroza', position: 'DEL', rating: 77, potential: 83, age: 22, value: 5000000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 940307, name: 'Alfredo Morelos', position: 'DEL', rating: 79, potential: 80, age: 28, value: 6500000, wage: 42000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 9404,
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
            { id: 940401, name: 'Andrés Mosquera Marmolejo', position: 'POR', rating: 77, potential: 77, age: 33, value: 2000000, wage: 24000, morale: 'Feliz', contractYears: 2 },
            { id: 940402, name: 'Marcelo Ortiz', position: 'DEF', rating: 76, potential: 77, age: 30, value: 2200000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 940403, name: 'Daniel Torres', position: 'CEN', rating: 77, potential: 77, age: 34, value: 2000000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 940404, name: 'Hugo Rodallega', position: 'DEL', rating: 78, potential: 78, age: 39, value: 1800000, wage: 35000, morale: 'Feliz', contractYears: 1 }
        ]
    },

    // --- BOLIVIA (2) ---
    {
        id: 9501,
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
            { id: 950101, name: 'Carlos Lampe', position: 'POR', rating: 77, potential: 77, age: 37, value: 1800000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 950102, name: 'José Sagredo', position: 'DEF', rating: 75, potential: 75, age: 30, value: 1500000, wage: 18000, morale: 'Feliz', contractYears: 2 },
            { id: 950103, name: 'Renzo Orihuela', position: 'DEF', rating: 75, potential: 79, age: 23, value: 2500000, wage: 16000, morale: 'Contento', contractYears: 3 },
            { id: 950104, name: 'Leonel Justiniano', position: 'CEN', rating: 76, potential: 76, age: 32, value: 1800000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 950105, name: 'Fernando Saucedo', position: 'CEN', rating: 75, potential: 75, age: 34, value: 1200000, wage: 18000, morale: 'Normal', contractYears: 1 },
            { id: 950106, name: 'Ramiro Vaca', position: 'CEN', rating: 78, potential: 82, age: 25, value: 4500000, wage: 26000, morale: 'Feliz', contractYears: 4 },
            { id: 950107, name: 'Patito Rodríguez', position: 'DEL', rating: 77, potential: 77, age: 34, value: 2200000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 950108, name: 'Bruno Sávio', position: 'DEL', rating: 78, potential: 79, age: 30, value: 4000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 950109, name: 'Fábio Gomes', position: 'DEL', rating: 76, potential: 78, age: 27, value: 3000000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 950110, name: 'Alfio Oviedo', position: 'DEL', rating: 75, potential: 76, age: 28, value: 2000000, wage: 20000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 9502,
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
            { id: 950201, name: 'Guillermo Viscarra', position: 'POR', rating: 78, potential: 80, age: 31, value: 3000000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 950202, name: 'Adrián Jusino', position: 'DEF', rating: 75, potential: 75, age: 32, value: 1600000, wage: 20000, morale: 'Feliz', contractYears: 2 },
            { id: 950203, name: 'Luciano Ursino', position: 'CEN', rating: 76, potential: 76, age: 35, value: 1400000, wage: 22000, morale: 'Feliz', contractYears: 1 },
            { id: 950204, name: 'Michael Ortega', position: 'CEN', rating: 77, potential: 77, age: 33, value: 2500000, wage: 26000, morale: 'Feliz', contractYears: 2 },
            { id: 950205, name: 'Jeyson Chura', position: 'DEL', rating: 76, potential: 82, age: 22, value: 3500000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 950206, name: 'Enrique Triverio', position: 'DEL', rating: 78, potential: 78, age: 35, value: 2500000, wage: 30000, morale: 'Feliz', contractYears: 1 }
        ]
    },

    // --- PERÚ (3) ---
    {
        id: 9601,
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
            { id: 960101, name: 'Sebastián Britos', position: 'POR', rating: 77, potential: 77, age: 36, value: 1800000, wage: 24000, morale: 'Feliz', contractYears: 2 },
            { id: 960102, name: 'Williams Riveros', position: 'DEF', rating: 77, potential: 77, age: 31, value: 2500000, wage: 25000, morale: 'Feliz', contractYears: 2 },
            { id: 960103, name: 'Matías Di Benedetto', position: 'DEF', rating: 76, potential: 76, age: 31, value: 2000000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 960104, name: 'Aldo Corzo', position: 'DEF', rating: 76, potential: 76, age: 35, value: 1200000, wage: 24000, morale: 'Feliz', contractYears: 1 },
            { id: 960105, name: 'Andy Polo', position: 'DEF', rating: 78, potential: 78, age: 29, value: 4000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 960106, name: 'Rodrigo Ureña', position: 'CEN', rating: 78, potential: 78, age: 31, value: 3800000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 960107, name: 'Martín Pérez Guedes', position: 'CEN', rating: 76, potential: 76, age: 33, value: 2000000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 960108, name: 'Jairo Concha', position: 'CEN', rating: 77, potential: 80, age: 25, value: 3800000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 960109, name: 'Edison Flores', position: 'DEL', rating: 78, potential: 78, age: 30, value: 4000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 960110, name: 'Alex Valera', position: 'DEL', rating: 78, potential: 79, age: 28, value: 4200000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 960111, name: 'Gabriel Costa', position: 'DEL', rating: 75, potential: 75, age: 34, value: 1500000, wage: 24000, morale: 'Normal', contractYears: 1 }
        ]
    },
    {
        id: 9602,
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
            { id: 960201, name: 'Ángelo Campos', position: 'POR', rating: 76, potential: 76, age: 31, value: 2000000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 960202, name: 'Carlos Zambrano', position: 'DEF', rating: 78, potential: 78, age: 35, value: 2500000, wage: 38000, morale: 'Feliz', contractYears: 1 },
            { id: 960203, name: 'Renzo Garcés', position: 'DEF', rating: 76, potential: 77, age: 28, value: 2500000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 960204, name: 'Juan Pablo Freytes', position: 'DEF', rating: 76, potential: 79, age: 24, value: 3200000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 960205, name: 'Sebastián Rodríguez', position: 'CEN', rating: 78, potential: 78, age: 32, value: 3500000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 960206, name: 'Adrián Arregui', position: 'CEN', rating: 76, potential: 76, age: 32, value: 2200000, wage: 24000, morale: 'Normal', contractYears: 2 },
            { id: 960207, name: 'Catriel Cabellos', position: 'CEN', rating: 76, potential: 83, age: 20, value: 3800000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 960208, name: 'Franco Zanelatto', position: 'DEL', rating: 76, potential: 80, age: 24, value: 3200000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 960209, name: 'Kevin Serna', position: 'DEL', rating: 78, potential: 79, age: 26, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 960210, name: 'Paolo Guerrero', position: 'DEL', rating: 78, potential: 78, age: 40, value: 1500000, wage: 45000, morale: 'Feliz', contractYears: 1 },
            { id: 960211, name: 'Hernán Barcos', position: 'DEL', rating: 77, potential: 77, age: 40, value: 1200000, wage: 30000, morale: 'Feliz', contractYears: 1 },
            { id: 960212, name: 'Pablo Sabbag', position: 'DEL', rating: 76, potential: 78, age: 27, value: 2800000, wage: 24000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 9603,
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
            { id: 960301, name: 'Renato Solís', position: 'POR', rating: 76, potential: 78, age: 26, value: 2200000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 960302, name: 'Ignácio da Silva', position: 'DEF', rating: 78, potential: 79, age: 27, value: 4200000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 960303, name: 'Jhilmar Lora', position: 'DEF', rating: 76, potential: 80, age: 23, value: 3500000, wage: 18000, morale: 'Feliz', contractYears: 3 },
            { id: 960304, name: 'Gustavo Cazonatti', position: 'CEN', rating: 76, potential: 78, age: 28, value: 2800000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 960305, name: 'Jesús Pretell', position: 'CEN', rating: 75, potential: 77, age: 25, value: 2000000, wage: 16000, morale: 'Normal', contractYears: 2 },
            { id: 960306, name: 'Santiago González', position: 'DEL', rating: 79, potential: 82, age: 25, value: 6500000, wage: 30000, morale: 'Feliz', contractYears: 4 },
            { id: 960307, name: 'Martín Cauteruccio', position: 'DEL', rating: 80, potential: 80, age: 37, value: 3000000, wage: 40000, morale: 'Feliz', contractYears: 1 }
        ]
    },

    // --- VENEZUELA (2) ---
    {
        id: 9701,
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
            { id: 970101, name: 'Alejandro Araque', position: 'POR', rating: 75, potential: 77, age: 28, value: 1800000, wage: 16000, morale: 'Feliz', contractYears: 2 },
            { id: 970102, name: 'Carlos Vivas', position: 'DEF', rating: 75, potential: 80, age: 22, value: 2500000, wage: 14000, morale: 'Feliz', contractYears: 3 },
            { id: 970103, name: 'Maurice Cova', position: 'CEN', rating: 76, potential: 76, age: 32, value: 1800000, wage: 20000, morale: 'Feliz', contractYears: 2 },
            { id: 970104, name: 'Anthony Uribe', position: 'DEL', rating: 75, potential: 75, age: 33, value: 1200000, wage: 18000, morale: 'Normal', contractYears: 1 }
        ]
    },
    {
        id: 9702,
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
            { id: 970201, name: 'Wuilker Faríñez', position: 'POR', rating: 77, potential: 79, age: 26, value: 3000000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 970202, name: 'Rubert Quijada', position: 'DEF', rating: 74, potential: 74, age: 35, value: 800000, wage: 15000, morale: 'Normal', contractYears: 1 },
            { id: 970203, name: 'Vicente Rodríguez', position: 'CEN', rating: 74, potential: 76, age: 29, value: 1400000, wage: 14000, morale: 'Normal', contractYears: 2 },
            { id: 970204, name: 'Ender Echenique', position: 'DEL', rating: 75, potential: 82, age: 20, value: 2500000, wage: 10000, morale: 'Feliz', contractYears: 4 }
        ]
    }
];

export function getTeamConmebolMeta(teamOrId: Team | number): ConmebolTeamMeta {
    const id = typeof teamOrId === 'number' ? teamOrId : teamOrId.id;
    const leagueId = typeof teamOrId === 'object' ? teamOrId.leagueId : undefined;
    
    // Check in SOUTH_AMERICAN_EXTRA_TEAMS
    const extra = SOUTH_AMERICAN_EXTRA_TEAMS.find(t => t.id === id);
    if (extra) {
        return { country: extra.country, conmebolRanking: extra.conmebolRanking };
    }
    
    // Check by League ID or ID ranges
    if (leagueId === LeagueId.LIGA_ARGENTINA || (id >= 701 && id <= 740)) {
        const rankMap: Record<number, number> = {
            701: 1, 702: 2, 703: 6, 704: 7, 705: 9, 706: 14, 707: 16, 708: 17, 709: 21, 710: 23
        };
        return { country: 'ARG', conmebolRanking: rankMap[id] || (id - 650) };
    }
    if (leagueId === LeagueId.BRASILEIRAO || (id >= 801 && id <= 830)) {
        const rankMap: Record<number, number> = {
            801: 3, 802: 4, 803: 5, 804: 10, 805: 13, 806: 15, 807: 24, 808: 26
        };
        return { country: 'BRA', conmebolRanking: rankMap[id] || (id - 750) };
    }
    if (leagueId === LeagueId.COPA_DE_PRIMERA || (id >= 981 && id <= 992)) {
        const rankMap: Record<number, number> = {
            981: 12, 982: 18, 983: 20, 984: 34, 985: 40
        };
        return { country: 'PAR', conmebolRanking: rankMap[id] || (id - 930) };
    }
    if (leagueId === LeagueId.PRIMERA_DIVISION_CHILE || (id >= 1201 && id <= 1216)) {
        const rankMap: Record<number, number> = {
            1201: 18, 1202: 32, 1203: 28, 1204: 46, 1205: 45, 1206: 50, 1207: 52, 1208: 54
        };
        return { country: 'CHI', conmebolRanking: rankMap[id] || (id - 1150) };
    }
    
    return { country: 'ARG', conmebolRanking: 99 };
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'data', 'teams', 'southAmericanClubs.ts'), southAmericanClubsContent, 'utf-8');
console.log('✅ data/teams/southAmericanClubs.ts actualizado.');
