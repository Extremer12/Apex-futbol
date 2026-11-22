import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Sponsor, BankLoan, TicketPolicy, ClubDirectives } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency, formatCurrencyShort } from '../../utils';
import {
    calculateFinancialBreakdown,
    getNetWeeklyIncome,
    getAvailableLoans,
    evaluateFinancialHealth,
    getStadiumExpansionCost
} from '../../services/economy';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { TabKey } from './finances/financesUiTypes';
import { FinancesOverviewTab } from './finances/FinancesOverviewTab';
import { FinancesSponsorsTab } from './finances/FinancesSponsorsTab';
import { FinancesStrategyTab } from './finances/FinancesStrategyTab';
import { FinancesBankingTab } from './finances/FinancesBankingTab';
import { FinancesStadiumTab } from './finances/FinancesStadiumTab';
import {
    SponsorNegotiationModal,
    SponsorTerminationModal,
    FinanceConfirmModal,
    ConfirmModalState
} from './finances/FinancesModals';

interface FinancesScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const FinancesScreen: React.FC<FinancesScreenProps> = React.memo(({ gameState, dispatch }) => {
    const { finances, stadium, sponsors, availableSponsors, team, leagueTables, scouts = [] } = gameState;
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [negotiatingSponsor, setNegotiatingSponsor] = useState<Sponsor | null>(null);
    const [terminatingSponsor, setTerminatingSponsor] = useState<Sponsor | null>(null);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

    const playerTable = leagueTables[team.leagueId] || [];
    const playerPosition = playerTable.find(row => row.teamId === team.id)?.position || 10;

    const isMidweekTurn = gameState.currentTurn === 'midweek';
    const currentMatch = gameState.schedule?.find(m =>
        m.week === gameState.currentWeek &&
        Boolean(m.isMidweek) === isMidweekTurn &&
        (m.homeTeamId === team.id || m.awayTeamId === team.id)
    );
    const wasHomeMatch = currentMatch?.homeTeamId === team.id;

    const breakdown = useMemo(() => {
        return calculateFinancialBreakdown(
            team,
            stadium,
            sponsors,
            playerPosition,
            { bought: 0, sold: 0 },
            wasHomeMatch,
            team.leagueId,
            finances.ticketPolicy || 'standard',
            finances.activeLoans || [],
            finances.clubDirectives,
            scouts
        );
    }, [team, stadium, sponsors, playerPosition, wasHomeMatch, finances.ticketPolicy, finances.activeLoans, finances.clubDirectives, scouts]);

    const breakdownWithoutMatchday = useMemo(() => {
        return calculateFinancialBreakdown(
            team,
            stadium,
            sponsors,
            playerPosition,
            { bought: 0, sold: 0 },
            false,
            team.leagueId,
            finances.ticketPolicy || 'standard',
            finances.activeLoans || [],
            finances.clubDirectives,
            scouts
        );
    }, [team, stadium, sponsors, playerPosition, finances.ticketPolicy, finances.activeLoans, finances.clubDirectives, scouts]);

    const netIncome = useMemo(() => getNetWeeklyIncome(breakdown), [breakdown]);
    const netIncomeWithoutMatchday = useMemo(() => getNetWeeklyIncome(breakdownWithoutMatchday), [breakdownWithoutMatchday]);

    const health = useMemo(() => {
        return evaluateFinancialHealth(
            finances,
            netIncome,
            Math.max(1, 40 - (gameState.currentWeek || 0)),
            team.leagueId
        );
    }, [finances, netIncome, gameState.currentWeek, team.leagueId]);

    const availableLoanOffers = useMemo(() => getAvailableLoans(team, team.leagueId), [team]);
    const totalDebt = useMemo(() => (finances.activeLoans || []).reduce((sum, l) => sum + (l.remainingAmount || 0), 0), [finances.activeLoans]);

    const handleSetTicketPolicy = useCallback((policy: TicketPolicy) => {
        dispatch({ type: 'SET_TICKET_POLICY', payload: { policy } });
        const labels: Record<TicketPolicy, string> = {
            cheap: 'Precios Populares',
            standard: 'Tarifa Estándar',
            premium: 'Pase Prémium'
        };
        showToast(`Política de entradas: ${labels[policy]}`, 'info');
    }, [dispatch, showToast]);

    const handleReallocateBudget = useCallback((amount: number, direction: 'to_transfers' | 'to_balance') => {
        dispatch({ type: 'REALLOCATE_BUDGET', payload: { amount, direction } });
        if (direction === 'to_transfers') {
            showToast(`Inyectados ${formatCurrencyShort(amount)} a fichajes.`, 'success');
        } else {
            showToast(`Reintegrados ${formatCurrencyShort(amount)} a tesorería.`, 'info');
        }
    }, [dispatch, showToast]);

    const handleUpdateDirectives = useCallback((updates: Partial<ClubDirectives>) => {
        dispatch({ type: 'UPDATE_CLUB_DIRECTIVES', payload: updates });
        showToast('Directivas institucionales actualizadas.', 'success');
    }, [dispatch, showToast]);

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

    const handleTakeLoan = useCallback((loan: BankLoan) => {
        setConfirmModal({
            title: 'Solicitar Crédito',
            message: `¿Solicitar "${loan.name}" por ${formatCurrency(loan.principal)}? Cuota semanal de ${formatCurrency(loan.weeklyPayment)} durante ${loan.remainingWeeks} semanas.`,
            confirmText: 'Solicitar Fondos',
            onConfirm: () => {
                dispatch({ type: 'TAKE_LOAN', payload: { loan } });
                showToast(`Crédito aprobado: +${formatCurrencyShort(loan.principal)}`, 'success');
            }
        });
    }, [dispatch, showToast]);

    const handleRepayLoan = useCallback((loan: BankLoan) => {
        setConfirmModal({
            title: 'Liquidar Préstamo',
            message: `¿Cancelar "${loan.name}" abonando ${formatCurrency(loan.remainingAmount)}? Se eliminará la cuota semanal de ${formatCurrency(loan.weeklyPayment)}.`,
            confirmText: 'Liquidar Deuda',
            confirmColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
            onConfirm: () => {
                dispatch({ type: 'REPAY_LOAN', payload: { loanId: loan.id } });
                showToast('Préstamo liquidado.', 'success');
            }
        });
    }, [dispatch, showToast]);

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

    const freeSponsorSlots = Math.max(0, 4 - sponsors.length);
    const activeLoansCount = (finances.activeLoans || []).length;

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* 1. COMPACT HEADER (matching Squad & Transfers) */}
            <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Finanzas</h1>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 truncate">
                        {team.name} · Solvencia {health.grade} · {health.fairPlayCompliant ? 'Fair Play OK' : 'En riesgo'}
                    </span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Tesorería</span>
                    <span className={`text-sm font-black leading-none tabular-nums ${finances.balance >= 0 ? 'text-[var(--apex-gold)]' : 'text-rose-400'}`}>
                        {formatCurrencyShort(finances.balance)}
                    </span>
                </div>
            </header>

            {/* 2. STICKY TABS */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="flex sm:grid sm:grid-cols-5 gap-1 p-1 bg-white/5 rounded-2xl overflow-x-auto no-scrollbar">
                    {([
                        { id: 'overview', label: 'Resumen', badge: 0 },
                        { id: 'sponsors', label: 'Comercial', badge: freeSponsorSlots },
                        { id: 'strategy', label: 'Estrategia', badge: 0 },
                        { id: 'banking', label: 'Banca', badge: activeLoansCount },
                        { id: 'stadium', label: 'Estadio', badge: 0 },
                    ] as const).map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`relative h-10 px-3 sm:px-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                                activeTab === t.id ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span>{t.label}</span>
                            {t.badge > 0 && (
                                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                                    activeTab === t.id ? 'bg-slate-950 text-[var(--apex-gold)]' : 'bg-white/15 text-white'
                                }`}>
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Negative Balance Alert */}
            {finances.balance < 0 && (
                <div className="apex-card p-3.5 rounded-2xl border-rose-500/40 bg-rose-950/20 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <span className="font-black text-rose-400 uppercase tracking-wider block">
                            Déficit Crítico ({formatCurrency(finances.balance)})
                        </span>
                        <span className="text-slate-300">
                            Reasigna presupuesto de fichajes en Estrategia o solicita liquidez en Banca.
                        </span>
                    </div>
                </div>
            )}

            {/* 3. TAB CONTENT */}
            {activeTab === 'overview' && (
                <FinancesOverviewTab
                    balance={finances.balance}
                    transferBudget={finances.transferBudget}
                    netIncome={netIncome}
                    netIncomeWithoutMatchday={netIncomeWithoutMatchday}
                    totalDebt={totalDebt}
                    activeLoansCount={activeLoansCount}
                    breakdown={breakdown}
                    health={health}
                    balanceHistory={finances.balanceHistory || []}
                    onNavigateToStrategy={() => setActiveTab('strategy')}
                    onNavigateToBanking={() => setActiveTab('banking')}
                />
            )}

            {activeTab === 'sponsors' && (
                <FinancesSponsorsTab
                    sponsors={sponsors}
                    availableSponsors={availableSponsors}
                    onStartNegotiation={setNegotiatingSponsor}
                    onRequestTermination={setTerminatingSponsor}
                    onRefreshMarket={handleRefreshMarket}
                />
            )}

            {activeTab === 'strategy' && (
                <FinancesStrategyTab
                    stadium={stadium}
                    currentPolicy={finances.ticketPolicy || 'standard'}
                    directives={finances.clubDirectives}
                    balance={finances.balance}
                    transferBudget={finances.transferBudget}
                    leagueId={team.leagueId}
                    onSetTicketPolicy={handleSetTicketPolicy}
                    onReallocateBudget={handleReallocateBudget}
                    onUpdateDirectives={handleUpdateDirectives}
                />
            )}

            {activeTab === 'banking' && (
                <FinancesBankingTab
                    activeLoans={finances.activeLoans || []}
                    availableLoans={availableLoanOffers}
                    balance={finances.balance}
                    onRequestTakeLoan={handleTakeLoan}
                    onRequestRepayLoan={handleRepayLoan}
                />
            )}

            {activeTab === 'stadium' && (
                <FinancesStadiumTab
                    stadium={stadium}
                    team={team}
                    balance={finances.balance}
                    onRequestExpand={handleExpandStadium}
                    onRequestUpgradeFacility={handleUpgradeFacility}
                />
            )}

            {/* Modals */}
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

            <FinanceConfirmModal
                modalState={confirmModal}
                onClose={() => setConfirmModal(null)}
            />
        </div>
    );
});
