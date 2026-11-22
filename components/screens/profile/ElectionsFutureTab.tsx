import React, { useState } from 'react';
import { Team } from '../../../types';
import { TeamLogo } from '../../../data/teams/helpers';
import { formatCurrencyShort } from '../../../utils';
import { Vote, Building2, Lock, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { BottomSheet, StatCell } from '../transfers/TransferUI';
import { getClubRequiredLevel } from '../../../services/presidentialProgression';

interface ElectionsFutureTabProps {
    team: Team;
    mandateYear: number;
    isElectionYear: boolean;
    fanApprovalRating: number;
    currentLevel: number;
    prospectiveClubs: Team[];
    onSwitchClub: (club: Team) => void;
}

export const ElectionsFutureTab: React.FC<ElectionsFutureTabProps> = React.memo(({
    team,
    mandateYear,
    isElectionYear,
    fanApprovalRating,
    currentLevel,
    prospectiveClubs,
    onSwitchClub
}) => {
    const [pendingClub, setPendingClub] = useState<Team | null>(null);

    return (
        <div className="space-y-4">
            {/* Election Status Banner */}
            <div className={`apex-card p-4 sm:p-5 rounded-2xl space-y-4 ${
                isElectionYear ? 'border-rose-500/40 bg-rose-950/15' : ''
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isElectionYear
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                            : 'bg-[var(--apex-gold)]/15 border-[var(--apex-gold)]/30 text-[var(--apex-gold)]'
                    }`}>
                        <Vote className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            {isElectionYear ? 'Año de Comicios Electorales' : 'Ciclo Electoral Presidencial'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isElectionYear
                                ? 'Completaste los 4 años de mandato. Los socios votarán al cierre de esta temporada.'
                                : `Año ${mandateYear} de 4 · Faltan ${4 - mandateYear} temporada(s) para los comicios.`}
                        </p>
                    </div>
                </div>

                {/* Projection */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-300">Intención de voto estimada</span>
                        <span className={`text-sm font-black tabular-nums ${
                            fanApprovalRating >= 60 ? 'text-emerald-400' : fanApprovalRating >= 45 ? 'text-[var(--apex-gold)]' : 'text-rose-400'
                        }`}>
                            {fanApprovalRating}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                fanApprovalRating >= 60 ? 'bg-emerald-500' : fanApprovalRating >= 45 ? 'bg-[var(--apex-gold)]' : 'bg-rose-500'
                            }`}
                            style={{ width: `${fanApprovalRating}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        {fanApprovalRating >= 65
                            ? 'Los socios avalan tu gestión. Tienes el camino allanado para renovar tu mandato.'
                            : fanApprovalRating >= 45
                            ? 'Elección reñida: la oposición presiona. Un título o buen cierre económico inclinará la balanza.'
                            : 'Situación crítica: riesgo serio de perder los comicios frente a la lista opositora.'}
                    </p>
                </div>
            </div>

            {/* Prospective Clubs looking for a President */}
            <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--apex-gold)]" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            Mercado de Presidencias
                        </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                        Tu rango: Nv. {currentLevel}
                    </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                    Si deseas cambiar de aires desde <strong className="text-white">{team.name}</strong>, puedes postularte a clubes acordes a tu nivel presidencial actual.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {prospectiveClubs.map((club) => {
                        const reqLevel = getClubRequiredLevel(club.tier);
                        const eligible = currentLevel >= reqLevel;
                        return (
                            <div
                                key={club.id}
                                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                                    eligible
                                        ? 'border-white/10 bg-white/[0.02] hover:border-[var(--apex-gold)]/40'
                                        : 'border-white/5 bg-white/[0.01] opacity-70'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center shrink-0">
                                        <TeamLogo team={club} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="min-w-0">
                                        <h5 className="text-xs font-black text-white truncate">{club.name}</h5>
                                        <span className="text-[10px] text-slate-400 block truncate">
                                            Caja: {formatCurrencyShort(club.budget)} · Req. Nv. {reqLevel}+
                                        </span>
                                    </div>
                                </div>
                                {eligible ? (
                                    <button
                                        type="button"
                                        onClick={() => setPendingClub(club)}
                                        className="shrink-0 h-8 px-3 rounded-xl bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 text-[11px] font-black inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>Asumir</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                ) : (
                                    <span className="shrink-0 h-8 px-2.5 rounded-xl bg-white/5 text-slate-500 text-[10px] font-bold inline-flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        <span>Nv. {reqLevel}</span>
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Confirm Club Switch BottomSheet */}
            <BottomSheet
                open={!!pendingClub}
                onClose={() => setPendingClub(null)}
                title={pendingClub ? `Asumir · ${pendingClub.name}` : undefined}
                footer={
                    pendingClub ? (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPendingClub(null)}
                                className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const chosen = pendingClub;
                                    setPendingClub(null);
                                    onSwitchClub(chosen);
                                }}
                                className="flex-1 h-11 rounded-xl bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                            >
                                Confirmar Traspaso
                            </button>
                        </div>
                    ) : undefined
                }
            >
                {pendingClub && (
                    <div className="space-y-4">
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Tu etapa en <strong className="text-white">{team.name}</strong> se archivará en tu historial de clubes y comenzarás el Mandato #1 al frente de <strong className="text-white">{pendingClub.name}</strong> conservando tu nivel y experiencia presidencial.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <StatCell label="Presupuesto club" value={formatCurrencyShort(pendingClub.budget)} accent="text-emerald-400" />
                            <StatCell label="Categoría" value={pendingClub.tier === 'Top' ? 'Élite' : pendingClub.tier === 'Mid' ? 'Competitivo' : 'En desarrollo'} />
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>El calendario y la temporada actual continuarán en curso al asumir el nuevo cargo.</span>
                        </div>
                    </div>
                )}
            </BottomSheet>
        </div>
    );
});
