import { GameState, LeagueId, Team } from '../types';
import { computeArgentineRelegation, computeArgentineInternationalQualification } from './argentinaRegulations';

export interface SeasonSummaryData {
    season: number;
    userTeam: Team;
    userPosition: number;
    userPoints: number;
    leagueChampion: Team | null;
    aperturaChampion: Team | null;
    clausuraChampion: Team | null;
    cupWinners: { cupName: string; winnerTeam: Team | null }[];
    relegatedTeams: Team[];
    promotedTeams: Team[];
    libertadoresQualified: Team[];
    sudamericanaQualified: Team[];
    championsLeagueQualified: Team[];
    isArgentina: boolean;
}

/**
 * Checks if the current season has finished all matches and competitions.
 * Determines completion based on the user's league context and team schedule,
 * preventing unrelated fixtures in other countries from locking the season transition
 * and guaranteeing that the season strictly culminates without infinite empty weeks.
 */
export const isSeasonCompleted = (gameState: GameState | null): boolean => {
    if (!gameState || !gameState.schedule || gameState.schedule.length === 0) {
        return false;
    }

    const currentWeek = gameState.currentWeek;
    const userLeagueId = gameState.team.leagueId;

    // 1. Must have reached mid-season minimum
    if (currentWeek < 20) {
        return false;
    }

    // 2. Maximum season duration per league
    let maxLeagueWeek = 38;
    if (userLeagueId === LeagueId.LIGA_ARGENTINA) maxLeagueWeek = 40;
    else if (userLeagueId === LeagueId.PRIMERA_NACIONAL) maxLeagueWeek = 38;
    else if (userLeagueId === LeagueId.CHAMPIONSHIP) maxLeagueWeek = 46;
    else if (userLeagueId === LeagueId.SEGUNDA_DIVISION_ESP) maxLeagueWeek = 42;
    else if (userLeagueId === LeagueId.BUNDESLIGA || userLeagueId === LeagueId.ZWEITE_BUNDESLIGA || userLeagueId === LeagueId.LIGUE_1) maxLeagueWeek = 34;

    // 3. Absolute hard cap: If currentWeek has reached or passed the league's max season week, season is strictly complete
    if (currentWeek >= maxLeagueWeek) {
        return true;
    }

    // 4. Check if the user's team still has any upcoming pending matches in the active season
    const userHasPendingMatches = gameState.schedule.some(
        m => (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id) &&
             m.week >= currentWeek &&
             m.week <= maxLeagueWeek &&
             m.result === undefined
    );
    if (userHasPendingMatches) {
        return false;
    }

    // 5. League-specific completion rules when user has no more pending matches
    if (userLeagueId === LeagueId.LIGA_ARGENTINA) {
        // Regular season ends at week 36 (Apertura 1-16, Clausura 21-36).
        if (currentWeek < 36) {
            return false;
        }

        const clausura = gameState.cups?.clausuraPlayoffs;
        // If Clausura playoffs have a winner decided OR we reached week 40, season is complete
        if (clausura && clausura.rounds && clausura.rounds.length > 0) {
            if (clausura.winnerId || currentWeek >= 40) {
                return true;
            }
            return false;
        }
        // If no playoffs exist and we are past week 36, season is complete
        return currentWeek >= 36;
    }

    if (userLeagueId === LeagueId.PRIMERA_NACIONAL) {
        if (currentWeek < 34) {
            return false;
        }
        const reducido = gameState.cups?.nacionalReducido;
        if (reducido && reducido.rounds && reducido.rounds.length > 0) {
            if (reducido.winnerId || currentWeek >= 38) {
                return true;
            }
            return false;
        }
        return currentWeek >= 34;
    }

    // Standard European leagues without playoffs
    if (userLeagueId === LeagueId.BUNDESLIGA || userLeagueId === LeagueId.ZWEITE_BUNDESLIGA || userLeagueId === LeagueId.LIGUE_1) {
        return currentWeek >= 34;
    }

    if (userLeagueId === LeagueId.CHAMPIONSHIP) {
        return currentWeek >= 46;
    }

    if (userLeagueId === LeagueId.SEGUNDA_DIVISION_ESP) {
        return currentWeek >= 42;
    }

    // Standard 38-matchday leagues (Premier League, La Liga, Serie A, Serie B, Ligue 2, Brasileirão, Série B, Paraguay)
    return currentWeek >= 38;
};

/**
 * Extracts complete season recap data for the summary screen and hero card.
 */
export const getSeasonSummaryData = (gameState: GameState): SeasonSummaryData => {
    const isArgentina = gameState.team.leagueId === LeagueId.LIGA_ARGENTINA;
    const userLeagueId = gameState.team.leagueId;
    const table = gameState.leagueTables[userLeagueId] || [];
    const sortedTable = [...table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    
    const userRowIndex = sortedTable.findIndex(r => r.teamId === gameState.team.id);
    const userPosition = userRowIndex >= 0 ? userRowIndex + 1 : 1;
    const userRow = userRowIndex >= 0 ? sortedTable[userRowIndex] : null;

    const findTeam = (id?: number | null): Team | null => {
        if (!id) return null;
        return gameState.allTeams.find(t => t.id === id) || null;
    };

    // Champions
    const leagueChampId = sortedTable[0]?.teamId;
    const leagueChampion = findTeam(leagueChampId);

    const resolveCupChampion = (cup?: CupCompetition): Team | null => {
        if (!cup) return null;
        if (cup.winnerId) {
            const t = findTeam(cup.winnerId);
            if (t) return t;
        }
        // Check final match in completed rounds if winnerId wasn't set
        if (cup.rounds && cup.rounds.length > 0) {
            const lastRound = cup.rounds[cup.rounds.length - 1];
            if (lastRound.fixtures?.length === 1 && lastRound.fixtures[0].result) {
                const finalMatch = lastRound.fixtures[0];
                const hScore = finalMatch.result.homeScore;
                const aScore = finalMatch.result.awayScore;
                let champId = 0;
                if (hScore > aScore) champId = finalMatch.homeTeamId;
                else if (aScore > hScore) champId = finalMatch.awayTeamId;
                else if (finalMatch.penalties) {
                    champId = finalMatch.penalties.home > finalMatch.penalties.away ? finalMatch.homeTeamId : finalMatch.awayTeamId;
                }
                if (champId) {
                    const t = findTeam(champId);
                    if (t) return t;
                }
            }
        }
        // Fallback to championsHistory (e.g. after season transition or archiving)
        const historyWinner = cup.statistics?.championsHistory?.[0];
        if (historyWinner?.winnerId) {
            const t = findTeam(historyWinner.winnerId);
            if (t) return t;
        }
        if (historyWinner?.winnerName) {
            const t = gameState.allTeams.find(team => team.name.toLowerCase() === historyWinner.winnerName.toLowerCase());
            if (t) return t;
        }
        return null;
    };

    const aperturaChampion = resolveCupChampion(gameState.cups.aperturaPlayoffs);
    const clausuraChampion = resolveCupChampion(gameState.cups.clausuraPlayoffs);

    // Cups
    const cupsToCheck: [string, CupCompetition | undefined][] = [
        ['Copa Argentina', gameState.cups.copaArgentina],
        ['FA Cup', gameState.cups.faCup],
        ['Carabao Cup', gameState.cups.carabaoCup],
        ['Copa del Rey', gameState.cups.copaDelRey],
        ['DFB-Pokal', gameState.cups.dfbPokal],
        ['Coppa Italia', gameState.cups.coppaItalia],
        ['Copa Libertadores', gameState.cups.copaLibertadores],
        ['UEFA Champions League', gameState.cups.championsLeague],
        ['UEFA Europa League', gameState.cups.europaLeague],
        ['Copa Intercontinental', gameState.cups.copaIntercontinental],
    ];

    const cupWinners: { cupName: string; winnerTeam: Team | null }[] = [];
    cupsToCheck.forEach(([name, cup]) => {
        const champ = resolveCupChampion(cup);
        if (champ) {
            cupWinners.push({ cupName: name, winnerTeam: champ });
        }
    });

    // Ascensos y Descensos calculation specifically for active context
    let relegatedTeams: Team[] = [];
    let promotedTeams: Team[] = [];

    if (userLeagueId === LeagueId.LIGA_ARGENTINA || userLeagueId === LeagueId.PRIMERA_NACIONAL) {
        const argTable = gameState.leagueTables[LeagueId.LIGA_ARGENTINA] || [];
        const pnTable = gameState.leagueTables[LeagueId.PRIMERA_NACIONAL] || [];
        const sortedPn = [...pnTable].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

        // Exact AFA relegation (1 Promedios + 1 Tabla Anual with priority shift)
        const relResult = computeArgentineRelegation(argTable);
        relegatedTeams = relResult.relegatedIds.map(id => findTeam(id)).filter(Boolean) as Team[];

        // Promoted from Primera Nacional
        const primerAscensoId = gameState.cups.nacionalPrimerAscenso?.winnerId;
        const reducidoId = gameState.cups.nacionalReducido?.winnerId;

        const promo1 = findTeam(primerAscensoId) || findTeam(sortedPn[0]?.teamId);
        let promo2 = findTeam(reducidoId);
        if (!promo2 || promo2.id === promo1?.id) {
            promo2 = findTeam(sortedPn.find(r => r.teamId !== promo1?.id)?.teamId);
        }

        if (promo1) promotedTeams.push(promo1);
        if (promo2 && promo2.id !== promo1?.id) promotedTeams.push(promo2);
    } else {
        // Standard European leagues: 3 relegated, 3 promoted
        const div1Table = gameState.leagueTables[userLeagueId] || [];
        const lowerLeagueMap: Record<string, LeagueId> = {
            [LeagueId.PREMIER_LEAGUE]: LeagueId.CHAMPIONSHIP,
            [LeagueId.LA_LIGA]: LeagueId.SEGUNDA_DIVISION_ESP,
            [LeagueId.BUNDESLIGA]: LeagueId.ZWEITE_BUNDESLIGA,
            [LeagueId.SERIE_A]: LeagueId.SERIE_B_ITA,
            [LeagueId.LIGUE_1]: LeagueId.LIGUE_2,
            [LeagueId.BRASILEIRAO]: LeagueId.SERIE_B_BR,
        };
        const lowerLeagueId = lowerLeagueMap[userLeagueId];
        const div2Table = lowerLeagueId ? (gameState.leagueTables[lowerLeagueId] || []) : [];

        const sortedDiv1 = [...div1Table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
        const sortedDiv2 = [...div2Table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

        relegatedTeams = sortedDiv1.slice(-3).map(r => findTeam(r.teamId)).filter(Boolean) as Team[];
        promotedTeams = sortedDiv2.slice(0, 3).map(r => findTeam(r.teamId)).filter(Boolean) as Team[];
    }

    // International qualifications
    const libertadoresQualified: Team[] = [];
    const sudamericanaQualified: Team[] = [];
    const championsLeagueQualified: Team[] = [];

    if (isArgentina) {
        const argTable = gameState.leagueTables[LeagueId.LIGA_ARGENTINA] || [];
        const qualification = computeArgentineInternationalQualification(argTable, gameState.cups);
        qualification.libertadores.forEach(entry => {
            const t = findTeam(entry.teamId);
            if (t && !libertadoresQualified.some(q => q.id === t.id)) libertadoresQualified.push(t);
        });
        qualification.sudamericana.forEach(entry => {
            const t = findTeam(entry.teamId);
            if (t && !sudamericanaQualified.some(q => q.id === t.id)) sudamericanaQualified.push(t);
        });
    } else {
        // European Top 4 -> Champions League
        sortedTable.slice(0, 4).forEach(r => {
            const t = findTeam(r.teamId);
            if (t) championsLeagueQualified.push(t);
        });
    }

    return {
        season: gameState.season,
        userTeam: gameState.team,
        userPosition,
        userPoints: userRow?.points || 0,
        leagueChampion,
        aperturaChampion,
        clausuraChampion,
        cupWinners,
        relegatedTeams,
        promotedTeams,
        libertadoresQualified,
        sudamericanaQualified,
        championsLeagueQualified,
        isArgentina
    };
};
