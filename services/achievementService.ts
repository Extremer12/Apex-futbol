import { GameState, Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_trophy',
        title: 'Primer Trofeo Oficial',
        description: 'Conquista tu primer título oficial al frente del club.',
        icon: '🏆',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'cup_king',
        title: 'Rey de Copas',
        description: 'Gana cualquier copa nacional (FA Cup, Copa del Rey, DFB-Pokal, Coppa Italia o Copa Argentina).',
        icon: '👑',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'continental_glory',
        title: 'Gloria Continental',
        description: 'Conságrate campeón de la UEFA Champions League o de la Copa Libertadores.',
        icon: '⭐',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'world_champion',
        title: 'El Mejor del Planeta',
        description: 'Alza la Copa Intercontinental y corona a tu club en la cima mundial.',
        icon: '🌍',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'the_treble',
        title: 'El Triplete Soñado',
        description: 'Conquista la Liga, la Copa Nacional y el título Continental en una sola temporada.',
        icon: '⚡',
        category: 'trophies',
        isUnlocked: false
    },
    {
        id: 'tycoon',
        title: 'Magnate del Fútbol',
        description: 'Alcanza un balance financiero de más de €100M en las arcas del club.',
        icon: '💰',
        category: 'management',
        isUnlocked: false,
        progress: 0,
        maxProgress: 100
    },
    {
        id: 'stadium_expansion',
        title: 'Coliseo Moderno',
        description: 'Amplía las instalaciones o la capacidad de tu estadio.',
        icon: '🏟️',
        category: 'management',
        isUnlocked: false
    },
    {
        id: 're_election',
        title: 'Mandato Democrático',
        description: 'Gana una reelección presidencial con más del 70% de aprobación de los socios.',
        icon: '🗳️',
        category: 'management',
        isUnlocked: false
    },
    {
        id: 'wonderkid_academy',
        title: 'Fábrica de Cracks',
        description: 'Promociona al primer equipo a un canterano con potencial de clase mundial.',
        icon: '💎',
        category: 'transfers',
        isUnlocked: false
    },
    {
        id: 'galactic_signing',
        title: 'Fichaje Galáctico',
        description: 'Ficha a una estrella mundial con valoración general de 88 o superior.',
        icon: '🌟',
        category: 'transfers',
        isUnlocked: false
    },
    {
        id: 'big_sale',
        title: 'Venta Histórica',
        description: 'Vende a un futbolista de tu plantilla por más de €40M.',
        icon: '🤝',
        category: 'transfers',
        isUnlocked: false
    },
    {
        id: 'master_scout',
        title: 'Ojo Clínico',
        description: 'Completa el informe de ojeo al 100% de 5 o más futbolistas.',
        icon: '🎯',
        category: 'transfers',
        isUnlocked: false,
        progress: 0,
        maxProgress: 5
    },
    {
        id: 'clean_sheet',
        title: 'Cerrojo Defensivo',
        description: 'Gana un partido oficial manteniendo la portería a cero.',
        icon: '🛡️',
        category: 'special',
        isUnlocked: false
    },
    {
        id: 'historic_rout',
        title: 'Goleada Histórica',
        description: 'Gana un partido oficial por 4 o más goles de diferencia.',
        icon: '🔥',
        category: 'special',
        isUnlocked: false
    },
    {
        id: 'individual_glory',
        title: 'La Bota o Balón de Oro',
        description: 'Un jugador de tu plantilla gana el Balón de Oro o el Máximo Goleador de la temporada.',
        icon: '🥇',
        category: 'special',
        isUnlocked: false
    }
];

export function getInitialAchievements(): Achievement[] {
    return JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));
}

export function evaluateAchievements(gameState: GameState): {
    updatedAchievements: Achievement[];
    newlyUnlocked: Achievement[];
} {
    const currentAchievements = gameState.achievements && gameState.achievements.length > 0 
        ? [...gameState.achievements] 
        : getInitialAchievements();

    const newlyUnlocked: Achievement[] = [];
    const now = new Date().toLocaleDateString();

    const unlock = (id: string) => {
        const ach = currentAchievements.find(a => a.id === id);
        if (ach && !ach.isUnlocked) {
            ach.isUnlocked = true;
            ach.unlockedAt = now;
            newlyUnlocked.push(ach);
        }
    };

    const trophies = gameState.team.trophyCabinet || [];
    
    // 1. Trophies
    if (trophies.length > 0) {
        unlock('first_trophy');
    }

    if (trophies.some(t => t.name.toLowerCase().includes('copa') || t.name.toLowerCase().includes('cup') || t.name.toLowerCase().includes('pokal'))) {
        unlock('cup_king');
    }

    if (trophies.some(t => t.name.toLowerCase().includes('champions') || t.name.toLowerCase().includes('libertadores'))) {
        unlock('continental_glory');
    }

    if (trophies.some(t => t.name.toLowerCase().includes('intercontinental'))) {
        unlock('world_champion');
    }

    // 2. Finances (Magnate)
    const tycoonAch = currentAchievements.find(a => a.id === 'tycoon');
    if (tycoonAch) {
        tycoonAch.progress = Math.min(100, Math.max(0, Math.floor(gameState.finances.balance)));
        if (gameState.finances.balance >= 100) {
            unlock('tycoon');
        }
    }

    // 3. Scouting (Master Scout)
    const fullyScoutedCount = Object.values(gameState.scoutedPlayerIds || {}).filter(lvl => lvl >= 100).length;
    const scoutAch = currentAchievements.find(a => a.id === 'master_scout');
    if (scoutAch) {
        scoutAch.progress = Math.min(5, fullyScoutedCount);
        if (fullyScoutedCount >= 5) {
            unlock('master_scout');
        }
    }

    // 4. Star Squad Member (Galáctico)
    if (gameState.team.squad.some(p => p.rating >= 88)) {
        unlock('galactic_signing');
    }

    // 5. Stadium Facility
    if (gameState.stadium && (gameState.stadium.facilityLevel > 1 || gameState.stadium.capacity > 65000)) {
        unlock('stadium_expansion');
    }

    return {
        updatedAchievements: currentAchievements,
        newlyUnlocked
    };
}
