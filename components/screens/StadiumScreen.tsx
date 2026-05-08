import React, { useState } from 'react';
import { GameState, Stadium } from '../../types';
import { GameAction } from '../../state/reducer';
import { Building2Icon, TicketIcon, HammerIcon, TrendingUpIcon, SparklesIcon } from 'lucide-react';
import { formatCurrencyShort } from '../../utils';
import { useToast } from '../common/ToastProvider';
import { Modal } from '../ui/Modal';

interface StadiumScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const StadiumScreen: React.FC<StadiumScreenProps> = ({ gameState, dispatch }) => {
    const { stadium, finances } = gameState;
    const { showToast } = useToast();
    const [isExpanding, setIsExpanding] = useState(false);

    const handleUpgradeFacilities = () => {
        const cost = stadium.facilityLevel * 5000000; // £5M per level
        if (stadium.facilityLevel >= 5) {
            showToast("Las instalaciones ya están al nivel máximo.", 'info');
            return;
        }
        if (finances.balance < cost) {
            showToast(`Necesitas ${formatCurrencyShort(cost)} para esta mejora.`, 'error');
            return;
        }

        dispatch({ type: 'UPDATE_STADIUM', payload: { ...stadium, facilityLevel: stadium.facilityLevel + 1 } });
        dispatch({ type: 'UPDATE_FINANCES', payload: { ...finances, balance: finances.balance - cost, balanceHistory: [...finances.balanceHistory, finances.balance - cost] } });
        showToast("¡Instalaciones mejoradas con éxito!", 'success');
    };

    const handleStartExpansion = () => {
        const cost = stadium.expansionCost || (stadium.capacity * 1000);
        if (finances.balance < cost) {
            showToast(`Necesitas ${formatCurrencyShort(cost)} para la ampliación.`, 'error');
            return;
        }

        // In a realistic system, this would take weeks. For now we apply it immediately.
        const newCapacity = Math.floor(stadium.capacity * 1.25);
        dispatch({ 
            type: 'UPDATE_STADIUM', 
            payload: { 
                ...stadium, 
                capacity: newCapacity,
                maintenanceCost: stadium.maintenanceCost * 1.2
            } 
        });
        dispatch({ type: 'UPDATE_FINANCES', payload: { ...finances, balance: finances.balance - cost, balanceHistory: [...finances.balanceHistory, finances.balance - cost] } });
        showToast(`Ampliación completada. Nueva capacidad: ${newCapacity.toLocaleString()} asientos.`, 'success');
        setIsExpanding(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Infraestructura</h2>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Estadio</h1>
                </div>
            </div>

            {/* Stadium Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 apex-card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                        <Building2Icon className="w-64 h-64 text-[var(--apex-gold)] grayscale" />
                    </div>
                    
                    <div className="relative z-10 p-6 space-y-8">
                        <div>
                            <h3 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-1">{stadium.name}</h3>
                            <p className="text-[var(--apex-gold)] font-black uppercase tracking-[0.2em] text-[10px]">Sede Oficial</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Capacidad Total</div>
                                <div className="text-3xl font-black text-white">{stadium.capacity.toLocaleString()}</div>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <div className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Precio Entrada</div>
                                <div className="text-3xl font-black text-[var(--apex-green)]">{formatCurrencyShort(stadium.ticketPrice)}</div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Nivel de Instalaciones</span>
                                <span className="text-[9px] font-black text-[var(--apex-gold)] uppercase tracking-widest">Nivel {stadium.facilityLevel}/5</span>
                            </div>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <div key={lvl} className={`h-1.5 flex-1 rounded-full border ${lvl <= stadium.facilityLevel ? 'bg-[var(--apex-gold)] border-[var(--apex-gold)]/50 shadow-[0_0_10px_rgba(200,168,78,0.5)]' : 'bg-black/50 border-white/5'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="apex-card p-6 flex flex-col">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                        <TrendingUpIcon className="w-4 h-4 text-[var(--apex-green)]" />
                        Finanzas de Partido
                    </h4>
                    
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Mantenimiento Semanal</span>
                            <span className="text-[var(--apex-red)] font-black">-{formatCurrencyShort(stadium.maintenanceCost)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Ingresos VIP (Bonus)</span>
                            <span className="text-[var(--apex-green)] font-black">+{Math.floor((stadium.facilityLevel - 1) * 12.5)}%</span>
                        </div>
                        <div className="pt-4 mt-auto">
                            <div className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Ingreso Estimado a Lleno</div>
                            <div className="text-3xl font-black text-white">
                                {formatCurrencyShort(Math.floor(stadium.capacity * stadium.ticketPrice * (1 + (stadium.facilityLevel - 1) * 0.125)))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={() => setIsExpanding(true)}
                    className="group apex-card p-6 text-left relative overflow-hidden hover:border-[var(--apex-gold)]/50 transition-all duration-300"
                >
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-white/50 group-hover:bg-[var(--apex-gold)]/10 group-hover:text-[var(--apex-gold)] group-hover:border-[var(--apex-gold)]/30 transition-all">
                            <HammerIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-white text-lg uppercase tracking-tight mb-1">Ampliar Gradas</div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Aumenta la capacidad para recibir más aficionados y generar más ingresos.</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Costo desde</span>
                                <span className="font-black text-[var(--apex-gold)]">{formatCurrencyShort(stadium.capacity * 1000)}</span>
                            </div>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={handleUpgradeFacilities}
                    className="group apex-card p-6 text-left relative overflow-hidden hover:border-[var(--apex-green)]/50 transition-all duration-300"
                >
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-white/50 group-hover:bg-[var(--apex-green)]/10 group-hover:text-[var(--apex-green)] group-hover:border-[var(--apex-green)]/30 transition-all">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-white text-lg uppercase tracking-tight mb-1">Mejorar Instalaciones</div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Mejora las áreas VIP y servicios generales para aumentar el ingreso por entrada.</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Costo de Mejora</span>
                                <span className="font-black text-[var(--apex-green)]">{formatCurrencyShort(stadium.facilityLevel * 5000000)}</span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {isExpanding && (
                <Modal title="Confirmar Ampliación" onClose={() => setIsExpanding(false)}>
                    <div className="space-y-6">
                        <p className="text-white/70 text-sm leading-relaxed">¿Estás seguro de ampliar el estadio? Este proyecto aumentará la capacidad total un 25%.</p>
                        
                        <div className="bg-black/50 p-5 rounded-xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-white/50 font-black uppercase text-[10px] tracking-widest">Costo del Proyecto</span>
                                <span className="text-white font-black">{formatCurrencyShort(stadium.capacity * 1000)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 font-black uppercase text-[10px] tracking-widest">Nueva Capacidad</span>
                                <span className="text-[var(--apex-gold)] font-black text-lg">{Math.floor(stadium.capacity * 1.25).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setIsExpanding(false)} className="flex-1 py-3 bg-white/5 text-white/50 font-black rounded-lg hover:bg-white/10 transition-all text-xs uppercase tracking-widest border border-white/10">CANCELAR</button>
                            <button onClick={handleStartExpansion} className="flex-1 py-3 apex-btn-gold text-xs !w-auto">INICIAR PROYECTO</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
