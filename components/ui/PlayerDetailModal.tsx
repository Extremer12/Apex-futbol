import React, { useState, useMemo } from 'react';
import { Player, Morale, Team } from '../../types';
import { GameAction } from '../../state/reducer';
import { useGameStore } from '../../state/gameStore';
import { Modal } from './Modal';
import { formatCurrency, formatTransferFee, formatWeeklyWage } from '../../utils';
import { PlayerPhoto, TeamLogo } from '../../data/teams/helpers';
import {
    getPlayerAge,
    getPlayerPotential,
    getPlayerPotentialTier,
    getTierBadge,
    getPlayerReleaseClause
} from '../../utils/playerUtils';
import { getCountryMeta, resolvePlayerNationality } from '../../services/nationalityService';
import {
    canMoveToReserve,
    canPromoteToFirstTeam
} from '../../services/squadRules';
import { useToast } from '../common/ToastProvider';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    Lock,
    MessageSquare,
    PenTool,
    Shield,
    Tag,
    Trash2,
    TrendingUp,
    Zap
} from 'lucide-react';

interface PlayerDetailModalProps {
    player: Player;
    dispatch: React.Dispatch<GameAction>;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, dispatch }) => {
    const gameState = useGameStore(s => s.gameState);
    const { showToast } = useToast();

    const userTeam = gameState?.team;
    const isInFirstTeam = userTeam?.squad?.some(p => p.id === player.id) ?? false;
    const isInReserve = gameState?.youthAcademy?.some(p => p.id === player.id) ?? false;
    const isUserPlayer = isInFirstTeam || isInReserve;

    const ownerTeam: Team | undefined = useMemo(() => {
        if (isUserPlayer) return userTeam;
        return gameState?.allTeams?.find(t => t.squad.some(p => p.id === player.id));
    }, [isUserPlayer, userTeam, gameState?.allTeams, player.id]);

    const [hasTalked, setHasTalked] = useState(false);
    const [hasRenewed, setHasRenewed] = useState(false);

    const MORALE_COLORS: Record<Morale, string> = {
        'Feliz': 'text-emerald-400',
        'Contento': 'text-emerald-300',
        'Normal': 'text-amber-300',
        'Descontento': 'text-orange-400',
        'Enojado': 'text-rose-400'
    };

    const onClose = () => dispatch({ type: 'SET_VIEWING_PLAYER', payload: null });

    const onTransferList = () => {
        dispatch({ type: 'TOGGLE_TRANSFER_LIST', payload: player });
        showToast(player.isTransferListed ? `${player.name} retirado de transferibles.` : `${player.name} puesto en el mercado.`, 'info');
    };

    const onToggleUntouchable = () => {
        dispatch({ type: 'TOGGLE_UNTOUCHABLE', payload: player });
        showToast(
            player.isUntouchable
                ? `${player.name} ya puede recibir ofertas del mercado.`
                : `${player.name} declarado intransferible. Se rechazarán ofertas automáticas.`,
            'info'
        );
    };

    const handleOfferToClubs = () => {
        dispatch({ type: 'OFFER_PLAYER_TO_CLUBS', payload: { playerId: player.id } });
        showToast(`${player.name} ofrecido a clubes compradores. Revisa la pestaña Ofertas.`, 'success');
    };

    const handleRenewContract = () => {
        if (hasRenewed) return;
        dispatch({
            type: 'RENEW_PLAYER_CONTRACT',
            payload: {
                playerId: player.id,
                contractYearsBonus: 2,
                wageMultiplier: 1.15
            }
        });
        setHasRenewed(true);
        showToast(`Contrato de ${player.name} extendido por 2 años.`, 'success');
    };

    const handleMotivationalTalk = () => {
        if (hasTalked || player.morale === 'Feliz') return;
        dispatch({
            type: 'TALK_TO_PLAYER',
            payload: { playerId: player.id }
        });
        setHasTalked(true);
        showToast(`Charla mantenida con ${player.name}. Su moral mejoró.`, 'success');
    };

    const handleDemoteToReserve = () => {
        if (!gameState || !isInFirstTeam) return;
        const check = canMoveToReserve(gameState.team.squad, gameState.youthAcademy || []);
        if (!check.allowed) {
            showToast(check.reason || 'No se puede mover a Reserva.', 'warning');
            return;
        }
        dispatch({ type: 'DEMOTE_TO_RESERVE', payload: player.id });
        showToast(`${player.name} enviado a la Reserva.`, 'info');
    };

    const handlePromoteToFirstTeam = () => {
        if (!gameState || !isInReserve) return;
        const check = canPromoteToFirstTeam(gameState.team.squad, player, gameState.team.leagueId, gameState.gameMode);
        if (!check.allowed) {
            showToast(check.reason || 'No se puede ascender al Primer Equipo.', 'warning');
            return;
        }
        dispatch({ type: 'PROMOTE_PLAYER', payload: player });
        showToast(`${player.name} ascendido al Primer Equipo.`, 'success');
    };

    const handleReleaseFromReserve = () => {
        if (!isInReserve) return;
        dispatch({ type: 'RELEASE_RESERVE_PLAYER', payload: player.id });
        showToast(`${player.name} ha recibido la carta de libertad.`, 'info');
    };

    const age = getPlayerAge(player);
    const potential = getPlayerPotential(player);
    const potTier = getPlayerPotentialTier(player);
    const tierBadge = getTierBadge(potTier);
    const releaseClause = getPlayerReleaseClause(player);
    const condition = Math.round(player.condition ?? 100);

    const nationalityCode = resolvePlayerNationality(player, ownerTeam?.leagueId || userTeam?.leagueId);
    const countryMeta = getCountryMeta(nationalityCode);

    const canRenew = !hasRenewed && player.contractYears <= 3;
    const canTalk = !hasTalked && player.morale !== 'Feliz';

    const roleName = player.preferredRole === 'Key' ? 'Jugador Clave'
        : player.preferredRole === 'FirstTeam' ? 'Titular Habitual'
            : player.preferredRole === 'Rotation' ? 'Rotación'
                : 'Joven Promesa';

    return (
        <Modal title="Ficha del Futbolista" onClose={onClose} maxWidth="max-w-lg">
            <div className="space-y-4">
                {/* Profile Header Card */}
                <div className="flex items-center gap-3.5 bg-white/[0.03] border border-white/10 p-4 rounded-2xl">
                    <PlayerPhoto player={player} className="w-16 h-16 rounded-2xl border-2 border-white/15 shadow-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-black text-white truncate">{player.name}</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase shrink-0 ${tierBadge.color}`}>
                                {tierBadge.longLabel}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-xs">
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-black uppercase">{player.position}</span>
                            <span className="text-slate-300 font-semibold">{age} años</span>
                            <span className="text-slate-600">·</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-200 font-semibold">
                                <span>{countryMeta.flag}</span>
                                <span>{countryMeta.name}</span>
                            </span>
                            {player.isAcademyProduct && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    Cantera
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                            <span className={`font-bold ${MORALE_COLORS[player.morale]}`}>Moral: {player.morale}</span>
                            <span className="text-slate-600">·</span>
                            <span className={condition >= 75 ? 'text-emerald-400 font-bold' : condition >= 50 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                                Físico: {condition}%
                            </span>
                            {isUserPlayer && (
                                <>
                                    <span className="text-slate-600">·</span>
                                    <span className="font-bold text-[var(--apex-gold)]">
                                        {isInReserve ? 'En Reserva' : 'Primer Equipo'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-4 gap-2 text-center bg-white/[0.02] p-3 rounded-2xl border border-white/10">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Media</p>
                        <p className="text-xl font-black text-sky-400 mt-0.5 tabular-nums">{player.rating}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Potencial</p>
                        <p className="text-xl font-black text-[var(--apex-gold)] mt-0.5 flex items-center justify-center gap-1 tabular-nums">
                            {potential} <TrendingUp className="w-3.5 h-3.5 inline" />
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Valor</p>
                        <p className="text-sm font-black text-emerald-400 mt-1.5 tabular-nums">{formatTransferFee(player.value)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Salario</p>
                        <p className="text-xs font-black text-orange-300 mt-2 tabular-nums">{formatWeeklyWage(player.wage)}</p>
                    </div>
                </div>

                {/* Contract & Status Details */}
                <div className="text-xs space-y-2 bg-white/[0.02] p-3.5 rounded-2xl border border-white/10">
                    {ownerTeam && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Club Actual:</span>
                            <span className="font-bold text-white flex items-center gap-1.5">
                                <span className="w-4 h-4 inline-flex"><TeamLogo team={ownerTeam} /></span>
                                {ownerTeam.name}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-slate-400">Rol en el Equipo:</span>
                        <span className="font-bold text-white">{roleName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Contrato:</span>
                        <span className="font-bold text-white">{player.contractYears} año{player.contractYears !== 1 ? 's' : ''} restantes</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Cláusula de Rescisión:</span>
                        <span className="font-black text-[var(--apex-gold)]">{formatCurrency(releaseClause)}</span>
                    </div>
                    {player.isInjured && (
                        <div className="flex justify-between">
                            <span className="text-slate-400">Estado Físico:</span>
                            <span className="font-black text-rose-400">Lesionado ({player.injuryWeeksRemaining} sem)</span>
                        </div>
                    )}
                    {player.isSuspended && (
                        <div className="flex justify-between">
                            <span className="text-slate-400">Disciplina:</span>
                            <span className="font-black text-rose-400">Suspendido ({player.suspensionWeeksRemaining} par)</span>
                        </div>
                    )}
                </div>

                {/* Season Performance */}
                <div className="grid grid-cols-3 gap-2 text-center bg-white/[0.02] p-3 rounded-2xl border border-white/10">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Goles</p>
                        <p className="text-lg font-black text-white tabular-nums">{player.stats?.goals || 0}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Asistencias</p>
                        <p className="text-lg font-black text-white tabular-nums">{player.stats?.assists || 0}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Partidos</p>
                        <p className="text-lg font-black text-white tabular-nums">{player.stats?.appearances || 0}</p>
                    </div>
                </div>

                {/* Management Actions */}
                {isUserPlayer ? (
                    <div className="pt-1 space-y-2.5">
                        {/* Contract & Morale */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={!canRenew}
                                onClick={handleRenewContract}
                                className={`border font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                                    hasRenewed
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
                                        : !canRenew
                                            ? 'bg-white/[0.02] border-white/5 text-slate-500 cursor-not-allowed'
                                            : 'bg-emerald-600/20 border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300'
                                }`}
                            >
                                {hasRenewed ? <Check className="w-3.5 h-3.5" /> : <PenTool className="w-3.5 h-3.5" />}
                                <span>{hasRenewed ? 'Renovado' : 'Renovar (+2a)'}</span>
                            </button>

                            <button
                                type="button"
                                disabled={!canTalk}
                                onClick={handleMotivationalTalk}
                                className={`border font-bold py-2.5 px-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                                    hasTalked
                                        ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 cursor-default'
                                        : !canTalk
                                            ? 'bg-white/[0.02] border-white/5 text-slate-500 cursor-not-allowed'
                                            : 'bg-sky-600/20 border-sky-500/40 hover:bg-sky-600/30 text-sky-300'
                                }`}
                            >
                                {hasTalked ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                <span>{hasTalked ? 'Charla Hecha' : 'Charla Moral'}</span>
                            </button>
                        </div>

                        {/* Reserve / First Team Transfer */}
                        {isInFirstTeam ? (
                            <button
                                type="button"
                                onClick={handleDemoteToReserve}
                                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                            >
                                <ArrowDownLeft className="w-4 h-4 text-amber-400" />
                                <span>Enviar a Reserva ({gameState?.youthAcademy?.length || 0}/15)</span>
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={handlePromoteToFirstTeam}
                                    className="py-2.5 px-3 rounded-xl bg-[var(--apex-gold)] hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span>Subir al 1º Equipo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReleaseFromReserve}
                                    className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Liberar Cupo</span>
                                </button>
                            </div>
                        )}

                        {/* Market Actions */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={onTransferList}
                                className={`py-2.5 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 border cursor-pointer transition-colors ${
                                    player.isTransferListed
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                                }`}
                            >
                                <Tag className="w-3.5 h-3.5" />
                                <span>{player.isTransferListed ? 'Transferible' : 'En Venta'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleOfferToClubs}
                                className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Ofrecer</span>
                            </button>

                            <button
                                type="button"
                                onClick={onToggleUntouchable}
                                className={`py-2.5 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 border cursor-pointer transition-colors ${
                                    player.isUntouchable
                                        ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50 font-black'
                                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                                }`}
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>{player.isUntouchable ? 'Intransfer.' : 'Blindar'}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pt-1 text-center py-2.5 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Futbolista perteneciente a {ownerTeam?.name || 'otro club'}
                        </span>
                    </div>
                )}
            </div>
        </Modal>
    );
};
