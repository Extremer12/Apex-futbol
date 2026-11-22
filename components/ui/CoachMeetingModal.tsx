import React from 'react';
import { Player, CoachRequest, CoachReport } from '../../types';
import { GameAction } from '../../state/reducer';
import { BottomSheet, StatCell } from '../screens/transfers/TransferUI';
import { Users, TrendingUp, Award, Handshake, Shield, Gift, CheckCircle2 } from 'lucide-react';
import { formatCurrencyShort } from '../../utils';

interface CoachMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: CoachReport;
    coachName: string;
    onApprovePromotion: (player: Player) => void;
    dispatch?: React.Dispatch<GameAction>;
    squadSize?: number;
    balance?: number;
}

export const CoachMeetingModal: React.FC<CoachMeetingModalProps> = ({
    isOpen,
    onClose,
    report,
    coachName,
    onApprovePromotion,
    dispatch,
    squadSize = 25,
    balance = 0
}) => {
    const answeredRequests = report.answeredRequests || {};
    const bonusAwarded = Boolean(report.bonusAwarded);

    const bonusCost = 10000 * squadSize;
    const canAffordBonus = balance >= bonusCost;

    return (
        <BottomSheet
            open={isOpen}
            onClose={onClose}
            size="lg"
            title={`Reunión · ${coachName}`}
            footer={
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                    Finalizar Reunión
                </button>
            }
        >
            <div className="space-y-4">
                {/* Coach Summary */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                                <Users className="w-4 h-4" />
                            </div>
                            <h4 className="font-black text-white uppercase text-xs tracking-wider">Informe del Míster</h4>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg border tabular-nums ${
                            report.satisfaction >= 70
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : report.satisfaction >= 40
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                            {report.satisfaction}% satisfacción
                        </span>
                    </div>

                    <p className="text-slate-300 text-xs italic leading-relaxed">"{report.summary}"</p>

                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                report.satisfaction >= 70
                                    ? 'bg-emerald-500'
                                    : report.satisfaction >= 40
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                            }`}
                            style={{ width: `${report.satisfaction}%` }}
                        />
                    </div>
                </div>

                {/* Tactical Update */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                        Actualización Táctica
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{report.tacticalUpdate}</p>
                </div>

                {/* Transfer Requests */}
                {report.requests.length > 0 && (
                    <div className="space-y-2.5">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                            Peticiones de Fichaje
                        </h4>
                        <div className="space-y-2">
                            {report.requests.map((req: CoachRequest) => {
                                const answer = answeredRequests[req.id];
                                return (
                                    <div key={req.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                    req.priority === 'critical'
                                                        ? 'bg-rose-500/20 text-rose-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                    {req.priority === 'critical' ? 'Crítico' : 'Importante'}
                                                </span>
                                                <span className="text-white font-bold text-xs">Refuerzo en {req.position}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                {req.reason} (Mín. {req.minRating} media)
                                            </p>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-2">
                                            {answer ? (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                                                    {answer === 'PROMISE' ? <Handshake className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                    <span>{answer === 'PROMISE' ? 'Fichaje prometido' : 'Confianza en plantilla'}</span>
                                                </span>
                                            ) : dispatch ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => dispatch({ type: 'RESPOND_COACH_REQUEST', payload: { requestId: req.id, decision: 'PROMISE' } })}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl transition-colors cursor-pointer"
                                                    >
                                                        <Handshake className="w-3.5 h-3.5" />
                                                        <span>Prometer</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => dispatch({ type: 'RESPOND_COACH_REQUEST', payload: { requestId: req.id, decision: 'DELEGATE' } })}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
                                                    >
                                                        <Shield className="w-3.5 h-3.5" />
                                                        <span>Cantera</span>
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Team Bonus Section */}
                {dispatch && (
                    <div className="p-4 rounded-2xl bg-[var(--apex-gold)]/5 border border-[var(--apex-gold)]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="min-w-0">
                            <div className="text-xs font-black text-[var(--apex-gold)] uppercase tracking-wider flex items-center gap-1.5">
                                <Gift className="w-4 h-4" />
                                <span>Prima Extraordinaria al Plantel</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Eleva la moral del vestuario y suma +8% de respaldo del DT antes de partidos clave.
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={bonusAwarded || !canAffordBonus}
                            onClick={() => dispatch({ type: 'AWARD_TEAM_BONUS', payload: { bonusPerPlayer: 10000 } })}
                            className={`shrink-0 h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 ${
                                bonusAwarded
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default'
                                    : !canAffordBonus
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 cursor-pointer'
                            }`}
                        >
                            {bonusAwarded ? (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Prima Otorgada</span>
                                </>
                            ) : !canAffordBonus ? (
                                <span>Fondos insuficientes</span>
                            ) : (
                                <span>Ofrecer ({formatCurrencyShort(bonusCost)})</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Academy Promotions */}
                {report.promotions.length > 0 && (
                    <div className="space-y-2.5">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-[var(--apex-gold)]" />
                            Propuestas de la Cantera
                        </h4>
                        <div className="space-y-2">
                            {report.promotions.map(player => (
                                <div key={player.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-[var(--apex-gold)]/20 flex justify-between items-center gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center font-black text-sm text-[var(--apex-gold)] shrink-0">
                                            {player.rating}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-white truncate">{player.name}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold">
                                                {player.position} · {player.age || 17} años
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onApprovePromotion(player)}
                                        className="h-9 px-3.5 rounded-xl bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 text-[11px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
                                    >
                                        Promover
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {report.requests.length === 0 && report.promotions.length === 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        <StatCell label="Esquema preferido" value="En ejecución" />
                        <StatCell label="Cantera" value="Sin alertas" accent="text-emerald-400" />
                    </div>
                )}
            </div>
        </BottomSheet>
    );
};
