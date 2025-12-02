import React, { useState, useMemo } from 'react';
import { TEAMS } from '../../constants';
import { Team, PlayerProfile, LeagueId } from '../../types';

interface TeamSelectionProps {
    player: PlayerProfile;
    onSelectTeam: (team: Team) => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ player, onSelectTeam }) => {
    const [selectedLeague, setSelectedLeague] = useState<LeagueId | null>(null);

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

    const teamsByTier = useMemo(() => {
        const filtered = selectedLeague
            ? TEAMS.filter(t => t.leagueId === selectedLeague)
            : TEAMS;

        return filtered.reduce((acc, team) => {
            if (!acc[team.tier]) acc[team.tier] = [];
            acc[team.tier].push(team);
            return acc;
        }, {} as Record<Team['tier'], Team[]>);
    }, [selectedLeague]);

    // League selection view
    if (!selectedLeague) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold mb-4 text-white">
                            Bienvenido, {player.name}
                        </h1>
                        <p className="text-slate-400 text-lg mb-2">
                            Tu experiencia es de <span className="text-purple-400 font-semibold">{player.experience}</span>
                        </p>
                        <p className="text-slate-300 text-xl font-semibold mt-6">
                            Selecciona tu Liga
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Premier League Card */}
                        <button
                            onClick={() => setSelectedLeague('PREMIER_LEAGUE')}
                            className="group relative bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-2 border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative">
                                <div className="w-20 h-20 mx-auto mb-6">
                                    <img
                                        src="/logos/Premier League.png"
                                        alt="Premier League"
                                        className="w-full h-full object-contain drop-shadow-2xl"
                                    />
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-3">
                                    Premier League
                                </h2>

                                <p className="text-slate-300 mb-4">
                                    La liga más competitiva del mundo
                                </p>

                                <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
                                    <span className="font-semibold">20 Equipos</span>
                                    <span>•</span>
                                    <span>Máximo Nivel</span>
                                </div>
                            </div>
                        </button>

                        {/* Championship Card */}
                        <button
                            onClick={() => setSelectedLeague('CHAMPIONSHIP')}
                            className="group relative bg-gradient-to-br from-sky-900/40 to-slate-900/40 border-2 border-sky-500/30 rounded-2xl p-8 hover:border-sky-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-sky-600 to-sky-800 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-2xl">CH</span>
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-3">
                                    Championship
                                </h2>

                                <p className="text-slate-300 mb-4">
                                    El desafío del ascenso a la élite
                                </p>

                                <div className="flex items-center justify-center gap-2 text-sm text-sky-400">
                                    <span className="font-semibold">24 Equipos</span>
                                    <span>•</span>
                                    <span>Segunda División</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Team selection view
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 flex flex-col items-center p-4">
            {/* Header with back button */}
            <div className="w-full max-w-6xl mb-8 flex items-center justify-between">
                <button
                    onClick={() => setSelectedLeague(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a ligas
                </button>
            </div>

            {/* League Header */}
            <div className='text-center my-8'>
                <div className="flex items-center justify-center gap-4 mb-4">
                    {selectedLeague === 'PREMIER_LEAGUE' ? (
                        <img
                            src="/logos/Premier League.png"
                            alt="Premier League"
                            className="w-20 h-20 object-contain drop-shadow-2xl"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-600 to-sky-800 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-3xl">CH</span>
                        </div>
                    )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent">
                    {selectedLeague === 'PREMIER_LEAGUE' ? 'Premier League' : 'Championship'}
                </h1>
                <p className="text-slate-300 text-lg">Elige un club para presentarte a presidente</p>
            </div>

            <div className="w-full max-w-6xl space-y-10">
                {(['Top', 'Mid', 'Lower'] as const).map(tier => {
                    const teamsInTier = teamsByTier[tier];
                    if (!teamsInTier || teamsInTier.length === 0) return null;

                    return (
                        <div key={tier} className="space-y-4">
                            <div className={`p-4 rounded-xl border-2 ${TIER_COLORS[tier]}`}>
                                <h2 className="text-2xl font-bold text-white">
                                    Nivel {tier}
                                    <span className='text-base text-slate-400 font-normal ml-3'>- {TIER_DESC[tier]}</span>
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {teamsInTier.map(team => (
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
                    );
                })}
            </div>
        </div>
    );
};
