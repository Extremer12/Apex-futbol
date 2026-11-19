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
import {
    PieChart,
    Handshake,
    Sliders,
    Landmark,
    Building2,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { TeamLogo } from '../../data/teams/helpers';
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

    // Current team league position
    const playerTable = leagueTables[team.leagueId] || [];
    const playerPosition = playerTable.find(row => row.teamId === team.id)?.position || 10;

    // Check if next/current match is home
    const isMidweekTurn = gameState.currentTurn === 'midweek';
    const currentMatch = gameState.schedule?.find(m =>
        m.week === gameState.currentWeek &&
        Boolean(m.isMidweek) === isMidweekTurn &&
        (m.homeTeamId === team.id || m.awayTeamId === team.id)
    );
    const wasHomeMatch = currentMatch?.homeTeamId === team.id;

    // Financial Breakdowns: with actual fixture local status & baseline without matchday
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

    // Financial Health Evaluation (scaled by league region)
    const health = useMemo(() => {
        return evaluateFinancialHealth(
            finances,
            netIncome,
            Math.max(1, 40 - (gameState.currentWeek || 0)),
            team.leagueId
        );
    }, [finances, netIncome, gameState.currentWeek, team.leagueId]);

    // Available loans
    const availableLoanOffers = useMemo(() => {
        return getAvailableLoans(team, team.leagueId);
    }, [team]);

    // Total debt
    const totalDebt = useMemo(() => {
        return (finances.activeLoans || []).reduce((sum, l) => sum + (l.remainingAmount || 0), 0);
    }, [finances.activeLoans]);

    // Handlers
    const handleSetTicketPolicy = useCallback((policy: TicketPolicy) => {
        dispatch({ type: 'SET_TICKET_POLICY', payload: { policy } });
        const labels: Record<TicketPolicy, string> = {
            cheap: 'Precios Populares (+Aprobación socios, 95-100% aforo)',
            standard: 'Tarifa Estándar (Equilibrado)',
            premium: 'Pase Prémium (Mayor recaudación por butaca)'
        };
        showToast(`Política de entradas: ${labels[policy]}`, 'info');
    }, [dispatch, showToast]);

    const handleReallocateBudget = useCallback((amount: number, direction: 'to_transfers' | 'to_balance') => {
        dispatch({ type: 'REALLOCATE_BUDGET', payload: { amount, direction } });
        if (direction === 'to_transfers') {
            showToast(`Inyectados ${formatCurrencyShort(amount)} al presupuesto de fichajes.`, 'success');
        } else {
            showToast(`Reintegrados ${formatCurrencyShort(amount)} a la tesorería del club.`, 'info');
        }
    }, [dispatch, showToast]);

    const handleUpdateDirectives = useCallback((updates: Partial<ClubDirectives>) => {
        dispatch({ type: 'UPDATE_CLUB_DIRECTIVES', payload: updates });
        showToast('Directivas institucionales actualizadas.', 'success');
    }, [dispatch, showToast]);

    const handleRefreshMarket = useCallback(() => {
        dispatch({ type: 'REFRESH_SPONSOR_MARKET' });
        showToast('Mercado de patrocinios renovado con nuevas marcas.', 'info');
    }, [dispatch, showToast]);

    const handleAcceptSponsor = useCallback((sponsorId: string, negotiatedIncome: number, customSigningBonus: number, fanImpact: number) => {
        dispatch({
            type: 'ACCEPT_SPONSOR',
            payload: {
                sponsorId,
                negotiatedIncome,
                customSigningBonus,
                fanImpact
            }
        });
        showToast('Contrato de patrocinio rubricado exitosamente.', 'success');
    }, [dispatch, showToast]);

    const handleRejectSponsor = useCallback((sponsorId: string) => {
        dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId } });
    }, [dispatch]);

    const handleConfirmTermination = useCallback((sponsor: Sponsor, indemnityCost: number) => {
        dispatch({
            type: 'TERMINATE_SPONSOR',
            payload: { sponsorId: sponsor.id, indemnityCost }
        });
        showToast(`Contrato con ${sponsor.name} rescindido. Espacio liberado.`, 'info');
        setTerminatingSponsor(null);
    }, [dispatch, showToast]);

    const handleTakeLoan = useCallback((loan: BankLoan) => {
        setConfirmModal({
            title: 'Solicitud de Línea de Crédito',
            message: `¿Solicitar préstamo "${loan.name}" por ${formatCurrency(loan.principal)}? Se amortizará a razón de ${formatCurrency(loan.weeklyPayment)}/sem durante ${loan.remainingWeeks} semanas.`,
            confirmText: 'Solicitar Fondos',
            onConfirm: () => {
                dispatch({ type: 'TAKE_LOAN', payload: { loan } });
                showToast(`Crédito aprobado: +${formatCurrencyShort(loan.principal)} ingresados en tesorería.`, 'success');
            }
        });
    }, [dispatch, showToast]);

    const handleRepayLoan = useCallback((loan: BankLoan) => {
        setConfirmModal({
            title: 'Amortización Total de Deuda',
            message: `¿Amortizar la totalidad del crédito "${loan.name}" abonando ${formatCurrency(loan.remainingAmount)}? Se suprimirá la cuota semanal de ${formatCurrency(loan.weeklyPayment)}/sem.`,
            confirmText: 'Liquidar Deuda',
            confirmColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
            onConfirm: () => {
                dispatch({ type: 'REPAY_LOAN', payload: { loanId: loan.id } });
                showToast(`Préstamo liquidado. Cuota semanal cancelada.`, 'success');
            }
        });
    }, [dispatch, showToast]);

    const handleExpandStadium = useCallback(() => {
        const cost = stadium.expansionCost || getStadiumExpansionCost(stadium.capacity, team.tier, team.leagueId);
        const capacity = stadium.expansionCapacity || Math.floor(stadium.capacity * 1.25);

        setConfirmModal({
            title: 'Ampliación de Gradas',
            message: `¿Iniciar obras de ampliación del estadio a ${capacity.toLocaleString()} espectadores por ${formatCurrency(cost)}?`,
            confirmText: 'Comenzar Obras',
            onConfirm: () => {
                dispatch({ type: 'EXPAND_STADIUM' });
                showToast(`Obras en marcha en el ${stadium.name}. Capacidad aumentada.`, 'success');
            }
        });
    }, [dispatch, stadium, team.tier, team.leagueId, showToast]);

    const handleUpgradeFacility = useCallback((cost: number) => {
        const nextLevel = stadium.facilityLevel + 1;
        setConfirmModal({
            title: 'Modernización de Palcos VIP',
            message: `¿Modernizar instalaciones VIP y palcos al Nivel ${nextLevel} por ${formatCurrency(cost)}? (+12.5% ingresos de día de partido)`,
            confirmText: 'Aprobar Inversión',
            onConfirm: () => {
                dispatch({ type: 'UPGRADE_FACILITY', payload: { cost } });
                showToast(`¡Instalaciones VIP modernizadas al Nivel ${nextLevel}!`, 'success');
            }
        });
    }, [dispatch, stadium.facilityLevel, showToast]);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28 animate-fade-in text-white">
            {/* Header & Financial Status Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-950/60 border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-inner">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded border border-[var(--apex-gold)]/20">
                                Dirección Financiera
                            </span>
                            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                                {team.name}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                            Gestión Económica & Presupuesto
                        </h1>
                    </div>
                </div>

                {/* Credit Rating & Fair Play Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-slate-900/80 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                            style={{ backgroundColor: `${health.color}20`, color: health.color, border: `1px solid ${health.color}40` }}
                        >
                            {health.grade}
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Calificación Solvencia</div>
                            <div className="text-xs font-black" style={{ color: health.color }}>
                                {health.label}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <ShieldCheck className={`w-4 h-4 ${health.fairPlayCompliant ? 'text-emerald-400' : 'text-rose-400'}`} />
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Fair Play Financiero</div>
                            <div className="text-xs font-bold text-slate-200">
                                {health.fairPlayCompliant ? 'En Regla' : 'Bajo Advertencia'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/5">
                {[
                    { key: 'overview', label: 'Resumen & Tesorería', icon: PieChart },
                    { key: 'sponsors', label: 'Patrocinios & Marcas', icon: Handshake, badge: sponsors.length < 4 ? `${4 - sponsors.length} libres` : undefined },
                    { key: 'strategy', label: 'Estrategia & Decisiones', icon: Sliders },
                    { key: 'banking', label: 'Banca & Préstamos', icon: Landmark, badge: totalDebt > 0 ? formatCurrencyShort(totalDebt) : undefined },
                    { key: 'stadium', label: 'Estadio & Obras', icon: Building2 },
                ].map(tab => {
                    const isActive = activeTab === tab.key;
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as TabKey)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                                isActive
                                    ? 'bg-[var(--apex-gold)] text-slate-950 shadow-md shadow-[var(--apex-gold)]/20'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider ${
                                    isActive ? 'bg-slate-950 text-[var(--apex-gold)]' : 'bg-[var(--apex-gold)]/20 text-[var(--apex-gold)]'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Negative Balance Alert */}
            {finances.balance < 0 && (
                <div className="bg-rose-950/20 border-2 border-rose-500/50 rounded-2xl p-4 flex items-start gap-3.5 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30 text-rose-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-rose-400 font-bold uppercase tracking-wider text-xs">
                            Alerta de Déficit Crítico ({formatCurrency(finances.balance)})
                        </p>
                        <p className="text-slate-300 text-xs leading-relaxed mt-0.5">
                            La tesorería general está en números rojos. Los gastos semanales superan la liquidez del club. Se recomienda reasignar presupuesto de fichajes a tesorería o solicitar un crédito inmediato en la pestaña <strong>Banca</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* Tab Contents */}
            {activeTab === 'overview' && (
                <FinancesOverviewTab
                    balance={finances.balance}
                    transferBudget={finances.transferBudget}
                    netIncome={netIncome}
                    netIncomeWithoutMatchday={netIncomeWithoutMatchday}
                    totalDebt={totalDebt}
                    activeLoansCount={(finances.activeLoans || []).length}
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

            {/* Negotiation Modal */}
            <SponsorNegotiationModal
                sponsor={negotiatingSponsor}
                onClose={() => setNegotiatingSponsor(null)}
                onAccept={handleAcceptSponsor}
                onRejectOffer={handleRejectSponsor}
            />

            {/* Termination Modal */}
            <SponsorTerminationModal
                sponsor={terminatingSponsor}
                balance={finances.balance}
                onClose={() => setTerminatingSponsor(null)}
                onConfirm={handleConfirmTermination}
            />

            {/* Confirm Actions Modal */}
            <FinanceConfirmModal
                modalState={confirmModal}
                onClose={() => setConfirmModal(null)}
            />
        </div>
    );
});
