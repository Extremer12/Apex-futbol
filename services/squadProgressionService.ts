import { Team, Player, SquadPower, LeagueId } from '../types';
import { generateYouthPlayer, generatePlayerId } from './simulation';
import { generateRandomName } from '../utils';

export interface NotableTransferRecord {
    playerName: string;
    fromTeam: string;
    toTeam: string;
    fee: number;
    rating: number;
    position?: string;
}

/**
 * Calculates a team's actual competitive strength from its squad members.
 * Weights Starting XI (top players for each positional line) at 80% and bench depth at 20%.
 */
export function calculateSquadPower(team: Team): SquadPower {
    if (!team.squad || team.squad.length === 0) {
        const fallback = team.tier === 'Top' ? 80 : team.tier === 'Mid' ? 73 : 66;
        return { overall: fallback, attack: fallback, midfield: fallback, defense: fallback };
    }

    // Separate by position and sort each group by rating descending
    const gks = team.squad.filter(p => p.position === 'POR').sort((a, b) => b.rating - a.rating);
    const defs = team.squad.filter(p => p.position === 'DEF').sort((a, b) => b.rating - a.rating);
    const mids = team.squad.filter(p => p.position === 'CEN').sort((a, b) => b.rating - a.rating);
    const fwds = team.squad.filter(p => p.position === 'DEL').sort((a, b) => b.rating - a.rating);

    // Pick top Starting XI components: 1 GK, top 4 DEF, top 3-4 CEN, top 2-3 DEL
    const topGk = gks.slice(0, 1);
    const topDefs = defs.slice(0, 4);
    const topMids = mids.slice(0, 4);
    const topFwds = fwds.slice(0, 2);

    // Defense line power: average of top defenders + goalkeeper
    const defPool = [...topDefs, ...topGk];
    const defense = defPool.length > 0
        ? Math.round(defPool.reduce((acc, p) => acc + p.rating, 0) / defPool.length)
        : Math.round(team.squad.slice(0, 5).reduce((acc, p) => acc + p.rating, 0) / Math.min(5, team.squad.length));

    // Midfield line power
    const midfield = topMids.length > 0
        ? Math.round(topMids.reduce((acc, p) => acc + p.rating, 0) / topMids.length)
        : Math.round(team.squad.slice(0, 4).reduce((acc, p) => acc + p.rating, 0) / Math.min(4, team.squad.length));

    // Attack line power: top forwards + highest rated attacking midfielder if available
    const attPool = [...topFwds];
    if (topMids.length > 0) attPool.push(topMids[0]);
    const attack = attPool.length > 0
        ? Math.round(attPool.reduce((acc, p) => acc + p.rating, 0) / attPool.length)
        : Math.round(team.squad.slice(0, 3).reduce((acc, p) => acc + p.rating, 0) / Math.min(3, team.squad.length));

    // Overall Starting XI (11 players)
    const startingXI = [...topGk, ...topDefs, ...topMids, ...topFwds];
    const xiRating = startingXI.length > 0
        ? startingXI.reduce((acc, p) => acc + p.rating, 0) / startingXI.length
        : 70;

    // Remaining bench players (up to 7 subs)
    const usedIds = new Set(startingXI.map(p => p.id));
    const bench = team.squad.filter(p => !usedIds.has(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 7);
    const benchRating = bench.length > 0
        ? bench.reduce((acc, p) => acc + p.rating, 0) / bench.length
        : xiRating - 4;

    const overall = Math.round((xiRating * 0.8) + (benchRating * 0.2));

    return {
        overall: Math.max(45, Math.min(99, overall)),
        attack: Math.max(45, Math.min(99, attack)),
        midfield: Math.max(45, Math.min(99, midfield)),
        defense: Math.max(45, Math.min(99, defense))
    };
}

/**
 * Realistic player aging, progression, and retirement curve.
 * Youngsters grow towards potential; prime players consolidate; veterans experience gradual, then accelerated decline.
 */
export function processPlayerAgingAndProgression(player: Player): {
    updatedPlayer: Player;
    retired: boolean;
} {
    const age = (player.age || 24) + 1;
    let rating = player.rating;
    let value = player.value;
    const potential = player.potential || Math.min(99, rating + (age <= 21 ? 8 : age <= 25 ? 4 : 1));

    let retired = false;

    if (age <= 21) {
        // High Youth Growth: +1 to +4 OVR per year (bounded by potential)
        const growth = Math.floor(Math.random() * 4) + 1;
        rating = Math.min(potential, rating + growth);
        value = Math.round((value * 1.35 + 0.5) * 10) / 10;
    } else if (age <= 25) {
        // Developing Prime: +1 to +2 OVR per year towards potential
        if (rating < potential) {
            const growth = Math.floor(Math.random() * 2) + 1;
            rating = Math.min(potential, rating + growth);
        }
        value = Math.round((value * 1.15 + 0.2) * 10) / 10;
    } else if (age <= 29) {
        // Absolute Peak / Prime: stability, +/- 1 fluctuation
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        rating = Math.max(50, Math.min(potential, rating + delta));
    } else if (age <= 32) {
        // Early Veteran: slight plateau/minor decline (-0 to -1 OVR)
        const decline = Math.random() < 0.65 ? 1 : 0;
        rating = Math.max(45, rating - decline);
        value = Math.max(0.2, Math.round(value * 0.8 * 10) / 10);
    } else if (age <= 35) {
        // Veteran Decline: -1 to -3 OVR per year, lower market value
        const decline = Math.floor(Math.random() * 3) + 1;
        rating = Math.max(40, rating - decline);
        value = Math.max(0.1, Math.round(value * 0.6 * 10) / 10);

        // Retirement chance starts (10% at 33, 20% at 34, 30% at 35)
        const retireProb = age === 33 ? 0.10 : age === 34 ? 0.20 : 0.30;
        if (Math.random() < retireProb) {
            retired = true;
        }
    } else {
        // Elder Decline (36+): -2 to -5 OVR per year, high retirement rate
        const decline = Math.floor(Math.random() * 4) + 2;
        rating = Math.max(38, rating - decline);
        value = Math.max(0.1, Math.round(value * 0.4 * 10) / 10);

        // Escalating retirement chance
        const retireProb = age === 36 ? 0.45 : age === 37 ? 0.65 : age === 38 ? 0.85 : 0.98;
        if (Math.random() < retireProb || rating < 68) {
            retired = true;
        }
    }

    const updatedPlayer: Player = {
        ...player,
        age,
        rating,
        potential,
        value,
        contractYears: Math.max(0, player.contractYears - 1),
        condition: 100,
        isInjured: false,
        isSuspended: false,
        injuryWeeksRemaining: 0,
        suspensionWeeksRemaining: 0,
        stats: { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 }
    };

    return { updatedPlayer, retired };
}

/**
 * Creates a "Regen" for a retiring veteran or star.
 * Returns a young player (17-19) with a realistic initial media and high ceiling, carrying on the torch!
 */
export function generateRegenPlayer(retiredPlayer: Player, teamTier: Team['tier'] = 'Mid'): Player {
    const positions: Player['position'][] = ['POR', 'DEF', 'CEN', 'DEL'];
    // Preserve retired player's position if valid, else pick random
    const position = positions.includes(retiredPlayer.position) ? retiredPlayer.position : positions[Math.floor(Math.random() * positions.length)];

    // Initial rating is modest (62-72), so they must be developed
    const baseInitial = teamTier === 'Top' ? 68 : teamTier === 'Mid' ? 64 : 60;
    const rating = Math.max(55, Math.min(74, baseInitial + Math.floor(Math.random() * 9) - 4));

    // Potential is proportional to the retired player's legacy (up to 88-92 for superstars)
    const retiredLegacy = retiredPlayer.potential || (retiredPlayer.rating + 10);
    const potential = Math.max(rating + 8, Math.min(94, Math.round(retiredLegacy * 0.95 + (Math.random() * 6 - 3))));

    const age = 17 + Math.floor(Math.random() * 3); // 17, 18, or 19
    const value = Math.max(0.3, Math.round((rating * rating * rating) / 7500) / 10);

    return {
        id: generatePlayerId(),
        name: generateRandomName(),
        position,
        rating,
        potential,
        value,
        wage: Math.round(value * 800) + 400,
        morale: 'Contento',
        contractYears: 3 + Math.floor(Math.random() * 2), // 3-4 years
        age,
        isTransferListed: false,
        condition: 100,
        isInjured: false,
        isSuspended: false,
        stats: { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 }
    };
}

export interface NotableTransferRecord {
    playerName: string;
    fromTeam: string;
    toTeam: string;
    fee: number;
    rating: number;
}

/**
 * Simulates active transfers between AI clubs:
 * Top clubs buy rising stars; lower/mid clubs cash in and reinvest; clubs balance deficits.
 * User's squad is completely protected from unapproved sales.
 */
export function simulateAITransferWindow(
    allTeams: Team[],
    userTeamId: number
): {
    updatedTeams: Team[];
    notableTransfers: NotableTransferRecord[];
} {
    const teamsCopy = allTeams.map(t => ({
        ...t,
        squad: [...t.squad]
    }));

    const notableTransfers: NotableTransferRecord[] = [];
    const aiTeams = teamsCopy.filter(t => t.id !== userTeamId);

    if (aiTeams.length < 2) return { updatedTeams: teamsCopy, notableTransfers };

    // Conduct 15-25 realistic transfers across AI clubs
    const targetTransfers = 15 + Math.floor(Math.random() * 11);

    for (let i = 0; i < targetTransfers; i++) {
        // Pick an AI buyer that has budget
        const potentialBuyers = aiTeams.filter(t => t.budget >= 3.0 && t.squad.length < 26);
        if (potentialBuyers.length === 0) break;

        const buyer = potentialBuyers[Math.floor(Math.random() * potentialBuyers.length)];

        // Find positions buyer might need (less than ideal count in squad)
        const posCounts = {
            POR: buyer.squad.filter(p => p.position === 'POR').length,
            DEF: buyer.squad.filter(p => p.position === 'DEF').length,
            CEN: buyer.squad.filter(p => p.position === 'CEN').length,
            DEL: buyer.squad.filter(p => p.position === 'DEL').length,
        };

        const targetPos: Player['position'] = posCounts.POR < 2 ? 'POR' :
            posCounts.DEL < 4 ? 'DEL' :
            posCounts.DEF < 6 ? 'DEF' :
            posCounts.CEN < 6 ? 'CEN' :
            (['DEF', 'CEN', 'DEL'] as Player['position'][])[Math.floor(Math.random() * 3)];

        // Pick a seller (excluding buyer and user) that has surplus or lower tier
        const sellers = aiTeams.filter(t => 
            t.id !== buyer.id && 
            t.squad.length >= 21 && 
            t.squad.some(p => p.position === targetPos && p.rating >= 68 && p.value <= buyer.budget * 0.85)
        );

        if (sellers.length === 0) continue;

        const seller = sellers[Math.floor(Math.random() * sellers.length)];

        // Candidate players in seller's squad
        const candidates = seller.squad.filter(p => 
            p.position === targetPos && 
            p.rating >= 68 && 
            p.value <= buyer.budget * 0.85 &&
            (p.age || 25) <= 30 // AI prefers signing players under 30
        );

        if (candidates.length === 0) continue;

        // Choose player (best value/rating match)
        candidates.sort((a, b) => b.rating - a.rating);
        const playerToBuy = candidates[0];

        // Transfer fee calculation: player value + premium
        const fee = Math.round((playerToBuy.value * (1.1 + Math.random() * 0.3)) * 10) / 10;

        if (buyer.budget < fee) continue;

        // Execute transfer
        buyer.budget = Math.max(0.5, Math.round((buyer.budget - fee) * 10) / 10);
        seller.budget = Math.round((seller.budget + fee) * 10) / 10;

        // Move player
        seller.squad = seller.squad.filter(p => p.id !== playerToBuy.id);
        const playerInNewClub: Player = {
            ...playerToBuy,
            contractYears: 3 + Math.floor(Math.random() * 2),
            morale: 'Contento',
            isTransferListed: false
        };
        buyer.squad.push(playerInNewClub);

        // Record if significant transfer
        if (playerToBuy.rating >= 76 || fee >= 8.0) {
            notableTransfers.push({
                playerName: playerToBuy.name,
                fromTeam: seller.name,
                toTeam: buyer.name,
                fee,
                rating: playerToBuy.rating,
                position: playerToBuy.position
            });
        }
    }

    return { updatedTeams: teamsCopy, notableTransfers };
}

/**
 * Master multi-season progression handler.
 * Executed at season end to refresh player ages, process retirements, spawn regens, execute AI transfers, and recalculate squad powers.
 */
export function processFullSeasonSquadProgression(
    allTeams: Team[],
    userTeamId: number
): {
    updatedTeams: Team[];
    retiredLegends: { name: string; formerClub: string; teamName: string; rating: number; age: number }[];
    notableTransfers: NotableTransferRecord[];
    regensCount: number;
} {
    const retiredLegends: { name: string; formerClub: string; teamName: string; rating: number; age: number }[] = [];
    let regensCount = 0;

    // 1. Process aging, decline, retirements and regens for every team
    const teamsAfterAging = allTeams.map(team => {
        const isUserTeam = team.id === userTeamId;
        const remainingSquad: Player[] = [];
        const regensForTeam: Player[] = [];

        team.squad.forEach(player => {
            const { updatedPlayer, retired } = processPlayerAgingAndProgression(player);

            if (retired) {
                // If notable veteran, record for news
                if (player.rating >= 76) {
                    retiredLegends.push({
                        name: player.name,
                        formerClub: team.name,
                        teamName: team.name,
                        rating: player.rating,
                        age: player.age || 36
                    });
                }

                // Star or veteran regens: rebirth talent into the squad!
                if (player.rating >= 73 || Math.random() < 0.6) {
                    const regen = generateRegenPlayer(player, team.tier, team.leagueId);
                    regensForTeam.push(regen);
                    regensCount++;
                }
            } else {
                remainingSquad.push(updatedPlayer);
            }
        });

        // Combine remaining squad with generated regens
        let squad = [...remainingSquad, ...regensForTeam];

        // Ensure minimum squad size of 20 players (and maximum 26)
        while (squad.length < 20) {
            squad.push(generateYouthPlayer(team.tier));
        }
        if (squad.length > 26 && !isUserTeam) {
            // AI trims lowest rated fringe players
            squad.sort((a, b) => b.rating - a.rating);
            squad = squad.slice(0, 26);
        }

        return {
            ...team,
            squad
        };
    });

    // 2. Simulate AI-to-AI transfer market
    const { updatedTeams: teamsAfterTransfers, notableTransfers } = simulateAITransferWindow(teamsAfterAging, userTeamId);

    // 3. Recalculate dynamic squad power for every club
    const finalTeams = teamsAfterTransfers.map(team => ({
        ...team,
        squadPower: calculateSquadPower(team)
    }));

    return {
        updatedTeams: finalTeams,
        retiredLegends,
        notableTransfers,
        regensCount
    };
}
