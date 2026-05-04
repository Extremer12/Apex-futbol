
// The React import is necessary to use the React.ReactNode type for component-based logos.
import React from 'react';

export type Morale = 'Feliz' | 'Contento' | 'Normal' | 'Descontento' | 'Enojado';

export interface Trophy {
  id: string;
  name: string; // Ej: "Premier League", "FA Cup"
  season: number;
  type: 'league' | 'cup';
}

export interface PlayerStats {
  goals: number;
  assists: number;
  minutes: number;
  appearances: number;
  yellowCards: number;
  redCards: number;
}

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
  
  // FASE 6: Stats & Realismo
  stats?: PlayerStats;
  condition?: number; // 0-100 (Energía/Fatiga)
  isInjured?: boolean;
  injuryWeeksRemaining?: number;
  isSuspended?: boolean;
  suspensionWeeksRemaining?: number;
}

export enum LeagueId {
  PREMIER_LEAGUE = 'PREMIER_LEAGUE',
  CHAMPIONSHIP = 'CHAMPIONSHIP',
  LA_LIGA = 'LA_LIGA',
  SEGUNDA_DIVISION_ESP = 'SEGUNDA_DIVISION_ESP',
  BUNDESLIGA = 'BUNDESLIGA',
  ZWEITE_BUNDESLIGA = 'ZWEITE_BUNDESLIGA',
  SERIE_A = 'SERIE_A',
  SERIE_B_ITA = 'SERIE_B_ITA',
  LIGUE_1 = 'LIGUE_1',
  LIGUE_2 = 'LIGUE_2',
  LIGA_ARGENTINA = 'LIGA_ARGENTINA',
  PRIMERA_NACIONAL = 'PRIMERA_NACIONAL',
  BRASILEIRAO = 'BRASILEIRAO',
  SERIE_B_BR = 'SERIE_B_BR'
}

export type CountryCode = 'ENG' | 'ESP' | 'GER' | 'ITA' | 'FRA' | 'ARG' | 'BRA';

export const LEAGUE_COUNTRY: Record<LeagueId, CountryCode> = {
  [LeagueId.PREMIER_LEAGUE]: 'ENG',
  [LeagueId.CHAMPIONSHIP]: 'ENG',
  [LeagueId.LA_LIGA]: 'ESP',
  [LeagueId.SEGUNDA_DIVISION_ESP]: 'ESP',
  [LeagueId.BUNDESLIGA]: 'GER',
  [LeagueId.ZWEITE_BUNDESLIGA]: 'GER',
  [LeagueId.SERIE_A]: 'ITA',
  [LeagueId.SERIE_B_ITA]: 'ITA',
  [LeagueId.LIGUE_1]: 'FRA',
  [LeagueId.LIGUE_2]: 'FRA',
  [LeagueId.LIGA_ARGENTINA]: 'ARG',
  [LeagueId.PRIMERA_NACIONAL]: 'ARG',
  [LeagueId.BRASILEIRAO]: 'BRA',
  [LeagueId.SERIE_B_BR]: 'BRA'
};

export interface Team {
  id: number;
  name: string;
  logo: string;
  leagueId: LeagueId; // Added for multi-league support
  budget: number; // Main budget in millions
  transferBudget: number; // Transfer budget in millions
  squad: Player[];
  tier: 'Top' | 'Mid' | 'Lower';
  teamMorale: Morale;
  primaryColor: string;
  secondaryColor: string;
  coach?: Coach; // Added for Phase 2: Sports Delegation
  trophyCabinet?: Trophy[]; // Added for Phase 3: Trophies
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
  
  // Tactical Profile
  preferredFormation: '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2';
  youthDevelopment: number; // 1-100 (affects academy usage)
  riskTolerance: number; // 1-100 (affects rotations)
  
  // DT AI & Satisfaction
  satisfactionLevel: number; // 1-100
  requestedSignings: CoachRequest[];
  tacticalNotes: string;
}

export interface CoachRequest {
  id: string;
  position: Player['position'];
  minRating: number;
  reason: string;
  priority: 'critical' | 'important' | 'nice_to_have';
}

export interface Scout {
  id: string;
  name: string;
  efficiency: number; // 1-100, how fast they scout
  accuracy: number;   // 1-100, how narrow the rating range is
  specialty?: 'POR' | 'DEF' | 'CEN' | 'DEL' | 'Youth';
  salary: number;
  hiringFee: number;
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
  type?: 'standard' | 'transfer' | 'achievement' | 'warning';
}

export interface MatchScorer {
  playerId: number;
  playerName: string;
  minute: number;
}

export interface Match {
  week: number;
  homeTeamId: number;
  awayTeamId: number;
  result?: { 
    homeScore: number; 
    awayScore: number; 
    events?: string[];
    scorers?: MatchScorer[];
  };
  competition?: 'League' | 'FA_Cup' | 'Carabao_Cup' | 'Copa_Del_Rey' | 'DFB_Pokal' | 'Coppa_Italia' | 'Champions_League' | 'Europa_League' | 'Copa_Libertadores' | 'Copa_Intercontinental'; // Added to distinguish match types
  isCupMatch?: boolean;
  isMidweek?: boolean; // True for matches played on a midweek turn
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

export interface EuropeanTableRow {
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
}

export interface EuropeanCompetition {
  id: string;
  name: string;
  participants: number[]; // team IDs
  leagueTable: EuropeanTableRow[];
  leagueFixtures: Match[]; // Swiss format matches
  knockoutRounds: CupRound[];
  currentPhase: 'league' | 'playoff' | 'knockout' | 'finished';
  currentRoundIndex: number; // for knockouts
  winnerId?: number;
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
  type: 'league_position' | 'trophy' | 'stadium' | 'transfer' | 'finances';
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
  constructionWeeksRemaining?: number; // Semanas para terminar obra
  facilityLevel: number;        // 1-5 (afecta a ingresos VIP y servicios)
}

export interface Sponsor {
  id: string;
  name: string;
  type: 'shirt' | 'stadium' | 'training' | 'kit';
  logo?: string;
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
  tvRevenue: number;            // Derechos de TV
  prizeMoneyRevenue: number;    // Premios de liga/copa
  transferRevenue: number;      // Ventas de jugadores

  // Gastos
  wageExpenses: number;         // Salarios jugadores
  coachExpenses: number;        // Salario DT
  stadiumExpenses: number;      // Mantenimiento estadio
  operationalExpenses: number;  // Gastos operativos generales
  transferExpenses: number;     // Compras de jugadores
}


export interface CinematicEvent {
  id: string;
  type: 'LEAGUE_WIN' | 'CUP_WIN' | 'PROMOTION' | 'RELEGATION' | 'SEASON_SUMMARY';
  title: string;
  subtitle: string;
  metadata?: any;
}

export interface GameState {
  team: Team;
  allTeams: Team[];
  currentDate: Date;
  currentWeek: number;
  currentTurn: 'weekend' | 'midweek'; // New time structure
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


  viewingPlayer: Player | null;
  incomingOffers: Offer[];
  cups: {
    faCup: CupCompetition;
    carabaoCup: CupCompetition;
    copaDelRey: CupCompetition;
    dfbPokal: CupCompetition;
    coppaItalia: CupCompetition;
    championsLeague: CupCompetition;
    europaLeague: CupCompetition;
    copaLibertadores: CupCompetition;
    copaIntercontinental: CupCompetition;
  };
  availableCoaches: Coach[]; // Market of available coaches
  // New Fields for Academy & Regens
  playerProfile?: PlayerProfile;
  youthAcademy: Player[];
  season: number;
  // Scouting System
  scouts: Scout[];
  scoutedPlayerIds: Record<number, number>; // playerId -> scoutingLevel (0-100)
  cinematicQueue: CinematicEvent[];
  preferredCurrency: 'EUR' | 'USD'; // Added for Phase 7
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
  Club = 'CLUB',
  Sponsorships = 'PATROCINIOS',
  Stadium = 'ESTADIO',
  Trophies = 'TROFEOS',
}

export type MatchPhase = 'PRE' | 'LIVE' | 'POST';

export interface CoachReport {
    summary: string;
    satisfaction: number;
    requests: CoachRequest[];
    tacticalUpdate: string;
    promotions: Player[]; 
}

export interface PendingSimulationResults {
    newsToAdd: NewsItem[];
    updatedSchedule: Match[];
    updatedLeagueTables: Record<LeagueId, LeagueTableRow[]>;
    updatedAllTeams: Team[];
    confidenceChange: number;
    newOffers: Offer[];
    playerMatchResult: { homeScore: number; awayScore: number, penalties?: { home: number, away: number }, events?: string[] } | null;
    updatedCups?: { faCup: any, carabaoCup: any };
    updatedScoutedPlayerIds?: Record<number, number>;
    coachReport?: CoachReport;
}
