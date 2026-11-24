import { CountryCode, LEAGUE_COUNTRY, LeagueId, Player, PlayerNationality } from '../types';

export interface CountryMetadata {
    code: PlayerNationality;
    name: string;
    flag: string;
    shortCode: string;
}

export const COUNTRY_META: Record<PlayerNationality, CountryMetadata> = {
    ARG: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', shortCode: 'ARG' },
    BRA: { code: 'BRA', name: 'Brasil', flag: '🇧🇷', shortCode: 'BRA' },
    ESP: { code: 'ESP', name: 'España', flag: '🇪🇸', shortCode: 'ESP' },
    ENG: { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', shortCode: 'ING' },
    GER: { code: 'GER', name: 'Alemania', flag: '🇩🇪', shortCode: 'ALE' },
    ITA: { code: 'ITA', name: 'Italia', flag: '🇮🇹', shortCode: 'ITA' },
    FRA: { code: 'FRA', name: 'Francia', flag: '🇫🇷', shortCode: 'FRA' },
    PAR: { code: 'PAR', name: 'Paraguay', flag: '🇵🇾', shortCode: 'PAR' },
    MEX: { code: 'MEX', name: 'México', flag: '🇲🇽', shortCode: 'MEX' },
    CHI: { code: 'CHI', name: 'Chile', flag: '🇨🇱', shortCode: 'CHI' },
    COL: { code: 'COL', name: 'Colombia', flag: '🇨🇴', shortCode: 'COL' },
    URU: { code: 'URU', name: 'Uruguay', flag: '🇺🇾', shortCode: 'URU' },
    PER: { code: 'PER', name: 'Perú', flag: '🇵🇪', shortCode: 'PER' },
    ECU: { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', shortCode: 'ECU' },
    POR: { code: 'POR', name: 'Portugal', flag: '🇵🇹', shortCode: 'POR' },
    NED: { code: 'NED', name: 'Países Bajos', flag: '🇳🇱', shortCode: 'NED' },
    BEL: { code: 'BEL', name: 'Bélgica', flag: '🇧🇪', shortCode: 'BEL' },
    CRO: { code: 'CRO', name: 'Croacia', flag: '🇭🇷', shortCode: 'CRO' },
    USA: { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', shortCode: 'USA' },
    JPN: { code: 'JPN', name: 'Japón', flag: '🇯🇵', shortCode: 'JPN' },
    OTHER: { code: 'OTHER', name: 'Internacional', flag: '🌍', shortCode: 'INT' },
};

const LEAGUE_FOREIGN_POOLS: Partial<Record<CountryCode, PlayerNationality[]>> = {
    ARG: ['URU', 'COL', 'PAR', 'CHI', 'PER', 'ECU', 'BRA'],
    BRA: ['ARG', 'URU', 'COL', 'PAR', 'CHI', 'ECU'],
    ESP: ['ARG', 'BRA', 'FRA', 'URU', 'POR', 'ENG', 'GER'],
    ENG: ['FRA', 'BRA', 'ESP', 'ARG', 'POR', 'NED', 'BEL'],
    GER: ['FRA', 'NED', 'BEL', 'CRO', 'ESP', 'ARG', 'BRA'],
    ITA: ['ARG', 'BRA', 'FRA', 'NED', 'CRO', 'ESP', 'POR'],
    FRA: ['BRA', 'ARG', 'ESP', 'POR', 'BEL', 'ITA'],
    MEX: ['ARG', 'COL', 'URU', 'CHI', 'BRA', 'USA', 'ECU'],
    PAR: ['ARG', 'URU', 'BRA', 'COL'],
    CHI: ['ARG', 'URU', 'COL', 'PAR', 'PER'],
    COL: ['ARG', 'URU', 'BRA', 'PAR', 'ECU'],
};

const NAME_POOLS: Record<string, { first: string[]; last: string[] }> = {
    ARG: {
        first: ['Mateo', 'Valentín', 'Thiago', 'Enzo', 'Lautaro', 'Julián', 'Tomás', 'Facundo', 'Nahuel', 'Joaquín', 'Franco', 'Agustín', 'Lucas', 'Nicolás', 'Federico', 'Ignacio', 'Leandro', 'Gonzalo', 'Bruno', 'Santiago'],
        last: ['Fernández', 'Álvarez', 'Martínez', 'Romero', 'Sosa', 'Acosta', 'Giménez', 'Gómez', 'Pereyra', 'Benítez', 'Medina', 'Díaz', 'Ríos', 'Cabrera', 'Aguirre', 'Ferreyra', 'Ledesma', 'Palacios', 'Barco', 'Redondo']
    },
    BRA: {
        first: ['Gabriel', 'Lucas', 'Matheus', 'Rafael', 'Vinícius', 'Bruno', 'Gustavo', 'Pedro', 'João', 'Caio', 'Felipe', 'Igor', 'Danilo', 'Rodrigo', 'Murilo', 'Cauã', 'Luan', 'Thiago', 'André', 'Kauã'],
        last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Ribeiro', 'Carvalho', 'Gomes', 'Teixeira', 'Barbosa', 'Cardoso', 'Rocha']
    },
    ESP: {
        first: ['Pablo', 'Álvaro', 'Hugo', 'Martín', 'Alejandro', 'Sergio', 'Iker', 'Unai', 'Dani', 'Marc', 'Pau', 'Gorka', 'Ander', 'Ferran', 'Carlos', 'Javier', 'Adrián', 'Nicolás', 'Raúl', 'Yeremy'],
        last: ['García', 'López', 'Sánchez', 'Ruiz', 'Muñoz', 'Navarro', 'Moreno', 'Torres', 'Vázquez', 'Serrano', 'Molina', 'Ortega', 'Delgado', 'Domínguez', 'Gil', 'Alonso', 'Gutiérrez', 'Blanco', 'Castillo', 'Marín']
    },
    ENG: {
        first: ['Harry', 'Jude', 'Cole', 'Phil', 'Bukayo', 'Declan', 'Jack', 'Mason', 'Oliver', 'George', 'Liam', 'Callum', 'Harvey', 'Kobbie', 'Rico', 'James', 'Trent', 'Reece', 'Marcus', 'Ethan'],
        last: ['Smith', 'Taylor', 'Walker', 'Wright', 'Green', 'Hall', 'Baker', 'Clarke', 'Turner', 'Morgan', 'Cooper', 'Ward', 'Bennett', 'Hughes', 'Edwards', 'Harrison', 'Watkins', 'Bellingham', 'Foden', 'Palmer']
    },
    GER: {
        first: ['Lukas', 'Leon', 'Jonas', 'Felix', 'Julian', 'Florian', 'Jamal', 'Kai', 'Maximilian', 'Niklas', 'Timo', 'Tobias', 'Bastian', 'Paul', 'Finn', 'Moritz', 'Jan', 'Lennart'],
        last: ['Müller', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Braun', 'Krüger', 'Zimmermann']
    },
    ITA: {
        first: ['Marco', 'Alessandro', 'Lorenzo', 'Matteo', 'Federico', 'Davide', 'Niccolò', 'Riccardo', 'Andrea', 'Francesco', 'Luca', 'Simone', 'Edoardo', 'Gianluca', 'Pietro', 'Tommaso', 'Giacomo', 'Stefano'],
        last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Conti', 'Gallo', 'Costa', 'Giordano', 'Mancini', 'Lombardi', 'Moretti', 'Barbieri']
    },
    FRA: {
        first: ['Kylian', 'Antoine', 'Ousmane', 'Théo', 'Lucas', 'Aurélien', 'Eduardo', 'Hugo', 'Rayan', 'Warren', 'Désiré', 'Bradley', 'Maxime', 'Clément', 'Jules', 'Raphaël', 'Mathis', 'Enzo'],
        last: ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'Girard', 'Mercier', 'Dupont']
    },
    MEX: {
        first: ['Diego', 'Santiago', 'Rodrigo', 'Sebastián', 'Emiliano', 'César', 'Alexis', 'Erick', 'Jesús', 'Carlos', 'Luis', 'Jorge', 'Roberto', 'Marcel', 'Alan', 'Orbelín', 'Hirving', 'Uriel'],
        last: ['Hernández', 'Martínez', 'López', 'González', 'Rodríguez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Reyes', 'Morales', 'Vásquez', 'Jiménez', 'Mendoza', 'Vega', 'Pineda', 'Chávez', 'Romo']
    },
    PAR: {
        first: ['Miguel', 'Julio', 'Ramón', 'Mathías', 'Ángel', 'Gustavo', 'Damián', 'Fabrizio', 'Junior', 'Matías', 'Derlis', 'Blas', 'Iván', 'Richard', 'Santiago', 'Diego'],
        last: ['Almirón', 'Gómez', 'Enciso', 'Sosa', 'Bobadilla', 'Villasanti', 'Balbuena', 'Alderete', 'Sanabria', 'Rojas', 'Cáceres', 'Bareiro', 'Peralta', 'Riveros', 'Ayala', 'Cardozo']
    },
    CHI: {
        first: ['Darío', 'Lucas', 'Vicente', 'Benjamín', 'Marcelino', 'Felipe', 'Maximiliano', 'Gabriel', 'Matías', 'Cristián', 'Arturo', 'Alexis', 'Brayan', 'Esteban', 'Tomás', 'Bastián'],
        last: ['Osorio', 'Assadi', 'Pizarro', 'Suazo', 'Núñez', 'Loyola', 'Cepeda', 'Cortés', 'Palacios', 'Vidal', 'Aránguiz', 'Valdés', 'Pavez', 'Saldivia', 'Díaz', 'Méndez']
    },
    COL: {
        first: ['Luis', 'Jhon', 'Yaser', 'Daniel', 'Camilo', 'Richard', 'Kevin', 'Mateo', 'Juan', 'Santiago', 'Jefferson', 'Carlos', 'Jorge', 'Rafael', 'Andrés', 'Deiver'],
        last: ['Díaz', 'Durán', 'Asprilla', 'Muñoz', 'Ríos', 'Castaño', 'Lucumí', 'Cuesta', 'Arias', 'Carrascal', 'Borré', 'Córdoba', 'Mina', 'Sánchez', 'Lerma', 'Quintero']
    },
    URU: {
        first: ['Federico', 'Darwin', 'Ronald', 'Manuel', 'Rodrigo', 'Facundo', 'Maximiliano', 'Luciano', 'Nicolás', 'Matías', 'Nahitan', 'Brian', 'Guillermo', 'Agustín', 'Lucas'],
        last: ['Valverde', 'Núñez', 'Araújo', 'Ugarte', 'Bentancur', 'Pellistri', 'De la Cruz', 'Olivera', 'Giménez', 'Varela', 'Nández', 'Rodríguez', 'Viña', 'Torreira', 'Suárez']
    }
};

export function getLeagueCountryCode(leagueId?: LeagueId | 'CONMEBOL'): CountryCode {
    if (!leagueId || leagueId === 'CONMEBOL') return 'ARG';
    return LEAGUE_COUNTRY[leagueId] || 'ENG';
}

export function getCountryMeta(code?: PlayerNationality): CountryMetadata {
    return COUNTRY_META[code || 'OTHER'] || COUNTRY_META.OTHER;
}

export function generateNameByNationality(country: PlayerNationality): string {
    const pool = NAME_POOLS[country] || NAME_POOLS.ARG;
    const first = pool.first[Math.floor(Math.random() * pool.first.length)];
    const last = pool.last[Math.floor(Math.random() * pool.last.length)];
    return `${first} ${last}`;
}

/**
 * Infers a deterministic nationality for legacy players without explicit nationality metadata,
 * matching league demographics while recognizing clear linguistic patterns.
 */
export function resolvePlayerNationality(player: Player, leagueId?: LeagueId | 'CONMEBOL'): PlayerNationality {
    if (player.nationality && COUNTRY_META[player.nationality]) {
        return player.nationality;
    }

    const homeCountry = getLeagueCountryCode(leagueId);
    const n = (player.name || '').toLowerCase();

    // Quick recognition for distinctive names regardless of club
    if (/(cavani|merentiel|valverde|bentancur|ugarte|araujo)/.test(n)) {
        return 'URU';
    }
    if (/(advíncula|guerrero|lapadula|cueva|tapia)/.test(n)) return 'PER';
    if (/(alarcon|alarcón|palacios|vidal|alexis|bravo|medina)/.test(n) && homeCountry === 'ARG' && /(alarcón|palacios|vidal)/.test(n)) {
        return 'CHI';
    }
    if (/(messi|di maría|maradona|lautaro|mac allister|paredes|dybala|romero|tagliafico|de paul|enzo|martínez)/.test(n)) {
        if (/(messi|di maría|paredes|dybala|tagliafico|de paul|mac allister)/.test(n)) return 'ARG';
    }
    if (/(vinícius|rodrygo|neymar|raphinha|endrick|alisson|ederson|casemiro|marquinhos|gabriel|guimarães|paquetá)/.test(n)) {
        if (/(vinícius|rodrygo|neymar|raphinha|endrick|casemiro|marquinhos|guimarães|paquetá)/.test(n)) return 'BRA';
    }
    if (/(mbappé|griezmann|dembélé|camavinga|tchouaméni|koundé|saliba|kanté|giroud)/.test(n)) return 'FRA';
    if (/(kane|bellingham|foden|saka|palmer|rice|alexander-arnold|pickford|stones)/.test(n)) return 'ENG';
    if (/(musiala|wirtz|kimmich|neuer|havertz|sane|sané|gündogan|rüdiger|kroos)/.test(n)) return 'GER';

    // Deterministic distribution: ~80% domestic, ~20% realistic foreign
    const hash = Math.abs((player.id || 1) * 31 + n.length * 17) % 100;
    if (hash < 80) {
        return homeCountry;
    }

    const foreignPool = LEAGUE_FOREIGN_POOLS[homeCountry] || ['ARG', 'BRA', 'ESP', 'ENG', 'FRA'];
    return foreignPool[hash % foreignPool.length];
}

/**
 * Populates missing nationalities across a squad and ensures no starting squad exceeds
 * the initial foreign cap so all clubs begin valid for Realistic mode rules.
 */
export function ensureSquadNationalities(
    squad: Player[],
    leagueId?: LeagueId | 'CONMEBOL',
    maxInitialForeign: number = 5
): Player[] {
    const homeCountry = getLeagueCountryCode(leagueId);
    let foreignCount = 0;

    return squad.map(player => {
        let nat = resolvePlayerNationality(player, leagueId);
        if (nat !== homeCountry) {
            if (!player.nationality && foreignCount >= maxInitialForeign) {
                nat = homeCountry;
            } else {
                foreignCount++;
            }
        }
        return player.nationality === nat ? player : { ...player, nationality: nat };
    });
}

/**
 * Maps any CountryCode (including nations without a playable domestic league in Apex)
 * to eligible destination countries whose clubs can nurture the 1:1 regen youth player.
 */
const PLAYABLE_COUNTRIES = new Set<PlayerNationality>(['ARG', 'BRA', 'ESP', 'ENG', 'GER', 'ITA', 'FRA', 'MEX', 'PAR', 'CHI', 'COL']);

export function getRegenDestinationCountries(nationality: PlayerNationality): CountryCode[] {
    if (PLAYABLE_COUNTRIES.has(nationality)) {
        return [nationality as CountryCode];
    }
    switch (nationality) {
        case 'URU':
        case 'PER':
        case 'ECU':
            return ['ARG', 'BRA', 'COL', 'CHI'];
        case 'POR':
            return ['ESP', 'FRA', 'ENG'];
        case 'NED':
        case 'BEL':
            return ['GER', 'ENG', 'FRA'];
        case 'CRO':
            return ['ITA', 'GER', 'ESP'];
        case 'USA':
            return ['MEX', 'ENG'];
        default:
            return ['ESP', 'ENG', 'ARG'];
    }
}
