import React from 'react';

interface MatchCommentaryProps {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    minute: number;
}

export const MatchCommentary: React.FC<MatchCommentaryProps> = ({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    minute
}) => {
    const generateCommentary = () => {
        const comments: string[] = [];

        // Pre-match
        if (minute === 0) {
            comments.push(`🎙️ Bienvenidos al encuentro entre ${homeTeam} y ${awayTeam}`);
            comments.push(`⚽ Los equipos están listos para el saque inicial`);
        }

        // First half
        if (minute >= 1 && minute <= 45) {
            if (minute === 1) comments.push(`⏱️ ¡Arranca el partido!`);
            if (minute === 15) comments.push(`📊 Primer cuarto de hora completado`);
            if (minute === 30) comments.push(`⏱️ Llegamos a la media hora de juego`);
            if (minute === 45) comments.push(`⏱️ Final del primer tiempo`);

            // Goals
            if (homeScore > 0 && minute % 15 === 0) {
                comments.push(`⚽ ¡GOOOL de ${homeTeam}! El marcador se mueve`);
            }
            if (awayScore > 0 && minute % 17 === 0) {
                comments.push(`⚽ ¡GOOOL de ${awayTeam}! Respuesta inmediata`);
            }
        }

        // Half time
        if (minute === 46) {
            comments.push(`🔄 Comienza la segunda parte`);
            comments.push(`📊 Marcador al descanso: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`);
        }

        // Second half
        if (minute > 45 && minute <= 90) {
            if (minute === 60) comments.push(`⏱️ Llegamos a la hora de juego`);
            if (minute === 75) comments.push(`⏱️ Último cuarto de hora del partido`);
            if (minute === 85) comments.push(`⏱️ Entramos en los minutos finales`);
            if (minute === 90) {
                const winner = homeScore > awayScore ? homeTeam : awayScore > homeScore ? awayTeam : null;
                if (winner) {
                    comments.push(`🏆 ¡Final del partido! Victoria para ${winner}`);
                } else {
                    comments.push(`⚖️ ¡Final del partido! Empate a ${homeScore}`);
                }
                comments.push(`📊 Resultado final: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`);
            }
        }

        // Random events
        if (minute % 10 === 0 && minute > 0 && minute < 90) {
            const events = [
                `🎯 Buena jugada en ataque`,
                `🧤 Gran parada del portero`,
                `⚠️ Tarjeta amarilla mostrada`,
                `🔄 Cambio táctico en el banquillo`,
                `📢 La afición se hace notar`,
            ];
            comments.push(events[Math.floor(Math.random() * events.length)]);
        }

        return comments;
    };

    const commentary = generateCommentary();

    if (commentary.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-purple-300 font-bold text-sm uppercase tracking-wider">En Vivo - Min {minute}'</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
                {commentary.map((comment, index) => (
                    <div
                        key={index}
                        className="text-sm text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg border-l-2 border-purple-500/50 animate-fade-in"
                    >
                        {comment}
                    </div>
                ))}
            </div>
        </div>
    );
};
