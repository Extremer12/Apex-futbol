import React from 'react';
import { Team, ElectoralPromise, ClubMembership, MembershipPolicy } from '../../../types';
import { formatCurrencyShort } from '../../../utils';
import { calculateMembershipRevenue } from '../../../services/membership';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Minus,
    Trophy,
    ArrowRightLeft,
    Wallet,
    CheckCircle2,
    Briefcase,
    Award,
    Clock,
    ClipboardList
} from 'lucide-react';
import { EmptyState } from '../transfers/TransferUI';

interface MandatePoliticalTabProps {
    team: Team;
    mandateYear: number;
    isElectionYear: boolean;
    fanApproval: {
        rating: number;
        trend: 'rising' | 'falling' | 'stable';
        factors: {
            results: number;
            transfers: number;
            finances: number;
            promises: number;
        };
    };
    careerStats: {
        winRate: number;
        totalMatches: number;
    };
    clubBalance: number;
    boardConfidence: number;
    electoralPromises: ElectoralPromise[];
    membership?: ClubMembership;
    membershipPolicy?: MembershipPolicy;
}

export const MandatePoliticalTab: React.FC<MandatePoliticalTabProps> = React.memo(({
    team,
    mandateYear,
    isElectionYear,
    fanApproval,
    careerStats,
    clubBalance,
    boardConfidence,
    electoralPromises,
    membership,
    membershipPolicy
}) => {
    const activeMembershipPolicy: MembershipPolicy = membershipPolicy || 'standard';
    const fulfilledCount = electoralPromises.filter(p => p.fulfilled).length;

    return (
        <div className="space-y-4">
            {/* 4-Year Timeline Step Indicator */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Línea del Mandato (4 Años)</span>
                    <span className={isElectionYear ? 'text-rose-400 font-black' : 'text-[var(--apex-gold)] font-black'}>
                        {isElectionYear ? 'Año Electoral' : `Faltan ${4 - mandateYear} año(s)`}
                    </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((year) => {
                        const isCurrent = year === mandateYear;
                        const isCompleted = year < mandateYear;
                        return (
                            <div
                                key={year}
                                className={`p-2.5 rounded-xl border text-center transition-colors ${
                                    isCurrent
                                        ? 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)] text-white'
                                        : isCompleted
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                        : 'bg-white/[0.02] border-white/5 text-slate-500'
                                }`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-wider block">
                                    Año {year}
                                </span>
                                <span className="text-[11px] font-bold block mt-0.5 truncate">
                                    {year === 1 && 'Asunción'}
                                    {year === 2 && 'Gestión'}
                                    {year === 3 && 'Balance'}
                                    {year === 4 && 'Elecciones'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Political Climate: Socios vs Directiva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fan Approval (Socios) */}
                <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center text-[var(--apex-gold)]">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Aprobación de Socios</h4>
                                <p className="text-[10px] text-slate-400">Índice electoral de reelección</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#070A13] px-2.5 py-1 rounded-xl border border-white/10">
                            {fanApproval.trend === 'rising' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                            {fanApproval.trend === 'falling' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                            {fanApproval.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-[var(--apex-gold)]" />}
                            <span className="text-sm font-black tabular-nums text-white">{fanApproval.rating}%</span>
                        </div>
                    </div>

                    <div className="space-y-1.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400 font-medium">Clima electoral</span>
                            <span className={`font-black uppercase tracking-wider ${
                                fanApproval.rating >= 60 ? 'text-emerald-400' : fanApproval.rating >= 45 ? 'text-[var(--apex-gold)]' : 'text-rose-400'
                            }`}>
                                {fanApproval.rating >= 60 ? 'Amplio respaldo' : fanApproval.rating >= 45 ? 'Comicios reñidos' : 'Descontento social'}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    fanApproval.rating >= 60
                                        ? 'bg-emerald-500'
                                        : fanApproval.rating >= 45
                                        ? 'bg-[var(--apex-gold)]'
                                        : 'bg-rose-500'
                                }`}
                                style={{ width: `${fanApproval.rating}%` }}
                            />
                        </div>
                        {membership && (
                            <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5 text-[11px]">
                                <span className="text-slate-400">
                                    Padrón: <strong className="text-white tabular-nums">{membership.activeMembers.toLocaleString()} socios</strong>
                                    {membership.lastWeeklyDelta !== 0 && (
                                        <span className={`ml-1.5 font-black ${membership.lastWeeklyDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            ({membership.lastWeeklyDelta > 0 ? '+' : ''}{membership.lastWeeklyDelta.toLocaleString()})
                                        </span>
                                    )}
                                </span>
                                <span className="font-black text-emerald-400 tabular-nums">
                                    +{formatCurrencyShort(calculateMembershipRevenue(membership, activeMembershipPolicy))}/sem
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {[
                            {
                                icon: <Trophy className="w-3.5 h-3.5 text-emerald-400" />,
                                title: 'Resultados Deportivos',
                                sub: careerStats.totalMatches > 0 ? `${careerStats.winRate}% de efectividad` : 'Inicio de temporada',
                                value: fanApproval.factors.results
                            },
                            {
                                icon: <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />,
                                title: 'Política de Fichajes',
                                sub: `${team.squad.length} jugadores en plantilla`,
                                value: fanApproval.factors.transfers
                            },
                            {
                                icon: <Wallet className="w-3.5 h-3.5 text-[var(--apex-gold)]" />,
                                title: 'Salud Financiera',
                                sub: `${formatCurrencyShort(clubBalance)} en tesorería`,
                                value: fanApproval.factors.finances
                            },
                            {
                                icon: <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />,
                                title: 'Promesas Electorales',
                                sub: `${fulfilledCount}/${electoralPromises.length} compromisos`,
                                value: fanApproval.factors.promises
                            },
                        ].map(item => (
                            <div key={item.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-bold text-white truncate">{item.title}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black tabular-nums shrink-0 ${
                                    item.value >= 0
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-400'
                                }`}>
                                    {item.value > 0 ? `+${item.value}` : item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Board Confidence (Junta Directiva) */}
                <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3 border-t-2 border-[var(--apex-gold)] flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-sky-400" />
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">Junta Directiva</h4>
                            </div>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border tabular-nums ${
                                boardConfidence >= 60
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : boardConfidence >= 35
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                                {boardConfidence}%
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                            La directiva fiscaliza tu gestión cada semana. Si la confianza cae por debajo de 25%, pueden forzar una moción de censura.
                        </p>

                        <div className="space-y-1.5 pt-1">
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        boardConfidence >= 60 ? 'bg-emerald-500' : boardConfidence >= 35 ? 'bg-[var(--apex-gold)]' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${boardConfidence}%` }}
                                />
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                                {boardConfidence >= 75
                                    ? 'Confianza plena en tu proyecto institucional.'
                                    : boardConfidence >= 50
                                    ? 'Gestión estable y sin reclamos urgentes.'
                                    : 'Alerta: la directiva exige mejores resultados deportivos.'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Promises Tracking */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[var(--apex-gold)]" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Promesas del Mandato</h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                        {fulfilledCount} de {electoralPromises.length} cumplidas
                    </span>
                </div>

                {electoralPromises.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {electoralPromises.map((promise) => (
                            <div
                                key={promise.id}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                    promise.fulfilled
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-white/[0.02] border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {promise.fulfilled ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-white leading-snug">{promise.description}</p>
                                        <span className="text-[10px] text-slate-400">
                                            Límite T.{promise.deadline} · +{promise.impact} votos
                                        </span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                    promise.fulfilled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'
                                }`}>
                                    {promise.fulfilled ? 'Cumplida' : 'Pendiente'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<ClipboardList className="w-6 h-6" />}
                        title="Sin promesas registradas"
                        text="No asumiste compromisos electorales formales al iniciar este mandato."
                    />
                )}
            </div>
        </div>
    );
});
