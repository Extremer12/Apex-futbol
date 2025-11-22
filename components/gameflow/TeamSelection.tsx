import React, { useMemo } from 'react';
import { TEAMS } from '../../constants';
import { Team, PlayerProfile } from '../../types';

interface TeamSelectionProps {
    player: PlayerProfile;
    onSelectTeam: (team: Team) => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ player, onSelectTeam }) => {
    const TIER_COLORS: Record<Team['tier'], string> = { Top: 'border-red-500/80', Mid: 'border-yellow-500/80', Lower: 'border-green-500/80' };
    const TIER_DESC: Record<Team['tier'], string> = { Top: 'Riesgo Alto', Mid: 'Desafiante', Lower: 'Comienzo Recomendado' };

    const teamsByTier = useMemo(() => TEAMS.reduce((acc, team) => {
        if (!acc[team.tier]) acc[team.tier] = [];
        acc[team.tier].push(team);
        return acc;
    }, {} as Record<Team['tier'], Team[]>), []);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4">
            <div className='text-center my-8'>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-sky-400">Bienvenido, {player.name}</h1>
                <p className="text-slate-300">Tu experiencia es de {player.experience}. Elige un club para presentarte a presidente.</p>
            </div>
            <div className="w-full max-w-5xl space-y-10">
                {(['Top', 'Mid', 'Lower'] as const).map(tier => (
                    <div key={tier}>
                        <h2 className={`text-2xl font-bold mb-4 pl-4 border-l-4 ${TIER_COLORS[tier]}`}>Nivel {tier} <span className='text-base text-slate-400 font-normal'>- {TIER_DESC[tier]}</span></h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {teamsByTier[tier].map(team => (
                                <button key={team.id} onClick={() => onSelectTeam(team)} className="bg-slate-900 p-4 rounded-lg flex flex-col items-center justify-center space-y-3 hover:bg-slate-800/50 border border-slate-800 hover:border-sky-600/50 hover:scale-105 transition-all duration-200">
                                    {team.logo}
                                    <span className="font-semibold text-center text-sm">{team.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
