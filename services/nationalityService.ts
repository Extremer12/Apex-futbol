import { CountryCode, LEAGUE_COUNTRY, LeagueId, Player, PlayerNationality } from '../types';
import { LEAGUES_2024_AGE_BASELINE, REAL_PLAYER_METADATA } from '../data/realPlayerMetadata';

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
    VEN: { code: 'VEN', name: 'Venezuela', flag: '🇻🇪', shortCode: 'VEN' },
    BOL: { code: 'BOL', name: 'Bolivia', flag: '🇧🇴', shortCode: 'BOL' },
    POR: { code: 'POR', name: 'Portugal', flag: '🇵🇹', shortCode: 'POR' },
    NED: { code: 'NED', name: 'Países Bajos', flag: '🇳🇱', shortCode: 'NED' },
    BEL: { code: 'BEL', name: 'Bélgica', flag: '🇧🇪', shortCode: 'BEL' },
    CRO: { code: 'CRO', name: 'Croacia', flag: '🇭🇷', shortCode: 'CRO' },
    NOR: { code: 'NOR', name: 'Noruega', flag: '🇳🇴', shortCode: 'NOR' },
    DEN: { code: 'DEN', name: 'Dinamarca', flag: '🇩🇰', shortCode: 'DIN' },
    SWE: { code: 'SWE', name: 'Suecia', flag: '🇸🇪', shortCode: 'SUE' },
    POL: { code: 'POL', name: 'Polonia', flag: '🇵🇱', shortCode: 'POL' },
    SUI: { code: 'SUI', name: 'Suiza', flag: '🇨🇭', shortCode: 'SUI' },
    AUT: { code: 'AUT', name: 'Austria', flag: '🇦🇹', shortCode: 'AUT' },
    SVN: { code: 'SVN', name: 'Eslovenia', flag: '🇸🇮', shortCode: 'SVN' },
    SRB: { code: 'SRB', name: 'Serbia', flag: '🇷🇸', shortCode: 'SRB' },
    TUR: { code: 'TUR', name: 'Turquía', flag: '🇹🇷', shortCode: 'TUR' },
    UKR: { code: 'UKR', name: 'Ucrania', flag: '🇺🇦', shortCode: 'UKR' },
    SCO: { code: 'SCO', name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', shortCode: 'ESC' },
    WAL: { code: 'WAL', name: 'Gales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', shortCode: 'GAL' },
    IRL: { code: 'IRL', name: 'Irlanda', flag: '🇮🇪', shortCode: 'IRL' },
    NIR: { code: 'NIR', name: 'Irlanda del Norte', flag: '🇬🇧', shortCode: 'NIR' },
    CZE: { code: 'CZE', name: 'Rep. Checa', flag: '🇨🇿', shortCode: 'CHE' },
    SVK: { code: 'SVK', name: 'Eslovaquia', flag: '🇸🇰', shortCode: 'ESQ' },
    HUN: { code: 'HUN', name: 'Hungría', flag: '🇭🇺', shortCode: 'HUN' },
    GEO: { code: 'GEO', name: 'Georgia', flag: '🇬🇪', shortCode: 'GEO' },
    GRE: { code: 'GRE', name: 'Grecia', flag: '🇬🇷', shortCode: 'GRE' },
    RUS: { code: 'RUS', name: 'Rusia', flag: '🇷🇺', shortCode: 'RUS' },
    ISL: { code: 'ISL', name: 'Islandia', flag: '🇮🇸', shortCode: 'ISL' },
    FIN: { code: 'FIN', name: 'Finlandia', flag: '🇫🇮', shortCode: 'FIN' },
    ALB: { code: 'ALB', name: 'Albania', flag: '🇦🇱', shortCode: 'ALB' },
    KOS: { code: 'KOS', name: 'Kosovo', flag: '🇽🇰', shortCode: 'KOS' },
    BIH: { code: 'BIH', name: 'Bosnia', flag: '🇧🇦', shortCode: 'BIH' },
    MKD: { code: 'MKD', name: 'Macedonia del Norte', flag: '🇲🇰', shortCode: 'MKD' },
    ROU: { code: 'ROU', name: 'Rumania', flag: '🇷🇴', shortCode: 'RUM' },
    ARM: { code: 'ARM', name: 'Armenia', flag: '🇦🇲', shortCode: 'ARM' },
    EGY: { code: 'EGY', name: 'Egipto', flag: '🇪🇬', shortCode: 'EGI' },
    MAR: { code: 'MAR', name: 'Marruecos', flag: '🇲🇦', shortCode: 'MAR' },
    SEN: { code: 'SEN', name: 'Senegal', flag: '🇸🇳', shortCode: 'SEN' },
    NGA: { code: 'NGA', name: 'Nigeria', flag: '🇳🇬', shortCode: 'NGA' },
    CIV: { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', shortCode: 'CIV' },
    GHA: { code: 'GHA', name: 'Ghana', flag: '🇬🇭', shortCode: 'GHA' },
    CMR: { code: 'CMR', name: 'Camerún', flag: '🇨🇲', shortCode: 'CMR' },
    ALG: { code: 'ALG', name: 'Argelia', flag: '🇩🇿', shortCode: 'ALG' },
    MLI: { code: 'MLI', name: 'Malí', flag: '🇲🇱', shortCode: 'MLI' },
    GUI: { code: 'GUI', name: 'Guinea', flag: '🇬🇳', shortCode: 'GUI' },
    COD: { code: 'COD', name: 'RD Congo', flag: '🇨🇩', shortCode: 'RDC' },
    ZIM: { code: 'ZIM', name: 'Zimbabue', flag: '🇿🇼', shortCode: 'ZIM' },
    ANG: { code: 'ANG', name: 'Angola', flag: '🇦🇴', shortCode: 'ANG' },
    BFA: { code: 'BFA', name: 'Burkina Faso', flag: '🇧🇫', shortCode: 'BFA' },
    TUN: { code: 'TUN', name: 'Túnez', flag: '🇹🇳', shortCode: 'TUN' },
    GAB: { code: 'GAB', name: 'Gabón', flag: '🇬🇦', shortCode: 'GAB' },
    TOG: { code: 'TOG', name: 'Togo', flag: '🇹🇬', shortCode: 'TOG' },
    USA: { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', shortCode: 'USA' },
    CAN: { code: 'CAN', name: 'Canadá', flag: '🇨🇦', shortCode: 'CAN' },
    JAM: { code: 'JAM', name: 'Jamaica', flag: '🇯🇲', shortCode: 'JAM' },
    CRC: { code: 'CRC', name: 'Costa Rica', flag: '🇨🇷', shortCode: 'CRC' },
    PAN: { code: 'PAN', name: 'Panamá', flag: '🇵🇦', shortCode: 'PAN' },
    JPN: { code: 'JPN', name: 'Japón', flag: '🇯🇵', shortCode: 'JPN' },
    KOR: { code: 'KOR', name: 'Corea del Sur', flag: '🇰🇷', shortCode: 'KOR' },
    IRN: { code: 'IRN', name: 'Irán', flag: '🇮🇷', shortCode: 'IRN' },
    AUS: { code: 'AUS', name: 'Australia', flag: '🇦🇺', shortCode: 'AUS' },
    NZL: { code: 'NZL', name: 'Nueva Zelanda', flag: '🇳🇿', shortCode: 'NZL' },
    ISR: { code: 'ISR', name: 'Israel', flag: '🇮🇱', shortCode: 'ISR' },
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
 * Resolves the authoritative nationality for any player:
 * 1. Exact ID lookup in REAL_PLAYER_METADATA (highest priority so saved bugs self-heal)
 * 2. Player's already assigned valid nationality (for regens & migrated players)
 * 3. Deterministic name/league recognition for generic squads
 */
export function resolvePlayerNationality(
    player: Player,
    leagueId?: LeagueId | 'CONMEBOL',
    options?: { allowForeignMix?: boolean }
): PlayerNationality {
    const realMeta = REAL_PLAYER_METADATA[player.id];
    if (realMeta?.nationality && COUNTRY_META[realMeta.nationality]) {
        return realMeta.nationality;
    }

    if (player.nationality && COUNTRY_META[player.nationality]) {
        return player.nationality;
    }

    const homeCountry = getLeagueCountryCode(leagueId);
    const n = (player.name || '').toLowerCase();

    if (/(v\. junior|vinícius|rodrygo|neymar|raphinha|endrick|alisson|ederson|casemiro|marquinhos|guimarães|paquetá|gabriel m|gabriel j|savinho|militao|militão)/.test(n)) {
        return 'BRA';
    }
    if (/(kane|bellingham|foden|saka|palmer|rice|alexander-arnold|pickford|stones|watkins|grealish|rashford|maguire)/.test(n)) {
        return 'ENG';
    }
    if (/(haaland|ødegaard|ødegard|sørloth|ryerson)/.test(n)) {
        return 'NOR';
    }
    if (/(mbappé|griezmann|dembélé|camavinga|tchouaméni|koundé|saliba|kanté|giroud|thuram|maignan)/.test(n)) {
        return 'FRA';
    }
    if (/(musiala|wirtz|kimmich|neuer|havertz|sané|gündogan|rüdiger|kroos|ter stegen)/.test(n)) {
        return 'GER';
    }
    if (/(cavani|merentiel|valverde|bentancur|ugarte|araujo|de la cruz|arrascaeta)/.test(n)) {
        return 'URU';
    }
    if (/(messi|di maría|maradona|lautaro|mac allister|paredes|dybala|romero|tagliafico|de paul|álvarez|martínez|otamendi|garnacho)/.test(n)) {
        if (/(messi|di maría|paredes|dybala|tagliafico|de paul|mac allister|otamendi|garnacho|lautaro)/.test(n)) return 'ARG';
    }

    if (options?.allowForeignMix) {
        const hash = Math.abs((player.id || 1) * 31 + n.length * 17) % 100;
        if (hash < 82) {
            return homeCountry;
        }
        const foreignPool = LEAGUE_FOREIGN_POOLS[homeCountry] || ['ARG', 'BRA', 'ESP', 'ENG', 'FRA'];
        return foreignPool[hash % foreignPool.length];
    }

    return homeCountry;
}

/**
 * Computes exact 2026 baseline age for real catalog players without ever overwriting
 * existing regens or generating random ages on named superstars.
 */
export function resolveBase2026Age(
    player: Player,
    leagueId?: LeagueId | 'CONMEBOL',
    isGenericClub: boolean = false
): number {
    const realMeta = REAL_PLAYER_METADATA[player.id];
    if (realMeta?.age2026 !== undefined) {
        return realMeta.age2026;
    }

    if (player.age !== undefined && player.age > 0) {
        if (!isGenericClub && leagueId && LEAGUES_2024_AGE_BASELINE.has(leagueId)) {
            return player.age + 2;
        }
        return player.age;
    }

    const hash = Math.abs((player.id || 1) * 19) % 11;
    return 19 + hash;
}

/**
 * Populates nationalities and 2026 ages without ever altering or capping real foreign nationalities.
 */
export function ensureSquadNationalities(
    squad: Player[],
    leagueId?: LeagueId | 'CONMEBOL',
    options?: {
        isGenericClub?: boolean;
        seasonOffset?: number;
        originalById?: Map<number, { player: Player; leagueId: LeagueId | 'CONMEBOL'; isGeneric: boolean }>;
    }
): Player[] {
    const seasonOffset = options?.seasonOffset ?? 0;

    return squad.map(player => {
        const origEntry = options?.originalById?.get(player.id);
        const effectiveLeague = origEntry?.leagueId || leagueId;
        const isGeneric = origEntry ? origEntry.isGeneric : Boolean(options?.isGenericClub);

        const realMeta = REAL_PLAYER_METADATA[player.id];
        let nat: PlayerNationality;
        if (realMeta?.nationality) {
            nat = realMeta.nationality;
        } else if (origEntry) {
            nat = resolvePlayerNationality(origEntry.player, effectiveLeague, { allowForeignMix: isGeneric });
        } else {
            nat = resolvePlayerNationality(player, effectiveLeague, { allowForeignMix: isGeneric });
        }

        let resolvedAge = player.age;
        if (origEntry) {
            resolvedAge = resolveBase2026Age(origEntry.player, effectiveLeague, origEntry.isGeneric) + seasonOffset;
        } else if (realMeta?.age2026 !== undefined) {
            resolvedAge = realMeta.age2026 + seasonOffset;
        } else if (!resolvedAge || resolvedAge <= 0) {
            resolvedAge = resolveBase2026Age(player, effectiveLeague, isGeneric);
        }

        if (player.nationality === nat && player.age === resolvedAge) {
            return player;
        }
        return {
            ...player,
            nationality: nat,
            age: resolvedAge
        };
    });
}

const PLAYABLE_COUNTRIES = new Set<PlayerNationality>(['ARG', 'BRA', 'ESP', 'ENG', 'GER', 'ITA', 'FRA', 'MEX', 'PAR', 'CHI', 'COL']);

export function getRegenDestinationCountries(nationality: PlayerNationality): CountryCode[] {
    if (PLAYABLE_COUNTRIES.has(nationality)) {
        return [nationality as CountryCode];
    }
    switch (nationality) {
        case 'URU':
        case 'PER':
        case 'ECU':
        case 'VEN':
        case 'BOL':
            return ['ARG', 'BRA', 'COL', 'CHI'];
        case 'POR':
            return ['ESP', 'FRA', 'ENG'];
        case 'NED':
        case 'BEL':
        case 'AUT':
        case 'SUI':
            return ['GER', 'ENG', 'FRA'];
        case 'SCO':
        case 'WAL':
        case 'IRL':
        case 'NIR':
        case 'AUS':
            return ['ENG'];
        case 'NOR':
        case 'DEN':
        case 'SWE':
            return ['ENG', 'GER'];
        case 'CRO':
        case 'SRB':
        case 'SVN':
            return ['ITA', 'GER', 'ESP'];
        case 'USA':
        case 'CAN':
        case 'CRC':
        case 'PAN':
        case 'JAM':
            return ['MEX', 'ENG'];
        default:
            return ['ESP', 'ENG', 'GER', 'ITA', 'FRA', 'ARG'];
    }
}
