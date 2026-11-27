import { Team, LeagueId } from '../../types';
import { createGenericSquad } from './squadHelpers';

// --- SEGUNDA DIVISIÓN ESPAÑOLA (LALIGA HYPERMOTION) ---
export const segundaDivisionTeams: Team[] = [
    {
        id: 901, name: 'Elche CF', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 14000000, transferBudget: 4500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#006400', secondaryColor: '#FFFFFF',
        squad: [
            { id: 90101, name: 'M. Dituro', position: 'POR', rating: 76, potential: 76, age: 37, value: 1200000, wage: 20000, morale: 'Feliz', contractYears: 1 },
            { id: 90102, name: 'P. Bigas', position: 'DEF', rating: 75, potential: 75, age: 34, value: 1000000, wage: 22000, morale: 'Contento', contractYears: 1 },
            { id: 90103, name: 'Mario Gaspar', position: 'DEF', rating: 74, potential: 74, age: 33, value: 1000000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 90104, name: 'Álvaro Núñez', position: 'DEF', rating: 74, potential: 78, age: 24, value: 2500000, wage: 16000, morale: 'Contento', contractYears: 3 },
            { id: 90105, name: 'Aleix Febas', position: 'CEN', rating: 77, potential: 78, age: 28, value: 4000000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 90106, name: 'Nico Castro', position: 'CEN', rating: 76, potential: 81, age: 23, value: 4500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 90107, name: 'Nico Fernández', position: 'CEN', rating: 76, potential: 79, age: 25, value: 3800000, wage: 24000, morale: 'Contento', contractYears: 3 },
            { id: 90108, name: 'Josan', position: 'DEL', rating: 74, potential: 74, age: 34, value: 900000, wage: 18000, morale: 'Normal', contractYears: 1 },
            { id: 90109, name: 'Yago Santiago', position: 'DEL', rating: 75, potential: 82, age: 21, value: 3500000, wage: 15000, morale: 'Feliz', contractYears: 4 },
            { id: 90110, name: 'Mourad', position: 'DEL', rating: 75, potential: 77, age: 26, value: 2500000, wage: 18000, morale: 'Contento', contractYears: 2 },
            { id: 90111, name: 'Agustín Álvarez', position: 'DEL', rating: 76, potential: 82, age: 23, value: 4500000, wage: 25000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 902, name: 'Sporting Gijón', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 12000000, transferBudget: 3500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF',
        squad: [
            { id: 90201, name: 'Rubén Yáñez', position: 'POR', rating: 76, potential: 77, age: 30, value: 2500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 90202, name: 'Róber Pier', position: 'DEF', rating: 75, potential: 75, age: 29, value: 2000000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 90203, name: 'Guille Rosas', position: 'DEF', rating: 76, potential: 79, age: 24, value: 3500000, wage: 20000, morale: 'Feliz', contractYears: 3 },
            { id: 90204, name: 'Pablo García', position: 'DEF', rating: 74, potential: 78, age: 24, value: 2000000, wage: 16000, morale: 'Normal', contractYears: 3 },
            { id: 90205, name: 'Nacho Méndez', position: 'CEN', rating: 76, potential: 77, age: 26, value: 3000000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 90206, name: 'Lander Olaetxea', position: 'CEN', rating: 75, potential: 75, age: 31, value: 1800000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 90207, name: 'César Gelabert', position: 'CEN', rating: 76, potential: 81, age: 23, value: 4000000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 90208, name: 'Gaspar Campos', position: 'DEL', rating: 77, potential: 81, age: 24, value: 5000000, wage: 26000, morale: 'Feliz', contractYears: 4 },
            { id: 90209, name: 'Dani Queipo', position: 'DEL', rating: 74, potential: 80, age: 22, value: 2800000, wage: 16000, morale: 'Contento', contractYears: 3 },
            { id: 90210, name: 'J. Otero', position: 'DEL', rating: 76, potential: 76, age: 29, value: 3000000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 90211, name: 'Jordy Caicedo', position: 'DEL', rating: 75, potential: 76, age: 26, value: 2500000, wage: 22000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 903, name: 'Málaga CF', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 10000000, transferBudget: 2800000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#003DA5', secondaryColor: '#FFFFFF',
        squad: [
            { id: 90301, name: 'Alfonso Herrero', position: 'POR', rating: 76, potential: 77, age: 30, value: 2500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 90302, name: 'Nelson Monte', position: 'DEF', rating: 74, potential: 74, age: 29, value: 1600000, wage: 18000, morale: 'Contento', contractYears: 2 },
            { id: 90303, name: 'Álex Pastor', position: 'DEF', rating: 74, potential: 77, age: 24, value: 2000000, wage: 16000, morale: 'Contento', contractYears: 3 },
            { id: 90304, name: 'Carlos Puga', position: 'DEF', rating: 73, potential: 76, age: 23, value: 1500000, wage: 14000, morale: 'Normal', contractYears: 3 },
            { id: 90305, name: 'Manu Molina', position: 'CEN', rating: 75, potential: 75, age: 32, value: 1500000, wage: 20000, morale: 'Feliz', contractYears: 2 },
            { id: 90306, name: 'Luca Sangalli', position: 'CEN', rating: 74, potential: 74, age: 29, value: 1500000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 90307, name: 'Aarón Ochoa', position: 'CEN', rating: 74, potential: 85, age: 17, value: 3500000, wage: 10000, morale: 'Feliz', contractYears: 5 },
            { id: 90308, name: 'Antonio Cordero', position: 'DEL', rating: 76, potential: 86, age: 17, value: 5000000, wage: 12000, morale: 'Feliz', contractYears: 4 },
            { id: 90309, name: 'Kevin Medina', position: 'DEL', rating: 75, potential: 78, age: 23, value: 2800000, wage: 18000, morale: 'Feliz', contractYears: 3 },
            { id: 90310, name: 'Dioni', position: 'DEL', rating: 74, potential: 74, age: 35, value: 800000, wage: 18000, morale: 'Contento', contractYears: 1 },
            { id: 90311, name: 'Roko Baturina', position: 'DEL', rating: 74, potential: 77, age: 24, value: 2200000, wage: 18000, morale: 'Normal', contractYears: 2 }
        ]
    },
    {
        id: 904, name: 'Real Zaragoza', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 13000000, transferBudget: 4000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#003DA5', secondaryColor: '#FFFFFF',
        squad: [
            { id: 90401, name: 'Gaëtan Poussin', position: 'POR', rating: 75, potential: 77, age: 25, value: 2200000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 90402, name: 'Lluís López', position: 'DEF', rating: 75, potential: 76, age: 27, value: 2000000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 90403, name: 'Bernardo Vital', position: 'DEF', rating: 75, potential: 80, age: 23, value: 3200000, wage: 18000, morale: 'Feliz', contractYears: 4 },
            { id: 90404, name: 'Dani Tasende', position: 'DEF', rating: 75, potential: 79, age: 24, value: 2800000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 90405, name: 'Keidi Bare', position: 'CEN', rating: 77, potential: 78, age: 27, value: 3800000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 90406, name: 'Marc Aguado', position: 'CEN', rating: 75, potential: 79, age: 24, value: 2800000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 90407, name: 'Ager Aketxe', position: 'CEN', rating: 77, potential: 77, age: 30, value: 3500000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 90408, name: 'Adrián Liso', position: 'DEL', rating: 75, potential: 84, age: 19, value: 4000000, wage: 14000, morale: 'Feliz', contractYears: 4 },
            { id: 90409, name: 'Malcom Adu Ares', position: 'DEL', rating: 75, potential: 81, age: 22, value: 3500000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 90410, name: 'Mario Soberón', position: 'DEL', rating: 76, potential: 77, age: 27, value: 3000000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 90411, name: 'Samed Baždar', position: 'DEL', rating: 76, potential: 84, age: 20, value: 5000000, wage: 22000, morale: 'Feliz', contractYears: 5 }
        ]
    },
    {
        id: 907, name: 'Racing Santander', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 12000000, transferBudget: 3500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#006400', secondaryColor: '#FFFFFF',
        squad: [
            { id: 90701, name: 'Jokin Ezkieta', position: 'POR', rating: 76, potential: 77, age: 27, value: 2500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 90702, name: 'Javi Castro', position: 'DEF', rating: 75, potential: 79, age: 23, value: 2800000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 90703, name: 'Manu Hernando', position: 'DEF', rating: 75, potential: 77, age: 26, value: 2200000, wage: 18000, morale: 'Contento', contractYears: 2 },
            { id: 90704, name: 'Michelin', position: 'DEF', rating: 75, potential: 76, age: 27, value: 2200000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 90705, name: 'Unai Vencedor', position: 'CEN', rating: 77, potential: 80, age: 23, value: 4500000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 90706, name: 'Aritz Aldasoro', position: 'CEN', rating: 75, potential: 77, age: 25, value: 2500000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 90707, name: 'Íñigo Vicente', position: 'CEN', rating: 78, potential: 79, age: 26, value: 6000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 90708, name: 'Andrés Martín', position: 'DEL', rating: 77, potential: 78, age: 25, value: 4500000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 90709, name: 'Pablo Rodríguez', position: 'DEL', rating: 75, potential: 79, age: 23, value: 3000000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 90710, name: 'Juan Carlos Arana', position: 'DEL', rating: 77, potential: 81, age: 24, value: 4500000, wage: 25000, morale: 'Feliz', contractYears: 4 },
            { id: 90711, name: 'Suleiman Camara', position: 'DEL', rating: 74, potential: 80, age: 22, value: 2200000, wage: 15000, morale: 'Contento', contractYears: 3 }
        ]
    },
    {
        id: 911, name: 'UD Almería', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 20000000, transferBudget: 7000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF',
        squad: [
            { id: 91101, name: 'Luís Maximiano', position: 'POR', rating: 78, potential: 81, age: 25, value: 6500000, wage: 35000, morale: 'Feliz', contractYears: 4 },
            { id: 91102, name: 'Lucas Robertone', position: 'CEN', rating: 79, potential: 81, age: 27, value: 8000000, wage: 40000, morale: 'Feliz', contractYears: 4 },
            { id: 91103, name: 'Marc Pubill', position: 'DEF', rating: 78, potential: 84, age: 21, value: 7500000, wage: 25000, morale: 'Feliz', contractYears: 5 },
            { id: 91104, name: 'Alejandro Pozo', position: 'DEF', rating: 76, potential: 77, age: 25, value: 3500000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 91105, name: 'Iddrisu Baba', position: 'CEN', rating: 76, potential: 77, age: 28, value: 3500000, wage: 25000, morale: 'Normal', contractYears: 3 },
            { id: 91106, name: 'Gonzalo Melero', position: 'CEN', rating: 77, potential: 77, age: 30, value: 3500000, wage: 30000, morale: 'Contento', contractYears: 2 },
            { id: 91107, name: 'Sergio Arribas', position: 'DEL', rating: 78, potential: 84, age: 22, value: 9000000, wage: 32000, morale: 'Feliz', contractYears: 5 },
            { id: 91108, name: 'Leo Baptistão', position: 'DEL', rating: 76, potential: 76, age: 31, value: 2500000, wage: 28000, morale: 'Normal', contractYears: 2 },
            { id: 91109, name: 'Nico Melamed', position: 'DEL', rating: 77, potential: 82, age: 23, value: 6000000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 91110, name: 'Luis Suárez', position: 'DEL', rating: 79, potential: 81, age: 26, value: 9500000, wage: 42000, morale: 'Feliz', contractYears: 4 },
            { id: 91111, name: 'Kaiky', position: 'DEF', rating: 76, potential: 83, age: 20, value: 5000000, wage: 20000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    {
        id: 916, name: 'Levante UD', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 14000000, transferBudget: 4000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#003DA5',
        squad: [
            { id: 91601, name: 'Andrés Fernández', position: 'POR', rating: 76, potential: 76, age: 37, value: 1000000, wage: 22000, morale: 'Contento', contractYears: 1 },
            { id: 91602, name: 'Unai Elgezabal', position: 'DEF', rating: 75, potential: 75, age: 31, value: 1800000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 91603, name: 'Adrián de la Fuente', position: 'DEF', rating: 75, potential: 78, age: 25, value: 2500000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 91604, name: 'Andrés García', position: 'DEF', rating: 75, potential: 83, age: 21, value: 3500000, wage: 15000, morale: 'Feliz', contractYears: 4 },
            { id: 91605, name: 'Oriol Rey', position: 'CEN', rating: 76, potential: 78, age: 26, value: 3000000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 91606, name: 'Pablo Martínez', position: 'CEN', rating: 77, potential: 79, age: 26, value: 4000000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 91607, name: 'Giorgi Kochorashvili', position: 'CEN', rating: 77, potential: 82, age: 25, value: 5000000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 91608, name: 'Carlos Álvarez', position: 'DEL', rating: 77, potential: 85, age: 21, value: 6000000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 91609, name: 'Roger Brugué', position: 'DEL', rating: 76, potential: 77, age: 27, value: 3000000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 91610, name: 'José Luis Morales', position: 'DEL', rating: 77, potential: 77, age: 37, value: 1800000, wage: 35000, morale: 'Feliz', contractYears: 1 },
            { id: 91611, name: 'Iván Romero', position: 'DEL', rating: 75, potential: 80, age: 23, value: 3000000, wage: 20000, morale: 'Contento', contractYears: 3 }
        ]
    },
    {
        id: 919, name: 'Real Oviedo', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 14000000, transferBudget: 4200000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#003DA5', secondaryColor: '#FFFFFF',
        squad: [
            { id: 91901, name: 'Aarón Escandell', position: 'POR', rating: 76, potential: 77, age: 28, value: 2500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 91902, name: 'David Costas', position: 'DEF', rating: 76, potential: 76, age: 29, value: 2800000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 91903, name: 'Dani Calvo', position: 'DEF', rating: 75, potential: 75, age: 30, value: 2000000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 91904, name: 'Lucas Ahijado', position: 'DEF', rating: 74, potential: 74, age: 29, value: 1500000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 91905, name: 'Santiago Colombatto', position: 'CEN', rating: 78, potential: 79, age: 27, value: 5500000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 91906, name: 'Santi Cazorla', position: 'CEN', rating: 78, potential: 78, age: 39, value: 1500000, wage: 15000, morale: 'Feliz', contractYears: 1 },
            { id: 91907, name: 'Kwasi Sibo', position: 'CEN', rating: 75, potential: 77, age: 26, value: 2500000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 91908, name: 'Sebas Moyano', position: 'DEL', rating: 76, potential: 77, age: 27, value: 3000000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 91909, name: 'Ilyas Chaira', position: 'DEL', rating: 75, potential: 80, age: 23, value: 3200000, wage: 18000, morale: 'Feliz', contractYears: 3 },
            { id: 91910, name: 'Alemão', position: 'DEL', rating: 76, potential: 79, age: 26, value: 3500000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 91911, name: 'Federico Viñas', position: 'DEL', rating: 77, potential: 79, age: 26, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    {
        id: 921, name: 'SD Eibar', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 13000000, transferBudget: 3800000, tier: 'Top', teamMorale: 'Contento', primaryColor: '#003DA5', secondaryColor: '#C8102E',
        squad: [
            { id: 92101, name: 'Daniel Fuzato', position: 'POR', rating: 75, potential: 77, age: 27, value: 2200000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 92102, name: 'Anaitz Arbilla', position: 'DEF', rating: 75, potential: 75, age: 37, value: 800000, wage: 22000, morale: 'Feliz', contractYears: 1 },
            { id: 92103, name: 'Aritz Arambarri', position: 'DEF', rating: 74, potential: 77, age: 26, value: 2000000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 92104, name: 'José Corpas', position: 'DEF', rating: 75, potential: 75, age: 33, value: 1500000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 92105, name: 'Matheus Pereira', position: 'CEN', rating: 77, potential: 78, age: 26, value: 4000000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 92106, name: 'Peru Nolaskoain', position: 'CEN', rating: 76, potential: 79, age: 25, value: 3500000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 92107, name: 'Antonio Puertas', position: 'DEL', rating: 76, potential: 76, age: 32, value: 2200000, wage: 26000, morale: 'Contento', contractYears: 2 },
            { id: 92108, name: 'Xeber Alkain', position: 'DEL', rating: 74, potential: 76, age: 27, value: 2000000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 92109, name: 'Jon Bautista', position: 'DEL', rating: 77, potential: 78, age: 29, value: 4000000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 92110, name: 'Jorge Pascual', position: 'DEL', rating: 74, potential: 81, age: 21, value: 2800000, wage: 15000, morale: 'Contento', contractYears: 3 },
            { id: 92111, name: 'Toni Villa', position: 'DEL', rating: 75, potential: 75, age: 29, value: 2000000, wage: 22000, morale: 'Normal', contractYears: 2 }
        ]
    },
    {
        id: 922, name: 'Granada CF', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 16000000, transferBudget: 5000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF',
        squad: [
            { id: 92201, name: 'Diego Mariño', position: 'POR', rating: 75, potential: 75, age: 34, value: 1200000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 92202, name: 'Miguel Rubio', position: 'DEF', rating: 75, potential: 76, age: 26, value: 2200000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 92203, name: 'Ignasi Miquel', position: 'DEF', rating: 75, potential: 75, age: 31, value: 1800000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 92204, name: 'Ricard Sánchez', position: 'DEF', rating: 76, potential: 79, age: 24, value: 3500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 92205, name: 'Martin Hongla', position: 'CEN', rating: 77, potential: 79, age: 26, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 92206, name: 'Gonzalo Villar', position: 'CEN', rating: 77, potential: 80, age: 26, value: 5000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 92207, name: 'Manu Trigueros', position: 'CEN', rating: 76, potential: 76, age: 32, value: 2000000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 92208, name: 'Giorgi Tsitaishvili', position: 'DEL', rating: 76, potential: 80, age: 23, value: 3800000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 92209, name: 'Kamil Jóźwiak', position: 'DEL', rating: 75, potential: 76, age: 26, value: 2500000, wage: 22000, morale: 'Normal', contractYears: 2 },
            { id: 92210, name: 'Lucas Boyé', position: 'DEL', rating: 78, potential: 79, age: 28, value: 6500000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 92211, name: 'Myrto Uzuni', position: 'DEL', rating: 79, potential: 80, age: 29, value: 7500000, wage: 40000, morale: 'Feliz', contractYears: 3 }
        ]
    },
    { id: 905, name: 'CD Tenerife', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 11000000, transferBudget: 3200000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#FFFFFF', squad: createGenericSquad(90500, 'CD Tenerife', 74) },
    { id: 906, name: 'Cádiz CF', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 15000000, transferBudget: 4800000, tier: 'Top', teamMorale: 'Normal', primaryColor: '#FFD700', secondaryColor: '#003DA5', squad: createGenericSquad(90600, 'Cádiz CF', 76) },
    { id: 908, name: 'FC Andorra', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 9000000, transferBudget: 2500000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#FFD700', squad: createGenericSquad(90800, 'FC Andorra', 73) },
    { id: 909, name: 'Deportivo La Coruña', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 13000000, transferBudget: 4000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#003DA5', secondaryColor: '#FFFFFF', squad: createGenericSquad(90900, 'Deportivo La Coruña', 75) },
    { id: 910, name: 'Albacete Balompié', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 9500000, transferBudget: 2600000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#FFFFFF', secondaryColor: '#000000', squad: createGenericSquad(91000, 'Albacete Balompié', 73) },
    { id: 912, name: 'CE Sabadell', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 7500000, transferBudget: 2000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#0055A4', secondaryColor: '#FFFFFF', squad: createGenericSquad(91200, 'CE Sabadell', 71) },
    { id: 913, name: 'Burgos CF', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 9500000, transferBudget: 2600000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#FFFFFF', secondaryColor: '#000000', squad: createGenericSquad(91300, 'Burgos CF', 74) },
    { id: 914, name: 'AD Ceuta FC', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 7000000, transferBudget: 1800000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FFFFFF', secondaryColor: '#000000', squad: createGenericSquad(91400, 'AD Ceuta FC', 71) },
    { id: 915, name: 'CD Eldense', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 8000000, transferBudget: 2200000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#C8102E', squad: createGenericSquad(91500, 'CD Eldense', 72) },
    { id: 917, name: 'CD Castellón', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 9000000, transferBudget: 2500000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#000000', secondaryColor: '#FFFFFF', squad: createGenericSquad(91700, 'CD Castellón', 73) },
    { id: 918, name: 'Córdoba CF', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 9000000, transferBudget: 2500000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#008000', secondaryColor: '#FFFFFF', squad: createGenericSquad(91800, 'Córdoba CF', 73) },
    { id: 920, name: 'SD Huesca', logo: '', leagueId: LeagueId.SEGUNDA_DIVISION_ESP, budget: 10000000, transferBudget: 2800000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#C8102E', squad: createGenericSquad(92000, 'SD Huesca', 74) }
];

// --- 2. BUNDESLIGA ALEMANA ---
export const zweiteBundesligaTeams: Team[] = [
    {
        id: 931, name: 'Hamburger SV', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 18000000, transferBudget: 6000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#003DA5', secondaryColor: '#FFFFFF',
        squad: [
            { id: 93101, name: 'D. Heuer Fernandes', position: 'POR', rating: 76, potential: 76, age: 31, value: 2500000, wage: 28000, morale: 'Feliz', contractYears: 2 },
            { id: 93102, name: 'S. Schonlau', position: 'DEF', rating: 76, potential: 76, age: 30, value: 2800000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 93103, name: 'D. Hadžikadunić', position: 'DEF', rating: 75, potential: 77, age: 26, value: 2800000, wage: 25000, morale: 'Contento', contractYears: 2 },
            { id: 93104, name: 'M. Muheim', position: 'DEF', rating: 76, potential: 78, age: 26, value: 3500000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 93105, name: 'J. Meffert', position: 'CEN', rating: 76, potential: 76, age: 29, value: 3000000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 93106, name: 'L. Reis', position: 'CEN', rating: 78, potential: 82, age: 24, value: 6500000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 93107, name: 'D. Elfadli', position: 'CEN', rating: 75, potential: 76, age: 27, value: 2500000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 93108, name: 'B. Jatta', position: 'DEL', rating: 76, potential: 76, age: 26, value: 3200000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 93109, name: 'J. Dompé', position: 'DEL', rating: 77, potential: 77, age: 29, value: 4000000, wage: 30000, morale: 'Feliz', contractYears: 2 },
            { id: 93110, name: 'R. Glatzel', position: 'DEL', rating: 78, potential: 78, age: 30, value: 5000000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 93111, name: 'D. Selke', position: 'DEL', rating: 76, potential: 76, age: 29, value: 3500000, wage: 32000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 933, name: 'Schalke 04', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 16000000, transferBudget: 5000000, tier: 'Top', teamMorale: 'Contento', primaryColor: '#003DA5', secondaryColor: '#FFFFFF',
        squad: [
            { id: 93301, name: 'J. Hoffmann', position: 'POR', rating: 75, potential: 77, age: 25, value: 2200000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 93302, name: 'M. Kamiński', position: 'DEF', rating: 75, potential: 75, age: 32, value: 1800000, wage: 25000, morale: 'Normal', contractYears: 2 },
            { id: 93303, name: 'T. Kalas', position: 'DEF', rating: 75, potential: 75, age: 31, value: 1800000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 93304, name: 'D. Murkin', position: 'DEF', rating: 76, potential: 78, age: 25, value: 3500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
            { id: 93305, name: 'R. Schallenberg', position: 'CEN', rating: 76, potential: 78, age: 25, value: 3800000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 93306, name: 'P. Seguin', position: 'CEN', rating: 76, potential: 76, age: 29, value: 3000000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 93307, name: 'M. Bachmann', position: 'CEN', rating: 75, potential: 75, age: 28, value: 2200000, wage: 20000, morale: 'Normal', contractYears: 2 },
            { id: 93308, name: 'T. Mohr', position: 'DEL', rating: 75, potential: 76, age: 28, value: 2500000, wage: 20000, morale: 'Contento', contractYears: 2 },
            { id: 93309, name: 'C. Antwi-Adjei', position: 'DEL', rating: 75, potential: 75, age: 30, value: 2200000, wage: 22000, morale: 'Normal', contractYears: 2 },
            { id: 93310, name: 'K. Karaman', position: 'DEL', rating: 78, potential: 78, age: 30, value: 5500000, wage: 36000, morale: 'Feliz', contractYears: 3 },
            { id: 93311, name: 'M. Sylla', position: 'DEL', rating: 76, potential: 80, age: 24, value: 4000000, wage: 24000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    {
        id: 934, name: 'Fortuna Düsseldorf', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 15000000, transferBudget: 4500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF',
        squad: [
            { id: 93401, name: 'F. Kastenmeier', position: 'POR', rating: 77, potential: 79, age: 27, value: 3500000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 93402, name: 'A. Hoffmann', position: 'DEF', rating: 76, potential: 76, age: 31, value: 2500000, wage: 26000, morale: 'Feliz', contractYears: 2 },
            { id: 93403, name: 'T. Oberdorf', position: 'DEF', rating: 75, potential: 78, age: 28, value: 2500000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 93404, name: 'M. Zimmermann', position: 'DEF', rating: 75, potential: 75, age: 32, value: 1800000, wage: 22000, morale: 'Normal', contractYears: 2 },
            { id: 93405, name: 'M. Sobottka', position: 'CEN', rating: 75, potential: 75, age: 30, value: 2200000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 93406, name: 'Í. Jóhannesson', position: 'CEN', rating: 77, potential: 82, age: 21, value: 6000000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 93407, name: 'S. Appelkamp', position: 'CEN', rating: 76, potential: 79, age: 23, value: 4000000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 93408, name: 'F. Klaus', position: 'DEL', rating: 76, potential: 76, age: 31, value: 2500000, wage: 26000, morale: 'Contento', contractYears: 2 },
            { id: 93409, name: 'T. Rossmann', position: 'DEL', rating: 75, potential: 82, age: 20, value: 3500000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 93410, name: 'D. Kownacki', position: 'DEL', rating: 77, potential: 78, age: 27, value: 4500000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 93411, name: 'J. Vermeij', position: 'DEL', rating: 75, potential: 75, age: 29, value: 2200000, wage: 22000, morale: 'Normal', contractYears: 2 }
        ]
    },
    {
        id: 938, name: 'Hertha BSC', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 17000000, transferBudget: 5500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#003DA5', secondaryColor: '#FFFFFF',
        squad: [
            { id: 93801, name: 'T. Ernst', position: 'POR', rating: 76, potential: 83, age: 21, value: 4500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 93802, name: 'T. Leistner', position: 'DEF', rating: 75, potential: 75, age: 34, value: 1500000, wage: 26000, morale: 'Contento', contractYears: 1 },
            { id: 93803, name: 'M. Dárdai', position: 'DEF', rating: 76, potential: 80, age: 22, value: 4000000, wage: 25000, morale: 'Feliz', contractYears: 4 },
            { id: 93804, name: 'J. Kenny', position: 'DEF', rating: 76, potential: 77, age: 27, value: 3500000, wage: 28000, morale: 'Feliz', contractYears: 3 },
            { id: 93805, name: 'D. Demme', position: 'CEN', rating: 77, potential: 77, age: 32, value: 3000000, wage: 35000, morale: 'Feliz', contractYears: 2 },
            { id: 93806, name: 'M. Cuisance', position: 'CEN', rating: 77, potential: 80, age: 25, value: 5000000, wage: 30000, morale: 'Feliz', contractYears: 4 },
            { id: 93807, name: 'I. Maza', position: 'CEN', rating: 76, potential: 86, age: 18, value: 6500000, wage: 16000, morale: 'Feliz', contractYears: 5 },
            { id: 93808, name: 'F. Reese', position: 'DEL', rating: 79, potential: 81, age: 26, value: 8500000, wage: 42000, morale: 'Feliz', contractYears: 4 },
            { id: 93809, name: 'P. Dárdai', position: 'DEL', rating: 75, potential: 79, age: 25, value: 3000000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 93810, name: 'H. Tabaković', position: 'DEL', rating: 77, potential: 77, age: 30, value: 4000000, wage: 32000, morale: 'Feliz', contractYears: 2 },
            { id: 93811, name: 'L. Schuler', position: 'DEL', rating: 74, potential: 77, age: 25, value: 2200000, wage: 18000, morale: 'Normal', contractYears: 3 }
        ]
    },
    {
        id: 942, name: '1. FC Köln', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 18000000, transferBudget: 6000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF',
        squad: [
            { id: 94201, name: 'J. Urbig', position: 'POR', rating: 77, potential: 84, age: 21, value: 6500000, wage: 26000, morale: 'Feliz', contractYears: 4 },
            { id: 94202, name: 'T. Hübers', position: 'DEF', rating: 77, potential: 78, age: 28, value: 5000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
            { id: 94203, name: 'J. Pauli', position: 'DEF', rating: 75, potential: 82, age: 21, value: 3500000, wage: 18000, morale: 'Feliz', contractYears: 4 },
            { id: 94204, name: 'L. Pacarada', position: 'DEF', rating: 76, potential: 76, age: 29, value: 3000000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 94205, name: 'E. Martel', position: 'CEN', rating: 78, potential: 83, age: 22, value: 7500000, wage: 32000, morale: 'Feliz', contractYears: 4 },
            { id: 94206, name: 'D. Huseinbašić', position: 'CEN', rating: 77, potential: 81, age: 23, value: 5500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 94207, name: 'D. Ljubičić', position: 'CEN', rating: 78, potential: 80, age: 26, value: 6500000, wage: 36000, morale: 'Feliz', contractYears: 3 },
            { id: 94208, name: 'L. Maina', position: 'DEL', rating: 77, potential: 79, age: 25, value: 5000000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 94209, name: 'J. Thielmann', position: 'DEL', rating: 76, potential: 81, age: 22, value: 4500000, wage: 26000, morale: 'Feliz', contractYears: 4 },
            { id: 94210, name: 'T. Lemperle', position: 'DEL', rating: 76, potential: 82, age: 22, value: 4500000, wage: 24000, morale: 'Feliz', contractYears: 4 },
            { id: 94211, name: 'D. Downs', position: 'DEL', rating: 75, potential: 83, age: 20, value: 3800000, wage: 18000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    { id: 932, name: 'Hannover 96', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 16000000, transferBudget: 4500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#1E8238', secondaryColor: '#000000', squad: createGenericSquad(93200, 'Hannover 96', 76) },
    { id: 935, name: 'SC Paderborn 07', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 14000000, transferBudget: 4000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#004A99', secondaryColor: '#000000', squad: createGenericSquad(93500, 'SC Paderborn 07', 75) },
    { id: 936, name: '1. FC Kaiserslautern', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 15000000, transferBudget: 4200000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(93600, '1. FC Kaiserslautern', 75) },
    { id: 937, name: '1. FC Nürnberg', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 14500000, transferBudget: 4000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#8B0000', secondaryColor: '#FFFFFF', squad: createGenericSquad(93700, '1. FC Nürnberg', 75) },
    { id: 939, name: 'SpVgg Greuther Fürth', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 12000000, transferBudget: 3200000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#006400', secondaryColor: '#FFFFFF', squad: createGenericSquad(93900, 'SpVgg Greuther Fürth', 74) },
    { id: 940, name: 'Eintracht Braunschweig', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 10000000, transferBudget: 2500000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FFD700', secondaryColor: '#003DA5', squad: createGenericSquad(94000, 'Eintracht Braunschweig', 72) },
    { id: 941, name: 'SV Darmstadt 98', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 14000000, transferBudget: 3800000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#004A99', secondaryColor: '#FFFFFF', squad: createGenericSquad(94100, 'SV Darmstadt 98', 75) },
    { id: 943, name: 'Dynamo Dresden', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 11000000, transferBudget: 2800000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#FFD700', secondaryColor: '#000000', squad: createGenericSquad(94300, 'Dynamo Dresden', 73) },
    { id: 944, name: 'Karlsruher SC', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 13500000, transferBudget: 3600000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#004A99', secondaryColor: '#FFFFFF', squad: createGenericSquad(94400, 'Karlsruher SC', 75) },
    { id: 945, name: 'VfL Osnabrück', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 9500000, transferBudget: 2200000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#662D91', secondaryColor: '#FFFFFF', squad: createGenericSquad(94500, 'VfL Osnabrück', 72) },
    { id: 946, name: 'Arminia Bielefeld', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 11500000, transferBudget: 3000000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#000000', squad: createGenericSquad(94600, 'Arminia Bielefeld', 73) },
    { id: 947, name: '1. FC Magdeburg', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 12000000, transferBudget: 3200000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#004A99', secondaryColor: '#FFFFFF', squad: createGenericSquad(94700, '1. FC Magdeburg', 74) },
    { id: 948, name: 'SV Elversberg', logo: '', leagueId: LeagueId.ZWEITE_BUNDESLIGA, budget: 11000000, transferBudget: 3000000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#000000', secondaryColor: '#FFFFFF', squad: createGenericSquad(94800, 'SV Elversberg', 74) }
];

// --- SERIE B ITALIANA ---
export const serieBItaTeams: Team[] = [
    {
        id: 963, name: 'Palermo FC', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 15000000, transferBudget: 5000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#FFB6C1', secondaryColor: '#000000',
        squad: [
            { id: 96301, name: 'S. Desplanches', position: 'POR', rating: 75, potential: 82, age: 21, value: 3500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
            { id: 96302, name: 'P. Ceccaroni', position: 'DEF', rating: 75, potential: 75, age: 31, value: 2000000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 96303, name: 'R. Nikolaou', position: 'DEF', rating: 75, potential: 77, age: 26, value: 2800000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 96304, name: 'P. Lund', position: 'DEF', rating: 75, potential: 80, age: 22, value: 3500000, wage: 18000, morale: 'Feliz', contractYears: 4 },
            { id: 96305, name: 'C. Gomes', position: 'CEN', rating: 76, potential: 80, age: 23, value: 4500000, wage: 25000, morale: 'Feliz', contractYears: 4 },
            { id: 96306, name: 'J. Segre', position: 'CEN', rating: 76, potential: 77, age: 27, value: 3500000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 96307, name: 'F. Ranocchia', position: 'CEN', rating: 77, potential: 82, age: 23, value: 5500000, wage: 30000, morale: 'Feliz', contractYears: 4 },
            { id: 96308, name: 'F. Di Francesco', position: 'DEL', rating: 76, potential: 76, age: 30, value: 3000000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 96309, name: 'R. Insigne', position: 'DEL', rating: 75, potential: 75, age: 30, value: 2200000, wage: 24000, morale: 'Normal', contractYears: 2 },
            { id: 96310, name: 'M. Brunori', position: 'DEL', rating: 78, potential: 78, age: 29, value: 6000000, wage: 38000, morale: 'Feliz', contractYears: 3 },
            { id: 96311, name: 'T. Henry', position: 'DEL', rating: 76, potential: 76, age: 29, value: 3500000, wage: 30000, morale: 'Contento', contractYears: 2 }
        ]
    },
    {
        id: 967, name: 'US Cremonese', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 14000000, transferBudget: 4500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#808080',
        squad: [
            { id: 96701, name: 'A. Fulignati', position: 'POR', rating: 76, potential: 77, age: 29, value: 2800000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 96702, name: 'M. Bianchetti', position: 'DEF', rating: 75, potential: 75, age: 31, value: 2000000, wage: 22000, morale: 'Contento', contractYears: 2 },
            { id: 96703, name: 'L. Lochoshvili', position: 'DEF', rating: 75, potential: 77, age: 26, value: 2500000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 96704, name: 'L. Sernicola', position: 'DEF', rating: 76, potential: 77, age: 27, value: 3500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 96705, name: 'M. Castagnetti', position: 'CEN', rating: 76, potential: 76, age: 34, value: 1800000, wage: 26000, morale: 'Feliz', contractYears: 1 },
            { id: 96706, name: 'C. Pickel', position: 'CEN', rating: 76, potential: 78, age: 27, value: 3800000, wage: 26000, morale: 'Feliz', contractYears: 3 },
            { id: 96707, name: 'J. Vandeputte', position: 'CEN', rating: 77, potential: 78, age: 28, value: 5000000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 96708, name: 'F. Vázquez', position: 'DEL', rating: 78, potential: 78, age: 35, value: 2200000, wage: 38000, morale: 'Feliz', contractYears: 1 },
            { id: 96709, name: 'M. Zanimacchia', position: 'DEL', rating: 76, potential: 78, age: 26, value: 3500000, wage: 24000, morale: 'Contento', contractYears: 3 },
            { id: 96710, name: 'M. De Luca', position: 'DEL', rating: 76, potential: 78, age: 26, value: 3500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 96711, name: 'D. Johnsen', position: 'DEL', rating: 76, potential: 77, age: 26, value: 3500000, wage: 25000, morale: 'Contento', contractYears: 3 }
        ]
    },
    {
        id: 971, name: 'Pisa SC', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 13000000, transferBudget: 4000000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#003DA5', secondaryColor: '#000000',
        squad: [
            { id: 97101, name: 'A. Šemper', position: 'POR', rating: 76, potential: 78, age: 26, value: 3000000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 97102, name: 'A. Caracciolo', position: 'DEF', rating: 75, potential: 75, age: 34, value: 1500000, wage: 22000, morale: 'Feliz', contractYears: 2 },
            { id: 97103, name: 'S. Canestrelli', position: 'DEF', rating: 76, potential: 80, age: 24, value: 3800000, wage: 22000, morale: 'Feliz', contractYears: 4 },
            { id: 97104, name: 'P. Beruatto', position: 'DEF', rating: 75, potential: 77, age: 25, value: 2800000, wage: 20000, morale: 'Contento', contractYears: 3 },
            { id: 97105, name: 'M. Marin', position: 'CEN', rating: 76, potential: 77, age: 26, value: 3500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
            { id: 97106, name: 'M. Tramoni', position: 'CEN', rating: 77, potential: 82, age: 24, value: 5500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
            { id: 97107, name: 'I. Touré', position: 'CEN', rating: 76, potential: 78, age: 26, value: 3800000, wage: 24000, morale: 'Feliz', contractYears: 3 },
            { id: 97108, name: 'M. Piccinini', position: 'CEN', rating: 75, potential: 79, age: 23, value: 2800000, wage: 18000, morale: 'Contento', contractYears: 3 },
            { id: 97109, name: 'E. Vignato', position: 'DEL', rating: 75, potential: 80, age: 24, value: 3200000, wage: 22000, morale: 'Contento', contractYears: 3 },
            { id: 97110, name: 'N. Bonfanti', position: 'DEL', rating: 77, potential: 83, age: 22, value: 5000000, wage: 24000, morale: 'Feliz', contractYears: 4 },
            { id: 97111, name: 'A. Lind', position: 'DEL', rating: 75, potential: 81, age: 22, value: 3500000, wage: 20000, morale: 'Feliz', contractYears: 4 }
        ]
    },
    {
        id: 972, name: 'US Salernitana', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 14000000, transferBudget: 4200000, tier: 'Top', teamMorale: 'Normal', primaryColor: '#8B0000', secondaryColor: '#FFFFFF',
        squad: [
            { id: 97201, name: 'L. Sepe', position: 'POR', rating: 76, potential: 76, age: 33, value: 1800000, wage: 26000, morale: 'Normal', contractYears: 2 },
            { id: 97202, name: 'D. Bronn', position: 'DEF', rating: 75, potential: 75, age: 29, value: 2200000, wage: 24000, morale: 'Contento', contractYears: 2 },
            { id: 97203, name: 'P. Stojanović', position: 'DEF', rating: 75, potential: 75, age: 28, value: 2200000, wage: 22000, morale: 'Normal', contractYears: 2 },
            { id: 97204, name: 'L. Ferrari', position: 'DEF', rating: 74, potential: 74, age: 32, value: 1400000, wage: 18000, morale: 'Normal', contractYears: 2 },
            { id: 97205, name: 'G. Maggiore', position: 'CEN', rating: 77, potential: 78, age: 26, value: 4500000, wage: 30000, morale: 'Feliz', contractYears: 3 },
            { id: 97206, name: 'A. Amatucci', position: 'CEN', rating: 75, potential: 82, age: 20, value: 3500000, wage: 16000, morale: 'Feliz', contractYears: 4 },
            { id: 97207, name: 'R. Soriano', position: 'CEN', rating: 76, potential: 76, age: 33, value: 2000000, wage: 28000, morale: 'Contento', contractYears: 1 },
            { id: 97208, name: 'D. Verde', position: 'DEL', rating: 77, potential: 77, age: 28, value: 4200000, wage: 32000, morale: 'Feliz', contractYears: 3 },
            { id: 97209, name: 'J. Reine-Adélaïde', position: 'DEL', rating: 76, potential: 77, age: 26, value: 3500000, wage: 28000, morale: 'Contento', contractYears: 2 },
            { id: 97210, name: 'S. Nwankwo (Simy)', position: 'DEL', rating: 75, potential: 75, age: 32, value: 1800000, wage: 25000, morale: 'Normal', contractYears: 1 },
            { id: 97211, name: 'E. Torregrossa', position: 'DEL', rating: 75, potential: 75, age: 32, value: 1800000, wage: 24000, morale: 'Contento', contractYears: 2 }
        ]
    },
    { id: 961, name: 'UC Sampdoria', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 16000000, transferBudget: 4500000, tier: 'Top', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#C8102E', squad: createGenericSquad(96100, 'UC Sampdoria', 76) },
    { id: 962, name: 'US Sassuolo', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 22000000, transferBudget: 7500000, tier: 'Top', teamMorale: 'Feliz', primaryColor: '#008000', secondaryColor: '#000000', squad: createGenericSquad(96200, 'US Sassuolo', 78) },
    { id: 964, name: 'Modena FC', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 10000000, transferBudget: 2800000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#FFD700', secondaryColor: '#003DA5', squad: createGenericSquad(96400, 'Modena FC', 74) },
    { id: 965, name: 'US Catanzaro', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 10500000, transferBudget: 3000000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFD700', squad: createGenericSquad(96500, 'US Catanzaro', 74) },
    { id: 966, name: 'Cesena FC', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 10500000, transferBudget: 2900000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#FFFFFF', secondaryColor: '#000000', squad: createGenericSquad(96600, 'Cesena FC', 74) },
    { id: 968, name: 'Frosinone Calcio', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 15000000, transferBudget: 4500000, tier: 'Top', teamMorale: 'Normal', primaryColor: '#FFD700', secondaryColor: '#003DA5', squad: createGenericSquad(96800, 'Frosinone Calcio', 75) },
    { id: 969, name: 'FC Südtirol', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 9000000, transferBudget: 2400000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(96900, 'FC Südtirol', 73) },
    { id: 970, name: 'Mantova 1911', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 8500000, transferBudget: 2200000, tier: 'Lower', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(97000, 'Mantova 1911', 72) },
    { id: 973, name: 'Carrarese Calcio', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 8000000, transferBudget: 2000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#003DA5', secondaryColor: '#FFD700', squad: createGenericSquad(97300, 'Carrarese Calcio', 72) },
    { id: 974, name: 'SS Juve Stabia', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 9000000, transferBudget: 2500000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#FFD700', secondaryColor: '#003DA5', squad: createGenericSquad(97400, 'SS Juve Stabia', 73) },
    { id: 975, name: 'Benevento Calcio', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 9500000, transferBudget: 2500000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#C8102E', secondaryColor: '#FFD700', squad: createGenericSquad(97500, 'Benevento Calcio', 73) },
    { id: 976, name: 'Ascoli Calcio', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 9000000, transferBudget: 2300000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#000000', secondaryColor: '#FFFFFF', squad: createGenericSquad(97600, 'Ascoli Calcio', 72) },
    { id: 977, name: 'Calcio Padova', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 9000000, transferBudget: 2400000, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(97700, 'Calcio Padova', 73) },
    { id: 978, name: 'LR Vicenza', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 9500000, transferBudget: 2500000, tier: 'Mid', teamMorale: 'Normal', primaryColor: '#C8102E', secondaryColor: '#FFFFFF', squad: createGenericSquad(97800, 'LR Vicenza', 73) },
    { id: 979, name: 'US Avellino', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 8500000, transferBudget: 2200000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#008000', secondaryColor: '#FFFFFF', squad: createGenericSquad(97900, 'US Avellino', 72) },
    { id: 980, name: 'Virtus Entella', logo: '', leagueId: LeagueId.SERIE_B_ITA, budget: 8000000, transferBudget: 2000000, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#0093D0', secondaryColor: '#FFFFFF', squad: createGenericSquad(98000, 'Virtus Entella', 71) }
];
