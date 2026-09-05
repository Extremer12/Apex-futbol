import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityPacksSection } from '../screens/settings/CommunityPacksSection';

interface CommunityPacksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommunityPacksModal: React.FC<CommunityPacksModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
                >
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60 sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--apex-gold)]/10 border border-[var(--apex-gold)]/30 flex items-center justify-center">
                                <span className="text-base">🛡️</span>
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                                    Gestor de Escudos y Packs Reales
                                </h2>
                                <p className="text-[10px] text-slate-400">
                                    Importa logos de clubes, copas y caras de jugadores sin límites
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
                            title="Cerrar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                        <CommunityPacksSection />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
