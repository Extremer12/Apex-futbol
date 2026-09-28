import { Coach, StaffMember, StaffRole, Scout } from '../../../types';

export type TabKey = 'overview' | 'coach' | 'medical_performance' | 'sports_academy' | 'scouts';

export interface ModalHireState {
    type: 'coach' | 'staff' | 'scout';
    candidate: Coach | StaffMember | Scout;
    currentHolder?: Coach | StaffMember | null;
}

export interface ModalFireState {
    type: 'coach' | 'staff' | 'scout';
    member: Coach | StaffMember | Scout;
    role?: StaffRole;
    severanceCost: number;
}

export const DEFAULT_SCOUT_CANDIDATES: Scout[] = [
    { id: 'scout_cand_1', name: 'Marco Rossi', efficiency: 88, accuracy: 82, specialty: 'CEN', salary: 14000, hiringFee: 60000 },
    { id: 'scout_cand_2', name: 'Hans Müller', efficiency: 74, accuracy: 94, specialty: 'DEF', salary: 16000, hiringFee: 85000 },
    { id: 'scout_cand_3', name: 'Juan García', efficiency: 95, accuracy: 72, specialty: 'DEL', salary: 13000, hiringFee: 55000 },
    { id: 'scout_cand_4', name: 'Sarah Smith', efficiency: 80, accuracy: 86, specialty: 'Youth', salary: 19000, hiringFee: 110000 },
    { id: 'scout_cand_5', name: 'Tariq Al-Fayed', efficiency: 85, accuracy: 88, salary: 21000, hiringFee: 125000 },
];

export const getPowerBadgeClass = (power: number): string => {
    if (power >= 90) return 'text-amber-300 bg-amber-500/20 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
    if (power >= 80) return 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
    if (power >= 70) return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/40';
    if (power >= 60) return 'text-yellow-300 bg-yellow-500/20 border-yellow-400/40';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
};

export const getPowerTierLabel = (power: number): string => {
    if (power >= 90) return 'Élite Mundial';
    if (power >= 80) return 'Primera Línea';
    if (power >= 70) return 'Competente';
    if (power >= 60) return 'Básico';
    return 'Deficiente';
};
