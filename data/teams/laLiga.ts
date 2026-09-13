import { Team, LeagueId } from '../../types';
import { createTeamLogo, TEAM_LOGOS, createGenericSquad } from './helpers';

export const laLigaTeams: Team[] = [
  {
    id: 201, name: 'Real Madrid', logo: createTeamLogo(TEAM_LOGOS['Real Madrid'], 'Real Madrid'), leagueId: LeagueId.LA_LIGA, budget: 800, transferBudget: 200, tier: 'Top', teamMorale: 'Feliz',
    primaryColor: '#FFFFFF', secondaryColor: '#FEBE10',
    squad: [
      { id: 20101, name: 'V. Junior', position: 'DEL', rating: 91, value: 180, wage: 380000, morale: 'Feliz', contractYears: 5 },
      { id: 20102, name: 'J. Bellingham', position: 'CEN', rating: 90, value: 180, wage: 320000, morale: 'Feliz', contractYears: 5 },
      { id: 20103, name: 'K. Mbappé', position: 'DEL', rating: 92, value: 180, wage: 500000, morale: 'Feliz', contractYears: 5 },
      { id: 20104, name: 'F. Valverde', position: 'CEN', rating: 89, value: 130, wage: 250000, morale: 'Feliz', contractYears: 5 },
      { id: 20105, name: 'Rodrygo', position: 'DEL', rating: 86, value: 100, wage: 200000, morale: 'Contento', contractYears: 4 },
      { id: 20106, name: 'E. Camavinga', position: 'CEN', rating: 86, value: 95, wage: 170000, morale: 'Feliz', contractYears: 5 },
      { id: 20107, name: 'A. Tchouaméni', position: 'CEN', rating: 86, value: 90, wage: 180000, morale: 'Contento', contractYears: 4 },
      { id: 20108, name: 'E. Militao', position: 'DEF', rating: 86, value: 70, wage: 170000, morale: 'Contento', contractYears: 4 },
      { id: 20109, name: 'A. Rüdiger', position: 'DEF', rating: 87, value: 45, wage: 220000, morale: 'Contento', contractYears: 2 },
      { id: 20110, name: 'D. Carvajal', position: 'DEF', rating: 85, value: 20, wage: 180000, morale: 'Feliz', contractYears: 2 },
      { id: 20111, name: 'F. Mendy', position: 'DEF', rating: 83, value: 35, wage: 150000, morale: 'Normal', contractYears: 3 },
      { id: 20112, name: 'T. Courtois', position: 'POR', rating: 89, value: 50, wage: 260000, morale: 'Feliz', contractYears: 3 },
      { id: 20113, name: 'L. Modric', position: 'CEN', rating: 83, age: 39, value: 8, wage: 150000, morale: 'Feliz', contractYears: 1 },
      { id: 20114, name: 'Brahim', position: 'DEL', rating: 82, value: 45, wage: 110000, morale: 'Contento', contractYears: 3 },
      { id: 20115, name: 'A. Lunin', position: 'POR', rating: 81, value: 25, wage: 70000, morale: 'Contento', contractYears: 4 },
      { id: 20116, name: 'Endrick', position: 'DEL', rating: 80, age: 18, value: 60, wage: 80000, morale: 'Feliz', contractYears: 5 },
      { id: 20117, name: 'A. Güler', position: 'CEN', rating: 80, age: 19, value: 50, wage: 75000, morale: 'Feliz', contractYears: 5 },
      { id: 20118, name: 'Lucas Vázquez', position: 'DEF', rating: 80, age: 33, value: 8, wage: 110000, morale: 'Feliz', contractYears: 1 }
    ]
  },
  {
    id: 202, name: 'FC Barcelona', logo: createTeamLogo(TEAM_LOGOS['FC Barcelona'], 'FC Barcelona'), leagueId: LeagueId.LA_LIGA, budget: 200, transferBudget: 50, tier: 'Top', teamMorale: 'Feliz',
    primaryColor: '#A50044', secondaryColor: '#004D98',
    squad: [
      { id: 20201, name: 'R. Lewandowski', position: 'DEL', rating: 89, age: 36, value: 30, wage: 320000, morale: 'Feliz', contractYears: 2 },
      { id: 20202, name: 'Pedri', position: 'CEN', rating: 88, age: 22, value: 120, wage: 200000, morale: 'Feliz', contractYears: 4 },
      { id: 20203, name: 'Gavi', position: 'CEN', rating: 85, age: 20, value: 90, wage: 140000, morale: 'Feliz', contractYears: 4 },
      { id: 20204, name: 'F. de Jong', position: 'CEN', rating: 86, age: 27, value: 70, wage: 350000, morale: 'Normal', contractYears: 2 },
      { id: 20205, name: 'R. Araujo', position: 'DEF', rating: 86, age: 25, value: 75, wage: 160000, morale: 'Contento', contractYears: 3 },
      { id: 20206, name: 'J. Koundé', position: 'DEF', rating: 86, age: 26, value: 70, wage: 200000, morale: 'Feliz', contractYears: 3 },
      { id: 20207, name: 'L. Yamal', position: 'DEL', rating: 87, age: 17, value: 150, wage: 100000, morale: 'Feliz', contractYears: 5 },
      { id: 20208, name: 'Raphinha', position: 'DEL', rating: 87, age: 27, value: 80, wage: 220000, morale: 'Feliz', contractYears: 3 },
      { id: 20209, name: 'D. Olmo', position: 'CEN', rating: 85, age: 26, value: 65, wage: 170000, morale: 'Feliz', contractYears: 5 },
      { id: 20210, name: 'A. Balde', position: 'DEF', rating: 82, age: 21, value: 50, wage: 85000, morale: 'Contento', contractYears: 4 },
      { id: 20211, name: 'P. Cubarsí', position: 'DEF', rating: 81, age: 18, value: 45, wage: 35000, morale: 'Feliz', contractYears: 5 },
      { id: 20212, name: 'M. ter Stegen', position: 'POR', rating: 88, age: 32, value: 35, wage: 250000, morale: 'Normal', contractYears: 3 },
      { id: 20213, name: 'F. Torres', position: 'DEL', rating: 81, age: 24, value: 35, wage: 120000, morale: 'Normal', contractYears: 3 },
      { id: 20214, name: 'A. Christensen', position: 'DEF', rating: 82, age: 28, value: 35, wage: 160000, morale: 'Contento', contractYears: 2 },
      { id: 20215, name: 'M. Casadó', position: 'CEN', rating: 80, age: 21, value: 30, wage: 40000, morale: 'Feliz', contractYears: 4 },
      { id: 20216, name: 'F. López', position: 'CEN', rating: 81, age: 21, value: 40, wage: 45000, morale: 'Feliz', contractYears: 4 },
      { id: 20217, name: 'Iñigo Martínez', position: 'DEF', rating: 82, age: 33, value: 10, wage: 130000, morale: 'Feliz', contractYears: 1 }
    ]
  },
  {
    id: 203, name: 'Atlético Madrid', logo: createTeamLogo(TEAM_LOGOS['Atletico Madrid'], 'Atletico Madrid'), leagueId: LeagueId.LA_LIGA, budget: 150, transferBudget: 40, tier: 'Top', teamMorale: 'Contento',
    primaryColor: '#CB3524', secondaryColor: '#272E61',
    squad: [
      { id: 20301, name: 'A. Griezmann', position: 'DEL', rating: 88, age: 33, value: 45, wage: 260000, morale: 'Feliz', contractYears: 2 },
      { id: 20302, name: 'J. Oblak', position: 'POR', rating: 87, age: 31, value: 40, wage: 240000, morale: 'Contento', contractYears: 3 },
      { id: 20303, name: 'J. Álvarez', position: 'DEL', rating: 86, age: 24, value: 95, wage: 200000, morale: 'Feliz', contractYears: 5 },
      { id: 20304, name: 'R. De Paul', position: 'CEN', rating: 84, age: 30, value: 35, wage: 150000, morale: 'Contento', contractYears: 3 },
      { id: 20305, name: 'Koke', position: 'CEN', rating: 82, age: 32, value: 18, wage: 160000, morale: 'Feliz', contractYears: 2 },
      { id: 20306, name: 'C. Gallagher', position: 'CEN', rating: 83, age: 24, value: 50, wage: 130000, morale: 'Feliz', contractYears: 5 },
      { id: 20307, name: 'M. Llorente', position: 'CEN', rating: 83, age: 29, value: 35, wage: 140000, morale: 'Contento', contractYears: 3 },
      { id: 20308, name: 'R. Le Normand', position: 'DEF', rating: 83, age: 27, value: 40, wage: 120000, morale: 'Feliz', contractYears: 4 },
      { id: 20309, name: 'J. Giménez', position: 'DEF', rating: 83, age: 29, value: 30, wage: 130000, morale: 'Normal', contractYears: 3 },
      { id: 20310, name: 'N. Molina', position: 'DEF', rating: 81, age: 26, value: 30, wage: 90000, morale: 'Contento', contractYears: 4 },
      { id: 20311, name: 'S. Lino', position: 'DEL', rating: 82, age: 24, value: 40, wage: 70000, morale: 'Contento', contractYears: 4 },
      { id: 20312, name: 'A. Sørloth', position: 'DEL', rating: 83, age: 28, value: 35, wage: 130000, morale: 'Contento', contractYears: 4 },
      { id: 20313, name: 'A. Correa', position: 'DEL', rating: 81, age: 29, value: 20, wage: 100000, morale: 'Contento', contractYears: 2 },
      { id: 20314, name: 'P. Barrios', position: 'CEN', rating: 80, age: 21, value: 35, wage: 55000, morale: 'Feliz', contractYears: 4 },
      { id: 20315, name: 'R. Riquelme', position: 'DEL', rating: 80, age: 24, value: 30, wage: 55000, morale: 'Contento', contractYears: 4 },
      { id: 20316, name: 'A. Witsel', position: 'DEF', rating: 80, age: 35, value: 6, wage: 90000, morale: 'Normal', contractYears: 1 }
    ]
  },
  {
    id: 204, name: 'Athletic Club', logo: createTeamLogo(TEAM_LOGOS['Athletic Club'], 'Athletic Club'), leagueId: LeagueId.LA_LIGA, budget: 80, transferBudget: 30, tier: 'Mid', teamMorale: 'Feliz',
    primaryColor: '#EE2523', secondaryColor: '#FFFFFF',
    squad: [
      { id: 20401, name: 'Unai Simón', position: 'POR', rating: 86, age: 27, value: 40, wage: 120000, morale: 'Feliz', contractYears: 4 },
      { id: 20402, name: 'J. Agirrezabala', position: 'POR', rating: 79, age: 23, value: 15, wage: 45000, morale: 'Contento', contractYears: 3 },
      { id: 20403, name: 'D. Vivian', position: 'DEF', rating: 82, age: 25, value: 35, wage: 75000, morale: 'Feliz', contractYears: 5 },
      { id: 20404, name: 'Yeray', position: 'DEF', rating: 80, age: 29, value: 15, wage: 70000, morale: 'Normal', contractYears: 2 },
      { id: 20405, name: 'Yuri Berchiche', position: 'DEF', rating: 80, age: 34, value: 8, wage: 80000, morale: 'Normal', contractYears: 1 },
      { id: 20406, name: 'Ó. De Marcos', position: 'DEF', rating: 79, age: 35, value: 5, wage: 70000, morale: 'Feliz', contractYears: 1 },
      { id: 20407, name: 'I. Ruiz de Galarreta', position: 'CEN', rating: 80, age: 31, value: 10, wage: 65000, morale: 'Contento', contractYears: 2 },
      { id: 20408, name: 'Beñat Prados', position: 'CEN', rating: 80, age: 23, value: 20, wage: 50000, morale: 'Feliz', contractYears: 4 },
      { id: 20409, name: 'O. Sancet', position: 'CEN', rating: 83, age: 24, value: 45, wage: 95000, morale: 'Feliz', contractYears: 6 },
      { id: 20410, name: 'Nico Williams', position: 'DEL', rating: 86, age: 22, value: 85, wage: 150000, morale: 'Feliz', contractYears: 4 },
      { id: 20411, name: 'Iñaki Williams', position: 'DEL', rating: 83, age: 30, value: 30, wage: 140000, morale: 'Feliz', contractYears: 3 },
      { id: 20412, name: 'G. Guruzeta', position: 'DEL', rating: 81, age: 28, value: 22, wage: 70000, morale: 'Contento', contractYears: 3 },
      { id: 20413, name: 'Á. Berenguer', position: 'DEL', rating: 80, age: 29, value: 16, wage: 65000, morale: 'Contento', contractYears: 3 }
    ]
  },
  {
    id: 205, name: 'Real Sociedad', logo: createTeamLogo(TEAM_LOGOS['Real Sociedad'], 'Real Sociedad'), leagueId: LeagueId.LA_LIGA, budget: 70, transferBudget: 25, tier: 'Mid', teamMorale: 'Contento',
    primaryColor: '#0067B1', secondaryColor: '#FFFFFF',
    squad: [
      { id: 20501, name: 'Á. Remiro', position: 'POR', rating: 84, age: 29, value: 25, wage: 85000, morale: 'Feliz', contractYears: 3 },
      { id: 20502, name: 'I. Zubeldia', position: 'DEF', rating: 81, age: 27, value: 22, wage: 70000, morale: 'Contento', contractYears: 3 },
      { id: 20503, name: 'N. Aguerd', position: 'DEF', rating: 81, age: 28, value: 25, wage: 80000, morale: 'Contento', contractYears: 3 },
      { id: 20504, name: 'J. Aramburu', position: 'DEF', rating: 78, age: 22, value: 12, wage: 35000, morale: 'Feliz', contractYears: 4 },
      { id: 20505, name: 'Javi López', position: 'DEF', rating: 78, age: 22, value: 14, wage: 40000, morale: 'Contento', contractYears: 4 },
      { id: 20506, name: 'M. Zubimendi', position: 'CEN', rating: 85, age: 25, value: 65, wage: 120000, morale: 'Feliz', contractYears: 4 },
      { id: 20507, name: 'L. Sučić', position: 'CEN', rating: 80, age: 21, value: 22, wage: 55000, morale: 'Feliz', contractYears: 4 },
      { id: 20508, name: 'Brais Méndez', position: 'CEN', rating: 82, age: 27, value: 30, wage: 85000, morale: 'Contento', contractYears: 3 },
      { id: 20509, name: 'T. Kubo', position: 'DEL', rating: 83, age: 23, value: 50, wage: 95000, morale: 'Feliz', contractYears: 4 },
      { id: 20510, name: 'M. Oyarzabal', position: 'DEL', rating: 84, age: 27, value: 45, wage: 120000, morale: 'Feliz', contractYears: 4 },
      { id: 20511, name: 'A. Barrenetxea', position: 'DEL', rating: 80, age: 22, value: 25, wage: 60000, morale: 'Contento', contractYears: 4 },
      { id: 20512, name: 'O. Óskarsson', position: 'DEL', rating: 78, age: 20, value: 20, wage: 45000, morale: 'Contento', contractYears: 5 }
    ]
  },
  {
    id: 206, name: 'Real Betis', logo: createTeamLogo(TEAM_LOGOS['Real Betis'], 'Real Betis'), leagueId: LeagueId.LA_LIGA, budget: 60, transferBudget: 15, tier: 'Mid', teamMorale: 'Contento',
    primaryColor: '#00954C', secondaryColor: '#FFFFFF',
    squad: [
      { id: 20601, name: 'Rui Silva', position: 'POR', rating: 81, age: 30, value: 12, wage: 65000, morale: 'Contento', contractYears: 2 },
      { id: 20602, name: 'Marc Bartra', position: 'DEF', rating: 79, age: 33, value: 6, wage: 60000, morale: 'Normal', contractYears: 1 },
      { id: 20603, name: 'Diego Llorente', position: 'DEF', rating: 80, age: 31, value: 10, wage: 75000, morale: 'Contento', contractYears: 3 },
      { id: 20604, name: 'H. Bellerín', position: 'DEF', rating: 78, age: 29, value: 9, wage: 65000, morale: 'Normal', contractYears: 2 },
      { id: 20605, name: 'R. Perraud', position: 'DEF', rating: 78, age: 26, value: 10, wage: 55000, morale: 'Contento', contractYears: 3 },
      { id: 20606, name: 'Johnny Cardoso', position: 'CEN', rating: 80, age: 23, value: 22, wage: 55000, morale: 'Feliz', contractYears: 4 },
      { id: 20607, name: 'Marc Roca', position: 'CEN', rating: 79, age: 27, value: 14, wage: 65000, morale: 'Normal', contractYears: 3 },
      { id: 20608, name: 'P. Fornals', position: 'CEN', rating: 80, age: 28, value: 18, wage: 75000, morale: 'Contento', contractYears: 3 },
      { id: 20609, name: 'G. Lo Celso', position: 'CEN', rating: 83, age: 28, value: 28, wage: 110000, morale: 'Feliz', contractYears: 4 },
      { id: 20610, name: 'Isco', position: 'CEN', rating: 84, age: 32, value: 20, wage: 120000, morale: 'Feliz', contractYears: 2 },
      { id: 20611, name: 'Abde Ezzalzouli', position: 'DEL', rating: 80, age: 22, value: 22, wage: 60000, morale: 'Feliz', contractYears: 4 },
      { id: 20612, name: 'Vitor Roque', position: 'DEL', rating: 79, age: 19, value: 30, wage: 65000, morale: 'Feliz', contractYears: 2 },
      { id: 20613, name: 'Chimy Ávila', position: 'DEL', rating: 78, age: 30, value: 8, wage: 65000, morale: 'Normal', contractYears: 2 }
    ]
  },
  { id: 207, name: 'Girona FC', logo: createTeamLogo(TEAM_LOGOS['Girona FC'], 'Girona FC'), leagueId: LeagueId.LA_LIGA, budget: 50, transferBudget: 20, tier: 'Mid', teamMorale: 'Feliz', primaryColor: '#CE1126', secondaryColor: '#FFFFFF', squad: createGenericSquad(20700, 'Girona') },
  {
    id: 208, name: 'Villarreal CF', logo: createTeamLogo(TEAM_LOGOS['Villarreal CF'], 'Villarreal CF'), leagueId: LeagueId.LA_LIGA, budget: 65, transferBudget: 20, tier: 'Mid', teamMorale: 'Normal',
    primaryColor: '#FEEE00', secondaryColor: '#00519E',
    squad: [
      { id: 20801, name: 'Diego Conde', position: 'POR', rating: 80, age: 25, value: 12, wage: 50000, morale: 'Contento', contractYears: 4 },
      { id: 20802, name: 'Raúl Albiol', position: 'DEF', rating: 79, age: 39, value: 3, wage: 60000, morale: 'Normal', contractYears: 1 },
      { id: 20803, name: 'Logan Costa', position: 'DEF', rating: 80, age: 23, value: 18, wage: 55000, morale: 'Feliz', contractYears: 4 },
      { id: 20804, name: 'Sergi Cardona', position: 'DEF', rating: 79, age: 25, value: 12, wage: 50000, morale: 'Contento', contractYears: 3 },
      { id: 20805, name: 'Kiko Femenía', position: 'DEF', rating: 78, age: 33, value: 5, wage: 55000, morale: 'Normal', contractYears: 1 },
      { id: 20806, name: 'Dani Parejo', position: 'CEN', rating: 81, age: 35, value: 7, wage: 95000, morale: 'Contento', contractYears: 1 },
      { id: 20807, name: 'Santi Comesaña', position: 'CEN', rating: 80, age: 27, value: 14, wage: 65000, morale: 'Normal', contractYears: 2 },
      { id: 20808, name: 'Pape Gueye', position: 'CEN', rating: 79, age: 25, value: 15, wage: 60000, morale: 'Contento', contractYears: 3 },
      { id: 20809, name: 'Álex Baena', position: 'CEN', rating: 84, age: 23, value: 50, wage: 95000, morale: 'Feliz', contractYears: 4 },
      { id: 20810, name: 'Yeremy Pino', position: 'DEL', rating: 81, age: 21, value: 32, wage: 70000, morale: 'Contento', contractYears: 4 },
      { id: 20811, name: 'Gerard Moreno', position: 'DEL', rating: 83, age: 32, value: 16, wage: 110000, morale: 'Feliz', contractYears: 2 },
      { id: 20812, name: 'Ayoze Pérez', position: 'DEL', rating: 82, age: 31, value: 15, wage: 85000, morale: 'Feliz', contractYears: 3 },
      { id: 20813, name: 'Thierno Barry', position: 'DEL', rating: 78, age: 21, value: 16, wage: 45000, morale: 'Feliz', contractYears: 4 }
    ]
  },
  { id: 209, name: 'Valencia CF', logo: createTeamLogo(TEAM_LOGOS['Valencia CF'], 'Valencia CF'), leagueId: LeagueId.LA_LIGA, budget: 40, transferBudget: 10, tier: 'Mid', teamMorale: 'Descontento', primaryColor: '#FFFFFF', secondaryColor: '#000000', squad: createGenericSquad(20900, 'Valencia') },
  { id: 210, name: 'Sevilla FC', logo: createTeamLogo(TEAM_LOGOS['Sevilla FC'], 'Sevilla FC'), leagueId: LeagueId.LA_LIGA, budget: 55, transferBudget: 15, tier: 'Mid', teamMorale: 'Descontento', primaryColor: '#FFFFFF', secondaryColor: '#D4001F', squad: createGenericSquad(21000, 'Sevilla') },
  { id: 211, name: 'Celta Vigo', logo: createTeamLogo(TEAM_LOGOS['Celta Vigo'], 'Celta Vigo'), leagueId: LeagueId.LA_LIGA, budget: 30, transferBudget: 8, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#8AC3EE', secondaryColor: '#FFFFFF', squad: createGenericSquad(21100, 'Celta') },
  { id: 212, name: 'Osasuna', logo: createTeamLogo(TEAM_LOGOS['Osasuna'], 'Osasuna'), leagueId: LeagueId.LA_LIGA, budget: 25, transferBudget: 5, tier: 'Lower', teamMorale: 'Contento', primaryColor: '#DA291C', secondaryColor: '#002F6C', squad: createGenericSquad(21200, 'Osasuna') },
  { id: 213, name: 'Getafe CF', logo: createTeamLogo(TEAM_LOGOS['Getafe CF'], 'Getafe CF'), leagueId: LeagueId.LA_LIGA, budget: 25, transferBudget: 5, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#005999', secondaryColor: '#FFFFFF', squad: createGenericSquad(21300, 'Getafe') },
  { id: 214, name: 'Mallorca', logo: createTeamLogo(TEAM_LOGOS['Mallorca'], 'Mallorca'), leagueId: LeagueId.LA_LIGA, budget: 25, transferBudget: 5, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#E20613', secondaryColor: '#000000', squad: createGenericSquad(21400, 'Mallorca') },
  { id: 215, name: 'Rayo Vallecano', logo: createTeamLogo(TEAM_LOGOS['Rayo Vallecano'], 'Rayo Vallecano'), leagueId: LeagueId.LA_LIGA, budget: 20, transferBudget: 4, tier: 'Lower', teamMorale: 'Contento', primaryColor: '#FFFFFF', secondaryColor: '#CE1126', squad: createGenericSquad(21500, 'Rayo') },
  { id: 216, name: 'Las Palmas', logo: createTeamLogo(TEAM_LOGOS['Las Palmas'], 'Las Palmas'), leagueId: LeagueId.LA_LIGA, budget: 20, transferBudget: 4, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#FCD116', secondaryColor: '#0072CE', squad: createGenericSquad(21600, 'Las Palmas') },
  { id: 217, name: 'Alavés', logo: createTeamLogo(TEAM_LOGOS['Alavés'], 'Alavés'), leagueId: LeagueId.LA_LIGA, budget: 18, transferBudget: 3, tier: 'Lower', teamMorale: 'Normal', primaryColor: '#0058A8', secondaryColor: '#FFFFFF', squad: createGenericSquad(21700, 'Alavés') },
  { id: 218, name: 'Leganés', logo: createTeamLogo(TEAM_LOGOS['Leganés'], 'Leganés'), leagueId: LeagueId.LA_LIGA, budget: 15, transferBudget: 2, tier: 'Lower', teamMorale: 'Feliz', primaryColor: '#005DAA', secondaryColor: '#FFFFFF', squad: createGenericSquad(21800, 'Leganés') },
  { id: 219, name: 'Valladolid', logo: createTeamLogo(TEAM_LOGOS['Valladolid'], 'Valladolid'), leagueId: LeagueId.LA_LIGA, budget: 15, transferBudget: 2, tier: 'Lower', teamMorale: 'Feliz', primaryColor: '#5E278E', secondaryColor: '#FFFFFF', squad: createGenericSquad(21900, 'Valladolid') },
  { id: 220, name: 'Espanyol', logo: createTeamLogo(TEAM_LOGOS['Espanyol'], 'Espanyol'), leagueId: LeagueId.LA_LIGA, budget: 20, transferBudget: 5, tier: 'Lower', teamMorale: 'Feliz', primaryColor: '#007FC8', secondaryColor: '#FFFFFF', squad: createGenericSquad(22000, 'Espanyol') },
];
