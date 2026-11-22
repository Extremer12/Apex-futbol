import { GameState } from '../../types';
import { generateRandomCoach, generateCoachMarket } from '../../services/coaching';
import { generateStaffMember, generateStaffMarket, generateScout, generateScoutMarket } from '../../services/staffService';
import { formatDate } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type StaffAction = Extract<GameAction,
    | { type: 'HIRE_COACH' }
    | { type: 'FIRE_COACH' }
    | { type: 'HIRE_STAFF' }
    | { type: 'FIRE_STAFF' }
    | { type: 'HIRE_SCOUT' }
    | { type: 'FIRE_SCOUT' }
    | { type: 'REFRESH_STAFF_MARKET' }
    | { type: 'SCOUT_PLAYER' }
>;

const STAFF_KEY_BY_ROLE = {
    doctor: 'doctor',
    fitness_coach: 'fitnessCoach',
    sporting_director: 'sportingDirector',
    youth_coach: 'youthCoach',
} as const;

const STAFF_LABEL_BY_ROLE = {
    doctor: 'Jefe Médico',
    fitness_coach: 'Preparador Físico',
    sporting_director: 'Director Deportivo',
    youth_coach: 'Director de Cantera',
} as const;

export function handleStaffAction(state: GameState, action: StaffAction): GameState {
    switch (action.type) {
        case 'HIRE_COACH': {
            const { coachId } = action.payload;
            const coachToHire = (state.availableCoaches || []).find(c => c.id === coachId);
            if (!coachToHire) return state;

            if (state.finances.balance < coachToHire.signingBonus) {
                return state;
            }

            const newBalance = state.finances.balance - coachToHire.signingBonus;
            const salaryDelta = coachToHire.salary - (state.team.coach?.salary ?? 0);

            const newTeam = { ...state.team, coach: coachToHire };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            const remainingCoaches = (state.availableCoaches || []).filter(c => c.id !== coachId);
            const newMarket = [...remainingCoaches, generateRandomCoach(state.team.tier, state.team.leagueId)];

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                availableCoaches: newMarket,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    weeklyWages: Math.max(0, state.finances.weeklyWages + salaryDelta),
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `hire_coach_${Date.now()}`,
                    headline: 'Nuevo Director Técnico',
                    body: `El club ha contratado a ${coachToHire.name} (Poder: ${coachToHire.prestige}). Su estilo táctico ${coachToHire.style} promete potenciar el rendimiento del equipo.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'FIRE_COACH': {
            if (!state.team.coach) return state;

            const coach = state.team.coach;
            const severancePay = coach.salary * 4; // 4 weeks severance
            const newBalance = state.finances.balance - severancePay;

            const newTeam = { ...state.team, coach: undefined };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    weeklyWages: Math.max(0, state.finances.weeklyWages - coach.salary),
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `fire_coach_${Date.now()}`,
                    headline: 'Salida del Director Técnico',
                    body: `El club ha rescindido el contrato de ${coach.name}. La junta directiva asume interinamente la conducción a la espera de un nuevo estratega.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'HIRE_STAFF': {
            const { staffId } = action.payload;
            const candidate = (state.availableStaff || []).find(s => s.id === staffId);
            if (!candidate) return state;

            if (state.finances.balance < candidate.hiringFee) return state;

            const newBalance = state.finances.balance - candidate.hiringFee;
            const currentStaff = state.clubStaff || state.team.clubStaff || {};
            const staffKey = STAFF_KEY_BY_ROLE[candidate.role];
            const roleLabel = STAFF_LABEL_BY_ROLE[candidate.role];
            const previousHolder = currentStaff[staffKey];
            const salaryDelta = candidate.salary - (previousHolder?.salary ?? 0);

            const updatedStaff = { ...currentStaff, [staffKey]: candidate };
            const updatedTeam = { ...state.team, clubStaff: updatedStaff };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            const remainingStaff = (state.availableStaff || []).filter(s => s.id !== staffId);
            const freshCandidate = generateStaffMember(candidate.role, state.team.tier, state.team.leagueId);

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                clubStaff: updatedStaff,
                availableStaff: [...remainingStaff, freshCandidate],
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    weeklyWages: Math.max(0, state.finances.weeklyWages + salaryDelta),
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `hire_staff_${Date.now()}`,
                    headline: `Nuevo ${roleLabel} Contratado`,
                    body: `${candidate.name} (Poder: ${candidate.power}) se incorpora como ${roleLabel}. Especialidad: ${candidate.specialty || 'Generalista'}.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'FIRE_STAFF': {
            const { role } = action.payload;
            const currentStaff = state.clubStaff || state.team.clubStaff || {};
            const staffKey = STAFF_KEY_BY_ROLE[role];
            const staffToFire = currentStaff[staffKey];
            if (!staffToFire) return state;

            const severancePay = staffToFire.salary * 2; // 2 weeks severance
            const newBalance = state.finances.balance - severancePay;

            const updatedStaff = { ...currentStaff, [staffKey]: undefined };
            const updatedTeam = { ...state.team, clubStaff: updatedStaff };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            return {
                ...state,
                team: updatedTeam,
                allTeams: updatedAllTeams,
                clubStaff: updatedStaff,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    weeklyWages: Math.max(0, state.finances.weeklyWages - staffToFire.salary),
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `fire_staff_${Date.now()}`,
                    headline: 'Rescisión de Personal',
                    body: `El club ha rescindido los servicios de ${staffToFire.name}. El puesto queda vacante en el organigrama del club.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'HIRE_SCOUT': {
            const scout = action.payload;
            if (state.scouts.length >= 3) return state;
            if (state.scouts.some(s => s.id === scout.id)) return state;
            if (state.finances.balance < scout.hiringFee) return state;

            const newBalance = state.finances.balance - scout.hiringFee;
            const currentAvailable = state.availableScouts || [];
            const updatedAvailableScouts = currentAvailable.some(s => s.id === scout.id)
                ? [
                    ...currentAvailable.filter(s => s.id !== scout.id),
                    generateScout(state.team.tier, state.team.leagueId, scout.specialty)
                ]
                : currentAvailable;

            return {
                ...state,
                scouts: [...state.scouts, scout],
                availableScouts: updatedAvailableScouts,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    weeklyWages: Math.max(0, state.finances.weeklyWages + scout.salary),
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `hire_scout_${Date.now()}`,
                    headline: 'Nuevo Ojeador Contratado',
                    body: `${scout.name} se une al equipo para expandir nuestra red de ojeo.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'FIRE_SCOUT': {
            const { scoutId } = action.payload;
            const scout = state.scouts.find(s => s.id === scoutId);
            if (!scout) return state;

            return {
                ...state,
                scouts: state.scouts.filter(s => s.id !== scoutId),
                finances: {
                    ...state.finances,
                    weeklyWages: Math.max(0, state.finances.weeklyWages - scout.salary),
                },
                newsFeed: [{
                    id: `fire_scout_${Date.now()}`,
                    headline: 'Ojeador Desvinculado',
                    body: `${scout.name} ha finalizado sus funciones de ojeo en el club.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'REFRESH_STAFF_MARKET': {
            if (state.lastStaffMarketRefreshWeek === state.currentWeek) {
                return state;
            }
            return {
                ...state,
                availableCoaches: generateCoachMarket(5, state.team.leagueId, state.team.tier),
                availableStaff: generateStaffMarket(state.team.tier, state.team.leagueId),
                availableScouts: generateScoutMarket(state.team.tier, state.team.leagueId),
                lastStaffMarketRefreshWeek: state.currentWeek,
            };
        }

        case 'SCOUT_PLAYER': {
            const { playerId } = action.payload;
            const currentLevel = state.scoutedPlayerIds[playerId] || 0;

            const scoutingCost = state.team.tier === 'Top' ? 25000 : state.team.tier === 'Mid' ? 12000 : 5000;
            if (state.finances.balance < scoutingCost) return state;

            const newBalance = state.finances.balance - scoutingCost;
            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                scoutedPlayerIds: {
                    ...state.scoutedPlayerIds,
                    [playerId]: Math.min(100, currentLevel + 25)
                }
            };
        }

        default:
            return state;
    }
}
