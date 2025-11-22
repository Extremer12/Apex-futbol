import React, { useMemo } from 'react';
import { Player } from '../../types';

interface LinkedTextProps {
    text: string;
    players: Player[];
    onPlayerClick: (playerName: string) => void;
}

export const LinkedText: React.FC<LinkedTextProps> = ({ text, players, onPlayerClick }) => {
    const playerNames = useMemo(() => players.map(p => p.name).sort((a,b) => b.length - a.length), [players]);
    if (playerNames.length === 0) return <>{text}</>;

    const regex = useMemo(() => new RegExp(`(\\b${playerNames.join('\\b|\\b')}\\b)`, 'g'), [playerNames]);
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) =>
                playerNames.includes(part) ? (
                    <button key={index} onClick={() => onPlayerClick(part)} className="font-semibold text-sky-400 hover:text-sky-300 border-b border-sky-500/30 border-dashed hover:border-solid transition-colors duration-200">
                        {part}
                    </button>
                ) : (
                    <React.Fragment key={index}>{part}</React.Fragment>
                )
            )}
        </>
    );
};
