import { Morale } from './types';

// --- Helper Functions ---
export const formatDate = (date: Date): string => date.toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

export let GLOBAL_CURRENCY: 'EUR' | 'USD' = 'EUR';

export const setGlobalCurrency = (currency: 'EUR' | 'USD') => {
    GLOBAL_CURRENCY = currency;
};

export const formatCurrency = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat(GLOBAL_CURRENCY === 'EUR' ? 'es-ES' : 'en-US', {
        style: 'currency',
        currency: GLOBAL_CURRENCY,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

export const formatCurrencyShort = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat(GLOBAL_CURRENCY === 'EUR' ? 'es-ES' : 'en-US', {
        style: 'currency',
        currency: GLOBAL_CURRENCY,
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    }).format(amount || 0);
};

export const formatWeeklyWage = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat(GLOBAL_CURRENCY === 'EUR' ? 'es-ES' : 'en-US', {
        style: 'currency',
        currency: GLOBAL_CURRENCY,
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

// Morale Helpers removed as they are now in services/morale.ts
export const getNextTransferWindow = (currentWeek: number): string => {
    if (currentWeek > 4 && currentWeek < 20) return "Mercado de Invierno (Semana 20)";
    if (currentWeek > 24) return "Mercado de Verano (Fin de temporada)";
    return "Abierto ahora";
};

export const isTransferWindowOpen = (currentWeek: number): boolean => {
    // Summer transfer window: Weeks 0 to 4
    if (currentWeek >= 0 && currentWeek <= 4) return true;
    // Winter transfer window: Weeks 20 to 24 (mid season)
    if (currentWeek >= 20 && currentWeek <= 24) return true;
    
    return false;
};
