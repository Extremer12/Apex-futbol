import React, { useMemo } from 'react';
import { GameState, Screen, ElectoralPromise } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrencyShort } from '../../utils';
import { Trophy, Users, TrendingUp, Building2, Coins, ChevronRight, CheckCircle2, ClipboardList } from 'lucide-react';
import { TeamLogo } from '../../data/teams/helpers';
import { useGameStore } from '../../state/gameStore';
import { getClubHistoricalHonours } from '../../data/historicalHonours';
import { calculateMembershipRevenue, generateClubMembership } from '../../services/membership';
import { EmptyState, StatCell } from './transfers/TransferUI';

interface ClubHubScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    onNavigate?: (screen: Screen) => void;
}

export const ClubHubScreen: React.FC<ClubHubScreenProps> = ({ gameState, onNavigate }) => {
    const { team, mandate, fanApproval, electoralPromises, boardConfidence, stadium } = gameState;
    const setActiveScreen = useGameStore(s => s.setActiveScreen);
    const nav = onNavigate || setActiveScreen;

    const clubHonours = useMemo(() => getClubHistoricalHonours(team.name), [team.name]);
    const totalTitles = (clubHonours?.totalOfficialTitles || 0) + (team.trophyCabinet?.length || 0);
    const weeklySponsorIncome = useMemo(() => gameState.sponsors.reduce((s, c) => s + c.weeklyIncome, 0), [gameState.sponsors]);
    const membership = useMemo(() => gameState.membership || generateClubMembership(team, stadium), [gameState.membership, team, stadium]);
    const weeklyMembershipIncome = useMemo(
        () => calculateMembershipRevenue(membership, gameState.finances?.membershipPolicy || 'standard'),
        [membership, gameState.finances?.membershipPolicy]
    );

    const getPromiseTypeIcon = (type: ElectoralPromise['type']) => {
        switch (type) {
            case 'league_position': return <Trophy className="w-4 h-4 text-slate-300" />;
            case 'trophy': return <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />;
            case 'stadium': return <Building2 className="w-4 h-4 text-sky-400" />;
            case 'transfer': return <Users className="w-4 h-4 text-emerald-400" />;
            case 'finances': return <Coins className="w-4 h-4 text-[var(--apex-gold)]" />;
            default: return <ClipboardList className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* 1. COMPACT CLUB HEADER */}
            <header className="apex-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/40 border border-white/10 p-2 flex items-center justify-center shrink-0">
                        <TeamLogo team={team} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--apex-gold)]">
                                Mandato #{mandate.totalMandates}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                Año {mandate.currentYear} de 4 · Elecciones T.{mandate.nextElectionSeason}
                            </span>
                        </div>
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate mt-0.5">
                            {team.name}
                        </h1>
                    </div>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0 hidden sm:block">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Directiva</span>
                    <span className="text-sm font-black text-[var(--apex-gold)] leading-none tabular-nums">{boardConfidence}%</span>
                </div>
            </header>

            {/* 2. QUICK MANAGEMENT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                    onClick={() => nav(Screen.Stadium)}
                    className="apex-card p-4 rounded-2xl text-left hover:border-[var(--apex-gold)]/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--apex-gold)] shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-black text-white uppercase tracking-wider">Estadio</div>
                            <div className="text-[11px] text-slate-400 truncate">{stadium.capacity.toLocaleString()} asientos</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white shrink-0" />
                </button>

                <button
                    onClick={() => nav(Screen.Sponsorships)}
                    className="apex-card p-4 rounded-2xl text-left hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-black text-white uppercase tracking-wider">Patrocinios</div>
                            <div className="text-[11px] text-emerald-400 font-bold truncate">+{formatCurrencyShort(weeklySponsorIncome)}/sem</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white shrink-0" />
                </button>

                <button
                    onClick={() => nav(Screen.Trophies)}
                    className="apex-card p-4 rounded-2xl text-left hover:border-[var(--apex-gold)]/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--apex-gold)] shrink-0">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-black text-white uppercase tracking-wider">Vitrina</div>
                            <div className="text-[11px] text-[var(--apex-gold)] font-bold truncate">{totalTitles} títulos oficiales</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white shrink-0" />
                </button>
            </div>

            {/* 3. APPROVAL & PROMISES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-4">
                    {/* Fan Approval & Padrón */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4 text-[var(--apex-gold)]" />
                                Masa Societaria
                            </h2>
                            <span className="text-lg font-black text-white tabular-nums">{fanApproval.rating}%</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Socios Activos</span>
                                <span className="text-sm font-black text-white tabular-nums">
                                    {membership.activeMembers.toLocaleString()}
                                </span>
                                {membership.lastWeeklyDelta !== 0 && (
                                    <span className={`ml-2 text-[10px] font-black tabular-nums ${membership.lastWeeklyDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        ({membership.lastWeeklyDelta > 0 ? '+' : ''}{membership.lastWeeklyDelta.toLocaleString()}/sem)
                                    </span>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cuota</span>
                                <span className="text-xs font-black text-emerald-400 tabular-nums">+{formatCurrencyShort(weeklyMembershipIncome)}/sem</span>
                            </div>
                        </div>

                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    fanApproval.rating >= 70 ? 'bg-emerald-500' : fanApproval.rating >= 40 ? 'bg-[var(--apex-gold)]' : 'bg-rose-500'
                                }`}
                                style={{ width: `${fanApproval.rating}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <StatCell
                                label="Resultados"
                                value={`${fanApproval.factors.results > 0 ? '+' : ''}${fanApproval.factors.results}`}
                                accent={fanApproval.factors.results >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                            />
                            <StatCell
                                label="Finanzas"
                                value={`${fanApproval.factors.finances > 0 ? '+' : ''}${fanApproval.factors.finances}`}
                                accent={fanApproval.factors.finances >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                            />
                            <StatCell
                                label="Fichajes"
                                value={`${fanApproval.factors.transfers > 0 ? '+' : ''}${fanApproval.factors.transfers}`}
                                accent={fanApproval.factors.transfers >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                            />
                            <StatCell
                                label="Promesas"
                                value={`${fanApproval.factors.promises > 0 ? '+' : ''}${fanApproval.factors.promises}`}
                                accent={fanApproval.factors.promises >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                            />
                        </div>
                    </div>

                    {/* Board Confidence */}
                    <div className="apex-card p-4 sm:p-5 rounded-2xl space-y-2.5 border-t-2 border-[var(--apex-gold)]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[var(--apex-gold)]" />
                                Confianza Directiva
                            </h2>
                            <span className="text-base font-black text-white tabular-nums">{boardConfidence}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${boardConfidence >= 70 ? 'bg-emerald-500' : boardConfidence >= 40 ? 'bg-[var(--apex-gold)]' : 'bg-rose-500'}`}
                                style={{ width: `${boardConfidence}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            {boardConfidence >= 80
                                ? 'La directiva respalda plenamente tu proyecto deportivo y financiero.'
                                : boardConfidence >= 50
                                ? 'Respaldo estable, se espera progreso constante esta temporada.'
                                : 'Situación delicada. Se requieren resultados inmediatos.'}
                        </p>
                    </div>
                </div>

                {/* Electoral Promises */}
                <div className="lg:col-span-7 apex-card p-4 sm:p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                        <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />
                            Promesas Electorales
                        </h2>
                        <span className="text-[11px] font-bold text-slate-400">
                            {electoralPromises.filter(p => p.fulfilled).length}/{electoralPromises.length} cumplidas
                        </span>
                    </div>

                    {electoralPromises.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {electoralPromises.map(promise => (
                                <div
                                    key={promise.id}
                                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 ${
                                        promise.fulfilled
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-white/[0.02] border-white/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2.5 min-w-0">
                                            <div className="mt-0.5 shrink-0">{getPromiseTypeIcon(promise.type)}</div>
                                            <h3 className="font-bold text-xs text-white leading-snug">{promise.description}</h3>
                                        </div>
                                        {promise.fulfilled && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/5">
                                        <span className="text-slate-400">
                                            Impacto: <strong className="text-[var(--apex-gold)]">+{promise.impact}</strong>
                                        </span>
                                        <span className="text-slate-400 font-bold">Límite T.{promise.deadline}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<ClipboardList className="w-6 h-6" />}
                            title="Sin promesas activas"
                            text="No hay compromisos electorales vigentes para este mandato."
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
