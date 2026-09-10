import { Team, LeagueTableRow, LeagueId } from '../../types';
import { computeArgentineRelegation } from '../argentinaRegulations';

// Map of all promotion/relegation pairs: [First Division, Second Division]
export const PROMOTION_RELEGATION_PAIRS: [LeagueId, LeagueId][] = [
    [LeagueId.PREMIER_LEAGUE, LeagueId.CHAMPIONSHIP],
    [LeagueId.LA_LIGA, LeagueId.SEGUNDA_DIVISION_ESP],
    [LeagueId.BUNDESLIGA, LeagueId.ZWEITE_BUNDESLIGA],
    [LeagueId.SERIE_A, LeagueId.SERIE_B_ITA],
    [LeagueId.LIGUE_1, LeagueId.LIGUE_2],
    [LeagueId.LIGA_ARGENTINA, LeagueId.PRIMERA_NACIONAL],
    [LeagueId.BRASILEIRAO, LeagueId.SERIE_B_BR],
];

export const handlePromotionRelegation = (allTeams: Team[], leagueTables: Record<LeagueId, LeagueTableRow[]>): Team[] => {
    let updatedTeams = [...allTeams];

    for (const [div1, div2] of PROMOTION_RELEGATION_PAIRS) {
        const div1Table = leagueTables[div1] || [];
        const div2Table = leagueTables[div2] || [];

        if (!div1Table.length || !div2Table.length) continue;

        const sortTable = (table: LeagueTableRow[]) => [...table].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });

        const sortedDiv1 = sortTable(div1Table);
        const sortedDiv2 = sortTable(div2Table);

        let relegatedIds: number[] = [];
        let promotedIds: number[] = [];

        if (div1 === LeagueId.LIGA_ARGENTINA) {
            // Official AFA regulation: 2 descensos (Promedios + Tabla Anual con prioridad de Promedios)
            const argRelegation = computeArgentineRelegation(div1Table);
            relegatedIds = [...argRelegation.relegatedIds];

            // 2 Promoted teams from Primera Nacional (Leaders of Reducido/Final or top positions)
            const zoneATable = div2Table.filter(r => r.zone === 'A').sort((a, b) => b.points - a.points);
            const zoneBTable = div2Table.filter(r => r.zone === 'B').sort((a, b) => b.points - a.points);
            
            const promo1 = zoneATable[0]?.teamId || sortedDiv2[0]?.teamId;
            const promo2 = zoneBTable[0]?.teamId || sortedDiv2[1]?.teamId;
            if (promo1) promotedIds.push(promo1);
            if (promo2 && promo2 !== promo1) promotedIds.push(promo2);
        } else {
            relegatedIds = sortedDiv1.slice(-3).map(r => r.teamId);
            promotedIds = sortedDiv2.slice(0, 3).map(r => r.teamId);
        }

        // Preserve zone balance for Liga Argentina (15 in A, 15 in B) and Primera Nacional (19 in A, 19 in B)
        const relegatedZones = relegatedIds.map(id => allTeams.find(t => t.id === id)?.zone || 'A');
        const promotedZones = promotedIds.map(id => allTeams.find(t => t.id === id)?.zone || 'A');

        const relZoneMap = new Map<number, 'A' | 'B'>();
        const promZoneMap = new Map<number, 'A' | 'B'>();

        // Promoted teams take the zones vacated by relegated teams in div1
        promotedIds.forEach((pId, idx) => {
            promZoneMap.set(pId, (relegatedZones[idx] || (idx % 2 === 0 ? 'A' : 'B')) as 'A' | 'B');
        });

        // Relegated teams take the zones vacated by promoted teams in div2
        relegatedIds.forEach((rId, idx) => {
            relZoneMap.set(rId, (promotedZones[idx] || (idx % 2 === 0 ? 'A' : 'B')) as 'A' | 'B');
        });

        updatedTeams = updatedTeams.map(team => {
            if (relegatedIds.includes(team.id)) {
                const newZone = div1 === LeagueId.LIGA_ARGENTINA ? relZoneMap.get(team.id) || 'A' : team.zone;
                return { ...team, leagueId: div2, zone: newZone };
            }
            if (promotedIds.includes(team.id)) {
                const assignedZone = div1 === LeagueId.LIGA_ARGENTINA ? promZoneMap.get(team.id) || 'A' : undefined;
                return { ...team, leagueId: div1, zone: assignedZone };
            }
            return team;
        });
    }

    return updatedTeams;
};
