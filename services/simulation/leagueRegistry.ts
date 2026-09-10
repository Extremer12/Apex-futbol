import { LeagueId, CountryCode, CupKey } from '../../types';

export interface LeagueConfig {
    id: LeagueId;
    name: string;
    country: CountryCode;
    region: 'europe' | 'southAmerica';
    division: 1 | 2;
    teamsCount: number;
    maxWeeks: number;
    promotionSlots: number;
    relegationSlots: number;
    promotesTo?: LeagueId;
    relegatesTo?: LeagueId;
    domesticCups: CupKey[];
    format: 'round-robin' | 'argentine-zones' | 'primera-nacional';
}

export const LEAGUE_REGISTRY: Record<LeagueId, LeagueConfig> = {
    [LeagueId.PREMIER_LEAGUE]: {
        id: LeagueId.PREMIER_LEAGUE,
        name: 'Premier League',
        country: 'ENG',
        region: 'europe',
        division: 1,
        teamsCount: 20,
        maxWeeks: 38,
        promotionSlots: 0,
        relegationSlots: 3,
        relegatesTo: LeagueId.CHAMPIONSHIP,
        domesticCups: ['faCup', 'carabaoCup'],
        format: 'round-robin'
    },
    [LeagueId.CHAMPIONSHIP]: {
        id: LeagueId.CHAMPIONSHIP,
        name: 'Championship',
        country: 'ENG',
        region: 'europe',
        division: 2,
        teamsCount: 24,
        maxWeeks: 46,
        promotionSlots: 3,
        relegationSlots: 3,
        promotesTo: LeagueId.PREMIER_LEAGUE,
        domesticCups: ['faCup', 'carabaoCup'],
        format: 'round-robin'
    },
    [LeagueId.LA_LIGA]: {
        id: LeagueId.LA_LIGA,
        name: 'La Liga',
        country: 'ESP',
        region: 'europe',
        division: 1,
        teamsCount: 20,
        maxWeeks: 38,
        promotionSlots: 0,
        relegationSlots: 3,
        relegatesTo: LeagueId.SEGUNDA_DIVISION_ESP,
        domesticCups: ['copaDelRey'],
        format: 'round-robin'
    },
    [LeagueId.SEGUNDA_DIVISION_ESP]: {
        id: LeagueId.SEGUNDA_DIVISION_ESP,
        name: 'Segunda División',
        country: 'ESP',
        region: 'europe',
        division: 2,
        teamsCount: 22,
        maxWeeks: 42,
        promotionSlots: 3,
        relegationSlots: 4,
        promotesTo: LeagueId.LA_LIGA,
        domesticCups: ['copaDelRey'],
        format: 'round-robin'
    },
    [LeagueId.BUNDESLIGA]: {
        id: LeagueId.BUNDESLIGA,
        name: 'Bundesliga',
        country: 'GER',
        region: 'europe',
        division: 1,
        teamsCount: 18,
        maxWeeks: 34,
        promotionSlots: 0,
        relegationSlots: 2,
        relegatesTo: LeagueId.ZWEITE_BUNDESLIGA,
        domesticCups: ['dfbPokal'],
        format: 'round-robin'
    },
    [LeagueId.ZWEITE_BUNDESLIGA]: {
        id: LeagueId.ZWEITE_BUNDESLIGA,
        name: '2. Bundesliga',
        country: 'GER',
        region: 'europe',
        division: 2,
        teamsCount: 18,
        maxWeeks: 34,
        promotionSlots: 2,
        relegationSlots: 2,
        promotesTo: LeagueId.BUNDESLIGA,
        domesticCups: ['dfbPokal'],
        format: 'round-robin'
    },
    [LeagueId.SERIE_A]: {
        id: LeagueId.SERIE_A,
        name: 'Serie A',
        country: 'ITA',
        region: 'europe',
        division: 1,
        teamsCount: 20,
        maxWeeks: 38,
        promotionSlots: 0,
        relegationSlots: 3,
        relegatesTo: LeagueId.SERIE_B_ITA,
        domesticCups: ['coppaItalia'],
        format: 'round-robin'
    },
    [LeagueId.SERIE_B_ITA]: {
        id: LeagueId.SERIE_B_ITA,
        name: 'Serie B',
        country: 'ITA',
        region: 'europe',
        division: 2,
        teamsCount: 20,
        maxWeeks: 38,
        promotionSlots: 3,
        relegationSlots: 3,
        promotesTo: LeagueId.SERIE_A,
        domesticCups: ['coppaItalia'],
        format: 'round-robin'
    },
    [LeagueId.LIGUE_1]: {
        id: LeagueId.LIGUE_1,
        name: 'Ligue 1',
        country: 'FRA',
        region: 'europe',
        division: 1,
        teamsCount: 18,
        maxWeeks: 34,
        promotionSlots: 0,
        relegationSlots: 2,
        relegatesTo: LeagueId.LIGUE_2,
        domesticCups: [],
        format: 'round-robin'
    },
    [LeagueId.LIGUE_2]: {
        id: LeagueId.LIGUE_2,
        name: 'Ligue 2',
        country: 'FRA',
        region: 'europe',
        division: 2,
        teamsCount: 18,
        maxWeeks: 34,
        promotionSlots: 2,
        relegationSlots: 2,
        promotesTo: LeagueId.LIGUE_1,
        domesticCups: [],
        format: 'round-robin'
    },
    [LeagueId.LIGA_ARGENTINA]: {
        id: LeagueId.LIGA_ARGENTINA,
        name: 'Liga Argentina',
        country: 'ARG',
        region: 'southAmerica',
        division: 1,
        teamsCount: 30,
        maxWeeks: 40,
        promotionSlots: 0,
        relegationSlots: 2,
        relegatesTo: LeagueId.PRIMERA_NACIONAL,
        domesticCups: ['copaArgentina', 'aperturaPlayoffs', 'clausuraPlayoffs'],
        format: 'argentine-zones'
    },
    [LeagueId.PRIMERA_NACIONAL]: {
        id: LeagueId.PRIMERA_NACIONAL,
        name: 'Primera Nacional',
        country: 'ARG',
        region: 'southAmerica',
        division: 2,
        teamsCount: 38,
        maxWeeks: 44,
        promotionSlots: 2,
        relegationSlots: 2,
        promotesTo: LeagueId.LIGA_ARGENTINA,
        domesticCups: ['copaArgentina', 'nacionalPrimerAscenso', 'nacionalReducido'],
        format: 'primera-nacional'
    },
    [LeagueId.BRASILEIRAO]: {
        id: LeagueId.BRASILEIRAO,
        name: 'Brasileirão Série A',
        country: 'BRA',
        region: 'southAmerica',
        division: 1,
        teamsCount: 20,
        maxWeeks: 38,
        promotionSlots: 0,
        relegationSlots: 4,
        relegatesTo: LeagueId.SERIE_B_BR,
        domesticCups: [],
        format: 'round-robin'
    },
    [LeagueId.SERIE_B_BR]: {
        id: LeagueId.SERIE_B_BR,
        name: 'Brasileirão Série B',
        country: 'BRA',
        region: 'southAmerica',
        division: 2,
        teamsCount: 20,
        maxWeeks: 38,
        promotionSlots: 4,
        relegationSlots: 4,
        promotesTo: LeagueId.BRASILEIRAO,
        domesticCups: [],
        format: 'round-robin'
    },
    [LeagueId.COPA_DE_PRIMERA]: {
        id: LeagueId.COPA_DE_PRIMERA,
        name: 'Copa de Primera',
        country: 'PAR',
        region: 'southAmerica',
        division: 1,
        teamsCount: 12,
        maxWeeks: 44,
        promotionSlots: 0,
        relegationSlots: 2,
        domesticCups: [],
        format: 'round-robin'
    }
};

export function getLeagueConfig(leagueId: LeagueId): LeagueConfig {
    const config = LEAGUE_REGISTRY[leagueId];
    if (!config) {
        throw new Error(`Unknown league configuration for: ${leagueId}`);
    }
    return config;
}

export function isSouthAmericanLeague(leagueId: LeagueId): boolean {
    return LEAGUE_REGISTRY[leagueId]?.region === 'southAmerica';
}

export function getPromotionRelegationPairs(): [LeagueId, LeagueId][] {
    const pairs: [LeagueId, LeagueId][] = [];
    Object.values(LEAGUE_REGISTRY).forEach(league => {
        if (league.relegatesTo) {
            pairs.push([league.id, league.relegatesTo]);
        }
    });
    return pairs;
}
