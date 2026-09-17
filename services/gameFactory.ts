/**
 * Game Factory Service
 * Handles the initialization of a new game state
 */

import { GameState, Team, Player, PlayerProfile, NewsItem, LeagueId, ElectoralPromise, Match } from '../types';
import { TEAMS } from '../constants';
import { generateRandomCoach, generateCoachMarket } from './coaching';
import { generateYouthPlayer, generateSeasonSchedule, generateCupDraw, createInitialLeagueTable, generateSwissPhase, generateGroupPhase, createInitialEuropeanTable, sortArgentineZones } from './simulation';
import { initializeLibertadoresSeason } from './libertadoresEngine';
import { initializeSudamericanaSeason } from './sudamericanaEngine';
import { getBaseWeeklyIncome, generateStadium, generateSponsor, generateSponsorMarket } from './economy';
import { formatDate } from '../utils';
import { getInitialAchievements } from './achievementService';
import { calculateFanApproval } from './political';

interface InitializeGameParams {
    selectedTeam: Team;
    playerProfile?: PlayerProfile;
    initialPromises?: ElectoralPromise[];
}

/**
 * Creates the initial game state for a new game
 */
export function initializeGame({ selectedTeam, playerProfile, initialPromises }: InitializeGameParams): GameState {
    const isSouthAmerica = [
        LeagueId.LIGA_ARGENTINA,
        LeagueId.PRIMERA_NACIONAL,
        LeagueId.BRASILEIRAO,
        LeagueId.SERIE_B_BR,
        LeagueId.COPA_DE_PRIMERA,
        LeagueId.LIGA_MX,
        LeagueId.LIGA_EXPANSION_MX
    ].includes(selectedTeam.leagueId);

    const now = isSouthAmerica ? new Date('2026-01-15T12:00:00') : new Date('2026-08-10T12:00:00');

    // Clone teams, assign authentic stadiums, ages and coaches
    const allTeamsCopy = TEAMS.map(t => {
        const s = generateStadium(t);
        return {
            ...t,
            logo: t.logo,
            stadiumName: s.name,
            stadiumCapacity: s.capacity,
            city: s.city,
            squad: t.squad.map(player => ({
                ...player,
                age: Math.floor(18 + Math.random() * 16), // Random age 18-33
                stats: { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 },
                condition: 100,
                isInjured: false,
                isSuspended: false
            })),
            coach: generateRandomCoach(t.tier)
        };
    });

    const playerTeamCopy = allTeamsCopy.find(t => t.id === selectedTeam.id)!;

    // Create initial youth academy
    const initialYouthAcademy: Player[] = Array.from(
        { length: 4 },
        () => generateYouthPlayer(playerTeamCopy.tier)
    );

    // Calculate initial finances
    const totalWages = playerTeamCopy.squad.reduce((sum, player) => sum + player.wage, 0);
    const weeklyIncome = getBaseWeeklyIncome(selectedTeam.leagueId); // Dynamic based on league

    // Generate club-tailored initial news
    const starPlayer = [...playerTeamCopy.squad].sort((a, b) => b.rating - a.rating)[0];
    const initialStadium = generateStadium(playerTeamCopy);

    const initialNews: NewsItem[] = [
        {
            id: `init-news-1-${Date.now()}`,
            headline: `${playerTeamCopy.name} inicia una nueva era con ${playerProfile?.name || 'su nuevo presidente'}`,
            body: `La afición y la directiva de ${playerTeamCopy.name} dan la bienvenida al nuevo proyecto. Máxima ilusión de cara a los retos de la presente temporada.`,
            date: formatDate(now),
            type: 'standard'
        },
        {
            id: `init-news-2-${Date.now()}`,
            headline: `El ${initialStadium.name} se prepara para el estreno liguero`,
            body: `Con una capacidad para ${initialStadium.capacity.toLocaleString()} espectadores, las gradas esperan un gran aforo en el debut oficial de la campaña.`,
            date: formatDate(now),
            type: 'standard'
        },
        {
            id: `init-news-3-${Date.now()}`,
            headline: `${starPlayer ? starPlayer.name : 'La plantilla'} asume el liderazgo en ${playerTeamCopy.name}`,
            body: `Las miradas se posan sobre ${starPlayer ? starPlayer.name : 'las figuras del equipo'} para marcar diferencias en el terreno de juego desde la primera fecha.`,
            date: formatDate(now),
            type: 'standard'
        },
        {
            id: `init-news-4-${Date.now()}`,
            headline: 'La Cantera y la Dirección Deportiva afinan los últimos detalles',
            body: `Se han incorporado jóvenes promesas al filial y se monitorea el mercado de fichajes para reforzar las posiciones clave.`,
            date: formatDate(now),
            type: 'standard'
        },
    ];

    // Initial board confidence based on team tier
    const initialConfidence = { 'Top': 65, 'Mid': 75, 'Lower': 80 };

    // Separate teams by league for schedule and initial tables
    const plTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.PREMIER_LEAGUE);
    const chTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.CHAMPIONSHIP);
    const laTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.LA_LIGA);
    const seg2EspTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.SEGUNDA_DIVISION_ESP);
    const gerTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.BUNDESLIGA);
    const zweiteTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.ZWEITE_BUNDESLIGA);
    const itaTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.SERIE_A);
    const serieBItaTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.SERIE_B_ITA);
    const ligue1Teams = allTeamsCopy.filter(t => t.leagueId === LeagueId.LIGUE_1);
    const ligue2Teams = allTeamsCopy.filter(t => t.leagueId === LeagueId.LIGUE_2);
    const ligaArgTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.LIGA_ARGENTINA);
    // Authentic AFA zone lottery: fixed rivalry pairings (e.g. Boca vs River) distributed 50/50 across Zona A and B
    sortArgentineZones(ligaArgTeams);
    const primeraNacTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.PRIMERA_NACIONAL);
    const brasileiraoTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.BRASILEIRAO);
    const serieBBrTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.SERIE_B_BR);
    const paraguayTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.COPA_DE_PRIMERA);
    const ligaMxTeamsList = allTeamsCopy.filter(t => t.leagueId === LeagueId.LIGA_MX);
    const expansionMxTeamsList = allTeamsCopy.filter(t => t.leagueId === LeagueId.LIGA_EXPANSION_MX);

    // International competitions (Champions League, Copa Libertadores) are NOT generated
    // in season 1. They will be created by seasonManager.ts from season 2 onwards
    // based on actual league standings.

    // Generate national cup draws for all leagues (capped at 32 teams for bracket symmetry)
    const englishTeams = [...plTeams, ...chTeams];
    const faCupRound1 = generateCupDraw(englishTeams, 'Round 1', 'FA_Cup', playerTeamCopy.id);
    const carabaoCupRound1 = generateCupDraw(englishTeams, 'Round 1', 'Carabao_Cup', playerTeamCopy.id);

    const spanishTeams = [...laTeams, ...seg2EspTeams];
    const copaDelReyRound1 = generateCupDraw(spanishTeams, 'Round 1', 'Copa_del_Rey', playerTeamCopy.id);

    const germanTeams = [...gerTeams, ...zweiteTeams];
    const dfbPokalRound1 = generateCupDraw(germanTeams, 'Round 1', 'DFB_Pokal', playerTeamCopy.id);

    const italianTeams = [...itaTeams, ...serieBItaTeams];
    const coppaItaliaRound1 = generateCupDraw(italianTeams, 'Round 1', 'Coppa_Italia', playerTeamCopy.id);

    const argentinianTeams = [...ligaArgTeams, ...primeraNacTeams];
    const copaArgentinaRound1 = generateCupDraw(argentinianTeams, 'Round 1', 'Copa_Argentina', playerTeamCopy.id);

    const mexicanTeams = [...ligaMxTeamsList, ...expansionMxTeamsList];
    const copaMxRound1 = generateCupDraw(mexicanTeams, 'Round 1', 'Copa_MX', playerTeamCopy.id);

    // Assign cup fixtures to specific weeks (always midweek to prevent clashing with weekend league matches)
    const faCupFixtures = faCupRound1.map(m => ({ ...m, week: 5, isMidweek: true }));
    const carabaoCupFixtures = carabaoCupRound1.map(m => ({ ...m, week: 2, isMidweek: true }));
    const copaDelReyFixtures = copaDelReyRound1.map(m => ({ ...m, week: 4, isMidweek: true }));
    const dfbPokalFixtures = dfbPokalRound1.map(m => ({ ...m, week: 3, isMidweek: true }));
    const coppaItaliaFixtures = coppaItaliaRound1.map(m => ({ ...m, week: 4, isMidweek: true }));
    const copaArgentinaFixtures = copaArgentinaRound1.map(m => ({ ...m, week: 5, isMidweek: true }));
    const copaMxFixtures = copaMxRound1.map(m => ({ ...m, week: 6, isMidweek: true }));

    // =========================================================================
    // 🏆 International Competitions (Season 1 - 2026 Real Participants)
    // =========================================================================
    const getTopClubs = (teams: Team[], count: number): Team[] => {
        const tierWeight = { 'Top': 3, 'Mid': 2, 'Lower': 1 };
        return [...teams].sort((a, b) => {
            const diff = (tierWeight[b.tier] || 1) - (tierWeight[a.tier] || 1);
            if (diff !== 0) return diff;
            return (b.budget || 0) - (a.budget || 0);
        }).slice(0, count);
    };

    const getMidClubs = (teams: Team[], start: number, count: number): Team[] => {
        const tierWeight = { 'Top': 3, 'Mid': 2, 'Lower': 1 };
        return [...teams].sort((a, b) => {
            const diff = (tierWeight[b.tier] || 1) - (tierWeight[a.tier] || 1);
            if (diff !== 0) return diff;
            return (b.budget || 0) - (a.budget || 0);
        }).slice(start, start + count);
    };

    // UEFA Champions League (36 teams)
    const clTeamsMap = new Map<number, Team>();
    [
        ...getTopClubs(plTeams, 7),
        ...getTopClubs(laTeams, 7),
        ...getTopClubs(gerTeams, 7),
        ...getTopClubs(itaTeams, 7),
        ...getTopClubs(ligue1Teams, 6),
        ...getTopClubs(chTeams, 2)
    ].forEach(t => clTeamsMap.set(t.id, t));
    const clTeams = Array.from(clTeamsMap.values()).slice(0, 36);

    // UEFA Europa League (36 teams)
    const elTeamsMap = new Map<number, Team>();
    [
        ...getMidClubs(plTeams, 7, 7),
        ...getMidClubs(laTeams, 7, 7),
        ...getMidClubs(gerTeams, 7, 7),
        ...getMidClubs(itaTeams, 7, 7),
        ...getMidClubs(ligue1Teams, 6, 6),
        ...getMidClubs(chTeams, 2, 2)
    ].filter(t => !clTeamsMap.has(t.id)).forEach(t => elTeamsMap.set(t.id, t));
    const elTeams = Array.from(elTeamsMap.values()).slice(0, 36);

    const clSwiss = generateSwissPhase(clTeams, 'Champions_League', 8);
    const elSwiss = generateSwissPhase(elTeams, 'Europa_League', 8);
    const clFixtures = clSwiss.fixtures.map(m => ({ ...m, week: m.week + 2, isMidweek: true }));
    const elFixtures = elSwiss.fixtures.map(m => ({ ...m, week: m.week + 2, isMidweek: true }));

    // CONMEBOL Copa Libertadores (Official 47-team structure, 2026 realistic qualifiers)
    // River Plate (702), Racing Club (703), Vélez Sarsfield (707), Estudiantes LP (706), Talleres (711), Central Córdoba (719)
    const argLibertadoresIds = [702, 703, 707, 706, 711, 719];
    const libInit = initializeLibertadoresSeason({
        allTeams: allTeamsCopy,
        lastLibertadoresWinnerId: 810, // Botafogo (Champion 2024)
        lastSudamericanaWinnerId: 703, // Racing Club (Champion 2024)
        argentineQualifiedIds: argLibertadoresIds
    });

    const libParticipantIds = new Set<number>();
    libInit.cup.groups?.forEach(g => g.teams.forEach(id => libParticipantIds.add(id)));
    libInit.fixtures.forEach(m => {
        libParticipantIds.add(m.homeTeamId);
        libParticipantIds.add(m.awayTeamId);
    });

    // CONMEBOL Copa Sudamericana (Official 56-team structure, 2026 realistic qualifiers)
    // Boca Juniors (701), Independiente (704), Huracán (708), Godoy Cruz (721), Unión (724), Lanús (715), Defensa y Justicia (714)
    const argSudamericanaIds = [701, 704, 708, 721, 724, 715, 714];
    const sudInit = initializeSudamericanaSeason({
        allTeams: allTeamsCopy,
        argentineQualifiedIds: argSudamericanaIds,
        libertadoresPhase3Losers: libInit.phase3Losers,
        excludedTeamIds: libParticipantIds
    });

    // Intercontinental Cup: Real Madrid (201) vs Botafogo (810)
    const realMadrid = allTeamsCopy.find(t => t.id === 201);
    const botafogo = allTeamsCopy.find(t => t.id === 810);
    const intercontinentalFixtures: Match[] = (realMadrid && botafogo) ? [{
        week: 2,
        homeTeamId: botafogo.id,
        awayTeamId: realMadrid.id,
        competition: 'Copa_Intercontinental',
        isCupMatch: true,
        isMidweek: true
    }] : [];

    // Full Season Schedule
    const initialSchedule = [
        ...generateSeasonSchedule(allTeamsCopy, 2026),
        ...faCupFixtures,
        ...carabaoCupFixtures,
        ...copaDelReyFixtures,
        ...dfbPokalFixtures,
        ...coppaItaliaFixtures,
        ...copaArgentinaFixtures,
        ...copaMxFixtures,
        ...intercontinentalFixtures,
        ...libInit.fixtures,
        ...sudInit.fixtures,
        ...clFixtures,
        ...elFixtures
    ];

    // Build and return the initial game state
    const initialState: GameState = {
        currentTurn: 'weekend',
        team: playerTeamCopy,
        allTeams: allTeamsCopy,
        currentDate: now,
        currentWeek: 0,
        season: 2026,
        newsFeed: initialNews,
        schedule: initialSchedule,
        leagueTables: {
            [LeagueId.PREMIER_LEAGUE]: createInitialLeagueTable(plTeams),
            [LeagueId.CHAMPIONSHIP]: createInitialLeagueTable(chTeams),
            [LeagueId.LA_LIGA]: createInitialLeagueTable(laTeams),
            [LeagueId.SEGUNDA_DIVISION_ESP]: createInitialLeagueTable(seg2EspTeams),
            [LeagueId.BUNDESLIGA]: createInitialLeagueTable(gerTeams),
            [LeagueId.ZWEITE_BUNDESLIGA]: createInitialLeagueTable(zweiteTeams),
            [LeagueId.SERIE_A]: createInitialLeagueTable(itaTeams),
            [LeagueId.SERIE_B_ITA]: createInitialLeagueTable(serieBItaTeams),
            [LeagueId.LIGUE_1]: createInitialLeagueTable(ligue1Teams),
            [LeagueId.LIGUE_2]: createInitialLeagueTable(ligue2Teams),
            [LeagueId.LIGA_ARGENTINA]: createInitialLeagueTable(ligaArgTeams),
            [LeagueId.PRIMERA_NACIONAL]: createInitialLeagueTable(primeraNacTeams),
            [LeagueId.BRASILEIRAO]: createInitialLeagueTable(brasileiraoTeams),
            [LeagueId.SERIE_B_BR]: createInitialLeagueTable(serieBBrTeams),
            [LeagueId.COPA_DE_PRIMERA]: createInitialLeagueTable(paraguayTeams),
            [LeagueId.LIGA_MX]: createInitialLeagueTable(ligaMxTeamsList),
            [LeagueId.LIGA_EXPANSION_MX]: createInitialLeagueTable(expansionMxTeamsList),
        },
        finances: {
            balance: selectedTeam.budget,
            transferBudget: selectedTeam.transferBudget,
            weeklyIncome,
            weeklyWages: totalWages,
            balanceHistory: [selectedTeam.budget]
        },
        boardConfidence: initialConfidence[selectedTeam.tier],
        fanApproval: {
            rating: 60,
            trend: 'stable' as const,
            factors: {
                results: 0,
                transfers: 0,
                finances: 0,
                promises: 0
            }
        },
        mandate: {
            startYear: 2026,
            currentYear: 1,
            nextElectionSeason: 2030,
            isElectionYear: false,
            totalMandates: 1
        },
        electoralPromises: initialPromises || [],
        viewingPlayer: null,
        incomingOffers: [],
        youthAcademy: initialYouthAcademy,
        cups: {
            faCup: {
                id: 'fa_cup',
                name: 'FA Cup',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: faCupFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            carabaoCup: {
                id: 'carabao_cup',
                name: 'Carabao Cup',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: carabaoCupFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            copaDelRey: {
                id: 'copa_del_rey',
                name: 'Copa del Rey',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: copaDelReyFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            dfbPokal: {
                id: 'dfb_pokal',
                name: 'DFB-Pokal',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: dfbPokalFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            coppaItalia: {
                id: 'coppa_italia',
                name: 'Coppa Italia',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: coppaItaliaFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            copaArgentina: {
                id: 'copa_argentina',
                name: 'Copa Argentina',
                type: 'knockout',
                phase: 'knockout',
                rounds: [{ name: 'Round 1', fixtures: copaArgentinaFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            aperturaPlayoffs: { id: 'apertura_playoffs', name: 'Playoffs Apertura', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
            clausuraPlayoffs: { id: 'clausura_playoffs', name: 'Playoffs Clausura', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
            nacionalPrimerAscenso: { id: 'nacional_primer_ascenso', name: 'Final 1º Ascenso', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
            nacionalReducido: { id: 'nacional_reducido', name: 'Torneo Reducido', type: 'knockout', phase: 'knockout', rounds: [], currentRoundIndex: 0, statistics: { topScorers: [], championsHistory: [] } },
            copaLibertadores: libInit.cup,
            copaSudamericana: sudInit.cup,
            championsLeague: {
                id: 'champions_league',
                name: 'UEFA Champions League',
                logo: 'https://tmssl.akamaized.net/images/logo/header/cl.png',
                type: 'swiss',
                phase: 'swiss',
                swissTable: clSwiss.table,
                swissFixtures: clFixtures,
                rounds: [],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            europaLeague: {
                id: 'europa_league',
                name: 'UEFA Europa League',
                logo: 'https://tmssl.akamaized.net/images/logo/header/el.png',
                type: 'swiss',
                phase: 'swiss',
                swissTable: elSwiss.table,
                swissFixtures: elFixtures,
                rounds: [],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            copaIntercontinental: {
                id: 'copa_intercontinental',
                name: 'Copa Intercontinental',
                logo: 'https://tmssl.akamaized.net/images/logo/header/cwc.png',
                type: 'knockout',
                phase: 'knockout',
                rounds: intercontinentalFixtures.length > 0 ? [{
                    name: 'Final',
                    fixtures: intercontinentalFixtures,
                    completed: false
                }] : [],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
        },
        availableCoaches: generateCoachMarket(5),
        stadium: generateStadium(playerTeamCopy),
        sponsors: [
            generateSponsor('shirt', playerTeamCopy.tier),
            generateSponsor('kit', playerTeamCopy.tier)
        ],
        availableSponsors: generateSponsorMarket(playerTeamCopy.tier),
        scouts: [],
        scoutedPlayerIds: {},
        cinematicQueue: [],  // No international draws in season 1
        preferredCurrency: 'EUR',
        preferredLanguage: 'es',
        achievements: getInitialAchievements(),
        seasonHistory: [],
        playerProfile: playerProfile || undefined,
    };

    // Calculate dynamic initial fan approval
    initialState.fanApproval = calculateFanApproval(initialState);

    return initialState;
}
