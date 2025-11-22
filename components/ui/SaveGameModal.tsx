import React, { useState } from 'react';
import { Modal } from './Modal';

interface SaveGameModalProps {
    onSave: (saveName: string) => void;
    onClose: () => void;
    defaultName?: string;
    mode: 'overwrite' | 'new';
}

export const SaveGameModal: React.FC<SaveGameModalProps> = ({ onSave, onClose, defaultName, mode }) => {
    const [name, setName] = useState(defaultName || '');

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <Modal title={mode === 'overwrite' ? 'Guardar Progreso' : 'Guardar Nueva Partida'} onClose={onClose}>
            <div className="space-y-4">
                <p className="text-slate-300 text-sm">
                    {mode === 'overwrite'
                        ? `Estás a punto de sobrescribir la partida: "${defaultName}".`
                        : 'Crea un nuevo archivo de guardado para conservar tu progreso actual en un espacio separado.'}
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Nombre de la Partida</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Mi Carrera Legendaria"
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                        required
                        autoFocus
                    />
                </form>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button onClick={onClose} className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors text-sm">Cancelar</button>
                    <button onClick={handleSave} disabled={!name.trim()} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed text-sm shadow-lg shadow-sky-600/20">
                        {mode === 'overwrite' ? 'Sobrescribir' : 'Guardar Nuevo'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};