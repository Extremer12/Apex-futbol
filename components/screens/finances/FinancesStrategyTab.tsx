import React, { useState } from 'react';
import { TicketPolicy, MembershipPolicy, ClubDirectives, Stadium, ClubMembership } from '../../../types';
import { formatCurrencyShort } from '../../../utils';
import { getDirectiveCosts } from '../../../services/economy';
import { calculateMembershipRevenue, MEMBERSHIP_POLICY_META } from '../../../services/membership';
import { Tag, ArrowRightLeft, Award, Globe, CheckCircle2, Info, Users } from 'lucide-react';

interface FinancesStrategyTabProps {
    stadium: Stadium;
    membership?: ClubMembership;
    currentPolicy: TicketPolicy;
    currentMembershipPolicy?: MembershipPolicy;
    directives: ClubDirectives | undefined;
    balance: number;
    transferBudget: number;
    leagueId: string;
    onSetTicketPolicy: (policy: TicketPolicy) => void;
    onSetMembershipPolicy?: (policy: MembershipPolicy) => void;
    onReallocateBudget: (amount: number, direction: 'to_transfers' | 'to_balance') => void;
    onUpdateDirectives: (directives: Partial<ClubDirectives>) => void;
}

export const FinancesStrategyTab: React.FC<FinancesStrategyTabProps> = React.memo(({
    stadium,
    membership,
    currentPolicy,
    currentMembershipPolicy = 'standard',
    directives,
    balance,
    transferBudget,
    leagueId,
    onSetTicketPolicy,
    onSetMembershipPolicy,
    onReallocateBudget,
    onUpdateDirectives
}) => {
    const [reallocateDirection, setReallocateDirection] = useState<'to_transfers' | 'to_balance'>('to_transfers');
    const [reallocateAmount, setReallocateAmount] = useState<number>(1_000_000);

    const directiveCosts = getDirectiveCosts(directives, leagueId);
    const maxTransferable = reallocateDirection === 'to_transfers' ? Math.max(0, balance) : Math.max(0, transferBudget);
    const validAmount = Math.min(reallocateAmount, maxTransferable);

    const handleApplyReallocation = () => {
        if (validAmount <= 0) return;
        onReallocateBudget(validAmount, reallocateDirection);
    };

    return (
        <div className="space-y-4">
            {/* 1. Ticket Pricing Strategy */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[var(--apex-gold)]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">Política de Entradas</h3>
                    </div>
                    <span className="text-[11px] text-slate-400">
                        Base: <strong className="text-emerald-400">{formatCurrencyShort(stadium.ticketPrice)}</strong>
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                        {
                            id: 'cheap' as TicketPolicy,
                            title: 'Popular',
                            price: Math.floor(stadium.ticketPrice * 0.75),
                            desc: '95-100% asistencia · +3 aprobación socios'
                        },
                        {
                            id: 'standard' as TicketPolicy,
                            title: 'Estándar',
                            price: stadium.ticketPrice,
                            desc: 'Afluencia normal según posición'
                        },
                        {
                            id: 'premium' as TicketPolicy,
                            title: 'Prémium',
                            price: Math.floor(stadium.ticketPrice * 1.35),
                            desc: 'Máximo ingreso · -3 aprobación socios'
                        }
                    ].map(policy => {
                        const isSelected = (currentPolicy || 'standard') === policy.id;
                        return (
                            <button
                                key={policy.id}
                                onClick={() => onSetTicketPolicy(policy.id)}
                                className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${isSelected
                                        ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]'
                                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black text-white">{policy.title}</span>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--apex-gold)] shrink-0" />}
                                </div>
                                <div className="text-lg font-black text-emerald-400 tabular-nums">
                                    {formatCurrencyShort(policy.price)}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 leading-snug">{policy.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 1.5 Membership Fee Strategy (Cuota Social) */}
            {membership && onSetMembershipPolicy && (
                <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-white">Política de Cuota Social</h3>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            Padrón: <strong className="text-white">{membership.activeMembers.toLocaleString()} socios</strong>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {(['popular', 'standard', 'exclusive'] as MembershipPolicy[]).map(policyKey => {
                            const meta = MEMBERSHIP_POLICY_META[policyKey];
                            const projectedWeekly = calculateMembershipRevenue(membership, policyKey);
                            const isSelected = currentMembershipPolicy === policyKey;
                            return (
                                <button
                                    key={policyKey}
                                    onClick={() => onSetMembershipPolicy(policyKey)}
                                    className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${isSelected
                                            ? 'bg-emerald-500/10 border-emerald-400'
                                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black text-white">{meta.label}</span>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                    </div>
                                    <div className="text-lg font-black text-emerald-400 tabular-nums">
                                        {formatCurrencyShort(projectedWeekly)}/sem
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{meta.shortDesc}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Budget Reallocation */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3.5">
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
                    <ArrowRightLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Reasignación de Fondos</h3>
                </div>

                <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl">
                    <button
                        onClick={() => setReallocateDirection('to_transfers')}
                        className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${reallocateDirection === 'to_transfers' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Tesorería a Fichajes
                    </button>
                    <button
                        onClick={() => setReallocateDirection('to_balance')}
                        className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${reallocateDirection === 'to_balance' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Fichajes a Tesorería
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Monto a transferir</span>
                    <span className="font-black text-[var(--apex-gold)] text-sm tabular-nums">{formatCurrencyShort(validAmount)}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {[0.25, 0.50, 0.75, 1.0].map(pct => {
                        const val = Math.floor(maxTransferable * pct);
                        return (
                            <button
                                key={pct}
                                onClick={() => setReallocateAmount(val)}
                                className="py-1.5 rounded-xl text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                            >
                                {pct === 1.0 ? '100%' : `${pct * 100}%`}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleApplyReallocation}
                    disabled={validAmount <= 0}
                    className={`w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider transition-colors ${validAmount > 0
                            ? 'bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950 cursor-pointer'
                            : 'bg-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    Confirmar Traspaso ({formatCurrencyShort(validAmount)})
                </button>

                <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <Info className="w-4 h-4 text-[var(--apex-gold)] shrink-0 mt-0.5" />
                    <span>
                        Tesorería: <strong className="text-white">{formatCurrencyShort(balance)}</strong> · Fichajes: <strong className="text-[var(--apex-gold)]">{formatCurrencyShort(transferBudget)}</strong>
                    </span>
                </div>
            </div>

            {/* 3. Club Directives */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3.5">
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
                    <Award className="w-4 h-4 text-[var(--apex-gold)]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Directivas Institucionales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Cantera */}
                    <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2.5 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-black text-white">Fuerzas Básicas</div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Mejora el potencial de los juveniles.</p>
                        </div>
                        <div className="space-y-1.5">
                            {[
                                { key: 'low', label: 'Austera (0)', bonus: '+0' },
                                { key: 'medium', label: `Media (${formatCurrencyShort(Math.floor(22_000 * directiveCosts.scale))})`, bonus: '+3 POT' },
                                { key: 'high', label: `Élite (${formatCurrencyShort(Math.floor(65_000 * directiveCosts.scale))})`, bonus: '+6 POT' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => onUpdateDirectives({ youthInvestment: opt.key as any })}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${(directives?.youthInvestment || 'low') === opt.key
                                            ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                            : 'bg-white/5 text-slate-300 hover:text-white'
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    <span className="text-[10px] font-black">{opt.bonus}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Marketing Global */}
                    <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2.5 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-black text-white">Marketing Global</div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Costo: ~{formatCurrencyShort(Math.floor(25_000 * directiveCosts.scale))}/sem. Monetiza a tus figuras.
                            </p>
                        </div>
                        <button
                            onClick={() => onUpdateDirectives({ globalMarketing: !directives?.globalMarketing })}
                            className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${directives?.globalMarketing
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                                }`}
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>{directives?.globalMarketing ? 'Campaña Activa' : 'Activar Campaña'}</span>
                        </button>
                    </div>

                    {/* Primas por Victoria */}
                    <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2.5 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-black text-white">Primas por Victoria</div>
                            <p className="text-[11px] text-slate-400 mt-0.5">Bonos por triunfo para elevar la moral.</p>
                        </div>
                        <div className="space-y-1.5">
                            {[
                                { key: 'none', label: 'Sin primas', bonus: '0' },
                                { key: 'normal', label: `Estándar (${formatCurrencyShort(Math.floor(15_000 * directiveCosts.scale))})`, bonus: '+Moral' },
                                { key: 'high', label: `Élite (${formatCurrencyShort(Math.floor(40_000 * directiveCosts.scale))})`, bonus: '+Moral II' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => onUpdateDirectives({ winBonuses: opt.key as any })}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${(directives?.winBonuses || 'none') === opt.key
                                            ? 'bg-[var(--apex-gold)] text-slate-950 font-black'
                                            : 'bg-white/5 text-slate-300 hover:text-white'
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    <span className="text-[10px] font-black">{opt.bonus}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
