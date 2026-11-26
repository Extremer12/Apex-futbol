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

export const createTeamLogo = (_logoPath: string, _teamName: string) => {
  return '';
};

// Base APK mode keeps team logos blank; real crests load opt-in via Community Packs.
export const TEAM_LOGOS: Record<string, string> = {};

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
