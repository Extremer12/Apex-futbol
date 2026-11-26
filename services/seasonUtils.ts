import { CupCompetition, GameState, LeagueId, Team, Match, Player } from '../types';
import { computeArgentineRelegation, computeArgentineInternationalQualification } from './argentinaRegulations';
import { finalizeSeasonCompetitions, determineTwoLeggedTieWinner, determineCupWinner } from './simulation';

export interface CompetitionChampionItem {
    name: string;
    competitionId?: string;
    region: 'Internacional' | 'Argentina' | 'Inglaterra' | 'España' | 'Italia' | 'Alemania' | 'Francia' | 'Portugal' | 'Países Bajos' | 'Brasil' | 'Paraguay' | 'Uruguay' | 'Ecuador' | 'Chile' | 'Colombia' | 'México' | 'EE.UU.';
    category: 'Liga' | 'Copa' | 'Ascenso';
    team: Team | null;
    runnerUp?: Team | null;
    detailText?: string;
    statusBadge?: string;
}

export interface SeasonAwardLeader {
    player: Player;
    team: Team;
    value: number;
}

export interface SeasonSummaryData {
    season: number;
    userTeam: Team;
    userPosition: number;
    userPoints: number;
    userGoalDifference: number;
    leagueChampion: Team | null;
    aperturaChampion: Team | null;
    clausuraChampion: Team | null;
    cupWinners: { cupName: string; winnerTeam: Team | null }[];
    allChampions: CompetitionChampionItem[];
    userTitlesWon: CompetitionChampionItem[];
    seasonAwards: {
        goldenBoot: SeasonAwardLeader | null;
        leagueGoldenBoot: SeasonAwardLeader | null;
        ballonDor: SeasonAwardLeader | null;
    };
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
function getMaxLeagueWeek(userLeagueId: LeagueId | string): number {
    if (userLeagueId === LeagueId.LIGA_ARGENTINA) return 40;
    if (userLeagueId === LeagueId.PRIMERA_NACIONAL) return 38;
    if (userLeagueId === LeagueId.CHAMPIONSHIP) return 46;
    if (userLeagueId === LeagueId.SEGUNDA_DIVISION_ESP) return 42;
    if (userLeagueId === LeagueId.BUNDESLIGA || userLeagueId === LeagueId.ZWEITE_BUNDESLIGA || userLeagueId === LeagueId.LIGUE_1 || userLeagueId === LeagueId.LIGUE_2 || userLeagueId === LeagueId.LIGA_MX) return 34;
    if (userLeagueId === LeagueId.PRIMERA_DIVISION_CHILE || userLeagueId === LeagueId.PRIMERA_B_CHILE || userLeagueId === LeagueId.PRIMERA_B_COLOMBIA) return 30;
    if (userLeagueId === LeagueId.PRIMEIRA_LIGA || userLeagueId === LeagueId.EREDIVISIE || userLeagueId === LeagueId.MLS || userLeagueId === LeagueId.LIGA_EXPANSION_MX || userLeagueId === LeagueId.COPA_DE_PRIMERA) return 26;
    if (userLeagueId === LeagueId.LIGA_URUGUAYA || userLeagueId === LeagueId.LIGA_ECUADOR) return 22;
    return 38;
}

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
    const maxLeagueWeek = getMaxLeagueWeek(userLeagueId);

    // 3. Check if the user is still alive in an active cup where subsequent rounds must be played
    const userCupActive = Object.values(gameState.cups || {}).some(cup => {
        if (!cup || cup.winnerId || cup.phase === 'finished') return false;
        const isUserInCup = 
            (cup.seededTeamIds && cup.seededTeamIds.includes(gameState.team.id)) ||
            (cup.swissTable && cup.swissTable.some(r => r.teamId === gameState.team.id)) ||
            (cup.groups && cup.groups.some(g => g.teams && g.teams.includes(gameState.team.id))) ||
            (cup.rounds && cup.rounds.some(r => 
                (r.fixtures && r.fixtures.some(f => f.homeTeamId === gameState.team.id || f.awayTeamId === gameState.team.id)) ||
                (r.secondLegFixtures && r.secondLegFixtures.some(f => f.homeTeamId === gameState.team.id || f.awayTeamId === gameState.team.id))
            ));
        if (!isUserInCup) return false;

        // In Swiss or groups: remain active until the cup's final scheduled group/swiss matchday finishes
        if (cup.phase === 'swiss') {
            const fixtures = cup.swissFixtures || [];
            const maxSwissWeek = Math.max(20, ...fixtures.map(f => f.week || 0));
            return currentWeek <= maxSwissWeek && fixtures.some(f => f.result === undefined);
        }
        if (cup.phase === 'groups') {
            const allGroupFixtures = (cup.groups || []).flatMap(g => g.fixtures || []);
            const maxGroupWeek = Math.max(20, ...allGroupFixtures.map(f => f.week || 0));
            return currentWeek <= maxGroupWeek && allGroupFixtures.some(f => f.result === undefined);
        }

        // In knockout, check if user is in current round or won current round
        if (cup.rounds && cup.rounds.length > 0) {
            const isLastRound = cup.currentRoundIndex >= cup.rounds.length - 1;
            const currentRound = cup.rounds[cup.currentRoundIndex];
            if (currentRound) {
                const leg1 = currentRound.fixtures?.find(f => f.homeTeamId === gameState.team.id || f.awayTeamId === gameState.team.id);
                const leg2 = currentRound.secondLegFixtures?.find(f => f.homeTeamId === gameState.team.id || f.awayTeamId === gameState.team.id);

                if (leg1 || leg2) {
                    // If either leg has not been played yet, user is actively alive in this round
                    if (leg1 && leg1.result === undefined) return true;
                    if (leg2 && leg2.result === undefined) return true;

                    // If the final round has already concluded for the user, cup has ended for user
                    if (isLastRound) return false;

                    // Both legs (or the single tie) have been played: determine tie winner
                    if (leg1 && leg2) {
                        const winnerId = determineTwoLeggedTieWinner(leg1, leg2);
                        if (winnerId === gameState.team.id) return true;
                    } else if (leg1) {
                        const winnerId = determineCupWinner(leg1);
                        if (winnerId === gameState.team.id) return true;
                    }
                }
            }
        }
        return false;
    });
    if (userCupActive) {
        return false;
    }

    // 4. Absolute hard cap: when maxLeagueWeek is reached and user has no pending match this week
    if (currentWeek >= maxLeagueWeek) {
        const userHasMatchThisWeek = gameState.schedule.some(
            m => (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id) &&
                 m.week === currentWeek &&
                 m.result === undefined
        );
        if (!userHasMatchThisWeek) {
            return true;
        }
    }

    // 5. Check if the user's team still has any upcoming pending matches in the active season schedule
    const userHasPendingMatches = gameState.schedule.some(
        m => (m.homeTeamId === gameState.team.id || m.awayTeamId === gameState.team.id) &&
             m.week >= currentWeek &&
             (m.week <= maxLeagueWeek || m.isCupMatch) &&
             m.result === undefined
    );
    if (userHasPendingMatches) {
        return false;
    }

    // 6. League-specific completion rules when user has no more pending matches
    if (userLeagueId === LeagueId.LIGA_ARGENTINA) {
        // Regular season ends at week 36 (Apertura 1-16, Clausura 21-36).
        if (currentWeek < 36) {
            return false;
        }

        const clausura = gameState.cups?.clausuraPlayoffs;
        if (clausura && clausura.rounds && clausura.rounds.length > 0) {
            const lastRound = clausura.rounds[clausura.rounds.length - 1];
            const finalFinished = !!clausura.winnerId || (lastRound.fixtures.length > 0 && lastRound.fixtures.every(f => f.result !== undefined));
            if (finalFinished) {
                return true;
            }
            if (currentWeek < 40) {
                return false;
            }
            return true;
        }
        return currentWeek >= 36;
    }

    if (userLeagueId === LeagueId.PRIMERA_NACIONAL) {
        if (currentWeek < 34) {
            return false;
        }
        const reducido = gameState.cups?.nacionalReducido;
        if (reducido && reducido.rounds && reducido.rounds.length > 0) {
            const lastRound = reducido.rounds[reducido.rounds.length - 1];
            const finalFinished = !!reducido.winnerId || (lastRound.fixtures.length > 0 && lastRound.fixtures.every(f => f.result !== undefined));
            if (finalFinished) {
                return true;
            }
            if (currentWeek <= 38) {
                return false;
            }
            return true;
        }
        return currentWeek >= 34;
    }

    return currentWeek >= maxLeagueWeek;
};

/**
 * Extracts complete season recap data for the summary screen and hero card.
 */
export const getSeasonSummaryData = (gameState: GameState): SeasonSummaryData => {
    // Ensure all season competitions are cleanly finalized so no tournament remains "En Disputa"
    finalizeSeasonCompetitions(gameState.cups, gameState.allTeams, gameState.schedule);

    const isArgentina = gameState.team.leagueId === LeagueId.LIGA_ARGENTINA;
    const userLeagueId = gameState.team.leagueId;
    const table = (userLeagueId !== 'CONMEBOL' ? gameState.leagueTables[userLeagueId] : []) || [];
    const sortedTable = [...table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    
    const userRowIndex = sortedTable.findIndex(r => r.teamId === gameState.team.id);
    const userPosition = userRowIndex >= 0 ? userRowIndex + 1 : 1;
    const userRow = userRowIndex >= 0 ? sortedTable[userRowIndex] : null;

    const findTeam = (id?: number | null): Team | null => {
        if (!id) return null;
        return gameState.allTeams.find(t => t.id === id) || null;
    };

    const getLeagueSummary = (leagueId: LeagueId): { team: Team | null; runnerUp: Team | null; detailText?: string } => {
        const leagueTable = gameState.leagueTables?.[leagueId];
        if (!leagueTable || leagueTable.length === 0) return { team: null, runnerUp: null };
        const sorted = [...leagueTable].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
        const champRow = sorted[0];
        const runnerRow = sorted[1];
        const team = findTeam(champRow?.teamId);
        const runnerUp = findTeam(runnerRow?.teamId);
        const detailText = champRow ? `${champRow.points} pts${champRow.goalDifference !== undefined ? ` • DG ${champRow.goalDifference >= 0 ? `+${champRow.goalDifference}` : champRow.goalDifference}` : ''}` : undefined;
        return { team, runnerUp, detailText };
    };

    const getLeagueWinner = (leagueId: LeagueId): Team | null => getLeagueSummary(leagueId).team;

    // Champions
    const leagueChampion = userLeagueId !== 'CONMEBOL' ? getLeagueWinner(userLeagueId) : null;

    const resolveCupSummary = (cup?: CupCompetition): { team: Team | null; runnerUp: Team | null; detailText?: string } => {
        if (!cup) return { team: null, runnerUp: null };
        let championTeam: Team | null = cup.winnerId ? findTeam(cup.winnerId) : null;
        let runnerUp: Team | null = null;
        let detailText: string | undefined;

        if (cup.rounds && cup.rounds.length > 0) {
            const lastRound = cup.rounds[cup.rounds.length - 1];
            if (lastRound.fixtures?.length === 1 && lastRound.fixtures[0].result) {
                const finalMatch = lastRound.fixtures[0];
                const hScore = finalMatch.result.homeScore;
                const aScore = finalMatch.result.awayScore;
                const pens = finalMatch.penalties || finalMatch.result.penalties;
                let champId = cup.winnerId || 0;
                if (!champId) {
                    if (hScore > aScore) champId = finalMatch.homeTeamId;
                    else if (aScore > hScore) champId = finalMatch.awayTeamId;
                    else if (pens) {
                        champId = pens.home > pens.away ? finalMatch.homeTeamId : finalMatch.awayTeamId;
                    }
                    if (champId) cup.winnerId = champId;
                }
                if (champId) {
                    championTeam = championTeam || findTeam(champId);
                    const runnerId = champId === finalMatch.homeTeamId ? finalMatch.awayTeamId : finalMatch.homeTeamId;
                    runnerUp = findTeam(runnerId);
                    const champGoals = champId === finalMatch.homeTeamId ? hScore : aScore;
                    const runnerGoals = champId === finalMatch.homeTeamId ? aScore : hScore;
                    if (pens && hScore === aScore) {
                        const champPens = champId === finalMatch.homeTeamId ? pens.home : pens.away;
                        const runnerPens = champId === finalMatch.homeTeamId ? pens.away : pens.home;
                        detailText = `Final ${champGoals}-${runnerGoals} (${champPens}-${runnerPens} pen.)`;
                    } else {
                        detailText = `Final ${champGoals}-${runnerGoals}`;
                    }
                }
            }
        }

        if (!championTeam) {
            const historyWinner = cup.statistics?.championsHistory?.[0];
            if (historyWinner?.winnerId) {
                championTeam = findTeam(historyWinner.winnerId);
            } else if (historyWinner?.winnerName) {
                championTeam = (gameState.allTeams || []).find(team => team.name.toLowerCase() === historyWinner.winnerName.toLowerCase()) || null;
            }
        }

        return { team: championTeam, runnerUp, detailText };
    };

    const resolveCupChampion = (cup?: CupCompetition): Team | null => resolveCupSummary(cup).team;

    const aperturaSummary = resolveCupSummary(gameState.cups?.aperturaPlayoffs);
    const clausuraSummary = resolveCupSummary(gameState.cups?.clausuraPlayoffs);
    const aperturaChampion = aperturaSummary.team;
    const clausuraChampion = clausuraSummary.team;

    // Cups
    const cupsToCheck: [string, CupCompetition | undefined][] = [
        ['Copa Argentina', gameState.cups?.copaArgentina],
        ['Copa MX', gameState.cups?.copaMx],
        ['FA Cup', gameState.cups?.faCup],
        ['Carabao Cup', gameState.cups?.carabaoCup],
        ['Copa del Rey', gameState.cups?.copaDelRey],
        ['DFB-Pokal', gameState.cups?.dfbPokal],
        ['Coppa Italia', gameState.cups?.coppaItalia],
        ['Copa Libertadores', gameState.cups?.copaLibertadores],
        ['Copa Sudamericana', gameState.cups?.copaSudamericana],
        ['UEFA Champions League', gameState.cups?.championsLeague],
        ['UEFA Europa League', gameState.cups?.europaLeague],
        ['Recopa Sudamericana', gameState.cups?.recopaSudamericana],
        ['Mundial de Clubes FIFA', gameState.cups?.clubWorldCup],
        ['Copa Intercontinental', gameState.cups?.copaIntercontinental],
    ];

    const cupWinners: { cupName: string; winnerTeam: Team | null }[] = [];
    cupsToCheck.forEach(([name, cup]) => {
        const champ = resolveCupChampion(cup);
        if (champ) {
            cupWinners.push({ cupName: name, winnerTeam: champ });
        }
    });

    const buildLeagueChamp = (
        name: string,
        region: CompetitionChampionItem['region'],
        category: CompetitionChampionItem['category'],
        leagueId: LeagueId,
        statusBadge: string
    ): CompetitionChampionItem => {
        const res = getLeagueSummary(leagueId);
        return {
            name,
            competitionId: leagueId,
            region,
            category,
            team: res.team,
            runnerUp: res.runnerUp,
            detailText: res.detailText,
            statusBadge
        };
    };

    const buildCupChamp = (
        name: string,
        competitionId: string,
        region: CompetitionChampionItem['region'],
        category: CompetitionChampionItem['category'],
        cup: CupCompetition | undefined,
        statusBadge: string
    ): CompetitionChampionItem => {
        const res = resolveCupSummary(cup);
        return {
            name,
            competitionId,
            region,
            category,
            team: res.team,
            runnerUp: res.runnerUp,
            detailText: res.detailText,
            statusBadge
        };
    };

    const primerAscensoSummary = resolveCupSummary(gameState.cups?.nacionalPrimerAscenso);
    const pnLeagueSummary = getLeagueSummary(LeagueId.PRIMERA_NACIONAL);

    const allChampions: CompetitionChampionItem[] = [
        // Internacionales
        buildCupChamp('Copa Libertadores', 'COPA_LIBERTADORES', 'Internacional', 'Copa', gameState.cups?.copaLibertadores, 'Gloria Eterna'),
        buildCupChamp('Copa Sudamericana', 'COPA_SUDAMERICANA', 'Internacional', 'Copa', gameState.cups?.copaSudamericana, 'La Gran Conquista'),
        buildCupChamp('Recopa Sudamericana', 'RECOPA_SUDAMERICANA', 'Internacional', 'Copa', gameState.cups?.recopaSudamericana, 'Campeón Recopa'),
        buildCupChamp('UEFA Champions League', 'CHAMPIONS_LEAGUE', 'Internacional', 'Copa', gameState.cups?.championsLeague, 'Campeón Europeo'),
        buildCupChamp('UEFA Europa League', 'EUROPA_LEAGUE', 'Internacional', 'Copa', gameState.cups?.europaLeague, 'Campeón'),
        buildCupChamp('Mundial de Clubes FIFA', 'CLUB_WORLD_CUP', 'Internacional', 'Copa', gameState.cups?.clubWorldCup, 'Campeón Mundial'),
        buildCupChamp('Copa Intercontinental', 'COPA_INTERCONTINENTAL', 'Internacional', 'Copa', gameState.cups?.copaIntercontinental, 'Campeón Intercontinental'),

        // Argentina
        buildCupChamp('Torneo Apertura', 'LIGA_ARGENTINA', 'Argentina', 'Liga', gameState.cups?.aperturaPlayoffs, 'Campeón Apertura'),
        buildCupChamp('Torneo Clausura', 'LIGA_ARGENTINA', 'Argentina', 'Liga', gameState.cups?.clausuraPlayoffs, 'Campeón Clausura'),
        buildCupChamp('Copa Argentina', 'COPA_ARGENTINA', 'Argentina', 'Copa', gameState.cups?.copaArgentina, 'Campeón Copa'),
        buildLeagueChamp('Liga Argentina (Tabla Anual)', 'Argentina', 'Liga', LeagueId.LIGA_ARGENTINA, '1º Tabla Anual'),
        {
            name: 'Primera Nacional (1º Ascenso)',
            competitionId: 'PRIMERA_NACIONAL',
            region: 'Argentina',
            category: 'Ascenso',
            team: primerAscensoSummary.team || pnLeagueSummary.team,
            runnerUp: primerAscensoSummary.runnerUp || pnLeagueSummary.runnerUp,
            detailText: primerAscensoSummary.detailText || pnLeagueSummary.detailText,
            statusBadge: 'Campeón Ascenso'
        },
        buildCupChamp('Primera Nacional (Reducido)', 'PRIMERA_NACIONAL', 'Argentina', 'Ascenso', gameState.cups?.nacionalReducido, '2º Ascenso'),

        // Inglaterra
        buildLeagueChamp('Premier League', 'Inglaterra', 'Liga', LeagueId.PREMIER_LEAGUE, 'Campeón'),
        buildCupChamp('FA Cup', 'FA_CUP', 'Inglaterra', 'Copa', gameState.cups?.faCup, 'Campeón'),
        buildCupChamp('Carabao Cup', 'CARABAO_CUP', 'Inglaterra', 'Copa', gameState.cups?.carabaoCup, 'Campeón'),
        buildLeagueChamp('Championship', 'Inglaterra', 'Liga', LeagueId.CHAMPIONSHIP, 'Campeón'),

        // España
        buildLeagueChamp('LaLiga EA Sports', 'España', 'Liga', LeagueId.LA_LIGA, 'Campeón'),
        buildCupChamp('Copa del Rey', 'COPA_DEL_REY', 'España', 'Copa', gameState.cups?.copaDelRey, 'Campeón'),
        buildLeagueChamp('LaLiga Hypermotion', 'España', 'Liga', LeagueId.SEGUNDA_DIVISION_ESP, 'Campeón'),

        // Italia
        buildLeagueChamp('Serie A', 'Italia', 'Liga', LeagueId.SERIE_A, 'Scudetto'),
        buildCupChamp('Coppa Italia', 'COPPA_ITALIA', 'Italia', 'Copa', gameState.cups?.coppaItalia, 'Campeón'),
        buildLeagueChamp('Serie B', 'Italia', 'Liga', LeagueId.SERIE_B_ITA, 'Campeón'),

        // Alemania
        buildLeagueChamp('Bundesliga', 'Alemania', 'Liga', LeagueId.BUNDESLIGA, 'Meisterschale'),
        buildCupChamp('DFB-Pokal', 'DFB_POKAL', 'Alemania', 'Copa', gameState.cups?.dfbPokal, 'Campeón'),
        buildLeagueChamp('2. Bundesliga', 'Alemania', 'Liga', LeagueId.ZWEITE_BUNDESLIGA, 'Campeón'),

        // Francia
        buildLeagueChamp('Ligue 1', 'Francia', 'Liga', LeagueId.LIGUE_1, 'Campeón'),
        buildLeagueChamp('Ligue 2', 'Francia', 'Liga', LeagueId.LIGUE_2, 'Campeón'),

        // Brasil
        buildLeagueChamp('Brasileirão Série A', 'Brasil', 'Liga', LeagueId.BRASILEIRAO, 'Campeão'),
        buildLeagueChamp('Brasileirão Série B', 'Brasil', 'Liga', LeagueId.SERIE_B_BR, 'Campeón'),

        // Paraguay
        buildLeagueChamp('Copa de Primera', 'Paraguay', 'Liga', LeagueId.COPA_DE_PRIMERA, 'Campeón'),

        // Chile
        buildLeagueChamp('Primera División de Chile', 'Chile', 'Liga', LeagueId.PRIMERA_DIVISION_CHILE, 'Campeón'),
        buildLeagueChamp('Primera B de Chile', 'Chile', 'Ascenso', LeagueId.PRIMERA_B_CHILE, 'Campeón Ascenso'),

        // Colombia
        buildLeagueChamp('Liga BetPlay (Primera A)', 'Colombia', 'Liga', LeagueId.PRIMERA_A_COLOMBIA, 'Campeón'),
        buildLeagueChamp('Torneo BetPlay (Primera B)', 'Colombia', 'Ascenso', LeagueId.PRIMERA_B_COLOMBIA, 'Campeón Ascenso'),

        // México & EE.UU.
        buildLeagueChamp('Liga MX', 'México', 'Liga', LeagueId.LIGA_MX, 'Campeón'),
        buildLeagueChamp('Liga de Expansión MX', 'México', 'Ascenso', LeagueId.LIGA_EXPANSION_MX, 'Campeón Ascenso'),
        buildCupChamp('Copa MX', 'COPA_MX', 'México', 'Copa', (gameState.cups as any)?.copaMx, 'Campeón Copa'),
        buildLeagueChamp('Major League Soccer', 'EE.UU.', 'Liga', LeagueId.MLS, 'MLS Cup'),

        // Portugal & Países Bajos
        buildLeagueChamp('Liga Portugal Betclic', 'Portugal', 'Liga', LeagueId.PRIMEIRA_LIGA, 'Campeão'),
        buildLeagueChamp('Eredivisie', 'Países Bajos', 'Liga', LeagueId.EREDIVISIE, 'Kampioen'),

        // Uruguay & Ecuador
        buildLeagueChamp('Liga AUF Uruguaya', 'Uruguay', 'Liga', LeagueId.LIGA_URUGUAYA, 'Campeón Uruguayo'),
        buildLeagueChamp('LigaPro Serie A', 'Ecuador', 'Liga', LeagueId.LIGA_ECUADOR, 'Campeón Ecuador'),
    ];

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
        const div1Table = gameState.leagueTables[userLeagueId] || [];
        const lowerLeagueMap: Record<string, LeagueId> = {
            [LeagueId.PREMIER_LEAGUE]: LeagueId.CHAMPIONSHIP,
            [LeagueId.LA_LIGA]: LeagueId.SEGUNDA_DIVISION_ESP,
            [LeagueId.BUNDESLIGA]: LeagueId.ZWEITE_BUNDESLIGA,
            [LeagueId.SERIE_A]: LeagueId.SERIE_B_ITA,
            [LeagueId.LIGUE_1]: LeagueId.LIGUE_2,
            [LeagueId.BRASILEIRAO]: LeagueId.SERIE_B_BR,
            [LeagueId.LIGA_MX]: LeagueId.LIGA_EXPANSION_MX,
            [LeagueId.PRIMERA_DIVISION_CHILE]: LeagueId.PRIMERA_B_CHILE,
            [LeagueId.PRIMERA_A_COLOMBIA]: LeagueId.PRIMERA_B_COLOMBIA,
        };
        const lowerLeagueId = lowerLeagueMap[userLeagueId];
        const div2Table = lowerLeagueId ? (gameState.leagueTables[lowerLeagueId] || []) : [];

        const sortedDiv1 = [...div1Table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
        const sortedDiv2 = [...div2Table].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

        const slots = [
            LeagueId.PRIMERA_DIVISION_CHILE,
            LeagueId.PRIMERA_A_COLOMBIA,
            LeagueId.LIGA_MX,
            LeagueId.BUNDESLIGA,
            LeagueId.LIGUE_1
        ].includes(userLeagueId as LeagueId) ? 2 : (userLeagueId === LeagueId.BRASILEIRAO ? 4 : 3);

        if (lowerLeagueId && sortedDiv2.length > 0) {
            relegatedTeams = sortedDiv1.slice(-slots).map(r => findTeam(r.teamId)).filter(Boolean) as Team[];
            promotedTeams = sortedDiv2.slice(0, slots).map(r => findTeam(r.teamId)).filter(Boolean) as Team[];
        }
    }

    // International qualifications
    const libertadoresQualified: Team[] = [];
    const sudamericanaQualified: Team[] = [];
    const championsLeagueQualified: Team[] = [];

    const isSouthAmericanFirstDiv = [
        LeagueId.LIGA_ARGENTINA,
        LeagueId.BRASILEIRAO,
        LeagueId.COPA_DE_PRIMERA,
        LeagueId.PRIMERA_DIVISION_CHILE,
        LeagueId.PRIMERA_A_COLOMBIA,
        LeagueId.LIGA_URUGUAYA,
        LeagueId.LIGA_ECUADOR,
    ].includes(userLeagueId as LeagueId);

    const isEuropeanFirstDiv = [
        LeagueId.PREMIER_LEAGUE,
        LeagueId.LA_LIGA,
        LeagueId.BUNDESLIGA,
        LeagueId.SERIE_A,
        LeagueId.LIGUE_1,
        LeagueId.PRIMEIRA_LIGA,
        LeagueId.EREDIVISIE,
    ].includes(userLeagueId as LeagueId);

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
    } else if (isSouthAmericanFirstDiv) {
        sortedTable.slice(0, 4).forEach(r => {
            const t = findTeam(r.teamId);
            if (t) libertadoresQualified.push(t);
        });
        sortedTable.slice(4, 8).forEach(r => {
            const t = findTeam(r.teamId);
            if (t) sudamericanaQualified.push(t);
        });
    } else if (isEuropeanFirstDiv) {
        sortedTable.slice(0, 4).forEach(r => {
            const t = findTeam(r.teamId);
            if (t) championsLeagueQualified.push(t);
        });
    }

    // Titles won specifically by the user's club this season
    const userTitlesWon = allChampions.filter(item => item.team?.id === gameState.team.id);

    // Individual awards preview (before START_NEW_SEASON resets stats)
    let goldenBoot: SeasonAwardLeader | null = null;
    let leagueGoldenBoot: SeasonAwardLeader | null = null;
    let ballonDor: SeasonAwardLeader | null = null;

    for (const t of (gameState.allTeams || [])) {
        for (const p of (t.squad || [])) {
            const st = p.stats;
            if (!st) continue;
            if (st.goals > 0) {
                if (!goldenBoot || st.goals > goldenBoot.value) {
                    goldenBoot = { player: p, team: t, value: st.goals };
                }
                if (t.leagueId === userLeagueId && (!leagueGoldenBoot || st.goals > leagueGoldenBoot.value)) {
                    leagueGoldenBoot = { player: p, team: t, value: st.goals };
                }
            }
            if ((st.appearances || 0) > 0 || (st.goals || 0) > 0) {
                const score = (st.goals || 0) * 2 + (st.assists || 0) + (p.rating / 10) + ((st.appearances || 0) / 2);
                if (!ballonDor || score > ballonDor.value) {
                    ballonDor = { player: p, team: t, value: Math.round(score * 10) / 10 };
                }
            }
        }
    }

    return {
        season: gameState.season,
        userTeam: gameState.team,
        userPosition,
        userPoints: userRow?.points || 0,
        userGoalDifference: userRow?.goalDifference || 0,
        leagueChampion,
        aperturaChampion,
        clausuraChampion,
        cupWinners,
        allChampions,
        userTitlesWon,
        seasonAwards: {
            goldenBoot,
            leagueGoldenBoot,
            ballonDor,
        },
        relegatedTeams,
        promotedTeams,
        libertadoresQualified,
        sudamericanaQualified,
        championsLeagueQualified,
        isArgentina
    };
};

/**
 * Calculates a realistic, authentic kickoff time for any match based on its competition,
 * round/midweek status, and deterministic match seed.
 */
export function getMatchKickoffTime(match: Match): string {
    const comp = match.competition || '';
    const isMidweek = !!match.isMidweek;
    const seed = Math.abs((match.week || 1) * 31 + (match.homeTeamId || 1) * 17 + (match.awayTeamId || 2) * 13);

    // UEFA Competitions
    if (comp === 'Champions_League' || comp === 'Europa_League') {
        const uefaSlots = ['18:45', '21:00', '21:00', '21:00'];
        return uefaSlots[seed % uefaSlots.length];
    }

    // CONMEBOL Competitions
    if (comp === 'Copa_Libertadores' || comp === 'Copa_Sudamericana' || comp === 'Recopa_Sudamericana') {
        const conmebolSlots = ['19:00', '21:00', '21:30', '19:15', '21:30'];
        return conmebolSlots[seed % conmebolSlots.length];
    }

    // FIFA Club World Cup & Intercontinental
    if (comp === 'Club_World_Cup' || comp === 'Copa_Intercontinental') {
        const fifaSlots = ['15:00', '18:00', '21:00'];
        return fifaSlots[seed % fifaSlots.length];
    }

    // Domestic Cups & Midweeks
    if (match.isCupMatch || isMidweek) {
        if (comp === 'Copa_Argentina') {
            const argCupSlots = ['18:10', '20:10', '21:10', '19:00'];
            return argCupSlots[seed % argCupSlots.length];
        }
        if (comp === 'FA_Cup' || comp === 'Carabao_Cup') {
            const engCupSlots = ['19:45', '20:00', '20:15'];
            return engCupSlots[seed % engCupSlots.length];
        }
        if (comp === 'Copa_del_Rey') {
            const spaCupSlots = ['19:00', '21:00', '21:30', '20:00'];
            return spaCupSlots[seed % spaCupSlots.length];
        }
        if (comp === 'DFB_Pokal') {
            const gerCupSlots = ['18:30', '20:45'];
            return gerCupSlots[seed % gerCupSlots.length];
        }
        if (comp === 'Coppa_Italia') {
            const itaCupSlots = ['18:00', '21:00'];
            return itaCupSlots[seed % itaCupSlots.length];
        }
        const defaultMidweekSlots = ['19:00', '20:00', '20:45', '21:00'];
        return defaultMidweekSlots[seed % defaultMidweekSlots.length];
    }

    // Domestic Leagues (Weekend)
    if (comp === 'Premier_League' || comp === 'Championship') {
        const engSlots = ['12:30', '15:00', '15:00', '15:00', '17:30', '14:00', '16:30'];
        return engSlots[seed % engSlots.length];
    }

    if (comp === 'La_Liga' || comp === 'Segunda_Division_Esp') {
        const spaSlots = ['14:00', '16:15', '18:30', '21:00', '18:30', '21:00'];
        return spaSlots[seed % spaSlots.length];
    }

    if (comp === 'Bundesliga' || comp === 'Zweite_Bundesliga') {
        const gerSlots = ['15:30', '15:30', '15:30', '18:30', '17:30'];
        return gerSlots[seed % gerSlots.length];
    }

    if (comp === 'Serie_A' || comp === 'Serie_B_Ita') {
        const itaSlots = ['12:30', '15:00', '18:00', '20:45'];
        return itaSlots[seed % itaSlots.length];
    }

    if (comp === 'Ligue_1' || comp === 'Ligue_2') {
        const fraSlots = ['13:00', '15:00', '17:00', '20:45'];
        return fraSlots[seed % fraSlots.length];
    }

    if (comp === 'Brasileirao' || comp === 'Serie_B_Br') {
        const braSlots = ['16:00', '18:30', '19:00', '21:00'];
        return braSlots[seed % braSlots.length];
    }

    if (comp === 'Liga_MX') {
        const mexSlots = ['17:00', '19:00', '21:00', '21:05'];
        return mexSlots[seed % mexSlots.length];
    }

    if (comp === 'Copa_de_Primera' || comp === 'Liga_Uruguaya' || comp === 'Liga_Ecuador') {
        const conmebolLeagueSlots = ['17:30', '18:00', '20:00', '20:30'];
        return conmebolLeagueSlots[seed % conmebolLeagueSlots.length];
    }

    if (comp === 'Primeira_Liga' || comp === 'Eredivisie') {
        const euroMidSlots = ['16:30', '18:45', '20:00', '21:15'];
        return euroMidSlots[seed % euroMidSlots.length];
    }

    if (comp === 'MLS') {
        const mlsSlots = ['19:30', '20:30', '21:30', '22:00'];
        return mlsSlots[seed % mlsSlots.length];
    }

    // Liga Argentina / Primera Nacional
    const argSlots = ['14:30', '16:45', '19:00', '21:30', '17:00', '19:15', '20:00'];
    return argSlots[seed % argSlots.length];
}

