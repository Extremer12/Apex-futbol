import { GameMode, LeagueId, Offer, Player } from '../types';
import { getLeagueCountryCode, resolvePlayerNationality } from './nationalityService';

export const MAX_FIRST_TEAM_SIZE = 31;
export const MIN_FIRST_TEAM_SIZE = 16;
export const MAX_RESERVE_SIZE = 15;
export const MAX_OFFERS_PER_PLAYER = 3;
export const MAX_TOTAL_ACTIVE_OFFERS = 5;
export const OFFER_EXPIRY_WEEKS = 3;

export function isRealisticMode(_gameMode?: GameMode): boolean {
    return true;
}

export function canSubmitToLeaderboard(_gameMode?: GameMode): boolean {
    return true;
}

export function isForeignPlayer(player: Player, leagueId?: LeagueId | 'CONMEBOL'): boolean {
    const homeCountry = getLeagueCountryCode(leagueId);
    const nat = resolvePlayerNationality(player, leagueId);
    return nat !== homeCountry;
}

export function countForeignPlayers(squad: Player[], leagueId?: LeagueId | 'CONMEBOL'): number {
    return squad.reduce((acc, p) => acc + (isForeignPlayer(p, leagueId) ? 1 : 0), 0);
}

export interface SquadValidationResult {
    allowed: boolean;
    target?: 'FIRST_TEAM' | 'RESERVE' | 'BLOCKED';
    reason?: string;
}

export function canRegisterInFirstTeam(
    firstTeam: Player[],
    reserve: Player[],
    _incomingPlayer: Player,
    _leagueId?: LeagueId | 'CONMEBOL',
    _gameMode?: GameMode
): SquadValidationResult {
    const firstTeamFull = firstTeam.length >= MAX_FIRST_TEAM_SIZE;
    const reserveFull = reserve.length >= MAX_RESERVE_SIZE;

    if (firstTeamFull && reserveFull) {
        return {
            allowed: false,
            target: 'BLOCKED',
            reason: `Primer Equipo (${MAX_FIRST_TEAM_SIZE}/${MAX_FIRST_TEAM_SIZE}) y Reserva (${MAX_RESERVE_SIZE}/${MAX_RESERVE_SIZE}) están completos. Debes vender o liberar jugadores primero.`
        };
    }

    if (firstTeamFull && !reserveFull) {
        return {
            allowed: true,
            target: 'RESERVE',
            reason: `Primer Equipo lleno (${MAX_FIRST_TEAM_SIZE}/${MAX_FIRST_TEAM_SIZE}). El jugador ingresará a la Reserva.`
        };
    }

    return { allowed: true, target: 'FIRST_TEAM' };
}

export function canPromoteToFirstTeam(
    firstTeam: Player[],
    _player?: Player,
    _leagueId?: LeagueId | 'CONMEBOL',
    _gameMode?: GameMode
): { allowed: boolean; reason?: string } {
    if (firstTeam.length >= MAX_FIRST_TEAM_SIZE) {
        return {
            allowed: false,
            reason: `Primer Equipo lleno (${firstTeam.length}/${MAX_FIRST_TEAM_SIZE}). Vende o baja un jugador a Reserva primero.`
        };
    }

    return { allowed: true };
}

export function canMoveToReserve(
    firstTeam: Player[],
    reserve: Player[]
): { allowed: boolean; reason?: string } {
    if (firstTeam.length <= MIN_FIRST_TEAM_SIZE) {
        return {
            allowed: false,
            reason: `Debes conservar al menos ${MIN_FIRST_TEAM_SIZE} futbolistas en el Primer Equipo para competir.`
        };
    }
    if (reserve.length >= MAX_RESERVE_SIZE) {
        return {
            allowed: false,
            reason: `La Reserva está completa (${reserve.length}/${MAX_RESERVE_SIZE}). Asciende o libera un juvenil antes.`
        };
    }
    return { allowed: true };
}

export function canAddYouthProspect(
    firstTeam: Player[],
    reserve: Player[]
): { allowed: boolean; reason?: string } {
    if (reserve.length >= MAX_RESERVE_SIZE) {
        if (firstTeam.length >= MAX_FIRST_TEAM_SIZE) {
            return {
                allowed: false,
                reason: `Primer Equipo (${MAX_FIRST_TEAM_SIZE}/${MAX_FIRST_TEAM_SIZE}) y Reserva (${MAX_RESERVE_SIZE}/${MAX_RESERVE_SIZE}) llenos. No pueden ingresar nuevos juveniles hasta vender.`
            };
        }
        return {
            allowed: false,
            reason: `Reserva completa (${MAX_RESERVE_SIZE}/${MAX_RESERVE_SIZE}). Asciende o libera jugadores para recibir nuevos juveniles.`
        };
    }
    return { allowed: true };
}

/**
 * Enforces offer hygiene:
 * - Removes offers for players no longer at the club or marked untouchable
 * - Drops expired offers or closes stale offers outside active transfer windows
 * - Deduplicates multiple bids from the same buyer for the same player (keeps best)
 * - Caps active offers per player at MAX_OFFERS_PER_PLAYER (keeps highest offers)
 */
export function sanitizeIncomingOffers(
    offers: Offer[],
    squadPlayers: Player[],
    currentWeek: number,
    windowOpen: boolean
): Offer[] {
    if (!windowOpen) {
        return [];
    }

    const playerMap = new Map<number, Player>(squadPlayers.map(p => [p.id, p]));
    const byPlayer = new Map<number, Map<number, Offer>>();

    for (const offer of offers) {
        const player = playerMap.get(offer.playerId);
        if (!player || player.isUntouchable) continue;
        if (offer.expiresWeek !== undefined && currentWeek > offer.expiresWeek) continue;

        let clubMap = byPlayer.get(offer.playerId);
        if (!clubMap) {
            clubMap = new Map<number, Offer>();
            byPlayer.set(offer.playerId, clubMap);
        }

        const existing = clubMap.get(offer.offeringTeamId);
        const offerAmount = offer.counterOfferValue || offer.offerValue;
        const existingAmount = existing ? (existing.counterOfferValue || existing.offerValue) : -1;

        if (!existing || offerAmount >= existingAmount) {
            clubMap.set(offer.offeringTeamId, {
                ...offer,
                createdWeek: offer.createdWeek ?? currentWeek,
                expiresWeek: offer.expiresWeek ?? (currentWeek + OFFER_EXPIRY_WEEKS),
            });
        }
    }

    const result: Offer[] = [];
    for (const clubMap of byPlayer.values()) {
        const sortedForPlayer = Array.from(clubMap.values()).sort(
            (a, b) => (b.counterOfferValue || b.offerValue) - (a.counterOfferValue || a.offerValue)
        );
        result.push(...sortedForPlayer.slice(0, MAX_OFFERS_PER_PLAYER));
    }

    return result.sort(
        (a, b) => (b.counterOfferValue || b.offerValue) - (a.counterOfferValue || a.offerValue)
    );
}
