import { StaffRole } from '../../../types';

export type StaffTabKey = 'ORGANIGRAM' | 'SCOUTING' | 'MEDICAL';

export interface ModalFireState {
    type: 'coach' | 'staff' | 'scout';
    name: string;
    role?: StaffRole;
    roleLabel: string;
    scoutId?: string;
    weeklySalary: number;
    severanceCost: number;
}

export const STYLE_ES: Record<string, string> = {
    Attacking: 'Ofensivo',
    Defensive: 'Defensivo',
    Possession: 'Posesión',
    Counter: 'Contraataque',
    Balanced: 'Equilibrado',
};
