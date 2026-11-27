/**
 * Global Player & Team Indexing Service
 *
 * Indexes the full 508-club / ~11,200-player database ONCE whenever any club's
 * `squad` array genuinely changes (determined by per-team `t.squad` reference
 * equality). Eliminates repeated nested 11,200-player scans across Dashboard,
 * TransfersScreen, and PlayerDetailModal.
 */

import { LeagueId, Player, Team } from '../types';

export interface MarketOpportunity {
    player: Player;
    clubName: string;
    teamId: number;
    tag: 'Transferible' | 'Fin Contrato' | 'Destacado';
}

export interface GlobalPlayerIndex {
    version: number;
    teamsById: Map<number, Team>;
    allPlayers: Player[];
    playersById: Map<number, Player>;
    playersByName: Map<string, Player>;
    playersByNameLower: Map<string, Player>;
    playerTeamById: Map<number, Team>;
    transferListedPool: Array<{ player: Player; team: Team }>;
    expiringStarsPool: Array<{ player: Player; team: Team }>;
    topRatedPool: Array<{ player: Player; team: Team }>;
}

const EMPTY_INDEX: GlobalPlayerIndex = {
    version: 0,
    teamsById: new Map(),
    allPlayers: [],
    playersById: new Map(),
    playersByName: new Map(),
    playersByNameLower: new Map(),
    playerTeamById: new Map(),
    transferListedPool: [],
    expiringStarsPool: [],
    topRatedPool: []
};

let cachedAllTeamsRef: Team[] | null = null;
let cachedTeamSquads: Map<number, Player[]> = new Map();
let cachedIndex: GlobalPlayerIndex | null = null;
let currentIndexVersion = 0;

// Secondary memoized projections keyed by squads version + params
let cachedLeagueProjectionKey = '';
let cachedLeagueProjection: {
    leaguePlayers: Player[];
    leaguePlayersById: Map<number, Player>;
    leaguePlayersByName: Map<string, Player>;
} | null = null;

let cachedMarketAvailKey: {
    version: number;
    myTeamId: number;
    mySquad: Player[];
    youthAcademy: Player[];
} | null = null;
let cachedMarketAvailResult: {
    availablePlayers: Player[];
    playerTeamMap: Map<number, Team>;
} | null = null;

function didSquadsChange(allTeams: Team[]): boolean {
    if (!cachedIndex || allTeams.length !== cachedTeamSquads.size) {
        return true;
    }
    for (let i = 0; i < allTeams.length; i++) {
        const t = allTeams[i];
        if (cachedTeamSquads.get(t.id) !== t.squad) {
            return true;
        }
    }
    return false;
}

/**
 * Returns the canonical global player & team index. Rebuilds the 11,200-player
 * index only when at least one team's `squad` reference changes.
 */
export function getGlobalPlayerIndex(allTeams?: Team[] | null): GlobalPlayerIndex {
    if (!allTeams || allTeams.length === 0) {
        return EMPTY_INDEX;
    }
    if (allTeams === cachedAllTeamsRef && cachedIndex) {
        return cachedIndex;
    }

    // Fast path: if only team metadata (coach, budget, customLineup) changed without altering any squad
    if (!didSquadsChange(allTeams) && cachedIndex) {
        const updatedTeamsById = new Map<number, Team>();
        for (let i = 0; i < allTeams.length; i++) {
            updatedTeamsById.set(allTeams[i].id, allTeams[i]);
        }
        cachedAllTeamsRef = allTeams;
        cachedIndex = {
            ...cachedIndex,
            teamsById: updatedTeamsById
        };
        return cachedIndex;
    }

    // Full single-pass build over all clubs & players
    const nextVersion = ++currentIndexVersion;
    const teamsById = new Map<number, Team>();
    const nextSquadsMap = new Map<number, Player[]>();
    const allPlayers: Player[] = [];
    const playersById = new Map<number, Player>();
    const playersByName = new Map<string, Player>();
    const playersByNameLower = new Map<string, Player>();
    const playerTeamById = new Map<number, Team>();
    const transferListedPool: Array<{ player: Player; team: Team }> = [];
    const expiringStarsPool: Array<{ player: Player; team: Team }> = [];
    const topRatedPool: Array<{ player: Player; team: Team }> = [];

    for (let ti = 0; ti < allTeams.length; ti++) {
        const t = allTeams[ti];
        teamsById.set(t.id, t);
        nextSquadsMap.set(t.id, t.squad);

        const squad = t.squad;
        for (let pi = 0; pi < squad.length; pi++) {
            const p = squad[pi];
            allPlayers.push(p);
            playersById.set(p.id, p);
            playerTeamById.set(p.id, t);

            if (!playersByName.has(p.name)) {
                playersByName.set(p.name, p);
            }
            const lower = p.name.toLowerCase();
            if (!playersByNameLower.has(lower)) {
                playersByNameLower.set(lower, p);
            }

            // Collect compact candidate buckets for Dashboard O(1) lookup (need at most ~12 per bucket)
            if (p.isTransferListed && transferListedPool.length < 16) {
                transferListedPool.push({ player: p, team: t });
            } else if (p.contractYears <= 1 && p.rating >= 80 && expiringStarsPool.length < 16) {
                expiringStarsPool.push({ player: p, team: t });
            } else if (p.rating >= 85 && topRatedPool.length < 16) {
                topRatedPool.push({ player: p, team: t });
            }
        }
    }

    cachedAllTeamsRef = allTeams;
    cachedTeamSquads = nextSquadsMap;
    cachedIndex = {
        version: nextVersion,
        teamsById,
        allPlayers,
        playersById,
        playersByName,
        playersByNameLower,
        playerTeamById,
        transferListedPool,
        expiringStarsPool,
        topRatedPool
    };

    return cachedIndex;
}

/**
 * Resolves market opportunities for Dashboard in O(1) from pre-bucketed pools.
 */
export function getMarketOpportunities(
    allTeams: Team[] | undefined,
    excludeTeamId: number,
    limit: number = 4
): MarketOpportunity[] {
    const idx = getGlobalPlayerIndex(allTeams);
    const targets: MarketOpportunity[] = [];
    const seenIds = new Set<number>();

    const pushFrom = (
        pool: Array<{ player: Player; team: Team }>,
        tag: MarketOpportunity['tag']
    ) => {
        for (let i = 0; i < pool.length && targets.length < limit; i++) {
            const { player, team } = pool[i];
            if (team.id === excludeTeamId || seenIds.has(player.id)) continue;
            seenIds.add(player.id);
            targets.push({
                player,
                clubName: team.shortName || team.name,
                teamId: team.id,
                tag
            });
        }
    };

    pushFrom(idx.transferListedPool, 'Transferible');
    pushFrom(idx.expiringStarsPool, 'Fin Contrato');
    pushFrom(idx.topRatedPool, 'Destacado');

    return targets;
}

/**
 * Memoized league-level player lookup for Dashboard & NewsReaderModal.
 */
export function getLeaguePlayersIndex(
    allTeams: Team[] | undefined,
    leagueId: LeagueId | undefined,
    userTeamId: number | undefined
) {
    const idx = getGlobalPlayerIndex(allTeams);
    const key = `${idx.version}_${leagueId || ''}_${userTeamId || ''}`;
    if (cachedLeagueProjection && cachedLeagueProjectionKey === key) {
        return cachedLeagueProjection;
    }

    const leaguePlayers: Player[] = [];
    const leaguePlayersById = new Map<number, Player>();
    const leaguePlayersByName = new Map<string, Player>();

    if (allTeams) {
        for (let ti = 0; ti < allTeams.length; ti++) {
            const t = allTeams[ti];
            if (t.leagueId !== leagueId && t.id !== userTeamId) continue;
            for (let pi = 0; pi < t.squad.length; pi++) {
                const p = t.squad[pi];
                leaguePlayers.push(p);
                leaguePlayersById.set(p.id, p);
                leaguePlayersByName.set(p.name.toLowerCase(), p);
            }
        }
    }

    cachedLeagueProjectionKey = key;
    cachedLeagueProjection = { leaguePlayers, leaguePlayersById, leaguePlayersByName };
    return cachedLeagueProjection;
}

/**
 * Memoized transfer-market available players list derived from the already-indexed
 * global player table (avoids re-scanning 11,200 players in TransfersScreen).
 */
export function getAvailableMarketPlayers(
    allTeams: Team[] | undefined,
    myTeamId: number,
    mySquad: Player[],
    youthAcademy: Player[]
): { availablePlayers: Player[]; playerTeamMap: Map<number, Team> } {
    const idx = getGlobalPlayerIndex(allTeams);
    if (
        cachedMarketAvailKey &&
        cachedMarketAvailResult &&
        cachedMarketAvailKey.version === idx.version &&
        cachedMarketAvailKey.myTeamId === myTeamId &&
        cachedMarketAvailKey.mySquad === mySquad &&
        cachedMarketAvailKey.youthAcademy === youthAcademy
    ) {
        return cachedMarketAvailResult;
    }

    const excludedIds = new Set<number>();
    for (let i = 0; i < mySquad.length; i++) excludedIds.add(mySquad[i].id);
    for (let i = 0; i < youthAcademy.length; i++) excludedIds.add(youthAcademy[i].id);

    const availablePlayers: Player[] = [];
    for (let i = 0; i < idx.allPlayers.length; i++) {
        const p = idx.allPlayers[i];
        const ownerTeam = idx.playerTeamById.get(p.id);
        if (ownerTeam?.id === myTeamId || excludedIds.has(p.id)) continue;
        availablePlayers.push(p);
    }

    cachedMarketAvailKey = { version: idx.version, myTeamId, mySquad, youthAcademy };
    cachedMarketAvailResult = {
        availablePlayers,
        playerTeamMap: idx.playerTeamById
    };
    return cachedMarketAvailResult;
}
