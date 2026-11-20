import React from 'react';
import { Team, ElectoralPromise } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { formatCurrency } from '../../../utils';
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
    Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MandatePoliticalTabProps {
    team: Team;
    mandateYear: number;
    mandateTotal: number;
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
}

export const MandatePoliticalTab: React.FC<MandatePoliticalTabProps> = React.memo(({
    team,
    mandateYear,
    mandateTotal,
    isElectionYear,
    fanApproval,
    careerStats,
    clubBalance,
    boardConfidence,
    electoralPromises
}) => {
    return (
        <div className="space-y-5">
            {/* Current Club Banner & 4-Year Meter */}
            <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center">
                            <TeamLogo team={team} className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Club Actual</span>
                            <h3 className="text-lg font-black text-white uppercase">{team.name}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mandato Vigente</span>
                        <span className="text-base font-black text-white">#{mandateTotal} • Año {mandateYear} de 4</span>
                    </div>
                </div>

                {/* 4-Year Timeline Step Indicator */}
                <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Línea del Mandato Presidencial (4 Años)</span>
                        <span className={isElectionYear ? 'text-rose-400 font-black' : 'text-amber-400 font-bold'}>
                            {isElectionYear ? '¡Año Electoral!' : `Faltan ${4 - mandateYear} años para elecciones`}
                        </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((year) => {
                            const isCurrent = year === mandateYear;
                            const isCompleted = year < mandateYear;
                            return (
                                <div
                                    key={year}
                                    className={`p-2.5 rounded-xl border text-center transition-all ${
                                        isCurrent
                                            ? 'bg-amber-400/15 border-amber-400 ring-1 ring-amber-400/40'
                                            : isCompleted
                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                            : 'bg-white/[0.02] border-white/5 text-slate-500'
                                    }`}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-wider block">
                                        Año {year}
                                    </span>
                                    <span className={`text-[10px] font-bold block mt-0.5 truncate ${isCurrent ? 'text-white' : ''}`}>
                                        {year === 1 && 'Asunción'}
                                        {year === 2 && 'Gestión'}
                                        {year === 3 && 'Balance'}
                                        {year === 4 && '🗳️ Elecciones'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Political Climate: Socios vs Directiva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fan Approval (Socios) */}
                <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-wide">Aprobación de Socios</h4>
                                <p className="text-[10px] text-slate-400 font-medium">Índice electoral clave para reelección</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
                            {fanApproval.trend === 'rising' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                            {fanApproval.trend === 'falling' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                            {fanApproval.trend === 'stable' && <Minus className="w-4 h-4 text-amber-400" />}
                            <span className="text-sm font-black font-mono text-white">{fanApproval.rating}%</span>
                        </div>
                    </div>

                    <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400 font-medium">Clima electoral:</span>
                            <span className={`font-black uppercase tracking-wider ${
                                fanApproval.rating >= 60 ? 'text-emerald-400' : fanApproval.rating >= 45 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                                {fanApproval.rating >= 60 ? '✓ Amplio Respaldo' : fanApproval.rating >= 45 ? '⚠ Comicios Reñidos' : '⛔ Descontento Social'}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${fanApproval.rating}%` }}
                                transition={{ duration: 0.6 }}
                                className={`h-full rounded-full ${
                                    fanApproval.rating >= 60
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                        : fanApproval.rating >= 45
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                        : 'bg-gradient-to-r from-rose-600 to-red-500'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-1">
                        <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Trophy className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] font-bold text-slate-200 truncate">Resultados Deportivos</div>
                                    <div className="text-[9px] text-slate-400 truncate">
                                        {careerStats.totalMatches > 0 ? `${careerStats.winRate}% de efectividad` : 'Inicio de temporada'}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                fanApproval.factors.results >= 0
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                                {fanApproval.factors.results > 0 ? `+${fanApproval.factors.results}` : fanApproval.factors.results} pts
                            </span>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] font-bold text-slate-200 truncate">Política de Fichajes</div>
                                    <div className="text-[9px] text-slate-400 truncate">
                                        {team.squad.length} jugadores en plantilla
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                fanApproval.factors.transfers >= 0
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                                {fanApproval.factors.transfers > 0 ? `+${fanApproval.factors.transfers}` : fanApproval.factors.transfers} pts
                            </span>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                    <Wallet className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] font-bold text-slate-200 truncate">Salud Financiera</div>
                                    <div className="text-[9px] text-slate-400 truncate">
                                        {formatCurrency(clubBalance)} en arcas
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                fanApproval.factors.finances >= 0
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                                {fanApproval.factors.finances > 0 ? `+${fanApproval.factors.finances}` : fanApproval.factors.finances} pts
                            </span>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] font-bold text-slate-200 truncate">Promesas Electorales</div>
                                    <div className="text-[9px] text-slate-400 truncate">
                                        {electoralPromises.filter(p => p.fulfilled).length}/{electoralPromises.length} compromisos
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-black shrink-0 border ${
                                fanApproval.factors.promises >= 0
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                                {fanApproval.factors.promises > 0 ? `+${fanApproval.factors.promises}` : fanApproval.factors.promises} pts
                            </span>
                        </div>
                    </div>
                </div>

                {/* Board Confidence (Junta Directiva) */}
                <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">Junta Directiva</h4>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                            boardConfidence >= 60
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : boardConfidence >= 35
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}>
                            {boardConfidence}%
                        </span>
                    </div>

                    <p className="text-xs text-slate-400">
                        La directiva fiscaliza tu gestión semana tras semana. Si la confianza cae por debajo de 25%, pueden forzar una moción de censura.
                    </p>

                    <div className="space-y-1 pt-2">
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className={`h-full rounded-full transition-all ${
                                    boardConfidence >= 60 ? 'bg-emerald-500' : boardConfidence >= 35 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${boardConfidence}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                            {boardConfidence >= 75 ? 'Confianza plena en tu proyecto institucional.' : boardConfidence >= 50 ? 'Gestión estable y sin reclamos urgentes.' : 'Alerta: la directiva exige mejores resultados deportivos.'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Campaign Promises Tracking */}
            <div className="bg-[#0B0F19] rounded-2xl border border-white/10 p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-black text-white uppercase tracking-wide">Promesas Electorales del Mandato</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                        {electoralPromises?.filter(p => p.fulfilled).length || 0} de {electoralPromises?.length || 0} Cumplidas
                    </span>
                </div>

                {electoralPromises && electoralPromises.length > 0 ? (
                    <div className="space-y-2 pt-1">
                        {electoralPromises.map((promise) => (
                            <div
                                key={promise.id}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                    promise.fulfilled
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-white/[0.02] border-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {promise.fulfilled ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-slate-500 shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-white leading-snug">{promise.description}</p>
                                        <span className="text-[10px] text-slate-400">
                                            Límite: Temporada {promise.deadline} • Impacto: {promise.impact > 0 ? `+${promise.impact}` : promise.impact} votos
                                        </span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                    promise.fulfilled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-400'
                                }`}>
                                    {promise.fulfilled ? 'Cumplida' : 'Pendiente'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 py-3 text-center">
                        No se registraron promesas en el pitch electoral de este mandato.
                    </p>
                )}
            </div>
        </div>
    );
});
