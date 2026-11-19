import React, { useState } from 'react';
import { TicketPolicy, ClubDirectives, Stadium } from '../../../types';
import { formatCurrency, formatCurrencyShort } from '../../../utils';
import { getDirectiveCosts } from '../../../services/economy';
import { Tag, ArrowRightLeft, Award, Check, Sparkles, CheckCircle2 } from 'lucide-react';

interface FinancesStrategyTabProps {
    stadium: Stadium;
    currentPolicy: TicketPolicy;
    directives: ClubDirectives | undefined;
    balance: number;
    transferBudget: number;
    leagueId: string;
    onSetTicketPolicy: (policy: TicketPolicy) => void;
    onReallocateBudget: (amount: number, direction: 'to_transfers' | 'to_balance') => void;
    onUpdateDirectives: (directives: Partial<ClubDirectives>) => void;
}

export const FinancesStrategyTab: React.FC<FinancesStrategyTabProps> = React.memo(({
    stadium,
    currentPolicy,
    directives,
    balance,
    transferBudget,
    leagueId,
    onSetTicketPolicy,
    onReallocateBudget,
    onUpdateDirectives
}) => {
    // Reallocation state
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
        <div className="space-y-8 animate-fade-in">
            {/* 1. Ticket Pricing Strategy */}
            <div className="apex-card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--apex-gold)] flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[var(--apex-gold)]" />
                            Estrategia de Precios de Entradas (Taquilla)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Modifica el valor del boleto, la afluencia al estadio y el estado de ánimo de los socios del club.
                        </p>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold">
                        Precio Base: <span className="text-emerald-400 font-bold">{formatCurrencyShort(stadium.ticketPrice)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {[
                        {
                            id: 'cheap' as TicketPolicy,
                            title: 'Precios Populares (Social)',
                            price: Math.floor(stadium.ticketPrice * 0.75),
                            desc: 'Descuento del 25% por butaca. Llena el estadio al 95-100% y genera simpatía popular (+3 Aprobación de socios).',
                            badge: '95-100% Asistencia · +3 Aprobación',
                            color: 'border-emerald-500/50 bg-emerald-500/5'
                        },
                        {
                            id: 'standard' as TicketPolicy,
                            title: 'Tarifa Equilibrada (Estándar)',
                            price: stadium.ticketPrice,
                            desc: 'Precio oficial de referencia. La afluencia fluctúa según el momento deportivo y la posición en la tabla.',
                            badge: 'Afluencia Normal · Neutro',
                            color: 'border-sky-500/50 bg-sky-500/5'
                        },
                        {
                            id: 'premium' as TicketPolicy,
                            title: 'Pase Prémium (Recaudación)',
                            price: Math.floor(stadium.ticketPrice * 1.35),
                            desc: 'Recargo del 35%. Maximiza el ingreso por butaca pero reduce la asistencia si el equipo no está en el Top 4 (-3 Aprobación).',
                            badge: 'Máximo Ingreso · -Afluencia en crisis',
                            color: 'border-amber-500/50 bg-amber-500/5'
                        }
                    ].map(policy => {
                        const isSelected = (currentPolicy || 'standard') === policy.id;
                        return (
                            <div
                                key={policy.id}
                                onClick={() => onSetTicketPolicy(policy.id)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                        ? `${policy.color} ring-2 ring-[var(--apex-gold)] shadow-lg`
                                        : 'border-white/10 bg-slate-950/40 hover:bg-slate-900/60'
                                }`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-sm text-white">{policy.title}</div>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--apex-gold)] shrink-0" />}
                                    </div>
                                    <div className="text-xl font-black text-emerald-400 mb-2">
                                        {formatCurrency(policy.price)} <span className="text-[10px] text-slate-400 font-normal">/entrada</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                        {policy.desc}
                                    </p>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-white/5">
                                    {policy.badge}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. Budget Reallocation */}
            <div className="apex-card p-6 space-y-4">
                <div className="border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--apex-gold)] flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-[var(--apex-gold)]" />
                        Reasignación Presidencial de Fondos
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Transfiere liquidez entre la Tesorería General del Club y el Presupuesto disponible para Fichajes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/10">
                            <button
                                onClick={() => setReallocateDirection('to_transfers')}
                                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                                    reallocateDirection === 'to_transfers' ? 'bg-[var(--apex-gold)] text-slate-950' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Tesorería → Fichajes
                            </button>
                            <button
                                onClick={() => setReallocateDirection('to_balance')}
                                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                                    reallocateDirection === 'to_balance' ? 'bg-[var(--apex-gold)] text-slate-950' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Fichajes → Tesorería
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Monto Seleccionado:</span>
                                <span className="font-black text-[var(--apex-gold)] text-base">{formatCurrency(validAmount)}</span>
                            </div>

                            {/* Percentage / Quick Amount Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                                {[0.25, 0.50, 0.75, 1.0].map(pct => {
                                    const val = Math.floor(maxTransferable * pct);
                                    return (
                                        <button
                                            key={pct}
                                            onClick={() => setReallocateAmount(val)}
                                            className="py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                                        >
                                            {pct === 1.0 ? '100% Máx' : `${pct * 100}%`}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleApplyReallocation}
                            disabled={validAmount <= 0}
                            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-lg ${
                                validAmount > 0
                                    ? 'bg-[var(--apex-gold)] hover:bg-[var(--apex-gold-light)] text-slate-950 cursor-pointer'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Confirmar Traspaso de Fondos ({formatCurrencyShort(validAmount)})
                        </button>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Balance Actual vs Fichajes</div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-300">Tesorería General:</span>
                                    <span className="font-bold text-white">{formatCurrency(balance)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-300">Presupuesto Fichajes:</span>
                                    <span className="font-bold text-[var(--apex-gold)]">{formatCurrency(transferBudget)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                            💡 <strong>Estrategia de Mercado:</strong> Incrementa el presupuesto de fichajes para incorporar jugadores de mayor jerarquía. Si el flujo semanal es deficitario, devuelve capital a tesorería para evitar entrar en números rojos.
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Club Directives */}
            <div className="apex-card p-6 space-y-4">
                <div className="border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[var(--apex-gold)] flex items-center gap-2">
                        <Award className="w-4 h-4 text-[var(--apex-gold)]" />
                        Directivas Institucionales y Políticas de Inversión
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Inversiones con impacto real y medible en la cantera, ingresos comerciales y motivación del plantel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {/* Inversión Cantera */}
                    <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/40 space-y-3 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-wider text-white">Fuerzas Básicas (Cantera)</div>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                Genera graduados juveniles con mayor promedio y potencial de debut en primera.
                            </p>
                        </div>
                        <div className="space-y-1.5 pt-2">
                            {[
                                { key: 'low', label: 'Austera (0 €/sem)', bonus: '+0 OVR' },
                                { key: 'medium', label: `Media (${formatCurrencyShort(Math.floor(22_000 * directiveCosts.scale))}/sem)`, bonus: '+3 Potencial' },
                                { key: 'high', label: `Élite (${formatCurrencyShort(Math.floor(65_000 * directiveCosts.scale))}/sem)`, bonus: '+6 Potencial' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => onUpdateDirectives({ youthInvestment: opt.key as any })}
                                    className={`w-full py-2 px-3 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                                        (directives?.youthInvestment || 'low') === opt.key
                                            ? 'bg-[var(--apex-gold)] text-slate-950'
                                            : 'bg-white/5 text-slate-300 hover:text-white border border-white/5'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    <span className="text-[10px] font-black">{opt.bonus}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Marketing Global */}
                    <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/40 space-y-3 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-wider text-white">Marketing & Camisetas</div>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                Campañas comerciales internacionales para rentabilizar la imagen de tus futbolistas estrella.
                            </p>
                        </div>
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => onUpdateDirectives({ globalMarketing: !directives?.globalMarketing })}
                                className={`w-full py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                                    directives?.globalMarketing
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                        : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {directives?.globalMarketing ? 'Campaña Global ACTIVA' : 'Activar Campañas'}
                            </button>
                            <div className="text-[10px] text-slate-400 leading-tight">
                                Costo: ~{formatCurrencyShort(Math.floor(25_000 * directiveCosts.scale))}/sem. Genera ingresos semanales según el rating promedio de tus 5 figuras.
                            </div>
                        </div>
                    </div>

                    {/* Primas por Victoria */}
                    <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/40 space-y-3 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-black uppercase tracking-wider text-white">Primas por Victoria</div>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                Bonos económicos por triunfo oficial que elevan la moral competitiva del vestuario.
                            </p>
                        </div>
                        <div className="space-y-1.5 pt-2">
                            {[
                                { key: 'none', label: 'Sin Primas Extra', bonus: '0 €' },
                                { key: 'normal', label: `Estándar (~${formatCurrencyShort(Math.floor(15_000 * directiveCosts.scale))})`, bonus: '+Moral' },
                                { key: 'high', label: `Superprimas (~${formatCurrencyShort(Math.floor(40_000 * directiveCosts.scale))})`, bonus: '+Moral Élite' },
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => onUpdateDirectives({ winBonuses: opt.key as any })}
                                    className={`w-full py-2 px-3 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                                        (directives?.winBonuses || 'none') === opt.key
                                            ? 'bg-[var(--apex-gold)] text-slate-950'
                                            : 'bg-white/5 text-slate-300 hover:text-white border border-white/5'
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
