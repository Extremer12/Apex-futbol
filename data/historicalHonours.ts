/**
 * Historical Honours and Palmarés Database
 * Real-world historical champions, all-time titles tally, and club honours.
 */

export interface HistoricalChampionEntry {
    teamName: string;
    titles: number;
    lastWonYear?: number;
}

export interface HistoricalEditionEntry {
    season: string | number;
    winnerName: string;
    runnerUp?: string;
    score?: string;
}

export interface CompetitionHistoricalRecord {
    id: string;
    name: string;
    allTimeRanking: HistoricalChampionEntry[];
    recentEditions: HistoricalEditionEntry[];
}

export interface ClubHonours {
    clubName: string;
    leagueTitles: number;
    domesticCups: number;
    continentalCups: number; // Champions League, Copa Libertadores, etc.
    intercontinental: number; // Intercontinental / Club World Cup
    totalOfficialTitles: number;
    highlights: string[];
}

export const COMPETITION_HISTORICAL_CHAMPIONS: Record<string, CompetitionHistoricalRecord> = {
    // =========================================================================
    // 🌍 INTERNACIONALES / CONTINENTALES
    // =========================================================================
    'CHAMPIONS_LEAGUE': {
        id: 'CHAMPIONS_LEAGUE',
        name: 'UEFA Champions League',
        allTimeRanking: [
            { teamName: 'Real Madrid', titles: 15, lastWonYear: 2024 },
            { teamName: 'AC Milan', titles: 7, lastWonYear: 2007 },
            { teamName: 'Bayern München', titles: 6, lastWonYear: 2020 },
            { teamName: 'Liverpool', titles: 6, lastWonYear: 2019 },
            { teamName: 'FC Barcelona', titles: 5, lastWonYear: 2015 },
            { teamName: 'Ajax', titles: 4, lastWonYear: 1995 },
            { teamName: 'Inter Milano', titles: 3, lastWonYear: 2010 },
            { teamName: 'Manchester United', titles: 3, lastWonYear: 2008 },
            { teamName: 'Juventus', titles: 2, lastWonYear: 1996 },
            { teamName: 'Chelsea', titles: 2, lastWonYear: 2021 },
            { teamName: 'Benfica', titles: 2, lastWonYear: 1962 },
            { teamName: 'Porto', titles: 2, lastWonYear: 2004 },
            { teamName: 'Nottm Forest', titles: 2, lastWonYear: 1980 },
            { teamName: 'Manchester City', titles: 1, lastWonYear: 2023 },
            { teamName: 'Borussia Dortmund', titles: 1, lastWonYear: 1997 },
            { teamName: 'Olympique de Marseille', titles: 1, lastWonYear: 1993 },
            { teamName: 'Aston Villa', titles: 1, lastWonYear: 1982 },
            { teamName: 'Feyenoord', titles: 1, lastWonYear: 1970 },
            { teamName: 'Celtic', titles: 1, lastWonYear: 1967 },
            { teamName: 'PSV Eindhoven', titles: 1, lastWonYear: 1988 },
            { teamName: 'Red Star Belgrade', titles: 1, lastWonYear: 1991 },
            { teamName: 'Steaua București', titles: 1, lastWonYear: 1986 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Real Madrid', runnerUp: 'Borussia Dortmund', score: '2-0' },
            { season: '2022/23', winnerName: 'Manchester City', runnerUp: 'Inter Milano', score: '1-0' },
            { season: '2021/22', winnerName: 'Real Madrid', runnerUp: 'Liverpool', score: '1-0' },
            { season: '2020/21', winnerName: 'Chelsea', runnerUp: 'Manchester City', score: '1-0' },
            { season: '2019/20', winnerName: 'Bayern München', runnerUp: 'Paris Saint-Germain', score: '1-0' },
            { season: '2018/19', winnerName: 'Liverpool', runnerUp: 'Tottenham', score: '2-0' },
            { season: '2017/18', winnerName: 'Real Madrid', runnerUp: 'Liverpool', score: '3-1' },
            { season: '2016/17', winnerName: 'Real Madrid', runnerUp: 'Juventus', score: '4-1' },
            { season: '2015/16', winnerName: 'Real Madrid', runnerUp: 'Atlético Madrid', score: '1-1 (5-3 pen.)' },
            { season: '2014/15', winnerName: 'FC Barcelona', runnerUp: 'Juventus', score: '3-1' }
        ]
    },

    'COPA_LIBERTADORES': {
        id: 'COPA_LIBERTADORES',
        name: 'CONMEBOL Libertadores',
        allTimeRanking: [
            { teamName: 'Independiente', titles: 7, lastWonYear: 1984 },
            { teamName: 'Boca Juniors', titles: 6, lastWonYear: 2007 },
            { teamName: 'Peñarol', titles: 5, lastWonYear: 1987 },
            { teamName: 'River Plate', titles: 4, lastWonYear: 2018 },
            { teamName: 'Estudiantes LP', titles: 4, lastWonYear: 2009 },
            { teamName: 'Olimpia', titles: 3, lastWonYear: 2002 },
            { teamName: 'Nacional', titles: 3, lastWonYear: 1988 },
            { teamName: 'São Paulo FC', titles: 3, lastWonYear: 2005 },
            { teamName: 'Grêmio', titles: 3, lastWonYear: 2017 },
            { teamName: 'Santos', titles: 3, lastWonYear: 2011 },
            { teamName: 'Palmeiras', titles: 3, lastWonYear: 2021 },
            { teamName: 'Flamengo', titles: 3, lastWonYear: 2022 },
            { teamName: 'Internacional', titles: 2, lastWonYear: 2010 },
            { teamName: 'Cruzeiro', titles: 2, lastWonYear: 1997 },
            { teamName: 'Atlético Nacional', titles: 2, lastWonYear: 2016 },
            { teamName: 'Fluminense', titles: 1, lastWonYear: 2023 },
            { teamName: 'Botafogo', titles: 1, lastWonYear: 2024 },
            { teamName: 'Atlético Mineiro', titles: 1, lastWonYear: 2013 },
            { teamName: 'Corinthians', titles: 1, lastWonYear: 2012 },
            { teamName: 'LDU Quito', titles: 1, lastWonYear: 2008 },
            { teamName: 'San Lorenzo', titles: 1, lastWonYear: 2014 },
            { teamName: 'Vélez Sarsfield', titles: 1, lastWonYear: 1994 },
            { teamName: 'Racing Club', titles: 1, lastWonYear: 1967 },
            { teamName: 'Colo-Colo', titles: 1, lastWonYear: 1991 }
        ],
        recentEditions: [
            { season: '2024', winnerName: 'Botafogo', runnerUp: 'Atlético Mineiro', score: '3-1' },
            { season: '2023', winnerName: 'Fluminense', runnerUp: 'Boca Juniors', score: '2-1 (t.e.)' },
            { season: '2022', winnerName: 'Flamengo', runnerUp: 'Athletico Paranaense', score: '1-0' },
            { season: '2021', winnerName: 'Palmeiras', runnerUp: 'Flamengo', score: '2-1 (t.e.)' },
            { season: '2020', winnerName: 'Palmeiras', runnerUp: 'Santos', score: '1-0' },
            { season: '2019', winnerName: 'Flamengo', runnerUp: 'River Plate', score: '2-1' },
            { season: '2018', winnerName: 'River Plate', runnerUp: 'Boca Juniors', score: '3-1 (t.e.)' },
            { season: '2017', winnerName: 'Grêmio', runnerUp: 'Lanús', score: '3-1 (agg)' },
            { season: '2016', winnerName: 'Atlético Nacional', runnerUp: 'Independiente del Valle', score: '2-1 (agg)' },
            { season: '2015', winnerName: 'River Plate', runnerUp: 'Tigres UANL', score: '3-0 (agg)' }
        ]
    },

    'COPA_SUDAMERICANA': {
        id: 'COPA_SUDAMERICANA',
        name: 'CONMEBOL Sudamericana',
        allTimeRanking: [
            { teamName: 'LDU Quito', titles: 2, lastWonYear: 2023 },
            { teamName: 'Boca Juniors', titles: 2, lastWonYear: 2005 },
            { teamName: 'Independiente', titles: 2, lastWonYear: 2017 },
            { teamName: 'Athletico Paranaense', titles: 2, lastWonYear: 2021 },
            { teamName: 'Independiente del Valle', titles: 2, lastWonYear: 2022 },
            { teamName: 'Racing Club', titles: 1, lastWonYear: 2024 },
            { teamName: 'River Plate', titles: 1, lastWonYear: 2014 },
            { teamName: 'Defensa y Justicia', titles: 1, lastWonYear: 2020 },
            { teamName: 'Lanús', titles: 1, lastWonYear: 2013 },
            { teamName: 'San Lorenzo', titles: 1, lastWonYear: 2002 },
            { teamName: 'São Paulo FC', titles: 1, lastWonYear: 2012 },
            { teamName: 'Internacional', titles: 1, lastWonYear: 2008 },
            { teamName: 'Santa Fe', titles: 1, lastWonYear: 2015 },
            { teamName: 'Chapecoense', titles: 1, lastWonYear: 2016 },
            { teamName: 'Arsenal de Sarandí', titles: 1, lastWonYear: 2007 }
        ],
        recentEditions: [
            { season: '2024', winnerName: 'Racing Club', runnerUp: 'Cruzeiro', score: '3-1' },
            { season: '2023', winnerName: 'LDU Quito', runnerUp: 'Fortaleza', score: '1-1 (4-3 pen.)' },
            { season: '2022', winnerName: 'Independiente del Valle', runnerUp: 'São Paulo FC', score: '2-0' },
            { season: '2021', winnerName: 'Athletico Paranaense', runnerUp: 'Red Bull Bragantino', score: '1-0' },
            { season: '2020', winnerName: 'Defensa y Justicia', runnerUp: 'Lanús', score: '3-0' }
        ]
    },

    'COPA_INTERCONTINENTAL': {
        id: 'COPA_INTERCONTINENTAL',
        name: 'Copa Intercontinental / FIFA Club World Cup',
        allTimeRanking: [
            { teamName: 'Real Madrid', titles: 8, lastWonYear: 2022 },
            { teamName: 'AC Milan', titles: 4, lastWonYear: 2007 },
            { teamName: 'Bayern München', titles: 4, lastWonYear: 2020 },
            { teamName: 'Peñarol', titles: 3, lastWonYear: 1982 },
            { teamName: 'Nacional', titles: 3, lastWonYear: 1988 },
            { teamName: 'Boca Juniors', titles: 3, lastWonYear: 2003 },
            { teamName: 'São Paulo FC', titles: 3, lastWonYear: 2005 },
            { teamName: 'Inter Milano', titles: 3, lastWonYear: 2010 },
            { teamName: 'FC Barcelona', titles: 3, lastWonYear: 2015 },
            { teamName: 'Santos', titles: 2, lastWonYear: 1963 },
            { teamName: 'Independiente', titles: 2, lastWonYear: 1984 },
            { teamName: 'Juventus', titles: 2, lastWonYear: 1996 },
            { teamName: 'Ajax', titles: 2, lastWonYear: 1995 },
            { teamName: 'Porto', titles: 2, lastWonYear: 2004 },
            { teamName: 'Manchester United', titles: 2, lastWonYear: 2008 },
            { teamName: 'Corinthians', titles: 2, lastWonYear: 2012 },
            { teamName: 'Manchester City', titles: 1, lastWonYear: 2023 },
            { teamName: 'Liverpool', titles: 1, lastWonYear: 2019 },
            { teamName: 'Chelsea', titles: 1, lastWonYear: 2021 },
            { teamName: 'River Plate', titles: 1, lastWonYear: 1986 },
            { teamName: 'Racing Club', titles: 1, lastWonYear: 1967 },
            { teamName: 'Estudiantes LP', titles: 1, lastWonYear: 1968 },
            { teamName: 'Olimpia', titles: 1, lastWonYear: 1979 },
            { teamName: 'Flamengo', titles: 1, lastWonYear: 1981 },
            { teamName: 'Grêmio', titles: 1, lastWonYear: 1983 },
            { teamName: 'Vélez Sarsfield', titles: 1, lastWonYear: 1994 },
            { teamName: 'Borussia Dortmund', titles: 1, lastWonYear: 1997 },
            { teamName: 'Internacional', titles: 1, lastWonYear: 2006 }
        ],
        recentEditions: [
            { season: '2023', winnerName: 'Manchester City', runnerUp: 'Fluminense', score: '4-0' },
            { season: '2022', winnerName: 'Real Madrid', runnerUp: 'Al-Hilal', score: '5-3' },
            { season: '2021', winnerName: 'Chelsea', runnerUp: 'Palmeiras', score: '2-1 (t.e.)' },
            { season: '2020', winnerName: 'Bayern München', runnerUp: 'Tigres UANL', score: '1-0' },
            { season: '2019', winnerName: 'Liverpool', runnerUp: 'Flamengo', score: '1-0 (t.e.)' }
        ]
    },

    // =========================================================================
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA
    // =========================================================================
    'PREMIER_LEAGUE': {
        id: 'PREMIER_LEAGUE',
        name: 'Premier League',
        allTimeRanking: [
            { teamName: 'Manchester United', titles: 20, lastWonYear: 2013 },
            { teamName: 'Liverpool', titles: 19, lastWonYear: 2020 },
            { teamName: 'Arsenal', titles: 13, lastWonYear: 2004 },
            { teamName: 'Manchester City', titles: 10, lastWonYear: 2024 },
            { teamName: 'Everton', titles: 9, lastWonYear: 1987 },
            { teamName: 'Aston Villa', titles: 7, lastWonYear: 1981 },
            { teamName: 'Chelsea', titles: 6, lastWonYear: 2017 },
            { teamName: 'Newcastle Utd', titles: 4, lastWonYear: 1927 },
            { teamName: 'Sheffield Wednesday', titles: 4, lastWonYear: 1930 },
            { teamName: 'Blackburn Rovers', titles: 3, lastWonYear: 1995 },
            { teamName: 'Wolverhampton', titles: 3, lastWonYear: 1959 },
            { teamName: 'Leeds United', titles: 3, lastWonYear: 1992 },
            { teamName: 'Tottenham', titles: 2, lastWonYear: 1961 },
            { teamName: 'Burnley', titles: 2, lastWonYear: 1960 },
            { teamName: 'Derby County', titles: 2, lastWonYear: 1975 },
            { teamName: 'Leicester City', titles: 1, lastWonYear: 2016 },
            { teamName: 'Nottm Forest', titles: 1, lastWonYear: 1978 },
            { teamName: 'Ipswich Town', titles: 1, lastWonYear: 1962 },
            { teamName: 'Sheffield Utd', titles: 1, lastWonYear: 1898 },
            { teamName: 'West Brom', titles: 1, lastWonYear: 1920 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Manchester City', runnerUp: 'Arsenal' },
            { season: '2022/23', winnerName: 'Manchester City', runnerUp: 'Arsenal' },
            { season: '2021/22', winnerName: 'Manchester City', runnerUp: 'Liverpool' },
            { season: '2020/21', winnerName: 'Manchester City', runnerUp: 'Manchester United' },
            { season: '2019/20', winnerName: 'Liverpool', runnerUp: 'Manchester City' },
            { season: '2018/19', winnerName: 'Manchester City', runnerUp: 'Liverpool' },
            { season: '2017/18', winnerName: 'Manchester City', runnerUp: 'Manchester United' },
            { season: '2016/17', winnerName: 'Chelsea', runnerUp: 'Tottenham' },
            { season: '2015/16', winnerName: 'Leicester City', runnerUp: 'Arsenal' },
            { season: '2014/15', winnerName: 'Chelsea', runnerUp: 'Manchester City' }
        ]
    },

    'FA_CUP': {
        id: 'FA_CUP',
        name: 'The Emirates FA Cup',
        allTimeRanking: [
            { teamName: 'Arsenal', titles: 14, lastWonYear: 2020 },
            { teamName: 'Manchester United', titles: 13, lastWonYear: 2024 },
            { teamName: 'Chelsea', titles: 8, lastWonYear: 2018 },
            { teamName: 'Liverpool', titles: 8, lastWonYear: 2022 },
            { teamName: 'Tottenham', titles: 8, lastWonYear: 1991 },
            { teamName: 'Manchester City', titles: 7, lastWonYear: 2023 },
            { teamName: 'Aston Villa', titles: 7, lastWonYear: 1957 },
            { teamName: 'Newcastle Utd', titles: 6, lastWonYear: 1955 },
            { teamName: 'Everton', titles: 5, lastWonYear: 1995 },
            { teamName: 'West Brom', titles: 5, lastWonYear: 1968 },
            { teamName: 'Wolverhampton', titles: 4, lastWonYear: 1960 },
            { teamName: 'West Ham', titles: 3, lastWonYear: 1980 },
            { teamName: 'Sheffield Wednesday', titles: 3, lastWonYear: 1935 },
            { teamName: 'Leicester City', titles: 1, lastWonYear: 2021 },
            { teamName: 'Wigan Athletic', titles: 1, lastWonYear: 2013 },
            { teamName: 'Portsmouth', titles: 2, lastWonYear: 2008 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Manchester United', runnerUp: 'Manchester City', score: '2-1' },
            { season: '2022/23', winnerName: 'Manchester City', runnerUp: 'Manchester United', score: '2-1' },
            { season: '2021/22', winnerName: 'Liverpool', runnerUp: 'Chelsea', score: '0-0 (6-5 pen.)' },
            { season: '2020/21', winnerName: 'Leicester City', runnerUp: 'Chelsea', score: '1-0' },
            { season: '2019/20', winnerName: 'Arsenal', runnerUp: 'Chelsea', score: '2-1' }
        ]
    },

    'CARABAO_CUP': {
        id: 'CARABAO_CUP',
        name: 'Carabao Cup (EFL Cup)',
        allTimeRanking: [
            { teamName: 'Liverpool', titles: 10, lastWonYear: 2024 },
            { teamName: 'Manchester City', titles: 8, lastWonYear: 2021 },
            { teamName: 'Manchester United', titles: 6, lastWonYear: 2023 },
            { teamName: 'Aston Villa', titles: 5, lastWonYear: 1996 },
            { teamName: 'Chelsea', titles: 5, lastWonYear: 2015 },
            { teamName: 'Tottenham', titles: 4, lastWonYear: 2008 },
            { teamName: 'Leicester City', titles: 3, lastWonYear: 2000 },
            { teamName: 'Arsenal', titles: 2, lastWonYear: 1993 },
            { teamName: 'Norwich City', titles: 2, lastWonYear: 1985 },
            { teamName: 'Wolverhampton', titles: 2, lastWonYear: 1980 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Liverpool', runnerUp: 'Chelsea', score: '1-0 (t.e.)' },
            { season: '2022/23', winnerName: 'Manchester United', runnerUp: 'Newcastle Utd', score: '2-0' },
            { season: '2021/22', winnerName: 'Liverpool', runnerUp: 'Chelsea', score: '0-0 (11-10 pen.)' },
            { season: '2020/21', winnerName: 'Manchester City', runnerUp: 'Tottenham', score: '1-0' },
            { season: '2019/20', winnerName: 'Manchester City', runnerUp: 'Aston Villa', score: '2-1' }
        ]
    },

    // =========================================================================
    // 🇪🇸 ESPAÑA
    // =========================================================================
    'LA_LIGA': {
        id: 'LA_LIGA',
        name: 'LaLiga EA Sports',
        allTimeRanking: [
            { teamName: 'Real Madrid', titles: 36, lastWonYear: 2024 },
            { teamName: 'FC Barcelona', titles: 27, lastWonYear: 2023 },
            { teamName: 'Atlético Madrid', titles: 11, lastWonYear: 2021 },
            { teamName: 'Athletic Club', titles: 8, lastWonYear: 1984 },
            { teamName: 'Valencia CF', titles: 6, lastWonYear: 2004 },
            { teamName: 'Real Sociedad', titles: 2, lastWonYear: 1982 },
            { teamName: 'Real Betis', titles: 1, lastWonYear: 1935 },
            { teamName: 'Sevilla FC', titles: 1, lastWonYear: 1946 },
            { teamName: 'Deportivo La Coruña', titles: 1, lastWonYear: 2000 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Real Madrid', runnerUp: 'FC Barcelona' },
            { season: '2022/23', winnerName: 'FC Barcelona', runnerUp: 'Real Madrid' },
            { season: '2021/22', winnerName: 'Real Madrid', runnerUp: 'FC Barcelona' },
            { season: '2020/21', winnerName: 'Atlético Madrid', runnerUp: 'Real Madrid' },
            { season: '2019/20', winnerName: 'Real Madrid', runnerUp: 'FC Barcelona' },
            { season: '2018/19', winnerName: 'FC Barcelona', runnerUp: 'Atlético Madrid' }
        ]
    },

    'COPA_DEL_REY': {
        id: 'COPA_DEL_REY',
        name: 'Copa del Rey',
        allTimeRanking: [
            { teamName: 'FC Barcelona', titles: 31, lastWonYear: 2021 },
            { teamName: 'Athletic Club', titles: 24, lastWonYear: 2024 },
            { teamName: 'Real Madrid', titles: 20, lastWonYear: 2023 },
            { teamName: 'Atlético Madrid', titles: 10, lastWonYear: 2013 },
            { teamName: 'Valencia CF', titles: 8, lastWonYear: 2019 },
            { teamName: 'Real Zaragoza', titles: 6, lastWonYear: 2004 },
            { teamName: 'Sevilla FC', titles: 5, lastWonYear: 2010 },
            { teamName: 'Real Betis', titles: 3, lastWonYear: 2022 },
            { teamName: 'Real Sociedad', titles: 3, lastWonYear: 2020 },
            { teamName: 'Deportivo La Coruña', titles: 2, lastWonYear: 2002 },
            { teamName: 'Espanyol', titles: 4, lastWonYear: 2006 },
            { teamName: 'Mallorca', titles: 1, lastWonYear: 2003 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Athletic Club', runnerUp: 'Mallorca', score: '1-1 (4-2 pen.)' },
            { season: '2022/23', winnerName: 'Real Madrid', runnerUp: 'Osasuna', score: '2-1' },
            { season: '2021/22', winnerName: 'Real Betis', runnerUp: 'Valencia CF', score: '1-1 (5-4 pen.)' },
            { season: '2020/21', winnerName: 'FC Barcelona', runnerUp: 'Athletic Club', score: '4-0' },
            { season: '2019/20', winnerName: 'Real Sociedad', runnerUp: 'Athletic Club', score: '1-0' }
        ]
    },

    // =========================================================================
    // 🇮🇹 ITALIA
    // =========================================================================
    'SERIE_A': {
        id: 'SERIE_A',
        name: 'Serie A Enilive',
        allTimeRanking: [
            { teamName: 'Juventus', titles: 36, lastWonYear: 2020 },
            { teamName: 'Inter Milano', titles: 20, lastWonYear: 2024 },
            { teamName: 'AC Milan', titles: 19, lastWonYear: 2022 },
            { teamName: 'Genoa', titles: 9, lastWonYear: 1924 },
            { teamName: 'Torino', titles: 7, lastWonYear: 1976 },
            { teamName: 'Bologna', titles: 7, lastWonYear: 1964 },
            { teamName: 'Pro Vercelli', titles: 7, lastWonYear: 1922 },
            { teamName: 'AS Roma', titles: 3, lastWonYear: 2001 },
            { teamName: 'SSC Napoli', titles: 3, lastWonYear: 2023 },
            { teamName: 'Lazio', titles: 2, lastWonYear: 2000 },
            { teamName: 'Fiorentina', titles: 2, lastWonYear: 1969 },
            { teamName: 'Cagliari', titles: 1, lastWonYear: 1970 },
            { teamName: 'Hellas Verona', titles: 1, lastWonYear: 1985 },
            { teamName: 'Sampdoria', titles: 1, lastWonYear: 1991 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Inter Milano', runnerUp: 'AC Milan' },
            { season: '2022/23', winnerName: 'SSC Napoli', runnerUp: 'Lazio' },
            { season: '2021/22', winnerName: 'AC Milan', runnerUp: 'Inter Milano' },
            { season: '2020/21', winnerName: 'Inter Milano', runnerUp: 'AC Milan' },
            { season: '2019/20', winnerName: 'Juventus', runnerUp: 'Inter Milano' }
        ]
    },

    'COPPA_ITALIA': {
        id: 'COPPA_ITALIA',
        name: 'Coppa Italia Frecciarossa',
        allTimeRanking: [
            { teamName: 'Juventus', titles: 15, lastWonYear: 2024 },
            { teamName: 'AS Roma', titles: 9, lastWonYear: 2008 },
            { teamName: 'Inter Milano', titles: 9, lastWonYear: 2023 },
            { teamName: 'Lazio', titles: 7, lastWonYear: 2019 },
            { teamName: 'Fiorentina', titles: 6, lastWonYear: 2001 },
            { teamName: 'SSC Napoli', titles: 6, lastWonYear: 2020 },
            { teamName: 'AC Milan', titles: 5, lastWonYear: 2003 },
            { teamName: 'Torino', titles: 5, lastWonYear: 1993 },
            { teamName: 'Sampdoria', titles: 4, lastWonYear: 1994 },
            { teamName: 'Parma', titles: 3, lastWonYear: 2002 },
            { teamName: 'Bologna', titles: 2, lastWonYear: 1974 },
            { teamName: 'Atalanta', titles: 1, lastWonYear: 1963 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Juventus', runnerUp: 'Atalanta', score: '1-0' },
            { season: '2022/23', winnerName: 'Inter Milano', runnerUp: 'Fiorentina', score: '2-1' },
            { season: '2021/22', winnerName: 'Inter Milano', runnerUp: 'Juventus', score: '4-2 (t.e.)' },
            { season: '2020/21', winnerName: 'Juventus', runnerUp: 'Atalanta', score: '2-1' },
            { season: '2019/20', winnerName: 'SSC Napoli', runnerUp: 'Juventus', score: '0-0 (4-2 pen.)' }
        ]
    },

    // =========================================================================
    // 🇩🇪 ALEMANIA
    // =========================================================================
    'BUNDESLIGA': {
        id: 'BUNDESLIGA',
        name: 'Bundesliga',
        allTimeRanking: [
            { teamName: 'Bayern München', titles: 33, lastWonYear: 2023 },
            { teamName: 'Borussia Dortmund', titles: 8, lastWonYear: 2012 },
            { teamName: 'Borussia M’gladbach', titles: 5, lastWonYear: 1977 },
            { teamName: 'Werder Bremen', titles: 4, lastWonYear: 2004 },
            { teamName: 'Hamburger SV', titles: 6, lastWonYear: 1983 },
            { teamName: 'VfB Stuttgart', titles: 5, lastWonYear: 2007 },
            { teamName: '1. FC Kaiserslautern', titles: 4, lastWonYear: 1998 },
            { teamName: '1. FC Köln', titles: 3, lastWonYear: 1978 },
            { teamName: 'Bayer Leverkusen', titles: 1, lastWonYear: 2024 },
            { teamName: 'VfL Wolfsburg', titles: 1, lastWonYear: 2009 },
            { teamName: 'Eintracht Frankfurt', titles: 1, lastWonYear: 1959 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Bayer Leverkusen', runnerUp: 'VfB Stuttgart' },
            { season: '2022/23', winnerName: 'Bayern München', runnerUp: 'Borussia Dortmund' },
            { season: '2021/22', winnerName: 'Bayern München', runnerUp: 'Borussia Dortmund' },
            { season: '2020/21', winnerName: 'Bayern München', runnerUp: 'RB Leipzig' },
            { season: '2019/20', winnerName: 'Bayern München', runnerUp: 'Borussia Dortmund' }
        ]
    },

    'DFB_POKAL': {
        id: 'DFB_POKAL',
        name: 'DFB-Pokal',
        allTimeRanking: [
            { teamName: 'Bayern München', titles: 20, lastWonYear: 2020 },
            { teamName: 'Werder Bremen', titles: 6, lastWonYear: 2009 },
            { teamName: 'Borussia Dortmund', titles: 5, lastWonYear: 2021 },
            { teamName: 'Eintracht Frankfurt', titles: 5, lastWonYear: 2018 },
            { teamName: '1. FC Köln', titles: 4, lastWonYear: 1983 },
            { teamName: '1. FC Nürnberg', titles: 4, lastWonYear: 2007 },
            { teamName: 'VfB Stuttgart', titles: 3, lastWonYear: 1997 },
            { teamName: 'Borussia M’gladbach', titles: 3, lastWonYear: 1995 },
            { teamName: 'Bayer Leverkusen', titles: 2, lastWonYear: 2024 },
            { teamName: 'RB Leipzig', titles: 2, lastWonYear: 2023 },
            { teamName: 'VfL Wolfsburg', titles: 1, lastWonYear: 2015 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Bayer Leverkusen', runnerUp: '1. FC Kaiserslautern', score: '1-0' },
            { season: '2022/23', winnerName: 'RB Leipzig', runnerUp: 'Eintracht Frankfurt', score: '2-0' },
            { season: '2021/22', winnerName: 'RB Leipzig', runnerUp: 'SC Freiburg', score: '1-1 (4-2 pen.)' },
            { season: '2020/21', winnerName: 'Borussia Dortmund', runnerUp: 'RB Leipzig', score: '4-1' },
            { season: '2019/20', winnerName: 'Bayern München', runnerUp: 'Bayer Leverkusen', score: '4-2' }
        ]
    },

    // =========================================================================
    // 🇫🇷 FRANCIA
    // =========================================================================
    'LIGUE_1': {
        id: 'LIGUE_1',
        name: 'Ligue 1 McDonald’s',
        allTimeRanking: [
            { teamName: 'Paris Saint-Germain', titles: 12, lastWonYear: 2024 },
            { teamName: 'AS Saint-Étienne', titles: 10, lastWonYear: 1981 },
            { teamName: 'Olympique de Marseille', titles: 9, lastWonYear: 2010 },
            { teamName: 'AS Monaco', titles: 8, lastWonYear: 2017 },
            { teamName: 'FC Nantes', titles: 8, lastWonYear: 2001 },
            { teamName: 'Olympique Lyonnais', titles: 7, lastWonYear: 2008 },
            { teamName: 'Girondins de Bordeaux', titles: 6, lastWonYear: 2009 },
            { teamName: 'LOSC Lille', titles: 4, lastWonYear: 2021 },
            { teamName: 'OGC Nice', titles: 4, lastWonYear: 1959 },
            { teamName: 'Stade de Reims', titles: 6, lastWonYear: 1962 },
            { teamName: 'RC Lens', titles: 1, lastWonYear: 1998 },
            { teamName: 'Montpellier', titles: 1, lastWonYear: 2012 },
            { teamName: 'Auxerre', titles: 1, lastWonYear: 1996 }
        ],
        recentEditions: [
            { season: '2023/24', winnerName: 'Paris Saint-Germain', runnerUp: 'AS Monaco' },
            { season: '2022/23', winnerName: 'Paris Saint-Germain', runnerUp: 'RC Lens' },
            { season: '2021/22', winnerName: 'Paris Saint-Germain', runnerUp: 'Olympique de Marseille' },
            { season: '2020/21', winnerName: 'LOSC Lille', runnerUp: 'Paris Saint-Germain' },
            { season: '2019/20', winnerName: 'Paris Saint-Germain', runnerUp: 'Olympique de Marseille' }
        ]
    },

    // =========================================================================
    // 🇦🇷 ARGENTINA
    // =========================================================================
    'LIGA_ARGENTINA': {
        id: 'LIGA_ARGENTINA',
        name: 'Liga Profesional de Fútbol',
        allTimeRanking: [
            { teamName: 'River Plate', titles: 38, lastWonYear: 2023 },
            { teamName: 'Boca Juniors', titles: 35, lastWonYear: 2022 },
            { teamName: 'Racing Club', titles: 18, lastWonYear: 2019 },
            { teamName: 'Independiente', titles: 16, lastWonYear: 2002 },
            { teamName: 'San Lorenzo', titles: 15, lastWonYear: 2013 },
            { teamName: 'Vélez Sarsfield', titles: 10, lastWonYear: 2013 },
            { teamName: 'Estudiantes LP', titles: 6, lastWonYear: 2010 },
            { teamName: 'Newell’s Old Boys', titles: 6, lastWonYear: 2013 },
            { teamName: 'Rosario Central', titles: 4, lastWonYear: 1987 },
            { teamName: 'Huracán', titles: 5, lastWonYear: 1973 },
            { teamName: 'Argentinos Juniors', titles: 3, lastWonYear: 2010 },
            { teamName: 'Lanús', titles: 2, lastWonYear: 2016 },
            { teamName: 'Ferro Carril Oeste', titles: 2, lastWonYear: 1984 },
            { teamName: 'Quilmes', titles: 2, lastWonYear: 1978 },
            { teamName: 'Banfield', titles: 1, lastWonYear: 2009 },
            { teamName: 'Gimnasia LP', titles: 1, lastWonYear: 1929 },
            { teamName: 'Arsenal de Sarandí', titles: 1, lastWonYear: 2012 }
        ],
        recentEditions: [
            { season: '2024', winnerName: 'Vélez Sarsfield', runnerUp: 'Huracán' },
            { season: '2023', winnerName: 'River Plate', runnerUp: 'Talleres' },
            { season: '2022', winnerName: 'Boca Juniors', runnerUp: 'Racing Club' },
            { season: '2021', winnerName: 'River Plate', runnerUp: 'Defensa y Justicia' },
            { season: '2019/20', winnerName: 'Boca Juniors', runnerUp: 'River Plate' },
            { season: '2018/19', winnerName: 'Racing Club', runnerUp: 'Defensa y Justicia' }
        ]
    },

    'COPA_ARGENTINA': {
        id: 'COPA_ARGENTINA',
        name: 'Copa Argentina AXION energy',
        allTimeRanking: [
            { teamName: 'Boca Juniors', titles: 4, lastWonYear: 2021 },
            { teamName: 'River Plate', titles: 3, lastWonYear: 2019 },
            { teamName: 'Rosario Central', titles: 1, lastWonYear: 2018 },
            { teamName: 'Estudiantes LP', titles: 1, lastWonYear: 2023 },
            { teamName: 'Patronato', titles: 1, lastWonYear: 2022 },
            { teamName: 'Huracán', titles: 1, lastWonYear: 2014 },
            { teamName: 'Arsenal de Sarandí', titles: 1, lastWonYear: 2013 },
            { teamName: 'Central Córdoba', titles: 1, lastWonYear: 2024 }
        ],
        recentEditions: [
            { season: '2024', winnerName: 'Central Córdoba', runnerUp: 'Vélez Sarsfield', score: '1-0' },
            { season: '2023', winnerName: 'Estudiantes LP', runnerUp: 'Defensa y Justicia', score: '1-0' },
            { season: '2022', winnerName: 'Patronato', runnerUp: 'Talleres', score: '1-0' },
            { season: '2020/21', winnerName: 'Boca Juniors', runnerUp: 'Talleres', score: '0-0 (5-4 pen.)' },
            { season: '2018/19', winnerName: 'River Plate', runnerUp: 'Central Córdoba', score: '3-0' },
            { season: '2017/18', winnerName: 'Rosario Central', runnerUp: 'Gimnasia LP', score: '1-1 (4-1 pen.)' }
        ]
    },

    // =========================================================================
    // 🇧🇷 BRASIL
    // =========================================================================
    'BRASILEIRAO': {
        id: 'BRASILEIRAO',
        name: 'Campeonato Brasileiro Série A (Brasileirão)',
        allTimeRanking: [
            { teamName: 'Palmeiras', titles: 12, lastWonYear: 2023 },
            { teamName: 'Santos', titles: 8, lastWonYear: 2004 },
            { teamName: 'Flamengo', titles: 8, lastWonYear: 2020 },
            { teamName: 'Corinthians', titles: 7, lastWonYear: 2017 },
            { teamName: 'São Paulo FC', titles: 6, lastWonYear: 2008 },
            { teamName: 'Cruzeiro', titles: 4, lastWonYear: 2014 },
            { teamName: 'Vasco da Gama', titles: 4, lastWonYear: 2000 },
            { teamName: 'Fluminense', titles: 4, lastWonYear: 2012 },
            { teamName: 'Internacional', titles: 3, lastWonYear: 1979 },
            { teamName: 'Atlético Mineiro', titles: 3, lastWonYear: 2021 },
            { teamName: 'Botafogo', titles: 3, lastWonYear: 2024 },
            { teamName: 'Grêmio', titles: 2, lastWonYear: 1996 },
            { teamName: 'Bahia', titles: 2, lastWonYear: 1988 },
            { teamName: 'Athletico Paranaense', titles: 1, lastWonYear: 2001 },
            { teamName: 'Coritiba', titles: 1, lastWonYear: 1985 },
            { teamName: 'Sport Recife', titles: 1, lastWonYear: 1987 }
        ],
        recentEditions: [
            { season: '2024', winnerName: 'Botafogo', runnerUp: 'Palmeiras' },
            { season: '2023', winnerName: 'Palmeiras', runnerUp: 'Grêmio' },
            { season: '2022', winnerName: 'Palmeiras', runnerUp: 'Internacional' },
            { season: '2021', winnerName: 'Atlético Mineiro', runnerUp: 'Flamengo' },
            { season: '2020', winnerName: 'Flamengo', runnerUp: 'Internacional' },
            { season: '2019', winnerName: 'Flamengo', runnerUp: 'Santos' }
        ]
    },

    // =========================================================================
    // 🇲🇽 MÉXICO
    // =========================================================================
    'LIGA_MX': {
        id: 'LIGA_MX',
        name: 'Liga BBVA MX',
        allTimeRanking: [
            { teamName: 'América', titles: 15, lastWonYear: 2024 },
            { teamName: 'Guadalajara', titles: 12, lastWonYear: 2017 },
            { teamName: 'Toluca', titles: 10, lastWonYear: 2010 },
            { teamName: 'Cruz Azul', titles: 9, lastWonYear: 2021 },
            { teamName: 'Club León', titles: 8, lastWonYear: 2020 },
            { teamName: 'Tigres UANL', titles: 8, lastWonYear: 2023 },
            { teamName: 'Pumas UNAM', titles: 7, lastWonYear: 2011 },
            { teamName: 'Pachuca', titles: 7, lastWonYear: 2022 },
            { teamName: 'Santos Laguna', titles: 6, lastWonYear: 2018 },
            { teamName: 'Monterrey', titles: 5, lastWonYear: 2019 },
            { teamName: 'Atlas', titles: 3, lastWonYear: 2022 },
            { teamName: 'Necaxa', titles: 3, lastWonYear: 1998 },
            { teamName: 'Puebla', titles: 2, lastWonYear: 1990 }
        ],
        recentEditions: [
            { season: 'Clausura 2024', winnerName: 'América', runnerUp: 'Cruz Azul' },
            { season: 'Apertura 2023', winnerName: 'América', runnerUp: 'Tigres UANL' },
            { season: 'Clausura 2023', winnerName: 'Tigres UANL', runnerUp: 'Guadalajara' },
            { season: 'Apertura 2022', winnerName: 'Pachuca', runnerUp: 'Toluca' },
            { season: 'Clausura 2022', winnerName: 'Atlas', runnerUp: 'Pachuca' }
        ]
    }
};

/**
 * Historical honours per Club (for club profile and trophy cabinet)
 */
export const CLUB_HISTORICAL_HONOURS: Record<string, ClubHonours> = {
    // Manchester City
    'manchester city': {
        clubName: 'Manchester City',
        leagueTitles: 10,
        domesticCups: 17, // 7 FA Cups, 8 EFL Cups, 6 Community Shields
        continentalCups: 2, // 1 Champions League, 1 Recopa UEFA
        intercontinental: 1, // 1 FIFA Club World Cup
        totalOfficialTitles: 35,
        highlights: ['1x UEFA Champions League (2023)', '10x Premier League', '7x FA Cup', '8x League Cup', '1x Mundial de Clubes (2023)']
    },
    // Manchester United
    'manchester united': {
        clubName: 'Manchester United',
        leagueTitles: 20,
        domesticCups: 21, // 13 FA Cups, 6 EFL Cups
        continentalCups: 6, // 3 Champions League, 1 Europa League, 1 Recopa UEFA, 1 Supercopa
        intercontinental: 2, // 1 Intercontinental, 1 Mundial de Clubes
        totalOfficialTitles: 67,
        highlights: ['3x UEFA Champions League (1968, 1999, 2008)', '20x Premier League', '13x FA Cup', '2x Campeón del Mundo / Intercontinental']
    },
    // Real Madrid
    'real madrid': {
        clubName: 'Real Madrid',
        leagueTitles: 36,
        domesticCups: 33, // 20 Copa del Rey, 13 Supercopas
        continentalCups: 21, // 15 Champions, 2 Europa League, 6 Supercopas Europa
        intercontinental: 8, // 3 Intercontinentales, 5 Mundiales de Clubes
        totalOfficialTitles: 102,
        highlights: ['15x UEFA Champions League (Récord histórico)', '36x La Liga', '20x Copa del Rey', '8x Campeón del Mundo / Mundial de Clubes']
    },
    // FC Barcelona
    'fc barcelona': {
        clubName: 'FC Barcelona',
        leagueTitles: 27,
        domesticCups: 49, // 31 Copa del Rey, 14 Supercopas
        continentalCups: 14, // 5 Champions, 4 Recopas, 5 Supercopas
        intercontinental: 3, // 3 Mundiales de Clubes
        totalOfficialTitles: 99,
        highlights: ['5x UEFA Champions League (1992, 2006, 2009, 2011, 2015)', '27x La Liga', '31x Copa del Rey', '3x Mundial de Clubes']
    },
    // Liverpool
    'liverpool': {
        clubName: 'Liverpool',
        leagueTitles: 19,
        domesticCups: 18, // 8 FA Cups, 10 EFL Cups
        continentalCups: 13, // 6 Champions, 3 Europa League, 4 Supercopas
        intercontinental: 1,
        totalOfficialTitles: 68,
        highlights: ['6x UEFA Champions League', '19x Premier League', '8x FA Cup', '10x Carabao Cup', '1x Mundial de Clubes']
    },
    // Arsenal
    'arsenal': {
        clubName: 'Arsenal',
        leagueTitles: 13,
        domesticCups: 31, // 14 FA Cups, 2 EFL Cups, 17 Community Shields
        continentalCups: 2, // 1 Recopa Europa, 1 Copa Ferias
        intercontinental: 0,
        totalOfficialTitles: 49,
        highlights: ['13x Premier League', '14x FA Cup (Récord en Inglaterra)', 'The Invincibles 2003/04', '2x League Cup']
    },
    // Chelsea
    'chelsea': {
        clubName: 'Chelsea',
        leagueTitles: 6,
        domesticCups: 15, // 8 FA Cups, 5 EFL Cups
        continentalCups: 8, // 2 Champions, 2 Europa League, 2 Supercopas, 2 Recopas
        intercontinental: 1,
        totalOfficialTitles: 34,
        highlights: ['2x UEFA Champions League (2012, 2021)', '6x Premier League', '8x FA Cup', '2x UEFA Europa League', '1x Mundial de Clubes']
    },
    // Bayern München
    'bayern münchen': {
        clubName: 'Bayern München',
        leagueTitles: 33,
        domesticCups: 30, // 20 DFB-Pokal, 10 Supercopas
        continentalCups: 9, // 6 Champions, 1 UEFA Cup, 2 Supercopas
        intercontinental: 4, // 2 Intercontinental, 2 Mundiales de Clubes
        totalOfficialTitles: 83,
        highlights: ['6x UEFA Champions League', '33x Bundesliga (Récord alemán)', '20x DFB-Pokal', '4x Campeón del Mundo']
    },
    // Inter Milano
    'inter milano': {
        clubName: 'Inter Milano',
        leagueTitles: 20,
        domesticCups: 17, // 9 Coppa Italia, 8 Supercoppa
        continentalCups: 6, // 3 Champions, 3 Copa UEFA
        intercontinental: 3, // 2 Intercontinentales, 1 Mundial de Clubes
        totalOfficialTitles: 46,
        highlights: ['3x UEFA Champions League (1964, 1965, 2010)', '20x Scudetti Serie A (Segunda Estrella)', '9x Coppa Italia', '3x Campeón del Mundo']
    },
    // AC Milan
    'ac milan': {
        clubName: 'AC Milan',
        leagueTitles: 19,
        domesticCups: 12, // 5 Coppa Italia, 7 Supercoppa
        continentalCups: 14, // 7 Champions, 2 Recopas, 5 Supercopas
        intercontinental: 4, // 3 Intercontinental, 1 Mundial de Clubes
        totalOfficialTitles: 49,
        highlights: ['7x UEFA Champions League', '19x Scudetti Serie A', '5x Coppa Italia', '4x Campeón del Mundo']
    },
    // Juventus
    'juventus': {
        clubName: 'Juventus',
        leagueTitles: 36,
        domesticCups: 24, // 15 Coppa Italia, 9 Supercoppa
        continentalCups: 8, // 2 Champions, 3 UEFA Cup, 1 Recopa, 2 Supercopas
        intercontinental: 2,
        totalOfficialTitles: 70,
        highlights: ['36x Scudetti Serie A (Récord en Italia)', '2x UEFA Champions League (1985, 1996)', '15x Coppa Italia', '2x Intercontinental']
    },
    // Paris Saint-Germain
    'paris saint-germain': {
        clubName: 'Paris Saint-Germain',
        leagueTitles: 12,
        domesticCups: 34, // 15 Coupe de France, 9 Coupe de la Ligue, 12 Trophée des Champions
        continentalCups: 1, // 1 Recopa Europa
        intercontinental: 0,
        totalOfficialTitles: 50,
        highlights: ['12x Ligue 1 (Récord francés)', '15x Coupe de France', '9x Coupe de la Ligue', '1x Recopa de Europa (1996)']
    },
    // Boca Juniors
    'boca juniors': {
        clubName: 'Boca Juniors',
        leagueTitles: 35,
        domesticCups: 17, // 4 Copa Argentina, etc.
        continentalCups: 18, // 6 Libertadores, 2 Sudamericanas, 4 Recopas, 1 Supercopa, etc.
        intercontinental: 3, // 3 Copas Intercontinentales (1977, 2000, 2003)
        totalOfficialTitles: 74,
        highlights: ['6x Copa Libertadores', '3x Copa Intercontinental (1977, 2000, 2003)', '35x Liga Argentina', '2x Copa Sudamericana']
    },
    // River Plate
    'river plate': {
        clubName: 'River Plate',
        leagueTitles: 38,
        domesticCups: 16, // Copas nacionales
        continentalCups: 12, // 4 Libertadores, 1 Sudamericana, 3 Recopas, 1 Interamericana, etc.
        intercontinental: 1, // 1 Copa Intercontinental (1986)
        totalOfficialTitles: 72,
        highlights: ['38x Liga Argentina (Récord argentino)', '4x Copa Libertadores (1986, 1996, 2015, 2018)', '1x Copa Intercontinental (1986)', '3x Copa Argentina']
    },
    // Independiente
    'independiente': {
        clubName: 'Independiente',
        leagueTitles: 16,
        domesticCups: 9,
        continentalCups: 18, // 7 Libertadores (Récord), 2 Sudamericanas, 2 Supercopas, 1 Recopa, etc.
        intercontinental: 2, // 2 Intercontinentales
        totalOfficialTitles: 45,
        highlights: ['7x Copa Libertadores (Rey de Copas - Récord continental)', '2x Copa Intercontinental', '16x Liga Argentina', '2x Copa Sudamericana']
    },
    // Racing Club
    'racing club': {
        clubName: 'Racing Club',
        leagueTitles: 18,
        domesticCups: 15,
        continentalCups: 4, // 1 Libertadores, 1 Sudamericana, 1 Supercopa
        intercontinental: 1, // 1 Copa Intercontinental (1967 - Primer campeón del mundo argentino)
        totalOfficialTitles: 39,
        highlights: ['Primer campeón del mundo argentino (1967)', '18x Liga Argentina', '1x Copa Libertadores (1967)', '1x Copa Sudamericana (2024)']
    },
    // Flamengo
    'flamengo': {
        clubName: 'Flamengo',
        leagueTitles: 8,
        domesticCups: 11, // 5 Copa do Brasil, etc.
        continentalCups: 4, // 3 Libertadores, 1 Recopa
        intercontinental: 1, // 1 Intercontinental (1981)
        totalOfficialTitles: 48,
        highlights: ['3x Copa Libertadores (1981, 2019, 2022)', '1x Copa Intercontinental (1981)', '8x Brasileirão', '5x Copa do Brasil']
    },
    // Palmeiras
    'palmeiras': {
        clubName: 'Palmeiras',
        leagueTitles: 12,
        domesticCups: 7, // 4 Copa do Brasil, etc.
        continentalCups: 4, // 3 Libertadores, 1 Recopa
        intercontinental: 1, // Copa Rio 1951
        totalOfficialTitles: 40,
        highlights: ['12x Brasileirão (Récord brasileño)', '3x Copa Libertadores (1999, 2020, 2021)', '4x Copa do Brasil', '1x Recopa Sudamericana']
    },
    // Peñarol
    'peñarol': {
        clubName: 'Peñarol',
        leagueTitles: 51,
        domesticCups: 3,
        continentalCups: 5, // 5 Libertadores
        intercontinental: 3, // 3 Intercontinentales
        totalOfficialTitles: 62,
        highlights: ['5x Copa Libertadores (1960, 1961, 1966, 1982, 1987)', '3x Copa Intercontinental', '51x Campeonato Uruguayo']
    },
    // Nacional
    'nacional': {
        clubName: 'Nacional',
        leagueTitles: 49,
        domesticCups: 8,
        continentalCups: 4, // 3 Libertadores, 1 Recopa
        intercontinental: 3, // 3 Intercontinentales
        totalOfficialTitles: 64,
        highlights: ['3x Copa Libertadores (1971, 1980, 1988)', '3x Copa Intercontinental', '49x Campeonato Uruguayo']
    }
};

/**
 * Returns historical record for a competition
 */
export function getCompetitionHistoricalRecord(competitionId: string): CompetitionHistoricalRecord | null {
    if (COMPETITION_HISTORICAL_CHAMPIONS[competitionId]) {
        return COMPETITION_HISTORICAL_CHAMPIONS[competitionId];
    }
    const upper = competitionId.toUpperCase();
    for (const [key, val] of Object.entries(COMPETITION_HISTORICAL_CHAMPIONS)) {
        if (key === upper || val.name.toLowerCase() === competitionId.toLowerCase()) {
            return val;
        }
    }
    return null;
}

/**
 * Returns authentic club honours
 */
export function getClubHistoricalHonours(teamNameOrId?: string | number): ClubHonours | null {
    if (!teamNameOrId) return null;
    const nameStr = String(teamNameOrId).toLowerCase().trim();
    if (CLUB_HISTORICAL_HONOURS[nameStr]) {
        return CLUB_HISTORICAL_HONOURS[nameStr];
    }
    for (const [key, val] of Object.entries(CLUB_HISTORICAL_HONOURS)) {
        if (nameStr.includes(key) || key.includes(nameStr)) {
            return val;
        }
    }
    return null;
}
