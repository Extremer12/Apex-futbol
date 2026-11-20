import { Player, Team } from '../../../types';

export interface PlayerStats {
    player: Player;
    team: Team;
    teamId: number;
    teamName: string;
    teamLogo: string;
    goals: number;
    assists: number;
    matches: number;
}

export interface TeamHighlights {
    bestAttackTeam?: Team;
    bestAttackGoals: number;
    bestDefenseTeam?: Team;
    bestDefenseGoals: number;
    totalGoals: number;
    totalMatchesPlayed: number;
    avgGoals: string;
}

export interface CupInfo {
    phaseName: string;
    lastChampionName?: string;
    lastChampionTeam?: Team | null;
    season?: number;
}
