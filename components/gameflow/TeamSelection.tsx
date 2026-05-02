import React, { useState, useMemo } from 'react';
import { TEAMS } from '../../constants';
import { Team, PlayerProfile, LeagueId, CountryCode } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';

interface TeamSelectionProps {
    player: PlayerProfile;
    onSelectTeam: (team: Team) => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ player, onSelectTeam }) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
    const [selectedLeague, setSelectedLeague] = useState<LeagueId | null>(null);

    const TIER_COLORS: Record<Team['tier'], string> = {
        Top: 'from-purple-600/20 to-purple-900/40 border-purple-500/50 text-purple-400',
        Mid: 'from-amber-600/20 to-amber-900/40 border-amber-500/50 text-amber-400',
        Lower: 'from-emerald-600/20 to-emerald-900/40 border-emerald-500/50 text-emerald-400'
    };

    const TIER_DESC: Record<Team['tier'], string> = {
        Top: 'Expectativas Máximas - Solo para Valientes',
        Mid: 'Proyecto en Crecimiento - El Reto Perfecto',
        Lower: 'Desde los Cimientos - El Comienzo Ideal'
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
            <div className="min-h-screen bg-[#020617] relative overflow-hidden flex items-center justify-center p-4">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 blur-[120px] rounded-full animate-pulse delay-700" />
                </div>

                <div className="w-full max-w-6xl relative z-10 animate-fade-in">
                    <div className="text-center mb-16">
                        <span className="text-purple-500 font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Comienza tu Legado</span>
                        <h1 className="text-6xl md:text-7xl font-black mb-6 text-white tracking-tight">
                            Hola, <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{player.name}</span>
                        </h1>
                        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                            El mundo del fútbol te observa. Tu experiencia de <span className="text-white font-bold">{player.experience}</span> te ha traído hasta aquí. ¿En qué nación escribirás tu historia?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', desc: 'La Premier League y el ascenso frenético.', color: 'blue' },
                            { id: 'ESP', name: 'España', flag: '🇪🇸', desc: 'Técnica pura y rivalidades legendarias.', color: 'red' },
                            { id: 'GER', name: 'Alemania', flag: '🇩🇪', desc: 'Disciplina táctica y estadios llenos.', color: 'amber' },
                            { id: 'ITA', name: 'Italia', flag: '🇮🇹', desc: 'El arte de la defensa y la gloria táctica.', color: 'emerald' }
                        ].map((c, i) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCountry(c.id as CountryCode)}
                                className="group relative aspect-[3/4] overflow-hidden rounded-3xl border-2 border-white/5 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/50 hover:scale-[1.02] hover:shadow-2xl animate-scale-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80 group-hover:to-slate-900/90 transition-all duration-500" />
                                <div className="absolute inset-0 p-8 flex flex-col items-center justify-end">
                                    <div className="text-7xl mb-6 transform group-hover:scale-125 group-hover:-translate-y-4 transition-all duration-700 ease-out drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                        {c.flag}
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase italic">{c.name}</h2>
                                    <p className="text-slate-400 text-center text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        {c.desc}
                                    </p>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 2. League Selection View
    if (!selectedLeague) {
        return (
            <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                
                <div className="w-full max-w-5xl relative z-10 animate-fade-in">
                    <button
                        onClick={() => setSelectedCountry(null)}
                        className="group mb-12 flex items-center gap-3 text-slate-500 hover:text-white transition-all duration-300"
                    >
                        <div className="p-2 rounded-full border border-slate-800 group-hover:border-white/20 group-hover:bg-white/5 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span className="font-bold tracking-widest uppercase text-xs">Volver a Países</span>
                    </button>

                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
                            {selectedCountry === 'ENG' ? 'The English Game' : 
                             selectedCountry === 'ESP' ? 'La Pasión Española' :
                             selectedCountry === 'GER' ? 'Deutsche Fußball' : 'Il Calcio Italiano'}
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {selectedCountry === 'ENG' ? (
                            <>
                                {[
                                    { id: LeagueId.PREMIER_LEAGUE, name: 'Premier League', logo: '/logos/Premier League.png', teams: '20', div: '1ª División' },
                                    { id: LeagueId.CHAMPIONSHIP, name: 'Championship', logo: '/logos/Sky Bet Championship.png', teams: '24', div: '2ª División' }
                                ].map((l, i) => (
                                    <button
                                        key={l.id}
                                        onClick={() => setSelectedLeague(l.id)}
                                        className="group relative bg-slate-900/60 border border-white/5 rounded-[2rem] p-10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl animate-scale-in"
                                        style={{ animationDelay: `${i * 150}ms` }}
                                    >
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-32 h-32 mb-8 transform group-hover:scale-110 transition-transform duration-700 ease-out">
                                                <img src={l.logo} alt={l.name} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">{l.name}</h2>
                                            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-bold uppercase tracking-widest">
                                                {l.teams} Clubes • {l.div}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </>
                        ) : (
                            <button
                                onClick={() => setSelectedLeague(
                                    selectedCountry === 'ESP' ? LeagueId.LA_LIGA : 
                                    selectedCountry === 'GER' ? LeagueId.BUNDESLIGA : LeagueId.SERIE_A
                                )}
                                className="group relative bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-12 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl animate-scale-in col-span-2 max-w-xl mx-auto w-full"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                                <div className="relative flex flex-col items-center">
                                    <div className="w-40 h-40 mb-8 transform group-hover:scale-110 transition-transform duration-700 ease-out">
                                        <img 
                                            src={
                                                selectedCountry === 'ESP' ? 'https://tmssl.akamaized.net/images/logo/header/es1.png' : 
                                                selectedCountry === 'GER' ? 'https://tmssl.akamaized.net/images/logo/header/l1.png' : 
                                                'https://tmssl.akamaized.net/images/logo/header/it1.png'
                                            } 
                                            alt="League" 
                                            className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]" 
                                        />
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">
                                        {selectedCountry === 'ESP' ? 'La Liga' : selectedCountry === 'GER' ? 'Bundesliga' : 'Serie A'}
                                    </h2>
                                    <div className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-slate-300 text-md font-bold uppercase tracking-[0.2em]">
                                        {selectedCountry === 'GER' ? '18' : '20'} Equipos • Máxima Categoría
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
        <div className="min-h-screen bg-[#020617] relative flex flex-col items-center p-6 md:p-12 overflow-x-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-gradient-to-b from-purple-600/10 to-transparent blur-[100px] pointer-events-none" />
            
            {/* Nav Header */}
            <div className="w-full max-w-7xl relative z-10 flex items-center justify-between mb-12 animate-fade-in">
                <button
                    onClick={() => setSelectedLeague(null)}
                    className="group flex items-center gap-3 text-slate-500 hover:text-white transition-all"
                >
                    <div className="p-2 rounded-xl border border-slate-800 group-hover:bg-white/5 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-widest uppercase text-[10px]">Cambiar Liga</span>
                </button>
            </div>

            {/* Cinematic League Header */}
            <div className="text-center relative z-10 mb-20 animate-scale-in">
                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-white blur-[50px] opacity-20 animate-pulse" />
                    <img 
                        src={
                            selectedLeague === LeagueId.PREMIER_LEAGUE ? '/logos/Premier League.png' : 
                            selectedLeague === LeagueId.CHAMPIONSHIP ? '/logos/Sky Bet Championship.png' : 
                            selectedLeague === LeagueId.BUNDESLIGA ? 'https://tmssl.akamaized.net/images/logo/header/l1.png' :
                            selectedLeague === LeagueId.SERIE_A ? 'https://tmssl.akamaized.net/images/logo/header/it1.png' : 
                            'https://tmssl.akamaized.net/images/logo/header/es1.png'
                        } 
                        alt="League" 
                        className="w-32 h-32 md:w-48 md:h-48 object-contain relative z-10 drop-shadow-2xl" 
                    />
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-white uppercase italic">
                    {selectedLeague === LeagueId.PREMIER_LEAGUE ? 'Premier League' : 
                     selectedLeague === LeagueId.CHAMPIONSHIP ? 'Championship' : 
                     selectedLeague === LeagueId.BUNDESLIGA ? 'Bundesliga' :
                     selectedLeague === LeagueId.SERIE_A ? 'Serie A' : 'La Liga'}
                </h1>
                <p className="text-slate-400 text-xl font-medium tracking-wide">Toma el control del club y forja tu propio destino</p>
            </div>

            <div className="w-full max-w-7xl space-y-24 relative z-10 pb-20">
                {(['Top', 'Mid', 'Lower'] as const).map((tier, tierIdx) => {
                    const teamsInTier = teamsByTier[tier];
                    if (!teamsInTier || teamsInTier.length === 0) return null;

                    return (
                        <div key={tier} className="animate-fade-in" style={{ animationDelay: `${tierIdx * 200}ms` }}>
                            <div className={`mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 pl-6 py-2 bg-gradient-to-r ${TIER_COLORS[tier]} border-l-current`}>
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tight uppercase italic">Clubes {tier}</h2>
                                    <p className="text-slate-400 font-semibold mt-1">{TIER_DESC[tier]}</p>
                                </div>
                                <div className="text-xs font-black tracking-[0.3em] uppercase opacity-40">
                                    Total: {teamsInTier.length} Equipos
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {teamsInTier.map((team, i) => (
                                    <button
                                        key={team.id}
                                        onClick={() => onSelectTeam(team)}
                                        className="group relative bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-between gap-6 transition-all duration-500 hover:bg-white/5 hover:border-white/20 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-scale-in"
                                        style={{ animationDelay: `${(tierIdx * 100) + (i * 30)}ms` }}
                                    >
                                        <div className="w-20 h-20 md:w-24 md:h-24 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 ease-out">
                                            <TeamLogo team={team} className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                                        </div>
                                        <div className="text-center">
                                            <span className="font-black text-xs md:text-sm text-white leading-tight uppercase group-hover:text-purple-400 transition-colors block mb-1">
                                                {team.name}
                                            </span>
                                            <div className="flex justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <div className="w-1 h-1 rounded-full bg-white" />
                                                <div className="w-1 h-1 rounded-full bg-white" />
                                                <div className="w-1 h-1 rounded-full bg-white" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
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
