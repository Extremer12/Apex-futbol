import { Morale } from '../types';

/**
 * Converts a Morale string to a numerical value for calculations.
 */
export function getMoraleValue(morale: Morale): number {
    switch (morale) {
        case 'Feliz': return 90;
        case 'Contento': return 75;
        case 'Normal': return 50;
        case 'Descontento': return 25;
        case 'Enojado': return 10;
        default: return 50;
    }
}

/**
 * Converts a numerical morale value back to a Morale label.
 */
export function getMoraleLabel(value: number): Morale {
    if (value >= 85) return 'Feliz';
    if (value >= 65) return 'Contento';
    if (value >= 40) return 'Normal';
    if (value >= 20) return 'Descontento';
    return 'Enojado';
}

/**
 * Updates team morale based on match results.
 */
export function updateTeamMorale(currentMorale: Morale, result: 'W' | 'D' | 'L'): Morale {
    let change = 0;
    if (result === 'W') change = 5;
    else if (result === 'D') change = 0;
    else change = -5;

    const currentValue = getMoraleValue(currentMorale);
    const newValue = Math.max(0, Math.min(100, currentValue + change));

    return getMoraleLabel(newValue);
}
