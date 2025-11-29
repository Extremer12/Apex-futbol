import { Team, PlayerProfile } from '../types';

export interface DebateQuestion {
    id: number;
    question: string;
    category: 'financial' | 'tactical' | 'social' | 'ambition';
    options: DebateOption[];
}

export interface DebateOption {
    text: string;
    type: 'conservative' | 'moderate' | 'ambitious';
    icon: string;
}

export interface OpponentCandidate {
    name: string;
    score: number;
    avatar: string;
}

export interface DebateResult {
    playerScore: number;
    opponents: OpponentCandidate[];
    success: boolean;
    feedback: string;
}

// Banco de preguntas para el debate
const DEBATE_QUESTIONS: DebateQuestion[] = [
    {
        id: 1,
        question: "¿Cuál es tu prioridad principal para la primera temporada?",
        category: 'ambition',
        options: [
            { text: "Mantener la estabilidad financiera del club", type: 'conservative', icon: '💰' },
            { text: "Equilibrar resultados deportivos y finanzas", type: 'moderate', icon: '⚖️' },
            { text: "Ganar trofeos a cualquier costo", type: 'ambitious', icon: '🏆' }
        ]
    },
    {
        id: 2,
        question: "Un jugador estrella pide un salario muy alto. ¿Qué harías?",
        category: 'financial',
        options: [
            { text: "Rechazar la oferta, nadie está por encima del club", type: 'conservative', icon: '🚫' },
            { text: "Negociar un salario justo dentro del presupuesto", type: 'moderate', icon: '🤝' },
            { text: "Aceptar sus demandas, es clave para el éxito", type: 'ambitious', icon: '⭐' }
        ]
    },
    {
        id: 3,
        question: "¿Cómo manejarías la presión de los medios tras una mala racha?",
        category: 'social',
        options: [
            { text: "Evitar declaraciones y trabajar en silencio", type: 'conservative', icon: '🤐' },
            { text: "Dar la cara y pedir paciencia a la afición", type: 'moderate', icon: '🎤' },
            { text: "Prometer cambios inmediatos y resultados", type: 'ambitious', icon: '📢' }
        ]
    },
    {
        id: 4,
        question: "La cantera tiene un talento prometedor. ¿Cuándo lo subirías al primer equipo?",
        category: 'tactical',
        options: [
            { text: "Cuando tenga al menos 20 años y experiencia", type: 'conservative', icon: '⏳' },
            { text: "Darle minutos progresivamente esta temporada", type: 'moderate', icon: '📈' },
            { text: "Lanzarlo de titular de inmediato", type: 'ambitious', icon: '🚀' }
        ]
    },
    {
        id: 5,
        question: "Un equipo grande ofrece mucho dinero por tu mejor jugador. ¿Qué haces?",
        category: 'financial',
        options: [
            { text: "Venderlo si la oferta es buena para el club", type: 'conservative', icon: '💵' },
            { text: "Solo si el jugador lo pide expresamente", type: 'moderate', icon: '🤔' },
            { text: "Rechazar cualquier oferta, es intransferible", type: 'ambitious', icon: '🛡️' }
        ]
    },
    {
        id: 6,
        question: "¿Qué estilo de juego implementarías?",
        category: 'tactical',
        options: [
            { text: "Defensivo y pragmático, resultados ante todo", type: 'conservative', icon: '🔒' },
            { text: "Equilibrado, adaptándose al rival", type: 'moderate', icon: '⚡' },
            { text: "Ofensivo y vistoso, el espectáculo es clave", type: 'ambitious', icon: '🔥' }
        ]
    },
    {
        id: 7,
        question: "El equipo está en zona de descenso a mitad de temporada. ¿Cuál es tu plan?",
        category: 'ambition',
        options: [
            { text: "Reforzar la defensa y jugar conservador", type: 'conservative', icon: '🧱' },
            { text: "Ajustar táctica y motivar al vestuario", type: 'moderate', icon: '💪' },
            { text: "Fichar refuerzos de emergencia inmediatamente", type: 'ambitious', icon: '🆘' }
        ]
    },
    {
        id: 8,
        question: "¿Cómo gestionarías el vestuario si hay conflictos internos?",
        category: 'social',
        options: [
            { text: "Dejar que los capitanes lo resuelvan internamente", type: 'conservative', icon: '👥' },
            { text: "Mediar personalmente y buscar consenso", type: 'moderate', icon: '🤲' },
            { text: "Tomar decisiones drásticas, vender a los problemáticos", type: 'ambitious', icon: '⚔️' }
        ]
    }
];

// Generar candidatos oponentes
export const generateOpponents = (teamTier: Team['tier']): OpponentCandidate[] => {
    const names = [
        "Roberto Martínez", "Carlos Sánchez", "Ana Rodríguez",
        "Miguel Torres", "Laura Fernández", "Diego Morales"
    ];

    const avatars = ["👨‍💼", "👩‍💼", "🧑‍💼", "👔", "🎩"];

    // Shuffle names
    const shuffledNames = names.sort(() => Math.random() - 0.5);

    // Generate 2-3 opponents
    const numOpponents = 2 + Math.floor(Math.random() * 2);
    const opponents: OpponentCandidate[] = [];

    for (let i = 0; i < numOpponents; i++) {
        // Base score depends on tier
        let baseScore = 50;
        if (teamTier === 'Top') baseScore = 65;
        if (teamTier === 'Mid') baseScore = 55;

        // Add randomness
        const score = baseScore + Math.floor(Math.random() * 20) - 10;

        opponents.push({
            name: shuffledNames[i],
            score: Math.max(30, Math.min(85, score)),
            avatar: avatars[i % avatars.length]
        });
    }

    return opponents.sort((a, b) => b.score - a.score);
};

// Seleccionar 6 preguntas aleatorias
export const selectDebateQuestions = (): DebateQuestion[] => {
    const shuffled = [...DEBATE_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
};

// Evaluar respuestas del debate
export const evaluateDebate = (
    answers: DebateOption[],
    team: Team,
    player: PlayerProfile
): DebateResult => {
    let score = 0;

    // Puntuación base por experiencia
    score += player.experience * 2;

    // Evaluar cada respuesta
    answers.forEach(answer => {
        // Puntos base por tipo de respuesta
        if (answer.type === 'conservative') score += 8;
        if (answer.type === 'moderate') score += 12;
        if (answer.type === 'ambitious') score += 10;

        // Bonus según el tier del equipo
        if (team.tier === 'Lower') {
            // Equipos pequeños prefieren conservadurismo
            if (answer.type === 'conservative') score += 5;
            if (answer.type === 'ambitious') score -= 2;
        } else if (team.tier === 'Top') {
            // Equipos grandes prefieren ambición
            if (answer.type === 'ambitious') score += 5;
            if (answer.type === 'conservative') score -= 2;
        } else {
            // Equipos medianos prefieren moderación
            if (answer.type === 'moderate') score += 4;
        }
    });

    // Generar oponentes
    const opponents = generateOpponents(team.tier);

    // Determinar umbral de éxito
    let threshold = 60;
    if (team.tier === 'Lower') threshold = 50;
    if (team.tier === 'Mid') threshold = 65;
    if (team.tier === 'Top') threshold = 75;

    const success = score >= threshold;

    // Feedback personalizado
    const feedbacks = {
        success: [
            `¡Impresionante! La junta del ${team.name} ha votado a tu favor. Tu visión estratégica nos ha convencido.`,
            `Bienvenido al ${team.name}. Tus respuestas demuestran que tienes lo necesario para liderar este proyecto.`,
            `La junta está de acuerdo: eres la persona indicada para el ${team.name}. ¡Adelante!`
        ],
        failure: [
            `La junta necesita ver más experiencia y claridad en tu visión. El ${team.name} requiere un líder más preparado.`,
            `Tus propuestas no han convencido a la mayoría. Quizás otro club se ajuste mejor a tu perfil.`,
            `Lamentablemente, otros candidatos han presentado planes más sólidos. Inténtalo de nuevo.`
        ]
    };

    const feedback = success
        ? feedbacks.success[Math.floor(Math.random() * feedbacks.success.length)]
        : feedbacks.failure[Math.floor(Math.random() * feedbacks.failure.length)];

    return {
        playerScore: score,
        opponents,
        success,
        feedback
    };
};
