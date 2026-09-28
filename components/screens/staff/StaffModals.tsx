import React from 'react';
import { Coach } from '../../../types';
import { formatCurrency } from '../../../utils';
import { 
    X, 
    UserPlus, 
    AlertTriangle, 
    Sparkles, 
    Stethoscope, 
    Dumbbell, 
    Award, 
    Briefcase 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalHireState, ModalFireState, getPowerBadgeClass } from './staffUiTypes';

interface StaffHireModalProps {
    hireModal: ModalHireState | null;
    onClose: () => void;
    onConfirm: () => void;
}

export const StaffHireModal: React.FC<StaffHireModalProps> = React.memo(({
    hireModal,
    onClose,
    onConfirm
}) => {
    return (
        <AnimatePresence>
            {hireModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#12161f] border border-white/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-5 h-5 text-[var(--apex-gold)]" />
                                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                                    Confirmar Contratación
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="text-[10px] font-bold text-white/50 uppercase">
                                            Candidato a Incorporar
                                        </span>
                                        <h4 className="text-base font-black text-white">{hireModal.candidate.name}</h4>
                                    </div>
                                    {'power' in hireModal.candidate ? (
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${getPowerBadgeClass(hireModal.candidate.power)}`}>
                                            {hireModal.candidate.power} PTS
                                        </span>
                                    ) : 'prestige' in hireModal.candidate ? (
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${getPowerBadgeClass(hireModal.candidate.prestige)}`}>
                                            {hireModal.candidate.prestige} PTS
                                        </span>
                                    ) : null}
                                </div>

                                {'specialty' in hireModal.candidate && hireModal.candidate.specialty && (
                                    <p className="text-xs text-[var(--apex-gold)] font-medium mb-3">
                                        Especialidad: {hireModal.candidate.specialty}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/10">
                                    <div>
                                        <span className="text-white/40 block">Coste Fichaje / Prima:</span>
                                        <span className="font-black text-amber-400 text-sm">
                                            {formatCurrency('hiringFee' in hireModal.candidate ? hireModal.candidate.hiringFee : (hireModal.candidate as Coach).signingBonus)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-white/40 block">Sueldo Semanal:</span>
                                        <span className="font-black text-white text-sm">
                                            {formatCurrency(hireModal.candidate.salary)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {hireModal.currentHolder && (
                                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                                    ⚠️ <strong>Sustitución en el cargo:</strong> Reemplazará a {hireModal.currentHolder.name} ({'power' in hireModal.currentHolder ? hireModal.currentHolder.power : (hireModal.currentHolder as Coach).prestige} PTS). El titular actual dejará sus funciones de inmediato.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white uppercase tracking-wider transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-3 rounded-xl apex-btn-gold text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(200,168,78,0.3)]"
                            >
                                Confirmar y Firmar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

interface StaffFireModalProps {
    fireModal: ModalFireState | null;
    onClose: () => void;
    onConfirm: () => void;
}

export const StaffFireModal: React.FC<StaffFireModalProps> = React.memo(({
    fireModal,
    onClose,
    onConfirm
}) => {
    return (
        <AnimatePresence>
            {fireModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#12161f] border border-rose-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                            <div className="flex items-center gap-3 text-rose-400">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                                    Rescisión de Contrato
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6 text-xs">
                            <p className="text-white/80">
                                ¿Estás seguro de que deseas rescindir el contrato de <strong>{fireModal.member.name}</strong>?
                            </p>

                            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-white/50">Indemnización por Despido:</span>
                                    <span className="font-black text-rose-400 text-sm">{formatCurrency(fireModal.severanceCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/50">Ahorro Salarial Semanal:</span>
                                    <span className="font-bold text-emerald-400">+{formatCurrency(fireModal.member.salary)} / sem</span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                                ⚠️ El puesto quedará <strong>vacante</strong> hasta que contrates a un nuevo profesional, perdiendo los beneficios de su especialidad y rating.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white uppercase tracking-wider transition-all"
                            >
                                Mantener en el Club
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                            >
                                Pagar y Rescindir
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

interface StaffImpactGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StaffImpactGuideModal: React.FC<StaffImpactGuideModalProps> = React.memo(({
    isOpen,
    onClose
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#12161f] border border-[var(--apex-gold)]/40 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-[var(--apex-gold)]" />
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                                    Sistema de Poder & Fórmulas del Staff
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <h4 className="font-black text-rose-300 uppercase mb-1 flex items-center gap-1.5">
                                    <Stethoscope className="w-4 h-4" />
                                    Jefe de Servicios Médicos (Doctor)
                                </h4>
                                <p className="mb-2">
                                    El poder del médico (1-100) modula dinámicamente la probabilidad matemática de roturas fibrilares y lesiones durante cada partido:
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-white/80">
                                    <li><strong>Poder 93+</strong>: Factor de 0.62x (~38% menos de lesiones). Además, los médicos de élite (85+) reducen automáticamente la gravedad en semanas.</li>
                                    <li><strong>Poder 56</strong>: Factor de 1.12x (12% más lesiones que la media). Sin prevención avanzada.</li>
                                    <li><strong>Curación acelerada semanal</strong>: Cada semana en el avance de turno, existe una probabilidad proporcional al poder del médico de que los jugadores lesionados se recuperen 2 semanas de golpe.</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                <h4 className="font-black text-cyan-300 uppercase mb-1 flex items-center gap-1.5">
                                    <Dumbbell className="w-4 h-4" />
                                    Preparador Físico
                                </h4>
                                <ul className="list-disc pl-4 space-y-1 text-white/80">
                                    <li><strong>Resistencia al desgaste en 90 min</strong>: Reduce hasta un 25% el drenaje de condición física por partido.</li>
                                    <li><strong>Recuperación semanal de condición</strong>: Añade entre +8 y +16 puntos extra de energía a todo el plantel al inicio de cada semana.</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <h4 className="font-black text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                                    <Award className="w-4 h-4" />
                                    Director Técnico (DT)
                                </h4>
                                <ul className="list-disc pl-4 space-y-1 text-white/80">
                                    <li><strong>Bono táctico a líneas</strong>: Su prestigio añade hasta +1.5 puntos a Ataque, Mediocampo y Defensa en cada simulación de partido.</li>
                                    <li><strong>Satisfacción de Vestuario</strong>: Su nivel de satisfacción multiplica la cohesión global de juego.</li>
                                </ul>
                            </div>

                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <h4 className="font-black text-emerald-300 uppercase mb-1 flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" />
                                    Director Deportivo & Cantera
                                </h4>
                                <ul className="list-disc pl-4 space-y-1 text-white/80">
                                    <li><strong>D. Deportivo</strong>: Otorga hasta un 15% de descuento en traspasos de futbolistas internacionales.</li>
                                    <li><strong>Cantera</strong>: Eleva hasta +12 puntos el potencial y calidad inicial de las nuevas promesas de las fuerzas básicas.</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-black text-white uppercase tracking-wider transition-all"
                        >
                            Entendido
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
