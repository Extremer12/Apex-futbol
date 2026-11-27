import React from 'react';
import { X, Shield } from 'lucide-react';
import { Modal } from './Modal';
import { CommunityPacksSection } from '../screens/settings/CommunityPacksSection';

interface CommunityPacksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommunityPacksModal: React.FC<CommunityPacksModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gestor de Packs Visuales"
            maxWidth="max-w-5xl"
            hideHeader
        >
            <div className="flex flex-col h-[88dvh] bg-[#0A0E17]">
                <div className="sm:hidden flex justify-center pt-2.5 shrink-0">
                    <span className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-[#070A13]/95 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[var(--apex-gold)]/15 border border-[var(--apex-gold)]/30 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4 text-[var(--apex-gold)]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xs font-black text-white uppercase tracking-wider truncate">
                                Gestor de Packs Visuales
                            </h1>
                            <span className="text-[11px] text-slate-400 block truncate">
                                Escudos, ligas, rostros y trofeos
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
                    <CommunityPacksSection embedded />
                </div>
            </div>
        </Modal>
    );
};
