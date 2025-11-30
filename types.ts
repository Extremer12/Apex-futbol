
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

export interface Team {
  id: number;
  name: string;
  logo: React.ReactNode;
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
}

export interface LeagueTableRow {
  teamId: number;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
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

export interface GameState {
  team: Team;
  allTeams: Team[];
  currentDate: Date;
  currentWeek: number;
  newsFeed: NewsItem[];
  schedule: Match[];
  leagueTable: LeagueTableRow[];
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
  // New Fields for Academy & Regens
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
  Settings = 'AJUSTES',
}

