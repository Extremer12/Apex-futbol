/**
 * Game Factory Service
 * Handles the initialization of a new game state
 */

import { GameState, Team, Player, PlayerProfile, NewsItem, LeagueId, ElectoralPromise, Match } from '../types';
import { TEAMS } from '../constants';
import { generateRandomCoach, generateCoachMarket } from './coaching';
import { generateYouthPlayer, generateSeasonSchedule, createInitialLeagueTable, sortArgentineZones } from './simulation';
import { buildSeasonCompetitions } from './competitionFactory';
import { getBaseWeeklyIncome, generateStadium, generateSponsor, generateSponsorMarket, isCalendarYearSeasonLeague } from './economy';
import { generateClubMembership, calculateMembershipRevenue } from './membership';
import { formatDate } from '../utils';
import { getInitialAchievements } from './achievementService';
import { calculateFanApproval } from './political';
import { calculateSquadPower } from './squadProgressionService';
import { generateInitialClubStaff, generateStaffMarket, generateScoutMarket } from './staffService';
import { getRegionalMediaSource } from './newsEngine';
import { ensureSquadNationalities, getLeagueCountryCode } from './nationalityService';

interface InitializeGameParams {
    selectedTeam: Team;
    playerProfile?: PlayerProfile;
    initialPromises?: ElectoralPromise[];
}

/**
 * Creates the initial game state for a new game
 */
export function initializeGame({ selectedTeam, playerProfile, initialPromises }: InitializeGameParams): GameState {
    const isSouthAmerica = isCalendarYearSeasonLeague(selectedTeam.leagueId);

    const now = isSouthAmerica ? new Date('2026-01-15T12:00:00') : new Date('2026-08-10T12:00:00');

    // Clone teams, assign authentic stadiums, ages, nationalities and coaches
    const allTeamsCopy = TEAMS.map(t => {
        const s = generateStadium(t);
        const isGenericClub = t.squad.length > 0 && (t.squad[0].id === t.id * 100 || t.squad[0].id === t.id * 100 + 1 || t.squad[0].id === t.id);
        const preparedSquad = ensureSquadNationalities(
            t.squad.map(player => ({
                ...player,
                stats: { goals: 0, assists: 0, minutes: 0, appearances: 0, yellowCards: 0, redCards: 0 },
                condition: 100,
                isInjured: false,
                isSuspended: false
            })),
            t.leagueId,
            { isGenericClub, seasonOffset: 0 }
        );
        const teamObj: Team = {
            ...t,
            stadiumName: s.name,
            stadiumCapacity: s.capacity,
            city: s.city,
            squad: preparedSquad,
            coach: t.coach ? { ...t.coach } : generateRandomCoach(t.tier)
        };
        teamObj.squadPower = calculateSquadPower(teamObj);
        return teamObj;
    });

    const playerTeamCopy = allTeamsCopy.find(t => t.id === selectedTeam.id)!;
    const homeCountry = getLeagueCountryCode(playerTeamCopy.leagueId);

    // Create initial youth academy / reserve matching club's nation
    const initialYouthAcademy: Player[] = Array.from(
        { length: 4 },
        () => generateYouthPlayer(playerTeamCopy.tier, 0, homeCountry)
    );

    // Calculate initial finances & membership
    const totalWages = playerTeamCopy.squad.reduce((sum, player) => sum + player.wage, 0);
    const initialStadium = generateStadium(playerTeamCopy);
    const initialMembership = generateClubMembership(playerTeamCopy, initialStadium);
    const weeklyIncome = getBaseWeeklyIncome(selectedTeam.leagueId) + calculateMembershipRevenue(initialMembership, 'standard');

    // Generate club-tailored initial news
    const starPlayer = [...playerTeamCopy.squad].sort((a, b) => b.rating - a.rating)[0];

    const presidentName = playerProfile?.name || 'su nuevo presidente';
    const initialNews: NewsItem[] = [
        {
            id: `init-news-1-${Date.now()}`,
            headline: `${playerTeamCopy.name} inicia una nueva era bajo la presidencia de ${presidentName}`,
            subheadline: 'La nueva conducción asume oficialmente el mando deportivo e institucional del club.',
            body: `La afición y la junta directiva de ${playerTeamCopy.name} dan la bienvenida al nuevo proyecto institucional encabezado por ${presidentName}.\n\nSe abre una etapa con máxima exigencia competitiva en la liga y foco en la estabilidad financiera del club.`,
            quote: `"Venimos a trabajar con seriedad, ambición deportiva y respeto por la historia de ${playerTeamCopy.name}."`,
            quoteAuthor: presidentName,
            date: formatDate(now),
            type: 'institutional',
            sourceName: 'Comunicado Oficial',
            isBreaking: true,
            tags: ['Nuevo Mandato', playerTeamCopy.shortName || playerTeamCopy.name],
            teamId: playerTeamCopy.id
        },
        {
            id: `init-news-2-${Date.now()}`,
            headline: `El ${initialStadium.name} se prepara para el estreno oficial`,
            subheadline: `Expectativa alta en las gradas con aforo habilitado para ${initialStadium.capacity.toLocaleString()} espectadores.`,
            body: `El estadio de ${playerTeamCopy.name} ultima los preparativos logísticos y comerciales para recibir a la hinchada en el debut oficial de la temporada.\n\nLa directiva confía en lograr una fuerte recaudación desde las primeras jornadas.`,
            date: formatDate(now),
            type: 'institutional',
            sourceName: getRegionalMediaSource(playerTeamCopy.leagueId, 'standard', 1),
            tags: ['Estadio', 'Taquilla'],
            teamId: playerTeamCopy.id
        },
        {
            id: `init-news-3-${Date.now()}`,
            headline: `${starPlayer ? starPlayer.name : 'La plantilla'} asume el liderazgo futbolístico en ${playerTeamCopy.name}`,
            subheadline: `El referente del plantel (${starPlayer ? `${starPlayer.rating} OVR` : 'titular'}) concentra las miradas antes del debut.`,
            body: `Las expectativas deportivas recaen sobre ${starPlayer ? starPlayer.name : 'las figuras del equipo'} para marcar diferencias desde la fecha inaugural.\n\nEl cuerpo técnico destaca la predisposición del vestuario durante la pretemporada.`,
            date: formatDate(now),
            type: 'achievement',
            sourceName: getRegionalMediaSource(playerTeamCopy.leagueId, 'achievement', 2),
            tags: ['Plantel', 'Figura'],
            teamId: playerTeamCopy.id,
            playerId: starPlayer?.id,
            playerName: starPlayer?.name,
            playerPhoto: starPlayer?.photo
        },
        {
            id: `init-news-4-${Date.now()}`,
            headline: 'La Cantera y el Ojeo afinan el radar de mercado',
            subheadline: 'Juveniles promovidos al radar del primer equipo y seguimiento de oportunidades.',
            body: `Se han incorporado jóvenes promesas a las divisiones inferiores y el departamento de scouting ya monitorea posibles refuerzos estratégicos en caso de abrirse vacantes en el plantel.`,
            date: formatDate(now),
            type: 'transfer',
            sourceName: getRegionalMediaSource(playerTeamCopy.leagueId, 'transfer', 3),
            tags: ['Cantera', 'Scouting'],
            teamId: playerTeamCopy.id
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
    const chileanTeamsList = allTeamsCopy.filter(t => t.leagueId === LeagueId.PRIMERA_DIVISION_CHILE);
    const expansionChileTeamsList = allTeamsCopy.filter(t => t.leagueId === LeagueId.PRIMERA_B_CHILE);
    const colombianTeamsList = allTeamsCopy.filter(t => t.leagueId === LeagueId.PRIMERA_A_COLOMBIA);
    const expansionColombianTeamsList = allTeamsCopy.filter(t => t.leagueId === LeagueId.PRIMERA_B_COLOMBIA);
    const primeiraTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.PRIMEIRA_LIGA);
    const eredivisieTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.EREDIVISIE);
    const uruguayTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.LIGA_URUGUAYA);
    const ecuadorTeams = allTeamsCopy.filter(t => t.leagueId === LeagueId.LIGA_ECUADOR);
    const mlsTeamsList = allTeamsCopy.filter(t => t.leagueId === LeagueId.MLS);

    const { cups: initialCups, competitionFixtures } = buildSeasonCompetitions({
        allTeams: allTeamsCopy,
        playerTeamId: playerTeamCopy.id
    });

    // Full Season Schedule
    const initialSchedule = [
        ...generateSeasonSchedule(allTeamsCopy, 2026),
        ...competitionFixtures
    ];

    // Build initial staff and coach
    const initialStaff = generateInitialClubStaff(playerTeamCopy.tier, playerTeamCopy.leagueId);
    if (!playerTeamCopy.coach) {
        playerTeamCopy.coach = generateRandomCoach(playerTeamCopy.tier);
    }
    playerTeamCopy.clubStaff = initialStaff;

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
            [LeagueId.PRIMERA_DIVISION_CHILE]: createInitialLeagueTable(chileanTeamsList),
            [LeagueId.PRIMERA_B_CHILE]: createInitialLeagueTable(expansionChileTeamsList),
            [LeagueId.PRIMERA_A_COLOMBIA]: createInitialLeagueTable(colombianTeamsList),
            [LeagueId.PRIMERA_B_COLOMBIA]: createInitialLeagueTable(expansionColombianTeamsList),
            [LeagueId.PRIMEIRA_LIGA]: createInitialLeagueTable(primeiraTeams),
            [LeagueId.EREDIVISIE]: createInitialLeagueTable(eredivisieTeams),
            [LeagueId.LIGA_URUGUAYA]: createInitialLeagueTable(uruguayTeams),
            [LeagueId.LIGA_ECUADOR]: createInitialLeagueTable(ecuadorTeams),
            [LeagueId.MLS]: createInitialLeagueTable(mlsTeamsList),
        },
        finances: {
            balance: selectedTeam.budget,
            transferBudget: selectedTeam.transferBudget,
            weeklyIncome,
            weeklyWages: totalWages,
            balanceHistory: [selectedTeam.budget],
            ticketPolicy: 'standard',
            membershipPolicy: 'standard'
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
        cups: initialCups,
        availableCoaches: generateCoachMarket(5, playerTeamCopy.leagueId, playerTeamCopy.tier),
        clubStaff: initialStaff,
        availableStaff: generateStaffMarket(playerTeamCopy.tier, playerTeamCopy.leagueId),
        availableScouts: generateScoutMarket(playerTeamCopy.tier, playerTeamCopy.leagueId),
        stadium: initialStadium,
        membership: initialMembership,
        sponsors: [
            generateSponsor('shirt', playerTeamCopy.tier, playerTeamCopy.leagueId),
            generateSponsor('kit', playerTeamCopy.tier, playerTeamCopy.leagueId)
        ],
        availableSponsors: generateSponsorMarket(playerTeamCopy.tier, playerTeamCopy.leagueId),
        scouts: [],
        scoutedPlayerIds: {},
        cinematicQueue: [],  // No international draws in season 1
        preferredCurrency: 'EUR',
        preferredLanguage: 'es',
        gameMode: playerProfile?.gameMode || 'REALISTIC',
        achievements: getInitialAchievements(),
        seasonHistory: [],
        playerProfile: playerProfile || undefined,
        careerId: `career_${playerTeamCopy.id}_${Date.now()}`,
    };

    // Calculate dynamic initial fan approval
    initialState.fanApproval = calculateFanApproval(initialState);

    return initialState;
}
