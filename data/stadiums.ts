/**
 * Authentic Stadiums Database and Capacity Mapping
 * Provides real-world stadium names, capacities, and host cities for clubs across all supported leagues.
 */

export interface TeamStadiumInfo {
    name: string;
    capacity: number;
    city: string;
}

export const STADIUMS_BY_TEAM_ID: Record<number, TeamStadiumInfo> = {
    // =========================================================================
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA - PREMIER LEAGUE (IDs 1-20)
    // =========================================================================
    1: { name: 'Emirates Stadium', capacity: 60704, city: 'Londres' },
    2: { name: 'Villa Park', capacity: 42682, city: 'Birmingham' },
    3: { name: 'Stamford Bridge', capacity: 40341, city: 'Londres' },
    4: { name: 'Anfield', capacity: 61276, city: 'Liverpool' },
    5: { name: 'Etihad Stadium', capacity: 53400, city: 'Mánchester' },
    6: { name: 'Old Trafford', capacity: 74310, city: 'Mánchester' },
    7: { name: "St. James' Park", capacity: 52305, city: 'Newcastle upon Tyne' },
    8: { name: 'Tottenham Hotspur Stadium', capacity: 62850, city: 'Londres' },
    9: { name: 'London Stadium', capacity: 62500, city: 'Londres' },
    10: { name: 'The American Express Stadium (Amex)', capacity: 31800, city: 'Brighton' },
    11: { name: 'Craven Cottage', capacity: 25700, city: 'Londres' },
    12: { name: 'Selhurst Park', capacity: 25486, city: 'Londres' },
    13: { name: 'Gtech Community Stadium', capacity: 17250, city: 'Londres' },
    14: { name: 'Goodison Park', capacity: 39572, city: 'Liverpool' },
    15: { name: 'The City Ground', capacity: 30445, city: 'Nottingham' },
    16: { name: 'Vitality Stadium (Dean Court)', capacity: 11379, city: 'Bournemouth' },
    17: { name: 'Molineux Stadium', capacity: 32050, city: 'Wolverhampton' },
    18: { name: 'Portman Road', capacity: 30014, city: 'Ipswich' },
    19: { name: 'King Power Stadium', capacity: 32261, city: 'Leicester' },
    20: { name: "St Mary's Stadium", capacity: 32384, city: 'Southampton' },

    // =========================================================================
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA - CHAMPIONSHIP (IDs 101-124)
    // =========================================================================
    101: { name: 'Elland Road', capacity: 37890, city: 'Leeds' },
    102: { name: 'Turf Moor', capacity: 21944, city: 'Burnley' },
    103: { name: 'Kenilworth Road', capacity: 12000, city: 'Luton' },
    104: { name: 'Bramall Lane', capacity: 32050, city: 'Sheffield' },
    105: { name: 'The Hawthorns', capacity: 26850, city: 'West Bromwich' },
    106: { name: 'Carrow Road', capacity: 27359, city: 'Norwich' },
    107: { name: 'MKM Stadium', capacity: 25586, city: 'Hull' },
    108: { name: 'Coventry Building Society Arena', capacity: 32609, city: 'Coventry' },
    109: { name: 'Riverside Stadium', capacity: 34742, city: 'Middlesbrough' },
    110: { name: 'Deepdale', capacity: 23408, city: 'Preston' },
    111: { name: 'Cardiff City Stadium', capacity: 33280, city: 'Cardiff' },
    112: { name: 'Ashton Gate', capacity: 27000, city: 'Bristol' },
    113: { name: 'Stadium of Light', capacity: 49000, city: 'Sunderland' },
    114: { name: 'Swansea.com Stadium', capacity: 21088, city: 'Swansea' },
    115: { name: 'Vicarage Road', capacity: 22200, city: 'Watford' },
    116: { name: 'The Den', capacity: 20146, city: 'Londres' },
    117: { name: 'Loftus Road', capacity: 18439, city: 'Londres' },
    118: { name: 'bet365 Stadium', capacity: 30089, city: 'Stoke-on-Trent' },
    119: { name: 'Ewood Park', capacity: 31367, city: 'Blackburn' },
    120: { name: 'Hillsborough Stadium', capacity: 39732, city: 'Sheffield' },
    121: { name: 'Home Park', capacity: 17900, city: 'Plymouth' },
    122: { name: 'Fratton Park', capacity: 20899, city: 'Portsmouth' },
    123: { name: 'Pride Park Stadium', capacity: 33597, city: 'Derby' },
    124: { name: 'The Kassam Stadium', capacity: 12500, city: 'Oxford' },

    // =========================================================================
    // 🇪🇸 ESPAÑA - LA LIGA (IDs 201-220)
    // =========================================================================
    201: { name: 'Estadio Santiago Bernabéu', capacity: 81044, city: 'Madrid' },
    202: { name: 'Spotify Camp Nou / Estadi Olímpic', capacity: 55926, city: 'Barcelona' },
    203: { name: 'Riyadh Air Metropolitano', capacity: 70460, city: 'Madrid' },
    204: { name: 'Estadio de San Mamés', capacity: 53289, city: 'Bilbao' },
    205: { name: 'Reale Arena (Anoeta)', capacity: 39313, city: 'San Sebastián' },
    206: { name: 'Estadio Benito Villamarín', capacity: 60721, city: 'Sevilla' },
    207: { name: 'Estadi Montilivi', capacity: 14624, city: 'Girona' },
    208: { name: 'Estadio de la Cerámica', capacity: 23500, city: 'Villarreal' },
    209: { name: 'Estadi de Mestalla', capacity: 49430, city: 'Valencia' },
    210: { name: 'Estadio Ramón Sánchez-Pizjuán', capacity: 43883, city: 'Sevilla' },
    211: { name: 'Estadio Abanca-Balaídos', capacity: 24791, city: 'Vigo' },
    212: { name: 'Estadio El Sadar', capacity: 23576, city: 'Pamplona' },
    213: { name: 'Coliseum', capacity: 16500, city: 'Getafe / Madrid' },
    214: { name: 'Estadio Mallorca Son Moix', capacity: 23142, city: 'Palma de Mallorca' },
    215: { name: 'Campo de Fútbol de Vallecas', capacity: 14708, city: 'Madrid' },
    216: { name: 'Estadio de Gran Canaria', capacity: 32400, city: 'Las Palmas' },
    217: { name: 'Estadio de Mendizorroza', capacity: 19840, city: 'Vitoria-Gasteiz' },
    218: { name: 'Estadio Municipal de Butarque', capacity: 12450, city: 'Leganés / Madrid' },
    219: { name: 'Estadio José Zorrilla', capacity: 27618, city: 'Valladolid' },
    220: { name: 'Stage Front Stadium (RCDE Stadium)', capacity: 40000, city: 'Barcelona' },

    // =========================================================================
    // 🇩🇪 ALEMANIA - BUNDESLIGA (IDs 401-418)
    // =========================================================================
    401: { name: 'Allianz Arena', capacity: 75024, city: 'Múnich' },
    402: { name: 'Signal Iduna Park (Westfalenstadion)', capacity: 81365, city: 'Dortmund' },
    403: { name: 'BayArena', capacity: 30210, city: 'Leverkusen' },
    404: { name: 'Red Bull Arena', capacity: 47069, city: 'Leipzig' },
    405: { name: 'Deutsche Bank Park (Waldstadion)', capacity: 58000, city: 'Fráncfort' },
    406: { name: 'MHPArena', capacity: 60449, city: 'Stuttgart' },
    407: { name: 'Volkswagen Arena', capacity: 30000, city: 'Wolfsburgo' },
    408: { name: 'Europa-Park Stadion', capacity: 34700, city: 'Friburgo' },
    409: { name: 'PreZero Arena', capacity: 30150, city: 'Sinsheim' },
    410: { name: 'Borussia-Park', capacity: 54056, city: 'Mönchengladbach' },
    411: { name: 'Weserstadion', capacity: 42100, city: 'Bremen' },
    412: { name: 'WWK Arena', capacity: 30660, city: 'Augsburgo' },
    413: { name: 'Voith-Arena', capacity: 15000, city: 'Heidenheim' },
    414: { name: 'MEWA Arena', capacity: 33305, city: 'Maguncia' },
    415: { name: 'Stadion An der Alten Försterei', capacity: 22012, city: 'Berlín' },
    416: { name: 'Vonovia Ruhrstadion', capacity: 26000, city: 'Bochum' },
    417: { name: 'Millerntor-Stadion', capacity: 29546, city: 'Hamburgo' },
    418: { name: 'Holstein-Stadion', capacity: 15034, city: 'Kiel' },

    // =========================================================================
    // 🇮🇹 ITALIA - SERIE A (IDs 501-520)
    // =========================================================================
    501: { name: 'Stadio San Siro (Giuseppe Meazza)', capacity: 75817, city: 'Milán' },
    502: { name: 'Stadio San Siro (Giuseppe Meazza)', capacity: 75817, city: 'Milán' },
    503: { name: 'Allianz Stadium', capacity: 41507, city: 'Turín' },
    504: { name: 'Stadio Olimpico di Roma', capacity: 70634, city: 'Roma' },
    505: { name: 'Stadio Diego Armando Maradona', capacity: 54726, city: 'Nápoles' },
    506: { name: 'Gewiss Stadium', capacity: 24950, city: 'Bérgamo' },
    507: { name: 'Stadio Olimpico di Roma', capacity: 70634, city: 'Roma' },
    508: { name: 'Stadio Artemio Franchi', capacity: 43147, city: 'Florencia' },
    509: { name: 'Stadio Olimpico Grande Torino', capacity: 27958, city: 'Turín' },
    510: { name: 'Stadio Renato Dall’Ara', capacity: 36462, city: 'Bolonia' },
    511: { name: 'Stadio Luigi Ferraris', capacity: 33205, city: 'Génova' },
    512: { name: 'U-Power Stadium (Brianteo)', capacity: 17102, city: 'Monza' },
    513: { name: 'Stadio Via del Mare', capacity: 31533, city: 'Lecce' },
    514: { name: 'Bluenergy Stadium (Stadio Friuli)', capacity: 25144, city: 'Udine' },
    515: { name: 'Stadio Marcantonio Bentegodi', capacity: 31045, city: 'Verona' },
    516: { name: 'Stadio Carlo Castellani', capacity: 16284, city: 'Empoli' },
    517: { name: 'Unipol Domus', capacity: 16416, city: 'Cagliari' },
    518: { name: 'Stadio Giuseppe Sinigaglia', capacity: 10584, city: 'Como' },
    519: { name: 'Stadio Ennio Tardini', capacity: 22352, city: 'Parma' },
    520: { name: 'Stadio Pier Luigi Penzo', capacity: 11150, city: 'Venecia' },

    // =========================================================================
    // 🇫🇷 FRANCIA - LIGUE 1 (IDs 601-618)
    // =========================================================================
    601: { name: 'Parc des Princes', capacity: 47929, city: 'París' },
    602: { name: 'Orange Vélodrome', capacity: 67394, city: 'Marsella' },
    603: { name: 'Stade Louis II', capacity: 18523, city: 'Mónaco' },
    604: { name: 'Roazhon Park', capacity: 29778, city: 'Rennes' },
    605: { name: 'Decathlon Arena - Stade Pierre-Mauroy', capacity: 50186, city: 'Lille' },
    606: { name: 'Stade Bollaert-Delelis', capacity: 38223, city: 'Lens' },
    607: { name: 'Groupama Stadium (Parc OL)', capacity: 59186, city: 'Décines-Charpieu / Lyon' },
    608: { name: 'Allianz Riviera', capacity: 36178, city: 'Niza' },
    609: { name: 'Stade Auguste-Delaune', capacity: 21029, city: 'Reims' },
    610: { name: 'Stadium de Toulouse', capacity: 33150, city: 'Toulouse' },
    611: { name: 'Stade de la Mosson', capacity: 22000, city: 'Montpellier' },
    612: { name: 'Stade de la Meinau', capacity: 26109, city: 'Estrasburgo' },
    613: { name: 'Stade de la Beaujoire', capacity: 35322, city: 'Nantes' },
    614: { name: 'Stade Océane', capacity: 25178, city: 'Le Havre' },
    615: { name: 'Stade Francis-Le Blé', capacity: 15220, city: 'Brest' },
    616: { name: 'Stade de l’Abbé-Deschamps', capacity: 18541, city: 'Auxerre' },
    617: { name: 'Stade Raymond-Kopa', capacity: 19800, city: 'Angers' },
    618: { name: 'Stade Geoffroy-Guichard', capacity: 41965, city: 'Saint-Étienne' },

    // =========================================================================
    // 🇦🇷 ARGENTINA - PRIMERA DIVISIÓN & PRIMERA NACIONAL (IDs 701-733)
    // =========================================================================
    701: { name: 'Estadio Alberto J. Armando (La Bombonera)', capacity: 54000, city: 'Buenos Aires' },
    702: { name: 'Estadio Mâs Monumental', capacity: 84567, city: 'Buenos Aires' },
    703: { name: 'Estadio Presidente Perón (El Cilindro)', capacity: 51389, city: 'Avellaneda' },
    704: { name: 'Estadio Libertadores de América - Bochini', capacity: 48069, city: 'Avellaneda' },
    705: { name: 'Estadio Pedro Bidegain (Nuevo Gasómetro)', capacity: 47964, city: 'Buenos Aires' },
    706: { name: 'Estadio Jorge Luis Hirschi (UNO)', capacity: 32530, city: 'La Plata' },
    707: { name: 'Estadio José Amalfitani', capacity: 49540, city: 'Buenos Aires' },
    708: { name: 'Estadio Tomás Adolfo Ducó (El Palacio)', capacity: 48314, city: 'Buenos Aires' },
    709: { name: 'Estadio Gigante de Arroyito', capacity: 41465, city: 'Rosario' },
    710: { name: 'Estadio Marcelo Bielsa (Coloso del Parque)', capacity: 42000, city: 'Rosario' },
    711: { name: 'Estadio Mario Alberto Kempes', capacity: 57000, city: 'Córdoba' },
    712: { name: 'Estadio Monumental José Fierro', capacity: 35200, city: 'San Miguel de Tucumán' },
    713: { name: 'Estadio Julio César Villagra (Gigante de Alberdi)', capacity: 35000, city: 'Córdoba' },
    714: { name: 'Estadio Norberto Tomaghello', capacity: 20000, city: 'Florencio Varela' },
    715: { name: 'Estadio Ciudad de Lanús (La Fortaleza)', capacity: 47027, city: 'Lanús' },
    716: { name: 'Estadio Diego Armando Maradona', capacity: 26000, city: 'Buenos Aires' },
    717: { name: 'Estadio Florencio Sola (El Lencho)', capacity: 34901, city: 'Banfield' },
    718: { name: 'Estadio Juan Carmelo Zerillo (El Bosque)', capacity: 21500, city: 'La Plata' },
    719: { name: 'Estadio 15 de Abril', capacity: 27000, city: 'Santa Fe' },
    720: { name: 'Estadio Juan Domingo Perón (Alta Córdoba)', capacity: 30000, city: 'Córdoba' },
    721: { name: 'Estadio Claudio Fabián Tapia', capacity: 10000, city: 'Buenos Aires' },
    722: { name: 'Estadio Único Madre de Ciudades', capacity: 30000, city: 'Santiago del Estero' },
    723: { name: 'Estadio Eva Perón', capacity: 22000, city: 'Junín' },
    724: { name: 'Estadio Feliciano Gambarte / Malvinas Argentinas', capacity: 42500, city: 'Mendoza' },
    725: { name: 'Estadio Ciudad de Vicente López', capacity: 34530, city: 'Florida' },
    726: { name: 'Estadio José Dellagiovanna (Coliseo de Victoria)', capacity: 26282, city: 'Victoria' },
    727: { name: 'Estadio Guillermo Laza', capacity: 3000, city: 'Buenos Aires' },
    728: { name: 'Estadio Bautista Gargantini', capacity: 24000, city: 'Mendoza' },
    729: { name: 'Estadio Hilario Sánchez', capacity: 19000, city: 'San Juan' },
    730: { name: 'Estadio La Ciudadela', capacity: 28000, city: 'San Miguel de Tucumán' },
    731: { name: 'Estadio José María Minella', capacity: 35180, city: 'Mar del Plata' },
    732: { name: 'Estadio Centenario Ciudad de Quilmes', capacity: 30200, city: 'Quilmes' },
    733: { name: 'Estadio Arquitecto Ricardo Etcheverri', capacity: 24442, city: 'Buenos Aires' },

    // =========================================================================
    // 🇧🇷 BRASIL - BRASILEIRÃO (IDs 801-820)
    // =========================================================================
    801: { name: 'Estádio do Maracanã', capacity: 78838, city: 'Río de Janeiro' },
    802: { name: 'Allianz Parque', capacity: 43713, city: 'São Paulo' },
    803: { name: 'MorumBIS', capacity: 66795, city: 'São Paulo' },
    804: { name: 'Neo Química Arena', capacity: 49205, city: 'São Paulo' },
    805: { name: 'Estádio Urbano Caldeira (Vila Belmiro)', capacity: 16068, city: 'Santos' },
    806: { name: 'Arena do Grêmio', capacity: 55662, city: 'Porto Alegre' },
    807: { name: 'Estádio Beira-Rio', capacity: 50842, city: 'Porto Alegre' },
    808: { name: 'Arena MRV', capacity: 46000, city: 'Belo Horizonte' },
    809: { name: 'Estádio do Maracanã', capacity: 78838, city: 'Río de Janeiro' },
    810: { name: 'Estádio Nilton Santos (Engenhão)', capacity: 44661, city: 'Río de Janeiro' },
    811: { name: 'Estádio São Januário', capacity: 21880, city: 'Río de Janeiro' },
    812: { name: 'Estádio Mineirão', capacity: 61846, city: 'Belo Horizonte' },
    813: { name: 'Ligga Arena (Arena da Baixada)', capacity: 42372, city: 'Curitiba' },
    814: { name: 'Arena Castelão', capacity: 63903, city: 'Fortaleza' },
    815: { name: 'Arena Fonte Nova', capacity: 48000, city: 'Salvador' },
    816: { name: 'Estádio Nabi Abi Chedid', capacity: 17022, city: 'Bragança Paulista' },
    817: { name: 'Estádio Barradão', capacity: 35000, city: 'Salvador' },
    818: { name: 'Estádio Alfredo Jaconi', capacity: 19924, city: 'Caxias do Sul' },
    819: { name: 'Estádio Heriberto Hülse', capacity: 19225, city: 'Criciúma' },
    820: { name: 'Arena Pantanal', capacity: 44000, city: 'Cuiabá' },

    // =========================================================================
    // 🇵🇾 PARAGUAY - COPA DE PRIMERA (IDs 981-994)
    // =========================================================================
    981: { name: 'Estadio Osvaldo Domínguez Dibb (Manuel Ferreira)', capacity: 22000, city: 'Asunción' },
    982: { name: 'Estadio General Pablo Rojas (La Nueva Olla)', capacity: 45000, city: 'Asunción' },
    983: { name: 'Estadio Tigo La Huerta', capacity: 10100, city: 'Asunción' },
    984: { name: 'Estadio Rogelio Silvino Livieres', capacity: 8000, city: 'Asunción' },
    985: { name: 'Estadio Arsenio Erico', capacity: 7500, city: 'Asunción' },
    986: { name: 'Estadio Feliciano Cáceres', capacity: 27000, city: 'Luque' },
    987: { name: 'Estadio Toribio Vargas / Jardines del Kelito', capacity: 5000, city: 'Asunción' },
    988: { name: 'Estadio José Tomás Silva', capacity: 4000, city: 'Asunción' },
    989: { name: 'Estadio Monumental Río Parapití', capacity: 25000, city: 'Pedro Juan Caballero' },
    990: { name: 'Estadio Ka’arendy', capacity: 10120, city: 'Doctor Juan León Mallorquín' },

    // =========================================================================
    // 🇲🇽 MÉXICO - LIGA MX & EXPANSIÓN MX (IDs 1101-1134)
    // =========================================================================
    1101: { name: 'Estadio Azteca / Cd. de los Deportes', capacity: 83264, city: 'Ciudad de México' },
    1102: { name: 'Estadio Akron', capacity: 46355, city: 'Zapopan / Guadalajara' },
    1103: { name: 'Estadio Ciudad de los Deportes', capacity: 36682, city: 'Ciudad de México' },
    1104: { name: 'Estadio Universitario (El Volcán)', capacity: 41615, city: 'San Nicolás de los Garza' },
    1105: { name: 'Estadio BBVA (El Gigante de Acero)', capacity: 53500, city: 'Guadalupe / Monterrey' },
    1106: { name: 'Estadio Nemesio Díez (La Bombonera)', capacity: 30000, city: 'Toluca' },
    1107: { name: 'Estadio Hidalgo (El Huracán)', capacity: 27512, city: 'Pachuca' },
    1108: { name: 'Estadio Olímpico Universitario', capacity: 72000, city: 'Ciudad de México' },
    1109: { name: 'Estadio Nou Camp (León)', capacity: 31297, city: 'León' },
    1110: { name: 'Estadio Corona (TSM)', capacity: 30000, city: 'Torreón' },
    1111: { name: 'Estadio Jalisco', capacity: 55110, city: 'Guadalajara' },
    1112: { name: 'Estadio Cuauhtémoc', capacity: 51726, city: 'Puebla' },
    1113: { name: 'Estadio Victoria', capacity: 23851, city: 'Aguascalientes' },
    1114: { name: 'Estadio Alfonso Lastras Ramírez', capacity: 25709, city: 'San Luis Potosí' },
    1115: { name: 'Estadio Corregidora', capacity: 34107, city: 'Querétaro' },
    1116: { name: 'Estadio Caliente', capacity: 27333, city: 'Tijuana' },
    1117: { name: 'Estadio Olímpico Benito Juárez', capacity: 19703, city: 'Ciudad Juárez' },
    1118: { name: 'Estadio El Encanto (El Kraken)', capacity: 25000, city: 'Mazatlán' },
    // Expansión MX
    1121: { name: 'Estadio Jalisco', capacity: 55110, city: 'Guadalajara' },
    1122: { name: 'Estadio Andrés Quintana Roo', capacity: 18844, city: 'Cancún' },
    1123: { name: 'Estadio Morelos', capacity: 35000, city: 'Morelia' },
    1124: { name: 'Estadio Carlos Vega Villalba', capacity: 20068, city: 'Zacatecas' },
    1125: { name: 'Estadio Dorados (Banorte)', capacity: 20108, city: 'Culiacán' },
    1126: { name: 'Estadio Carlos Iturralde Rivero', capacity: 15087, city: 'Mérida' },
    1127: { name: 'Estadio Tecnológico de Oaxaca', capacity: 14598, city: 'Oaxaca' },
    1128: { name: 'Estadio Marte R. Gómez', capacity: 10520, city: 'Ciudad Victoria' },
    1129: { name: 'Estadio Sergio León Chávez', capacity: 25000, city: 'Irapuato' },
    1130: { name: 'Estadio Tamaulipas', capacity: 19667, city: 'Tampico' },
    1131: { name: 'Estadio Guaycura', capacity: 5209, city: 'La Paz' },
    1132: { name: 'Estadio Akron', capacity: 46355, city: 'Zapopan' },
    1133: { name: 'Estadio Gregorio "Tepa" Gómez', capacity: 8085, city: 'Tepatitlán' },
    1134: { name: 'Estadio Tlahuicole', capacity: 12000, city: 'Tlaxcala' },

    // =========================================================================
    // 🌎 SUDAMÉRICA - GIGANTES CONTINENTALES (IDs 9101-9122)
    // =========================================================================
    9101: { name: 'Estadio Monumental David Arellano', capacity: 47347, city: 'Santiago' },
    9113: { name: 'Estadio Rodrigo Paz Delgado (Casa Blanca)', capacity: 41575, city: 'Quito' },
    9121: { name: 'Estadio Campeón del Siglo', capacity: 40000, city: 'Montevideo' },
    9122: { name: 'Estadio Gran Parque Central', capacity: 34000, city: 'Montevideo' },
};

/**
 * Fallback mapping by normalized club name for absolute accuracy.
 */
export const STADIUMS_BY_NAME: Record<string, TeamStadiumInfo> = {
    // Premier League
    'manchester city': { name: 'Etihad Stadium', capacity: 53400, city: 'Mánchester' },
    'manchester city fc': { name: 'Etihad Stadium', capacity: 53400, city: 'Mánchester' },
    'manchester united': { name: 'Old Trafford', capacity: 74310, city: 'Mánchester' },
    'manchester utd': { name: 'Old Trafford', capacity: 74310, city: 'Mánchester' },
    'arsenal': { name: 'Emirates Stadium', capacity: 60704, city: 'Londres' },
    'arsenal fc': { name: 'Emirates Stadium', capacity: 60704, city: 'Londres' },
    'chelsea': { name: 'Stamford Bridge', capacity: 40341, city: 'Londres' },
    'chelsea fc': { name: 'Stamford Bridge', capacity: 40341, city: 'Londres' },
    'liverpool': { name: 'Anfield', capacity: 61276, city: 'Liverpool' },
    'liverpool fc': { name: 'Anfield', capacity: 61276, city: 'Liverpool' },
    'tottenham': { name: 'Tottenham Hotspur Stadium', capacity: 62850, city: 'Londres' },
    'tottenham hotspur': { name: 'Tottenham Hotspur Stadium', capacity: 62850, city: 'Londres' },
    'aston villa': { name: 'Villa Park', capacity: 42682, city: 'Birmingham' },
    'newcastle utd': { name: "St. James' Park", capacity: 52305, city: 'Newcastle upon Tyne' },
    'newcastle united': { name: "St. James' Park", capacity: 52305, city: 'Newcastle upon Tyne' },
    'west ham': { name: 'London Stadium', capacity: 62500, city: 'Londres' },
    'brighton': { name: 'The American Express Stadium (Amex)', capacity: 31800, city: 'Brighton' },
    'fulham': { name: 'Craven Cottage', capacity: 25700, city: 'Londres' },
    'crystal palace': { name: 'Selhurst Park', capacity: 25486, city: 'Londres' },
    'brentford': { name: 'Gtech Community Stadium', capacity: 17250, city: 'Londres' },
    'everton': { name: 'Goodison Park', capacity: 39572, city: 'Liverpool' },
    'nottm forest': { name: 'The City Ground', capacity: 30445, city: 'Nottingham' },
    'nottingham forest': { name: 'The City Ground', capacity: 30445, city: 'Nottingham' },
    'bournemouth': { name: 'Vitality Stadium (Dean Court)', capacity: 11379, city: 'Bournemouth' },
    'afc bournemouth': { name: 'Vitality Stadium (Dean Court)', capacity: 11379, city: 'Bournemouth' },
    'wolves': { name: 'Molineux Stadium', capacity: 32050, city: 'Wolverhampton' },
    'wolverhampton': { name: 'Molineux Stadium', capacity: 32050, city: 'Wolverhampton' },
    'ipswich town': { name: 'Portman Road', capacity: 30014, city: 'Ipswich' },
    'leicester city': { name: 'King Power Stadium', capacity: 32261, city: 'Leicester' },
    'southampton': { name: "St Mary's Stadium", capacity: 32384, city: 'Southampton' },

    // La Liga
    'real madrid': { name: 'Estadio Santiago Bernabéu', capacity: 81044, city: 'Madrid' },
    'fc barcelona': { name: 'Spotify Camp Nou / Estadi Olímpic', capacity: 55926, city: 'Barcelona' },
    'barcelona': { name: 'Spotify Camp Nou / Estadi Olímpic', capacity: 55926, city: 'Barcelona' },
    'atletico madrid': { name: 'Riyadh Air Metropolitano', capacity: 70460, city: 'Madrid' },
    'atlético madrid': { name: 'Riyadh Air Metropolitano', capacity: 70460, city: 'Madrid' },
    'athletic club': { name: 'Estadio de San Mamés', capacity: 53289, city: 'Bilbao' },
    'real sociedad': { name: 'Reale Arena (Anoeta)', capacity: 39313, city: 'San Sebastián' },
    'real betis': { name: 'Estadio Benito Villamarín', capacity: 60721, city: 'Sevilla' },
    'girona fc': { name: 'Estadi Montilivi', capacity: 14624, city: 'Girona' },
    'girona': { name: 'Estadi Montilivi', capacity: 14624, city: 'Girona' },
    'villarreal cf': { name: 'Estadio de la Cerámica', capacity: 23500, city: 'Villarreal' },
    'villarreal': { name: 'Estadio de la Cerámica', capacity: 23500, city: 'Villarreal' },
    'valencia cf': { name: 'Estadi de Mestalla', capacity: 49430, city: 'Valencia' },
    'valencia': { name: 'Estadi de Mestalla', capacity: 49430, city: 'Valencia' },
    'sevilla fc': { name: 'Estadio Ramón Sánchez-Pizjuán', capacity: 43883, city: 'Sevilla' },
    'sevilla': { name: 'Estadio Ramón Sánchez-Pizjuán', capacity: 43883, city: 'Sevilla' },

    // Serie A
    'inter milano': { name: 'Stadio San Siro (Giuseppe Meazza)', capacity: 75817, city: 'Milán' },
    'inter': { name: 'Stadio San Siro (Giuseppe Meazza)', capacity: 75817, city: 'Milán' },
    'ac milan': { name: 'Stadio San Siro (Giuseppe Meazza)', capacity: 75817, city: 'Milán' },
    'milan': { name: 'Stadio San Siro (Giuseppe Meazza)', capacity: 75817, city: 'Milán' },
    'juventus': { name: 'Allianz Stadium', capacity: 41507, city: 'Turín' },
    'as roma': { name: 'Stadio Olimpico di Roma', capacity: 70634, city: 'Roma' },
    'roma': { name: 'Stadio Olimpico di Roma', capacity: 70634, city: 'Roma' },
    'ssc napoli': { name: 'Stadio Diego Armando Maradona', capacity: 54726, city: 'Nápoles' },
    'napoli': { name: 'Stadio Diego Armando Maradona', capacity: 54726, city: 'Nápoles' },
    'atalanta': { name: 'Gewiss Stadium', capacity: 24950, city: 'Bérgamo' },
    'lazio': { name: 'Stadio Olimpico di Roma', capacity: 70634, city: 'Roma' },

    // Bundesliga
    'bayern münchen': { name: 'Allianz Arena', capacity: 75024, city: 'Múnich' },
    'bayern munich': { name: 'Allianz Arena', capacity: 75024, city: 'Múnich' },
    'borussia dortmund': { name: 'Signal Iduna Park (Westfalenstadion)', capacity: 81365, city: 'Dortmund' },
    'dortmund': { name: 'Signal Iduna Park (Westfalenstadion)', capacity: 81365, city: 'Dortmund' },
    'bayer leverkusen': { name: 'BayArena', capacity: 30210, city: 'Leverkusen' },
    'leverkusen': { name: 'BayArena', capacity: 30210, city: 'Leverkusen' },
    'rb leipzig': { name: 'Red Bull Arena', capacity: 47069, city: 'Leipzig' },
    'leipzig': { name: 'Red Bull Arena', capacity: 47069, city: 'Leipzig' },

    // Ligue 1
    'paris saint-germain': { name: 'Parc des Princes', capacity: 47929, city: 'París' },
    'psg': { name: 'Parc des Princes', capacity: 47929, city: 'París' },
    'olympique de marseille': { name: 'Orange Vélodrome', capacity: 67394, city: 'Marsella' },
    'marseille': { name: 'Orange Vélodrome', capacity: 67394, city: 'Marsella' },
    'as monaco': { name: 'Stade Louis II', capacity: 18523, city: 'Mónaco' },
    'monaco': { name: 'Stade Louis II', capacity: 18523, city: 'Mónaco' },
    'olympique lyonnais': { name: 'Groupama Stadium (Parc OL)', capacity: 59186, city: 'Décines-Charpieu / Lyon' },
    'lyon': { name: 'Groupama Stadium (Parc OL)', capacity: 59186, city: 'Décines-Charpieu / Lyon' },

    // Argentina
    'boca juniors': { name: 'Estadio Alberto J. Armando (La Bombonera)', capacity: 54000, city: 'Buenos Aires' },
    'river plate': { name: 'Estadio Mâs Monumental', capacity: 84567, city: 'Buenos Aires' },
    'racing club': { name: 'Estadio Presidente Perón (El Cilindro)', capacity: 51389, city: 'Avellaneda' },
    'racing': { name: 'Estadio Presidente Perón (El Cilindro)', capacity: 51389, city: 'Avellaneda' },
    'independiente': { name: 'Estadio Libertadores de América - Bochini', capacity: 48069, city: 'Avellaneda' },
    'san lorenzo': { name: 'Estadio Pedro Bidegain (Nuevo Gasómetro)', capacity: 47964, city: 'Buenos Aires' },
    'estudiantes lp': { name: 'Estadio Jorge Luis Hirschi (UNO)', capacity: 32530, city: 'La Plata' },
    'estudiantes de la plata': { name: 'Estadio Jorge Luis Hirschi (UNO)', capacity: 32530, city: 'La Plata' },
    'vélez sarsfield': { name: 'Estadio José Amalfitani', capacity: 49540, city: 'Buenos Aires' },
    'velez sarsfield': { name: 'Estadio José Amalfitani', capacity: 49540, city: 'Buenos Aires' },
    'huracán': { name: 'Estadio Tomás Adolfo Ducó (El Palacio)', capacity: 48314, city: 'Buenos Aires' },
    'rosario central': { name: 'Estadio Gigante de Arroyito', capacity: 41465, city: 'Rosario' },
    'newell’s old boys': { name: 'Estadio Marcelo Bielsa (Coloso del Parque)', capacity: 42000, city: 'Rosario' },
    'newell\'s': { name: 'Estadio Marcelo Bielsa (Coloso del Parque)', capacity: 42000, city: 'Rosario' },

    // Brasil
    'flamengo': { name: 'Estádio do Maracanã', capacity: 78838, city: 'Río de Janeiro' },
    'palmeiras': { name: 'Allianz Parque', capacity: 43713, city: 'São Paulo' },
    'são paulo fc': { name: 'MorumBIS', capacity: 66795, city: 'São Paulo' },
    'sao paulo fc': { name: 'MorumBIS', capacity: 66795, city: 'São Paulo' },
    'são paulo': { name: 'MorumBIS', capacity: 66795, city: 'São Paulo' },
    'corinthians': { name: 'Neo Química Arena', capacity: 49205, city: 'São Paulo' },
    'santos': { name: 'Estádio Urbano Caldeira (Vila Belmiro)', capacity: 16068, city: 'Santos' },
    'grêmio': { name: 'Arena do Grêmio', capacity: 55662, city: 'Porto Alegre' },
    'gremio': { name: 'Arena do Grêmio', capacity: 55662, city: 'Porto Alegre' },
    'internacional': { name: 'Estádio Beira-Rio', capacity: 50842, city: 'Porto Alegre' },
    'atlético mineiro': { name: 'Arena MRV', capacity: 46000, city: 'Belo Horizonte' },
    'atletico mineiro': { name: 'Arena MRV', capacity: 46000, city: 'Belo Horizonte' },
    'fluminense': { name: 'Estádio do Maracanã', capacity: 78838, city: 'Río de Janeiro' },
    'botafogo': { name: 'Estádio Nilton Santos (Engenhão)', capacity: 44661, city: 'Río de Janeiro' },
    'vasco da gama': { name: 'Estádio São Januário', capacity: 21880, city: 'Río de Janeiro' },
    'cruzeiro': { name: 'Estádio Mineirão', capacity: 61846, city: 'Belo Horizonte' },

    // Uruguay, Chile, Ecuador
    'peñarol': { name: 'Estadio Campeón del Siglo', capacity: 40000, city: 'Montevideo' },
    'nacional': { name: 'Estadio Gran Parque Central', capacity: 34000, city: 'Montevideo' },
    'colo-colo': { name: 'Estadio Monumental David Arellano', capacity: 47347, city: 'Santiago' },
    'ldu quito': { name: 'Estadio Rodrigo Paz Delgado (Casa Blanca)', capacity: 41575, city: 'Quito' },
};

/**
 * Returns authentic stadium info for any team, falling back cleanly to name lookup and tier-based estimates.
 */
export function getTeamStadium(team?: { id?: number; name?: string; tier?: 'Top' | 'Mid' | 'Lower'; stadiumName?: string; stadiumCapacity?: number; city?: string }): TeamStadiumInfo {
    if (!team) {
        return { name: 'Estadio Municipal', capacity: 25000, city: 'Capital' };
    }

    // 1. Explicit properties on team object
    if (team.stadiumName && team.stadiumCapacity) {
        return {
            name: team.stadiumName,
            capacity: team.stadiumCapacity,
            city: team.city || 'Sede'
        };
    }

    // 2. Direct lookup by club ID
    if (team.id && STADIUMS_BY_TEAM_ID[team.id]) {
        return STADIUMS_BY_TEAM_ID[team.id];
    }

    // 3. Fallback lookup by club Name (normalized)
    if (team.name) {
        const key = team.name.toLowerCase().trim();
        if (STADIUMS_BY_NAME[key]) {
            return STADIUMS_BY_NAME[key];
        }
        // Partial search
        for (const [clubKey, stadiumInfo] of Object.entries(STADIUMS_BY_NAME)) {
            if (key.includes(clubKey) || clubKey.includes(key)) {
                return stadiumInfo;
            }
        }
    }

    // 4. Fallback based on tier
    const defaultCapacity = team.tier === 'Top' ? 55000 : team.tier === 'Mid' ? 32000 : 16000;
    return {
        name: team.stadiumName || `${team.name || 'Club'} Stadium`,
        capacity: team.stadiumCapacity || defaultCapacity,
        city: team.city || 'Ciudad'
    };
}
