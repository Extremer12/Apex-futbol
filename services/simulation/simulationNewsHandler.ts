import { GameState, NewsItem, Offer, Match, Team, PlayerMatchResult, CinematicEvent } from '../../types';
import { 
    generateNews, 
    generateMatchReport, 
    generateTransferOffer, 
    generatePlayerOfTheWeekNews, 
    generateImportantNews 
} from '../gameLogic';
import { formatDate, isTransferWindowOpen } from '../../utils';

export interface WeeklyNewsAndOffersResult {
    newsToAdd: NewsItem[];
    generatedOffers: Offer[];
}

export async function generateWeeklyNewsAndOffers(
    gameState: GameState,
    updatedSchedule: Match[],
    updatedAllTeams: Team[],
    playerMatchResult: PlayerMatchResult | null,
    newWeek: number,
    newDate: Date,
    cinematicEvents: CinematicEvent[]
): Promise<WeeklyNewsAndOffersResult> {
    const newsToAdd: NewsItem[] = [];

    // 1. Post-match news report for user match
    const playerMatch = updatedSchedule.find(
        m => m.week === newWeek && (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id)
    );

    if (playerMatch && playerMatch.result) {
        const isHome = playerMatch.homeTeamId === gameState.team.id;
        const opponentId = isHome ? playerMatch.awayTeamId : playerMatch.homeTeamId;
        const opponent = gameState.allTeams.find(t => t.id === opponentId) || updatedAllTeams.find(t => t.id === opponentId)!;
        const myScore = isHome ? playerMatch.result.homeScore : playerMatch.result.awayScore;
        const oppScore = isHome ? playerMatch.result.awayScore : playerMatch.result.homeScore;

        const isThrashing = (myScore - oppScore) >= 3;
        const isBadLoss = (oppScore - myScore) >= 3;
        const isUpset = myScore > oppScore && gameState.team.tier === 'Lower' && opponent?.tier === 'Top';

        if (isThrashing || isBadLoss || isUpset) {
            const context = isUpset 
                ? "Victoria histórica de un equipo pequeño contra un gigante." 
                : isThrashing 
                    ? "Una goleada espectacular." 
                    : "Una derrota humillante.";
            const detail = `El ${gameState.team.name} quedó ${myScore}-${oppScore} contra el ${opponent?.name || 'Rival'}.`;
            const aiReport = await generateImportantNews(context, detail);
            newsToAdd.push({ ...aiReport, id: `match_ai_${new Date().toISOString()}`, date: formatDate(newDate) });
        } else {
            const matchReport = await generateMatchReport(
                gameState.team.name, 
                opponent?.name || 'Rival', 
                playerMatch.result.homeScore, 
                playerMatch.result.awayScore, 
                isHome
            );
            newsToAdd.push({ ...matchReport, id: `match_${new Date().toISOString()}`, date: formatDate(newDate) });
        }
    } else {
        const generalNews = await generateNews(gameState);
        newsToAdd.push({ ...generalNews, id: `general_${new Date().toISOString()}`, date: formatDate(newDate) });
    }

    // 2. Player of the Week News
    const matchesThisWeek = updatedSchedule.filter(m => m.week === newWeek);
    if (matchesThisWeek.length > 0 && Math.random() < 0.3) {
        const winningTeamsIds: number[] = [];
        matchesThisWeek.forEach(match => {
            if (!match.result) return;
            if (match.result.homeScore > match.result.awayScore) winningTeamsIds.push(match.homeTeamId);
            else if (match.result.awayScore > match.result.homeScore) winningTeamsIds.push(match.awayTeamId);
        });

        const candidatePlayers = updatedAllTeams
            .filter(t => winningTeamsIds.includes(t.id))
            .flatMap(t => t.squad.map(p => ({ player: p, team: t })))
            .filter(({ player }) => player.rating > 84);

        if (candidatePlayers.length > 0) {
            const { player, team } = candidatePlayers[Math.floor(Math.random() * candidatePlayers.length)];
            const match = matchesThisWeek.find(m => m.homeTeamId === team.id || m.awayTeamId === team.id);
            if (match && match.result) {
                const opponent = updatedAllTeams.find(t => t.id === (match.homeTeamId === team.id ? match.awayTeamId : match.homeTeamId));
                if (opponent) {
                    const resultString = `${team.name} ${match.result.homeScore} - ${match.result.awayScore} ${opponent.name}`;
                    const potwNewsData = await generatePlayerOfTheWeekNews(player, team.name, opponent.name, resultString);
                    newsToAdd.push({ ...potwNewsData, id: `potw_${new Date().toISOString()}`, date: formatDate(newDate) });
                }
            }
        }
    }

    // 3. AI Transfer Offers for Listed Players
    const generatedOffers: Offer[] = [];
    if (isTransferWindowOpen(gameState.currentWeek)) {
        const transferListedPlayers = gameState.team.squad.filter(p => p.isTransferListed);
        for (const player of transferListedPlayers) {
            if (Math.random() < 0.3) {
                const potentialBuyers = gameState.allTeams.filter(t => t.id !== gameState.team.id);
                const offer = await generateTransferOffer(player, gameState.team, potentialBuyers);
                if (offer) {
                    generatedOffers.push({
                        id: `offer_${new Date().toISOString()}_${player.id}`,
                        playerId: player.id,
                        ...offer
                    });
                }
            }
        }
    }

    // 4. Transfer Market Notifications (Jan, Feb, Jul, Sep)
    const prevDate = new Date(gameState.currentDate);
    const currMonth = newDate.getMonth();
    const prevMonth = prevDate.getMonth();

    if (prevMonth !== currMonth) {
        if (currMonth === 0) { // Enero
            newsToAdd.push({
                id: `market_open_jan_${Date.now()}`,
                headline: '💼 Mercado Abierto: Enero',
                body: 'Se abre la ventana de traspasos de invierno. Los clubes buscan refuerzos de última hora.',
                date: formatDate(newDate),
                type: 'standard'
            });
        } else if (currMonth === 1) { // Febrero
            newsToAdd.push({
                id: `market_close_feb_${Date.now()}`,
                headline: '🚫 Mercado Cerrado',
                body: 'Finaliza el periodo de fichajes de invierno. Las plantillas quedan cerradas hasta verano.',
                date: formatDate(newDate),
                type: 'standard'
            });
        } else if (currMonth === 6) { // Julio
            newsToAdd.push({
                id: `market_open_jul_${Date.now()}`,
                headline: '☀️ Mercado de Verano Abierto',
                body: 'Comienza el periodo de fichajes estival. Se esperan grandes movimientos en las ligas europeas.',
                date: formatDate(newDate),
                type: 'standard'
            });
        } else if (currMonth === 8) { // Septiembre
            newsToAdd.push({
                id: `market_close_sep_${Date.now()}`,
                headline: '⏳ Deadline Day Finalizado',
                body: 'El mercado de verano ha cerrado. Se acabó el tiempo para las negociaciones.',
                date: formatDate(newDate),
                type: 'standard'
            });
        }
    }

    // 5. Cinematic Headline News
    if (cinematicEvents.length > 0) {
        newsToAdd.push({
            id: `cup_start_news_${newWeek}`,
            headline: cinematicEvents[0].title,
            body: cinematicEvents[0].subtitle,
            date: formatDate(newDate),
            type: 'standard'
        });
    }

    // 6. Dynamic Result Headlines for User's Team
    if (playerMatchResult) {
        const isHome = playerMatchResult.homeTeamId === gameState.team.id;
        const opponentId = isHome ? playerMatchResult.awayTeamId : playerMatchResult.homeTeamId;
        const opponent = updatedAllTeams.find(t => t.id === opponentId) || gameState.allTeams.find(t => t.id === opponentId);
        const playerTeam = gameState.team;
        const opponentName = opponent?.name || 'Rival';
        const userScore = isHome ? playerMatchResult.homeScore : playerMatchResult.awayScore;
        const oppScore = isHome ? playerMatchResult.awayScore : playerMatchResult.homeScore;

        let headline = '';
        let body = '';

        const topScorerName = playerMatchResult.scorers && playerMatchResult.scorers.length > 0 
            ? playerMatchResult.scorers[0].playerName 
            : null;

        if (userScore > oppScore) {
            if (userScore - oppScore >= 3) {
                headline = `🔥 Goleada contundente del ${playerTeam.name} (${userScore}-${oppScore})`;
                body = `Exhibición total de ${playerTeam.name} frente a ${opponentName}. ${topScorerName ? `${topScorerName} brilló con luz propia` : 'El equipo brilló en todas sus líneas'} en una jornada memorable.`;
            } else {
                headline = `✅ ${playerTeam.name} suma tres puntos de oro ante ${opponentName} (${userScore}-${oppScore})`;
                body = `Gran triunfo trabajado de ${playerTeam.name} para mantener la ilusión de la afición. ${topScorerName ? `Destacada actuación de ${topScorerName}.` : ''}`;
            }
        } else if (userScore === oppScore) {
            headline = `🤝 Empate ${userScore}-${oppScore} entre ${playerTeam.name} y ${opponentName}`;
            body = `Partido intenso y dividido en el que ambos equipos se repartieron los puntos tras 90 minutos de máxima disputa.`;
        } else {
            headline = `❌ ${playerTeam.name} tropieza ${userScore}-${oppScore} ante ${opponentName}`;
            body = `${playerTeam.name} no logró imponer su juego frente a ${opponentName} y buscará reencontrarse con la victoria en la siguiente jornada.`;
        }

        newsToAdd.unshift({
            id: `match_news_${Date.now()}_${newWeek}`,
            headline,
            body,
            date: formatDate(newDate),
            type: 'standard'
        });
    }

    return {
        newsToAdd,
        generatedOffers
    };
}
