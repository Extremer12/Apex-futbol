import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Player } from '../types';

interface ModalContextType {
    viewingPlayer: Player | null;
    isSaveModalOpen: boolean;
    saveMode: 'overwrite' | 'new';
    openPlayerModal: (player: Player) => void;
    closePlayerModal: () => void;
    openSaveModal: (mode: 'overwrite' | 'new') => void;
    closeSaveModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
};

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveMode, setSaveMode] = useState<'overwrite' | 'new'>('overwrite');

    const openPlayerModal = useCallback((player: Player) => {
        setViewingPlayer(player);
    }, []);

    const closePlayerModal = useCallback(() => {
        setViewingPlayer(null);
    }, []);

    const openSaveModal = useCallback((mode: 'overwrite' | 'new') => {
        setSaveMode(mode);
        setIsSaveModalOpen(true);
    }, []);

    const closeSaveModal = useCallback(() => {
        setIsSaveModalOpen(false);
    }, []);

    return (
        <ModalContext.Provider
            value={{
                viewingPlayer,
                isSaveModalOpen,
                saveMode,
                openPlayerModal,
                closePlayerModal,
                openSaveModal,
                closeSaveModal,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};
