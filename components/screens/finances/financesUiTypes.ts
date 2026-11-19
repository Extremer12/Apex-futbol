import { Sponsor } from '../../../types';
import { Shirt, Tag, Building2, Zap } from 'lucide-react';

export type TabKey = 'overview' | 'sponsors' | 'strategy' | 'banking' | 'stadium';

export interface SponsorSlotMeta {
    type: Sponsor['type'];
    title: string;
    subtitle: string;
    icon: any;
    accentColor: string;
}

export const SPONSOR_SLOTS: SponsorSlotMeta[] = [
    {
        type: 'shirt',
        title: 'Camiseta Principal',
        subtitle: 'Patrocinador Maestro en Pecho',
        icon: Shirt,
        accentColor: '#38BDF8'
    },
    {
        type: 'kit',
        title: 'Proveedor Técnico',
        subtitle: 'Marca Oficial de Indumentaria',
        icon: Tag,
        accentColor: '#A78BFA'
    },
    {
        type: 'stadium',
        title: 'Naming Estadio',
        subtitle: 'Derechos de Nombre de la Cancha',
        icon: Building2,
        accentColor: '#F59E0B'
    },
    {
        type: 'training',
        title: 'Manga & Instalaciones',
        subtitle: 'Manga de Juego y Complejo Deportivo',
        icon: Zap,
        accentColor: '#10B981'
    }
];

export const getSectorLabel = (sector?: string): string => {
    switch (sector) {
        case 'airline': return 'Aerolínea & Viajes';
        case 'tech': return 'Tecnología & Digital';
        case 'betting': return 'Apuestas & Casino';
        case 'apparel': return 'Indumentaria Deportiva';
        case 'banking': return 'Banca & Finanzas';
        case 'beverage': return 'Bebidas & Consumo';
        case 'automotive': return 'Automotriz & Motor';
        default: return 'Corporativo';
    }
};
