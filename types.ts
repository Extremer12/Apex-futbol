
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
  LA_LIGA = 'LA_LIGA',
}

export type CountryCode = 'ENG' | 'ESP';

export const LEAGUE_COUNTRY: Record<LeagueId, CountryCode> = {
  [LeagueId.PREMIER_LEAGUE]: 'ENG',
  [LeagueId.CHAMPIONSHIP]: 'ENG',
  [LeagueId.LA_LIGA]: 'ESP',
};

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
  coach?: Coach; // Added for Phase 2: Sports Delegation
}

export interface Coach {
  id: string;
  name: string;
  age: number;
  nationality: string;
  style: 'Attacking' | 'Defensive' | 'Possession' | 'Counter' | 'Balanced';
  prestige: number; // 1-100, affects signing cost and team morale
  salary: number; // Weekly salary
  signingBonus: number; // Cost to hire
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

export interface CupScorer {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  goals: number;
}

export interface CupChampion {
  season: number;
  winnerId: number;
  winnerName: string;
}

export interface CupStatistics {
  topScorers: CupScorer[];
  championsHistory: CupChampion[];
}

export interface CupCompetition {
  id: string;
  name: string;
  rounds: CupRound[];
  currentRoundIndex: number;
  winnerId?: number;
  statistics: CupStatistics;
}

// Presidential System Types
export interface PresidentialMandate {
  startYear: number;           // Año en que comenzó el mandato
  currentYear: number;          // Año actual del mandato (1-4)
  nextElectionSeason: number;   // Temporada en que habrá elecciones
  isElectionYear: boolean;      // Flag para año electoral
  totalMandates: number;        // Cuántos mandatos ha tenido el presidente
}

export interface FanApproval {
  rating: number;               // 0-100 (votos en elecciones)
  trend: 'rising' | 'stable' | 'falling';
  factors: {
    results: number;            // -20 a +20 (basado en posición liga)
    transfers: number;          // -10 a +10 (fichajes galácticos vs ventas)
    finances: number;           // -10 a +10 (deuda vs superávit)
    promises: number;           // -20 a +20 (promesas cumplidas)
  };
}

export interface ElectoralPromise {
  id: string;
  description: string;
  type: 'league_position' | 'trophy' | 'stadium' | 'transfer';
  target: string | number;      // Ej: "Champions League" o 3 (top 3)
  deadline: number;              // Temporada límite
  fulfilled: boolean;
  impact: number;                // +/- puntos de aprobación si se cumple/falla
}

// Advanced Economy Types
export interface Stadium {
  name: string;
  capacity: number;
  ticketPrice: number;          // Precio promedio por entrada
  maintenanceCost: number;      // Coste semanal de mantenimiento
  expansionCost?: number;       // Coste de expansión (si disponible)
  expansionCapacity?: number;   // Nueva capacidad tras expansión
}

export interface Sponsor {
  id: string;
  name: string;
  type: 'shirt' | 'stadium' | 'training' | 'kit';
  weeklyIncome: number;
  duration: number;             // Semanas restantes
  bonus?: {                     // Bonos por rendimiento
    condition: 'top4' | 'top6' | 'win_cup' | 'promotion';
    amount: number;
  };
}

export interface FinancialBreakdown {
  // Ingresos
  matchdayRevenue: number;      // Entradas
  sponsorshipRevenue: number;   // Sponsors
  prizeMoneyRevenue: number;    // Premios de liga/copa
  transferRevenue: number;      // Ventas de jugadores

  // Gastos
  wageExpenses: number;         // Salarios jugadores
  coachExpenses: number;        // Salario DT
  stadiumExpenses: number;      // Mantenimiento estadio
  operationalExpenses: number;  // Gastos operativos generales
  transferExpenses: number;     // Compras de jugadores
}


export interface GameState {
  team: Team;
  allTeams: Team[];
  currentDate: Date;
  currentWeek: number;
  newsFeed: NewsItem[]; // Kept as newsFeed to match App.tsx
  schedule: Match[];
  leagueTables: Record<LeagueId, LeagueTableRow[]>; // Unified league tables
  finances: {
    balance: number;
    transferBudget: number;
    weeklyIncome: number;
    weeklyWages: number;
    balanceHistory: number[];
    breakdown?: FinancialBreakdown; // Detailed breakdown
  };
  stadium: Stadium;
  sponsors: Sponsor[];
  availableSponsors: Sponsor[];  // Market of sponsor offers
  // Political System (Separated from tactical management)
  boardConfidence: number;      // 0-100 (Junta Directiva - despido inmediato)
  fanApproval: FanApproval;     // Aprobación de socios (elecciones)
  mandate: PresidentialMandate; // Sistema de mandato presidencial
  electoralPromises: ElectoralPromise[]; // Promesas electorales

  // Legacy field for backward compatibility (will be removed)
  chairmanConfidence?: number;  // Deprecated: use boardConfidence instead

  viewingPlayer: Player | null;
  incomingOffers: Offer[];
  cups: {
    faCup: CupCompetition;
    carabaoCup: CupCompetition;
  };
  availableCoaches: Coach[]; // Market of available coaches
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
  Staff = 'PERSONAL',
}

