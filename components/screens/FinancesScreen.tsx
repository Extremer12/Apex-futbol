import React, { useState, useMemo } from 'react';
import { GameState, Sponsor, BankLoan, TicketPolicy, ClubDirectives } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency, formatCurrencyShort } from '../../utils';
import { 
    calculateFinancialBreakdown, 
    getNetWeeklyIncome, 
    getAvailableLoans, 
    evaluateFinancialHealth,
    generateSponsor
} from '../../services/economy';
import { 
    Coins, 
    TrendingUp, 
    TrendingDown, 
    Building2, 
    Users, 
    FileText, 
    Shirt, 
    Zap, 
    Tag, 
    AlertTriangle, 
    CheckCircle2, 
    ShieldCheck, 
    Handshake, 
    Sparkles, 
    Clock, 
    Sliders, 
    Award, 
    X, 
    ArrowRightLeft,
    Check,
    CreditCard,
    DollarSign,
    Scale,
    Landmark,
    Flame,
    PieChart,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../common/ToastProvider';
import { TeamLogo } from '../../data/teams/helpers';

interface FinancesScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

type TabKey = 'overview' | 'sponsors' | 'decisions' | 'banking' | 'stadium';

interface SponsorSlotMeta {
    type: Sponsor['type'];
    title: string;
    subtitle: string;
    icon: React.ElementType;
    accentColor: string;
}

const SPONSOR_SLOTS: SponsorSlotMeta[] = [
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
        title: 'Naming Rights Estadio',
        subtitle: 'Derechos de Nombre de la Cancha',
        icon: Building2,
        accentColor: '#F59E0B'
    },
    {
        type: 'training',
        title: 'Partner Secundario & Manga',
        subtitle: 'Manga de Juego e Instalaciones',
        icon: Zap,
        accentColor: '#10B981'
    }
];

export const FinancesScreen: React.FC<FinancesScreenProps> = ({ gameState, dispatch }) => {
    const { finances, stadium, sponsors, availableSponsors, team, leagueTables } = gameState;
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [selectedSlotFilter, setSelectedSlotFilter] = useState<Sponsor['type'] | 'all'>('all');
    
    // Negotiation Modal State
    const [negotiatingSponsor, setNegotiatingSponsor] = useState<Sponsor | null>(null);
    const [negotiationPhase, setNegotiationPhase] = useState<'idle' | 'rolling' | 'result'>('idle');
    const [negotiationResult, setNegotiationResult] = useState<{
        success: boolean;
        message: string;
        finalIncome?: number;
        signingBonus?: number;
        fanImpact?: number;
    } | null>(null);

    // Termination Modal State
    const [terminatingSponsor, setTerminatingSponsor] = useState<Sponsor | null>(null);

    // Budget Reallocation State
    const [reallocateDirection, setReallocateDirection] = useState<'to_transfers' | 'to_balance'>('to_transfers');
    const [reallocateAmount, setReallocateAmount] = useState<number>(1_000_000);

    // Calculate current position
    const playerTable = leagueTables[team.leagueId] || [];
    const playerPosition = playerTable.find(row => row.teamId === team.id)?.position || 10;

    // Detailed Breakdown
    const breakdown = useMemo(() => {
        return calculateFinancialBreakdown(
            team,
            stadium,
            sponsors,
            playerPosition,
            { bought: 0, sold: 0 }, 
            true, 
            team.leagueId,
            finances.ticketPolicy || 'standard',
            finances.activeLoans || [],
            finances.clubDirectives
        );
    }, [team, stadium, sponsors, playerPosition, finances.ticketPolicy, finances.activeLoans, finances.clubDirectives]);

    const netIncome = useMemo(() => getNetWeeklyIncome(breakdown), [breakdown]);

    // Financial Health Assessment
    const health = useMemo(() => {
        return evaluateFinancialHealth(finances, netIncome, Math.max(1, 40 - (gameState.currentWeek || 0)));
    }, [finances, netIncome, gameState.currentWeek]);

    // Available loans
    const availableLoanOffers = useMemo(() => {
        return getAvailableLoans(team, team.leagueId);
    }, [team]);

    // Total debt
    const totalDebt = useMemo(() => {
        return (finances.activeLoans || []).reduce((sum, l) => sum + (l.remainingAmount || 0), 0);
    }, [finances.activeLoans]);

    // Filtered offers
    const filteredOffers = useMemo(() => {
        if (selectedSlotFilter === 'all') return availableSponsors;
        return availableSponsors.filter(s => s.type === selectedSlotFilter);
    }, [availableSponsors, selectedSlotFilter]);

    // Handlers
    const handleExpandStadium = () => {
        if (!stadium.expansionCost) return;
        if (confirm(`¿Iniciar obras de ampliación del estadio a ${stadium.expansionCapacity?.toLocaleString()} espectadores por ${formatCurrency(stadium.expansionCost)}?`)) {
            dispatch({ type: 'EXPAND_STADIUM' });
            showToast(`Obras de ampliación en marcha en el ${stadium.name}. Capacidad aumentada.`, 'success');
        }
    };

    const handleUpgradeFacility = () => {
        const nextLevel = stadium.facilityLevel + 1;
        if (nextLevel > 5) return;
        const cost = nextLevel * (team.tier === 'Top' ? 4_000_000 : team.tier === 'Mid' ? 1_800_000 : 750_000);
        if (finances.balance < cost) {
            showToast('Fondos insuficientes para modernizar las zonas VIP.', 'error');
            return;
        }
        if (confirm(`¿Modernizar instalaciones VIP y palcos al Nivel ${nextLevel} por ${formatCurrency(cost)}? (+12.5% ingresos de día de partido)`)) {
            dispatch({ type: 'UPGRADE_FACILITY', payload: { cost } });
            showToast(`¡Instalaciones VIP modernizadas al Nivel ${nextLevel}!`, 'success');
        }
    };

    const handleSetTicketPolicy = (policy: TicketPolicy) => {
        dispatch({ type: 'SET_TICKET_POLICY', payload: { policy } });
        const labels = {
            cheap: 'Precios Populares (Alta afluencia, +Aprobación de la hinchada)',
            standard: 'Tarifa Estándar (Equilibrado)',
            premium: 'Pase Prémium (Mayor recaudación por butaca)'
        };
        showToast(`Política de entradas cambiada a: ${labels[policy]}`, 'info');
    };

    const handleReallocateBudget = () => {
        if (reallocateAmount <= 0) return;
        if (reallocateDirection === 'to_transfers' && finances.balance < reallocateAmount) {
            showToast('El saldo en tesorería es inferior al monto a traspasar.', 'error');
            return;
        }
        if (reallocateDirection === 'to_balance' && finances.transferBudget < reallocateAmount) {
            showToast('El presupuesto de fichajes es inferior al monto a devolver.', 'error');
            return;
        }

        dispatch({
            type: 'REALLOCATE_BUDGET',
            payload: { amount: reallocateAmount, direction: reallocateDirection }
        });

        if (reallocateDirection === 'to_transfers') {
            showToast(`Inyectados ${formatCurrency(reallocateAmount)} al presupuesto de fichajes.`, 'success');
        } else {
            showToast(`Reintegrados ${formatCurrency(reallocateAmount)} a la tesorería general del club.`, 'info');
        }
    };

    const handleUpdateDirectives = (updates: Partial<ClubDirectives>) => {
        dispatch({ type: 'UPDATE_CLUB_DIRECTIVES', payload: updates });
        showToast('Directivas institucionales actualizadas.', 'success');
    };

    const handleTakeLoan = (loan: BankLoan) => {
        if (confirm(`¿Solicitar préstamo "${loan.name}" por ${formatCurrency(loan.principal)}? Se amortizará a razón de ${formatCurrency(loan.weeklyPayment)}/semana durante ${loan.remainingWeeks} semanas.`)) {
            dispatch({ type: 'TAKE_LOAN', payload: { loan } });
            showToast(`Línea de crédito activada: +${formatCurrency(loan.principal)} añadidos al balance.`, 'success');
        }
    };

    const handleRepayLoan = (loanId: string) => {
        const targetLoan = (finances.activeLoans || []).find(l => l.id === loanId);
        if (!targetLoan) return;

        if (finances.balance < targetLoan.remainingAmount) {
            showToast('No dispones de liquidez suficiente para liquidar este préstamo.', 'error');
            return;
        }

        if (confirm(`¿Amortizar la totalidad del crédito "${targetLoan.name}" abonando ${formatCurrency(targetLoan.remainingAmount)}? Se eliminará la cuota semanal.`)) {
            dispatch({ type: 'REPAY_LOAN', payload: { loanId } });
            showToast(`¡Préstamo cancelado! Cuota semanal de ${formatCurrency(targetLoan.weeklyPayment)} eliminada.`, 'success');
        }
    };

    // Negotiation Engine
    const handleStartNegotiation = (sponsor: Sponsor) => {
        setNegotiatingSponsor(sponsor);
        setNegotiationPhase('idle');
        setNegotiationResult(null);
    };

    const handleExecuteNegotiation = (strategy: 'standard' | 'high_wage' | 'signing_bonus' | 'performance_gamble') => {
        if (!negotiatingSponsor) return;
        setNegotiationPhase('rolling');

        setTimeout(() => {
            const sp = negotiatingSponsor;
            let successChance = 1.0;
            let finalIncome = sp.weeklyIncome;
            let finalSigningBonus = sp.signingBonus ?? Math.floor(sp.weeklyIncome * 4);
            let fanImpact = sp.fanApprovalImpact || 0;
            let message = '';

            if (strategy === 'standard') {
                successChance = 1.0;
                message = `La marca ${sp.name} ha ratificado la propuesta estándar con un bono inicial de ${formatCurrency(finalSigningBonus)}.`;
            } else if (strategy === 'high_wage') {
                successChance = 0.75;
                if (Math.random() <= successChance) {
                    finalIncome = Math.round(sp.weeklyIncome * 1.15);
                    message = `¡Éxito en la cumbre! ${sp.name} aceptó mejorar el fijo semanal a ${formatCurrency(finalIncome)}/sem (+15%).`;
                } else {
                    dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId: sp.id } });
                    setNegotiationResult({
                        success: false,
                        message: `Los emisarios de ${sp.name} consideraron excesivas tus pretensiones salariales y se levantaron de la mesa.`
                    });
                    setNegotiationPhase('result');
                    return;
                }
            } else if (strategy === 'signing_bonus') {
                successChance = 0.70;
                if (Math.random() <= successChance) {
                    finalSigningBonus = Math.round((sp.signingBonus ?? (sp.weeklyIncome * 4)) * 1.50);
                    message = `¡Gran inyección de liquidez! ${sp.name} aceptó adelantar un mega bono de firma de ${formatCurrency(finalSigningBonus)}.`;
                } else {
                    dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId: sp.id } });
                    setNegotiationResult({
                        success: false,
                        message: `La junta directiva de ${sp.name} denegó el anticipo de caja y rompió el preacuerdo comercial.`
                    });
                    setNegotiationPhase('result');
                    return;
                }
            } else if (strategy === 'performance_gamble') {
                successChance = 0.85;
                if (Math.random() <= successChance) {
                    finalIncome = Math.round(sp.weeklyIncome * 1.30);
                    message = `¡Pacto de élite sellado! Ingreso semanal disparado a ${formatCurrency(finalIncome)}/sem (+30%) sujeto a cumplir los objetivos.`;
                } else {
                    dispatch({ type: 'REMOVE_SPONSOR_OFFER', payload: { sponsorId: sp.id } });
                    setNegotiationResult({
                        success: false,
                        message: `La dirección de ${sp.name} no creyó en el proyecto deportivo y descartó la alianza.`
                    });
                    setNegotiationPhase('result');
                    return;
                }
            }

            dispatch({
                type: 'ACCEPT_SPONSOR',
                payload: {
                    sponsorId: sp.id,
                    negotiatedIncome: finalIncome,
                    customSigningBonus: finalSigningBonus,
                    fanImpact
                }
            });

            setNegotiationResult({
                success: true,
                message,
                finalIncome,
                signingBonus: finalSigningBonus,
                fanImpact
            });
            setNegotiationPhase('result');
        }, 1100);
    };

    // Contract Termination
    const handleConfirmTermination = () => {
        if (!terminatingSponsor) return;
        const indemnityCost = Math.floor(terminatingSponsor.weeklyIncome * 4);
        if (finances.balance < indemnityCost) {
            showToast('El club no tiene fondos para indemnizar la rescisión del contrato.', 'error');
            return;
        }

        dispatch({
            type: 'TERMINATE_SPONSOR',
            payload: { sponsorId: terminatingSponsor.id, indemnityCost }
        });
        showToast(`Contrato con ${terminatingSponsor.name} rescindido. Espacio comercial liberado.`, 'info');
        setTerminatingSponsor(null);
    };

    const getSectorLabel = (sector?: string) => {
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

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-28 animate-fade-in text-white">
            {/* Header & Financial Status Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-inner">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded border border-[var(--apex-gold)]/20">
                                Dirección Financiera & Comercial
                            </span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest hidden sm:inline">
                                {team.name}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight mt-0.5">
                            Gestión Económica
                        </h1>
                    </div>
                </div>

                {/* Credit Rating & Fair Play Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-[#0C121F] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 shadow-md">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-base shadow-inner"
                             style={{ backgroundColor: `${health.color}20`, color: health.color, border: `1px solid ${health.color}40` }}>
                            {health.grade}
                        </div>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Calificación Solvencia</div>
                            <div className="text-xs font-black" style={{ color: health.color }}>
                                {health.label}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0C121F] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-md">
                        <ShieldCheck className={`w-4 h-4 ${health.fairPlayCompliant ? 'text-[var(--apex-green)]' : 'text-[var(--apex-red)]'}`} />
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Fair Play Financiero</div>
                            <div className="text-xs font-black text-white/80">
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
                    { key: 'decisions', label: 'Estrategia & Decisiones', icon: Sliders },
                    { key: 'banking', label: 'Banca & Préstamos', icon: Landmark, badge: totalDebt > 0 ? `${formatCurrencyShort(totalDebt)}` : undefined },
                    { key: 'stadium', label: 'Estadio & Obras', icon: Building2 },
                ].map(tab => {
                    const isActive = activeTab === tab.key;
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as TabKey)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                                isActive 
                                    ? 'bg-[var(--apex-gold)] text-black shadow-lg shadow-[var(--apex-gold)]/20' 
                                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-tight ${
                                    isActive ? 'bg-black text-[var(--apex-gold)]' : 'bg-[var(--apex-gold)]/20 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30'
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
                <div className="bg-[var(--apex-red)]/15 border-2 border-[var(--apex-red)]/50 rounded-2xl p-4 sm:p-5 flex items-start gap-4 animate-pulse shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-[var(--apex-red)]/20 flex items-center justify-center shrink-0 border border-[var(--apex-red)]/30">
                        <AlertTriangle className="w-5 h-5 text-[var(--apex-red)]" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[var(--apex-red)] font-black uppercase tracking-wider text-sm">
                            Alerta de Déficit Crítico ({formatCurrency(finances.balance)})
                        </p>
                        <p className="text-white/80 text-xs leading-relaxed font-medium">
                            El club ha entrado en números rojos. Los gastos salariales y operativos superan la liquidez disponible. 
                            La junta directiva podría congelar fichajes o emitir una moción de censura. Se recomienda solicitar una línea de crédito de tesorería en la pestaña <strong>Banca</strong> o reducir la política de gasto.
                        </p>
                    </div>
                </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                    {/* 4 Hero KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="apex-card p-5 border-t-2 border-[var(--apex-green)] relative overflow-hidden group">
                            <div className="text-[9px] font-black text-[var(--apex-green)] uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span>Tesorería General</span>
                                <Coins className="w-4 h-4 opacity-70" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {formatCurrency(finances.balance)}
                            </div>
                            <div className="text-[10px] text-white/50 mt-1 font-bold">
                                Fondos líquidos del club
                            </div>
                        </div>

                        <div className="apex-card p-5 border-t-2 border-[var(--apex-gold)] relative overflow-hidden group">
                            <div className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span>Presupuesto Fichajes</span>
                                <CreditCard className="w-4 h-4 opacity-70" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {formatCurrency(finances.transferBudget)}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-white/50 font-bold">Límite para altas</span>
                                <button 
                                    onClick={() => setActiveTab('decisions')}
                                    className="text-[9px] text-[var(--apex-gold)] font-black hover:underline cursor-pointer flex items-center gap-1"
                                >
                                    Reasignar <ArrowRightLeft className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        </div>

                        <div className={`apex-card p-5 border-t-2 ${netIncome >= 0 ? 'border-[var(--apex-green)]' : 'border-[var(--apex-red)]'} relative overflow-hidden group`}>
                            <div className="text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center justify-between text-white/50">
                                <span>Flujo Neto Semanal</span>
                                {netIncome >= 0 ? <TrendingUp className="w-4 h-4 text-[var(--apex-green)]" /> : <TrendingDown className="w-4 h-4 text-[var(--apex-red)]" />}
                            </div>
                            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${netIncome >= 0 ? 'text-[var(--apex-green)]' : 'text-[var(--apex-red)]'}`}>
                                {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
                                <span className="text-xs text-white/40 ml-1">/sem</span>
                            </div>
                            <div className="text-[10px] text-white/50 mt-1 font-bold">
                                {netIncome >= 0 ? 'Superávit operativo' : 'Déficit operativo semanal'}
                            </div>
                        </div>

                        <div className={`apex-card p-5 border-t-2 ${totalDebt > 0 ? 'border-amber-500' : 'border-emerald-500'} relative overflow-hidden group`}>
                            <div className="text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center justify-between text-white/50">
                                <span>Deuda Bancaria</span>
                                <Landmark className="w-4 h-4 opacity-70" />
                            </div>
                            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${totalDebt > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {totalDebt > 0 ? formatCurrency(totalDebt) : '0 €'}
                            </div>
                            <div className="text-[10px] text-white/50 mt-1 font-bold">
                                {totalDebt > 0 ? `${(finances.activeLoans || []).length} préstamos activos` : 'Sin deuda financiera'}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Comparative Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Weekly Income */}
                        <div className="apex-card p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--apex-green)] flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--apex-green)] shadow-[0_0_8px_rgba(76,175,80,0.5)]"></span>
                                    Ingresos Semanales
                                </h3>
                                <span className="text-sm font-black text-[var(--apex-green)]">
                                    {formatCurrency(breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + (breakdown.merchandisingRevenue || 0))}
                                </span>
                            </div>

                            <div className="space-y-3.5">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Taquilla & Entradas</span>
                                        <span className="font-black text-white">{formatCurrency(breakdown.matchdayRevenue)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[var(--apex-green)] h-full" style={{ width: `${Math.min(100, (breakdown.matchdayRevenue / (breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + 1)) * 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Patrocinios Comerciales</span>
                                        <span className="font-black text-white">{formatCurrency(breakdown.sponsorshipRevenue)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[var(--apex-gold)] h-full" style={{ width: `${Math.min(100, (breakdown.sponsorshipRevenue / (breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + 1)) * 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Derechos Televisivos</span>
                                        <span className="font-black text-white">{formatCurrency(breakdown.tvRevenue)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-sky-400 h-full" style={{ width: `${Math.min(100, (breakdown.tvRevenue / (breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + 1)) * 100)}%` }}></div>
                                    </div>
                                </div>

                                {(breakdown.merchandisingRevenue || 0) > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/60 font-bold">Merchandising & Camisetas</span>
                                            <span className="font-black text-white">{formatCurrency(breakdown.merchandisingRevenue)}</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-purple-400 h-full" style={{ width: `${Math.min(100, ((breakdown.merchandisingRevenue || 0) / (breakdown.matchdayRevenue + breakdown.sponsorshipRevenue + breakdown.tvRevenue + 1)) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Weekly Expenses */}
                        <div className="apex-card p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--apex-red)] flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--apex-red)] shadow-[0_0_8px_rgba(239,83,80,0.5)]"></span>
                                    Gastos Semanales
                                </h3>
                                <span className="text-sm font-black text-[var(--apex-red)]">
                                    {formatCurrency(breakdown.wageExpenses + breakdown.coachExpenses + breakdown.stadiumExpenses + breakdown.operationalExpenses + (breakdown.loanExpenses || 0) + (breakdown.youthAcademyExpenses || 0) + (breakdown.merchandisingExpenses || 0))}
                                </span>
                            </div>

                            <div className="space-y-3.5">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Masa Salarial (Plantilla)</span>
                                        <span className="font-black text-white">{formatCurrency(breakdown.wageExpenses)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[var(--apex-red)] h-full" style={{ width: `${Math.min(100, (breakdown.wageExpenses / (breakdown.wageExpenses + breakdown.operationalExpenses + breakdown.stadiumExpenses + 1)) * 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Cuerpo Técnico & DT</span>
                                        <span className="font-black text-white">{formatCurrency(breakdown.coachExpenses)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-orange-400 h-full" style={{ width: '15%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Mantenimiento de Instalaciones</span>
                                        <span className="font-black text-white">{formatCurrency(breakdown.stadiumExpenses)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-amber-400 h-full" style={{ width: '20%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Costes Operativos & Logística</span>
                                        <span className="font-black text-white">{formatCurrency(breakdown.operationalExpenses)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-slate-400 h-full" style={{ width: '25%' }}></div>
                                    </div>
                                </div>

                                {(breakdown.loanExpenses || 0) > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-amber-400 font-bold">Cuotas de Amortización Bancaria</span>
                                            <span className="font-black text-amber-400">{formatCurrency(breakdown.loanExpenses)}</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-amber-500 h-full" style={{ width: '30%' }}></div>
                                        </div>
                                    </div>
                                )}

                                {(breakdown.youthAcademyExpenses || 0) > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-emerald-400 font-bold">Inversión en Fútbol Base</span>
                                            <span className="font-black text-white">{formatCurrency(breakdown.youthAcademyExpenses)}</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full" style={{ width: '15%' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* End of Season Projection */}
                    <div className="apex-card p-6 bg-gradient-to-r from-black/40 via-black/20 to-black/40 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)] shrink-0">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-white">Proyección Financiera a Cierre de Temporada</h4>
                                <p className="text-xs text-white/60 mt-0.5">
                                    Con el ritmo operativo actual, se estima un balance final de aproximadamente{' '}
                                    <strong className={health.projectedEndBalance >= 0 ? 'text-[var(--apex-green)]' : 'text-[var(--apex-red)]'}>
                                        {formatCurrency(health.projectedEndBalance)}
                                    </strong>{' '}
                                    (sin considerar primas finales por título o traspasos).
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('decisions')}
                            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
                        >
                            Ajustar Estrategia
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 2: SPONSORS & BRANDS */}
            {activeTab === 'sponsors' && (
                <div className="space-y-8 animate-fade-in">
                    {/* The 4 Strategic Commercial Slots */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--apex-gold)]">
                                    Espacios Comerciales del Club
                                </h3>
                                <p className="text-xs text-white/50 mt-0.5">
                                    Solo es posible asignar una marca activa por espacio comercial. Los contratos tienen duración fija y penalización por rescisión anticipada.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {SPONSOR_SLOTS.map(slotMeta => {
                                const activeSponsor = sponsors.find(s => s.type === slotMeta.type);
                                const IconComponent = slotMeta.icon;

                                return (
                                    <div 
                                        key={slotMeta.type} 
                                        className={`apex-card p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                                            activeSponsor ? 'border-t-2' : 'border-dashed border-white/15'
                                        }`}
                                        style={{ borderTopColor: activeSponsor ? (activeSponsor.brandColor || slotMeta.accentColor) : undefined }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70">
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                                            {slotMeta.title}
                                                        </div>
                                                        <div className="text-[10px] text-white/60 font-bold truncate">
                                                            {slotMeta.subtitle}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {activeSponsor ? (
                                                <div className="space-y-3 my-2">
                                                    <div>
                                                        <div className="text-lg font-black text-white flex items-center gap-2">
                                                            {activeSponsor.name}
                                                        </div>
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-0.5 rounded w-fit mt-1 border border-[var(--apex-gold)]/20">
                                                            {getSectorLabel(activeSponsor.sector)}
                                                        </div>
                                                    </div>

                                                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-[10px] uppercase font-bold text-white/50">Ingreso</span>
                                                            <span className="font-black text-[var(--apex-green)]">{formatCurrency(activeSponsor.weeklyIncome)}/sem</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-[10px] uppercase font-bold text-white/50">Vigencia</span>
                                                            <span className="font-black text-white">{activeSponsor.duration} semanas</span>
                                                        </div>
                                                    </div>

                                                    {activeSponsor.clauses && activeSponsor.clauses.length > 0 && (
                                                        <div className="text-[10px] text-white/60 bg-white/5 p-2 rounded-lg border border-white/5 leading-tight">
                                                            <span className="font-bold text-[var(--apex-gold)]">Cláusula: </span>
                                                            {activeSponsor.clauses[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="py-6 text-center space-y-2">
                                                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                                        Espacio Disponible
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedSlotFilter(slotMeta.type)}
                                                        className="px-3 py-1.5 bg-[var(--apex-gold)]/10 hover:bg-[var(--apex-gold)] text-[var(--apex-gold)] hover:text-black rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-[var(--apex-gold)]/30 cursor-pointer"
                                                    >
                                                        Ver Ofertas
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {activeSponsor && (
                                            <button
                                                onClick={() => setTerminatingSponsor(activeSponsor)}
                                                className="mt-4 w-full py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                            >
                                                Rescindir Contrato
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Available Brand Offers Market */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[var(--apex-gold)]" />
                                    Mercado de Propuestas Comerciales
                                </h3>
                                <p className="text-xs text-white/50 mt-0.5">
                                    Evalúa propuestas y negocia mejores términos contractuales para maximizar la tesorería.
                                </p>
                            </div>

                            {/* Slot Filter Pills */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                    { key: 'all', label: 'Todos' },
                                    { key: 'shirt', label: 'Camiseta' },
                                    { key: 'kit', label: 'Indumentaria' },
                                    { key: 'stadium', label: 'Estadio' },
                                    { key: 'training', label: 'Secundario' },
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        onClick={() => setSelectedSlotFilter(f.key as any)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                            selectedSlotFilter === f.key
                                                ? 'bg-white text-black'
                                                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredOffers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredOffers.map(offer => (
                                    <div 
                                        key={offer.id} 
                                        className="apex-card p-5 flex flex-col justify-between hover:border-[var(--apex-gold)]/40 transition-all duration-300 relative group"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--apex-gold)]">
                                                        {offer.type === 'shirt' ? 'Frontal Camiseta' : offer.type === 'kit' ? 'Proveedor Técnico' : offer.type === 'stadium' ? 'Naming Estadio' : 'Partner Secundario'}
                                                    </div>
                                                    <div className="text-lg font-black text-white group-hover:text-[var(--apex-gold)] transition-colors">
                                                        {offer.name}
                                                    </div>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                                                    {offer.prestige || 'Continental'}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-white/60 mb-4 line-clamp-2 leading-relaxed">
                                                {offer.description || 'Acuerdo de patrocinio oficial con exposición en medios y activos de marketing.'}
                                            </p>

                                            <div className="space-y-2 mb-4 bg-black/30 p-3 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-[10px] uppercase font-bold text-white/50">Fijo Semanal</span>
                                                    <span className="font-black text-[var(--apex-green)] text-sm">{formatCurrency(offer.weeklyIncome)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-[10px] uppercase font-bold text-white/50">Bono de Bienvenida</span>
                                                    <span className="font-black text-white">{formatCurrency(offer.signingBonus || offer.weeklyIncome * 4)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-[10px] uppercase font-bold text-white/50">Duración</span>
                                                    <span className="font-black text-white">{Math.floor((offer.duration || 52) / 52)} Años ({offer.duration || 52} sem)</span>
                                                </div>
                                            </div>

                                            {/* Impact on fans & clauses */}
                                            <div className="space-y-1.5 mb-4">
                                                {(offer.fanApprovalImpact || 0) !== 0 && (
                                                    <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 ${
                                                        (offer.fanApprovalImpact || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {(offer.fanApprovalImpact || 0) > 0 ? '+' : ''}{offer.fanApprovalImpact}% Aprobación Socios ({offer.sector === 'betting' ? 'Polémica Apuestas' : 'Cariño Popular'})
                                                    </div>
                                                )}

                                                {offer.bonus && (
                                                    <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded font-bold">
                                                        Bono por logro: +{formatCurrency(offer.bonus.amount)} si cumple el objetivo
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleStartNegotiation(offer)}
                                            className="w-full py-2.5 rounded-xl bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                                        >
                                            <Handshake className="w-3.5 h-3.5" />
                                            Negociar Contrato
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="apex-card p-12 text-center border-dashed border-white/10">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                    No hay ofertas disponibles para este filtro. Revisa tras la próxima jornada de liga.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: DECISIONS & DIRECTIVES */}
            {activeTab === 'decisions' && (
                <div className="space-y-8 animate-fade-in">
                    {/* 1. Ticket Pricing Strategy */}
                    <div className="apex-card p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-[var(--apex-gold)]" />
                                    Estrategia de Precios de Entradas (Taquilla)
                                </h3>
                                <p className="text-xs text-white/50 mt-0.5">
                                    Afecta directamente la recaudación de cada partido como local y el estado de ánimo de los aficionados.
                                </p>
                            </div>
                            <div className="text-xs font-black text-white/70">
                                Precio Base: <span className="text-[var(--apex-green)]">{formatCurrency(stadium.ticketPrice)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            {[
                                {
                                    id: 'cheap',
                                    title: 'Precios Populares (Social)',
                                    price: formatCurrency(Math.floor(stadium.ticketPrice * 0.75)),
                                    desc: 'Descuento del 25%. Llena el aforo al 95-100% y genera euforia popular (+Aprobación socios).',
                                    badge: '+Socios / 95% Aforo',
                                    color: 'border-emerald-500/50 bg-emerald-500/5'
                                },
                                {
                                    id: 'standard',
                                    title: 'Tarifa Equilibrada (Estándar)',
                                    price: formatCurrency(stadium.ticketPrice),
                                    desc: 'Precios habituales de mercado. Asistencia dependiente del momento deportivo y posición en tabla.',
                                    badge: 'Equilibrado',
                                    color: 'border-sky-500/50 bg-sky-500/5'
                                },
                                {
                                    id: 'premium',
                                    title: 'Pase Prémium (VIP / Recaudación)',
                                    price: formatCurrency(Math.floor(stadium.ticketPrice * 1.35)),
                                    desc: 'Recargo del 35%. Maximiza ingresos brutos por butaca pero reduce afluencia si el equipo no brilla.',
                                    badge: 'Máximo Ingreso / -Afluencia',
                                    color: 'border-amber-500/50 bg-amber-500/5'
                                }
                            ].map(policy => {
                                const isSelected = (finances.ticketPolicy || 'standard') === policy.id;
                                return (
                                    <div
                                        key={policy.id}
                                        onClick={() => handleSetTicketPolicy(policy.id as TicketPolicy)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                            isSelected 
                                                ? `${policy.color} ring-2 ring-[var(--apex-gold)] shadow-lg` 
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-black text-sm text-white">{policy.title}</div>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--apex-gold)] shrink-0" />}
                                            </div>
                                            <div className="text-xl font-black text-[var(--apex-green)] mb-2">
                                                {policy.price} <span className="text-[10px] text-white/50 font-normal">/entrada</span>
                                            </div>
                                            <p className="text-xs text-white/60 leading-relaxed mb-3">
                                                {policy.desc}
                                            </p>
                                        </div>
                                        <div className="text-[9px] font-black uppercase tracking-wider text-white/40 pt-2 border-t border-white/5">
                                            {policy.badge}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Budget Reallocation Slider / Transfer */}
                    <div className="apex-card p-6 space-y-4">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                                Reasignación de Fondos Presidenciales
                            </h3>
                            <p className="text-xs text-white/50 mt-0.5">
                                Transfiere capital entre la Tesorería General del Club y el Presupuesto disponible para Fichajes.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setReallocateDirection('to_transfers')}
                                        className={`flex-1 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                            reallocateDirection === 'to_transfers' ? 'bg-[var(--apex-gold)] text-black' : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        A Fichajes →
                                    </button>
                                    <button
                                        onClick={() => setReallocateDirection('to_balance')}
                                        className={`flex-1 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                            reallocateDirection === 'to_balance' ? 'bg-[var(--apex-gold)] text-black' : 'text-white/60 hover:text-white'
                                        }`}
                                    >
                                        ← A Tesorería
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Monto a Transferir</span>
                                        <span className="font-black text-[var(--apex-gold)] text-base">{formatCurrency(reallocateAmount)}</span>
                                    </div>

                                    {/* Quick Amount Buttons */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {[500_000, 1_000_000, 5_000_000, 10_000_000].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setReallocateAmount(amt)}
                                                className={`py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                                    reallocateAmount === amt ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                                                }`}
                                            >
                                                +{formatCurrencyShort(amt)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleReallocateBudget}
                                    className="w-full py-3 rounded-xl bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                                >
                                    Confirmar Traspaso de Fondos
                                </button>
                            </div>

                            <div className="bg-black/40 rounded-xl p-5 border border-white/5 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Balance Actual vs Fichajes</div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/70 font-bold">Tesorería General:</span>
                                            <span className="font-black text-white">{formatCurrency(finances.balance)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/70 font-bold">Presupuesto Fichajes:</span>
                                            <span className="font-black text-[var(--apex-gold)]">{formatCurrency(finances.transferBudget)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[11px] text-white/50 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                    💡 <strong>Consejo del Director Deportivo:</strong> Si planeas el fichaje de un jugador estrella en el mercado, inyecta liquidez desde la tesorería. Si la deuda semanal aumenta, devuelve fondos para salvaguardar la solvencia institucional.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Club Directives */}
                    <div className="apex-card p-6 space-y-4">
                        <div className="border-b border-white/10 pb-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-2">
                                <Award className="w-4 h-4 text-[var(--apex-gold)]" />
                                Directivas Estratégicas y Políticas de Inversión
                            </h3>
                            <p className="text-xs text-white/50 mt-0.5">
                                Decisiones de gasto que moldean la cantera, la proyección internacional y la motivación deportiva de la plantilla.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            {/* Youth Academy Investment */}
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                                <div className="text-xs font-black uppercase tracking-wider text-white">Inversión en Fuerzas Básicas</div>
                                <p className="text-[11px] text-white/60 leading-relaxed">
                                    Financiación de centros formativos, ojeadores juveniles y equipamiento de academia.
                                </p>
                                <div className="space-y-1.5 pt-2">
                                    {[
                                        { key: 'low', label: 'Austera (0 €/sem)' },
                                        { key: 'medium', label: 'Competitiva (~20K/sem)' },
                                        { key: 'high', label: 'Alto Rendimiento (~65K/sem)' },
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => handleUpdateDirectives({ youthInvestment: opt.key as any })}
                                            className={`w-full py-2 px-3 rounded-lg text-left text-xs font-black transition-all cursor-pointer flex items-center justify-between ${
                                                (finances.clubDirectives?.youthInvestment || 'low') === opt.key 
                                                    ? 'bg-[var(--apex-gold)] text-black' 
                                                    : 'bg-black/30 text-white/70 hover:text-white border border-white/5'
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {(finances.clubDirectives?.youthInvestment || 'low') === opt.key && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Global Marketing */}
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                                <div className="text-xs font-black uppercase tracking-wider text-white">Marketing & Venta de Camisetas</div>
                                <p className="text-[11px] text-white/60 leading-relaxed">
                                    Campañas comerciales internacionales para rentabilizar la imagen de los futbolistas estrella.
                                </p>
                                <div className="pt-2">
                                    <button
                                        onClick={() => handleUpdateDirectives({ globalMarketing: !finances.clubDirectives?.globalMarketing })}
                                        className={`w-full py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                            finances.clubDirectives?.globalMarketing 
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                                                : 'bg-black/30 text-white/60 hover:text-white border border-white/5'
                                        }`}
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {finances.clubDirectives?.globalMarketing ? 'Campaña Global ACTIVA' : 'Activar Campañas (+Ventas)'}
                                    </button>
                                </div>
                                <div className="text-[10px] text-white/40 leading-tight">
                                    Costo: ~25.000 €/sem. Retorno: ingresos semanales multiplicados por el promedio de rating de los 5 cracks de tu equipo.
                                </div>
                            </div>

                            {/* Win Bonuses */}
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                                <div className="text-xs font-black uppercase tracking-wider text-white">Primas de Plantilla por Victoria</div>
                                <p className="text-[11px] text-white/60 leading-relaxed">
                                    Incentivos económicos por partido oficial ganado. Estimula la moral competitiva.
                                </p>
                                <div className="space-y-1.5 pt-2">
                                    {[
                                        { key: 'none', label: 'Sin Primas Extra (0 €)' },
                                        { key: 'normal', label: 'Primas Estándar (+Moral)' },
                                        { key: 'high', label: 'Superprimas (+Moral Élite)' },
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => handleUpdateDirectives({ winBonuses: opt.key as any })}
                                            className={`w-full py-2 px-3 rounded-lg text-left text-xs font-black transition-all cursor-pointer flex items-center justify-between ${
                                                (finances.clubDirectives?.winBonuses || 'none') === opt.key 
                                                    ? 'bg-[var(--apex-gold)] text-black' 
                                                    : 'bg-black/30 text-white/70 hover:text-white border border-white/5'
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {(finances.clubDirectives?.winBonuses || 'none') === opt.key && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: BANKING & LOANS */}
            {activeTab === 'banking' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Active Loans Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-2">
                                    <Landmark className="w-4 h-4 text-[var(--apex-gold)]" />
                                    Deuda Bancaria y Préstamos Vigentes
                                </h3>
                                <p className="text-xs text-white/50 mt-0.5">
                                    Control de cuotas semanales de amortización. Puedes cancelar cualquier deuda anticipadamente si cuentas con liquidez.
                                </p>
                            </div>
                        </div>

                        {(finances.activeLoans || []).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(finances.activeLoans || []).map(loan => (
                                    <div key={loan.id} className="apex-card p-5 space-y-4 border-l-4 border-l-amber-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-amber-400">Préstamo Activo</div>
                                                <div className="text-base font-black text-white">{loan.name}</div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                {loan.remainingWeeks} sem rest.
                                            </span>
                                        </div>

                                        <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-white/50 font-bold">Capital Pendiente</span>
                                                <span className="font-black text-amber-400">{formatCurrency(loan.remainingAmount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-white/50 font-bold">Cuota Semanal</span>
                                                <span className="font-black text-[var(--apex-red)]">{formatCurrency(loan.weeklyPayment)}/sem</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-white/50 font-bold">Tasa Interés</span>
                                                <span className="font-black text-white">{(loan.interestRate * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRepayLoan(loan.id)}
                                            disabled={finances.balance < loan.remainingAmount}
                                            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                                                finances.balance >= loan.remainingAmount
                                                    ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 cursor-pointer shadow-md'
                                                    : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                                            }`}
                                        >
                                            Liquidar Deuda ({formatCurrency(loan.remainingAmount)})
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="apex-card p-8 text-center border-dashed border-white/10 space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-[var(--apex-green)] mx-auto opacity-80" />
                                <div className="text-xs font-black uppercase tracking-widest text-white">Sin Deuda Bancaria Activa</div>
                                <p className="text-[11px] text-white/50">El club no arrastra préstamos ni paga cuotas semanales de amortización.</p>
                            </div>
                        )}
                    </div>

                    {/* Available Loan Packages */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <Coins className="w-4 h-4 text-[var(--apex-gold)]" />
                                Líneas de Financiación Institucional Disponibles
                            </h3>
                            <p className="text-xs text-white/50 mt-0.5">
                                Préstamos corporativos diseñados para afrontar fichajes estelares, contingencias de caja o ampliaciones de estadio.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {availableLoanOffers.map(loan => (
                                <div key={loan.id} className="apex-card p-5 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-all duration-300">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-black text-base text-white">{loan.name}</div>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-white/60">
                                                {loan.remainingWeeks} sem
                                            </span>
                                        </div>

                                        <div className="text-2xl font-black text-[var(--apex-green)] mb-3">
                                            +{formatCurrency(loan.principal)}
                                        </div>

                                        <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/5 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/50 font-bold">Cuota Semanal</span>
                                                <span className="font-black text-[var(--apex-red)]">{formatCurrency(loan.weeklyPayment)}/sem</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/50 font-bold">Total a Devolver</span>
                                                <span className="font-black text-white">{formatCurrency(loan.remainingAmount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white/50 font-bold">Interés Fijo</span>
                                                <span className="font-black text-amber-400">{(loan.interestRate * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleTakeLoan(loan)}
                                        className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black font-black text-xs uppercase tracking-wider transition-all border border-amber-500/30 cursor-pointer shadow-md"
                                    >
                                        Solicitar Crédito Bancario
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: STADIUM & FACILITIES */}
            {activeTab === 'stadium' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Stadium Status Card */}
                        <div className="apex-card p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--apex-gold)] flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-[var(--apex-gold)]" />
                                    Ficha del Estadio
                                </h3>
                                <span className="text-xs font-bold text-white/50">{stadium.city || 'Sede del Club'}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Nombre del Recinto</span>
                                    <span className="text-sm text-white font-black">{stadium.name}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Aforo Total</span>
                                    <span className="text-sm text-[var(--apex-gold)] font-black">{stadium.capacity.toLocaleString()} espectadores</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Precio de Entrada Base</span>
                                    <span className="text-sm text-[var(--apex-green)] font-black">{formatCurrency(stadium.ticketPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                    <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Mantenimiento Semanal</span>
                                    <span className="text-sm text-[var(--apex-red)] font-black">{formatCurrency(stadium.maintenanceCost)}/sem</span>
                                </div>
                            </div>

                            {/* Capacity Expansion Project */}
                            <div className="pt-4 border-t border-white/10">
                                {stadium.expansionCost ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/60 font-bold">Proyecto de Ampliación de Gradas</span>
                                            <span className="text-[var(--apex-gold)] font-black">+{((stadium.expansionCapacity || 0) - stadium.capacity).toLocaleString()} butacas</span>
                                        </div>
                                        <button
                                            onClick={handleExpandStadium}
                                            disabled={finances.balance < stadium.expansionCost}
                                            className={`w-full py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${
                                                finances.balance >= stadium.expansionCost
                                                    ? 'bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-black cursor-pointer shadow-lg'
                                                    : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                                            }`}
                                        >
                                            Ampliar a {stadium.expansionCapacity?.toLocaleString()} Asientos
                                            <div className="text-[10px] font-normal opacity-70 mt-0.5">
                                                Costo de Obra: {formatCurrency(stadium.expansionCost)}
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5">
                                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                            Estadio en su Máxima Capacidad Estructural
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* VIP Facilities & Hospitality */}
                        <div className="apex-card p-6 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    Experiencia VIP & Palcos Corporativos
                                </h3>
                                <span className="text-xs font-black text-purple-400">
                                    Nivel {stadium.facilityLevel} de 5
                                </span>
                            </div>

                            <p className="text-xs text-white/60 leading-relaxed">
                                La modernización de palcos y zonas VIP atrae a empresas y patrocinadores de alto poder adquisitivo, incrementando la recaudación de día de partido en un <strong>+12.5% por nivel</strong>.
                            </p>

                            {/* Level Visual Stars */}
                            <div className="flex items-center gap-2 bg-black/40 p-4 rounded-xl border border-white/5 justify-center">
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <div 
                                        key={lvl} 
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all ${
                                            lvl <= stadium.facilityLevel 
                                                ? 'bg-purple-600/20 text-purple-400 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                                                : 'bg-white/5 text-white/20 border-white/5'
                                        }`}
                                    >
                                        ★
                                    </div>
                                ))}
                            </div>

                            {stadium.facilityLevel < 5 ? (
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-bold">Siguiente Nivel: Palcos VIP Nivel {stadium.facilityLevel + 1}</span>
                                        <span className="text-emerald-400 font-black">+12.5% Recaudación</span>
                                    </div>
                                    <button
                                        onClick={handleUpgradeFacility}
                                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                                    >
                                        Modernizar Palcos al Nivel {stadium.facilityLevel + 1}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-purple-600/10 p-4 rounded-xl text-center border border-purple-500/20">
                                    <span className="text-xs font-black text-purple-300 uppercase tracking-widest">
                                        Instalaciones Cinco Estrellas (Nivel Máximo)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* NEGOTIATION MODAL */}
            <AnimatePresence>
                {negotiatingSponsor && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0C121F] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden"
                        >
                            <button
                                onClick={() => setNegotiatingSponsor(null)}
                                className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Modal Header */}
                            <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl"
                                     style={{ color: negotiatingSponsor.brandColor || '#C8A84E' }}>
                                    {negotiatingSponsor.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--apex-gold)]">
                                        Mesa de Negociación Comercial
                                    </div>
                                    <h2 className="text-xl font-black text-white">{negotiatingSponsor.name}</h2>
                                </div>
                            </div>

                            {negotiationPhase === 'idle' && (
                                <div className="space-y-4">
                                    {/* Proposal Summary */}
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/50 font-bold">Oferta Semanal Base:</span>
                                            <span className="font-black text-[var(--apex-green)] text-sm">{formatCurrency(negotiatingSponsor.weeklyIncome)}/sem</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/50 font-bold">Bono de Bienvenida:</span>
                                            <span className="font-black text-white">{formatCurrency(negotiatingSponsor.signingBonus || negotiatingSponsor.weeklyIncome * 4)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-white/50 font-bold">Plazo:</span>
                                            <span className="font-black text-white">{negotiatingSponsor.duration || 52} semanas</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-white/70 italic">
                                        "Los emisarios de la marca aguardan tu postura para cerrar el contrato o debatir ajustes."
                                    </p>

                                    {/* 4 Interactive Negotiation Strategies */}
                                    <div className="space-y-2.5 pt-2">
                                        <button
                                            onClick={() => handleExecuteNegotiation('standard')}
                                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="font-black text-xs text-white group-hover:text-[var(--apex-gold)]">
                                                    1. Aceptar Oferta Base (Sin Riesgo)
                                                </div>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">100% Éxito</span>
                                            </div>
                                            <p className="text-[10px] text-white/50 mt-1">Firma inmediata con el sueldo y bono de bienvenida pactados.</p>
                                        </button>

                                        <button
                                            onClick={() => handleExecuteNegotiation('high_wage')}
                                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="font-black text-xs text-white group-hover:text-[var(--apex-gold)]">
                                                    2. Exigir Mejora Salarial (+15% Semanal)
                                                </div>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">75% Éxito</span>
                                            </div>
                                            <p className="text-[10px] text-white/50 mt-1">Argumentas el peso mediático de la hinchada. Si aceptan, sube el fijo.</p>
                                        </button>

                                        <button
                                            onClick={() => handleExecuteNegotiation('signing_bonus')}
                                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="font-black text-xs text-white group-hover:text-[var(--apex-gold)]">
                                                    3. Exigir Liquidez Inmediata (+50% Bono de Firma)
                                                </div>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">70% Éxito</span>
                                            </div>
                                            <p className="text-[10px] text-white/50 mt-1">Mayor inyección de dinero en mano hoy para gastar en fichajes.</p>
                                        </button>

                                        <button
                                            onClick={() => handleExecuteNegotiation('performance_gamble')}
                                            className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="font-black text-xs text-white group-hover:text-[var(--apex-gold)]">
                                                    4. Pacto de Alto Rendimiento (+30% Sueldo)
                                                </div>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">85% Éxito</span>
                                            </div>
                                            <p className="text-[10px] text-white/50 mt-1">Máximo beneficio semanal sujeto al cumplimiento de objetivos deportivos.</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {negotiationPhase === 'rolling' && (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-[var(--apex-gold)]/30 border-t-[var(--apex-gold)] rounded-full animate-spin"></div>
                                    <p className="text-xs font-black uppercase tracking-wider text-white">
                                        Debatiendo condiciones con la directiva de {negotiatingSponsor.name}...
                                    </p>
                                </div>
                            )}

                            {negotiationPhase === 'result' && negotiationResult && (
                                <div className="space-y-4 pt-2 text-center">
                                    <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                                        negotiationResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {negotiationResult.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                                    </div>

                                    <h3 className="text-lg font-black text-white">
                                        {negotiationResult.success ? '¡Acuerdo Cerrado con Éxito!' : 'Negociaciones Fracasadas'}
                                    </h3>

                                    <p className="text-xs text-white/80 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
                                        {negotiationResult.message}
                                    </p>

                                    <button
                                        onClick={() => setNegotiatingSponsor(null)}
                                        className="w-full py-3 rounded-xl bg-[var(--apex-gold)] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TERMINATION MODAL */}
            <AnimatePresence>
                {terminatingSponsor && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-[#0C121F] border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 text-red-400">
                                <AlertTriangle className="w-6 h-6 shrink-0" />
                                <h3 className="font-black text-base uppercase tracking-wider text-white">
                                    Rescindir Acuerdo Comercial
                                </h3>
                            </div>

                            <p className="text-xs text-white/70 leading-relaxed">
                                ¿Estás seguro de rescindir unilateralmente el contrato con <strong>{terminatingSponsor.name}</strong>?
                            </p>

                            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl space-y-1 text-xs">
                                <div className="text-white/60 font-bold">Indemnización por Ruptura Anticipada:</div>
                                <div className="text-base font-black text-red-400">
                                    {formatCurrency(Math.floor(terminatingSponsor.weeklyIncome * 4))}
                                </div>
                                <div className="text-[10px] text-white/40 pt-1">
                                    El espacio comercial quedará libre de inmediato para evaluar nuevas marcas.
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setTerminatingSponsor(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-black text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmTermination}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-red-600/30"
                                >
                                    Abonar y Rescindir
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
