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
    boardImpact: number; // Impacto en la junta directiva (-20 a +20)
    fanImpact: number;   // Impacto en los socios/aficionados (-20 a +20)
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
            { text: "Estabilidad financiera absoluta", type: 'conservative', icon: '💰', boardImpact: 15, fanImpact: -10 },
            { text: "Equilibrar trofeos y finanzas", type: 'moderate', icon: '⚖️', boardImpact: 5, fanImpact: 5 },
            { text: "Ganar la liga a cualquier costo", type: 'ambitious', icon: '🏆', boardImpact: -15, fanImpact: 20 }
        ]
    },
    {
        id: 2,
        question: "Un jugador estrella exige un aumento salarial masivo. ¿Qué respondes?",
        category: 'financial',
        options: [
            { text: "Venderlo inmediatamente, el club es lo primero", type: 'conservative', icon: '🚫', boardImpact: 12, fanImpact: -15 },
            { text: "Negociar dentro de los límites del presupuesto", type: 'moderate', icon: '🤝', boardImpact: 5, fanImpact: -5 },
            { text: "Pagar lo que pida, las estrellas ganan títulos", type: 'ambitious', icon: '⭐', boardImpact: -12, fanImpact: 18 }
        ]
    },
    {
        id: 3,
        question: "¿Cuál es tu postura ante la prensa tras una derrota dolorosa?",
        category: 'social',
        options: [
            { text: "Trabajo en silencio, no dar explicaciones", type: 'conservative', icon: '🤐', boardImpact: 8, fanImpact: -12 },
            { text: "Asumir la responsabilidad y pedir paciencia", type: 'moderate', icon: '🎤', boardImpact: 2, fanImpact: 8 },
            { text: "Prometer cambios drásticos y fichajes de invierno", type: 'ambitious', icon: '📢', boardImpact: -10, fanImpact: 15 }
        ]
    },
    {
        id: 4,
        question: "La cantera tiene un talento de 17 años. ¿Cómo lo gestionas?",
        category: 'tactical',
        options: [
            { text: "Cedido a un club pequeño para que madure", type: 'conservative', icon: '⏳', boardImpact: 10, fanImpact: -8 },
            { text: "Entrenar con el primer equipo y darle minutos", type: 'moderate', icon: '📈', boardImpact: 4, fanImpact: 12 },
            { text: "Titular de inmediato, es el futuro del club", type: 'ambitious', icon: '🚀', boardImpact: -5, fanImpact: 20 }
        ]
    },
    {
        id: 5,
        question: "Oferta de 100M€ por tu capitán de 30 años. ¿Lo vendes?",
        category: 'financial',
        options: [
            { text: "Sí, es una oportunidad financiera irrepetible", type: 'conservative', icon: '💵', boardImpact: 20, fanImpact: -20 },
            { text: "Solo si el jugador desea irse del club", type: 'moderate', icon: '🤔', boardImpact: 5, fanImpact: -5 },
            { text: "No, la identidad del club no tiene precio", type: 'ambitious', icon: '🛡️', boardImpact: -10, fanImpact: 18 }
        ]
    },
    {
        id: 6,
        question: "¿Qué filosofía de juego definirá tu mandato?",
        category: 'tactical',
        options: [
            { text: "Pragmatismo: 1-0 y tres puntos son gloria", type: 'conservative', icon: '🔒', boardImpact: 15, fanImpact: -10 },
            { text: "Equilibrio táctico y transiciones rápidas", type: 'moderate', icon: '⚡', boardImpact: 8, fanImpact: 8 },
            { text: "Fútbol total: Ataque constante y espectáculo", type: 'ambitious', icon: '🔥', boardImpact: -10, fanImpact: 20 }
        ]
    },
    {
        id: 7,
        question: "Estamos en zona de descenso en Navidad. ¿Cuál es el plan?",
        category: 'ambition',
        options: [
            { text: "Reforzar la defensa y jugar a no perder", type: 'conservative', icon: '🧱', boardImpact: 12, fanImpact: -15 },
            { text: "Cambiar el sistema y motivar al grupo", type: 'moderate', icon: '💪', boardImpact: 5, fanImpact: 5 },
            { text: "Invertir los ahorros en 3 fichajes de impacto", type: 'ambitious', icon: '🆘', boardImpact: -20, fanImpact: 25 }
        ]
    },
    {
        id: 8,
        question: "¿Cómo manejarás los conflictos en el vestuario?",
        category: 'social',
        options: [
            { text: "Mano dura y sanciones internas severas", type: 'conservative', icon: '⚔️', boardImpact: 10, fanImpact: -5 },
            { text: "Diálogo constante y mediación grupal", type: 'moderate', icon: '🤲', boardImpact: 5, fanImpact: 8 },
            { text: "Vender a cualquier jugador que rompa el grupo", type: 'ambitious', icon: '🚫', boardImpact: 5, fanImpact: -10 }
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
    let boardScore = 50;
    let fanScore = 50;

    // Puntuación base por experiencia del jugador
    boardScore += player.experience;
    fanScore += player.experience;

    // Evaluar cada respuesta
    answers.forEach(answer => {
        boardScore += answer.boardImpact;
        fanScore += answer.fanImpact;

        // Bonus/Penalty según el tier del equipo
        if (team.tier === 'Lower') {
            // Equipos pequeños prefieren conservadurismo en la directiva
            if (answer.type === 'conservative') boardScore += 3;
            if (answer.type === 'ambitious') boardScore -= 5;
        } else if (team.tier === 'Top') {
            // Equipos grandes prefieren ambición en la afición
            if (answer.type === 'ambitious') fanScore += 5;
            if (answer.type === 'conservative') fanScore -= 5;
        }
    });

    const playerScore = (boardScore + fanScore) / 2;

    // Generar oponentes
    const opponents = generateOpponents(team.tier);

    // Determinar umbral de éxito
    const threshold = team.tier === 'Top' ? 70 : team.tier === 'Mid' ? 60 : 50;
    const success = boardScore >= threshold && fanScore >= (threshold - 10);

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
