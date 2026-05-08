import React from 'react';
import { GameState, Trophy } from '../../types';
import { TrophyIcon } from '../icons';
import { motion } from 'framer-motion';

interface TrophyRoomScreenProps {
    gameState: GameState;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', damping: 15 }
    }
};

export const TrophyRoomScreen: React.FC<TrophyRoomScreenProps> = ({ gameState }) => {
    const { team } = gameState;
    const trophies = team.trophyCabinet || [];

    const leagueTrophies = trophies.filter(t => t.type === 'league');
    const cupTrophies = trophies.filter(t => t.type === 'cup');

    return (
        <div className="p-4 md:p-6 space-y-8 pb-24 max-w-7xl mx-auto">
            {/* Header with Cinematic Glow */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden apex-card p-6 md:p-10 shadow-2xl group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000 pointer-events-none">
                    <TrophyIcon className="w-64 h-64 text-[var(--apex-gold)] grayscale" />
                </div>
                
                {/* Animated Particles Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [-20, -100],
                                opacity: [0, 0.3, 0],
                                x: Math.random() * 400 - 200
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 5
                            }}
                            className="absolute bottom-0 left-1/2 w-1 h-1 bg-[var(--apex-gold)] rounded-full blur-[1px]"
                        />
                    ))}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    {team.logo && (
                        <motion.div 
                            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                            className="w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-3xl p-4 shadow-[0_0_30px_rgba(200,168,78,0.2)] border border-[var(--apex-gold)]/30 flex items-center justify-center backdrop-blur-sm group-hover:border-[var(--apex-gold)]/60 transition-all duration-500"
                        >
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain drop-shadow-lg" />
                        </motion.div>
                    )}
                    <div className="text-center md:text-left">
                        <h2 className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase mb-2">Palmarés del Club</h2>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter uppercase italic leading-none">Sala de <span className="text-[var(--apex-gold)]">Trofeos</span></h1>
                        <p className="text-white/50 font-black uppercase tracking-widest text-[10px] bg-black/30 inline-block px-3 py-1.5 rounded-lg border border-white/5">Vitrina oficial de {team.name}</p>
                    </div>
                </div>
            </motion.div>

            {trophies.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="apex-card border-dashed border-white/20 rounded-3xl py-24 flex flex-col items-center justify-center text-center"
                >
                    <TrophyIcon className="w-20 h-20 text-white/10 mb-6" />
                    <h2 className="text-2xl font-black text-white/50 mb-3 uppercase tracking-widest">Vitrina Vacía</h2>
                    <p className="text-white/30 text-sm max-w-md px-4 leading-relaxed font-bold">
                        El club aún no ha conquistado títulos bajo tu mandato. ¡Trabaja duro para llenar esta sala de gloria!
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* League Trophies */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        <h2 className="text-lg font-black text-white flex items-center gap-3 border-b border-white/10 pb-4 uppercase tracking-widest">
                            <span className="text-[var(--apex-gold)] text-2xl drop-shadow-[0_0_10px_rgba(200,168,78,0.5)]">🏆</span> 
                            Ligas Nacionales <span className="text-white/30 ml-auto">({leagueTrophies.length})</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {leagueTrophies.map(trophy => (
                                <motion.div 
                                    variants={itemVariants}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    key={trophy.id} 
                                    className="apex-card p-6 flex flex-col items-center justify-center text-center hover:border-[var(--apex-gold)]/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--apex-gold)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <TrophyIcon className="w-14 h-14 text-[var(--apex-gold)] mb-4 drop-shadow-[0_0_15px_rgba(200,168,78,0.4)] group-hover:scale-110 transition-transform duration-500" />
                                    <span className="text-xs font-black text-white uppercase mb-2 leading-tight tracking-tight relative z-10">{trophy.name}</span>
                                    <span className="text-[9px] font-black text-[var(--apex-gold)] bg-[var(--apex-gold)]/10 px-2 py-1 rounded border border-[var(--apex-gold)]/20 uppercase tracking-[0.2em] relative z-10">
                                        S. {trophy.season}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Cup Trophies */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        <h2 className="text-lg font-black text-white flex items-center gap-3 border-b border-white/10 pb-4 uppercase tracking-widest">
                            <span className="text-slate-300 text-2xl drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]">🥈</span> 
                            Copas Nacionales <span className="text-white/30 ml-auto">({cupTrophies.length})</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {cupTrophies.map(trophy => (
                                <motion.div 
                                    variants={itemVariants}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    key={trophy.id} 
                                    className="apex-card p-6 flex flex-col items-center justify-center text-center hover:border-slate-300/50 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <TrophyIcon className="w-14 h-14 text-slate-300 mb-4 drop-shadow-[0_0_15px_rgba(203,213,225,0.3)] group-hover:scale-110 transition-transform duration-500" />
                                    <span className="text-xs font-black text-white uppercase mb-2 leading-tight tracking-tight relative z-10">{trophy.name}</span>
                                    <span className="text-[9px] font-black text-slate-300 bg-slate-400/10 px-2 py-1 rounded border border-slate-400/20 uppercase tracking-[0.2em] relative z-10">
                                        S. {trophy.season}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
