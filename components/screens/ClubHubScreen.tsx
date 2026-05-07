import React from 'react';
import { GameState, Screen, ElectoralPromise } from '../../types';
import { GameAction } from '../../state/reducer';
import { formatCurrency, formatCurrencyShort } from '../../utils';
import { TrophyIcon, UsersIcon, TrendingUpIcon } from '../icons';

interface ClubHubScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

export const ClubHubScreen: React.FC<ClubHubScreenProps> = ({ gameState, dispatch }) => {
    const { team, mandate, fanApproval, electoralPromises, boardConfidence, stadium, finances } = gameState;

    const getPromiseTypeIcon = (type: ElectoralPromise['type']) => {
        switch (type) {
            case 'league_position': return <TrophyIcon className="w-5 h-5 text-white/70" />;
            case 'trophy': return <TrophyIcon className="w-5 h-5 text-[var(--apex-gold)]" />;
            case 'stadium': return <div className="p-1 bg-white/10 rounded border border-white/5">🏟️</div>;
            case 'transfer': return <UsersIcon className="w-5 h-5 text-white/70" />;
            case 'finances': return <div className="p-1 bg-[var(--apex-gold)]/10 rounded border border-[var(--apex-gold)]/30 text-[var(--apex-gold)]">💰</div>;
            default: return null;
        }
    };

    const handleGoToStadium = () => {
        dispatch({ type: 'SET_SCREEN', payload: Screen.Stadium });
    };

    const handleGoToSponsorships = () => {
        dispatch({ type: 'SET_SCREEN', payload: Screen.Sponsorships });
    };

    const handleGoToTrophies = () => {
        dispatch({ type: 'SET_SCREEN', payload: Screen.Trophies });
    };

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24 animate-fade-in">
            {/* Header / Mandate Banner */}
            <div className="relative overflow-hidden apex-card p-6 md:p-8">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <TrophyIcon className="w-48 h-48 text-[var(--apex-gold)] grayscale" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-1">Presidential Office</h2>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase italic tracking-tighter">Club Hub</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-[var(--apex-gold)]/10 text-[var(--apex-gold)] px-3 py-1.5 rounded text-[10px] font-black border border-[var(--apex-gold)]/30 uppercase tracking-widest">
                            TERM #{mandate.totalMandates}
                        </span>
                        <span className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-[var(--apex-green)] rounded-full animate-pulse shadow-[0_0_10px_rgba(46,204,113,0.5)]"></span>
                            Year {mandate.currentYear} of 4
                        </span>
                        <span className="text-white/20 hidden md:inline">|</span>
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded border border-white/5">Next Election: Season {mandate.nextElectionSeason}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Popularity & Board */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Fan Approval Card */}
                    <div className="apex-card p-6">
                        <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-[var(--apex-gold)]" /> Fan Approval
                        </h2>
                        
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl">
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="currentColor" strokeWidth="6" fill="transparent"
                                        className="text-black/50"
                                    />
                                    <circle
                                        cx="64" cy="64" r="58"
                                        stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="transparent"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 - (364.4 * fanApproval.rating) / 100}
                                        className={`${fanApproval.rating >= 70 ? 'text-[var(--apex-green)]' : fanApproval.rating >= 40 ? 'text-[var(--apex-gold)]' : 'text-[var(--apex-red)]'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-white tracking-tighter">{fanApproval.rating}%</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${fanApproval.trend === 'rising' ? 'text-[var(--apex-green)]' : fanApproval.trend === 'falling' ? 'text-[var(--apex-red)]' : 'text-white/50'}`}>
                                        {fanApproval.trend === 'rising' ? '▲ RISING' : fanApproval.trend === 'falling' ? '▼ FALLING' : '● STABLE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Key Factors</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { label: 'Sporting Results', value: fanApproval.factors.results, icon: <TrophyIcon className="w-3.5 h-3.5" /> },
                                    { label: 'Financial Health', value: fanApproval.factors.finances, icon: <span className="text-xs">💰</span> },
                                    { label: 'Transfer Policy', value: fanApproval.factors.transfers, icon: <UsersIcon className="w-3.5 h-3.5" /> },
                                    { label: 'Promises Met', value: fanApproval.factors.promises, icon: <TrendingUpIcon className="w-3.5 h-3.5" /> },
                                ].map((factor, i) => (
                                    <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="text-[var(--apex-gold)] opacity-70">{factor.icon}</div>
                                            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{factor.label}</span>
                                        </div>
                                        <span className={`font-black text-sm ${factor.value > 0 ? 'text-[var(--apex-green)]' : factor.value < 0 ? 'text-[var(--apex-red)]' : 'text-white/30'}`}>
                                            {factor.value > 0 ? '+' : ''}{factor.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Board Confidence */}
                    <div className="apex-card p-6 border-t-2 border-[var(--apex-gold)]">
                        <h2 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUpIcon className="w-4 h-4 text-[var(--apex-gold)]" /> Board Confidence
                        </h2>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Trust Level</span>
                            <span className="text-2xl font-black text-white tracking-tighter">{boardConfidence}%</span>
                        </div>
                        <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className={`h-full transition-all duration-1000 ${boardConfidence >= 70 ? 'bg-[var(--apex-green)]' : boardConfidence >= 40 ? 'bg-[var(--apex-gold)]' : 'bg-[var(--apex-red)]'}`}
                                style={{ width: `${boardConfidence}%` }}
                            />
                        </div>
                        <p className="text-[10px] font-bold text-white/50 mt-4 leading-relaxed uppercase tracking-widest">
                            {boardConfidence >= 80 ? 'The board is delighted with your vision and results.' : 
                             boardConfidence >= 50 ? 'You have the board\'s backing, but steady progress is expected.' : 
                             'Your position is under scrutiny. Immediate improvements are required.'}
                        </p>
                    </div>
                </div>

                {/* Right Column: Promises & Facilities */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Promises Card */}
                    <div className="apex-card p-6">
                        <h2 className="text-base font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
                            <div className="p-1.5 bg-[var(--apex-gold)]/10 rounded border border-[var(--apex-gold)]/20">
                                <TrophyIcon className="w-4 h-4 text-[var(--apex-gold)]" />
                            </div>
                            Electoral Promises
                        </h2>

                        {electoralPromises.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {electoralPromises.map(promise => (
                                    <div key={promise.id} className={`relative group p-4 rounded-xl border transition-all duration-300 ${promise.fulfilled ? 'bg-[var(--apex-green)]/5 border-[var(--apex-green)]/30' : 'bg-black/30 border-white/5 hover:border-[var(--apex-gold)]/30'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 opacity-80">{getPromiseTypeIcon(promise.type)}</div>
                                                <h3 className="font-bold text-sm text-white leading-tight">{promise.description}</h3>
                                            </div>
                                            {promise.fulfilled && (
                                                <span className="bg-[var(--apex-green)] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ml-2 flex-shrink-0 shadow-[0_0_10px_rgba(46,204,113,0.3)]">MET</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Impact: <span className="text-[var(--apex-gold)] font-black">+{promise.impact}</span></span>
                                            <span className="bg-white/5 text-white/40 px-2 py-1 rounded border border-white/5 text-[9px] font-black uppercase tracking-widest">T.{promise.deadline}</span>
                                        </div>

                                        {!promise.fulfilled && (
                                            <div className="mt-3 h-1 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                <div className="h-full bg-[var(--apex-gold)]/50 w-1/3 animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl py-12 text-center">
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">No active promises for this term.</p>
                            </div>
                        )}
                    </div>

                    {/* Infrastructure Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Stadium Card */}
                        <div className="apex-card p-5 hover:border-[var(--apex-gold)]/50 transition-all group cursor-pointer" onClick={handleGoToStadium}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-white/50 group-hover:bg-[var(--apex-gold)]/10 group-hover:text-[var(--apex-gold)] group-hover:border-[var(--apex-gold)]/30 transition-all">
                                    <span className="text-xl leading-none block">🏟️</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block mb-0.5">Capacity</span>
                                    <span className="text-sm font-black text-white">{stadium.capacity.toLocaleString()}</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-black text-white uppercase mb-1">Stadium</h3>
                            <p className="text-[10px] text-white/50 font-bold mb-4 uppercase tracking-widest leading-relaxed">Upgrade facilities & expand.</p>
                            <button className="w-full py-2 bg-black/40 border border-white/5 text-white/70 text-[9px] font-black rounded-lg group-hover:bg-[var(--apex-gold)] group-hover:text-black group-hover:border-[var(--apex-gold)] transition-all uppercase tracking-widest">Manage</button>
                        </div>

                        {/* Sponsorships Card */}
                        <div className="apex-card p-5 hover:border-[var(--apex-green)]/50 transition-all group cursor-pointer" onClick={handleGoToSponsorships}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-white/50 group-hover:bg-[var(--apex-green)]/10 group-hover:text-[var(--apex-green)] group-hover:border-[var(--apex-green)]/30 transition-all">
                                    <TrendingUpIcon className="w-5 h-5" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block mb-0.5">Wk. Income</span>
                                    <span className="text-sm font-black text-[var(--apex-green)]">+{formatCurrencyShort(gameState.sponsors.reduce((s, c) => s + c.weeklyIncome, 0))}</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-black text-white uppercase mb-1">Sponsors</h3>
                            <p className="text-[10px] text-white/50 font-bold mb-4 uppercase tracking-widest leading-relaxed">Negotiate deals & bonuses.</p>
                            <button className="w-full py-2 bg-black/40 border border-white/5 text-white/70 text-[9px] font-black rounded-lg group-hover:bg-[var(--apex-green)] group-hover:text-black group-hover:border-[var(--apex-green)] transition-all uppercase tracking-widest">View Contracts</button>
                        </div>

                        {/* Trophies Card */}
                        <div className="apex-card p-5 hover:border-[var(--apex-gold)]/50 transition-all group cursor-pointer" onClick={handleGoToTrophies}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-white/50 group-hover:bg-[var(--apex-gold)]/10 group-hover:text-[var(--apex-gold)] group-hover:border-[var(--apex-gold)]/30 transition-all">
                                    <TrophyIcon className="w-5 h-5" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] text-white/40 uppercase font-black tracking-widest block mb-0.5">Titles</span>
                                    <span className="text-sm font-black text-[var(--apex-gold)]">{team.trophyCabinet?.length || 0}</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-black text-white uppercase mb-1">Cabinet</h3>
                            <p className="text-[10px] text-white/50 font-bold mb-4 uppercase tracking-widest leading-relaxed">View club's historic honors.</p>
                            <button className="w-full py-2 bg-black/40 border border-white/5 text-white/70 text-[9px] font-black rounded-lg group-hover:bg-[var(--apex-gold)] group-hover:text-black group-hover:border-[var(--apex-gold)] transition-all uppercase tracking-widest">Open Cabinet</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
