import React, { useState, useMemo } from 'react';
import { Player, Team, GameState } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { PlayerPhoto } from '../../../data/teams/helpers';
import { formatTransferFee, formatWeeklyWage } from '../../../utils';
import { getPlayerAge } from '../../../utils/playerUtils';
import { getCountryMeta, resolvePlayerNationality } from '../../../services/nationalityService';
import { Search, X, Tag, Zap, ChevronRight, Users, Lock } from 'lucide-react';
import { useToast } from '../../common/ToastProvider';
import { BottomSheet, OvrBadge, StatCell, EmptyState, positionLabel } from './TransferUI';

interface TransfersSquadTabProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    myTeam: Team;
    onSwitchToOffers: () => void;
}

export const TransfersSquadTab: React.FC<TransfersSquadTabProps> = React.memo(({ gameState, dispatch, myTeam, onSwitchToOffers }) => {
    const { showToast } = useToast();
    const [query, setQuery] = useState('');
    const [view, setView] = useState<'ALL' | 'LISTED' | 'UNTOUCHABLE'>('ALL');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const allMyPlayers = useMemo(() => {
        const first = (myTeam.squad || []).map(p => ({ player: p, division: '1º Equipo' as const }));
        const res = (gameState.youthAcademy || []).map(p => ({ player: p, division: 'Reserva' as const }));
        return [...first, ...res];
    }, [myTeam.squad, gameState.youthAcademy]);

    const listedCount = allMyPlayers.filter(x => x.player.isTransferListed).length;
    const untouchableCount = allMyPlayers.filter(x => x.player.isUntouchable).length;
    const selectedEntry = allMyPlayers.find(x => x.player.id === selectedId) || null;
    const selected = selectedEntry?.player || null;

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        return allMyPlayers
            .filter(({ player: p }) => {
                if (q && !p.name.toLowerCase().includes(q)) return false;
                if (view === 'LISTED' && !p.isTransferListed) return false;
                if (view === 'UNTOUCHABLE' && !p.isUntouchable) return false;
                return true;
            })
            .sort((a, b) => b.player.rating - a.player.rating);
    }, [allMyPlayers, query, view]);

    const toggleListed = (p: Player) => {
        dispatch({ type: 'TOGGLE_TRANSFER_LIST', payload: p });
        showToast(p.isTransferListed ? `${p.name} retirado de la venta.` : `${p.name} puesto en venta.`, 'info');
    };

    const toggleUntouchable = (p: Player) => {
        dispatch({ type: 'TOGGLE_UNTOUCHABLE', payload: p });
        showToast(
            p.isUntouchable ? `${p.name} ya escucha ofertas.` : `${p.name} declarado intransferible.`,
            'info'
        );
    };

    const offerToClubs = (p: Player) => {
        dispatch({ type: 'OFFER_PLAYER_TO_CLUBS', payload: { playerId: p.id } });
        showToast(`${p.name} ofrecido a otros clubes.`, 'success');
        setSelectedId(null);
        onSwitchToOffers();
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                    type="search"
                    placeholder="Buscar en mi plantel o reserva…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-9 bg-[#0D1220] border border-white/10 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]/60"
                />
                {query && (
                    <button onClick={() => setQuery('')} aria-label="Limpiar" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-slate-400">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-xl">
                <button onClick={() => setView('ALL')} className={`h-9 rounded-lg text-xs font-bold cursor-pointer ${view === 'ALL' ? 'bg-white text-slate-950' : 'text-slate-400'}`}>
                    Todos ({allMyPlayers.length})
                </button>
                <button onClick={() => setView('LISTED')} className={`h-9 rounded-lg text-xs font-bold cursor-pointer ${view === 'LISTED' ? 'bg-white text-slate-950' : 'text-slate-400'}`}>
                    En venta ({listedCount})
                </button>
                <button onClick={() => setView('UNTOUCHABLE')} className={`h-9 rounded-lg text-xs font-bold cursor-pointer ${view === 'UNTOUCHABLE' ? 'bg-white text-slate-950' : 'text-slate-400'}`}>
                    Blindados ({untouchableCount})
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="apex-card">
                    <EmptyState
                        icon={view === 'LISTED' ? <Tag className="w-6 h-6" /> : view === 'UNTOUCHABLE' ? <Lock className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                        title={view === 'LISTED' ? 'Nadie en venta' : view === 'UNTOUCHABLE' ? 'Nadie blindado' : 'Sin resultados'}
                        text="Toca cualquier jugador para declararlo transferible, buscar comprador o blindarlo."
                    />
                </div>
            ) : (
                <ul className="apex-card divide-y divide-white/5 overflow-hidden">
                    {filtered.map(({ player: p, division }) => {
                        const nat = resolvePlayerNationality(p, myTeam.leagueId);
                        const meta = getCountryMeta(nat);
                        return (
                            <li key={p.id}>
                                <button
                                    onClick={() => setSelectedId(p.id)}
                                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/[0.03] active:bg-white/[0.06] cursor-pointer"
                                >
                                    <PlayerPhoto player={p} className="w-11 h-11 rounded-full shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-white truncate">{p.name}</p>
                                            <span title={meta.name}>{meta.flag}</span>
                                            {p.isTransferListed && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/15 text-amber-400 shrink-0">En venta</span>
                                            )}
                                            {p.isUntouchable && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500/15 text-indigo-300 shrink-0">Blindado</span>
                                            )}
                                            {division === 'Reserva' && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-white/10 text-slate-300 shrink-0">Reserva</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            <span className="font-bold text-slate-300">{positionLabel[p.position]}</span> · {getPlayerAge(p)} años · {p.contractYears}a contrato
                                        </p>
                                    </div>
                                    <p className="text-sm font-black text-emerald-400 shrink-0">{formatTransferFee(p.value)}</p>
                                    <OvrBadge value={p.rating} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            <BottomSheet
                open={!!selected}
                onClose={() => setSelectedId(null)}
                footer={selected && (
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => toggleListed(selected)}
                            className={`h-11 rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer ${selected.isTransferListed ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                }`}
                        >
                            <Tag className="w-3.5 h-3.5" /> {selected.isTransferListed ? 'Quitar' : 'En venta'}
                        </button>
                        <button
                            onClick={() => toggleUntouchable(selected)}
                            className={`h-11 rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer border ${selected.isUntouchable ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50' : 'bg-white/5 text-slate-300 border-white/10'
                                }`}
                        >
                            <Lock className="w-3.5 h-3.5" /> {selected.isUntouchable ? 'Blindado' : 'Blindar'}
                        </button>
                        <button
                            onClick={() => offerToClubs(selected)}
                            className="h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 text-[11px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
                        >
                            <Zap className="w-3.5 h-3.5" /> Ofrecer
                        </button>
                    </div>
                )}
            >
                {selected && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <PlayerPhoto player={selected} className="w-16 h-16 rounded-2xl shrink-0" />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-black text-white truncate">{selected.name}</h3>
                                <p className="text-xs text-slate-400">
                                    {positionLabel[selected.position]} · {getPlayerAge(selected)} años · {selectedEntry?.division}
                                </p>
                            </div>
                            <OvrBadge value={selected.rating} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <StatCell label="Tasación" value={formatTransferFee(selected.value)} accent="text-emerald-400" />
                            <StatCell label="Salario" value={formatWeeklyWage(selected.wage)} />
                            <StatCell label="Contrato" value={`${selected.contractYears} años`} />
                        </div>
                        <button
                            onClick={() => { dispatch({ type: 'SET_VIEWING_PLAYER', payload: selected }); setSelectedId(null); }}
                            className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                            Ver ficha completa <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </BottomSheet>
        </div>
    );
});
