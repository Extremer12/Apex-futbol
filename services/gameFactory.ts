/**
 * Game Factory Service
 * Handles the initialization of a new game state
 */

import { GameState, Team, Player, PlayerProfile, NewsItem, LeagueId } from '../types';
import { TEAMS } from '../constants';
import { generateRandomCoach, generateCoachMarket } from './coaching';
import { generateYouthPlayer, generateSeasonSchedule, generateCupDraw, createInitialLeagueTable } from './simulation';
import { getBaseWeeklyIncome, generateStadium, generateSponsor, generateSponsorMarket } from './economy';
import { formatDate } from '../utils';

interface InitializeGameParams {
    selectedTeam: Team;
    playerProfile?: PlayerProfile;
    initialPromises?: any[];
}

/**
 * Creates the initial game state for a new game
 */
export function initializeGame({ selectedTeam, playerProfile, initialPromises }: InitializeGameParams): GameState {
    const now = new Date('2024-07-01');

    // Clone teams and assign ages and coaches
    const allTeamsCopy = TEAMS.map(t => ({
        ...t,
        logo: t.logo,
        squad: t.squad.map(player => ({
            ...player,
            age: Math.floor(18 + Math.random() * 16) // Random age 18-33
        })),
        coach: generateRandomCoach(t.tier)
    }));

    const playerTeamCopy = allTeamsCopy.find(t => t.id === selectedTeam.id)!;

    // Create initial youth academy
    const initialYouthAcademy: Player[] = Array.from(
        { length: 4 },
        () => generateYouthPlayer(playerTeamCopy.tier)
    );

    // Calculate initial finances
    const totalWages = playerTeamCopy.squad.reduce((sum, player) => sum + player.wage, 0);
    const weeklyIncome = getBaseWeeklyIncome(selectedTeam.leagueId); // Dynamic based on league

    // Create tutorial news
    const tutorialNews: NewsItem[] = [
        {
            id: 'tutorial-4',
            headline: 'La Cantera te Espera',
            body: 'Hemos ojeado a jóvenes promesas. Revisa la pestaña "Cantera" en tu Plantilla para ver a las futuras estrellas.',
            date: formatDate(now)
        },
        {
            id: 'tutorial-3',
            headline: '¡Comienza la Temporada!',
            body: 'La nueva temporada está sobre nosotros. ¡Es hora de llevar a este club a la gloria! Buena suerte, Presidente.',
            date: formatDate(now)
        },
        {
            id: 'tutorial-2',
            headline: 'Consejo del Día: Mercado de Fichajes',
            body: `Utiliza la pantalla de 'Fichajes' para ojear jugadores y fortalecer tu equipo. Un buen fichaje puede cambiar tu temporada.`,
            date: formatDate(now)
        },
        {
            id: 'tutorial-1',
            headline: `Bienvenido a ${selectedTeam.name}`,
            body: `¡Felicidades por tu elección, ${playerProfile?.name}! La junta y los aficionados confían en ti. El primer paso es revisar tu 'Plantilla' actual.`,
            date: formatDate(now)
        },
    ];

    // Initial board confidence based on team tier
    const initialConfidence = { 'Top': 65, 'Mid': 75, 'Lower': 80 };

    // Separate teams by league for schedule and initial tables
    const plTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.PREMIER_LEAGUE);
    const chTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.CHAMPIONSHIP);
    const laTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.LA_LIGA);
    const gerTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.BUNDESLIGA);
    const itaTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.SERIE_A);

    // Generate cup draws (ONLY English teams for English cups for now)
    const englishTeams = [...plTeams, ...chTeams];
    const faCupRound1 = generateCupDraw(englishTeams, 'Round 1', 'FA_Cup');
    const carabaoCupRound1 = generateCupDraw(englishTeams, 'Round 1', 'Carabao_Cup');

    // Assign cup fixtures to specific weeks
    const faCupFixtures = faCupRound1.map(m => ({ ...m, week: 5 }));
    const carabaoCupFixtures = carabaoCupRound1.map(m => ({ ...m, week: 2 }));

    // Generate full season schedule
    const initialSchedule = [
        ...generateSeasonSchedule(allTeamsCopy),
        ...faCupFixtures,
        ...carabaoCupFixtures
    ];

    // Build and return the initial game state
    return {
        team: playerTeamCopy,
        allTeams: allTeamsCopy,
        currentDate: now,
        currentWeek: 0,
        season: 2024,
        newsFeed: tutorialNews,
        schedule: initialSchedule,
        leagueTables: {
            [LeagueId.PREMIER_LEAGUE]: createInitialLeagueTable(plTeams),
            [LeagueId.CHAMPIONSHIP]: createInitialLeagueTable(chTeams),
            [LeagueId.LA_LIGA]: createInitialLeagueTable(laTeams),
            [LeagueId.BUNDESLIGA]: createInitialLeagueTable(gerTeams),
            [LeagueId.SERIE_A]: createInitialLeagueTable(itaTeams)
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
            startYear: 1,
            currentYear: 1,
            nextElectionSeason: 4,
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
                rounds: [{ name: 'Round 1', fixtures: faCupFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            },
            carabaoCup: {
                id: 'carabao_cup',
                name: 'Carabao Cup',
                rounds: [{ name: 'Round 1', fixtures: carabaoCupFixtures, completed: false }],
                currentRoundIndex: 0,
                statistics: { topScorers: [], championsHistory: [] }
            }
        },
        availableCoaches: generateCoachMarket(5),
        stadium: {
            name: `${playerTeamCopy.name} Arena`,
            capacity: playerTeamCopy.tier === 'Top' ? 60000 : playerTeamCopy.tier === 'Mid' ? 35000 : 15000,
            ticketPrice: playerTeamCopy.tier === 'Top' ? 45 : playerTeamCopy.tier === 'Mid' ? 30 : 20,
            maintenanceCost: playerTeamCopy.tier === 'Top' ? 150000 : playerTeamCopy.tier === 'Mid' ? 80000 : 30000,
            facilityLevel: 1
        },
        sponsors: [
            generateSponsor('shirt', playerTeamCopy.tier),
            generateSponsor('kit', playerTeamCopy.tier)
        ],
        availableSponsors: generateSponsorMarket(playerTeamCopy.tier),
        scouts: [],
        scoutedPlayerIds: {}
    };
}
