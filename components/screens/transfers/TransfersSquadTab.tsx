import React, { useState } from 'react';
import { Player, Team, GameState } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { PlayerPhoto } from '../../../data/teams/helpers';
import { formatTransferFee, formatWeeklyWage } from '../../../utils';
import { getPlayerAge, getPlayerPotentialTier, getTierBadge } from '../../../utils/playerUtils';
import { 
    Search, 
    Tag, 
    Zap, 
    Briefcase, 
    ArrowRight, 
    Check, 
    X,
    TrendingUp
} from 'lucide-react';
import { useToast } from '../../common/ToastProvider';

interface TransfersSquadTabProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    myTeam: Team;
    onSwitchToOffers: () => void;
}

export const TransfersSquadTab: React.FC<TransfersSquadTabProps> = ({
    gameState,
    dispatch,
    myTeam,
    onSwitchToOffers
}) => {
    const { showToast } = useToast();
    const [searchName, setSearchName] = useState('');
    const [posFilter, setPosFilter] = useState<'ALL' | Player['position']>('ALL');
    const [onlyListed, setOnlyListed] = useState(false);

    const squad = myTeam.squad || [];

    const listedCount = squad.filter(p => p.isTransferListed).length;
    const totalSquadValue = squad.reduce((sum, p) => {
        const val = p.value < 10_000 ? p.value * 1_000_000 : p.value;
        return sum + val;
    }, 0);

    const filteredSquad = squad.filter(player => {
        if (searchName && !player.name.toLowerCase().includes(searchName.toLowerCase())) {
            return false;
        }
        if (posFilter !== 'ALL' && player.position !== posFilter) {
            return false;
        }
        if (onlyListed && !player.isTransferListed) {
            return false;
        }
        return true;
    }).sort((a, b) => b.rating - a.rating);

    const handleToggleTransferList = (player: Player) => {
        dispatch({ type: 'TOGGLE_TRANSFER_LIST', payload: player });
        const willBeListed = !player.isTransferListed;
        showToast(
            willBeListed 
                ? `${player.name} declarado transferible. Los clubes interesados enviarán ofertas.`
                : `${player.name} retirado de la lista de transferibles.`,
            willBeListed ? 'info' : 'default'
        );
    };

    const handleOfferToClubs = (player: Player) => {
        dispatch({ type: 'OFFER_PLAYER_TO_CLUBS', payload: { playerId: player.id } });
        showToast(`⚡ ¡${player.name} ofrecido en el mercado! Se han generado ofertas de clubes interesados.`, 'success');
        onSwitchToOffers();
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Squad Overview Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="apex-card p-4 flex items-center justify-between border-l-4 border-l-blue-500">
                    <div>
                        <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest block">Plantilla Total</span>
                        <span className="text-xl font-black text-white">{squad.length} futbolistas</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Briefcase className="w-5 h-5" />
                    </div>
                </div>

                <div className="apex-card p-4 flex items-center justify-between border-l-4 border-l-[var(--apex-gold)]">
                    <div>
                        <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest block">En Lista de Transferibles</span>
                        <span className="text-xl font-black text-[var(--apex-gold)]">{listedCount} en venta</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/20 flex items-center justify-center text-[var(--apex-gold)]">
                        <Tag className="w-5 h-5" />
                    </div>
                </div>

                <div className="apex-card p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                        <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest block">Tasación de Plantilla</span>
                        <span className="text-xl font-black text-emerald-400">{formatTransferFee(totalSquadValue)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="apex-card p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex-1 w-full relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                        type="text" 
                        placeholder="Buscar jugador en tu plantilla..." 
                        value={searchName} 
                        onChange={e => setSearchName(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-white/30 focus:outline-none focus:border-[var(--apex-gold)] transition-colors" 
                    />
                </div>

                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {(['ALL', 'POR', 'DEF', 'CEN', 'DEL'] as const).map(pos => (
                        <button
                            key={pos}
                            onClick={() => setPosFilter(pos)}
                            className={`px-3 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all ${
                                posFilter === pos 
                                    ? 'bg-[var(--apex-gold)] text-black' 
                                    : 'bg-black/30 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {pos === 'ALL' ? 'Todos' : pos}
                        </button>
                    ))}
                    <button
                        onClick={() => setOnlyListed(!onlyListed)}
                        className={`px-3 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all border ${
                            onlyListed 
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                                : 'bg-black/30 text-white/40 border-white/5 hover:text-white'
                        }`}
                    >
                        Solo Transferibles
                    </button>
                </div>
            </div>

            {/* Squad List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSquad.map(player => {
                    const age = getPlayerAge(player);
                    const potTier = getPlayerPotentialTier(player);
                    const tierBadge = getTierBadge(potTier);
                    const isListed = !!player.isTransferListed;

                    return (
                        <div 
                            key={player.id} 
                            className={`apex-card p-4 transition-all duration-300 flex flex-col justify-between border ${
                                isListed 
                                    ? 'border-amber-500/40 bg-amber-500/[0.02]' 
                                    : 'border-white/5 hover:border-white/15'
                            }`}
                        >
                            <div>
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <PlayerPhoto player={player} className="w-12 h-12 rounded-xl border border-white/10 shadow-md" />
                                        <div>
                                            <h3 className="font-black text-sm text-white leading-tight">
                                                {player.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase">
                                                    {player.position}
                                                </span>
                                                <span className="text-[10px] text-white/50 font-bold">{age} años</span>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${tierBadge.color}`}>
                                                    {tierBadge.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overall Rating */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10">
                                        <span className="font-black text-sm text-white">{player.rating}</span>
                                    </div>
                                </div>

                                {/* Financial Specs */}
                                <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5 grid grid-cols-3 gap-2 text-center mb-3">
                                    <div>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Valor</span>
                                        <span className="text-xs font-black text-emerald-400 truncate block">{formatTransferFee(player.value)}</span>
                                    </div>
                                    <div className="border-x border-white/5 px-1">
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Salario</span>
                                        <span className="text-[10px] font-black text-slate-200 truncate block">{formatWeeklyWage(player.wage)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Contrato</span>
                                        <span className="text-[10px] font-bold text-white/70 block">{player.contractYears} años</span>
                                    </div>
                                </div>
                            </div>

                            {/* Selling Actions */}
                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleTransferList(player)}
                                        className={`flex-1 py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                                            isListed 
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' 
                                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Tag className="w-3.5 h-3.5" />
                                        {isListed ? 'En Lista de Venta' : 'Declarar Transferible'}
                                    </button>

                                    <button
                                        onClick={() => handleOfferToClubs(player)}
                                        className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                                        title="Ofrecer activamente a clubes interesados para recibir propuestas de compra inmediatas"
                                    >
                                        <Zap className="w-3.5 h-3.5 fill-black" />
                                        <span>Ofrecer a Clubes</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
