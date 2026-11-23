import {
    GameState,
    LEAGUE_COUNTRY,
    LeagueId,
    NewsCategory,
    NewsItem,
    NewsMatchMeta,
    Player,
    Team
} from '../types';
import { formatCurrencyShort, formatDate } from '../utils';

const REGIONAL_OUTLETS: Record<string, string[]> = {
    ARG: ['Olé Digital', 'TyC Sports Press', 'El Gráfico', 'La Nación Deportes'],
    BRA: ['Globo Esporte', 'Lance! Digital', 'UOL Esporte'],
    ESP: ['Diario Marca', 'Relevo Fútbol', 'Diario AS'],
    ENG: ['The Athletic UK', 'Sky Sports Press', 'BBC Football'],
    ITA: ['La Gazzetta', 'Corriere dello Sport'],
    GER: ['Kicker Digital', 'Sport Bild'],
    FRA: ['L\'Équipe', 'RMC Sport'],
    MEX: ['Diario Récord', 'TUDN Press'],
    CHI: ['El Deportivo CL', 'ESPN Chile'],
    COL: ['Win Sports Press', 'El Tiempo Deportes'],
    PAR: ['Versus Deportes', 'D10 Paraguay'],
};

const INTERNATIONAL_OUTLETS = ['Apex Global Wire', 'World Football Desk', 'FIFA Press Wire'];

/**
 * Strips decorative leading emojis so legacy or third-party headlines render cleanly
 * inside the Dark Luxury press platform.
 */
export function cleanHeadlineText(text: string): string {
    return (text || '')
        .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\s]+/u, '')
        .trim();
}

export function getRegionalMediaSource(leagueId: LeagueId | 'CONMEBOL' | undefined, category: NewsCategory, seed = 0): string {
    if (category === 'institutional' || category === 'warning') {
        return category === 'institutional' ? 'Comunicado Oficial' : 'Redacción de Emergencia';
    }
    if (leagueId && leagueId !== 'CONMEBOL') {
        const country = LEAGUE_COUNTRY[leagueId];
        const outlets = REGIONAL_OUTLETS[country];
        if (outlets && outlets.length > 0) {
            return outlets[Math.abs(seed) % outlets.length];
        }
    }
    return INTERNATIONAL_OUTLETS[Math.abs(seed) % INTERNATIONAL_OUTLETS.length];
}

function inferCategoryFromContent(item: NewsItem): NewsCategory {
    if (item.type && item.type !== 'standard') return item.type;
    if (item.matchMeta) return 'match';

    const text = `${item.headline} ${item.body}`.toLowerCase();
    if (
        item.id.startsWith('match') ||
        text.includes('goleada') ||
        text.includes('empate') ||
        text.includes('victoria') ||
        text.includes('derrota') ||
        text.includes('tropieza') ||
        text.includes('puntos de oro') ||
        text.includes('marcador')
    ) {
        return 'match';
    }
    if (
        item.id.includes('offer') ||
        item.id.includes('market') ||
        text.includes('traspaso') ||
        text.includes('fichaje') ||
        text.includes('mercado') ||
        text.includes('ojeador') ||
        text.includes('oferta')
    ) {
        return 'transfer';
    }
    if (
        item.id.includes('champ') ||
        item.id.includes('potw') ||
        text.includes('campeón') ||
        text.includes('deslumbra') ||
        text.includes('hazaña') ||
        text.includes('estrella') ||
        text.includes('título')
    ) {
        return 'achievement';
    }
    if (
        text.includes('crisis') ||
        text.includes('descenso') ||
        text.includes('rescisión') ||
        text.includes('lesión') ||
        text.includes('derrota humillante') ||
        text.includes('aprobación baja') ||
        text.includes('en riesgo')
    ) {
        return 'warning';
    }
    if (
        item.id.includes('sponsor') ||
        item.id.includes('loan') ||
        item.id.includes('stadium') ||
        item.id.includes('coach') ||
        item.id.includes('staff') ||
        item.id.includes('election') ||
        item.id.includes('init-news') ||
        text.includes('junta') ||
        text.includes('estadio') ||
        text.includes('patrocinio') ||
        text.includes('presupuesto') ||
        text.includes('préstamo') ||
        text.includes('elecciones')
    ) {
        return 'institutional';
    }
    return 'standard';
}

/**
 * Normalizes any NewsItem (including legacy saved items) with clean typography,
 * semantic category, media outlet, and estimated reading time.
 */
export function normalizeNewsItem(item: NewsItem, team?: Team): NormalizedNewsItem {
    const category = inferCategoryFromContent(item);
    const headline = cleanHeadlineText(item.headline);
    const body = (item.body || '').replace(/\\n/g, '\n').trim();
    const seed = headline.length + (item.id?.length || 0);
    const sourceName = item.sourceName || getRegionalMediaSource(team?.leagueId, category, seed);

    let subheadline = item.subheadline;
    if (!subheadline) {
        const firstSentence = body.split(/(?<=[.!?])\s+/)[0] || body;
        subheadline = firstSentence.length > 135 ? `${firstSentence.slice(0, 132).trim()}...` : firstSentence;
    }

    const words = `${headline} ${body}`.trim().split(/\s+/).length;
    const readMinutes = Math.max(1, Math.ceil(words / 160));

    return {
        ...item,
        headline,
        subheadline,
        body,
        type: category,
        sourceName,
        readMinutes,
    };
}

export interface NormalizedNewsItem extends NewsItem {
    type: NewsCategory;
    subheadline: string;
    sourceName: string;
    readMinutes: number;
}

export interface PostMatchNewsParams {
    userTeam: Team;
    opponent?: Team | null;
    homeTeamId: number;
    awayTeamId: number;
    homeScore: number;
    awayScore: number;
    competition?: string;
    scorers?: { playerId?: number; playerName: string; minute: number }[];
    date: Date;
    leaguePosition?: number;
    leaguePoints?: number;
}

/**
 * Builds a single, comprehensive editorial post-match chronicle with scoreboard metadata,
 * scorer attribution, league context, and manager/player quote.
 */
export function buildPostMatchNews(params: PostMatchNewsParams): NewsItem {
    const {
        userTeam,
        opponent,
        homeTeamId,
        awayTeamId,
        homeScore,
        awayScore,
        competition,
        scorers = [],
        date,
        leaguePosition,
        leaguePoints,
    } = params;

    const isHome = homeTeamId === userTeam.id;
    const homeTeamName = isHome ? userTeam.name : (opponent?.name || 'Local');
    const awayTeamName = isHome ? (opponent?.name || 'Visitante') : userTeam.name;
    const oppName = opponent?.name || 'el rival';

    const myScore = isHome ? homeScore : awayScore;
    const oppScore = isHome ? awayScore : homeScore;
    const diff = myScore - oppScore;

    const isWin = diff > 0;
    const isDraw = diff === 0;
    const isLoss = diff < 0;
    const isThrashing = diff >= 3;
    const isBadLoss = diff <= -3;
    const isUpset = isWin && userTeam.tier === 'Lower' && opponent?.tier === 'Top';

    const squadNames = new Set((userTeam.squad || []).map(p => p.name));
    const userScorerNames = scorers.filter(s => squadNames.has(s.playerName));
    const leadScorerName = userScorerNames[0]?.playerName || scorers[0]?.playerName;
    const leadScorerObj = leadScorerName
        ? userTeam.squad.find(p => p.name === leadScorerName)
        : [...(userTeam.squad || [])].sort((a, b) => b.rating - a.rating)[0];

    const coachName = userTeam.coach?.name || `DT de ${userTeam.shortName || userTeam.name}`;
    const scoreText = `${homeScore}-${awayScore}`;
    const compLabel = competition ? competition.replace(/_/g, ' ') : 'Torneo Oficial';
    const venueLabel = isHome ? `en el ${userTeam.stadiumName || 'estadio local'}` : `en condición de visitante`;

    let headline = '';
    let subheadline = '';
    let quote = '';
    let quoteAuthor = coachName;

    if (isUpset) {
        headline = `Golpe histórico: ${userTeam.name} tumba a ${oppName} (${scoreText})`;
        subheadline = `El conjunto dirigido por ${coachName} firmó una de las sorpresas más resonantes de la fecha en ${compLabel}.`;
        quote = `"El equipo creyó en el plan desde el minuto uno. Este triunfo demuestra de qué está hecho este vestuario."`;
    } else if (isThrashing) {
        headline = `Exhibición total: ${userTeam.name} golea a ${oppName} por ${scoreText}`;
        subheadline = `Contundencia ofensiva ${venueLabel} para sumar tres puntos de autoridad en ${compLabel}.`;
        quote = `"Salimos a buscar el partido sin especular y el equipo respondió con fútbol y eficacia en ambas áreas."`;
    } else if (isWin) {
        headline = `${userTeam.name} se impone ante ${oppName} y suma de a tres (${scoreText})`;
        subheadline = `Triunfo sólido ${venueLabel} que consolida el trabajo del cuerpo técnico en ${compLabel}.`;
        quote = `"Supimos sufrir cuando el rival apretó y golpeamos en los momentos justos. Es un paso muy valioso."`;
    } else if (isDraw) {
        headline = `Reparto de puntos entre ${homeTeamName} y ${awayTeamName} (${scoreText})`;
        subheadline = `Duelo parejo e intenso ${venueLabel} correspondiente a ${compLabel}.`;
        quote = `"Fue un partido muy táctico y cerrado. Sumar siempre importa, aunque nos quedamos con ganas de más."`;
    } else if (isBadLoss) {
        headline = `Noche dura para ${userTeam.name}: caída por ${scoreText} frente a ${oppName}`;
        subheadline = `La derrota ${venueLabel} enciende las alarmas en la interna deportiva y exige reacción inmediata.`;
        quote = `"Hoy no estuvimos a la altura en las marcas ni en la intensidad. Toca hacer autocrítica puertas adentro."`;
    } else {
        headline = `${userTeam.name} cae ante ${oppName} en un duelo disputado (${scoreText})`;
        subheadline = `Pese al empuje final, el equipo se quedó sin premio ${venueLabel} por ${compLabel}.`;
        quote = `"Tuvimos pasajes de buen juego, pero nos faltó precisión en los últimos metros para cambiar la historia."`;
    }

    const scorerSummary = scorers.length > 0
        ? `Los tantos del encuentro llevaron la firma de ${scorers
              .slice(0, 4)
              .map(s => `${s.playerName} (${s.minute}')`)
              .join(', ')}.`
        : `El trámite se resolvió con intensidad táctica en ambas áreas a lo largo de los noventa minutos.`;

    const tableSummary = leaguePosition !== undefined && leaguePoints !== undefined
        ? `Con este marcador, ${userTeam.name} se ubica en el ${leaguePosition}º puesto de la tabla acumulada con ${leaguePoints} unidades.`
        : `El resultado impacta de lleno en la recta de objetivos que persigue la directiva esta temporada.`;

    const body = [
        `${homeTeamName} y ${awayTeamName} protagonizaron un nuevo capítulo de ${compLabel} ${venueLabel}, cerrando el marcador en ${scoreText}. ${scorerSummary}`,
        `${tableSummary} ${leadScorerObj ? `${leadScorerObj.name} fue uno de los nombres propios más observados por la prensa y la afición durante el compromiso.` : ''}`.trim()
    ].join('\n\n');

    const matchMeta: NewsMatchMeta = {
        homeTeamId,
        awayTeamId,
        homeTeamName,
        awayTeamName,
        homeScore,
        awayScore,
        competition: compLabel,
        scorers: scorers.slice(0, 6).map(s => ({ playerName: s.playerName, minute: s.minute })),
        isUserWin: isWin,
        isUserDraw: isDraw,
        isUserLoss: isLoss,
    };

    const sourceName = getRegionalMediaSource(userTeam.leagueId, 'match', homeScore + awayScore + userTeam.id);

    return {
        id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        headline,
        subheadline,
        body,
        quote,
        quoteAuthor,
        date: formatDate(date),
        type: isBadLoss ? 'warning' : 'match',
        sourceName,
        isBreaking: isThrashing || isBadLoss || isUpset,
        tags: [compLabel, isWin ? 'Victoria' : isDraw ? 'Empate' : 'Derrota', userTeam.shortName || userTeam.name],
        teamId: userTeam.id,
        playerId: leadScorerObj?.id,
        playerName: leadScorerObj?.name,
        playerPhoto: leadScorerObj?.photo,
        matchMeta,
    };
}

/**
 * Generates an intelligent, state-aware editorial story based on the user's real table position,
 * squad stars, youth academy, finances, or presidential climate.
 */
export function buildContextualClubNews(gameState: GameState, customDate?: Date): NewsItem {
    const team = gameState.team;
    const dateStr = formatDate(customDate || gameState.currentDate);
    const recentHeadlines = new Set((gameState.newsFeed || []).slice(0, 6).map(n => cleanHeadlineText(n.headline)));

    const leagueTable = team.leagueId !== 'CONMEBOL' ? (gameState.leagueTables?.[team.leagueId] || []) : [];
    const sorted = [...leagueTable].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    const rowIdx = sorted.findIndex(r => r.teamId === team.id);
    const position = rowIdx >= 0 ? rowIdx + 1 : undefined;
    const row = rowIdx >= 0 ? sorted[rowIdx] : undefined;

    const topScorer = [...(team.squad || [])]
        .filter(p => (p.stats?.goals || 0) > 0)
        .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))[0];

    const topStar = [...(team.squad || [])].sort((a, b) => b.rating - a.rating)[0];
    const topProspect = [...(gameState.youthAcademy || [])].sort((a, b) => (b.potential || b.rating) - (a.potential || a.rating))[0];
    const expiringStar = [...(team.squad || [])]
        .filter(p => p.contractYears <= 1 && p.rating >= 74)
        .sort((a, b) => b.rating - a.rating)[0];

    const presidentName = gameState.playerProfile?.name || 'La Presidencia';
    const coachName = team.coach?.name || 'el cuerpo técnico';
    const candidates: NewsItem[] = [];

    // 1. Title race / table position analysis
    if (position !== undefined && row) {
        if (position <= 3) {
            const headline = `${team.name} sostiene el pulso en la zona alta del campeonato`;
            candidates.push({
                id: `ctx_title_${Date.now()}`,
                headline,
                subheadline: `El equipo marcha ${position}º con ${row.points} puntos y alimenta la ilusión de los socios.`,
                body: `La regularidad mostrada por ${team.name} bajo la conducción de ${coachName} lo mantiene entre los principales aspirantes de la categoría.\n\nCon ${row.won} victorias y una diferencia de gol de ${row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}, la prensa especializada destaca la solidez colectiva del plantel.`,
                quote: `"El compromiso del grupo en cada entrenamiento explica por qué estamos peleando arriba."`,
                quoteAuthor: coachName,
                date: dateStr,
                type: 'standard',
                sourceName: getRegionalMediaSource(team.leagueId, 'standard', 1),
                tags: ['Tabla de Posiciones', 'Análisis Táctico'],
                teamId: team.id,
                playerId: topStar?.id,
                playerName: topStar?.name,
                playerPhoto: topStar?.photo,
            });
        } else if (position >= Math.max(12, Math.floor(sorted.length * 0.72))) {
            const headline = `Presión creciente en ${team.name} para escalar posiciones`;
            candidates.push({
                id: `ctx_pressure_${Date.now()}`,
                headline,
                subheadline: `Ubicado en el ${position}º lugar, el club busca respuestas futbolísticas inmediatas.`,
                body: `La actualidad deportiva de ${team.name} genera debate en el entorno del club tras acumular ${row.points} puntos en la presente campaña.\n\nDesde la dirección deportiva analizan ajustes tácticos junto a ${coachName} para recuperar terreno en las próximas jornadas.`,
                quote: `"Sabemos dónde estamos y trabajamos el doble para devolver al club al lugar que merece."`,
                quoteAuthor: presidentName,
                date: dateStr,
                type: 'warning',
                sourceName: getRegionalMediaSource(team.leagueId, 'warning', 2),
                tags: ['Actualidad', 'Vestuario'],
                teamId: team.id,
            });
        }
    }

    // 2. Top scorer spotlight
    if (topScorer && (topScorer.stats?.goals || 0) >= 3) {
        const goals = topScorer.stats?.goals || 0;
        const headline = `${topScorer.name}, la referencia ofensiva que sostiene a ${team.name}`;
        candidates.push({
            id: `ctx_scorer_${Date.now()}`,
            headline,
            subheadline: `Con ${goals} goles oficiales en el curso, el atacante atraviesa un momento determinante.`,
            body: `El rendimiento de ${topScorer.name} (${topScorer.rating} OVR) no pasa inadvertido en el fútbol local. Sus ${goals} anotaciones han resultado decisivas en la cosecha de puntos de ${team.name}.\n\nVarios analistas señalan que mantener su frescura física será clave para el tramo decisivo del calendario.`,
            quote: `"Me siento con confianza y el equipo me asiste muy bien. Quiero seguir aportando goles para la gente."`,
            quoteAuthor: topScorer.name,
            date: dateStr,
            type: 'achievement',
            sourceName: getRegionalMediaSource(team.leagueId, 'achievement', 3),
            tags: ['Figura del Club', 'Goleadores'],
            teamId: team.id,
            playerId: topScorer.id,
            playerName: topScorer.name,
            playerPhoto: topScorer.photo,
        });
    }

    // 3. Contract renewal alert
    if (expiringStar) {
        const headline = `Agenda de despachos: el futuro de ${expiringStar.name} entra en etapa clave`;
        candidates.push({
            id: `ctx_contract_${Date.now()}`,
            headline,
            subheadline: `El futbolista de ${expiringStar.rating} OVR transita su último año de contrato con ${team.name}.`,
            body: `La secretaría técnica encabezada por ${presidentName} sigue de cerca la situación contractual de ${expiringStar.name}, cuyo vínculo vigente vence al cierre de la temporada.\n\nAsegurar su continuidad evitaría que clubes competidores intenten seducirlo como agente libre en el próximo mercado.`,
            quote: `"Valoramos enormemente su peso en el vestuario y evaluaremos los tiempos de renovación con responsabilidad."`,
            quoteAuthor: presidentName,
            date: dateStr,
            type: 'transfer',
            sourceName: getRegionalMediaSource(team.leagueId, 'transfer', 4),
            tags: ['Contratos', 'Mercado'],
            teamId: team.id,
            playerId: expiringStar.id,
            playerName: expiringStar.name,
            playerPhoto: expiringStar.photo,
        });
    }

    // 4. Youth Academy gem
    if (topProspect) {
        const headline = `Informe de Cantera: ${topProspect.name} pide pista en ${team.name}`;
        candidates.push({
            id: `ctx_youth_${Date.now()}`,
            headline,
            subheadline: `El juvenil (${topProspect.position}, potencial ${topProspect.potential || topProspect.rating}) brilla en las divisiones formativas.`,
            body: `Los reportes semanales del cuerpo formativo destacan la madurez futbolística de ${topProspect.name} en las sesiones de inferiores.\n\nCon apenas ${topProspect.age || 17} años, su proyección lo posiciona como uno de los activos más prometedores de la academia del club.`,
            date: dateStr,
            type: 'standard',
            sourceName: getRegionalMediaSource(team.leagueId, 'standard', 5),
            tags: ['Cantera', 'Juveniles'],
            teamId: team.id,
        });
    }

    // 5. Political / Financial / Institutional pulse
    const fanRating = gameState.fanApproval?.rating ?? 65;
    const balance = gameState.finances?.balance ?? 0;
    if (gameState.mandate?.isElectionYear) {
        const headline = `Clima electoral en ${team.name}: los socios evalúan la gestión presidencial`;
        candidates.push({
            id: `ctx_election_${Date.now()}`,
            headline,
            subheadline: `Con ${fanRating}% de aprobación social, el oficialismo prepara su balance de mandato.`,
            body: `El año electoral comienza a tomar temperatura en los pasillos de ${team.name}. Los socios observan tanto los resultados deportivos como el equilibrio financiero (${formatCurrencyShort(balance)}) alcanzado durante el ciclo.\n\nCumplir las promesas de campaña será determinante en las urnas.`,
            date: dateStr,
            type: 'institutional',
            sourceName: 'Comunicado Oficial',
            tags: ['Elecciones', 'Socios'],
            teamId: team.id,
        });
    } else if (balance < 0) {
        const headline = `Alerta en tesorería: la directiva ajusta prioridades económicas en ${team.name}`;
        candidates.push({
            id: `ctx_finance_${Date.now()}`,
            headline,
            subheadline: `El saldo negativo (${formatCurrencyShort(balance)}) obliga a optimizar la masa salarial y comercial.`,
            body: `El área financiera del club sigue de cerca el flujo de caja semanal para evitar desequilibrios en el presupuesto operativo.\n\nLas opciones de patrocinio y una buena recaudación en el ${gameState.stadium?.name || 'estadio'} aparecen como herramientas clave para sanear las cuentas.`,
            date: dateStr,
            type: 'warning',
            sourceName: 'Comunicado Oficial',
            tags: ['Finanzas', 'Tesorería'],
            teamId: team.id,
        });
    } else {
        const headline = `Semana de alta intensidad táctica en la ciudad deportiva de ${team.name}`;
        candidates.push({
            id: `ctx_tactics_${Date.now()}`,
            headline,
            subheadline: `${coachName} ajusta automatismos pensando en la exigencia del calendario.`,
            body: `Con el respaldo de un ${fanRating}% de aprobación entre los socios, ${team.name} continúa puliendo detalles tácticos en su esquema ${team.customLineup?.formation || team.coach?.preferredFormation || '4-3-3'}.\n\n${topStar ? `${topStar.name} lidera las prácticas con máxima exigencia competitiva.` : 'La plantilla completa trabajó con intensidad.'}`,
            quote: `"La concentración en los detalles marca la diferencia en un torneo tan largo."`,
            quoteAuthor: topStar?.name || coachName,
            date: dateStr,
            type: 'standard',
            sourceName: getRegionalMediaSource(team.leagueId, 'standard', gameState.currentWeek || 1),
            tags: ['Entrenamiento', 'Club'],
            teamId: team.id,
            playerId: topStar?.id,
            playerName: topStar?.name,
            playerPhoto: topStar?.photo,
        });
    }

    const freshCandidates = candidates.filter(c => !recentHeadlines.has(cleanHeadlineText(c.headline)));
    const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
}

export function buildPlayerOfTheWeekNews(
    player: Player,
    team: Team,
    opponentName: string,
    resultString: string,
    date: Date
): NewsItem {
    return {
        id: `potw_${Date.now()}_${player.id}`,
        headline: `Figura de la Fecha: ${player.name} brilla con ${team.name}`,
        subheadline: `Actuación estelar (${player.rating} OVR) en el triunfo ${resultString} frente a ${opponentName}.`,
        body: `La prensa internacional destacó la exhibición individual de ${player.name}, valuado en ${formatCurrencyShort(player.value)}, quien resultó determinante frente a ${opponentName}.\n\nSu jerarquía en los momentos decisivos volvió a inclinar la balanza para ${team.name}.`,
        quote: `"Cuando los compañeros te respaldan dentro de la cancha, todo fluye con naturalidad."`,
        quoteAuthor: player.name,
        date: formatDate(date),
        type: 'achievement',
        sourceName: getRegionalMediaSource(team.leagueId, 'achievement', player.id),
        tags: ['Jugador de la Semana', team.shortName || team.name],
        playerId: player.id,
        playerName: player.name,
        playerPhoto: player.photo,
        teamId: team.id,
    };
}
