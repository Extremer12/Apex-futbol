import React, { useState, useMemo } from 'react';
import { GameState } from '../../types';
import { GameAction } from '../../state/reducer';
import { 
    Landmark, 
    Trophy, 
    Building2, 
    Vote, 
    Shield, 
    Sparkles, 
    Star, 
    Flame 
} from 'lucide-react';
import { calculateFanApproval } from '../../services/political';
import { ProfileHeroCard } from './profile/ProfileHeroCard';
import { MandatePoliticalTab } from './profile/MandatePoliticalTab';
import { PalmaresTab } from './profile/PalmaresTab';
import { CareerStintsTab } from './profile/CareerStintsTab';
import { ElectionsFutureTab } from './profile/ElectionsFutureTab';
import { StyleSelectionModal, PresidentialStyleItem } from './profile/StyleSelectionModal';

interface ProfileScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const PRESIDENT_LEVELS = [
    { level: 1, minXp: 0, title: 'Gestor Novato', desc: 'Dando los primeros pasos en la dirigencia deportiva.' },
    { level: 2, minXp: 200, title: 'Dirigente Comunitario', desc: 'Respaldo barrial y confianza de socios cercanos.' },
    { level: 3, minXp: 500, title: 'Gestor Consolidado', desc: 'Capaz de liderar asambleas y proyectos a mediano plazo.' },
    { level: 4, minXp: 900, title: 'Estratega Institucional', desc: 'Experto en finanzas, estatutos y negociaciones.' },
    { level: 5, minXp: 1400, title: 'Líder Político', desc: 'Gran peso en los comités de la liga y respeto gremial.' },
    { level: 6, minXp: 2000, title: 'Gran Negociador', desc: 'Atracción de patrocinadores multinacionales y fichajes estelares.' },
    { level: 7, minXp: 2700, title: 'Patriarca del Club', desc: 'Estatura histórica dentro de la institución.' },
    { level: 8, minXp: 3500, title: 'Figura Continental', desc: 'Respetado por federaciones y confederaciones.' },
    { level: 9, minXp: 4500, title: 'Leyenda Presidencial', desc: 'Su nombre está grabado en los anales del fútbol.' },
    { level: 10, minXp: 6000, title: 'Mito del Deporte', desc: 'Inmortal en la historia del fútbol internacional.' }
];

const PRESIDENTIAL_STYLES: PresidentialStyleItem[] = [
    {
        id: 'Equilibrado',
        title: 'Equilibrio Institucional',
        desc: 'Prioriza estabilidad presupuestaria, cantera y competitividad deportiva constante.',
        icon: Shield,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/30'
    },
    {
        id: 'Canterano',
        title: 'Formador de Cantera',
        desc: 'Fuerte inversión en divisiones juveniles e infraestructura para producir futuras joyas.',
        icon: Sparkles,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
        id: 'Galáctico',
        title: 'Comprador Galáctico',
        desc: 'Obsesionado con figuras rutilantes, impacto mediático y ventas récord de camisetas.',
        icon: Star,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
        id: 'Pragmático',
        title: 'Pragmático de Resultados',
        desc: 'El fin justifica los medios. Rendimiento inmediato en la tabla de posiciones a toda costa.',
        icon: Flame,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30'
    }
];

export const ProfileScreen: React.FC<ProfileScreenProps> = React.memo(({ gameState, dispatch }) => {
    const { playerProfile: rawProfile, mandate, boardConfidence, electoralPromises, team, season, seasonHistory, allTeams } = gameState;
    const [activeTab, setActiveTab] = useState<'MANDATE' | 'PALMARES' | 'STINTS' | 'ELECTIONS'>('MANDATE');

    // Resolved profile with localStorage fallback
    const playerProfile = useMemo(() => {
        let p = rawProfile;
        if ((!p || !p.name) && typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('apex_last_player_profile');
                if (cached) {
                    p = { ...JSON.parse(cached), ...p };
                }
            } catch (e) {
                // ignore
            }
        }
        return p;
    }, [rawProfile]);

    const firstName = playerProfile?.firstName || '';
    const lastName = playerProfile?.lastName || '';
    const rawFullName = playerProfile?.name || `${firstName} ${lastName}`.trim() || 'Presidente';
    const fullName = rawFullName.replace(/\bnull\b/gi, '').trim() || 'Presidente';
    const nationality = playerProfile?.nationality || team?.country || 'Argentina';
    const age = playerProfile?.age;
    const profilePhoto = playerProfile?.photo;

    // Style modal state
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<string>(playerProfile?.style || 'Equilibrado');

    // Experience & Progression Level
    const totalXp = playerProfile?.experience || 250;
    const currentLevelInfo = useMemo(() => {
        let current = PRESIDENT_LEVELS[0];
        let next = PRESIDENT_LEVELS[1];

        for (let i = 0; i < PRESIDENT_LEVELS.length; i++) {
            if (totalXp >= PRESIDENT_LEVELS[i].minXp) {
                current = PRESIDENT_LEVELS[i];
                next = PRESIDENT_LEVELS[i + 1] || PRESIDENT_LEVELS[i];
            } else {
                break;
            }
        }

        const xpInLevel = totalXp - current.minXp;
        const xpNeeded = next.minXp - current.minXp || 1;
        const progress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

        return {
            ...current,
            currentXp: totalXp,
            nextLevelXp: next.minXp,
            progress
        };
    }, [totalXp]);

    // Socios Approval Rating
    const fanApproval = useMemo(() => {
        return calculateFanApproval(gameState);
    }, [gameState]);

    // Career Stats Computation
    const careerStats = useMemo(() => {
        let totalMatches = 0;
        let totalWins = 0;
        let totalDraws = 0;
        let totalLosses = 0;

        if (seasonHistory && seasonHistory.length > 0) {
            seasonHistory.forEach(rec => {
                totalMatches += (rec.userWon + rec.userDrawn + rec.userLost);
                totalWins += rec.userWon;
                totalDraws += rec.userDrawn;
                totalLosses += rec.userLost;
            });
        }

        const currentTable = gameState.leagueTables[team.leagueId] || [];
        const userRow = currentTable.find(r => r.teamId === team.id);
        if (userRow) {
            totalMatches += userRow.played;
            totalWins += userRow.won;
            totalDraws += userRow.drawn;
            totalLosses += userRow.lost;
        }

        const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
        const trophiesCount = team.trophyCabinet?.length || 0;

        return {
            totalMatches,
            totalWins,
            totalDraws,
            totalLosses,
            winRate,
            trophiesCount
        };
    }, [seasonHistory, gameState.leagueTables, team]);

    // Mandate 4-year progress
    const mandateYear = mandate?.currentYear || 1;
    const isElectionYear = mandate?.isElectionYear || mandateYear >= 4;

    const prospectiveClubs = useMemo(() => {
        return allTeams
            .filter(t => t.id !== team.id && t.leagueId === team.leagueId)
            .slice(0, 4);
    }, [allTeams, team]);

    const handleSelectStyle = (styleId: string) => {
        setSelectedStyle(styleId);
        setShowStyleModal(false);
        dispatch({
            type: 'UPDATE_PLAYER_PROFILE',
            payload: { style: styleId }
        });
        if (typeof window !== 'undefined') {
            try {
                const current = playerProfile || { name: 'Presidente' };
                localStorage.setItem('apex_last_player_profile', JSON.stringify({ ...current, style: styleId }));
            } catch (e) {
                // ignore
            }
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 pb-28 max-w-4xl mx-auto">
            <ProfileHeroCard
                fullName={fullName}
                firstName={firstName}
                lastName={lastName}
                profilePhoto={profilePhoto}
                nationality={nationality}
                age={age}
                currentLevelInfo={currentLevelInfo}
                selectedStyle={selectedStyle}
                team={team}
                mandateTotal={mandate?.totalMandates || 1}
                mandateYear={mandateYear}
                careerStats={careerStats}
                onOpenStyleModal={() => setShowStyleModal(true)}
            />

            {/* TAB NAVIGATION PILLS */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0A0E17] rounded-2xl border border-white/10 text-xs font-bold overflow-x-auto">
                <button
                    onClick={() => setActiveTab('MANDATE')}
                    className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'MANDATE' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Landmark className="w-4 h-4" />
                    <span>Mandato & Política</span>
                </button>
                <button
                    onClick={() => setActiveTab('PALMARES')}
                    className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'PALMARES' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Trophy className="w-4 h-4" />
                    <span>Palmarés</span>
                </button>
                <button
                    onClick={() => setActiveTab('STINTS')}
                    className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'STINTS' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Clubes</span>
                </button>
                <button
                    onClick={() => setActiveTab('ELECTIONS')}
                    className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
                        activeTab === 'ELECTIONS' ? 'bg-amber-400 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Vote className="w-4 h-4" />
                    <span>Elecciones</span>
                    {isElectionYear && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
                    )}
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'MANDATE' && (
                <MandatePoliticalTab
                    team={team}
                    mandateYear={mandateYear}
                    mandateTotal={mandate?.totalMandates || 1}
                    isElectionYear={isElectionYear}
                    fanApproval={fanApproval}
                    careerStats={careerStats}
                    clubBalance={gameState.finances?.balance || 0}
                    boardConfidence={boardConfidence}
                    electoralPromises={electoralPromises || []}
                />
            )}

            {activeTab === 'PALMARES' && (
                <PalmaresTab team={team} />
            )}

            {activeTab === 'STINTS' && (
                <CareerStintsTab
                    team={team}
                    season={season}
                    mandateTotal={mandate?.totalMandates || 1}
                    careerStats={careerStats}
                    fanApprovalRating={fanApproval.rating}
                    pastStints={playerProfile?.careerStints}
                />
            )}

            {activeTab === 'ELECTIONS' && (
                <ElectionsFutureTab
                    team={team}
                    mandateYear={mandateYear}
                    isElectionYear={isElectionYear}
                    fanApprovalRating={fanApproval.rating}
                    currentLevel={currentLevelInfo.level}
                    prospectiveClubs={prospectiveClubs}
                />
            )}

            {/* STYLE SELECTION MODAL */}
            <StyleSelectionModal
                isOpen={showStyleModal}
                selectedStyle={selectedStyle}
                styles={PRESIDENTIAL_STYLES}
                onSelectStyle={handleSelectStyle}
                onClose={() => setShowStyleModal(false)}
            />
        </div>
    );
});
