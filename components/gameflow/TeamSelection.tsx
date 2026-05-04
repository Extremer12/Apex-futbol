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
    const [hoveredCountry, setHoveredCountry] = useState<CountryCode | null>(null);

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
            { id: 'ENG' as CountryCode, name: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg', desc: 'Intensidad, ritmo frenético y los clubes históricos del mundo.', leagues: 'Premier · Championship', glow: 'rgba(59,130,246,0.5)', borderHover: 'hover:border-blue-500', bgHover: 'hover:bg-blue-900/20', textHover: 'group-hover:text-blue-400', dotColor: 'bg-blue-500' },
            { id: 'ESP' as CountryCode, name: 'España', flagUrl: 'https://flagcdn.com/es.svg', desc: 'Donde el balón al piso es religión. Domina La Liga con talento.', leagues: 'La Liga', glow: 'rgba(239,68,68,0.5)', borderHover: 'hover:border-red-500', bgHover: 'hover:bg-red-900/20', textHover: 'group-hover:text-red-400', dotColor: 'bg-red-500' },
            { id: 'GER' as CountryCode, name: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg', desc: 'Estadios llenos y un modelo de desarrollo envidiado por Europa.', leagues: 'Bundesliga', glow: 'rgba(245,158,11,0.5)', borderHover: 'hover:border-amber-500', bgHover: 'hover:bg-amber-900/20', textHover: 'group-hover:text-amber-400', dotColor: 'bg-amber-500' },
            { id: 'ITA' as CountryCode, name: 'Italia', flagUrl: 'https://flagcdn.com/it.svg', desc: 'Defensa de hierro y táctica impecable. El ajedrez del fútbol.', leagues: 'Serie A', glow: 'rgba(16,185,129,0.5)', borderHover: 'hover:border-emerald-500', bgHover: 'hover:bg-emerald-900/20', textHover: 'group-hover:text-emerald-400', dotColor: 'bg-emerald-500' },
            { id: 'FRA' as CountryCode, name: 'Francia', flagUrl: 'https://flagcdn.com/fr.svg', desc: 'Talento joven, potencia física y el trampolín a la gloria europea.', leagues: 'Ligue 1 · Ligue 2', glow: 'rgba(99,102,241,0.5)', borderHover: 'hover:border-indigo-500', bgHover: 'hover:bg-indigo-900/20', textHover: 'group-hover:text-indigo-400', dotColor: 'bg-indigo-500' },
            { id: 'ARG' as CountryCode, name: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg', desc: 'Pasión sin límites, estadios que laten y la cuna del fútbol mundial.', leagues: 'Primera · Nacional', glow: 'rgba(14,165,233,0.5)', borderHover: 'hover:border-sky-500', bgHover: 'hover:bg-sky-900/20', textHover: 'group-hover:text-sky-400', dotColor: 'bg-sky-500' },
            { id: 'BRA' as CountryCode, name: 'Brasil', flagUrl: 'https://flagcdn.com/br.svg', desc: 'El Jogo Bonito. Talento infinito y el torneo más impredecible.', leagues: 'Brasileirão · Série B', glow: 'rgba(132,204,22,0.5)', borderHover: 'hover:border-lime-500', bgHover: 'hover:bg-lime-900/20', textHover: 'group-hover:text-lime-400', dotColor: 'bg-lime-500' },
        ];
        const active = COUNTRIES.find(c => c.id === hoveredCountry);

        return (
            <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
                {/* Ambient background glow that shifts by country */}
                <div
                    className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 -translate-y-1/2"
                    style={{ background: active ? active.glow : 'rgba(139,92,246,0.15)', opacity: 0.25 }}
                />
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-700/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />

                <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* ─── LEFT: Header + List ─── */}
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div>
                            <span className="text-purple-400 font-bold tracking-[0.3em] uppercase text-xs mb-2 block">Comienza tu Legado</span>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-3">
                                Hola,&nbsp;
                                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    {player.name}
                                </span>
                            </h1>
                            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                                Elige el país donde escribirás tu historia. Tu experiencia de&nbsp;
                                <span className="text-white font-semibold">{player.experience}</span> te ha traído hasta aquí.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                            {COUNTRIES.map((c, i) => (
                                <button
                                    key={c.id}
                                    onMouseEnter={() => setHoveredCountry(c.id)}
                                    onMouseLeave={() => setHoveredCountry(null)}
                                    onClick={() => setSelectedCountry(c.id)}
                                    className={`group flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md transition-all duration-300 ${c.bgHover} ${c.borderHover} hover:border-opacity-60 hover:-translate-y-1 hover:shadow-xl w-full animate-scale-in`}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {/* Flag */}
                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 overflow-hidden p-2">
                                        <img src={c.flagUrl} alt={c.name} className="w-full h-full object-contain drop-shadow-md" />
                                    </div>

                                    {/* Text */}
                                    <div className="text-left flex-1 min-w-0">
                                        <div className={`text-lg font-black text-white uppercase tracking-wide transition-colors duration-300 ${c.textHover} truncate`}>
                                            {c.name}
                                        </div>
                                        <div className="text-slate-500 text-[10px] font-semibold mt-0.5 truncate">{c.leagues}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── RIGHT: Interactive Preview Panel ─── */}
                    <div className="hidden lg:flex flex-col items-center justify-center relative min-h-[460px]">
                        {/* Globe ring decoration */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div
                                className="w-[380px] h-[380px] rounded-full border transition-all duration-700"
                                style={{ borderColor: active ? active.glow : 'rgba(255,255,255,0.04)', boxShadow: active ? `0 0 80px ${active.glow}22` : 'none' }}
                            />
                            <div
                                className="absolute w-[280px] h-[280px] rounded-full border transition-all duration-700"
                                style={{ borderColor: active ? active.glow : 'rgba(255,255,255,0.03)' }}
                            />
                            {/* Orbiting dot */}
                            <div
                                className="absolute w-3 h-3 rounded-full top-[10%] left-1/2 transition-all duration-700"
                                style={{ background: active ? active.glow : '#334155', boxShadow: active ? `0 0 12px ${active.glow}` : 'none' }}
                            />
                        </div>

                        {/* Content */}
                        {active ? (
                            <div key={active.id} className="relative z-10 flex flex-col items-center text-center gap-6 animate-scale-in">
                                <div
                                    className="text-[140px] leading-none select-none animate-scale-in"
                                    style={{ filter: `drop-shadow(0 0 40px ${active.glow})` }}
                                >
                                    {active.flag}
                                </div>
                                <div>
                                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter">{active.name}</h2>
                                    <div
                                        className="h-1 w-16 rounded-full mx-auto mt-3 mb-5 transition-all duration-500"
                                        style={{ background: active.glow }}
                                    />
                                    <p className="text-slate-300 text-base max-w-xs mx-auto leading-relaxed">{active.desc}</p>
                                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                        <span className={`w-2 h-2 rounded-full ${active.dotColor}`} />
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{active.leagues}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 flex flex-col items-center text-slate-700 gap-4">
                                <svg className="w-20 h-20 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-semibold uppercase tracking-[0.25em] text-sm animate-pulse">Pasa el cursor por un país</p>
                            </div>
                        )}
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
