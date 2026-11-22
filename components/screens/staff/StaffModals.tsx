import React from 'react';
import { formatCurrency } from '../../../utils';
import { AlertTriangle, Stethoscope, Dumbbell, Award, Briefcase, GraduationCap } from 'lucide-react';
import { BottomSheet, StatCell } from '../transfers/TransferUI';
import { ModalFireState } from './staffUiTypes';

interface StaffFireModalProps {
    fireModal: ModalFireState | null;
    onClose: () => void;
    onConfirmFire: () => void;
}

export const StaffFireModal: React.FC<StaffFireModalProps> = React.memo(({
    fireModal,
    onClose,
    onConfirmFire
}) => {
    return (
        <BottomSheet
            open={!!fireModal}
            onClose={onClose}
            title="Rescindir Contrato"
            footer={
                fireModal ? (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                        >
                            Mantener
                        </button>
                        <button
                            type="button"
                            onClick={onConfirmFire}
                            className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            Pagar y Rescindir
                        </button>
                    </div>
                ) : undefined
            }
        >
            {fireModal && (
                <div className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                        ¿Confirmas la desvinculación de <strong className="text-white">{fireModal.name}</strong> ({fireModal.roleLabel})?
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        <StatCell
                            label="Indemnización"
                            value={fireModal.severanceCost > 0 ? formatCurrency(fireModal.severanceCost) : 'Sin coste'}
                            accent={fireModal.severanceCost > 0 ? 'text-rose-400' : 'text-emerald-400'}
                        />
                        <StatCell
                            label="Ahorro semanal"
                            value={`+${formatCurrency(fireModal.weeklySalary)}/sem`}
                            accent="text-emerald-400"
                        />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                            {fireModal.type === 'scout'
                                ? 'Se reducirá la cobertura semanal de observación de mercado.'
                                : 'El cargo quedará vacante con rendimiento mínimo (40 PTS) hasta contratar a un reemplazo.'}
                        </span>
                    </div>
                </div>
            )}
        </BottomSheet>
    );
});

interface StaffGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StaffGuideModal: React.FC<StaffGuideModalProps> = React.memo(({
    isOpen,
    onClose
}) => {
    const guides = [
        {
            title: 'Director Técnico (DT)',
            icon: <Award className="w-4 h-4 text-emerald-400" />,
            desc: 'Su prestigio aporta hasta +1.65 puntos tácticos por línea y define el duelo de estilos durante la simulación.',
        },
        {
            title: 'Jefe Médico',
            icon: <Stethoscope className="w-4 h-4 text-rose-400" />,
            desc: 'Reduce el riesgo de lesiones musculares y activa una probabilidad semanal de curación acelerada (2 semanas en 1).',
        },
        {
            title: 'Preparador Físico',
            icon: <Dumbbell className="w-4 h-4 text-amber-400" />,
            desc: 'Mitiga hasta un 25% el desgaste físico en 90 minutos y acelera la recuperación semanal de condición.',
        },
        {
            title: 'Director Deportivo',
            icon: <Briefcase className="w-4 h-4 text-sky-400" />,
            desc: 'Otorga hasta un 15% de descuento al negociar compras y mejora las ofertas recibidas por tus jugadores.',
        },
        {
            title: 'Director de Cantera',
            icon: <GraduationCap className="w-4 h-4 text-violet-400" />,
            desc: 'Eleva hasta +12 puntos el nivel y proyección de las promesas generadas al inicio de cada temporada.',
        },
    ];

    return (
        <BottomSheet
            open={isOpen}
            onClose={onClose}
            size="lg"
            title="Impacto del Cuerpo Técnico"
            footer={
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                    Entendido
                </button>
            }
        >
            <div className="space-y-2.5">
                {guides.map(item => (
                    <div key={item.title} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            {item.icon}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-xs font-black text-white uppercase tracking-wide">{item.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </BottomSheet>
    );
});
