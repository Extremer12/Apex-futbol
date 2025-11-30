import React from 'react';

interface MatchTimelineProps {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    currentMinute: number;
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    currentMinute
}) => {
    const progress = (currentMinute / 90) * 100;

    // Generate goal events
    const events = [];
    if (homeScore > 0) {
        for (let i = 0; i < homeScore; i++) {
            events.push({
                minute: Math.floor(Math.random() * currentMinute),
                team: 'home',
                type: 'goal'
            });
        }
    }
    if (awayScore > 0) {
        for (let i = 0; i < awayScore; i++) {
            events.push({
                minute: Math.floor(Math.random() * currentMinute),
                team: 'away',
                type: 'goal'
            });
        }
    }

    events.sort((a, b) => a.minute - b.minute);

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                    <div className="text-sm text-slate-400">{homeTeam}</div>
                    <div className="text-3xl font-bold text-white">{homeScore}</div>
                </div>
                <div className="text-slate-500 font-bold">-</div>
                <div className="text-center flex-1">
                    <div className="text-sm text-slate-400">{awayTeam}</div>
                    <div className="text-3xl font-bold text-white">{awayScore}</div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>0'</span>
                    <span>45'</span>
                    <span>90'</span>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Half-time marker */}
                    <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/50" />

                    {/* Goal markers */}
                    {events.map((event, index) => (
                        <div
                            key={index}
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg ${event.team === 'home' ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                            style={{ left: `${(event.minute / 90) * 100}%` }}
                            title={`${event.team === 'home' ? homeTeam : awayTeam} - ${event.minute}'`}
                        />
                    ))}

                    {/* Current time indicator */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white shadow-lg"
                        style={{ left: `${progress}%` }}
                    />
                </div>

                <div className="text-center mt-3 text-sm text-purple-300 font-semibold">
                    Minuto {currentMinute}'
                </div>
            </div>

            {/* Events legend */}
            <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    <span className="text-slate-400">{homeTeam}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    <span className="text-slate-400">{awayTeam}</span>
                </div>
            </div>
        </div>
    );
};
