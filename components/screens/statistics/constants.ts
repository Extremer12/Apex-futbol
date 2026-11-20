import { CompetitionItem } from '../league/constants';

export const COUNTRY_FLAGS: Record<string, string> = {
    'Argentina': '🇦🇷',
    'Brasil': '🇧🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Paraguay': '🇵🇾',
    'México': '🇲🇽',
    'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'España': '🇪🇸',
    'Alemania': '🇩🇪',
    'Italia': '🇮🇹',
    'Francia': '🇫🇷',
};

export const REGION_TABS = [
    { id: 'ALL', label: 'Todos (32)' },
    { id: 'SUDAMERICA', label: '🌎 Sudamérica y México' },
    { id: 'EUROPA', label: '🌍 Europa' },
    { id: 'INT', label: '🏆 Internacionales' },
];

export const getCompBadge = (c: CompetitionItem) => {
    if (c.category === 'INTERNATIONAL') {
        return { label: 'Continental', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
    if (c.type === 'CUP') {
        return { label: 'Copa Nacional', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    if (c.isFirstDiv) {
        return { label: '1ª División', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    }
    return { label: '2ª División', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
};
