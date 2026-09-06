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
};

export const LEAGUE_LOGOS: Record<string, string> = {
    PREMIER_LEAGUE: '/logos/Premier League.png',
    CHAMPIONSHIP: '/logos/Sky Bet Championship.png',
    LA_LIGA: 'https://tmssl.akamaized.net/images/logo/header/es1.png',
    SEGUNDA_DIVISION_ESP: 'https://tmssl.akamaized.net/images/logo/header/es2.png',
    BUNDESLIGA: 'https://tmssl.akamaized.net/images/logo/header/l1.png',
    ZWEITE_BUNDESLIGA: 'https://tmssl.akamaized.net/images/logo/header/l2.png',
    SERIE_A: 'https://tmssl.akamaized.net/images/logo/header/it1.png',
    SERIE_B_ITA: 'https://tmssl.akamaized.net/images/logo/header/it2.png',
    LIGUE_1: 'https://tmssl.akamaized.net/images/logo/header/fr1.png',
    LIGUE_2: 'https://tmssl.akamaized.net/images/logo/header/fr2.png',
    LIGA_ARGENTINA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Liga_Profesional_de_F%C3%BAtbol_logo.svg/200px-Liga_Profesional_de_F%C3%BAtbol_logo.svg.png',
    PRIMERA_NACIONAL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Primera_Nacional_logo.png/200px-Primera_Nacional_logo.png',
    BRASILEIRAO: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Brasileirao_Serie_A_logo.png/200px-Brasileirao_Serie_A_logo.png',
    SERIE_B_BR: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Brasileir%C3%A3o_S%C3%A9rie_B_logo.png/200px-Brasileir%C3%A3o_S%C3%A9rie_B_logo.png',
};

export const CUP_LOGOS: Record<string, string> = {
    champions_league: 'https://tmssl.akamaized.net/images/logo/header/cl.png',
    copa_libertadores: 'https://tmssl.akamaized.net/images/logo/header/cli.png',
    copa_intercontinental: 'https://upload.wikimedia.org/wikipedia/en/5/5b/FIFA_Intercontinental_Cup_%28logo%29.png',
    fa_cup: '/logos/The Emirates FA Cup.png',
    carabao_cup: '/logos/carabao_cup_logo.png',
    copa_del_rey: 'https://tmssl.akamaized.net/images/logo/header/cdr.png',
    dfb_pokal: 'https://tmssl.akamaized.net/images/logo/header/dfb.png',
    coppa_italia: 'https://tmssl.akamaized.net/images/logo/header/cit.png',
    copa_argentina: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Copa_Argentina_logo.png/200px-Copa_Argentina_logo.png',
};

export const CUP_THEMES: Record<string, { accent: string; bg: string; border: string }> = {
    champions_league: { accent: 'text-indigo-400', bg: 'from-indigo-950 via-slate-950 to-slate-950', border: 'border-indigo-500/40' },
    copa_libertadores: { accent: 'text-amber-400', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
    copa_intercontinental: { accent: 'text-emerald-400', bg: 'from-emerald-950 via-slate-950 to-slate-950', border: 'border-emerald-500/40' },
    fa_cup: { accent: 'text-red-400', bg: 'from-red-950 via-slate-950 to-slate-950', border: 'border-red-500/40' },
    carabao_cup: { accent: 'text-green-400', bg: 'from-green-950 via-slate-950 to-slate-950', border: 'border-green-500/40' },
    copa_del_rey: { accent: 'text-amber-500', bg: 'from-amber-950 via-slate-950 to-slate-950', border: 'border-amber-500/40' },
    dfb_pokal: { accent: 'text-yellow-500', bg: 'from-yellow-950 via-slate-950 to-slate-950', border: 'border-yellow-500/40' },
    coppa_italia: { accent: 'text-green-500', bg: 'from-green-950 via-slate-950 to-slate-950', border: 'border-green-500/40' },
    copa_argentina: { accent: 'text-cyan-400', bg: 'from-cyan-950 via-slate-950 to-slate-950', border: 'border-cyan-500/40' },
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
    { id: 'CHAMPIONS_LEAGUE', name: 'Champions League', type: 'CUP', logo: CUP_LOGOS.champions_league, category: 'INTERNATIONAL', cupKey: 'championsLeague' },
    { id: 'COPA_LIBERTADORES', name: 'Copa Libertadores', type: 'CUP', logo: CUP_LOGOS.copa_libertadores, category: 'INTERNATIONAL', cupKey: 'copaLibertadores' },
    { id: 'COPA_INTERCONTINENTAL', name: 'Copa Intercontinental', type: 'CUP', logo: CUP_LOGOS.copa_intercontinental, category: 'INTERNATIONAL', cupKey: 'copaIntercontinental' },

    // Inglaterra
    { id: 'PREMIER_LEAGUE', name: 'Premier League', type: 'LEAGUE', logo: LEAGUE_LOGOS.PREMIER_LEAGUE, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'CHAMPIONSHIP', name: 'Championship', type: 'LEAGUE', logo: LEAGUE_LOGOS.CHAMPIONSHIP, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'FA_CUP', name: 'FA Cup', type: 'CUP', logo: CUP_LOGOS.fa_cup, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', cupKey: 'faCup' },
    { id: 'CARABAO_CUP', name: 'Carabao Cup', type: 'CUP', logo: CUP_LOGOS.carabao_cup, country: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', category: 'DOMESTIC', cupKey: 'carabaoCup' },

    // España
    { id: 'LA_LIGA', name: 'La Liga', type: 'LEAGUE', logo: LEAGUE_LOGOS.LA_LIGA, country: 'España', flagUrl: 'https://flagcdn.com/es.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'COPA_DEL_REY', name: 'Copa del Rey', type: 'CUP', logo: CUP_LOGOS.copa_del_rey, country: 'España', flagUrl: 'https://flagcdn.com/es.svg', category: 'DOMESTIC', cupKey: 'copaDelRey' },

    // Alemania
    { id: 'BUNDESLIGA', name: 'Bundesliga', type: 'LEAGUE', logo: LEAGUE_LOGOS.BUNDESLIGA, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', isFirstDiv: true },
    { id: 'ZWEITE_BUNDESLIGA', name: '2. Bundesliga', type: 'LEAGUE', logo: LEAGUE_LOGOS.ZWEITE_BUNDESLIGA, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', isFirstDiv: false },
    { id: 'DFB_POKAL', name: 'DFB-Pokal', type: 'CUP', logo: CUP_LOGOS.dfb_pokal, country: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', category: 'DOMESTIC', cupKey: 'dfbPokal' },

    // Italia
    { id: 'SERIE_A', name: 'Serie A', type: 'LEAGUE', logo: LEAGUE_LOGOS.SERIE_A, country: 'Italia', flagUrl: 'https://flagcdn.com/it.svg', category: 'DOMESTIC', isFirstDiv: true },
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
];
