import React, { useMemo } from 'react';
import { Player } from '../../types';

interface LinkedTextProps {
    text: string;
    players: Player[];
    onPlayerClick: (playerName: string) => void;
}

export const LinkedText: React.FC<LinkedTextProps> = React.memo(({ text, players, onPlayerClick }) => {
    // 1. Fast preliminary filter using native string search (runs in microseconds).
    // Avoids compiling a 150,000+ character regex with 7,500 alternatives on every render.
    const matchedPlayers = useMemo(() => {
        if (!text || !players || players.length === 0) return [];
        return players.filter(p => p.name && p.name.length >= 3 && text.includes(p.name));
    }, [text, players]);

    // If no players mentioned in this short news text, render text directly with zero regex overhead
    if (matchedPlayers.length === 0) {
        return <>{text}</>;
    }

    // 2. Only build the regex with the 1 or 2 names that actually exist in the text
    const names = matchedPlayers.map(p => p.name).sort((a, b) => b.length - a.length);
    const escapedNames = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(\\b(?:${escapedNames.join('|')})\\b)`, 'g');
    const nameSet = new Set(names);
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) =>
                nameSet.has(part) ? (
                    <button 
                        key={index} 
                        onClick={() => onPlayerClick(part)} 
                        className="font-semibold text-sky-400 hover:text-sky-300 border-b border-sky-500/30 border-dashed hover:border-solid transition-colors duration-200"
                    >
                        {part}
                    </button>
                ) : (
                    <React.Fragment key={index}>{part}</React.Fragment>
                )
            )}
        </>
    );
});

