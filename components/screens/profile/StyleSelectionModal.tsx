import React from 'react';
import { LucideIcon, Check } from 'lucide-react';
import { BottomSheet } from '../transfers/TransferUI';

export interface PresidentialStyleItem {
    id: string;
    title: string;
    desc: string;
    perk: string;
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
        <BottomSheet
            open={isOpen}
            onClose={onClose}
            size="lg"
            title="Filosofía Presidencial"
            footer={
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                    Cerrar
                </button>
            }
        >
            <div className="space-y-2.5">
                {styles.map((style) => {
                    const Icon = style.icon;
                    const isSelected = selectedStyle === style.id;
                    return (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => onSelectStyle(style.id)}
                            className={`w-full p-3.5 rounded-2xl border text-left transition-colors flex items-start gap-3.5 cursor-pointer ${isSelected
                                ? 'bg-[var(--apex-gold)]/10 border-[var(--apex-gold)]'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/25'
                                }`}
                        >
                            <div className={`p-2.5 rounded-xl border shrink-0 ${style.bg} ${style.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-black text-white">{style.title}</h4>
                                    {isSelected && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[var(--apex-gold)] bg-[var(--apex-gold)]/15 px-2 py-0.5 rounded-full shrink-0">
                                            <Check className="w-3 h-3" />
                                            <span>Activo</span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{style.desc}</p>
                                <div className="mt-2 inline-block px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-slate-200">
                                    {style.perk}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </BottomSheet>
    );
});
