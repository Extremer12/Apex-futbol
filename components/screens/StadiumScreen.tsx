import React, { useState, useCallback } from 'react';
import { GameState, Screen } from '../../types';
import { GameAction } from '../../state/reducer';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency, formatCurrencyShort } from '../../utils';
import { getStadiumExpansionCost } from '../../services/economy';
import { useToast } from '../common/ToastProvider';
import { useGameStore } from '../../state/gameStore';
import { FinancesStadiumTab } from './finances/FinancesStadiumTab';
import { FinanceConfirmModal, ConfirmModalState } from './finances/FinancesModals';

interface StadiumScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    onNavigate?: (screen: Screen) => void;
}

export const StadiumScreen: React.FC<StadiumScreenProps> = ({ gameState, dispatch, onNavigate }) => {
    const { stadium, finances, team } = gameState;
    const { showToast } = useToast();
    const setActiveScreen = useGameStore(s => s.setActiveScreen);
    const nav = onNavigate || setActiveScreen;
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

    const handleExpandStadium = useCallback(() => {
        const cost = stadium.expansionCost || getStadiumExpansionCost(stadium.capacity, team.tier, team.leagueId);
        const capacity = stadium.expansionCapacity || Math.min(120_000, Math.floor(stadium.capacity * 1.25));

        setConfirmModal({
            title: 'Ampliación de Gradas',
            message: `¿Ampliar ${stadium.name} a ${capacity.toLocaleString()} espectadores por ${formatCurrency(cost)}?`,
            confirmText: 'Iniciar Obras',
            onConfirm: () => {
                dispatch({ type: 'EXPAND_STADIUM' });
                showToast(`Capacidad ampliada a ${capacity.toLocaleString()} asientos.`, 'success');
            }
        });
    }, [dispatch, stadium, team.tier, team.leagueId, showToast]);

    const handleUpgradeFacility = useCallback((cost: number) => {
        const nextLevel = stadium.facilityLevel + 1;
        setConfirmModal({
            title: 'Modernizar Palcos VIP',
            message: `¿Mejorar las zonas VIP al Nivel ${nextLevel} por ${formatCurrency(cost)}? (+12.5% ingresos de taquilla)`,
            confirmText: 'Aprobar Inversión',
            onConfirm: () => {
                dispatch({ type: 'UPGRADE_FACILITY', payload: { cost } });
                showToast(`Palcos VIP modernizados al Nivel ${nextLevel}.`, 'success');
            }
        });
    }, [dispatch, stadium.facilityLevel, showToast]);

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => nav(Screen.Club)}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white shrink-0 cursor-pointer"
                        title="Volver al Club"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">Estadio e Infraestructura</h1>
                        <span className="text-[11px] font-bold text-slate-400 truncate block">
                            {stadium.name} · {stadium.capacity.toLocaleString()} asientos
                        </span>
                    </div>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Tesorería</span>
                    <span className={`text-sm font-black leading-none tabular-nums ${finances.balance >= 0 ? 'text-[var(--apex-gold)]' : 'text-rose-400'}`}>
                        {formatCurrencyShort(finances.balance)}
                    </span>
                </div>
            </header>

            <FinancesStadiumTab
                stadium={stadium}
                team={team}
                balance={finances.balance}
                onRequestExpand={handleExpandStadium}
                onRequestUpgradeFacility={handleUpgradeFacility}
            />

            <FinanceConfirmModal
                modalState={confirmModal}
                onClose={() => setConfirmModal(null)}
            />
        </div>
    );
};
