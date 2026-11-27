import type { Team } from '../types';

let registeredTeams: Team[] | null = null;
let loadPromise: Promise<Team[]> | null = null;

export function registerTeamCatalog(teams: Team[]): void {
    registeredTeams = teams;
}

export function getRegisteredTeams(): Team[] {
    return registeredTeams || [];
}

export async function loadTeamCatalog(): Promise<Team[]> {
    if (registeredTeams && registeredTeams.length > 0) {
        return registeredTeams;
    }
    if (!loadPromise) {
        loadPromise = import('../constants').then((mod) => {
            registeredTeams = mod.TEAMS;
            return mod.TEAMS;
        });
    }
    return loadPromise;
}
