
import React from 'react';
import { Player, CoachRequest, CoachReport } from '../../types';
import { Modal } from './Modal';
import { UsersIcon, SparklesIcon, TrendingUpIcon, AwardIcon } from '../icons';
import { formatCurrencyShort } from '../../utils';

interface CoachMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: CoachReport;
    coachName: string;
    onApprovePromotion: (player: Player) => void;
}

export const CoachMeetingModal: React.FC<CoachMeetingModalProps> = ({
    isOpen,
    onClose,
    report,
    coachName,
    onApprovePromotion
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Reunión con ${coachName}`} maxWidth="max-w-2xl">
            <div className="space-y-6">
                {/* Coach Summary */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-sky-400" />
                        </div>
                        <h3 className="font-bold text-white uppercase text-sm tracking-wider">Informe del Míster</h3>
                    </div>
                    <p className="text-slate-300 text-sm italic">"{report.summary}"</p>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                                <span>Satisfacción del DT</span>
                                <span>{report.satisfaction}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-gradient-to-r ${report.satisfaction >= 70 ? 'from-green-500 to-emerald-500' : report.satisfaction >= 40 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-red-600'}`} 
                                    style={{ width: `${report.satisfaction}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Update */}
                <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <AwardIcon className="w-3 h-3" /> Actualización Táctica
                    </h4>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-sm text-slate-400">
                        {report.tacticalUpdate}
                    </div>
                </div>

                {/* Transfer Requests */}
                {report.requests.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUpIcon className="w-3 h-3" /> Peticiones de Fichaje
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {report.requests.map((req: CoachRequest) => (
                                <div key={req.id} className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${req.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {req.priority === 'critical' ? 'CRÍTICO' : 'IMPORTANTE'}
                                            </span>
                                            <span className="text-white font-bold text-sm">Refuerzo en {req.position}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{req.reason} (Mín. {req.minRating} de media)</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Prioridad</div>
                                        <div className={`text-xs font-black ${req.priority === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {req.priority === 'critical' ? 'ALTA' : 'MEDIA'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Academy Promotions */}
                {report.promotions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <SparklesIcon className="w-3 h-3 text-yellow-400" /> Propuestas de la Cantera
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {report.promotions.map(player => (
                                <div key={player.id} className="bg-gradient-to-r from-yellow-900/20 to-slate-800/40 border border-yellow-500/20 p-4 rounded-xl flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center font-black text-yellow-500">
                                            {player.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{player.name}</div>
                                            <div className="flex gap-2 text-[10px]">
                                                <span className="text-slate-400 uppercase font-bold">{player.position}</span>
                                                <span className="text-yellow-500 uppercase font-black">Valoración: {player.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onApprovePromotion(player)}
                                        className="bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all shadow-lg shadow-yellow-600/20"
                                    >
                                        APROBAR PROMOCIÓN
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-tighter italic">
                            * El DT recomienda subir a estos jugadores para el primer equipo.
                        </p>
                    </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-widest"
                    >
                        Entendido, Míster
                    </button>
                </div>
            </div>
        </Modal>
    );
};
