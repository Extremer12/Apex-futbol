// Cascading Matcher Algorithm for Logos and Assets

export function normalizeKey(str: string): string {
    if (!str) return '';
    
    return str
        .toLowerCase()
        // Strip accents/diacritics: á -> a, é -> e, ñ -> n
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Strip common file extensions
        .replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, '')
        // Replace punctuation and separators with empty or single spaces
        .replace(/[_\-\.\,\'\"]/g, ' ')
        // Remove common football prefixes and suffixes to maximize match rate
        .replace(/\b(club|atletico|deportivo|sporting|futbol|fc|cf|sc|afc|cd|ca|de|la|el|los|las|the)\b/gi, ' ')
        // Strip all non-alphanumeric characters
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

/**
 * Generate all possible slug variants for a team/competition to guarantee a match
 */
export function getTeamMatchKeys(team: { id?: number | string; name?: string; shortName?: string }): string[] {
    const keys: string[] = [];

    // 1. Exact ID
    if (team.id !== undefined && team.id !== null) {
        keys.push(String(team.id));
        keys.push(`team_${team.id}`);
    }

    // 2. Normalized full name
    if (team.name) {
        const normalized = normalizeKey(team.name);
        if (normalized) keys.push(normalized);
        
        // Exact raw slug without stripping prefixes
        const rawSlug = team.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
        if (rawSlug && !keys.includes(rawSlug)) keys.push(rawSlug);
    }

    // 3. Short name / Acronym
    if (team.shortName) {
        const shortNorm = normalizeKey(team.shortName);
        if (shortNorm && !keys.includes(shortNorm)) keys.push(shortNorm);
    }

    return keys;
}

export function getCompetitionMatchKeys(competitionId: string, name?: string): string[] {
    const keys: string[] = [];

    // 1. Raw ID (e.g. PREMIER_LEAGUE)
    if (competitionId) {
        keys.push(competitionId.toLowerCase());
        const normId = normalizeKey(competitionId);
        if (normId && !keys.includes(normId)) keys.push(normId);
    }

    // 2. Display Name (e.g. "Champions League")
    if (name) {
        const normName = normalizeKey(name);
        if (normName && !keys.includes(normName)) keys.push(normName);
    }

    return keys;
}
