import React from 'react';
import {
    LayoutDashboard,
    Users,
    ArrowRightLeft,
    Trophy,
    Wallet,
    Briefcase,
    Landmark,
    Layers,
    Settings
} from 'lucide-react';
import { BottomSheet } from '../screens/transfers/TransferUI';

export const PlaceholderModal: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
    <BottomSheet
        open
        onClose={onClose}
        title={title}
        footer={
            <button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
                Cerrar
            </button>
        }
    >
        <p className="text-xs text-slate-300 leading-relaxed">
            Esta sección estará disponible en una próxima actualización. Gracias por liderar tu club en Apex AI.
        </p>
    </BottomSheet>
);

export const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <BottomSheet
        open
        onClose={onClose}
        size="lg"
        title="Acerca de Apex AI"
        footer={
            <button
                type="button"
                onClick={onClose}
                className="w-full h-11 rounded-xl bg-[var(--apex-gold)] text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
            >
                Cerrar
            </button>
        }
    >
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-white">Apex AI Football President</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 text-[10px] font-black">
                        v1.0 Oficial
                    </span>
                </div>
                <p className="text-slate-400">
                    Simulador integral de presidencia futbolística offline-first. Toma decisiones financieras, dirige elecciones de socios, contrata cuerpos técnicos de élite y lleva a tu club a la gloria continental.
                </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-white">Características</h5>
                <ul className="space-y-1 text-slate-400">
                    <li>· Ligas sudamericanas (Apertura/Clausura y Promedios) y élite europea con formato suizo</li>
                    <li>· Motor de simulación fuera del hilo principal y autoguardado local en IndexedDB</li>
                    <li>· Sistema modular de Packs Visuales comunitarios y respaldo opcional en la nube</li>
                </ul>
            </div>
        </div>
    </BottomSheet>
);

export const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const sections = [
        {
            icon: <LayoutDashboard className="w-4 h-4 text-[var(--apex-gold)]" />,
            title: 'Panel Principal',
            desc: 'Tu centro de mando semanal: revisa el próximo rival, noticias del club, alertas de vestuario y avanza al siguiente turno.'
        },
        {
            icon: <Users className="w-4 h-4 text-emerald-400" />,
            title: 'Plantilla y Tácticas',
            desc: 'Configura tu XI titular y formación, gestiona renovaciones de contrato, moral, fatiga y promueve joyas de la cantera.'
        },
        {
            icon: <ArrowRightLeft className="w-4 h-4 text-sky-400" />,
            title: 'Fichajes y Negociación',
            desc: 'Busca refuerzos por posición o potencial, negocia traspasos con otros clubes y acuerda contratos con representantes.'
        },
        {
            icon: <Wallet className="w-4 h-4 text-amber-400" />,
            title: 'Finanzas, Estadio y Sponsors',
            desc: 'Equilibra taquilla, salarios, préstamos bancarios, ampliaciones de aforo, zonas VIP y contratos de patrocinio.'
        },
        {
            icon: <Briefcase className="w-4 h-4 text-violet-400" />,
            title: 'Personal y Red de Ojeo',
            desc: 'Contrata DT, Jefe Médico, Preparador Físico, Director Deportivo, Director de Cantera y hasta 3 ojeadores activos.'
        },
        {
            icon: <Landmark className="w-4 h-4 text-rose-400" />,
            title: 'Perfil, Mandato y Elecciones',
            desc: 'Acumula XP presidencial, elige un estilo con bonos reales, cumple promesas electorales cada 4 años o postúlate a otros clubes.'
        },
        {
            icon: <Trophy className="w-4 h-4 text-[var(--apex-gold)]" />,
            title: 'Ligas, Copas y Vitrina',
            desc: 'Sigue las tablas, goleadores, historial de campeones y trofeos conquistados durante tus mandatos.'
        },
        {
            icon: <Layers className="w-4 h-4 text-sky-300" />,
            title: 'Packs Visuales y Respaldos',
            desc: 'Instala escudos, ligas o rostros comunitarios y exporta o respalda tus carreras desde Ajustes.'
        },
        {
            icon: <Settings className="w-4 h-4 text-slate-300" />,
            title: 'Objetivo Presidencial',
            desc: 'Mantén la confianza de la Junta Directiva sobre 0% y el respaldo de los Socios para ganar la reelección.'
        },
    ];

    return (
        <BottomSheet
            open
            onClose={onClose}
            size="lg"
            title="Guía del Presidente"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sections.map(sec => (
                    <div key={sec.title} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            {sec.icon}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-black text-xs text-white">{sec.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{sec.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </BottomSheet>
    );
};
