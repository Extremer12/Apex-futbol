import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Sponsor, Screen } from '../../types';
import { GameAction } from '../../state/reducer';
import { ArrowLeft } from 'lucide-react';
import { formatCurrencyShort } from '../../utils';
import { useToast } from '../common/ToastProvider';
import { useGameStore } from '../../state/gameStore';
import { FinancesSponsorsTab } from './finances/FinancesSponsorsTab';
import { SponsorNegotiationModal, SponsorTerminationModal } from './finances/FinancesModals';

interface SponsorshipScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    onNavigate?: (screen: Screen) => void;
}

export const SponsorshipScreen: React.FC<SponsorshipScreenProps> = ({ gameState, dispatch, onNavigate }) => {
    const { sponsors, availableSponsors, finances, team } = gameState;
    const { showToast } = useToast();
    const setActiveScreen = useGameStore(s => s.setActiveScreen);
    const nav = onNavigate || setActiveScreen;

    const [negotiatingSponsor, setNegotiatingSponsor] = useState<Sponsor | null>(null);
    const [terminatingSponsor, setTerminatingSponsor] = useState<Sponsor | null>(null);

    const totalWeeklyIncome = useMemo(() => sponsors.reduce((sum, s) => sum + s.weeklyIncome, 0), [sponsors]);

    const handleRefreshMarket = useCallback(() => {
        dispatch({ type: 'REFRESH_SPONSOR_MARKET' });
        showToast('Mercado de patrocinios renovado.', 'info');
    }, [dispatch, showToast]);

    const handleAcceptSponsor = useCallback((sponsorId: string, negotiatedIncome: number, customSigningBonus: number, fanImpact: number) => {
        dispatch({
            type: 'ACCEPT_SPONSOR',
            payload: { sponsorId, negotiatedIncome, customSigningBonus, fanImpact }
        });
        showToast('Contrato de patrocinio firmado.', 'success');
    }, [dispatch, showToast]);

    const handleRejectSponsor = useCallback((sponsorId: string) => {
        dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId } });
    }, [dispatch]);

    const handleConfirmTermination = useCallback((sponsor: Sponsor, indemnityCost: number) => {
        dispatch({ type: 'TERMINATE_SPONSOR', payload: { sponsorId: sponsor.id, indemnityCost } });
        showToast(`Contrato con ${sponsor.name} rescindido.`, 'info');
        setTerminatingSponsor(null);
    }, [dispatch, showToast]);

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
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">Patrocinios</h1>
                        <span className="text-[11px] font-bold text-slate-400 truncate block">
                            {team.name} · {sponsors.length}/4 espacios cubiertos
                        </span>
                    </div>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Ingreso/sem</span>
                    <span className="text-sm font-black text-emerald-400 leading-none tabular-nums">
                        +{formatCurrencyShort(totalWeeklyIncome)}
                    </span>
                </div>
            </header>

            <FinancesSponsorsTab
                sponsors={sponsors}
                availableSponsors={availableSponsors}
                onStartNegotiation={setNegotiatingSponsor}
                onRequestTermination={setTerminatingSponsor}
                onRefreshMarket={handleRefreshMarket}
            />

            <SponsorNegotiationModal
                sponsor={negotiatingSponsor}
                onClose={() => setNegotiatingSponsor(null)}
                onAccept={handleAcceptSponsor}
                onRejectOffer={handleRejectSponsor}
            />

            <SponsorTerminationModal
                sponsor={terminatingSponsor}
                balance={finances.balance}
                onClose={() => setTerminatingSponsor(null)}
                onConfirm={handleConfirmTermination}
            />
        </div>
    );
};
