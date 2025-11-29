import { GameState, Player, PlayerProfile, Team } from '../types';
import { formatCurrency } from '../utils';

// --- INTERFACES ---

interface NewsResponse {
    headline: string;
    body: string;
}

export interface ElectionResponse {
    success: boolean;
    feedback: string;
}

export interface NegotiationResponse {
    decision: 'accepted' | 'rejected' | 'counter';
    message: string;
    counterOffer?: number;
}

export interface OfferResponse {
    offeringTeamId: number;
    offerValue: number;
    message: string;
}

// --- TEMPLATES ---

const GENERAL_NEWS_TEMPLATES = [
    (team: string) => ({ headline: "Ambiente en el Vestuario", body: `Fuentes internas del ${team} aseguran que el ambiente en el vestuario es muy profesional de cara a los próximos compromisos.` }),
    (team: string) => ({ headline: "Entrenamiento Intensivo", body: `El cuerpo técnico del ${team} ha incrementado la carga física esta semana. Los jugadores responden bien al desafío.` }),
    (team: string) => ({ headline: "Apoyo de la Afición", body: `La venta de entradas para el próximo partido del ${team} va a buen ritmo. La afición está volcada con el proyecto.` }),
    (team: string) => ({ headline: "Rumores de Mercado", body: `Varios ojeadores han sido vistos en el último entrenamiento del ${team}, aunque el club mantiene silencio sobre posibles salidas.` }),
    (team: string) => ({ headline: "Declaraciones del Capitán", body: `El capitán del ${team} ha pedido concentración máxima: "No podemos relajarnos ni un segundo en esta liga".` }),
    (team: string) => ({ headline: "Análisis Táctico", body: `Los analistas elogian la solidez defensiva mostrada por el ${team} en las últimas sesiones preparatorias.` }),
];

const MATCH_WIN_TEMPLATES = [
    (winner: string, loser: string, score: string) => ({ headline: `¡Victoria para el ${winner}!`, body: `El ${winner} se impuso con autoridad al ${loser} por ${score}. Tres puntos de oro para el equipo.` }),
    (winner: string, loser: string, score: string) => ({ headline: `${winner} domina el encuentro`, body: `Gran actuación del ${winner} venciendo ${score} contra el ${loser}. La afición se va a casa celebrando.` }),
    (winner: string, loser: string, score: string) => ({ headline: `Triunfo trabajado del ${winner}`, body: `En un partido intenso, el ${winner} logró superar al ${loser} con un marcador final de ${score}.` }),
];

const MATCH_LOSS_TEMPLATES = [
    (loser: string, winner: string, score: string) => ({ headline: `Dura derrota para el ${loser}`, body: `El ${loser} no pudo contener al ${winner} y cayó derrotado por ${score}. Toca levantar la cabeza.` }),
    (loser: string, winner: string, score: string) => ({ headline: `El ${loser} tropieza`, body: `Jornada para olvidar. El ${winner} superó tácticamente al ${loser}, dejando el marcador en ${score}.` }),
    (loser: string, winner: string, score: string) => ({ headline: `Decepción en el ${loser}`, body: `A pesar del esfuerzo, el ${loser} acabó perdiendo ${score} contra un ${winner} muy efectivo.` }),
];

const MATCH_DRAW_TEMPLATES = [
    (team1: string, team2: string, score: string) => ({ headline: `Reparto de puntos`, body: `El duelo entre ${team1} y ${team2} terminó en tablas (${score}). Un partido muy disputado.` }),
    (team1: string, team2: string, score: string) => ({ headline: `Empate reñido`, body: `${team1} y ${team2} no lograron sacarse ventaja y el marcador finalizó ${score}.` }),
    (team1: string, team2: string, score: string) => ({ headline: `Igualdad máxima`, body: `El marcador de ${score} refleja lo visto en el campo entre ${team1} y ${team2}.` }),
];

const OFFER_MESSAGES = [
    (player: string, team: string) => `Hemos seguido la progresión de ${player} y creemos que encajaría perfectamente en el esquema del ${team}.`,
    (player: string, team: string) => `El ${team} está muy interesado en hacerse con los servicios de ${player}. Aquí tienen nuestra oferta formal.`,
    (player: string, team: string) => `Consideramos que ${player} necesita un cambio de aires y el ${team} es el lugar ideal. Esperamos su respuesta.`,
    (player: string, team: string) => `Estamos dispuestos a hacer un esfuerzo económico por ${player}. Creemos que es una oferta justa.`,
];

// --- IMPORTANT NEWS TEMPLATES (REPLACING AI) ---

const THRASHING_TEMPLATES = [
    (winner: string, loser: string, score: string) => ({ headline: `¡Baño Histórico!`, body: `El ${winner} aplastó al ${loser} con un contundente ${score}. Una exhibición de fútbol total que será recordada por años.` }),
    (winner: string, loser: string, score: string) => ({ headline: `Humillación en el Campo`, body: `Noche negra para el ${loser}, que cayó ${score} ante un ${winner} imparable. La afición pide explicaciones.` }),
];

const UPSET_TEMPLATES = [
    (winner: string, loser: string, score: string) => ({ headline: `¡El Matagigantes!`, body: `Sorpresa mayúscula: el modesto ${winner} tumbó al poderoso ${loser} (${score}). David venció a Goliat.` }),
    (winner: string, loser: string, score: string) => ({ headline: `Campanada de la Jornada`, body: `Nadie lo esperaba, pero el ${winner} se llevó los tres puntos ante el ${loser} con un ${score} heroico.` }),
];

const BAD_LOSS_TEMPLATES = [
    (loser: string, winner: string, score: string) => ({ headline: `Crisis Total`, body: `El ${loser} toca fondo tras caer ${score} contra el ${winner}. La continuidad del técnico podría estar en el aire.` }),
    (loser: string, winner: string, score: string) => ({ headline: `Vergüenza Ajena`, body: `Imagen lamentable del ${loser} en su derrota por ${score} ante el ${winner}. Se esperan medidas drásticas.` }),
];

// --- NEGOTIATION TEMPLATES (REPLACING AI) ---

const NEGOTIATION_ACCEPTED_MESSAGES = [
    "La oferta nos parece justa. Aceptamos el traspaso.",
    "Trato hecho. Creemos que es lo mejor para todas las partes.",
    "Aceptamos sus condiciones. Procedan con el contrato del jugador.",
];

const NEGOTIATION_REJECTED_MESSAGES = [
    "La oferta es insultante. El jugador no está en venta por esa cantidad.",
    "No estamos interesados en vender a ese precio. Rechazado.",
    "Consideramos que el valor del jugador es mucho mayor. No hay trato.",
];

const NEGOTIATION_COUNTER_MESSAGES = [
    (amount: number) => `Estamos dispuestos a negociar, pero queremos £${amount}M.`,
    (amount: number) => `Acérquense a £${amount}M y podremos cerrar el trato.`,
    (amount: number) => `Nuestra valoración es de £${amount}M. ¿Pueden igualarla?`,
];


// --- FUNCTIONS ---

// Genera noticias con plantilla (gratis/rápido)
export const generateNews = async (gameState: GameState): Promise<NewsResponse> => {
    const template = GENERAL_NEWS_TEMPLATES[Math.floor(Math.random() * GENERAL_NEWS_TEMPLATES.length)];
    return template(gameState.team.name);
};

// Genera reporte de partido normal con plantilla (gratis/rápido)
export const generateMatchReport = async (playerTeamName: string, opponentName: string, homeScore: number, awayScore: number, isHomeMatch: boolean): Promise<NewsResponse> => {
    const playerWon = isHomeMatch ? homeScore > awayScore : awayScore > homeScore;
    const isDraw = homeScore === awayScore;
    const scoreString = `${homeScore}-${awayScore}`;

    if (isDraw) {
        const template = MATCH_DRAW_TEMPLATES[Math.floor(Math.random() * MATCH_DRAW_TEMPLATES.length)];
        return template(playerTeamName, opponentName, scoreString);
    } else if (playerWon) {
        const template = MATCH_WIN_TEMPLATES[Math.floor(Math.random() * MATCH_WIN_TEMPLATES.length)];
        return template(playerTeamName, opponentName, scoreString);
    } else {
        const template = MATCH_LOSS_TEMPLATES[Math.floor(Math.random() * MATCH_LOSS_TEMPLATES.length)];
        return template(playerTeamName, opponentName, scoreString);
    }
};

// NUEVA FUNCIÓN: Lógica determinista para noticias importantes
export const generateImportantNews = async (context: string, detail: string): Promise<NewsResponse> => {
    // Intentamos deducir el tipo de evento del contexto (esto es un poco frágil si el contexto cambia, 
    // pero como controlamos las llamadas en App.tsx, podemos estandarizarlo).

    // En App.tsx:
    // Upset: "Victoria histórica..."
    // Thrashing: "Una goleada espectacular."
    // Bad Loss: "Una derrota humillante."

    // Extraemos nombres y score del 'detail' string si es posible, o usamos placeholders genéricos.
    // detail format: "El {TeamName} quedó {HomeScore}-{AwayScore} contra el {OpponentName}."

    // Para simplificar, si no podemos parsear perfecto, devolvemos algo genérico pero dramático.

    if (context.includes("goleada")) {
        return { headline: "¡Lluvia de Goles!", body: `${context} ${detail} Un partido para enmarcar.` };
    } else if (context.includes("derrota humillante")) {
        return { headline: "Desastre Absoluto", body: `${context} ${detail} La afición está furiosa.` };
    } else if (context.includes("histórica")) {
        return { headline: "¡Hazaña!", body: `${context} ${detail} Increíble resultado.` };
    }

    return { headline: "Noticia Destacada", body: `${context} ${detail}` };
};

// MODO SIMULADO: Elecciones (sin usar API)
export const evaluateElectionPitch = async (pitch: string, team: Team, player: PlayerProfile): Promise<ElectionResponse> => {
    // Simulación local basada en lógica del juego
    const pitchLength = pitch.trim().length;
    const hasKeywords = /gestión|táctica|fichaje|equipo|victoria|afición|proyecto/i.test(pitch);

    let baseScore = 0;

    // Puntuación por longitud del pitch
    if (pitchLength > 100) baseScore += 30;
    else if (pitchLength > 50) baseScore += 15;

    // Puntuación por palabras clave
    if (hasKeywords) baseScore += 20;

    // Puntuación por experiencia del jugador
    baseScore += player.experience * 0.5;

    // Ajuste por tier del equipo
    let threshold = 50;
    if (team.tier === 'Lower') threshold = 40; // Más fácil
    if (team.tier === 'Mid') threshold = 55;   // Medio
    if (team.tier === 'Top') threshold = 70;   // Más difícil

    const success = baseScore >= threshold;

    const feedbacks = {
        success: [
            `¡Bienvenido al ${team.name}! Tu visión y pasión nos han convencido. Esperamos grandes cosas de ti.`,
            `La junta directiva ha votado a tu favor. Tu plan para el ${team.name} es exactamente lo que necesitamos.`,
            `Impresionante presentación. El ${team.name} está en buenas manos contigo al mando.`
        ],
        failure: [
            `Apreciamos tu interés, pero la junta necesita ver un plan más detallado y convincente.`,
            `Tu propuesta no ha convencido a la mayoría de la junta. El ${team.name} requiere más experiencia.`,
            `Lamentablemente, tu visión no se alinea con los objetivos actuales del club. Inténtalo de nuevo.`
        ]
    };

    const feedback = success
        ? feedbacks.success[Math.floor(Math.random() * feedbacks.success.length)]
        : feedbacks.failure[Math.floor(Math.random() * feedbacks.failure.length)];

    return { success, feedback };
}

// NUEVA LÓGICA: Negociaciones deterministas
export const generateTransferNegotiationResponse = async (player: Player, offer: number, buyingTeam: Team, sellingTeam: Team): Promise<NegotiationResponse> => {
    // Lógica básica de negociación
    const value = player.value;
    const ratio = offer / value;

    // Factores aleatorios
    const patience = Math.random(); // 0 a 1. 1 es muy paciente/flexible.
    const greed = Math.random(); // 0 a 1. 1 es muy codicioso.

    // Umbrales
    const acceptThreshold = 1.2 + (greed * 0.3) - (patience * 0.2); // Entre 1.0 y 1.5 veces el valor
    const rejectThreshold = 0.8 - (greed * 0.1); // Si es menos del 70-80%, rechazo directo.

    if (ratio >= acceptThreshold) {
        return {
            decision: 'accepted',
            message: NEGOTIATION_ACCEPTED_MESSAGES[Math.floor(Math.random() * NEGOTIATION_ACCEPTED_MESSAGES.length)]
        };
    } else if (ratio <= rejectThreshold) {
        return {
            decision: 'rejected',
            message: NEGOTIATION_REJECTED_MESSAGES[Math.floor(Math.random() * NEGOTIATION_REJECTED_MESSAGES.length)]
        };
    } else {
        // Counter offer
        // Queremos algo entre la oferta y el threshold de aceptación, tirando hacia arriba.
        const target = value * acceptThreshold;
        const counterAmount = Math.round((offer + target) / 2 * 10) / 10; // Promedio entre oferta y target

        return {
            decision: 'counter',
            message: NEGOTIATION_COUNTER_MESSAGES[Math.floor(Math.random() * NEGOTIATION_COUNTER_MESSAGES.length)](counterAmount),
            counterOffer: counterAmount
        };
    }
};

export const generateTransferOffer = async (player: Player, sellingTeam: Team, potentialBuyers: Team[]): Promise<OfferResponse | null> => {
    // Lógica Local
    const viableBuyers = potentialBuyers.filter(t => t.transferBudget >= player.value * 0.8);
    if (viableBuyers.length === 0) return null;

    const buyer = viableBuyers[Math.floor(Math.random() * viableBuyers.length)];
    const variance = 0.8 + (Math.random() * 0.4);
    const offerValue = Math.round(player.value * variance * 10) / 10;
    const msgTemplate = OFFER_MESSAGES[Math.floor(Math.random() * OFFER_MESSAGES.length)];

    return {
        offeringTeamId: buyer.id,
        offerValue: offerValue,
        message: msgTemplate(player.name, buyer.name)
    };
};

export const generatePlayerOfTheWeekNews = async (player: Player, teamName: string, opponentName: string, resultString: string): Promise<NewsResponse> => {
    // Lógica Local
    return {
        headline: `¡${player.name} deslumbra!`,
        body: `Actuación estelar de ${player.name} (Val: ${formatCurrency(player.value)}) en el partido contra ${opponentName}. Los aficionados del ${teamName} corearon su nombre tras el ${resultString}.`
    };
};
