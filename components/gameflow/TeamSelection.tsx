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
            title: 'The Home of Football',
            leagues: [
                { id: LeagueId.PREMIER_LEAGUE, name: 'Premier League', logo: '/logos/Premier League.png', teams: '20', div: '1st Division' },
                { id: LeagueId.CHAMPIONSHIP, name: 'Championship', logo: '/logos/Sky Bet Championship.png', teams: '24', div: '2nd Division' }
            ]
        },
        ARG: {
            title: 'Pasión Argentina',
            leagues: [
                { id: LeagueId.LIGA_ARGENTINA, name: 'Liga Argentina', logo: 'https://tmssl.akamaized.net/images/logo/header/ar1p.png', teams: '28', div: '1st Division' },
                { id: LeagueId.PRIMERA_NACIONAL, name: 'Primera Nacional', logo: 'https://tmssl.akamaized.net/images/logo/header/ar2n.png', teams: '38', div: '2nd Division' }
            ]
        },
        BRA: {
            title: 'O Jogo Bonito',
            leagues: [
                { id: LeagueId.BRASILEIRAO, name: 'Brasileirão', logo: 'https://tmssl.akamaized.net/images/logo/header/bra1.png', teams: '20', div: '1st Division' },
                { id: LeagueId.SERIE_B_BR, name: 'Série B', logo: 'https://tmssl.akamaized.net/images/logo/header/bra2.png', teams: '20', div: '2nd Division' }
            ]
        },
        ESP: {
            title: 'La Pasión Española',
            leagues: [
                { id: LeagueId.LA_LIGA, name: 'La Liga', logo: 'https://tmssl.akamaized.net/images/logo/header/es1.png', teams: '20', div: '1st Division' },
                { id: LeagueId.SEGUNDA_DIVISION_ESP, name: 'Segunda División', logo: 'https://tmssl.akamaized.net/images/logo/header/es2.png', teams: '22', div: '2nd Division' }
            ]
        },
        GER: {
            title: 'Deutsche Fußball',
            leagues: [
                { id: LeagueId.BUNDESLIGA, name: 'Bundesliga', logo: 'https://tmssl.akamaized.net/images/logo/header/l1.png', teams: '18', div: '1st Division' },
                { id: LeagueId.ZWEITE_BUNDESLIGA, name: '2. Bundesliga', logo: 'https://tmssl.akamaized.net/images/logo/header/l2.png', teams: '18', div: '2nd Division' }
            ]
        },
        ITA: {
            title: 'Il Calcio Italiano',
            leagues: [
                { id: LeagueId.SERIE_A, name: 'Serie A', logo: 'https://tmssl.akamaized.net/images/logo/header/it1.png', teams: '20', div: '1st Division' },
                { id: LeagueId.SERIE_B_ITA, name: 'Serie B', logo: 'https://tmssl.akamaized.net/images/logo/header/it2.png', teams: '20', div: '2nd Division' }
            ]
        },
        FRA: {
            title: 'Le Football Français',
            leagues: [
                { id: LeagueId.LIGUE_1, name: 'Ligue 1', logo: 'https://tmssl.akamaized.net/images/logo/header/fr1.png', teams: '18', div: '1st Division' },
                { id: LeagueId.LIGUE_2, name: 'Ligue 2', logo: 'https://tmssl.akamaized.net/images/logo/header/fr2.png', teams: '20', div: '2nd Division' }
            ]
        }
    };

    const COUNTRIES = [
        { id: 'ENG' as CountryCode, name: 'England', flagUrl: 'https://flagcdn.com/gb-eng.svg' },
        { id: 'ESP' as CountryCode, name: 'Spain', flagUrl: 'https://flagcdn.com/es.svg' },
        { id: 'GER' as CountryCode, name: 'Germany', flagUrl: 'https://flagcdn.com/de.svg' },
        { id: 'ITA' as CountryCode, name: 'Italy', flagUrl: 'https://flagcdn.com/it.svg' },
        { id: 'FRA' as CountryCode, name: 'France', flagUrl: 'https://flagcdn.com/fr.svg' },
        { id: 'ARG' as CountryCode, name: 'Argentina', flagUrl: 'https://flagcdn.com/ar.svg' },
        { id: 'BRA' as CountryCode, name: 'Brazil', flagUrl: 'https://flagcdn.com/br.svg' },
    ];

    const FAN_EXPECTATIONS: Record<Team['tier'], string> = {
        Top: 'Win the League',
        Mid: 'Win Trophies',
        Lower: 'Qualify Europe',
    };

    const FINANCIAL_STATUS: Record<Team['tier'], { label: string; color: string }> = {
        Top: { label: 'Very Strong', color: 'var(--apex-green)' },
        Mid: { label: 'Strong', color: 'var(--apex-green-light)' },
        Lower: { label: 'Stable', color: 'var(--apex-gold)' },
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
                        <h1 className="text-lg font-extrabold tracking-[0.15em] uppercase text-white">Choose Your Club</h1>
                        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--apex-text-secondary)' }}>Build Your Legacy</p>
                    </div>
                    {currentStep > 1 && <div className="w-9" />}
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-0 mb-4">
                    {[
                        { num: 1, label: 'COUNTRY' },
                        { num: 2, label: 'LEAGUE' },
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
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden p-2"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--apex-border)' }}>
                                    <img src={c.flagUrl} alt={c.name} className="w-full h-full object-contain" />
                                </div>
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
                        <div className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--apex-text-secondary)' }}>SELECT COUNTRY</div>
                        <div className="flex items-center gap-2 ml-auto">
                            <img src={COUNTRIES.find(c => c.id === selectedCountry)?.flagUrl} alt="" className="w-5 h-4 object-contain" />
                            <span className="text-sm font-extrabold text-white uppercase">{COUNTRIES.find(c => c.id === selectedCountry)?.name}</span>
                        </div>
                    </div>

                    {/* League Cards */}
                    <div className="text-[10px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: 'var(--apex-text-secondary)' }}>SELECT LEAGUE</div>
                    <div className="space-y-3">
                        {COUNTRY_CONFIG[selectedCountry].leagues.map((l, i) => (
                            <button
                                key={l.id}
                                onClick={() => setSelectedLeague(l.id)}
                                className="w-full apex-card p-5 flex items-center gap-4 transition-all duration-300 hover:border-[rgba(200,168,78,0.3)] active:scale-[0.98] animate-scale-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center p-1"
                                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <img src={l.logo} alt={l.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-base font-extrabold text-white">{l.name}</div>
                                    <div className="text-[10px]" style={{ color: 'var(--apex-text-secondary)' }}>{l.teams} Clubs Competing</div>
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
                        <div className="flex-1 apex-card p-3 flex items-center gap-2">
                            <img src={COUNTRIES.find(c => c.id === selectedCountry)?.flagUrl} alt="" className="w-5 h-4 object-contain" />
                            <span className="text-xs font-bold text-white uppercase">{COUNTRIES.find(c => c.id === selectedCountry)?.name}</span>
                        </div>
                        <div className="flex-1 apex-card p-3 flex items-center gap-2">
                            {currentLeague && <img src={currentLeague.logo} alt="" className="w-5 h-5 object-contain" />}
                            <span className="text-xs font-bold text-white">{currentLeague?.name}</span>
                            <span className="text-[9px] ml-auto" style={{ color: 'var(--apex-text-muted)' }}>{currentLeague?.teams} Clubs</span>
                        </div>
                    </div>

                    {/* Team Grid */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--apex-text-secondary)' }}>SELECT CLUB</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {teamsByLeague.map((team, i) => {
                            const isSelected = selectedTeam?.id === team.id;
                            return (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeam(team)}
                                    className="relative p-4 rounded-2xl text-left transition-all duration-300 active:scale-[0.97] animate-scale-in"
                                    style={{
                                        animationDelay: `${i * 30}ms`,
                                        background: isSelected ? 'rgba(200,168,78,0.06)' : 'var(--apex-card)',
                                        border: `1px solid ${isSelected ? 'var(--apex-gold)' : 'var(--apex-border)'}`,
                                    }}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--apex-gold)' }}>
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10">
                                            <TeamLogo team={team} className="w-full h-full" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-extrabold text-white uppercase leading-tight truncate">{team.name}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px]" style={{ color: 'var(--apex-text-muted)' }}>Financial Status</span>
                                            <span className="text-[9px] font-bold" style={{ color: FINANCIAL_STATUS[team.tier].color }}>{FINANCIAL_STATUS[team.tier].label}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px]" style={{ color: 'var(--apex-text-muted)' }}>Fan Expectations</span>
                                            <span className="text-[9px] font-bold" style={{ color: 'var(--apex-gold)' }}>{FAN_EXPECTATIONS[team.tier]}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Team Detail */}
                    {selectedTeam && (
                        <div className="apex-card p-4 mt-4 animate-slide-up">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8"><TeamLogo team={selectedTeam} className="w-full h-full" /></div>
                                <div>
                                    <div className="text-sm font-extrabold text-white uppercase">{selectedTeam.name}</div>
                                    <div className="text-[10px]" style={{ color: 'var(--apex-text-secondary)' }}>
                                        {selectedTeam.tier === 'Top' ? 'One of the most iconic clubs in the world.' :
                                         selectedTeam.tier === 'Mid' ? 'A club with ambition and potential for glory.' :
                                         'A growing project ready for your leadership.'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-3">
                                {[
                                    { icon: '🏆', label: 'History' },
                                    { icon: '👥', label: 'Squad' },
                                    { icon: '💰', label: 'Finances' },
                                ].map(item => (
                                    <div key={item.label} className="flex flex-col items-center gap-1 flex-1">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--apex-border)' }}>
                                            {item.icon}
                                        </div>
                                        <span className="text-[9px] font-semibold" style={{ color: 'var(--apex-text-secondary)' }}>{item.label}</span>
                                    </div>
                                ))}
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
                        CONFIRM SELECTION
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
