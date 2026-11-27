import { ARG_COMPETITION_LOGOS } from '../../../services/customPacks/argentineLogos';

export const LEAGUE_THEMES: Record<string, string> = {
    PREMIER_LEAGUE: 'purple',
    CHAMPIONSHIP: 'sky',
    LA_LIGA: 'orange',
    SEGUNDA_DIVISION_ESP: 'orange',
    BUNDESLIGA: 'red',
    ZWEITE_BUNDESLIGA: 'red',
    SERIE_A: 'emerald',
    SERIE_B_ITA: 'emerald',
    LIGUE_1: 'blue',
    LIGUE_2: 'blue',
    LIGA_ARGENTINA: 'cyan',
    PRIMERA_NACIONAL: 'cyan',
    BRASILEIRAO: 'green',
    SERIE_B_BR: 'green',
    COPA_DE_PRIMERA: 'rose',
    LIGA_MX: 'emerald',
    LIGA_EXPANSION_MX: 'amber',
    PRIMERA_DIVISION_CHILE: 'red',
    PRIMERA_B_CHILE: 'rose',
    PRIMERA_A_COLOMBIA: 'amber',
    PRIMERA_B_COLOMBIA: 'yellow',
    PRIMEIRA_LIGA: 'emerald',
    EREDIVISIE: 'orange',
    LIGA_URUGUAYA: 'sky',
    LIGA_ECUADOR: 'yellow',
    MLS: 'blue',
};

export const LEAGUE_LOGOS: Record<string, string> = {
    PREMIER_LEAGUE: ARG_COMPETITION_LOGOS.PREMIER_LEAGUE || '',
    CHAMPIONSHIP: ARG_COMPETITION_LOGOS.CHAMPIONSHIP || '',
    LA_LIGA: ARG_COMPETITION_LOGOS.LA_LIGA || '',
    SEGUNDA_DIVISION_ESP: ARG_COMPETITION_LOGOS.SEGUNDA_DIVISION_ESP || '',
    BUNDESLIGA: ARG_COMPETITION_LOGOS.BUNDESLIGA || '',
    ZWEITE_BUNDESLIGA: ARG_COMPETITION_LOGOS.ZWEITE_BUNDESLIGA || '',
    SERIE_A: ARG_COMPETITION_LOGOS.SERIE_A || '',
    SERIE_B_ITA: ARG_COMPETITION_LOGOS.SERIE_B_ITA || '',
    LIGUE_1: ARG_COMPETITION_LOGOS.LIGUE_1 || '',
    LIGUE_2: ARG_COMPETITION_LOGOS.LIGUE_2 || '',
    LIGA_ARGENTINA: ARG_COMPETITION_LOGOS.LIGA_ARGENTINA || '',
    PRIMERA_NACIONAL: ARG_COMPETITION_LOGOS.PRIMERA_NACIONAL || '',
    BRASILEIRAO: ARG_COMPETITION_LOGOS.BRASILEIRAO || '',
    SERIE_B_BR: ARG_COMPETITION_LOGOS.SERIE_B_BR || '',
    COPA_DE_PRIMERA: ARG_COMPETITION_LOGOS.COPA_DE_PRIMERA || '',
    LIGA_MX: ARG_COMPETITION_LOGOS.LIGA_MX || '',
    LIGA_EXPANSION_MX: ARG_COMPETITION_LOGOS.LIGA_EXPANSION_MX || '',
    PRIMERA_DIVISION_CHILE: ARG_COMPETITION_LOGOS.PRIMERA_DIVISION_CHILE || '',
    PRIMERA_B_CHILE: ARG_COMPETITION_LOGOS.PRIMERA_B_CHILE || '',
    PRIMERA_A_COLOMBIA: ARG_COMPETITION_LOGOS.PRIMERA_A_COLOMBIA || '',
    PRIMERA_B_COLOMBIA: ARG_COMPETITION_LOGOS.PRIMERA_B_COLOMBIA || '',
    PRIMEIRA_LIGA: ARG_COMPETITION_LOGOS.PRIMEIRA_LIGA || '',
    EREDIVISIE: ARG_COMPETITION_LOGOS.EREDIVISIE || '',
    LIGA_URUGUAYA: ARG_COMPETITION_LOGOS.LIGA_URUGUAYA || '',
    LIGA_ECUADOR: ARG_COMPETITION_LOGOS.LIGA_ECUADOR || '',
    MLS: ARG_COMPETITION_LOGOS.MLS || '',
};

export const CUP_LOGOS: Record<string, string> = {
    champions_league: ARG_COMPETITION_LOGOS.champions_league || '',
    europa_league: ARG_COMPETITION_LOGOS.EUROPA_LEAGUE || '',
    copa_libertadores: ARG_COMPETITION_LOGOS.copa_libertadores || '',
    copa_sudamericana: ARG_COMPETITION_LOGOS.copa_sudamericana || '',
    recopa_sudamericana: ARG_COMPETITION_LOGOS.recopa_sudamericana || '',
    copa_intercontinental: ARG_COMPETITION_LOGOS.copa_intercontinental || '',
    club_world_cup: ARG_COMPETITION_LOGOS.club_world_cup || '',
    fa_cup: ARG_COMPETITION_LOGOS.FA_CUP || '',
    carabao_cup: ARG_COMPETITION_LOGOS.CARABAO_CUP || '',
    copa_del_rey: ARG_COMPETITION_LOGOS.COPA_DEL_REY || '',
    dfb_pokal: ARG_COMPETITION_LOGOS.DFB_POKAL || '',
    coppa_italia: ARG_COMPETITION_LOGOS.COPPA_ITALIA || '',
    copa_argentina: ARG_COMPETITION_LOGOS.copa_argentina || '',
    nacional_primer_ascenso: ARG_COMPETITION_LOGOS.PRIMERA_NACIONAL || '',
    nacional_reducido: ARG_COMPETITION_LOGOS.PRIMERA_NACIONAL || '',
    copa_mx: ARG_COMPETITION_LOGOS.copa_mx || '',
};

export const CUP_THEMES: Record<string, { accent: string; bg: string; border: string }> = {
    champions_league: { accent: 'text-indigo-400', bg: 'from-indigo-950 via-slate-950 to-slate-950', border: 'border-indigo-500/40' },
    europa_league: { accent: 'text-amber-500', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-orange-500/40' },
    copa_libertadores: { accent: 'text-amber-400', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
    copa_sudamericana: { accent: 'text-amber-500', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-600/40' },
    recopa_sudamericana: { accent: 'text-yellow-400', bg: 'from-yellow-950 via-slate-950 to-slate-950', border: 'border-yellow-500/40' },
    copa_intercontinental: { accent: 'text-emerald-400', bg: 'from-emerald-950 via-slate-950 to-slate-950', border: 'border-emerald-500/40' },
    club_world_cup: { accent: 'text-amber-300', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-400/50' },
    fa_cup: { accent: 'text-red-400', bg: 'from-red-950 via-slate-950 to-slate-950', border: 'border-red-500/40' },
    carabao_cup: { accent: 'text-green-400', bg: 'from-green-950 via-slate-950 to-slate-950', border: 'border-green-500/40' },
    copa_del_rey: { accent: 'text-amber-500', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
    dfb_pokal: { accent: 'text-yellow-500', bg: 'from-yellow-950 via-slate-950 to-slate-950', border: 'border-yellow-500/40' },
    coppa_italia: { accent: 'text-green-500', bg: 'from-green-950 via-slate-950 to-slate-950', border: 'border-green-500/40' },
    copa_argentina: { accent: 'text-cyan-400', bg: 'from-cyan-950 via-slate-950 to-slate-950', border: 'border-cyan-500/40' },
    nacional_primer_ascenso: { accent: 'text-amber-400', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
    nacional_reducido: { accent: 'text-cyan-400', bg: 'from-cyan-950 via-slate-950 to-slate-950', border: 'border-cyan-500/40' },
    copa_mx: { accent: 'text-emerald-400', bg: 'from-emerald-950 via-slate-950 to-slate-950', border: 'border-emerald-500/40' },
};

export type CompetitionItem = {
    id: string;
    name: string;
    type: 'LEAGUE' | 'CUP';
    logo: string;
    country?: string;
    flagUrl?: string;
    category: 'INTERNATIONAL' | 'DOMESTIC';
    isFirstDiv?: boolean;
    cupKey?: string; 
};

export const ALL_COMPETITIONS: CompetitionItem[] = [
    // Internacionales
    { id: 'CLUB_RANKINGS', name: 'Rankings CONMEBOL / UEFA', type: 'CUP', logo: ARG_COMPETITION_LOGOS.CLUB_RANKINGS || '', category: 'INTERNATIONAL' },
    { id: 'CHAMPIONS_LEAGUE', name: 'Champions League', type: 'CUP', logo: CUP_LOGOS.champions_league, category: 'INTERNATIONAL', cupKey: 'championsLeague' },
    { id: 'EUROPA_LEAGUE', name: 'UEFA Europa League', type: 'CUP', logo: CUP_LOGOS.europa_league, category: 'INTERNATIONAL', cupKey: 'europaLeague' },
    { id: 'COPA_LIBERTADORES', name: 'Copa Libertadores', type: 'CUP', logo: CUP_LOGOS.copa_libertadores, category: 'INTERNATIONAL', cupKey: 'copaLibertadores' },
    { id: 'COPA_SUDAMERICANA', name: 'Copa Sudamericana', type: 'CUP', logo: CUP_LOGOS.copa_sudamericana, category: 'INTERNATIONAL', cupKey: 'copaSudamericana' },
    { id: 'RECOPA_SUDAMERICANA', name: 'Recopa Sudamericana', type: 'CUP', logo: CUP_LOGOS.recopa_sudamericana, category: 'INTERNATIONAL', cupKey: 'recopaSudamericana' },
    { id: 'COPA_INTERCONTINENTAL', name: 'Copa Intercontinental', type: 'CUP', logo: CUP_LOGOS.copa_intercontinental, category: 'INTERNATIONAL', cupKey: 'copaIntercontinental' },
    { id: 'CLUB_WORLD_CUP', name: 'Mundial de Clubes FIFA', type: 'CUP', logo: CUP_LOGOS.club_world_cup, category: 'INTERNATIONAL', cupKey: 'clubWorldCup' },

    // Inglaterra
    { id: 'PREMIER_LEAGUE', name: 'Premier League', type: 'LEAGUE', logo: LEAGUE_LOGOS.PREMIER_LEAGUE, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'CHAMPIONSHIP', name: 'Championship', type: 'LEAGUE', logo: LEAGUE_LOGOS.CHAMPIONSHIP, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'FA_CUP', name: 'FA Cup', type: 'CUP', logo: CUP_LOGOS.fa_cup, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', cupKey: 'faCup' },
    { id: 'CARABAO_CUP', name: 'Carabao Cup', type: 'CUP', logo: CUP_LOGOS.carabao_cup, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', cupKey: 'carabaoCup' },

    // España
    { id: 'LA_LIGA', name: 'La Liga', type: 'LEAGUE', logo: LEAGUE_LOGOS.LA_LIGA, country: 'España', flagUrl: 'https://flagcdn.com/es.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'SEGUNDA_DIVISION_ESP', name: 'LaLiga Hypermotion', type: 'LEAGUE', logo: LEAGUE_LOGOS.SEGUNDA_DIVISION_ESP, country: 'España', flagUrl: 'https://flagcdn.com/es.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'COPA_DEL_REY', name: 'Copa del Rey', type: 'CUP', logo: CUP_LOGOS.copa_del_rey, country: 'España', flagUrl: 'https://flagcdn.com/es.svg', category: 'DOMESTIC', cupKey: 'copaDelRey' },

    // Alemania
    { id: 'BUNDESLIGA', name: 'Bundesliga', type: 'LEAGUE', logo: LEAGUE_LOGOS.BUNDESLIGA, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'ZWEITE_BUNDESLIGA', name: '2. Bundesliga', type: 'LEAGUE', logo: LEAGUE_LOGOS.ZWEITE_BUNDESLIGA, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'DFB_POKAL', name: 'DFB-Pokal', type: 'CUP', logo: CUP_LOGOS.dfb_pokal, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', cupKey: 'dfbPokal' },

    // Italia
    { id: 'SERIE_A', name: 'Serie A', type: 'LEAGUE', logo: LEAGUE_LOGOS.SERIE_A, country: 'Italia', flagUrl: 'https://flagcdn.com/it.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'SERIE_B_ITA', name: 'Serie B', type: 'LEAGUE', logo: LEAGUE_LOGOS.SERIE_B_ITA, country: 'Italia', flagUrl: 'https://flagcdn.com/it.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'COPPA_ITALIA', name: 'Coppa Italia', type: 'CUP', logo: CUP_LOGOS.coppa_italia, country: 'Italia', flagUrl: 'https://flagcdn.com/it.svg', category: 'DOMESTIC', cupKey: 'coppaItalia' },

    // Francia
    { id: 'LIGUE_1', name: 'Ligue 1', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGUE_1, country: 'Francia', flagUrl: 'https://flagcdn.com/fr.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'LIGUE_2', name: 'Ligue 2', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGUE_2, country: 'Francia', flagUrl: 'https://flagcdn.com/fr.svg', category: 'DOMESTIC', isFirstDiv: false },

    // Argentina
    { id: 'LIGA_ARGENTINA', name: 'Liga Argentina', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGA_ARGENTINA, country: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'PRIMERA_NACIONAL', name: 'Primera Nacional', type: 'LEAGUE', logo: LEAGUE_LOGOS.PRIMERA_NACIONAL, country: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'COPA_ARGENTINA', name: 'Copa Argentina', type: 'CUP', logo: CUP_LOGOS.copa_argentina, country: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg', category: 'DOMESTIC', cupKey: 'copaArgentina' },

    // Brasil
    { id: 'BRASILEIRAO', name: 'Brasileirão', type: 'LEAGUE', logo: LEAGUE_LOGOS.BRASILEIRAO, country: 'Brasil', flagUrl: 'https://flagcdn.com/br.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'SERIE_B_BR', name: 'Série B BR', type: 'LEAGUE', logo: LEAGUE_LOGOS.SERIE_B_BR, country: 'Brasil', flagUrl: 'https://flagcdn.com/br.svg', category: 'DOMESTIC', isFirstDiv: false },

    // Paraguay
    { id: 'COPA_DE_PRIMERA', name: 'Copa de Primera', type: 'LEAGUE', logo: LEAGUE_LOGOS.COPA_DE_PRIMERA, country: 'Paraguay', flagUrl: 'https://flagcdn.com/py.svg', category: 'DOMESTIC', isFirstDiv: true },

    // México
    { id: 'LIGA_MX', name: 'Liga MX', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGA_MX, country: 'México', flagUrl: 'https://flagcdn.com/mx.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'LIGA_EXPANSION_MX', name: 'Liga de Expansión MX', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGA_EXPANSION_MX, country: 'México', flagUrl: 'https://flagcdn.com/mx.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'COPA_MX', name: 'Copa MX', type: 'CUP', logo: CUP_LOGOS.copa_mx, country: 'México', flagUrl: 'https://flagcdn.com/mx.svg', category: 'DOMESTIC', cupKey: 'copaMx' },

    // Chile
    { id: 'PRIMERA_DIVISION_CHILE', name: 'Primera División', type: 'LEAGUE', logo: LEAGUE_LOGOS.PRIMERA_DIVISION_CHILE, country: 'Chile', flagUrl: 'https://flagcdn.com/cl.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'PRIMERA_B_CHILE', name: 'Primera B / Ascenso', type: 'LEAGUE', logo: LEAGUE_LOGOS.PRIMERA_B_CHILE, country: 'Chile', flagUrl: 'https://flagcdn.com/cl.svg', category: 'DOMESTIC', isFirstDiv: false },

    // Colombia
    { id: 'PRIMERA_A_COLOMBIA', name: 'Liga BetPlay (Primera A)', type: 'LEAGUE', logo: LEAGUE_LOGOS.PRIMERA_A_COLOMBIA, country: 'Colombia', flagUrl: 'https://flagcdn.com/co.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'PRIMERA_B_COLOMBIA', name: 'Torneo BetPlay (Primera B)', type: 'LEAGUE', logo: LEAGUE_LOGOS.PRIMERA_B_COLOMBIA, country: 'Colombia', flagUrl: 'https://flagcdn.com/co.svg', category: 'DOMESTIC', isFirstDiv: false },

    // Portugal & Países Bajos
    { id: 'PRIMEIRA_LIGA', name: 'Liga Portugal Betclic', type: 'LEAGUE', logo: LEAGUE_LOGOS.PRIMEIRA_LIGA, country: 'Portugal', flagUrl: 'https://flagcdn.com/pt.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'EREDIVISIE', name: 'Eredivisie', type: 'LEAGUE', logo: LEAGUE_LOGOS.EREDIVISIE, country: 'Países Bajos', flagUrl: 'https://flagcdn.com/nl.svg', category: 'DOMESTIC', isFirstDiv: true },

    // Uruguay, Ecuador & EE.UU.
    { id: 'LIGA_URUGUAYA', name: 'Liga AUF Uruguaya', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGA_URUGUAYA, country: 'Uruguay', flagUrl: 'https://flagcdn.com/uy.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'LIGA_ECUADOR', name: 'LigaPro Serie A', type: 'LEAGUE', logo: LEAGUE_LOGOS.LIGA_ECUADOR, country: 'Ecuador', flagUrl: 'https://flagcdn.com/ec.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'MLS', name: 'Major League Soccer', type: 'LEAGUE', logo: LEAGUE_LOGOS.MLS, country: 'EE.UU.', flagUrl: 'https://flagcdn.com/us.svg', category: 'DOMESTIC', isFirstDiv: true },
];
