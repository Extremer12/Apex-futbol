import { GoogleGenAI, Type } from "@google/genai";
import { GameState, Player, PlayerProfile, Team } from '../types';
import { formatCurrency } from '../utils';

// La clave de API es inyectada por el entorno.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

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

// --- SISTEMA DE PLANTILLAS (AHORRO DE IA) ---

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

// --- FUNCIONES ---

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

// NUEVA FUNCIÓN: Solo se llama para eventos importantes (Usa IA)
export const generateImportantNews = async (headlineContext: string, detailContext: string): Promise<NewsResponse> => {
    const prompt = `Escribe una noticia periodística breve y sensacionalista sobre fútbol.
    Contexto del titular: ${headlineContext}
    Detalles: ${detailContext}
    
    Devuelve un JSON con "headline" (max 8 palabras) y "body" (max 30 palabras).`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        body: { type: Type.STRING }
                    },
                    required: ["headline", "body"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (e) {
        return { headline: "Noticia de Última Hora", body: `${headlineContext}. ${detailContext}` };
    }
};

// MANTENEMOS IA: Elecciones
export const evaluateElectionPitch = async (pitch: string, team: Team, player: PlayerProfile): Promise<ElectionResponse> => {
    const prompt = `Ustedes son la junta directiva del ${team.name}, un club de fútbol de nivel '${team.tier}'.
    Están evaluando a un candidato a presidente, ${player.name}, que tiene un nivel de experiencia de ${player.experience} sobre 100.
    
    El discurso del candidato es: "${pitch}"

    Basándose en su discurso, su experiencia y nuestro estatus como club de nivel '${team.tier}', decidan si gana las elecciones.
    - Clubes de Nivel 'Lower' son más abiertos a un buen plan y pasión.
    - Clubes de Nivel 'Mid' requieren un discurso excelente.
    - Clubes de Nivel 'Top' son muy exigentes.
    
    Responded JSON.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        success: { type: Type.BOOLEAN },
                        feedback: { type: Type.STRING }
                    },
                    required: ["success", "feedback"]
                }
            }
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        return { success: false, feedback: "Error de comunicación con la junta." };
    }
}

// MANTENEMOS IA: Negociaciones (Interacción directa)
export const generateTransferNegotiationResponse = async (player: Player, offer: number, buyingTeam: Team, sellingTeam: Team): Promise<NegotiationResponse> => {
    const prompt = `Eres el presidente del ${sellingTeam.name} ('${sellingTeam.tier}').
    El ${buyingTeam.name} ofrece £${offer}M por ${player.name} (Valor: £${player.value}M, Nivel: ${player.rating}).
    
    Decide: 'accepted', 'rejected', o 'counter'.
    Responde brevemente como presidente de fútbol. JSON.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        decision: { type: Type.STRING, enum: ['accepted', 'rejected', 'counter'] },
                        message: { type: Type.STRING },
                        counterOffer: { type: Type.NUMBER }
                    },
                    required: ["decision", "message"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        return { decision: 'rejected', message: "Error de comunicación." };
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