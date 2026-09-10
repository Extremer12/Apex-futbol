import { Team, Match, LeagueId } from '../../types';

// Fixed rivalry pairs for Argentine Football (AFA Interzonal Derbies)
export const ARGENTINE_CLASSIC_PAIRS: [number, number][] = [
    [701, 702], // Boca Juniors vs River Plate
    [704, 703], // Independiente vs Racing Club
    [705, 708], // San Lorenzo vs Huracán
    [710, 709], // Newell's Old Boys vs Rosario Central
    [706, 729], // Estudiantes LP vs Gimnasia LP
    [711, 716], // Talleres vs Belgrano
    [715, 730], // Lanús vs Banfield
    [707, 726], // Vélez Sarsfield vs Argentinos Juniors
    [722, 723], // Platense vs Tigre
    [724, 712], // Unión SF vs Atlético Tucumán
    [717, 733], // Instituto vs Estudiantes Río Cuarto
    [728, 731], // Gimnasia Mendoza vs Independiente Rivadavia
    [719, 718], // Central Córdoba SdE vs Sarmiento Junín
    [714, 720], // Defensa y Justicia vs Barracas Central
    [727, 732], // Deportivo Riestra vs Aldosivi
];

// Historical / regional rivalry fallback pairs if teams are promoted from Primera Nacional
export const ARGENTINE_SECONDARY_DERBIES: [number, number][] = [
    [724, 767], // Unión vs Colón
    [728, 769], // Gimnasia Mza vs Godoy Cruz
    [731, 769], // Ind. Rivadavia vs Godoy Cruz
    [712, 788], // Atl. Tucumán vs San Martín Tuc
    [764, 779], // Chacarita vs Atlanta
    [754, 756], // Nueva Chicago vs All Boys
    [760, 707], // Ferro vs Vélez
    [770, 765], // Quilmes vs Temperley
];

/**
 * Sorts Argentine Primera División teams into Zona A and Zona B using the authentic AFA algorithm:
 * 1. Matches fixed rivalry pairs (e.g. Boca vs River, Racing vs Independiente).
 * 2. Pairs remaining clubs by secondary/geographic rivalry.
 * 3. 50/50 coin flip per pair: one team goes to Zona A, the rival goes to Zona B.
 * Guarantees that Boca and River (and each pair of rivals) never land in the same zone.
 */
export const sortArgentineZones = (teams: Team[]): { zoneA: Team[]; zoneB: Team[]; pairs: [number, number][] } => {
    const teamsMap = new Map(teams.map(t => [t.id, t]));
    const unassigned = new Set(teams.map(t => t.id));
    const activePairs: [number, number][] = [];

    // 1. Establish direct classics present in Primera
    const allRivalries = [...ARGENTINE_CLASSIC_PAIRS, ...ARGENTINE_SECONDARY_DERBIES];
    for (const [idA, idB] of allRivalries) {
        if (unassigned.has(idA) && unassigned.has(idB)) {
            activePairs.push([idA, idB]);
            unassigned.delete(idA);
            unassigned.delete(idB);
        }
    }

    // 2. Pair remaining unassigned clubs (administrative / secondary geographic pairings)
    const remainingIds = Array.from(unassigned);
    const shuffledRemaining = [...remainingIds].sort(() => 0.5 - Math.random());
    for (let i = 0; i < shuffledRemaining.length; i += 2) {
        if (i + 1 < shuffledRemaining.length) {
            activePairs.push([shuffledRemaining[i], shuffledRemaining[i + 1]]);
            unassigned.delete(shuffledRemaining[i]);
            unassigned.delete(shuffledRemaining[i + 1]);
        }
    }

    // 3. 50/50 assignment per pair
    const zoneA: Team[] = [];
    const zoneB: Team[] = [];

    activePairs.forEach(([idA, idB]) => {
        const teamA = teamsMap.get(idA);
        const teamB = teamsMap.get(idB);
        if (!teamA || !teamB) return;

        if (Math.random() < 0.5) {
            teamA.zone = 'A';
            teamB.zone = 'B';
            zoneA.push(teamA);
            zoneB.push(teamB);
        } else {
            teamA.zone = 'B';
            teamB.zone = 'A';
            zoneA.push(teamB);
            zoneB.push(teamA);
        }
    });

    // Handle any odd leftover team (if odd number of teams)
    unassigned.forEach(id => {
        const leftover = teamsMap.get(id);
        if (leftover) {
            if (zoneA.length <= zoneB.length) {
                leftover.zone = 'A';
                zoneA.push(leftover);
            } else {
                leftover.zone = 'B';
                zoneB.push(leftover);
            }
        }
    });

    return { zoneA, zoneB, pairs: activePairs };
};

// Internal round-robin fallback for Argentine leagues
const fallbackRoundRobin = (teams: Team[], competitionName: string): Match[] => {
    const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
    const teamIds = shuffledTeams.map(t => t.id);
    if (teamIds.length % 2 !== 0) return [];
    const schedule: Match[] = [];
    const numWeeks = teamIds.length - 1;
    const halfSeasonSize = teamIds.length / 2;
    const teamsSlice = teamIds.slice(1);

    for (let week = 0; week < numWeeks; week++) {
        const weekFixtures: { home: number, away: number }[] = [];
        const awayTeamIndex = week % teamsSlice.length;
        weekFixtures.push({ home: teamIds[0], away: teamsSlice[awayTeamIndex] });
        for (let i = 1; i < halfSeasonSize; i++) {
            const homeIndex = (week + i) % teamsSlice.length;
            const awayIndex = (week + teamsSlice.length - i) % teamsSlice.length;
            weekFixtures.push({ home: teamsSlice[homeIndex], away: teamsSlice[awayIndex] });
        }
        weekFixtures.forEach(fixture => schedule.push({
            week: week + 1,
            homeTeamId: fixture.home,
            awayTeamId: fixture.away,
            competition: competitionName,
            isCupMatch: false
        }));
    }
    const secondHalf = schedule.map(match => ({
        week: match.week + numWeeks,
        homeTeamId: match.awayTeamId,
        awayTeamId: match.homeTeamId,
        competition: competitionName,
        isCupMatch: false
    }));
    return [...schedule, ...secondHalf];
};

// Helper to generate Argentine 2026 30-team format schedule (Apertura & Clausura)
export const generateArgentineTournamentSchedule = (teams: Team[], season: number = 2024): Match[] => {
    let zoneA = teams.filter(t => t.zone === 'A');
    let zoneB = teams.filter(t => t.zone === 'B');

    let derbyPairs = ARGENTINE_CLASSIC_PAIRS;

    // If zones not properly populated (e.g. at start or after promotion/relegation), run authentic AFA lottery
    if (zoneA.length !== 15 || zoneB.length !== 15) {
        const sorted = sortArgentineZones(teams);
        zoneA = sorted.zoneA;
        zoneB = sorted.zoneB;
        derbyPairs = sorted.pairs;
    } else {
        // Collect active derby pairs present in current teams
        const activePairs: [number, number][] = [];
        const teamIdSet = new Set(teams.map(t => t.id));
        const allRivalries = [...ARGENTINE_CLASSIC_PAIRS, ...ARGENTINE_SECONDARY_DERBIES];
        const used = new Set<number>();
        for (const [idA, idB] of allRivalries) {
            if (teamIdSet.has(idA) && teamIdSet.has(idB) && !used.has(idA) && !used.has(idB)) {
                activePairs.push([idA, idB]);
                used.add(idA);
                used.add(idB);
            }
        }
        if (activePairs.length > 0) derbyPairs = activePairs;
    }

    // Fallback if still invalid
    if (zoneA.length !== 15 || zoneB.length !== 15) {
        return fallbackRoundRobin(teams, 'Torneo_Apertura');
    }

    // Build 15-round Berger schedule for 16 slots (15 teams + 1 dummy slot at index 15)
    const getZoneRoundRobin = (zoneTeams: Team[]) => {
        const shuffled = [...zoneTeams].sort(() => 0.5 - Math.random());
        const slots: (number | null)[] = shuffled.map(t => t.id);
        slots.push(null); // Slot 15 is dummy (bye)
        const rounds: { fixtures: { home: number; away: number }[]; byeTeamId: number }[] = [];
        const n = 16;
        const half = 8;
        const rotating = slots.slice(1);

        for (let round = 0; round < 15; round++) {
            const currentRoundSlots = [slots[0], ...rotating];
            const fixtures: { home: number; away: number }[] = [];
            let byeTeamId = 0;

            for (let i = 0; i < half; i++) {
                const team1 = currentRoundSlots[i];
                const team2 = currentRoundSlots[n - 1 - i];

                if (team1 === null) {
                    byeTeamId = team2!;
                } else if (team2 === null) {
                    byeTeamId = team1;
                } else {
                    if (round % 2 === 0) {
                        fixtures.push({ home: team1, away: team2 });
                    } else {
                        fixtures.push({ home: team2, away: team1 });
                    }
                }
            }

            rounds.push({ fixtures, byeTeamId });
            const last = rotating.pop()!;
            rotating.unshift(last);
        }
        return rounds;
    };

    const roundsA = getZoneRoundRobin(zoneA);
    const roundsB = getZoneRoundRobin(zoneB);

    const aperturaMatches: Match[] = [];

    // Rounds 1 to 15 (Weeks 1 to 15)
    for (let r = 0; r < 15; r++) {
        const week = r + 1;
        // Intramural Zona A
        roundsA[r].fixtures.forEach(f => {
            aperturaMatches.push({
                week,
                homeTeamId: f.home,
                awayTeamId: f.away,
                competition: 'Torneo_Apertura',
                isCupMatch: false,
            });
        });
        // Intramural Zona B
        roundsB[r].fixtures.forEach(f => {
            aperturaMatches.push({
                week,
                homeTeamId: f.home,
                awayTeamId: f.away,
                competition: 'Torneo_Apertura',
                isCupMatch: false,
            });
        });
        // Interzonal match between the two bye teams
        const byeA = roundsA[r].byeTeamId;
        const byeB = roundsB[r].byeTeamId;
        if (byeA && byeB) {
            aperturaMatches.push({
                week,
                homeTeamId: (r + (season % 2)) % 2 === 0 ? byeA : byeB,
                awayTeamId: (r + (season % 2)) % 2 === 0 ? byeB : byeA,
                competition: 'Torneo_Apertura',
                isCupMatch: false,
            });
        }
    }

    // Round 16: Fecha de Clásicos (Week 16)
    const invertDerbyHome = (season % 2 !== 0);
    derbyPairs.forEach(([idA, idB], idx) => {
        const pickFirst = (idx % 2 === 0) ? !invertDerbyHome : invertDerbyHome;
        aperturaMatches.push({
            week: 16,
            homeTeamId: pickFirst ? idA : idB,
            awayTeamId: pickFirst ? idB : idA,
            competition: 'Torneo_Apertura',
            isCupMatch: false,
        });
    });

    // Torneo Clausura (Weeks 21 to 36): Inverted venues from Apertura
    const clausuraMatches: Match[] = aperturaMatches.map(m => ({
        week: m.week + 20, // Weeks 21 to 36
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        competition: 'Torneo_Clausura',
        isCupMatch: false,
    }));

    return [...aperturaMatches, ...clausuraMatches];
};

export const generateArgentinePlayoffs = (
    sortedZoneA: Team[], 
    sortedZoneB: Team[], 
    competition: 'Playoffs_Apertura' | 'Playoffs_Clausura', 
    startWeek: number
): Match[] => {
    const octavosPairings: [Team, Team][] = [
        [sortedZoneA[0], sortedZoneB[7]], // Llave 1 (Izq)
        [sortedZoneA[3], sortedZoneB[4]], // Llave 2 (Izq)
        [sortedZoneB[1], sortedZoneA[6]], // Llave 3 (Izq)
        [sortedZoneB[2], sortedZoneA[5]], // Llave 4 (Izq)
        [sortedZoneB[0], sortedZoneA[7]], // Llave 5 (Der)
        [sortedZoneB[3], sortedZoneA[4]], // Llave 6 (Der)
        [sortedZoneA[1], sortedZoneB[6]], // Llave 7 (Der)
        [sortedZoneA[2], sortedZoneB[5]], // Llave 8 (Der)
    ];

    return octavosPairings
        .filter(([home, away]) => home && away)
        .map(([home, away]) => ({
            week: startWeek,
            homeTeamId: home.id,
            awayTeamId: away.id,
            competition,
            isCupMatch: true,
            isMidweek: false,
        }));
};

// Helper to generate Primera Nacional format (2 zones of 18 or 19)
export const generatePrimeraNacionalSchedule = (teams: Team[]): Match[] => {
    const zoneA = teams.filter(t => t.zone === 'A');
    const zoneB = teams.filter(t => t.zone === 'B');

    if (zoneA.length === 0 || zoneB.length === 0) {
        return fallbackRoundRobin(teams, LeagueId.PRIMERA_NACIONAL);
    }

    const scheduleA = fallbackRoundRobin(zoneA, LeagueId.PRIMERA_NACIONAL);
    const scheduleB = fallbackRoundRobin(zoneB, LeagueId.PRIMERA_NACIONAL);

    return [...scheduleA, ...scheduleB];
};

export const generateNacionalPrimerAscenso = (leaderA: Team, leaderB: Team, week: number): Match => {
    return {
        week,
        homeTeamId: leaderA.id,
        awayTeamId: leaderB.id,
        competition: 'Nacional_Primer_Ascenso',
        isCupMatch: true,
        isMidweek: false,
    };
};

export const generateNacionalReducidoPhase1 = (zoneATeams: Team[], zoneBTeams: Team[], week: number): Match[] => {
    const pairings: [Team, Team][] = [
        [zoneATeams[1], zoneBTeams[7]], // 2ºA vs 8ºB
        [zoneBTeams[1], zoneATeams[7]], // 2ºB vs 8ºA
        [zoneATeams[2], zoneBTeams[6]], // 3ºA vs 7ºB
        [zoneBTeams[2], zoneATeams[6]], // 3ºB vs 7ºA
        [zoneATeams[3], zoneBTeams[5]], // 4ºA vs 6ºB
        [zoneBTeams[3], zoneATeams[5]], // 4ºB vs 6ºA
        [zoneATeams[4], zoneBTeams[4]], // 5ºA vs 5ºB
    ];

    return pairings
        .filter(([home, away]) => home && away)
        .map(([home, away]) => ({
            week,
            homeTeamId: home.id,
            awayTeamId: away.id,
            competition: 'Nacional_Reducido',
            isCupMatch: true,
            isMidweek: false,
        }));
};

export const generateNacionalReducidoCuartos = (winnersPhase1: Team[], loserPrimerAscenso: Team, week: number): Match[] => {
    const all8 = [loserPrimerAscenso, ...winnersPhase1].filter(Boolean);
    all8.sort((a, b) => b.budget - a.budget);

    const fixtures: Match[] = [];
    const pairs: [number, number][] = [
        [0, 7], [1, 6], [2, 5], [3, 4]
    ];

    pairs.forEach(([h, a]) => {
        if (all8[h] && all8[a]) {
            fixtures.push({
                week,
                homeTeamId: all8[h].id,
                awayTeamId: all8[a].id,
                competition: 'Nacional_Reducido',
                isCupMatch: true,
                isMidweek: false,
            });
        }
    });

    return fixtures;
};
