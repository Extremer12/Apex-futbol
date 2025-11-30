import React, { useMemo } from 'react';
import { TEAMS } from '../../constants';
import { Team, PlayerProfile } from '../../types';

interface TeamSelectionProps {
    player: PlayerProfile;
    onSelectTeam: (team: Team) => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ player, onSelectTeam }) => {
    const TIER_COLORS: Record<Team['tier'], string> = {
        Top: 'border-purple-500/80 bg-purple-500/10',
        Mid: 'border-yellow-500/80 bg-yellow-500/10',
        Lower: 'border-green-500/80 bg-green-500/10'
    };
    const TIER_DESC: Record<Team['tier'], string> = {
        Top: 'Riesgo Alto',
        Mid: 'Desafiante',
        Lower: 'Comienzo Recomendado'
    };

    const teamsByTier = useMemo(() => TEAMS.reduce((acc, team) => {
        if (!acc[team.tier]) acc[team.tier] = [];
        acc[team.tier].push(team);
        return acc;
    }, {} as Record<Team['tier'], Team[]>), []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 flex flex-col items-center p-4">
            {/* Premier League Header */}
            <div className='text-center my-8'>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <img
                        src="/logos/Premier League.png"
                        alt="Premier League"
                        className="w-20 h-20 object-contain drop-shadow-2xl"
                    />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent">
                    Bienvenido, {player.name}
                </h1>
                <p className="text-slate-300 text-lg">Tu experiencia es de <span className="text-purple-400 font-semibold">{player.experience}</span>. Elige un club para presentarte a presidente.</p>
            </div>

            <div className="w-full max-w-6xl space-y-10">
                {(['Top', 'Mid', 'Lower'] as const).map(tier => (
                    <div key={tier} className="space-y-4">
                        <div className={`p-4 rounded-xl border-2 ${TIER_COLORS[tier]}`}>
                            <h2 className="text-2xl font-bold text-white">
                                Nivel {tier}
                                <span className='text-base text-slate-400 font-normal ml-3'>- {TIER_DESC[tier]}</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {teamsByTier[tier].map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => onSelectTeam(team)}
                                    className="group bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl flex flex-col items-center justify-center space-y-3 border-2 border-slate-700 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300"
                                >
                                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                                        {team.logo}
                                    </div>
                                    <span className="font-semibold text-center text-sm text-white group-hover:text-purple-300 transition-colors">
                                        {team.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
