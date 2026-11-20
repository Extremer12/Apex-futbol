import { Player } from '../../types';

export const getTeamInitials = (name?: string): string => {
  if (!name) return 'FC';
  const clean = name.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'FC';
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
};

export const createTeamLogo = (logoPath: string, _teamName: string) => {
  return logoPath;
};

export const TEAM_LOGOS = {
  'Arsenal': '/logos/Arsenal FC.png',
  'Aston Villa': '/logos/Aston Villa FC.png',
  'AFC Bournemouth': '/logos/AFC Bournemouth.png',
  'Brentford': '/logos/Brentford FC 512x.png',
  'Brighton': '/logos/Brighton Hove Albion.png',
  'Chelsea': '/logos/Chelsea FC.png',
  'Crystal Palace': '/logos/Crystal Palace FC.png',
  'Everton': '/logos/Everton FC.png',
  'Fulham': '/logos/Fulham FC.png',
  'Ipswich Town': '/logos/Ipswich Town FC.png',
  'Leicester City': 'https://tmssl.akamaized.net/images/wappen/head/1003.png',
  'Liverpool': '/logos/Liverpool FC.png',
  'Manchester City': '/logos/Manchester City FC.png',
  'Manchester United': 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Premier%20League/england_manchester-united.football-logos.cc.svg',
  'Manchester Utd': 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Premier%20League/england_manchester-united.football-logos.cc.svg',
  'Newcastle United': '/logos/Newcastle United FC.png',
  'Nottingham Forest': '/logos/Nottingham Forest FC.png',
  'Southampton': '/logos/Southampton FC.png',
  'Tottenham': '/logos/Tottenham Hotspur FC.png',
  'West Ham': '/logos/West Ham United FC.png',
  'Wolverhampton': '/logos/Wolverhampton Wanderers FC.png',
  // Championship
  'Leeds United': '/logos/Leeds United FC.png',
  'Burnley': '/logos/Burnley FC.png',
  'Luton Town': '/logos/Luton Town FC.png',
  'Sheffield Utd': '/logos/Sheffield United FC.png',
  'West Brom': '/logos/West Bromwich Albion FC.png',
  'Norwich City': '/logos/Norwich City FC.png',
  'Hull City': '/logos/Hull City FC.png',
  'Coventry City': '/logos/Coventry City FC.png',
  'Middlesbrough': '/logos/Middlesbrough FC.png',
  'Preston': '/logos/Preston North End FC.png',
  'Cardiff City': '/logos/Cardiff City FC.png',
  'Bristol City': '/logos/Bristol City FC.png',
  'Sunderland': '/logos/Sunderland AFC.png',
  'Swansea City': '/logos/Swansea City AFC.png',
  'Watford': '/logos/Watford FC.png',
  'Millwall': '/logos/Millwall FC.png',
  'QPR': '/logos/Queens Park Rangers FC.png',
  'Stoke City': '/logos/Stoke City FC.png',
  'Blackburn': '/logos/Blackburn Rovers FC.png',
  'Sheffield Wed': '/logos/Sheffield Wednesday FC.PNG',
  'Plymouth': '/logos/Plymouth Argyle FC.png',
  'Portsmouth': '/logos/Portsmouth FC.png',
  'Derby County': '/logos/Derby County FC.png',
  'Oxford United': '/logos/Oxford United FC.png',
  // La Liga
  'Real Madrid': 'https://tmssl.akamaized.net/images/wappen/head/418.png',
  'FC Barcelona': 'https://tmssl.akamaized.net/images/wappen/head/131.png',
  'Atletico Madrid': 'https://tmssl.akamaized.net/images/wappen/head/13.png',
  'Athletic Club': 'https://tmssl.akamaized.net/images/wappen/head/621.png',
  'Real Sociedad': 'https://tmssl.akamaized.net/images/wappen/head/681.png',
  'Real Betis': 'https://tmssl.akamaized.net/images/wappen/head/150.png',
  'Girona FC': 'https://tmssl.akamaized.net/images/wappen/head/12321.png',
  'Villarreal CF': 'https://tmssl.akamaized.net/images/wappen/head/1050.png',
  'Valencia CF': 'https://tmssl.akamaized.net/images/wappen/head/1049.png',
  'Sevilla FC': 'https://tmssl.akamaized.net/images/wappen/head/368.png',
  'Celta Vigo': 'https://tmssl.akamaized.net/images/wappen/head/940.png',
  'Osasuna': 'https://tmssl.akamaized.net/images/wappen/head/331.png',
  'Getafe CF': 'https://tmssl.akamaized.net/images/wappen/head/3709.png',
  'Mallorca': 'https://tmssl.akamaized.net/images/wappen/head/237.png',
  'Rayo Vallecano': 'https://tmssl.akamaized.net/images/wappen/head/367.png',
  'Las Palmas': 'https://tmssl.akamaized.net/images/wappen/head/472.png',
  'Alavés': 'https://tmssl.akamaized.net/images/wappen/head/1108.png',
  'Leganés': 'https://tmssl.akamaized.net/images/wappen/head/1244.png',
  'Valladolid': 'https://tmssl.akamaized.net/images/wappen/head/366.png',
  'Espanyol': 'https://tmssl.akamaized.net/images/wappen/head/714.png',
};

const FIRST_NAMES = [
  'Lucas', 'Mateo', 'Martín', 'Santiago', 'Nicolás', 'Joaquín', 'Tomás', 'Agustín', 'Benjamín', 'Felipe',
  'Enzo', 'Lautaro', 'Franco', 'Julian', 'Ignacio', 'Facundo', 'Rodrigo', 'Thiago', 'Matías', 'Gabriel',
  'Ezequiel', 'Diego', 'Gonzalo', 'Bruno', 'Maximiliano', 'Nahuel', 'Federico', 'Leandro', 'Alexis', 'Alan',
  'Cristian', 'Esteban', 'Álvaro', 'Marcos', 'Sebastián', 'Pablo', 'Manuel', 'Fernando', 'Guillermo', 'Javier'
];

const LAST_NAMES = [
  'Fernández', 'Rodríguez', 'González', 'Gómez', 'López', 'Díaz', 'Martínez', 'Pérez', 'García', 'Sánchez',
  'Romero', 'Sosa', 'Álvarez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Benítez', 'Acosta', 'Medina',
  'Herrera', 'Aguirre', 'Pereyra', 'Gutiérrez', 'Giménez', 'Molina', 'Silva', 'Castro', 'Rojas', 'Ortiz',
  'Nuñez', 'Luna', 'Juárez', 'Cabrera', 'Ríos', 'Morales', 'Godoy', 'Moreno', 'Ferreyra', 'Domínguez'
];

export function createGenericSquad(
  startId: number,
  _teamName: string,
  avgRating: number = 70,
  _primaryColor?: string,
  _secondaryColor?: string
): Player[] {
  const positions: { pos: 'POR' | 'DEF' | 'CEN' | 'DEL', count: number }[] = [
    { pos: 'POR', count: 2 },
    { pos: 'DEF', count: 6 },
    { pos: 'CEN', count: 6 },
    { pos: 'DEL', count: 4 }
  ];

  const squad: Player[] = [];
  let idCounter = startId;

  positions.forEach(({ pos, count }) => {
    for (let i = 0; i < count; i++) {
      const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const rating = Math.max(55, Math.min(88, Math.floor(avgRating - 4 + Math.random() * 9)));
      const value = Math.max(500000, Math.floor((rating - 55) * 450000 + Math.random() * 500000));
      const wage = Math.max(3000, Math.floor((rating - 55) * 800 + Math.random() * 2000));

      squad.push({
        id: idCounter++,
        name: `${first[0]}. ${last}`,
        position: pos,
        rating,
        value,
        wage,
        morale: 'Normal',
        contractYears: Math.floor(1 + Math.random() * 3),
        age: Math.floor(18 + Math.random() * 15)
      });
    }
  });

  return squad;
}
