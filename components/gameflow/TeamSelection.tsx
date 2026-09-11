import React, { useState, useMemo } from 'react';
import { TEAMS } from '../../constants';
import { Team, PlayerProfile, LeagueId, CountryCode } from '../../types';
import { TeamLogo } from '../../data/teams/helpers';
import { formatCurrency } from '../../utils';

interface TeamSelectionProps {
    player: PlayerProfile;
    onSelectTeam: (team: Team) => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({ player, onSelectTeam }) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
    const [selectedLeague, setSelectedLeague] = useState<LeagueId | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const COUNTRY_CONFIG: Record<CountryCode, {
        title: string;
        leagues: {
            id: LeagueId;
            name: string;
            logo: string;
            teams: string;
            div: string;
        }[];
    }> = {
        ENG: {
            title: 'La Cuna del Fútbol',
            leagues: [
                { id: LeagueId.PREMIER_LEAGUE, name: 'Premier League', logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Premier%20League/england_english-premier-league.football-logos.cc.svg', teams: '20', div: '1ª División' },
                { id: LeagueId.CHAMPIONSHIP, name: 'Championship', logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Championship/england_efl-championship.football-logos.cc.svg', teams: '24', div: '2ª División' }
            ]
        },
        ARG: {
            title: 'Pasión Argentina',
            leagues: [
                { id: LeagueId.LIGA_ARGENTINA, name: 'Liga Argentina', logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Argentina/primera_division/argentina_argentina-primera-division.football-logos.cc.svg', teams: '30', div: '1ª División' },
                { id: LeagueId.PRIMERA_NACIONAL, name: 'Primera Nacional', logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Argentina/primera_nacional/argentina_primera-nacional.football-logos.cc.svg', teams: '36', div: '2ª División' }
            ]
        },
        BRA: {
            title: 'O Jogo Bonito',
            leagues: [
                { id: LeagueId.BRASILEIRAO, name: 'Brasileirão', logo: 'https://tmssl.akamaized.net/images/logo/header/bra1.png', teams: '20', div: '1ª División' },
                { id: LeagueId.SERIE_B_BR, name: 'Série B', logo: 'https://tmssl.akamaized.net/images/logo/header/bra2.png', teams: '20', div: '2ª División' }
            ]
        },
        ESP: {
            title: 'La Pasión Española',
            leagues: [
                { id: LeagueId.LA_LIGA, name: 'La Liga', logo: 'https://tmssl.akamaized.net/images/logo/header/es1.png', teams: '20', div: '1ª División' },
                { id: LeagueId.SEGUNDA_DIVISION_ESP, name: 'Segunda División', logo: 'https://tmssl.akamaized.net/images/logo/header/es2.png', teams: '22', div: '2ª División' }
            ]
        },
        GER: {
            title: 'Deutsche Fußball',
            leagues: [
                { id: LeagueId.BUNDESLIGA, name: 'Bundesliga', logo: 'https://tmssl.akamaized.net/images/logo/header/l1.png', teams: '18', div: '1ª División' },
                { id: LeagueId.ZWEITE_BUNDESLIGA, name: '2. Bundesliga', logo: 'https://tmssl.akamaized.net/images/logo/header/l2.png', teams: '18', div: '2ª División' }
            ]
        },
        ITA: {
            title: 'Il Calcio Italiano',
            leagues: [
                { id: LeagueId.SERIE_A, name: 'Serie A', logo: 'https://tmssl.akamaized.net/images/logo/header/it1.png', teams: '20', div: '1ª División' },
                { id: LeagueId.SERIE_B_ITA, name: 'Serie B', logo: 'https://tmssl.akamaized.net/images/logo/header/it2.png', teams: '20', div: '2ª División' }
            ]
        },
        FRA: {
            title: 'Le Football Français',
            leagues: [
                { id: LeagueId.LIGUE_1, name: 'Ligue 1', logo: 'https://tmssl.akamaized.net/images/logo/header/fr1.png', teams: '18', div: '1ª División' },
                { id: LeagueId.LIGUE_2, name: 'Ligue 2', logo: 'https://tmssl.akamaized.net/images/logo/header/fr2.png', teams: '20', div: '2ª División' }
            ]
        },
        PAR: {
            title: 'Fútbol Paraguayo',
            leagues: [
                { id: LeagueId.COPA_DE_PRIMERA, name: 'Copa de Primera', logo: 'https://cdn.jsdelivr.net/gh/Extremer12/community-data-packs@main/Copa%20de%20Primera/paraguay_copa-de-primera.football-logos.cc.svg', teams: '14', div: '1ª División' }
            ]
        }
    };

    const COUNTRIES = [
        { id: 'ENG' as CountryCode, name: 'Inglaterra', flagUrl: 'https://flagcdn.com/gb-eng.svg' },
        { id: 'ESP' as CountryCode, name: 'España', flagUrl: 'https://flagcdn.com/es.svg' },
        { id: 'GER' as CountryCode, name: 'Alemania', flagUrl: 'https://flagcdn.com/de.svg' },
        { id: 'ITA' as CountryCode, name: 'Italia', flagUrl: 'https://flagcdn.com/it.svg' },
        { id: 'FRA' as CountryCode, name: 'Francia', flagUrl: 'https://flagcdn.com/fr.svg' },
        { id: 'ARG' as CountryCode, name: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg' },
        { id: 'BRA' as CountryCode, name: 'Brasil', flagUrl: 'https://flagcdn.com/br.svg' },
        { id: 'PAR' as CountryCode, name: 'Paraguay', flagUrl: 'https://flagcdn.com/py.svg' },
    ];

    const FAN_EXPECTATIONS: Record<Team['tier'], string> = {
        Top: 'Ganar Liga',
        Mid: 'Pelear Título',
        Lower: 'Clasificar Copas',
    };

    const FINANCIAL_STATUS: Record<Team['tier'], { label: string; color: string }> = {
        Top: { label: 'Muy Sólidas', color: '#10B981' },
        Mid: { label: 'Sólidas', color: '#3B82F6' },
        Lower: { label: 'Estables', color: '#F59E0B' },
    };

    const teamsByLeague = useMemo(() => {
        if (!selectedLeague) return [];
        return TEAMS.filter(t => t.leagueId === selectedLeague);
    }, [selectedLeague]);

    const currentStep = !selectedCountry ? 1 : !selectedLeague ? 2 : 3;

    const currentLeague = selectedCountry && selectedLeague
        ? COUNTRY_CONFIG[selectedCountry].leagues.find(l => l.id === selectedLeague)
        : null;

    const handleBack = () => {
        if (selectedLeague) {
            setSelectedLeague(null);
            setSelectedTeam(null);
        } else if (selectedCountry) {
            setSelectedCountry(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--apex-dark)' }}>
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-3 mb-4">
                    {currentStep > 1 && (
                        <button onClick={handleBack} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                            style={{ border: '1px solid var(--apex-border)' }}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <div className="flex-1 text-center">
                        <h1 className="text-lg font-extrabold tracking-[0.15em] uppercase text-white">Elige Tu Club</h1>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--apex-text-secondary)' }}>Construye Tu Legado</p>
                    </div>
                    {currentStep > 1 && <div className="w-9" />}
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-0 mb-4">
                    {[
                        { num: 1, label: 'PAÍS' },
                        { num: 2, label: 'LIGA' },
                        { num: 3, label: 'CLUB' }
                    ].map((step, i) => (
                        <React.Fragment key={step.num}>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                                    style={{
                                        background: currentStep >= step.num ? 'var(--apex-gold)' : 'transparent',
                                        border: `1px solid ${currentStep >= step.num ? 'var(--apex-gold)' : 'var(--apex-text-muted)'}`,
                                        color: currentStep >= step.num ? 'var(--apex-dark)' : 'var(--apex-text-muted)',
                                    }}>
                                    {step.num}
                                </div>
                                <span className="text-[9px] font-bold tracking-[0.1em]"
                                    style={{ color: currentStep >= step.num ? 'var(--apex-text)' : 'var(--apex-text-muted)' }}>
                                    {step.label}
                                </span>
                            </div>
                            {i < 2 && (
                                <div className="w-12 h-px mx-2" style={{ background: currentStep > step.num ? 'var(--apex-gold)' : 'var(--apex-border)' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step 1: Country */}
            {!selectedCountry && (
                <div className="flex-1 overflow-y-auto px-5 pb-6">
                    <div className="space-y-3 stagger-children">
                        {COUNTRIES.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCountry(c.id)}
                                className="w-full apex-card p-4 flex items-center gap-4 transition-all duration-300 hover:border-[rgba(200,168,78,0.3)] active:scale-[0.98]"
                            >
                                <img src={c.flagUrl} alt={c.name} className="w-11 h-7 object-cover rounded shadow-md" />
                                <div className="flex-1 text-left">
                                    <div className="text-base font-extrabold text-white uppercase tracking-wide">{c.name}</div>
                                    <div className="text-[10px] font-medium" style={{ color: 'var(--apex-text-secondary)' }}>
                                        {COUNTRY_CONFIG[c.id].title}
                                    </div>
                                </div>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-text-muted)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: League */}
            {selectedCountry && !selectedLeague && (
                <div className="flex-1 overflow-y-auto px-5 pb-6 animate-slide-up">
                    {/* Selected Country Banner */}
                    <div className="apex-card p-4 flex items-center gap-3 mb-4">
                        <div className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--apex-text-secondary)' }}>PAÍS SELECCIONADO</div>
                        <div className="flex items-center gap-2.5 ml-auto">
                            <img src={COUNTRIES.find(c => c.id === selectedCountry)?.flagUrl} alt="" className="w-6 h-4 object-cover rounded shadow-xs" />
                            <span className="text-sm font-extrabold text-white uppercase">{COUNTRIES.find(c => c.id === selectedCountry)?.name}</span>
                        </div>
                    </div>

                    {/* League Cards */}
                    <div className="text-[10px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: 'var(--apex-text-secondary)' }}>SELECCIONA LA LIGA</div>
                    <div className="space-y-3">
                        {COUNTRY_CONFIG[selectedCountry].leagues.map((l, i) => (
                            <button
                                key={l.id}
                                onClick={() => setSelectedLeague(l.id)}
                                className="w-full apex-card p-5 flex items-center gap-4 transition-all duration-300 hover:border-[rgba(200,168,78,0.3)] active:scale-[0.98] animate-scale-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <img src={l.logo} alt={l.name} className="w-12 h-12 object-contain drop-shadow-md" />
                                <div className="flex-1 text-left">
                                    <div className="text-base font-extrabold text-white">{l.name}</div>
                                    <div className="text-[10px]" style={{ color: 'var(--apex-text-secondary)' }}>{l.teams} Clubes • {l.div}</div>
                                </div>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-text-muted)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Team */}
            {selectedLeague && (
                <div className="flex-1 overflow-y-auto px-5 pb-24 animate-slide-up">
                    {/* Country + League summary */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 apex-card p-3 flex items-center gap-2.5">
                            <img src={COUNTRIES.find(c => c.id === selectedCountry)?.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded shadow-xs" />
                            <span className="text-xs font-bold text-white uppercase truncate">{COUNTRIES.find(c => c.id === selectedCountry)?.name}</span>
                        </div>
                        <div className="flex-1 apex-card p-3 flex items-center gap-2.5">
                            {currentLeague && <img src={currentLeague.logo} alt="" className="w-5 h-5 object-contain" />}
                            <span className="text-xs font-bold text-white truncate">{currentLeague?.name}</span>
                            <span className="text-[9px] ml-auto text-white/50">{currentLeague?.teams} Clubes</span>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--apex-text-secondary)' }}>SELECCIONA TU CLUB</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {teamsByLeague.map((team, i) => {
                            const isSelected = selectedTeam?.id === team.id;
                            return (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeam(team)}
                                    className="relative p-3.5 rounded-2xl text-left transition-all duration-300 active:scale-[0.97] animate-scale-in flex flex-col justify-between h-full group cursor-pointer"
                                    style={{
                                        animationDelay: `${i * 30}ms`,
                                        background: isSelected ? 'rgba(200,168,78,0.08)' : 'var(--apex-card)',
                                        border: `1.5px solid ${isSelected ? 'var(--apex-gold)' : 'rgba(255,255,255,0.08)'}`,
                                        boxShadow: isSelected ? '0 0 16px rgba(200,168,78,0.2)' : 'none',
                                    }}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2.5 right-2.5">
                                            <span className="w-5 h-5 rounded-full bg-[var(--apex-gold)] text-slate-950 flex items-center justify-center shadow-md">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            </span>
                                        </div>
                                    )}

                                    {/* Cabecera del club */}
                                    <div className="flex items-center gap-2.5 mb-2.5 pr-4">
                                        <div className="w-10 h-10 shrink-0 flex items-center justify-center drop-shadow-sm">
                                            <TeamLogo team={team} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-black text-white uppercase leading-tight truncate">{team.name}</div>
                                            <div className="text-[10px] text-slate-400 truncate mt-0.5">{formatCurrency(team.budget)} Presupuesto</div>
                                        </div>
                                    </div>

                                    {/* Métricas Simétricas de 2 Columnas */}
                                    <div className="w-full pt-2.5 border-t border-white/[0.08] grid grid-cols-2 gap-1.5 mt-auto">
                                        <div className="bg-white/[0.03] rounded-xl py-1.5 px-1.5 flex flex-col items-center justify-center text-center">
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Finanzas</span>
                                            <span className="text-[10px] font-black tracking-tight truncate w-full" style={{ color: FINANCIAL_STATUS[team.tier].color }}>
                                                {FINANCIAL_STATUS[team.tier].label}
                                            </span>
                                        </div>
                                        <div className="bg-white/[0.03] rounded-xl py-1.5 px-1.5 flex flex-col items-center justify-center text-center">
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Objetivo</span>
                                            <span className="text-[10px] font-black tracking-tight truncate w-full text-amber-300">
                                                {FAN_EXPECTATIONS[team.tier]}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Team Detail */}
                    {selectedTeam && (
                        <div className="apex-card p-4 mt-4 animate-slide-up border border-[var(--apex-gold)]/40 shadow-2xl">
                            <div className="flex items-center gap-3.5 mb-3">
                                <div className="w-12 h-12 shrink-0 flex items-center justify-center drop-shadow-md">
                                    <TeamLogo team={selectedTeam} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="text-base font-black text-white uppercase truncate">{selectedTeam.name}</div>
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--apex-gold)]/15 text-[var(--apex-gold)] border border-[var(--apex-gold)]/30 shrink-0">
                                            {selectedTeam.tier === 'Top' ? 'Élite' : selectedTeam.tier === 'Mid' ? 'Primera' : 'Ascenso / Copas'}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                        {selectedTeam.tier === 'Top' ? 'Uno de los clubes con mayor historia y ambición continental.' :
                                         selectedTeam.tier === 'Mid' ? 'Un club con bases firmes y aspiración de pelear arriba.' :
                                         'Un proyecto desafiante preparado para tu visión de gestión.'}
                                    </div>
                                </div>
                            </div>

                            {/* Desglose Simétrico de 4 Métricas */}
                            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-center">
                                <div className="bg-white/[0.03] py-2 px-1 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Presupuesto</div>
                                    <div className="text-xs font-black text-white mt-0.5">{formatCurrency(selectedTeam.budget)}</div>
                                </div>
                                <div className="bg-white/[0.03] py-2 px-1 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Fichajes</div>
                                    <div className="text-xs font-black text-emerald-400 mt-0.5">{formatCurrency(selectedTeam.transferBudget)}</div>
                                </div>
                                <div className="bg-white/[0.03] py-2 px-1 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Finanzas</div>
                                    <div className="text-xs font-black mt-0.5 truncate" style={{ color: FINANCIAL_STATUS[selectedTeam.tier].color }}>
                                        {FINANCIAL_STATUS[selectedTeam.tier].label}
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] py-2 px-1 rounded-xl border border-white/5">
                                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Objetivo</div>
                                    <div className="text-xs font-black text-amber-300 mt-0.5 truncate">
                                        {FAN_EXPECTATIONS[selectedTeam.tier]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Fixed Bottom CTA */}
            {selectedTeam && (
                <div className="fixed bottom-0 left-0 right-0 p-5 z-50 animate-slide-up" style={{ background: 'linear-gradient(to top, var(--apex-dark), transparent)' }}>
                    <button
                        onClick={() => onSelectTeam(selectedTeam)}
                        className="apex-btn-gold"
                    >
                        CONFIRMAR ELECCIÓN
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
