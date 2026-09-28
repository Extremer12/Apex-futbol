import { GameState, NewsItem } from '../../types';
import { generateRandomCoach } from '../../services/coaching';
import { generateStaffMember } from '../../services/staffService';
import { formatDate, formatCurrency } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type StaffAction = Extract<GameAction,
    | { type: 'HIRE_COACH' }
    | { type: 'FIRE_COACH' }
    | { type: 'HIRE_STAFF' }
    | { type: 'FIRE_STAFF' }
    | { type: 'HIRE_SCOUT' }
    | { type: 'FIRE_SCOUT' }
    | { type: 'SCOUT_PLAYER' }
>;

export function handleStaffAction(state: GameState, action: StaffAction): GameState {
    switch (action.type) {
        case 'HIRE_COACH': {
            const { coachId } = action.payload;
            const coachToHire = (state.availableCoaches || []).find(c => c.id === coachId);

            if (!coachToHire) return state;

            // Check budget
            if (state.finances.balance < coachToHire.signingBonus) {
                return state;
            }

            const newBalance = state.finances.balance - coachToHire.signingBonus;

            // Update team
            const newTeam = { ...state.team, coach: coachToHire };
            const newAllTeams = state.allTeams.map(t => t.id === newTeam.id ? newTeam : t);

            // Remove from market & add new coach
            const remainingCoaches = (state.availableCoaches || []).filter(c => c.id !== coachId);
            const newMarket = [...remainingCoaches, generateRandomCoach(state.team.tier)];

            return {
                ...state,
                team: newTeam,
                allTeams: newAllTeams,
                availableCoaches: newMarket,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `hire_coach_${Date.now()}`,
                    headline: '👔 Nuevo Director Técnico',
                    body: `El club ha contratado a ${coachToHire.name} (Poder: ${coachToHire.prestige}). Su estilo táctico ${coachToHire.style} promete potenciar el rendimiento del equipo.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'FIRE_COACH': {
            if (!state.team.coach) return state;

            const coach = state.team.coach;
            const severancePay = coach.salary * 4; // 1 month severance
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
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `fire_coach_${Date.now()}`,
                    headline: '👋 Salida del Director Técnico',
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
            const currentStaff = state.clubStaff || {};

            let updatedStaff = { ...currentStaff };
            let roleLabel = 'Especialista';

            if (candidate.role === 'doctor') {
                updatedStaff.doctor = candidate;
                roleLabel = 'Jefe Médico';
            } else if (candidate.role === 'fitness_coach') {
                updatedStaff.fitnessCoach = candidate;
                roleLabel = 'Preparador Físico';
            } else if (candidate.role === 'sporting_director') {
                updatedStaff.sportingDirector = candidate;
                roleLabel = 'Director Deportivo';
            } else if (candidate.role === 'youth_coach') {
                updatedStaff.youthCoach = candidate;
                roleLabel = 'Director de Cantera';
            }

            const updatedTeam = { ...state.team, clubStaff: updatedStaff };
            const updatedAllTeams = state.allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);

            // Replace hired candidate in market with fresh one
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
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `hire_staff_${Date.now()}`,
                    headline: `📋 Nuevo ${roleLabel} Contratado`,
                    body: `${candidate.name} (Poder: ${candidate.power}) se incorpora como ${roleLabel}. Especialidad: ${candidate.specialty || 'Generalista'}.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'FIRE_STAFF': {
            const { role } = action.payload;
            const currentStaff = state.clubStaff || {};
            let staffToFire = currentStaff[role === 'fitness_coach' ? 'fitnessCoach' : role === 'sporting_director' ? 'sportingDirector' : role === 'youth_coach' ? 'youthCoach' : 'doctor'];
            if (!staffToFire) return state;

            const severancePay = staffToFire.salary * 2; // 2 weeks severance
            const newBalance = state.finances.balance - severancePay;

            let updatedStaff = { ...currentStaff };
            if (role === 'doctor') updatedStaff.doctor = undefined;
            else if (role === 'fitness_coach') updatedStaff.fitnessCoach = undefined;
            else if (role === 'sporting_director') updatedStaff.sportingDirector = undefined;
            else if (role === 'youth_coach') updatedStaff.youthCoach = undefined;

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
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [{
                    id: `fire_staff_${Date.now()}`,
                    headline: '👋 Rescisión de Personal',
                    body: `El club ha rescindido los servicios de ${staffToFire.name}. El puesto queda vacante en el organigrama del club.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'HIRE_SCOUT': {
            const scout = action.payload;
            if (state.scouts.length >= 3) return state;
            if (state.finances.balance < scout.hiringFee) return state;

            return {
                ...state,
                scouts: [...state.scouts, scout],
                finances: {
                    ...state.finances,
                    balance: state.finances.balance - scout.hiringFee,
                    balanceHistory: [...state.finances.balanceHistory, state.finances.balance - scout.hiringFee]
                },
                newsFeed: [{
                    id: `hire_scout_${Date.now()}`,
                    headline: '🔍 Nuevo Scout Contratado',
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
                newsFeed: [{
                    id: `fire_scout_${Date.now()}`,
                    headline: '👋 Ojeador Desvinculado',
                    body: `${scout.name} ha finalizado sus funciones de ojeo en el club.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'SCOUT_PLAYER': {
            const { playerId } = action.payload;
            const currentLevel = state.scoutedPlayerIds[playerId] || 0;

            const scoutingCost = 0.1;
            if (state.finances.balance < scoutingCost) return state;

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: state.finances.balance - scoutingCost,
                    balanceHistory: [...state.finances.balanceHistory, state.finances.balance - scoutingCost]
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
