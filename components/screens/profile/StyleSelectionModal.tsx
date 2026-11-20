import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface PresidentialStyleItem {
    id: string;
    title: string;
    desc: string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

interface StyleSelectionModalProps {
    isOpen: boolean;
    selectedStyle: string;
    styles: PresidentialStyleItem[];
    onSelectStyle: (styleId: string) => void;
    onClose: () => void;
}

export const StyleSelectionModal: React.FC<StyleSelectionModalProps> = React.memo(({
    isOpen,
    selectedStyle,
    styles,
    onSelectStyle,
    onClose
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#0B0F19] border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Filosofía Institucional</span>
                                <h3 className="text-lg font-black text-white uppercase">Elige tu Estilo de Gestión</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {styles.map((style) => {
                                const Icon = style.icon;
                                const isSelected = selectedStyle === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        onClick={() => onSelectStyle(style.id)}
                                        className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                                            isSelected
                                                ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/50'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl border shrink-0 ${style.bg} ${style.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-white">{style.title}</h4>
                                                {isSelected && (
                                                    <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                                        Activo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">{style.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
