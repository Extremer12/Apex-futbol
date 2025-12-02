
// The React import is necessary to use the React.ReactNode type for component-based logos.
import React from 'react';

export type Morale = 'Feliz' | 'Contento' | 'Normal' | 'Descontento' | 'Enojado';

export interface Player {
  id: number;
  name: string;
  position: 'POR' | 'DEF' | 'CEN' | 'DEL';
  rating: number; // 1-100
  value: number; // in millions
  wage: number; // per week
  morale: Morale;
  contractYears: number; // years remaining
  isTransferListed?: boolean;
  age?: number; // Added for Regens system
}

export enum LeagueId {
  PREMIER_LEAGUE = 'PREMIER_LEAGUE',
  CHAMPIONSHIP = 'CHAMPIONSHIP',
}

export interface Team {
  id: number;
  name: string;
  logo: React.ReactNode;
  leagueId: LeagueId; // Added for multi-league support
  budget: number; // Main budget in millions
  transferBudget: number; // Transfer budget in millions
  squad: Player[];
  tier: 'Top' | 'Mid' | 'Lower';
  teamMorale: Morale;
  primaryColor: string;
  secondaryColor: string;
  tactics: 'Attacking' | 'Balanced' | 'Defensive';
}

export interface PlayerProfile {
  name: string;
  experience: number; // Starts at 0
}

export interface NewsItem {
  id: string;
  headline: string;
  body: string;
  date: string;
}

export interface Match {
  week: number;
  homeTeamId: number;
  awayTeamId: number;
  result?: { homeScore: number; awayScore: number; };
  competition?: 'League' | 'FA_Cup' | 'Carabao_Cup'; // Added to distinguish match types
  isCupMatch?: boolean;
  penalties?: { home: number; away: number; };
}

export interface LeagueTableRow {
  teamId: number;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface Offer {
  id: string;
  playerId: number;
  offeringTeamId: number;
  offerValue: number;
  message: string;
}

export interface CupRound {
  name: string;
  fixtures: Match[];
  completed: boolean;
}

export interface CupCompetition {
  id: string;
  name: string;
  rounds: CupRound[];
  currentRoundIndex: number;
  winnerId?: number;
}

export interface GameState {
  team: Team;
  allTeams: Team[];
  currentDate: Date;
  currentWeek: number;
  newsFeed: NewsItem[]; // Kept as newsFeed to match App.tsx
  schedule: Match[];
  leagueTable: LeagueTableRow[]; // Premier League
  championshipTable: LeagueTableRow[]; // Championship
  finances: {
    balance: number;
    transferBudget: number;
    weeklyIncome: number;
    weeklyWages: number;
    balanceHistory: number[];
  };
  chairmanConfidence: number; // 0-100
  viewingPlayer: Player | null;
  incomingOffers: Offer[];
  cups: {
    faCup: CupCompetition;
    carabaoCup: CupCompetition;
  };
  // New Fields for Academy & Regens
  playerProfile?: PlayerProfile;
  youthAcademy: Player[];
  season: number;
}

export enum Screen {
  Dashboard = 'PANEL',
  Squad = 'PLANTILLA',
  Transfers = 'FICHAJES',
  Finances = 'FINANZAS',
  League = 'LIGA',
  Statistics = 'ESTADÍSTICAS',
  Calendar = 'CALENDARIO',
  Settings = 'AJUSTES',
}

