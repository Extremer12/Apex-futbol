import React, { useMemo } from 'react';
import { Player } from '../../types';

interface LinkedTextProps {
    text: string;
    players: Player[];
    onPlayerClick: (playerName: string) => void;
}

export const LinkedText: React.FC<LinkedTextProps> = React.memo(({ text, players, onPlayerClick }) => {
    const { parts, nameSet } = useMemo(() => {
        if (!text || !players || players.length === 0) {
            return { parts: [text], nameSet: new Set<string>() };
        }

        // Fast string pass before building a compact regex with only matched names
        const matchedNamesSet = new Set<string>();
        for (const p of players) {
            if (p.name && p.name.length >= 3 && text.includes(p.name)) {
                matchedNamesSet.add(p.name);
            }
        }

        if (matchedNamesSet.size === 0) {
            return { parts: [text], nameSet: matchedNamesSet };
        }

        const names = Array.from(matchedNamesSet).sort((a, b) => b.length - a.length);
        const escapedNames = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(\\b(?:${escapedNames.join('|')})\\b)`, 'g');
        return {
            parts: text.split(regex),
            nameSet: matchedNamesSet,
        };
    }, [text, players]);

    if (nameSet.size === 0) {
        return <>{text}</>;
    }

    return (
        <>
            {parts.map((part, index) =>
                nameSet.has(part) ? (
                    <button
                        type="button"
                        key={index}
                        onClick={() => onPlayerClick(part)}
                        className="font-bold text-sky-300 hover:text-[var(--apex-gold)] border-b border-sky-400/35 border-dashed hover:border-solid transition-colors cursor-pointer"
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
