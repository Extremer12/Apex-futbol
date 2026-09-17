import { Team, LeagueId } from '../../types';
import { createTeamLogo, TEAM_LOGOS } from './helpers';

export const championshipTeams: Team[] = [
  {
    id: 101, name: 'Leeds United', logo: createTeamLogo(TEAM_LOGOS['Leeds United'], 'Leeds United'), leagueId: LeagueId.CHAMPIONSHIP, budget: 45000000, transferBudget: 15000000, tier: 'Top', teamMorale: 'Feliz',
    primaryColor: '#FFFFFF', secondaryColor: '#FFCD00',
    squad: [
      { id: 10101, name: 'I. Meslier', position: 'POR', rating: 78, potential: 82, age: 24, value: 12000000, wage: 45000, morale: 'Feliz', contractYears: 3 },
      { id: 10102, name: 'K. Darlow', position: 'POR', rating: 73, potential: 73, age: 33, value: 1500000, wage: 20000, morale: 'Normal', contractYears: 2 },
      { id: 10103, name: 'P. Struijk', position: 'DEF', rating: 77, potential: 80, age: 25, value: 10000000, wage: 40000, morale: 'Feliz', contractYears: 4 },
      { id: 10104, name: 'J. Rodon', position: 'DEF', rating: 77, potential: 79, age: 26, value: 9000000, wage: 40000, morale: 'Contento', contractYears: 4 },
      { id: 10105, name: 'J. Bogle', position: 'DEF', rating: 75, potential: 78, age: 24, value: 6500000, wage: 30000, morale: 'Contento', contractYears: 4 },
      { id: 10106, name: 'J. Firpo', position: 'DEF', rating: 76, potential: 76, age: 28, value: 6000000, wage: 45000, morale: 'Normal', contractYears: 2 },
      { id: 10107, name: 'E. Ampadu', position: 'CEN', rating: 78, potential: 82, age: 24, value: 12000000, wage: 45000, morale: 'Feliz', contractYears: 4 },
      { id: 10108, name: 'I. Gruev', position: 'CEN', rating: 76, potential: 79, age: 24, value: 7000000, wage: 30000, morale: 'Contento', contractYears: 3 },
      { id: 10109, name: 'A. Tanaka', position: 'CEN', rating: 77, potential: 79, age: 25, value: 8500000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 10110, name: 'B. Aaronson', position: 'CEN', rating: 76, potential: 80, age: 23, value: 9000000, wage: 35000, morale: 'Contento', contractYears: 3 },
      { id: 10111, name: 'D. James', position: 'DEL', rating: 78, potential: 78, age: 26, value: 11000000, wage: 50000, morale: 'Feliz', contractYears: 3 },
      { id: 10112, name: 'W. Gnonto', position: 'DEL', rating: 78, potential: 84, age: 20, value: 16000000, wage: 40000, morale: 'Feliz', contractYears: 4 },
      { id: 10113, name: 'M. Solomon', position: 'DEL', rating: 77, potential: 79, age: 25, value: 9500000, wage: 45000, morale: 'Contento', contractYears: 2 },
      { id: 10114, name: 'M. Joseph', position: 'DEL', rating: 75, potential: 83, age: 20, value: 6500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
      { id: 10115, name: 'J. Piroe', position: 'DEL', rating: 77, potential: 78, age: 25, value: 9000000, wage: 40000, morale: 'Contento', contractYears: 3 }
    ]
  },
  {
    id: 102, name: 'Burnley', logo: createTeamLogo(TEAM_LOGOS['Burnley'], 'Burnley'), leagueId: LeagueId.CHAMPIONSHIP, budget: 40000000, transferBudget: 12000000, tier: 'Top', teamMorale: 'Feliz',
    primaryColor: '#6C1D45', secondaryColor: '#99D6EA',
    squad: [
      { id: 10201, name: 'J. Trafford', position: 'POR', rating: 77, potential: 84, age: 21, value: 11000000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 10202, name: 'V. Hladký', position: 'POR', rating: 74, potential: 74, age: 33, value: 2000000, wage: 20000, morale: 'Normal', contractYears: 2 },
      { id: 10203, name: 'M. Estève', position: 'DEF', rating: 77, potential: 83, age: 22, value: 10000000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 10204, name: 'J. Beyer', position: 'DEF', rating: 77, potential: 81, age: 24, value: 9500000, wage: 35000, morale: 'Contento', contractYears: 3 },
      { id: 10205, name: 'C. Roberts', position: 'DEF', rating: 76, potential: 76, age: 28, value: 6000000, wage: 35000, morale: 'Normal', contractYears: 2 },
      { id: 10206, name: 'L. Pires', position: 'DEF', rating: 75, potential: 79, age: 23, value: 5500000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 10207, name: 'J. Cullen', position: 'CEN', rating: 77, potential: 78, age: 28, value: 8000000, wage: 40000, morale: 'Feliz', contractYears: 3 },
      { id: 10208, name: 'H. Mejbri', position: 'CEN', rating: 76, potential: 82, age: 21, value: 8500000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 10209, name: 'J. Brownhill', position: 'CEN', rating: 79, potential: 79, age: 28, value: 12000000, wage: 55000, morale: 'Feliz', contractYears: 3 },
      { id: 10210, name: 'L. Koleosho', position: 'DEL', rating: 76, potential: 84, age: 19, value: 9000000, wage: 25000, morale: 'Feliz', contractYears: 4 },
      { id: 10211, name: 'J. Sarmiento', position: 'DEL', rating: 76, potential: 81, age: 22, value: 7500000, wage: 30000, morale: 'Contento', contractYears: 3 },
      { id: 10212, name: 'Z. Flemming', position: 'DEL', rating: 77, potential: 79, age: 25, value: 9000000, wage: 40000, morale: 'Feliz', contractYears: 3 },
      { id: 10213, name: 'L. Foster', position: 'DEL', rating: 76, potential: 80, age: 23, value: 8000000, wage: 35000, morale: 'Normal', contractYears: 4 }
    ]
  },
  {
    id: 104, name: 'Sheffield Utd', logo: createTeamLogo(TEAM_LOGOS['Sheffield Utd'], 'Sheffield Utd'), leagueId: LeagueId.CHAMPIONSHIP, budget: 38000000, transferBudget: 11000000, tier: 'Top', teamMorale: 'Feliz',
    primaryColor: '#EE2737', secondaryColor: '#000000',
    squad: [
      { id: 10401, name: 'M. Cooper', position: 'POR', rating: 77, potential: 82, age: 24, value: 8500000, wage: 30000, morale: 'Feliz', contractYears: 4 },
      { id: 10402, name: 'A. Davies', position: 'POR', rating: 72, potential: 72, age: 31, value: 1200000, wage: 18000, morale: 'Normal', contractYears: 2 },
      { id: 10403, name: 'A. Ahmedhodzic', position: 'DEF', rating: 79, potential: 83, age: 25, value: 14000000, wage: 50000, morale: 'Feliz', contractYears: 3 },
      { id: 10404, name: 'H. Souttar', position: 'DEF', rating: 77, potential: 79, age: 25, value: 8000000, wage: 40000, morale: 'Contento', contractYears: 3 },
      { id: 10405, name: 'J. Shackleton', position: 'DEF', rating: 74, potential: 76, age: 24, value: 4500000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 10406, name: 'H. Burrows', position: 'DEF', rating: 75, potential: 80, age: 22, value: 5500000, wage: 25000, morale: 'Feliz', contractYears: 4 },
      { id: 10407, name: 'V. Souza', position: 'CEN', rating: 78, potential: 82, age: 25, value: 11000000, wage: 45000, morale: 'Feliz', contractYears: 3 },
      { id: 10408, name: 'O. Arblaster', position: 'CEN', rating: 77, potential: 85, age: 20, value: 12000000, wage: 30000, morale: 'Feliz', contractYears: 5 },
      { id: 10409, name: 'G. Hamer', position: 'CEN', rating: 80, potential: 81, age: 27, value: 15000000, wage: 55000, morale: 'Feliz', contractYears: 3 },
      { id: 10410, name: 'C. O\'Hare', position: 'CEN', rating: 77, potential: 79, age: 26, value: 8500000, wage: 38000, morale: 'Contento', contractYears: 3 },
      { id: 10411, name: 'J. Rak-Sakyi', position: 'DEL', rating: 76, potential: 83, age: 21, value: 7500000, wage: 25000, morale: 'Feliz', contractYears: 3 },
      { id: 10412, name: 'K. Moore', position: 'DEL', rating: 76, potential: 76, age: 32, value: 4500000, wage: 35000, morale: 'Normal', contractYears: 2 },
      { id: 10413, name: 'T. Campbell', position: 'DEL', rating: 75, potential: 77, age: 24, value: 5000000, wage: 28000, morale: 'Normal', contractYears: 3 }
    ]
  },
  {
    id: 113, name: 'Sunderland', logo: createTeamLogo(TEAM_LOGOS['Sunderland'], 'Sunderland'), leagueId: LeagueId.CHAMPIONSHIP, budget: 30000000, transferBudget: 9000000, tier: 'Top', teamMorale: 'Feliz',
    primaryColor: '#FF0000', secondaryColor: '#FFFFFF',
    squad: [
      { id: 11301, name: 'A. Patterson', position: 'POR', rating: 78, potential: 84, age: 24, value: 10000000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 11302, name: 'T. Watson', position: 'DEF', rating: 76, potential: 81, age: 23, value: 6000000, wage: 25000, morale: 'Contento', contractYears: 4 },
      { id: 11303, name: 'D. Ballard', position: 'DEF', rating: 77, potential: 81, age: 24, value: 8500000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 11304, name: 'L. O\'Nien', position: 'DEF', rating: 75, potential: 75, age: 29, value: 3500000, wage: 28000, morale: 'Feliz', contractYears: 2 },
      { id: 11305, name: 'D. Cirkin', position: 'DEF', rating: 76, potential: 80, age: 22, value: 6500000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 11306, name: 'D. Neil', position: 'CEN', rating: 77, potential: 82, age: 22, value: 9500000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 11307, name: 'J. Bellingham', position: 'CEN', rating: 77, potential: 86, age: 18, value: 14000000, wage: 30000, morale: 'Feliz', contractYears: 5 },
      { id: 11308, name: 'C. Rigg', position: 'CEN', rating: 76, potential: 88, age: 17, value: 12000000, wage: 20000, morale: 'Feliz', contractYears: 5 },
      { id: 11309, name: 'P. Roberts', position: 'DEL', rating: 77, potential: 77, age: 27, value: 7500000, wage: 38000, morale: 'Contento', contractYears: 3 },
      { id: 11310, name: 'R. Mundle', position: 'DEL', rating: 76, potential: 82, age: 21, value: 6500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
      { id: 11311, name: 'W. Isidor', position: 'DEL', rating: 77, potential: 80, age: 23, value: 8000000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 11312, name: 'E. Mayenda', position: 'DEL', rating: 74, potential: 82, age: 19, value: 4500000, wage: 15000, morale: 'Contento', contractYears: 4 }
    ]
  },
  {
    id: 105, name: 'West Brom', logo: createTeamLogo(TEAM_LOGOS['West Brom'], 'West Brom'), leagueId: LeagueId.CHAMPIONSHIP, budget: 28000000, transferBudget: 8000000, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#122F67', secondaryColor: '#FFFFFF',
    squad: [
      { id: 10501, name: 'A. Palmer', position: 'POR', rating: 77, potential: 79, age: 27, value: 7000000, wage: 30000, morale: 'Feliz', contractYears: 3 },
      { id: 10502, name: 'S. Ajayi', position: 'DEF', rating: 76, potential: 76, age: 30, value: 4500000, wage: 32000, morale: 'Normal', contractYears: 2 },
      { id: 10503, name: 'K. Bartley', position: 'DEF', rating: 75, potential: 75, age: 33, value: 2000000, wage: 30000, morale: 'Normal', contractYears: 1 },
      { id: 10504, name: 'D. Furlong', position: 'DEF', rating: 76, potential: 76, age: 28, value: 5000000, wage: 30000, morale: 'Contento', contractYears: 2 },
      { id: 10505, name: 'T. Heggem', position: 'DEF', rating: 75, potential: 78, age: 25, value: 4500000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 10506, name: 'A. Mowatt', position: 'CEN', rating: 77, potential: 77, age: 29, value: 6500000, wage: 35000, morale: 'Feliz', contractYears: 2 },
      { id: 10507, name: 'J. Molumby', position: 'CEN', rating: 76, potential: 78, age: 25, value: 5500000, wage: 28000, morale: 'Normal', contractYears: 3 },
      { id: 10508, name: 'J. Swift', position: 'CEN', rating: 77, potential: 77, age: 29, value: 6500000, wage: 38000, morale: 'Contento', contractYears: 2 },
      { id: 10509, name: 'G. Diangana', position: 'DEL', rating: 77, potential: 78, age: 26, value: 7500000, wage: 35000, morale: 'Contento', contractYears: 3 },
      { id: 10510, name: 'K. Grant', position: 'DEL', rating: 76, potential: 77, age: 26, value: 6000000, wage: 35000, morale: 'Normal', contractYears: 2 },
      { id: 10511, name: 'J. Maja', position: 'DEL', rating: 77, potential: 79, age: 25, value: 7500000, wage: 35000, morale: 'Feliz', contractYears: 3 }
    ]
  },
  {
    id: 106, name: 'Norwich City', logo: createTeamLogo(TEAM_LOGOS['Norwich City'], 'Norwich City'), leagueId: LeagueId.CHAMPIONSHIP, budget: 26000000, transferBudget: 7500000, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#FFF200', secondaryColor: '#00A650',
    squad: [
      { id: 10601, name: 'A. Gunn', position: 'POR', rating: 77, potential: 78, age: 28, value: 7000000, wage: 35000, morale: 'Contento', contractYears: 3 },
      { id: 10602, name: 'S. Duffy', position: 'DEF', rating: 75, potential: 75, age: 32, value: 2500000, wage: 30000, morale: 'Normal', contractYears: 2 },
      { id: 10603, name: 'J. Córdoba', position: 'DEF', rating: 76, potential: 81, age: 23, value: 6000000, wage: 25000, morale: 'Feliz', contractYears: 4 },
      { id: 10604, name: 'K. McLean', position: 'CEN', rating: 77, potential: 77, age: 32, value: 4500000, wage: 35000, morale: 'Feliz', contractYears: 2 },
      { id: 10605, name: 'M. Núñez', position: 'CEN', rating: 77, potential: 80, age: 24, value: 8000000, wage: 30000, morale: 'Feliz', contractYears: 3 },
      { id: 10606, name: 'A. Crnac', position: 'DEL', rating: 75, potential: 83, age: 20, value: 7000000, wage: 22000, morale: 'Feliz', contractYears: 4 },
      { id: 10607, name: 'J. Sainz', position: 'DEL', rating: 78, potential: 82, age: 23, value: 11000000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 10608, name: 'J. Sargent', position: 'DEL', rating: 79, potential: 82, age: 24, value: 13000000, wage: 45000, morale: 'Feliz', contractYears: 4 }
    ]
  },
  {
    id: 109, name: 'Middlesbrough', logo: createTeamLogo(TEAM_LOGOS['Middlesbrough'], 'Middlesbrough'), leagueId: LeagueId.CHAMPIONSHIP, budget: 24000000, transferBudget: 7000000, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#E03A3E', secondaryColor: '#FFFFFF',
    squad: [
      { id: 10901, name: 'S. Dieng', position: 'POR', rating: 77, potential: 78, age: 29, value: 6500000, wage: 30000, morale: 'Contento', contractYears: 3 },
      { id: 10902, name: 'R. van den Berg', position: 'DEF', rating: 77, potential: 84, age: 20, value: 9500000, wage: 25000, morale: 'Feliz', contractYears: 4 },
      { id: 10903, name: 'M. Clarke', position: 'DEF', rating: 76, potential: 77, age: 27, value: 5000000, wage: 28000, morale: 'Normal', contractYears: 2 },
      { id: 10904, name: 'L. Ayling', position: 'DEF', rating: 75, potential: 75, age: 33, value: 2000000, wage: 30000, morale: 'Normal', contractYears: 1 },
      { id: 10905, name: 'H. Hackney', position: 'CEN', rating: 78, potential: 84, age: 22, value: 12000000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 10906, name: 'A. Morris', position: 'CEN', rating: 76, potential: 81, age: 22, value: 6000000, wage: 25000, morale: 'Contento', contractYears: 4 },
      { id: 10907, name: 'F. Azaz', position: 'CEN', rating: 77, potential: 80, age: 24, value: 8000000, wage: 30000, morale: 'Feliz', contractYears: 3 },
      { id: 10908, name: 'B. Doak', position: 'DEL', rating: 76, potential: 87, age: 18, value: 10000000, wage: 25000, morale: 'Feliz', contractYears: 4 },
      { id: 10909, name: 'T. Conway', position: 'DEL', rating: 76, potential: 82, age: 22, value: 7500000, wage: 28000, morale: 'Contento', contractYears: 4 },
      { id: 10910, name: 'E. Latte Lath', position: 'DEL', rating: 78, potential: 80, age: 25, value: 11000000, wage: 40000, morale: 'Feliz', contractYears: 3 }
    ]
  },
  {
    id: 115, name: 'Watford', logo: createTeamLogo(TEAM_LOGOS['Watford'], 'Watford'), leagueId: LeagueId.CHAMPIONSHIP, budget: 25000000, transferBudget: 7000000, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#FBEE23', secondaryColor: '#ED2127',
    squad: [
      { id: 11501, name: 'D. Bachmann', position: 'POR', rating: 76, potential: 76, age: 30, value: 4500000, wage: 30000, morale: 'Normal', contractYears: 3 },
      { id: 11502, name: 'F. Sierralta', position: 'DEF', rating: 76, potential: 77, age: 27, value: 5000000, wage: 28000, morale: 'Normal', contractYears: 3 },
      { id: 11503, name: 'M. Pollock', position: 'DEF', rating: 75, potential: 79, age: 23, value: 4500000, wage: 22000, morale: 'Contento', contractYears: 3 },
      { id: 11504, name: 'Y. Larouci', position: 'DEF', rating: 75, potential: 78, age: 23, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11505, name: 'M. Sissoko', position: 'CEN', rating: 77, potential: 77, age: 35, value: 2500000, wage: 45000, morale: 'Feliz', contractYears: 2 },
      { id: 11506, name: 'E. Kayembe', position: 'CEN', rating: 77, potential: 78, age: 26, value: 7000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
      { id: 11507, name: 'G. Chakvetadze', position: 'CEN', rating: 78, potential: 81, age: 25, value: 9500000, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 11508, name: 'K. Baah', position: 'DEL', rating: 76, potential: 82, age: 21, value: 6500000, wage: 22000, morale: 'Contento', contractYears: 4 },
      { id: 11509, name: 'V. Bayo', position: 'DEL', rating: 76, potential: 76, age: 27, value: 5500000, wage: 30000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 103, name: 'Luton Town', logo: createTeamLogo(TEAM_LOGOS['Luton Town'], 'Luton Town'), leagueId: LeagueId.CHAMPIONSHIP, budget: 28000000, transferBudget: 8000000, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#F78F1E', secondaryColor: '#002D56',
    squad: [
      { id: 10301, name: 'T. Kaminski', position: 'POR', rating: 77, potential: 77, age: 31, value: 5500000, wage: 35000, morale: 'Contento', contractYears: 3 },
      { id: 10302, name: 'M. McGuinness', position: 'DEF', rating: 76, potential: 80, age: 23, value: 6500000, wage: 28000, morale: 'Normal', contractYears: 4 },
      { id: 10303, name: 'T. Mengi', position: 'DEF', rating: 77, potential: 83, age: 22, value: 9000000, wage: 32000, morale: 'Feliz', contractYears: 3 },
      { id: 10304, name: 'A. Bell', position: 'DEF', rating: 75, potential: 75, age: 30, value: 3500000, wage: 28000, morale: 'Normal', contractYears: 2 },
      { id: 10305, name: 'A. Doughty', position: 'DEF', rating: 77, potential: 80, age: 24, value: 8500000, wage: 32000, morale: 'Feliz', contractYears: 3 },
      { id: 10306, name: 'M. Nakamba', position: 'CEN', rating: 76, potential: 76, age: 30, value: 4500000, wage: 35000, morale: 'Normal', contractYears: 2 },
      { id: 10307, name: 'L. Walsh', position: 'CEN', rating: 75, potential: 77, age: 27, value: 4000000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 10308, name: 'T. Chong', position: 'DEL', rating: 77, potential: 80, age: 24, value: 8500000, wage: 38000, morale: 'Feliz', contractYears: 3 },
      { id: 10309, name: 'C. Morris', position: 'DEL', rating: 77, potential: 77, age: 28, value: 8000000, wage: 40000, morale: 'Feliz', contractYears: 3 },
      { id: 10310, name: 'E. Adebayo', position: 'DEL', rating: 77, potential: 79, age: 26, value: 8500000, wage: 38000, morale: 'Contento', contractYears: 3 }
    ]
  },
  {
    id: 108, name: 'Coventry City', logo: createTeamLogo(TEAM_LOGOS['Coventry City'], 'Coventry City'), leagueId: LeagueId.CHAMPIONSHIP, budget: 22000000, transferBudget: 6000000, tier: 'Mid', teamMorale: 'Contento',
    primaryColor: '#CC0000', secondaryColor: '#FFFFFF',
    squad: [
      { id: 10801, name: 'O. Dovin', position: 'POR', rating: 76, potential: 81, age: 22, value: 5500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
      { id: 10802, name: 'B. Thomas', position: 'DEF', rating: 76, potential: 80, age: 24, value: 6000000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 10803, name: 'L. Binks', position: 'DEF', rating: 75, potential: 79, age: 23, value: 4500000, wage: 22000, morale: 'Normal', contractYears: 3 },
      { id: 10804, name: 'M. van Ewijk', position: 'DEF', rating: 78, potential: 82, age: 23, value: 9500000, wage: 30000, morale: 'Feliz', contractYears: 4 },
      { id: 10805, name: 'J. Dasilva', position: 'DEF', rating: 75, potential: 76, age: 25, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 3 },
      { id: 10806, name: 'B. Sheaf', position: 'CEN', rating: 78, potential: 80, age: 26, value: 10000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
      { id: 10807, name: 'J. Eccles', position: 'CEN', rating: 76, potential: 80, age: 24, value: 6000000, wage: 24000, morale: 'Contento', contractYears: 3 },
      { id: 10808, name: 'J. Rudoni', position: 'CEN', rating: 77, potential: 81, age: 23, value: 7500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
      { id: 10809, name: 'H. Wright', position: 'DEL', rating: 78, potential: 80, age: 26, value: 11000000, wage: 40000, morale: 'Feliz', contractYears: 3 },
      { id: 10810, name: 'E. Simms', position: 'DEL', rating: 77, potential: 81, age: 23, value: 8500000, wage: 32000, morale: 'Contento', contractYears: 4 },
      { id: 10811, name: 'T. Thomas-Asante', position: 'DEL', rating: 76, potential: 78, age: 25, value: 5500000, wage: 25000, morale: 'Normal', contractYears: 3 }
    ]
  },
  {
    id: 118, name: 'Stoke City', logo: createTeamLogo(TEAM_LOGOS['Stoke City'], 'Stoke City'), leagueId: LeagueId.CHAMPIONSHIP, budget: 20000000, transferBudget: 5000000, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#E03A3E', secondaryColor: '#FFFFFF',
    squad: [
      { id: 11801, name: 'V. Johansson', position: 'POR', rating: 77, potential: 80, age: 25, value: 7000000, wage: 28000, morale: 'Feliz', contractYears: 3 },
      { id: 11802, name: 'B. Wilmot', position: 'DEF', rating: 76, potential: 78, age: 24, value: 5500000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 11803, name: 'A. Phillips', position: 'DEF', rating: 76, potential: 84, age: 19, value: 7500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
      { id: 11804, name: 'J. Bocat', position: 'DEF', rating: 75, potential: 79, age: 24, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 3 },
      { id: 11805, name: 'W. Burger', position: 'CEN', rating: 77, potential: 82, age: 23, value: 8000000, wage: 30000, morale: 'Feliz', contractYears: 4 },
      { id: 11806, name: 'B. Manhoef', position: 'DEL', rating: 77, potential: 83, age: 22, value: 9000000, wage: 28000, morale: 'Feliz', contractYears: 4 },
      { id: 11807, name: 'T. Cannon', position: 'DEL', rating: 76, potential: 82, age: 21, value: 7000000, wage: 25000, morale: 'Feliz', contractYears: 3 },
      { id: 11808, name: 'S. Gallagher', position: 'DEL', rating: 75, potential: 75, age: 29, value: 3500000, wage: 25000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 119, name: 'Blackburn', logo: createTeamLogo(TEAM_LOGOS['Blackburn'], 'Blackburn'), leagueId: LeagueId.CHAMPIONSHIP, budget: 18000000, transferBudget: 4500000, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#009EE0', secondaryColor: '#FFFFFF',
    squad: [
      { id: 11901, name: 'A. Pears', position: 'POR', rating: 76, potential: 78, age: 26, value: 4500000, wage: 22000, morale: 'Contento', contractYears: 3 },
      { id: 11902, name: 'D. Hyam', position: 'DEF', rating: 76, potential: 77, age: 28, value: 5000000, wage: 28000, morale: 'Normal', contractYears: 2 },
      { id: 11903, name: 'H. Carter', position: 'DEF', rating: 75, potential: 79, age: 24, value: 4000000, wage: 20000, morale: 'Normal', contractYears: 3 },
      { id: 11904, name: 'O. Beck', position: 'DEF', rating: 75, potential: 82, age: 22, value: 5000000, wage: 20000, morale: 'Feliz', contractYears: 3 },
      { id: 11905, name: 'S. Tronstad', position: 'CEN', rating: 76, potential: 76, age: 29, value: 4000000, wage: 25000, morale: 'Contento', contractYears: 2 },
      { id: 11906, name: 'L. Travis', position: 'CEN', rating: 76, potential: 77, age: 26, value: 5500000, wage: 28000, morale: 'Contento', contractYears: 2 },
      { id: 11907, name: 'T. Cantwell', position: 'CEN', rating: 77, potential: 77, age: 26, value: 7000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
      { id: 11908, name: 'T. Dolan', position: 'DEL', rating: 76, potential: 80, age: 22, value: 6500000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 11909, name: 'Y. Ohashi', position: 'DEL', rating: 76, potential: 77, age: 28, value: 5500000, wage: 26000, morale: 'Feliz', contractYears: 3 },
      { id: 11910, name: 'M. Gueye', position: 'DEL', rating: 75, potential: 81, age: 21, value: 4500000, wage: 18000, morale: 'Normal', contractYears: 3 }
    ]
  },
  {
    id: 107, name: 'Hull City', logo: createTeamLogo(TEAM_LOGOS['Hull City'], 'Hull City'), leagueId: LeagueId.CHAMPIONSHIP, budget: 18000000, transferBudget: 4500000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#F5A12D', secondaryColor: '#000000',
    squad: [
      { id: 10701, name: 'I. Pandur', position: 'POR', rating: 75, potential: 79, age: 24, value: 4000000, wage: 20000, morale: 'Normal', contractYears: 3 },
      { id: 10702, name: 'A. Jones', position: 'DEF', rating: 76, potential: 79, age: 24, value: 5500000, wage: 24000, morale: 'Contento', contractYears: 3 },
      { id: 10703, name: 'S. McLoughlin', position: 'DEF', rating: 75, potential: 76, age: 27, value: 3500000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 10704, name: 'R. Giles', position: 'DEF', rating: 76, potential: 78, age: 24, value: 6000000, wage: 28000, morale: 'Contento', contractYears: 3 },
      { id: 10705, name: 'K. Palmer', position: 'CEN', rating: 76, potential: 77, age: 27, value: 5500000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 10706, name: 'R. Slater', position: 'CEN', rating: 75, potential: 77, age: 24, value: 4000000, wage: 20000, morale: 'Normal', contractYears: 3 },
      { id: 10707, name: 'M. Belloumi', position: 'DEL', rating: 76, potential: 83, age: 22, value: 7500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
      { id: 10708, name: 'L. Millar', position: 'DEL', rating: 76, potential: 78, age: 24, value: 6000000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 10709, name: 'C. Bedia', position: 'DEL', rating: 76, potential: 77, age: 28, value: 5500000, wage: 28000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 114, name: 'Swansea City', logo: createTeamLogo(TEAM_LOGOS['Swansea City'], 'Swansea City'), leagueId: LeagueId.CHAMPIONSHIP, budget: 16000000, transferBudget: 4000000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#FFFFFF', secondaryColor: '#000000',
    squad: [
      { id: 11401, name: 'L. Vigouroux', position: 'POR', rating: 76, potential: 76, age: 30, value: 3500000, wage: 22000, morale: 'Feliz', contractYears: 2 },
      { id: 11402, name: 'B. Cabango', position: 'DEF', rating: 77, potential: 80, age: 24, value: 7500000, wage: 30000, morale: 'Contento', contractYears: 3 },
      { id: 11403, name: 'H. Darling', position: 'DEF', rating: 76, potential: 79, age: 25, value: 5500000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 11404, name: 'J. Tymon', position: 'DEF', rating: 76, potential: 77, age: 25, value: 5000000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 11405, name: 'M. Grimes', position: 'CEN', rating: 78, potential: 78, age: 29, value: 8000000, wage: 35000, morale: 'Feliz', contractYears: 3 },
      { id: 11406, name: 'G. Franco', position: 'CEN', rating: 76, potential: 78, age: 26, value: 5000000, wage: 24000, morale: 'Normal', contractYears: 3 },
      { id: 11407, name: 'O. Cooper', position: 'CEN', rating: 75, potential: 79, age: 24, value: 4500000, wage: 20000, morale: 'Contento', contractYears: 3 },
      { id: 11408, name: 'R. Ronald', position: 'DEL', rating: 76, potential: 81, age: 23, value: 6500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
      { id: 11409, name: 'Ž. Vipotnik', position: 'DEL', rating: 76, potential: 81, age: 22, value: 6500000, wage: 25000, morale: 'Contento', contractYears: 4 },
      { id: 11410, name: 'L. Cullen', position: 'DEL', rating: 75, potential: 77, age: 25, value: 4000000, wage: 20000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 111, name: 'Cardiff City', logo: createTeamLogo(TEAM_LOGOS['Cardiff City'], 'Cardiff City'), leagueId: LeagueId.CHAMPIONSHIP, budget: 16000000, transferBudget: 3800000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#0070B5', secondaryColor: '#FFFFFF',
    squad: [
      { id: 11101, name: 'J. Alnwick', position: 'POR', rating: 75, potential: 75, age: 31, value: 2500000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11102, name: 'P. Ng', position: 'DEF', rating: 76, potential: 77, age: 28, value: 4500000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 11103, name: 'C. Chambers', position: 'DEF', rating: 76, potential: 76, age: 29, value: 4500000, wage: 30000, morale: 'Normal', contractYears: 2 },
      { id: 11104, name: 'M. Goutas', position: 'DEF', rating: 75, potential: 75, age: 30, value: 3500000, wage: 24000, morale: 'Normal', contractYears: 2 },
      { id: 11105, name: 'J. O\'Dowda', position: 'DEF', rating: 75, potential: 75, age: 29, value: 3500000, wage: 24000, morale: 'Normal', contractYears: 2 },
      { id: 11106, name: 'M. Siopis', position: 'CEN', rating: 76, potential: 76, age: 30, value: 4500000, wage: 28000, morale: 'Normal', contractYears: 2 },
      { id: 11107, name: 'A. Ralls', position: 'CEN', rating: 75, potential: 75, age: 30, value: 3000000, wage: 25000, morale: 'Normal', contractYears: 2 },
      { id: 11108, name: 'D. Turnbull', position: 'CEN', rating: 76, potential: 78, age: 25, value: 5500000, wage: 28000, morale: 'Contento', contractYears: 3 },
      { id: 11109, name: 'A. El Ghazi', position: 'DEL', rating: 76, potential: 76, age: 29, value: 5000000, wage: 35000, morale: 'Contento', contractYears: 2 },
      { id: 11110, name: 'C. Willock', position: 'DEL', rating: 76, potential: 77, age: 26, value: 5000000, wage: 28000, morale: 'Normal', contractYears: 3 },
      { id: 11111, name: 'C. Robinson', position: 'DEL', rating: 76, potential: 76, age: 29, value: 4500000, wage: 30000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 112, name: 'Bristol City', logo: createTeamLogo(TEAM_LOGOS['Bristol City'], 'Bristol City'), leagueId: LeagueId.CHAMPIONSHIP, budget: 15000000, transferBudget: 3500000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#E30613', secondaryColor: '#FFFFFF',
    squad: [
      { id: 11201, name: 'M. O\'Leary', position: 'POR', rating: 76, potential: 78, age: 27, value: 4500000, wage: 22000, morale: 'Contento', contractYears: 3 },
      { id: 11202, name: 'Z. Vyner', position: 'DEF', rating: 76, potential: 78, age: 27, value: 5000000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 11203, name: 'L. McNally', position: 'DEF', rating: 75, potential: 79, age: 24, value: 4500000, wage: 22000, morale: 'Normal', contractYears: 4 },
      { id: 11204, name: 'R. McCrorie', position: 'DEF', rating: 75, potential: 77, age: 26, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 3 },
      { id: 11205, name: 'C. Pring', position: 'DEF', rating: 75, potential: 77, age: 26, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11206, name: 'J. Knight', position: 'CEN', rating: 77, potential: 80, age: 23, value: 8000000, wage: 28000, morale: 'Feliz', contractYears: 4 },
      { id: 11207, name: 'M. Bird', position: 'CEN', rating: 76, potential: 79, age: 23, value: 6000000, wage: 24000, morale: 'Contento', contractYears: 3 },
      { id: 11208, name: 'S. Twine', position: 'CEN', rating: 76, potential: 79, age: 25, value: 6500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
      { id: 11209, name: 'A. Mehmeti', position: 'DEL', rating: 76, potential: 81, age: 23, value: 6500000, wage: 24000, morale: 'Feliz', contractYears: 3 },
      { id: 11210, name: 'M. Sykes', position: 'DEL', rating: 75, potential: 76, age: 27, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11211, name: 'S. Armstrong', position: 'DEL', rating: 76, potential: 80, age: 22, value: 6000000, wage: 25000, morale: 'Contento', contractYears: 4 }
    ]
  },
  {
    id: 117, name: 'QPR', logo: createTeamLogo(TEAM_LOGOS['QPR'], 'QPR'), leagueId: LeagueId.CHAMPIONSHIP, budget: 14000000, transferBudget: 3200000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#0054A6', secondaryColor: '#FFFFFF',
    squad: [
      { id: 11701, name: 'P. Nardi', position: 'POR', rating: 75, potential: 76, age: 30, value: 3000000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11702, name: 'S. Cook', position: 'DEF', rating: 75, potential: 75, age: 33, value: 1800000, wage: 25000, morale: 'Normal', contractYears: 2 },
      { id: 11703, name: 'J. Clarke-Salter', position: 'DEF', rating: 76, potential: 78, age: 26, value: 5000000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 11704, name: 'J. Dunne', position: 'DEF', rating: 75, potential: 77, age: 26, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 3 },
      { id: 11705, name: 'K. Paal', position: 'DEF', rating: 75, potential: 76, age: 27, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11706, name: 'S. Field', position: 'CEN', rating: 76, potential: 77, age: 26, value: 5000000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 11707, name: 'J. Varane', position: 'CEN', rating: 75, potential: 82, age: 22, value: 5500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
      { id: 11708, name: 'I. Chair', position: 'DEL', rating: 78, potential: 79, age: 26, value: 9500000, wage: 35000, morale: 'Feliz', contractYears: 3 },
      { id: 11709, name: 'K. Dembélé', position: 'DEL', rating: 76, potential: 83, age: 21, value: 7000000, wage: 25000, morale: 'Feliz', contractYears: 4 },
      { id: 11710, name: 'S. Saito', position: 'DEL', rating: 75, potential: 80, age: 23, value: 5000000, wage: 22000, morale: 'Contento', contractYears: 3 },
      { id: 11711, name: 'M. Frey', position: 'DEL', rating: 75, potential: 75, age: 30, value: 3500000, wage: 25000, morale: 'Normal', contractYears: 2 },
      { id: 11712, name: 'Ž. Celar', position: 'DEL', rating: 76, potential: 78, age: 25, value: 5500000, wage: 28000, morale: 'Contento', contractYears: 3 }
    ]
  },
  {
    id: 110, name: 'Preston', logo: createTeamLogo(TEAM_LOGOS['Preston'], 'Preston'), leagueId: LeagueId.CHAMPIONSHIP, budget: 13000000, transferBudget: 2800000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#FFFFFF', secondaryColor: '#003399',
    squad: [
      { id: 11001, name: 'F. Woodman', position: 'POR', rating: 76, potential: 78, age: 27, value: 5000000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 11002, name: 'L. Lindsay', position: 'DEF', rating: 75, potential: 75, age: 28, value: 3500000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11003, name: 'J. Storey', position: 'DEF', rating: 75, potential: 77, age: 27, value: 3500000, wage: 20000, morale: 'Normal', contractYears: 2 },
      { id: 11004, name: 'A. Hughes', position: 'DEF', rating: 75, potential: 75, age: 32, value: 2000000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11005, name: 'B. Whiteman', position: 'CEN', rating: 76, potential: 77, age: 28, value: 5000000, wage: 28000, morale: 'Contento', contractYears: 3 },
      { id: 11006, name: 'A. McCann', position: 'CEN', rating: 76, potential: 79, age: 24, value: 5500000, wage: 24000, morale: 'Contento', contractYears: 3 },
      { id: 11007, name: 'M. Frøkjær', position: 'CEN', rating: 76, potential: 79, age: 25, value: 5500000, wage: 25000, morale: 'Normal', contractYears: 3 },
      { id: 11008, name: 'S. Greenwood', position: 'DEL', rating: 75, potential: 80, age: 22, value: 5000000, wage: 22000, morale: 'Feliz', contractYears: 3 },
      { id: 11009, name: 'E. Riis', position: 'DEL', rating: 76, potential: 78, age: 26, value: 5500000, wage: 28000, morale: 'Normal', contractYears: 2 },
      { id: 11010, name: 'W. Keane', position: 'DEL', rating: 75, potential: 75, age: 31, value: 3000000, wage: 25000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 116, name: 'Millwall', logo: createTeamLogo(TEAM_LOGOS['Millwall'], 'Millwall'), leagueId: LeagueId.CHAMPIONSHIP, budget: 12000000, transferBudget: 2500000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#001F5B', secondaryColor: '#FFFFFF',
    squad: [
      { id: 11601, name: 'L. Jensen', position: 'POR', rating: 75, potential: 78, age: 25, value: 3500000, wage: 20000, morale: 'Normal', contractYears: 3 },
      { id: 11602, name: 'J. Cooper', position: 'DEF', rating: 76, potential: 76, age: 29, value: 4500000, wage: 25000, morale: 'Contento', contractYears: 2 },
      { id: 11603, name: 'J. Tanganga', position: 'DEF', rating: 76, potential: 79, age: 25, value: 6000000, wage: 30000, morale: 'Feliz', contractYears: 3 },
      { id: 11604, name: 'R. Leonard', position: 'DEF', rating: 74, potential: 74, age: 32, value: 1500000, wage: 18000, morale: 'Normal', contractYears: 1 },
      { id: 11605, name: 'J. Bryan', position: 'DEF', rating: 75, potential: 75, age: 30, value: 2500000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11606, name: 'G. Saville', position: 'CEN', rating: 75, potential: 75, age: 31, value: 2500000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 11607, name: 'C. De Norre', position: 'CEN', rating: 76, potential: 78, age: 27, value: 4500000, wage: 24000, morale: 'Contento', contractYears: 3 },
      { id: 11608, name: 'R. Esse', position: 'DEL', rating: 75, potential: 85, age: 19, value: 7000000, wage: 18000, morale: 'Feliz', contractYears: 4 },
      { id: 11609, name: 'D. Watmore', position: 'DEL', rating: 76, potential: 76, age: 30, value: 3500000, wage: 25000, morale: 'Contento', contractYears: 2 },
      { id: 11610, name: 'M. Ivanovic', position: 'DEL', rating: 75, potential: 81, age: 20, value: 5000000, wage: 18000, morale: 'Feliz', contractYears: 4 },
      { id: 11611, name: 'T. Bradshaw', position: 'DEL', rating: 74, potential: 74, age: 32, value: 1800000, wage: 20000, morale: 'Normal', contractYears: 1 }
    ]
  },
  {
    id: 120, name: 'Sheffield Wed', logo: createTeamLogo(TEAM_LOGOS['Sheffield Wed'], 'Sheffield Wed'), leagueId: LeagueId.CHAMPIONSHIP, budget: 14000000, transferBudget: 3000000, tier: 'Lower', teamMorale: 'Normal',
    primaryColor: '#0E00F7', secondaryColor: '#FFFFFF',
    squad: [
      { id: 12001, name: 'J. Beadle', position: 'POR', rating: 76, potential: 83, age: 20, value: 5500000, wage: 20000, morale: 'Feliz', contractYears: 4 },
      { id: 12002, name: 'D. Iorfa', position: 'DEF', rating: 75, potential: 76, age: 29, value: 3000000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 12003, name: 'A. Famewo', position: 'DEF', rating: 75, potential: 77, age: 25, value: 3500000, wage: 20000, morale: 'Normal', contractYears: 3 },
      { id: 12004, name: 'M. Lowe', position: 'DEF', rating: 75, potential: 76, age: 27, value: 3500000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 12005, name: 'Y. Valery', position: 'DEF', rating: 75, potential: 77, age: 25, value: 3500000, wage: 22000, morale: 'Normal', contractYears: 3 },
      { id: 12006, name: 'B. Bannan', position: 'CEN', rating: 77, potential: 77, age: 34, value: 3000000, wage: 35000, morale: 'Feliz', contractYears: 2 },
      { id: 12007, name: 'S. Charles', position: 'CEN', rating: 75, potential: 82, age: 20, value: 5500000, wage: 18000, morale: 'Feliz', contractYears: 4 },
      { id: 12008, name: 'J. Windass', position: 'DEL', rating: 76, potential: 76, age: 30, value: 4500000, wage: 28000, morale: 'Contento', contractYears: 2 },
      { id: 12009, name: 'A. Musaba', position: 'DEL', rating: 76, potential: 80, age: 23, value: 5500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
      { id: 12010, name: 'D. Gassama', position: 'DEL', rating: 75, potential: 81, age: 21, value: 5000000, wage: 20000, morale: 'Contento', contractYears: 4 },
      { id: 12011, name: 'J. Ugbo', position: 'DEL', rating: 76, potential: 78, age: 25, value: 5000000, wage: 26000, morale: 'Normal', contractYears: 3 }
    ]
  },
  {
    id: 122, name: 'Portsmouth', logo: createTeamLogo(TEAM_LOGOS['Portsmouth'], 'Portsmouth'), leagueId: LeagueId.CHAMPIONSHIP, budget: 12000000, transferBudget: 2500000, tier: 'Lower', teamMorale: 'Feliz',
    primaryColor: '#001489', secondaryColor: '#FFFFFF',
    squad: [
      { id: 12201, name: 'W. Norris', position: 'POR', rating: 75, potential: 75, age: 31, value: 2500000, wage: 18000, morale: 'Normal', contractYears: 2 },
      { id: 12202, name: 'R. Poole', position: 'DEF', rating: 75, potential: 77, age: 26, value: 3500000, wage: 20000, morale: 'Normal', contractYears: 2 },
      { id: 12203, name: 'C. Shaughnessy', position: 'DEF', rating: 75, potential: 76, age: 28, value: 3000000, wage: 18000, morale: 'Contento', contractYears: 2 },
      { id: 12204, name: 'J. Ogilvie', position: 'DEF', rating: 75, potential: 75, age: 28, value: 3000000, wage: 18000, morale: 'Normal', contractYears: 2 },
      { id: 12205, name: 'J. Pack', position: 'CEN', rating: 76, potential: 76, age: 33, value: 2000000, wage: 25000, morale: 'Feliz', contractYears: 1 },
      { id: 12206, name: 'F. Potts', position: 'CEN', rating: 75, potential: 82, age: 20, value: 5000000, wage: 18000, morale: 'Feliz', contractYears: 4 },
      { id: 12207, name: 'C. Lang', position: 'DEL', rating: 76, potential: 78, age: 25, value: 4500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
      { id: 12208, name: 'P. Lane', position: 'DEL', rating: 75, potential: 78, age: 23, value: 4000000, wage: 18000, morale: 'Contento', contractYears: 3 },
      { id: 12209, name: 'J. Murphy', position: 'DEL', rating: 75, potential: 76, age: 29, value: 3000000, wage: 20000, morale: 'Normal', contractYears: 2 },
      { id: 12210, name: 'M. O\'Mahony', position: 'DEL', rating: 74, potential: 81, age: 19, value: 3500000, wage: 14000, morale: 'Normal', contractYears: 3 },
      { id: 12211, name: 'C. Saydee', position: 'DEL', rating: 74, potential: 77, age: 22, value: 2500000, wage: 15000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 123, name: 'Derby County', logo: createTeamLogo(TEAM_LOGOS['Derby County'], 'Derby County'), leagueId: LeagueId.CHAMPIONSHIP, budget: 13000000, transferBudget: 2800000, tier: 'Lower', teamMorale: 'Feliz',
    primaryColor: '#FFFFFF', secondaryColor: '#000000',
    squad: [
      { id: 12301, name: 'J. Widell Zetterström', position: 'POR', rating: 76, potential: 80, age: 26, value: 4500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
      { id: 12302, name: 'E. Cashin', position: 'DEF', rating: 77, potential: 82, age: 22, value: 7500000, wage: 28000, morale: 'Feliz', contractYears: 4 },
      { id: 12303, name: 'C. Nelson', position: 'DEF', rating: 75, potential: 76, age: 31, value: 2500000, wage: 22000, morale: 'Normal', contractYears: 2 },
      { id: 12304, name: 'C. Elder', position: 'DEF', rating: 74, potential: 74, age: 29, value: 2000000, wage: 18000, morale: 'Normal', contractYears: 2 },
      { id: 12305, name: 'K. Wilson', position: 'DEF', rating: 74, potential: 77, age: 24, value: 2500000, wage: 16000, morale: 'Normal', contractYears: 3 },
      { id: 12306, name: 'E. Adams', position: 'CEN', rating: 76, potential: 78, age: 28, value: 4500000, wage: 25000, morale: 'Contento', contractYears: 3 },
      { id: 12307, name: 'K. Goudmijn', position: 'CEN', rating: 76, potential: 81, age: 22, value: 5500000, wage: 22000, morale: 'Feliz', contractYears: 4 },
      { id: 12308, name: 'D. Ozoh', position: 'CEN', rating: 75, potential: 84, age: 19, value: 6000000, wage: 18000, morale: 'Feliz', contractYears: 4 },
      { id: 12309, name: 'N. Mendez-Laing', position: 'DEL', rating: 76, potential: 76, age: 32, value: 3000000, wage: 25000, morale: 'Feliz', contractYears: 2 },
      { id: 12310, name: 'K. Jackson', position: 'DEL', rating: 75, potential: 75, age: 30, value: 2500000, wage: 20000, morale: 'Normal', contractYears: 2 },
      { id: 12311, name: 'J. Yates', position: 'DEL', rating: 75, potential: 77, age: 27, value: 3500000, wage: 22000, morale: 'Contento', contractYears: 3 }
    ]
  },
  {
    id: 121, name: 'Plymouth', logo: createTeamLogo(TEAM_LOGOS['Plymouth'], 'Plymouth'), leagueId: LeagueId.CHAMPIONSHIP, budget: 11000000, transferBudget: 2200000, tier: 'Lower', teamMorale: 'Contento',
    primaryColor: '#1B4835', secondaryColor: '#FFFFFF',
    squad: [
      { id: 12101, name: 'D. Grimshaw', position: 'POR', rating: 75, potential: 77, age: 26, value: 3500000, wage: 18000, morale: 'Normal', contractYears: 3 },
      { id: 12102, name: 'L. Gibson', position: 'DEF', rating: 75, potential: 77, age: 24, value: 3500000, wage: 18000, morale: 'Normal', contractYears: 3 },
      { id: 12103, name: 'K. Szűcs', position: 'DEF', rating: 75, potential: 79, age: 23, value: 4000000, wage: 18000, morale: 'Contento', contractYears: 4 },
      { id: 12104, name: 'B. Mumba', position: 'DEF', rating: 76, potential: 80, age: 22, value: 5500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
      { id: 12105, name: 'A. Randell', position: 'CEN', rating: 76, potential: 79, age: 23, value: 5000000, wage: 20000, morale: 'Feliz', contractYears: 3 },
      { id: 12106, name: 'D. Gyabi', position: 'CEN', rating: 75, potential: 82, age: 20, value: 4500000, wage: 16000, morale: 'Contento', contractYears: 3 },
      { id: 12107, name: 'M. Whittaker', position: 'DEL', rating: 78, potential: 83, age: 23, value: 11000000, wage: 30000, morale: 'Feliz', contractYears: 4 },
      { id: 12108, name: 'I. Cissoko', position: 'DEL', rating: 76, potential: 82, age: 21, value: 6500000, wage: 20000, morale: 'Feliz', contractYears: 3 },
      { id: 12109, name: 'R. Hardie', position: 'DEL', rating: 76, potential: 77, age: 27, value: 4500000, wage: 24000, morale: 'Contento', contractYears: 2 },
      { id: 12110, name: 'M. Obafemi', position: 'DEL', rating: 75, potential: 78, age: 24, value: 4000000, wage: 22000, morale: 'Normal', contractYears: 2 }
    ]
  },
  {
    id: 124, name: 'Oxford United', logo: createTeamLogo(TEAM_LOGOS['Oxford United'], 'Oxford United'), leagueId: LeagueId.CHAMPIONSHIP, budget: 11000000, transferBudget: 2200000, tier: 'Lower', teamMorale: 'Feliz',
    primaryColor: '#F3A530', secondaryColor: '#002F5F',
    squad: [
      { id: 12401, name: 'J. Cumming', position: 'POR', rating: 75, potential: 78, age: 24, value: 3500000, wage: 18000, morale: 'Contento', contractYears: 3 },
      { id: 12402, name: 'E. Moore', position: 'DEF', rating: 75, potential: 76, age: 27, value: 3500000, wage: 18000, morale: 'Contento', contractYears: 3 },
      { id: 12403, name: 'C. Brown', position: 'DEF', rating: 74, potential: 76, age: 26, value: 2500000, wage: 16000, morale: 'Normal', contractYears: 2 },
      { id: 12404, name: 'P. Kioso', position: 'DEF', rating: 74, potential: 76, age: 25, value: 2500000, wage: 16000, morale: 'Normal', contractYears: 3 },
      { id: 12405, name: 'W. Vaulks', position: 'CEN', rating: 76, potential: 76, age: 30, value: 3500000, wage: 24000, morale: 'Feliz', contractYears: 2 },
      { id: 12406, name: 'C. Brannagan', position: 'CEN', rating: 77, potential: 78, age: 28, value: 5500000, wage: 28000, morale: 'Feliz', contractYears: 3 },
      { id: 12407, name: 'I. Sibley', position: 'CEN', rating: 75, potential: 79, age: 22, value: 4000000, wage: 18000, morale: 'Contento', contractYears: 4 },
      { id: 12408, name: 'T. Goodrham', position: 'DEL', rating: 76, potential: 82, age: 21, value: 5500000, wage: 18000, morale: 'Feliz', contractYears: 4 },
      { id: 12409, name: 'P. Płacheta', position: 'DEL', rating: 75, potential: 76, age: 26, value: 3000000, wage: 20000, morale: 'Normal', contractYears: 2 },
      { id: 12410, name: 'M. Harris', position: 'DEL', rating: 76, potential: 78, age: 25, value: 4500000, wage: 22000, morale: 'Feliz', contractYears: 3 },
      { id: 12411, name: 'D. Scarlett', position: 'DEL', rating: 75, potential: 83, age: 20, value: 5000000, wage: 20000, morale: 'Contento', contractYears: 3 }
    ]
  }
];
