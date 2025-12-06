import React, { useState, useMemo } from 'react';
import { TEAMS } from '../../constants';
import { Team, PlayerProfile, LeagueId, CountryCode } from '../../types';

interface TeamSelectionProps {
    player: PlayerProfile;
    onSelectTeam: (team: Team) => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ player, onSelectTeam }) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
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
            : [];

        return filtered.reduce((acc, team) => {
            if (!acc[team.tier]) acc[team.tier] = [];
            acc[team.tier].push(team);
            return acc;
        }, {} as Record<Team['tier'], Team[]>);
    }, [selectedLeague]);

    // 1. Country Selection View
    if (!selectedCountry) {
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
                            Elige el país donde iniciarás tu carrera
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {/* England Card */}
                        <button
                            onClick={() => setSelectedCountry('ENG')}
                            className="group relative bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-2 border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex flex-col items-center">
                                <div className="text-8xl mb-6 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                                    🇬🇧
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Inglaterra</h2>
                                <p className="text-slate-400 text-center">La cuna del fútbol. Premier League y Championship.</p>
                            </div>
                        </button>

                        {/* Spain Card */}
                        <button
                            onClick={() => setSelectedCountry('ESP')}
                            className="group relative bg-gradient-to-br from-red-900/40 to-slate-900/40 border-2 border-red-500/30 rounded-2xl p-8 hover:border-red-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex flex-col items-center">
                                <div className="text-8xl mb-6 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                                    🇪🇸
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">España</h2>
                                <p className="text-slate-400 text-center">Técnica y pasión. La Liga te espera.</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. League Selection View (Dependent on Country)
    if (!selectedLeague) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl relative">
                    <button
                        onClick={() => setSelectedCountry(null)}
                        className="absolute -top-16 left-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a Países
                    </button>

                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Selecciona la Competición
                        </h1>
                        <p className="text-slate-400 text-lg">
                            {selectedCountry === 'ENG' ? 'Fútbol Inglés' : 'Fútbol Español'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 justify-center">
                        {selectedCountry === 'ENG' && (
                            <>
                                <button
                                    onClick={() => setSelectedLeague(LeagueId.PREMIER_LEAGUE)}
                                    className="group relative bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-2 border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-24 h-24 mb-6">
                                            <img src="/logos/Premier League.png" alt="Premier League" className="w-full h-full object-contain drop-shadow-2xl" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Premier League</h2>
                                        <div className="flex items-center gap-2 text-sm text-purple-400">
                                            <span className="font-semibold">20 Equipos</span> • <span>1ª División</span>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedLeague(LeagueId.CHAMPIONSHIP)}
                                    className="group relative bg-gradient-to-br from-sky-900/40 to-slate-900/40 border-2 border-sky-500/30 rounded-2xl p-8 hover:border-sky-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/20"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-24 h-24 mb-6">
                                            <img src="/logos/Sky Bet Championship.png" alt="Championship" className="w-full h-full object-contain drop-shadow-2xl" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Championship</h2>
                                        <div className="flex items-center gap-2 text-sm text-sky-400">
                                            <span className="font-semibold">24 Equipos</span> • <span>2ª División</span>
                                        </div>
                                    </div>
                                </button>
                            </>
                        )}

                        {selectedCountry === 'ESP' && (
                            <button
                                onClick={() => setSelectedLeague(LeagueId.LA_LIGA)}
                                className="group relative bg-gradient-to-br from-orange-900/40 to-slate-900/40 border-2 border-orange-500/30 rounded-2xl p-8 hover:border-orange-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 col-span-2 md:col-span-1 md:col-start-1 md:col-end-3 mx-auto w-full max-w-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex flex-col items-center">
                                    <div className="w-24 h-24 mb-6 flex items-center justify-center text-6xl">
                                        🇪🇸
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">La Liga</h2>
                                    <div className="flex items-center gap-2 text-sm text-orange-400">
                                        <span className="font-semibold">20 Equipos</span> • <span>1ª División</span>
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 3. Team Selection View
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
                    Volver a Ligas
                </button>
            </div>

            {/* League Header */}
            <div className='text-center my-8'>
                <div className="flex items-center justify-center gap-4 mb-4">
                    {selectedLeague === LeagueId.PREMIER_LEAGUE ? (
                        <img src="/logos/Premier League.png" alt="Premier League" className="w-20 h-20 object-contain drop-shadow-2xl" />
                    ) : selectedLeague === LeagueId.CHAMPIONSHIP ? (
                        <img src="/logos/Sky Bet Championship.png" alt="Championship" className="w-20 h-20 object-contain drop-shadow-2xl" />
                    ) : (
                        <div className="w-20 h-20 flex items-center justify-center">
                            <span className="text-5xl">🇪🇸</span>
                        </div>
                    )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent">
                    {selectedLeague === LeagueId.PREMIER_LEAGUE ? 'Premier League' : selectedLeague === LeagueId.CHAMPIONSHIP ? 'Championship' : 'La Liga'}
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
