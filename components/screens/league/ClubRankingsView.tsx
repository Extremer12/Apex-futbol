import React, { useState, useMemo } from 'react';
import { GameState } from '../../../types';
import { 
    getResolvedConmebolRankings, 
    getResolvedUefaRankings, 
    ConmebolClubRankingItem, 
    UefaClubRankingItem 
} from '../../../data/clubRankings';
import { 
    Trophy, 
    Globe, 
    Search, 
    Award, 
    Shield, 
    Info, 
    Sparkles, 
    ChevronRight,
    Star
} from 'lucide-react';

interface ClubRankingsViewProps {
    gameState: GameState;
    initialTab?: 'CONMEBOL' | 'UEFA';
}

export const ClubRankingsView: React.FC<ClubRankingsViewProps> = ({ gameState, initialTab = 'CONMEBOL' }) => {
    const [rankingType, setRankingType] = useState<'CONMEBOL' | 'UEFA'>(() => {
        // If user manages European club, default to UEFA; if South American, CONMEBOL
        const isEuro = gameState.team.leagueId?.includes('PREMIER') || 
                      gameState.team.leagueId?.includes('LIGA') || 
                      gameState.team.leagueId?.includes('BUNDES') || 
                      gameState.team.leagueId?.includes('SERIE') || 
                      gameState.team.leagueId?.includes('LIGUE');
        return isEuro ? 'UEFA' : initialTab;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string>('ALL');

    const conmebolList = useMemo(() => getResolvedConmebolRankings(gameState), [gameState]);
    const uefaList = useMemo(() => getResolvedUefaRankings(gameState), [gameState]);

    const currentList = rankingType === 'CONMEBOL' ? conmebolList : uefaList;

    // Available countries for filter
    const availableCountries = useMemo(() => {
        const countriesMap = new Map<string, { code: string; name: string; flag: string }>();
        currentList.forEach(item => {
            if (!countriesMap.has(item.country)) {
                countriesMap.set(item.country, {
                    code: item.country,
                    name: item.countryName,
                    flag: item.flagUrl
                });
            }
        });
        return Array.from(countriesMap.values());
    }, [currentList]);

    // Filtered items
    const filteredList = useMemo(() => {
        return currentList.filter(item => {
            const matchesSearch = !searchQuery.trim() || 
                item.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.countryName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCountry = selectedCountry === 'ALL' || item.country === selectedCountry;
            return matchesSearch && matchesCountry;
        });
    }, [currentList, searchQuery, selectedCountry]);

    const userTeamId = gameState.team.id;
    const userTeamName = gameState.team.name.toLowerCase();

    const getPotBadge = (status: string) => {
        if (status.includes('Bombo 1') || status.includes('Cabeza')) {
            return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
        }
        if (status.includes('Bombo 2')) {
            return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
        }
        if (status.includes('Bombo 3')) {
            return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
        }
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header & Sub-navigation */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0e1629] via-[#0b101d] to-[#070a12] border border-white/10 p-4 sm:p-5 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--apex-gold)]/20 to-amber-500/10 border border-[var(--apex-gold)]/40 flex items-center justify-center text-[var(--apex-gold)] shadow-lg shrink-0">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                                    Rankings Oficiales de Clubes
                                </h2>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30">
                                    Oficial
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Clasificación oficial de coeficientes que define bombos y cabezas de serie en copas continentales
                            </p>
                        </div>
                    </div>

                    {/* Switcher CONMEBOL / UEFA */}
                    <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/10 shrink-0">
                        <button
                            onClick={() => { setRankingType('CONMEBOL'); setSelectedCountry('ALL'); }}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                rankingType === 'CONMEBOL'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>CONMEBOL</span>
                        </button>
                        <button
                            onClick={() => { setRankingType('UEFA'); setSelectedCountry('ALL'); }}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                                rankingType === 'UEFA'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md font-black'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>UEFA</span>
                        </button>
                    </div>
                </div>

                {/* Educational Banner */}
                <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2.5 text-xs text-slate-300">
                    <Info className="w-4 h-4 text-[var(--apex-gold)] shrink-0 mt-0.5" />
                    <div>
                        {rankingType === 'CONMEBOL' ? (
                            <span>
                                <strong>Criterio CONMEBOL:</strong> Evalúa el rendimiento histórico y reciente en Copa Libertadores y Copa Sudamericana. Los clubes del <strong>1 al 8</strong> son Cabezas de Serie en el sorteo (Bombo 1).
                            </span>
                        ) : (
                            <span>
                                <strong>Coeficiente UEFA (5 Años):</strong> Suma los puntos acumulados por victorias y fases superadas en Champions League, Europa League y Conference League. Determina los bombos del nuevo formato suizo de Champions y las plazas para el Mundial de Clubes FIFA.
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Bar: Search & Country Selector */}
            <div className="rounded-2xl bg-[#0c111d] border border-white/10 p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-md">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar club o país (ej. River, Real Madrid, Boca, City)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--apex-gold)] transition-colors"
                    />
                </div>

                {/* Country filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                    <button
                        onClick={() => setSelectedCountry('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                            selectedCountry === 'ALL'
                                ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        Todos ({currentList.length})
                    </button>
                    {availableCountries.map(c => (
                        <button
                            key={c.code}
                            onClick={() => setSelectedCountry(c.code)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors ${
                                selectedCountry === c.code
                                    ? 'bg-white/20 text-white border border-white/30'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                            }`}
                        >
                            {c.flag && <img src={c.flag} alt="" className="w-3.5 h-2.5 object-cover rounded-[1px]" />}
                            <span>{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* List / Table Content */}
            <div className="rounded-2xl bg-[#0b101c] border border-white/10 overflow-hidden shadow-xl">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-white/10">
                                <th className="px-4 py-3.5 text-center w-14">#</th>
                                <th className="px-4 py-3.5">Club</th>
                                <th className="px-4 py-3.5">País</th>
                                <th className="px-4 py-3.5 text-center">Títulos</th>
                                <th className="px-4 py-3.5 text-center">
                                    {rankingType === 'CONMEBOL' ? 'Puntos CONMEBOL' : 'Coeficiente UEFA'}
                                </th>
                                <th className="px-4 py-3.5 text-center">Estado de Sorteo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredList.map((item) => {
                                const isUserTeam = item.teamId === userTeamId || item.teamName.toLowerCase() === userTeamName;
                                const isTop8 = item.rank <= (rankingType === 'CONMEBOL' ? 8 : 9);

                                return (
                                    <tr 
                                        key={item.teamName}
                                        className={`transition-colors ${
                                            isUserTeam 
                                                ? 'bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)]/15 border-l-4 border-l-[var(--apex-gold)]' 
                                                : 'hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                                                item.rank === 1 ? 'bg-amber-400 text-black shadow-md' :
                                                item.rank === 2 ? 'bg-slate-300 text-black shadow-md' :
                                                item.rank === 3 ? 'bg-amber-700 text-white shadow-md' :
                                                isTop8 ? 'bg-white/10 text-white' : 'text-slate-500'
                                            }`}>
                                                {item.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 p-1 flex items-center justify-center shrink-0">
                                                    <img 
                                                        src={item.logoUrl || '/sinlogo.png'} 
                                                        alt="" 
                                                        className="w-full h-full object-contain" 
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-sm text-white flex items-center gap-2">
                                                        <span>{item.teamName}</span>
                                                        {isUserTeam && (
                                                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[var(--apex-gold)] text-black uppercase tracking-wider">
                                                                Tu Club
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {item.flagUrl && (
                                                    <img src={item.flagUrl} alt="" className="w-4 h-3 object-cover rounded-[2px]" />
                                                )}
                                                <span className="text-xs text-slate-300 font-medium">{item.countryName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {'libertadoresTitles' in item ? (
                                                <div className="flex items-center justify-center gap-2 text-xs">
                                                    {item.libertadoresTitles > 0 && (
                                                        <span className="flex items-center gap-1 text-amber-400 font-black" title={`${item.libertadoresTitles} Copas Libertadores`}>
                                                            <Trophy className="w-3.5 h-3.5 inline" /> {item.libertadoresTitles}
                                                        </span>
                                                    )}
                                                    {item.sudamericanaTitles > 0 && (
                                                        <span className="flex items-center gap-1 text-amber-600 font-bold" title={`${item.sudamericanaTitles} Copas Sudamericanas`}>
                                                            {item.sudamericanaTitles} Sud
                                                        </span>
                                                    )}
                                                    {item.libertadoresTitles === 0 && item.sudamericanaTitles === 0 && (
                                                        <span className="text-slate-600 text-[10px]">-</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-xs">
                                                    {(item as UefaClubRankingItem).championsTitles > 0 && (
                                                        <span className="flex items-center gap-1 text-indigo-400 font-black" title={`${(item as UefaClubRankingItem).championsTitles} Champions League`}>
                                                            <Star className="w-3.5 h-3.5 inline fill-indigo-400" /> {(item as UefaClubRankingItem).championsTitles}
                                                        </span>
                                                    )}
                                                    {(item as UefaClubRankingItem).europaTitles > 0 && (
                                                        <span className="flex items-center gap-1 text-orange-400 font-bold" title={`${(item as UefaClubRankingItem).europaTitles} Europa League`}>
                                                            {(item as UefaClubRankingItem).europaTitles} UEL
                                                        </span>
                                                    )}
                                                    {(item as UefaClubRankingItem).championsTitles === 0 && (item as UefaClubRankingItem).europaTitles === 0 && (
                                                        <span className="text-slate-600 text-[10px]">-</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-black text-sm text-[var(--apex-gold)] tracking-wide">
                                                {'points' in item ? item.points.toLocaleString() : (item as UefaClubRankingItem).coefficient.toFixed(3)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getPotBadge(item.potStatus)}`}>
                                                {item.potStatus}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Responsive Cards Layout (Zero Horizontal Scroll!) */}
                <div className="md:hidden divide-y divide-white/5">
                    {filteredList.map((item) => {
                        const isUserTeam = item.teamId === userTeamId || item.teamName.toLowerCase() === userTeamName;
                        const isTop8 = item.rank <= (rankingType === 'CONMEBOL' ? 8 : 9);

                        return (
                            <div 
                                key={item.teamName}
                                className={`p-3.5 transition-colors ${
                                    isUserTeam 
                                        ? 'bg-[var(--apex-gold)]/10 border-l-4 border-l-[var(--apex-gold)]' 
                                        : 'hover:bg-white/[0.03]'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black shrink-0 ${
                                            item.rank === 1 ? 'bg-amber-400 text-black shadow-sm' :
                                            item.rank === 2 ? 'bg-slate-300 text-black shadow-sm' :
                                            item.rank === 3 ? 'bg-amber-700 text-white shadow-sm' :
                                            isTop8 ? 'bg-white/10 text-white' : 'text-slate-500'
                                        }`}>
                                            {item.rank}
                                        </span>
                                        <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 p-0.5 flex items-center justify-center shrink-0">
                                            <img 
                                                src={item.logoUrl || '/sinlogo.png'} 
                                                alt="" 
                                                className="w-full h-full object-contain" 
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { e.currentTarget.src = '/sinlogo.png'; }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-black text-xs text-white truncate flex items-center gap-1.5">
                                                <span>{item.teamName}</span>
                                                {isUserTeam && (
                                                    <span className="text-[7px] font-black px-1 py-0.2 rounded bg-[var(--apex-gold)] text-black uppercase shrink-0">
                                                        Tú
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                                {item.flagUrl && (
                                                    <img src={item.flagUrl} alt="" className="w-3 h-2 object-cover rounded-[1px]" />
                                                )}
                                                <span>{item.countryName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Points Badge */}
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-black text-[var(--apex-gold)]">
                                            {'points' in item ? item.points.toLocaleString() : (item as UefaClubRankingItem).coefficient.toFixed(3)} pts
                                        </div>
                                        <div className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">
                                            {rankingType === 'CONMEBOL' ? 'Ranking' : 'Coeficiente'}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Pot Status & Continental Titles */}
                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${getPotBadge(item.potStatus)}`}>
                                        {item.potStatus}
                                    </span>

                                    <div className="flex items-center gap-2 text-[10px]">
                                        {'libertadoresTitles' in item ? (
                                            <>
                                                {item.libertadoresTitles > 0 && (
                                                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                                        <Trophy className="w-3 h-3 inline" /> {item.libertadoresTitles} Lib
                                                    </span>
                                                )}
                                                {item.sudamericanaTitles > 0 && (
                                                    <span className="text-amber-600 font-semibold">
                                                        {item.sudamericanaTitles} Sud
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {(item as UefaClubRankingItem).championsTitles > 0 && (
                                                    <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                                                        <Star className="w-3 h-3 inline fill-indigo-400" /> {(item as UefaClubRankingItem).championsTitles} UCL
                                                    </span>
                                                )}
                                                {(item as UefaClubRankingItem).europaTitles > 0 && (
                                                    <span className="text-orange-400 font-semibold">
                                                        {(item as UefaClubRankingItem).europaTitles} UEL
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredList.length === 0 && (
                    <div className="py-16 text-center text-slate-400 text-xs">
                        No se encontraron clubes que coincidan con la búsqueda.
                    </div>
                )}
            </div>
        </div>
    );
};
