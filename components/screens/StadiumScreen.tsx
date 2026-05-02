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
            showToast("Tus instalaciones ya están al máximo nivel.", 'info');
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
            showToast(`Necesitas ${formatCurrencyShort(cost)} para la expansión.`, 'error');
            return;
        }

        // En un sistema real, esto debería tardar semanas. Por ahora lo aplicamos directamente para simplificar o preparamos el campo.
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
        showToast(`Expansión completada. Nueva capacidad: ${newCapacity.toLocaleString()} asientos.`, 'success');
        setIsExpanding(false);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Gestión del Estadio</h2>
            </div>

            {/* Stadium Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Building2Icon className="w-48 h-48 text-sky-400" />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                        <div>
                            <h3 className="text-4xl font-black text-white">{stadium.name}</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sede Oficial</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                <div className="text-slate-500 text-xs font-bold uppercase mb-1">Capacidad Total</div>
                                <div className="text-2xl font-black text-white">{stadium.capacity.toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                <div className="text-slate-500 text-xs font-bold uppercase mb-1">Precio Entrada</div>
                                <div className="text-2xl font-black text-emerald-400">{formatCurrencyShort(stadium.ticketPrice)}</div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black text-slate-400 uppercase">Nivel de Instalaciones</span>
                                <span className="text-xs font-black text-sky-400 uppercase">Nivel {stadium.facilityLevel}/5</span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <div key={lvl} className={`h-2 flex-1 rounded-full ${lvl <= stadium.facilityLevel ? 'bg-sky-500' : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                    <h4 className="text-lg font-black text-white uppercase flex items-center gap-2">
                        <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
                        Finanzas de Sede
                    </h4>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-xs font-bold uppercase">Mantenimiento Semanal</span>
                            <span className="text-red-400 font-black">-{formatCurrencyShort(stadium.maintenanceCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-xs font-bold uppercase">Ingreso VIP (Bono)</span>
                            <span className="text-emerald-400 font-black">+{Math.floor((stadium.facilityLevel - 1) * 12.5)}%</span>
                        </div>
                        <div className="pt-4 border-t border-slate-800">
                            <div className="text-slate-500 text-[10px] font-bold uppercase mb-2">Ingreso Estimado por Partido (Lleno)</div>
                            <div className="text-3xl font-black text-white">
                                {formatCurrencyShort(Math.floor(stadium.capacity * stadium.ticketPrice * (1 + (stadium.facilityLevel - 1) * 0.125)))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                    onClick={() => setIsExpanding(true)}
                    className="group bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-6 rounded-3xl transition-all text-left relative overflow-hidden"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-sky-500/10 p-3 rounded-2xl text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                            <HammerIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-black text-white text-xl uppercase">Expandir Gradas</div>
                            <p className="text-slate-500 text-sm">Aumenta la capacidad para recibir a más aficionados y generar más ingresos.</p>
                            <div className="mt-4 font-black text-sky-400">Desde {formatCurrencyShort(stadium.capacity * 1000)}</div>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={handleUpgradeFacilities}
                    className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl transition-all text-left"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-black text-white text-xl uppercase">Mejorar Servicios</div>
                            <p className="text-slate-500 text-sm">Mejora las zonas VIP y servicios para aumentar el gasto promedio por entrada.</p>
                            <div className="mt-4 font-black text-emerald-400">{formatCurrencyShort(stadium.facilityLevel * 5000000)}</div>
                        </div>
                    </div>
                </button>
            </div>

            {isExpanding && (
                <Modal title="Confirmar Expansión" onClose={() => setIsExpanding(false)}>
                    <div className="space-y-4">
                        <p className="text-slate-300">¿Estás seguro de que quieres expandir el estadio? Esta obra aumentará la capacidad en un 25%.</p>
                        <div className="bg-slate-800 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-bold uppercase text-xs">Costo de Obra</span>
                                <span className="text-white font-black">{formatCurrencyShort(stadium.capacity * 1000)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-bold uppercase text-xs">Nueva Capacidad</span>
                                <span className="text-sky-400 font-black">{Math.floor(stadium.capacity * 1.25).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setIsExpanding(false)} className="flex-1 px-4 py-3 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all">CANCELAR</button>
                            <button onClick={handleStartExpansion} className="flex-1 px-4 py-3 bg-sky-600 text-white font-black rounded-2xl hover:bg-sky-500 shadow-lg shadow-sky-600/20 transition-all">INICIAR OBRA</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
