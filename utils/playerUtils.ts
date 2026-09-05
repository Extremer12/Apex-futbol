import { Player, PotentialTier, SquadRole } from '../types';

export const getPlayerAge = (player: Player): number => {
    return player.age || 24;
};

export const getPlayerPotential = (player: Player): number => {
    if (player.potential && player.potential > 0) {
        return Math.min(99, Math.max(player.rating, player.potential));
    }
    const age = getPlayerAge(player);
    const idSeed = (player.id * 17) % 9; // -4 to +4 pseudo-deterministic seed
    
    if (age <= 20) {
        const boost = 8 + Math.round((21 - age) * 2.5) + (idSeed - 4);
        return Math.min(96, Math.max(player.rating + 4, player.rating + boost));
    } else if (age <= 23) {
        const boost = 4 + Math.round((24 - age) * 1.8) + (idSeed % 4);
        return Math.min(94, Math.max(player.rating + 2, player.rating + boost));
    } else if (age <= 26) {
        const boost = Math.max(0, Math.round((27 - age) * 0.8));
        return Math.min(92, Math.max(player.rating, player.rating + boost));
    }
    return player.rating;
};

export const getPlayerPotentialTier = (player: Player): PotentialTier => {
    if (player.potentialTier) return player.potentialTier;
    const age = getPlayerAge(player);
    const pot = getPlayerPotential(player);

    if (pot >= 86 && age <= 22) return 'Wonderkid';
    if (pot >= 84 || player.rating >= 84) return 'Star';
    if (age >= 30) return 'Veteran';
    return 'Solid';
};

export const getTierBadge = (tier: PotentialTier) => {
    switch (tier) {
        case 'Wonderkid':
            return {
                label: '⭐ Promesa',
                longLabel: '⭐ Promesa Mundial',
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
                icon: '⭐'
            };
        case 'Star':
            return {
                label: '🌟 Estrella',
                longLabel: '🌟 Clase Mundial',
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
                icon: '🌟'
            };
        case 'Veteran':
            return {
                label: '🛡️ Veterano',
                longLabel: '🛡️ Líder Veterano',
                color: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
                icon: '🛡️'
            };
        case 'Solid':
        default:
            return {
                label: '⚽ Titular',
                longLabel: '⚽ Jugador de Club',
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                icon: '⚽'
            };
    }
};

export const getExpectedWage = (
    player: Player, 
    buyerTier: 'Top' | 'Mid' | 'Lower' = 'Mid',
    proposedRole: SquadRole = 'FirstTeam'
): number => {
    // Base wage computation based on rating
    let base = 5000;
    const r = player.rating;

    if (r >= 90) base = 250000 + (r - 90) * 45000;
    else if (r >= 85) base = 120000 + (r - 85) * 26000;
    else if (r >= 80) base = 55000 + (r - 80) * 13000;
    else if (r >= 75) base = 22000 + (r - 75) * 6500;
    else if (r >= 70) base = 10000 + (r - 70) * 2400;
    else base = Math.max(3000, 3000 + (r - 60) * 700);

    // If player has an existing wage that is higher, start from existing wage
    if (player.wage && player.wage > base * 0.8) {
        base = Math.max(base, player.wage * 1.1); // Expect a 10% raise on transfer
    }

    // Role modifier
    const roleMultipliers: Record<SquadRole, number> = {
        Key: 1.25,
        FirstTeam: 1.0,
        Rotation: 0.85,
        Prospect: 0.70
    };
    base *= roleMultipliers[proposedRole] || 1.0;

    // Buyer tier compensation: Lower tier clubs must offer extra incentive to convince players
    if (buyerTier === 'Lower') base *= 1.25;
    else if (buyerTier === 'Mid' && player.rating >= 82) base *= 1.15;

    return Math.round(base / 500) * 500; // Round to nearest 500
};

export const getPlayerReleaseClause = (player: Player): number => {
    if (player.releaseClause) return player.releaseClause;
    const multiplier = player.rating >= 88 ? 3.0 : player.rating >= 82 ? 2.2 : 1.6;
    return Math.round(player.value * multiplier * 10) / 10;
};
