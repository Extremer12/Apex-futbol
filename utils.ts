import { Morale } from './types';

// --- Helper Functions ---
export const formatDate = (date: Date): string => date.toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatCurrency = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

export const formatCurrencyShort = (amount: number | undefined | null): string => {
    const val = amount || 0;
    if (Math.abs(val) >= 1000000) {
        return `£${(val / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1000) {
        return `£${(val / 1000).toFixed(0)}K`;
    }
    return `£${val}`;
};

export const formatWeeklyWage = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

// --- Name Generation for Regens ---
const FIRST_NAMES = [
    'Hugo', 'Mateo', 'Martín', 'Lucas', 'Leo', 'Daniel', 'Alejandro', 'Manuel', 'Pablo', 'Álvaro',
    'Adrián', 'Enzo', 'Mario', 'Diego', 'David', 'Oliver', 'Marcos', 'Thiago', 'Marco', 'Alex',
    'Javier', 'Izan', 'Bruno', 'Miguel', 'Antonio', 'Gonzalo', 'Liam', 'Gael', 'Marc', 'Carlos',
    'Juan', 'Ángel', 'Dylan', 'Nicolás', 'José', 'Sergio', 'Gabriel', 'Luca', 'Jorge', 'Darío',
    'Íker', 'Samuel', 'Eric', 'Adam', 'Héctor', 'Francisco', 'Rodrigo', 'Jesús', 'Pau', 'Jaime'
];

const SURNAMES = [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martin',
    'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
    'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Molina',
    'Morales', 'Suárez', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Nuñez',
    'Iglesias', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto'
];

export const generateRandomName = (): string => {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    return `${first} ${last}`;
};

// --- Morale Helpers ---
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

export function getMoraleLabel(value: number): Morale {
    if (value >= 85) return 'Feliz';
    if (value >= 65) return 'Contento';
    if (value >= 40) return 'Normal';
    if (value >= 20) return 'Descontento';
    return 'Enojado';
}
