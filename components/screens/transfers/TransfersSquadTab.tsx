import React, { useState, useMemo } from 'react';
import { Player, Team, GameState } from '../../../types';
import { GameAction } from '../../../state/reducer';
import { PlayerPhoto } from '../../../data/teams/helpers';
import { formatTransferFee, formatWeeklyWage } from '../../../utils';
import { getPlayerAge } from '../../../utils/playerUtils';
import { 
    Search, 
    Tag, 
    Zap
} from 'lucide-react';
import { useToast } from '../../common/ToastProvider';

interface TransfersSquadTabProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    myTeam: Team;
    onSwitchToOffers: () => void;
}

export const TransfersSquadTab: React.FC<TransfersSquadTabProps> = React.memo(({
    dispatch,
    myTeam,
    onSwitchToOffers
}) => {
    const { showToast } = useToast();
    const [searchName, setSearchName] = useState('');
    const [posFilter, setPosFilter] = useState<'ALL' | Player['position']>('ALL');
    const [onlyListed, setOnlyListed] = useState(false);

    const squad = myTeam.squad || [];

    const filteredSquad = useMemo(() => {
        const query = searchName.toLowerCase().trim();
        return squad.filter(player => {
            if (query && !player.name.toLowerCase().includes(query)) return false;
            if (posFilter !== 'ALL' && player.position !== posFilter) return false;
            if (onlyListed && !player.isTransferListed) return false;
            return true;
        }).sort((a, b) => b.rating - a.rating);
    }, [squad, searchName, posFilter, onlyListed]);

    const handleToggleTransferList = (player: Player) => {
        dispatch({ type: 'TOGGLE_TRANSFER_LIST', payload: player });
        const willBeListed = !player.isTransferListed;
        showToast(
            willBeListed 
                ? `${player.name} declarado transferible.`
                : `${player.name} retirado de la lista de transferibles.`,
            willBeListed ? 'info' : 'default'
        );
    };

    const handleOfferToClubs = (player: Player) => {
        dispatch({ type: 'OFFER_PLAYER_TO_CLUBS', payload: { playerId: player.id } });
        showToast(`¡${player.name} ofrecido en el mercado! Revisa las ofertas recibidas.`, 'success');
        onSwitchToOffers();
    };

    return (
        <div className="space-y-3.5">
            {/* Compact Filter Bar */}
            <div className="apex-card p-3 flex flex-col md:flex-row gap-2.5 items-center justify-between">
                <div className="flex-1 w-full relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Buscar jugador en tu plantilla..." 
                        value={searchName} 
                        onChange={e => setSearchName(e.target.value)} 
                        className="w-full pl-8 pr-4 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[var(--apex-gold)]" 
                    />
                </div>

                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
                    {(['ALL', 'POR', 'DEF', 'CEN', 'DEL'] as const).map(pos => (
                        <button
                            key={pos}
                            onClick={() => setPosFilter(pos)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-colors cursor-pointer ${
                                posFilter === pos 
                                    ? 'bg-[var(--apex-gold)] text-slate-950 font-black' 
                                    : 'bg-black/30 text-slate-400 border border-white/5 hover:text-white'
                            }`}
                        >
                            {pos === 'ALL' ? 'Todos' : pos}
                        </button>
                    ))}
                    <button
                        onClick={() => setOnlyListed(!onlyListed)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-colors border cursor-pointer whitespace-nowrap ${
                            onlyListed 
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                                : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
                        }`}
                    >
                        Transferibles
                    </button>
                </div>
            </div>

            {/* Clean Squad Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSquad.map(player => {
                    const age = getPlayerAge(player);
                    const isListed = !!player.isTransferListed;

                    return (
                        <div 
                            key={player.id} 
                            className={`apex-card p-3.5 flex flex-col justify-between gap-3 ${
                                isListed ? 'border-amber-500/40' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <PlayerPhoto player={player} className="w-11 h-11 rounded-full shrink-0" />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-sm text-white truncate">
                                            {player.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-200 uppercase">
                                                {player.position}
                                            </span>
                                            <span>{age} años</span>
                                            <span>•</span>
                                            <span>{player.contractYears}a contrato</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <span className="font-black text-xs text-white">{player.rating}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 py-2 px-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
                                <div>
                                    <span className="text-[9px] text-slate-500 font-semibold uppercase block">Tasación</span>
                                    <span className="text-xs font-bold text-emerald-400 truncate block">{formatTransferFee(player.value)}</span>
                                </div>
                                <div className="border-l border-white/5">
                                    <span className="text-[9px] text-slate-500 font-semibold uppercase block">Salario</span>
                                    <span className="text-xs font-bold text-slate-300 truncate block">{formatWeeklyWage(player.wage)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleTransferList(player)}
                                    className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
                                        isListed 
                                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                                            : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                                    }`}
                                >
                                    <Tag className="w-3 h-3" />
                                    <span>{isListed ? 'En Venta' : 'Transferible'}</span>
                                </button>

                                <button
                                    onClick={() => handleOfferToClubs(player)}
                                    className="py-2 px-3 rounded-xl bg-[var(--apex-gold)] hover:bg-yellow-400 text-slate-950 font-black text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Recibir ofertas inmediatas"
                                >
                                    <Zap className="w-3 h-3 fill-current" />
                                    <span>Ofrecer</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
