import { GameState, NewsItem, Offer, Match, Team, PlayerMatchResult, CinematicEvent } from '../../types';
import { generateTransferOffer } from '../gameLogic';
import {
    buildContextualClubNews,
    buildPlayerOfTheWeekNews,
    buildPostMatchNews,
    cleanHeadlineText,
    getRegionalMediaSource
} from '../newsEngine';
import { formatDate, isTransferWindowOpen } from '../../utils';
import { MAX_OFFERS_PER_PLAYER, OFFER_EXPIRY_WEEKS } from '../squadRules';

export interface WeeklyNewsAndOffersResult {
    newsToAdd: NewsItem[];
    generatedOffers: Offer[];
}

export async function generateWeeklyNewsAndOffers(
    gameState: GameState,
    updatedSchedule: Match[],
    updatedAllTeams: Team[],
    playerMatchResult: PlayerMatchResult | null,
    simulatedWeek: number,
    newDate: Date,
    cinematicEvents: CinematicEvent[],
    isMidweek: boolean = false
): Promise<WeeklyNewsAndOffersResult> {
    const newsToAdd: NewsItem[] = [];

    // 1. Single unified post-match news report for user's match (eliminates duplicate match stories)
    const playerScheduleMatch = updatedSchedule.find(
        m => m.week === simulatedWeek &&
            (m.isMidweek === undefined || !!m.isMidweek === isMidweek) &&
            (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id) &&
            m.result
    );

    const hasUserMatch = !!(playerMatchResult || (playerScheduleMatch && playerScheduleMatch.result));

    if (hasUserMatch) {
        const homeTeamId = playerMatchResult?.homeTeamId ?? playerScheduleMatch?.homeTeamId ?? gameState.team.id;
        const awayTeamId = playerMatchResult?.awayTeamId ?? playerScheduleMatch?.awayTeamId ?? 0;
        const isHome = homeTeamId === gameState.team.id;
        const opponentId = isHome ? awayTeamId : homeTeamId;
        const opponent = updatedAllTeams.find(t => t.id === opponentId) || gameState.allTeams.find(t => t.id === opponentId);

        const homeScore = playerMatchResult?.homeScore ?? playerScheduleMatch?.result?.homeScore ?? 0;
        const awayScore = playerMatchResult?.awayScore ?? playerScheduleMatch?.result?.awayScore ?? 0;
        const scorers = playerMatchResult?.scorers ?? playerScheduleMatch?.result?.scorers ?? [];
        const competition = playerScheduleMatch?.competition;

        const leagueTable = gameState.team.leagueId !== 'CONMEBOL' ? (gameState.leagueTables?.[gameState.team.leagueId] || []) : [];
        const sorted = [...leagueTable].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
        const posIdx = sorted.findIndex(r => r.teamId === gameState.team.id);
        const leaguePosition = posIdx >= 0 ? posIdx + 1 : undefined;
        const leaguePoints = posIdx >= 0 ? sorted[posIdx].points : undefined;

        const matchChronicle = buildPostMatchNews({
            userTeam: gameState.team,
            opponent,
            homeTeamId,
            awayTeamId,
            homeScore,
            awayScore,
            competition,
            scorers,
            date: newDate,
            leaguePosition,
            leaguePoints,
        });
        newsToAdd.push(matchChronicle);
    } else {
        newsToAdd.push(buildContextualClubNews(gameState, newDate));
    }

    // 2. Player of the Week News
    const matchesThisWeek = updatedSchedule.filter(
        m => m.week === simulatedWeek &&
            (m.isMidweek === undefined || !!m.isMidweek === isMidweek) &&
            m.result
    );
    if (matchesThisWeek.length > 0 && Math.random() < 0.35) {
        const winningTeamsIds: number[] = [];
        matchesThisWeek.forEach(match => {
            if (!match.result) return;
            if (match.result.homeScore > match.result.awayScore) winningTeamsIds.push(match.homeTeamId);
            else if (match.result.awayScore > match.result.homeScore) winningTeamsIds.push(match.awayTeamId);
        });

        const candidatePlayers = updatedAllTeams
            .filter(t => winningTeamsIds.includes(t.id))
            .flatMap(t => t.squad.map(p => ({ player: p, team: t })))
            .filter(({ player }) => player.rating > 83);

        if (candidatePlayers.length > 0) {
            const { player, team } = candidatePlayers[Math.floor(Math.random() * candidatePlayers.length)];
            const match = matchesThisWeek.find(m => m.homeTeamId === team.id || m.awayTeamId === team.id);
            if (match && match.result) {
                const opponent = updatedAllTeams.find(t => t.id === (match.homeTeamId === team.id ? match.awayTeamId : match.homeTeamId));
                if (opponent) {
                    const resultString = `${team.name} ${match.result.homeScore}-${match.result.awayScore} ${opponent.name}`;
                    newsToAdd.push(buildPlayerOfTheWeekNews(player, team, opponent.name, resultString, newDate));
                }
            }
        }
    }

    // 3. AI Transfer Offers for Listed Players & Spontaneous Inquiries (Regulated to prevent spam)
    const generatedOffers: Offer[] = [];
    if (isTransferWindowOpen(gameState.currentWeek)) {
        const potentialBuyers = gameState.allTeams.filter(t => t.id !== gameState.team.id);
        const existingOffers = gameState.incomingOffers || [];
        const allUserPlayers = [...gameState.team.squad, ...(gameState.youthAcademy || [])];

        const countAndClubCheck = (playerId: number) => {
            const activeForPlayer = existingOffers.filter(o => o.playerId === playerId);
            const newForPlayer = generatedOffers.filter(o => o.playerId === playerId);
            const combined = [...activeForPlayer, ...newForPlayer];
            const usedClubs = new Set(combined.map(o => o.offeringTeamId));
            return { total: combined.length, usedClubs };
        };

        // Listed players get priority (capped at 3 active offers total per player)
        const transferListedPlayers = allUserPlayers.filter(p => p.isTransferListed && !p.isUntouchable);
        for (const player of transferListedPlayers) {
            const { total, usedClubs } = countAndClubCheck(player.id);
            if (total >= MAX_OFFERS_PER_PLAYER) continue;

            if (Math.random() < 0.65) {
                const eligibleBuyers = potentialBuyers.filter(b => !usedClubs.has(b.id));
                const offer = await generateTransferOffer(player, gameState.team, eligibleBuyers);
                if (offer) {
                    generatedOffers.push({
                        id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${player.id}`,
                        playerId: player.id,
                        createdWeek: simulatedWeek,
                        expiresWeek: simulatedWeek + OFFER_EXPIRY_WEEKS,
                        ...offer
                    });
                }
            }
        }

        // Spontaneous inquiries: max 2 per turn across non-untouchable players, skipping players already at cap
        const spontaneousTargets = allUserPlayers.filter(p =>
            !p.isTransferListed &&
            !p.isUntouchable &&
            (p.rating >= 77 || (p.age !== undefined && p.age <= 22 && p.rating >= 72))
        );
        // Shuffle to avoid repeatedly bidding on the first player in the array
        const shuffledTargets = [...spontaneousTargets].sort(() => 0.5 - Math.random());
        let spontaneousThisTurn = 0;

        for (const player of shuffledTargets) {
            if (spontaneousThisTurn >= 2) break;
            const { total, usedClubs } = countAndClubCheck(player.id);
            if (total >= MAX_OFFERS_PER_PLAYER) continue;

            if (Math.random() < 0.22) {
                const eligibleBuyers = potentialBuyers.filter(b => !usedClubs.has(b.id));
                const offer = await generateTransferOffer(player, gameState.team, eligibleBuyers);
                if (offer) {
                    spontaneousThisTurn++;
                    generatedOffers.push({
                        id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${player.id}`,
                        playerId: player.id,
                        createdWeek: simulatedWeek,
                        expiresWeek: simulatedWeek + OFFER_EXPIRY_WEEKS,
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
        const marketSource = getRegionalMediaSource(gameState.team.leagueId, 'transfer', currMonth);
        if (currMonth === 0) {
            newsToAdd.push({
                id: `market_open_jan_${Date.now()}`,
                headline: 'Mercado de Invierno Abierto: arranca la ventana de pases',
                subheadline: 'Los clubes ya pueden inscribir refuerzos y negociar cesiones o ventas.',
                body: 'Se abre oficialmente la ventana de traspasos de enero. Los directores deportivos y ojeadores intensifican las gestiones para potenciar los planteles de cara al tramo decisivo.',
                date: formatDate(newDate),
                type: 'transfer',
                sourceName: marketSource,
                tags: ['Mercado', 'Ventana Abierta'],
                isBreaking: true
            });
        } else if (currMonth === 1) {
            newsToAdd.push({
                id: `market_close_feb_${Date.now()}`,
                headline: 'Cierre de Mercado: finaliza el periodo invernal',
                subheadline: 'Las plantillas quedan cerradas hasta la apertura de mitad de año.',
                body: 'Concluye la ventana de fichajes de invierno. Los clubes deberán afrontar la competencia oficial con los futbolistas actualmente inscriptos en sus plantillas.',
                date: formatDate(newDate),
                type: 'transfer',
                sourceName: marketSource,
                tags: ['Mercado', 'Cierre']
            });
        } else if (currMonth === 6) {
            newsToAdd.push({
                id: `market_open_jul_${Date.now()}`,
                headline: 'Mercado de Verano Abierto: luz verde a las negociaciones',
                subheadline: 'Comienza el periodo estival de transferencias en el fútbol internacional.',
                body: 'Se inaugura oficialmente la ventana de fichajes de mitad de año. Se esperan movimientos estratégicos, renovaciones y grandes operaciones entre ligas.',
                date: formatDate(newDate),
                type: 'transfer',
                sourceName: marketSource,
                tags: ['Mercado', 'Ventana Abierta'],
                isBreaking: true
            });
        } else if (currMonth === 8) {
            newsToAdd.push({
                id: `market_close_sep_${Date.now()}`,
                headline: 'Deadline Day Finalizado: se cierra el mercado estival',
                subheadline: 'No se admitirán nuevas transferencias hasta la próxima ventana oficial.',
                body: 'El libro de pases ha cerrado sus puertas. A partir de hoy el foco vuelve íntegramente a la competencia en el terreno de juego.',
                date: formatDate(newDate),
                type: 'transfer',
                sourceName: marketSource,
                tags: ['Mercado', 'Deadline Day']
            });
        }
    }

    // 5. Cinematic Headline News
    if (cinematicEvents.length > 0) {
        const primaryEvent = cinematicEvents[0];
        const isTitleOrPromo = primaryEvent.type === 'LEAGUE_WIN' || primaryEvent.type === 'CUP_WIN' || primaryEvent.type === 'PROMOTION';
        newsToAdd.unshift({
            id: `cup_event_news_${simulatedWeek}_${Date.now()}`,
            headline: cleanHeadlineText(primaryEvent.title),
            subheadline: primaryEvent.subtitle,
            body: `${primaryEvent.subtitle}\n\nUn momento trascendental para la historia institucional de ${gameState.team.name} y sus socios.`,
            date: formatDate(newDate),
            type: isTitleOrPromo ? 'achievement' : primaryEvent.type === 'RELEGATION' ? 'warning' : 'institutional',
            sourceName: isTitleOrPromo ? 'Apex Global Wire' : 'Comunicado Oficial',
            isBreaking: true,
            tags: [typeof primaryEvent.metadata?.competition === 'string' ? primaryEvent.metadata.competition : 'Oficial'],
            teamId: gameState.team.id
        });
    }

    return {
        newsToAdd,
        generatedOffers
    };
}
