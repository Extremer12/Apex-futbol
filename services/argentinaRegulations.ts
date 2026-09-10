import { Team, Match, LeagueTableRow, CupCompetition, LeagueId } from '../types';

export interface ArgentineQualification {
    libertadores: { teamId: number; reason: string }[];
    sudamericana: { teamId: number; reason: string }[];
}

export interface ArgentineRelegationResult {
    relegatedPromedioId: number;
    relegatedAnualId: number;
    relegatedIds: number[];
}

/**
 * Computes Argentine Primera División relegation according to exact AFA rules:
 * - Exactly 2 relegated teams.
 * - 1st: Last place in Tabla de Promedios.
 * - 2nd: Last place in Tabla Anual.
 * - If the same team is last in both, they relegate by Promedios, and the 2nd relegation
 *   shifts strictly to the penultimate (29th) of Tabla Anual.
 */
export function computeArgentineRelegation(argTable: LeagueTableRow[]): ArgentineRelegationResult {
    if (!argTable || argTable.length === 0) {
        return { relegatedPromedioId: 0, relegatedAnualId: 0, relegatedIds: [] };
    }

    // 1. Worst by Promedios (ascending order: lowest decimal coefficient first)
    const sortedByPromedio = [...argTable].sort((a, b) => {
        const promA = a.promedio ?? (a.played > 0 ? a.points / a.played : 0);
        const promB = b.promedio ?? (b.played > 0 ? b.points / b.played : 0);
        if (promA !== promB) return promA - promB;
        // In case of equal promedio decimal, fewer points total is lower
        const ptsA = a.pointsTotal ?? a.points;
        const ptsB = b.pointsTotal ?? b.points;
        return ptsA - ptsB;
    });

    const worstPromedio = sortedByPromedio[0];

    // 2. Worst by Tabla Anual (descending order by points: last index is 30th)
    const sortedAnual = [...argTable].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });

    const candidateAnual = sortedAnual[sortedAnual.length - 1];

    let worstAnual: LeagueTableRow;
    if (worstPromedio && candidateAnual && candidateAnual.teamId === worstPromedio.teamId) {
        // Priority rule: team relegates by Promedio, and the annual quota shifts to the penultimate (29th)
        worstAnual = sortedAnual[sortedAnual.length - 2] || candidateAnual;
    } else {
        worstAnual = candidateAnual;
    }

    const relegatedPromedioId = worstPromedio ? worstPromedio.teamId : 0;
    const relegatedAnualId = worstAnual ? worstAnual.teamId : 0;
    const relegatedIds = [relegatedPromedioId, relegatedAnualId].filter(id => id > 0);

    return {
        relegatedPromedioId,
        relegatedAnualId,
        relegatedIds
    };
}

/**
 * Computes Argentine International Cup Qualifications with the official AFA "Cascada" system:
 * Exactly 6 spots for Copa Libertadores:
 *   1. Campeón Torneo Apertura
 *   2. Campeón Torneo Clausura
 *   3. Campeón Copa Argentina
 *   4. 1° Tabla Anual (mejor no campeón)
 *   5. 2° Tabla Anual (segundo mejor no campeón)
 *   6. 3° Tabla Anual (tercer mejor no campeón)
 * Exactly 6 spots for Copa Sudamericana:
 *   - Siguientes 6 mejores equipos de la Tabla Anual (posiciones 4° a 9° de los no clasificados a Libertadores).
 *
 * Cascada rule:
 *   - If any team wins a tournament or cup and also ranks in the top of Tabla Anual, their
 *     annual spot is liberated and cascades down to the next team in line.
 *   - If the same team wins both Apertura and Clausura, they qualify via Campeón 1, and the
 *     second spot is awarded to the next best in Tabla Anual.
 */
export function computeArgentineInternationalQualification(
    table: LeagueTableRow[],
    cups: {
        aperturaPlayoffs?: CupCompetition;
        clausuraPlayoffs?: CupCompetition;
        copaArgentina?: CupCompetition;
        copaLibertadores?: CupCompetition;
        copaSudamericana?: CupCompetition;
    }
): ArgentineQualification {
    const sortedAnual = [...table].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });

    const libertadores: { teamId: number; reason: string }[] = [];
    const sudamericana: { teamId: number; reason: string }[] = [];

    const isLibertadores = (id: number) => libertadores.some(q => q.teamId === id);

    // 0. Continental Champions priority (if an Argentine team won Libertadores)
    const continentalWinner = cups.copaLibertadores?.winnerId;
    if (continentalWinner && sortedAnual.some(r => r.teamId === continentalWinner)) {
        libertadores.push({ teamId: continentalWinner, reason: 'Campeón Copa Libertadores' });
    }

    // 1. Campeón Torneo Apertura
    const aperturaWinner = cups.aperturaPlayoffs?.winnerId;
    if (aperturaWinner && !isLibertadores(aperturaWinner)) {
        libertadores.push({ teamId: aperturaWinner, reason: 'Campeón Torneo Apertura' });
    }

    // 2. Campeón Torneo Clausura
    const clausuraWinner = cups.clausuraPlayoffs?.winnerId;
    if (clausuraWinner && !isLibertadores(clausuraWinner)) {
        libertadores.push({ teamId: clausuraWinner, reason: 'Campeón Torneo Clausura' });
    }

    // 3. Campeón Copa Argentina
    const copaArgWinner = cups.copaArgentina?.winnerId;
    if (copaArgWinner && !isLibertadores(copaArgWinner)) {
        libertadores.push({ teamId: copaArgWinner, reason: 'Campeón Copa Argentina' });
    }

    // 4. Fill remaining Libertadores spots (up to 6) via Tabla Anual in order (La Cascada)
    let anualLibertadoresIndex = 1;
    for (const row of sortedAnual) {
        if (libertadores.length >= 6) break;
        if (!isLibertadores(row.teamId)) {
            libertadores.push({ teamId: row.teamId, reason: `${anualLibertadoresIndex}° Tabla Anual` });
            anualLibertadoresIndex++;
        }
    }

    // 5. Fill Sudamericana spots (6 spots) from the next best teams in Tabla Anual (La Cascada)
    let anualSudamericanaIndex = 1;
    for (const row of sortedAnual) {
        if (sudamericana.length >= 6) break;
        if (!isLibertadores(row.teamId) && !sudamericana.some(q => q.teamId === row.teamId)) {
            sudamericana.push({ teamId: row.teamId, reason: `${anualSudamericanaIndex}° Sudamericana (Tabla Anual)` });
            anualSudamericanaIndex++;
        }
    }

    return { libertadores, sudamericana };
}

export type TournamentStandingTeam = Team & {
    points: number;
    goalDiff: number;
    goalsFor: number;
    played: number;
};

/**
 * Calculates independent tournament standings for Torneo Apertura (weeks 1-16)
 * and Torneo Clausura (weeks 21-36) from regular season matches.
 */
export function calculateTournamentStandings(
    schedule: Match[],
    competitionName: 'Torneo_Apertura' | 'Torneo_Clausura',
    teams: Team[]
): { zoneA: TournamentStandingTeam[]; zoneB: TournamentStandingTeam[] } {
    const statsMap = new Map<number, { points: number; goalDiff: number; goalsFor: number; played: number }>();
    teams.forEach(t => statsMap.set(t.id, { points: 0, goalDiff: 0, goalsFor: 0, played: 0 }));

    schedule.forEach(m => {
        if (m.competition === competitionName && m.result) {
            const home = statsMap.get(m.homeTeamId);
            const away = statsMap.get(m.awayTeamId);
            if (home && away) {
                home.played++;
                away.played++;
                home.goalDiff += m.result.homeScore - m.result.awayScore;
                away.goalDiff += m.result.awayScore - m.result.homeScore;
                home.goalsFor += m.result.homeScore;
                away.goalsFor += m.result.awayScore;
                if (m.result.homeScore > m.result.awayScore) {
                    home.points += 3;
                } else if (m.result.awayScore > m.result.homeScore) {
                    away.points += 3;
                } else {
                    home.points += 1;
                    away.points += 1;
                }
            }
        }
    });

    const sortZone = (zoneName: 'A' | 'B'): TournamentStandingTeam[] => {
        return teams
            .filter(t => (t.leagueId === LeagueId.LIGA_ARGENTINA || !t.leagueId) && t.zone === zoneName)
            .map(t => {
                const s = statsMap.get(t.id) || { points: 0, goalDiff: 0, goalsFor: 0, played: 0 };
                return {
                    ...t,
                    points: s.points,
                    goalDiff: s.goalDiff,
                    goalsFor: s.goalsFor,
                    played: s.played
                };
            })
            .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
                return b.goalsFor - a.goalsFor;
            });
    };

    return {
        zoneA: sortZone('A'),
        zoneB: sortZone('B')
    };
}
