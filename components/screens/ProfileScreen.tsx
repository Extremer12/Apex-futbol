import React, { useState, useMemo, useCallback } from 'react';
import { GameState, Team } from '../../types';
import { GameAction } from '../../state/reducer';
import {
    Landmark,
    Trophy,
    Building2,
    Vote,
    Shield,
    GraduationCap,
    Star,
    Flame
} from 'lucide-react';
import { calculateFanApproval } from '../../services/political';
import {
    calculateBaselinePresidentXp,
    getPresidentLevelInfo,
    getPresidentialStyleModifiers
} from '../../services/presidentialProgression';
import { useToast } from '../common/ToastProvider';
import { ProfileHeroCard } from './profile/ProfileHeroCard';
import { MandatePoliticalTab } from './profile/MandatePoliticalTab';
import { PalmaresTab } from './profile/PalmaresTab';
import { CareerStintsTab } from './profile/CareerStintsTab';
import { ElectionsFutureTab } from './profile/ElectionsFutureTab';
import { StyleSelectionModal, PresidentialStyleItem } from './profile/StyleSelectionModal';
import { EditProfileModal } from './profile/EditProfileModal';

interface ProfileScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
}

const PRESIDENTIAL_STYLES: PresidentialStyleItem[] = [
    {
        id: 'Equilibrado',
        title: 'Equilibrio Institucional',
        desc: 'Prioriza estabilidad presupuestaria, contención de gastos y solidez directiva.',
        perk: getPresidentialStyleModifiers('Equilibrado').perkSummary,
        icon: Shield,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/30'
    },
    {
        id: 'Canterano',
        title: 'Formador de Cantera',
        desc: 'Fuerte apuesta por divisiones juveniles para potenciar futuros talentos propios.',
        perk: getPresidentialStyleModifiers('Canterano').perkSummary,
        icon: GraduationCap,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30'
    },
    {
        id: 'Galáctico',
        title: 'Comprador Galáctico',
        desc: 'Maximiza el impacto comercial en marketing y entusiasmo social ante fichajes élite.',
        perk: getPresidentialStyleModifiers('Galáctico').perkSummary,
        icon: Star,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30'
    },
    {
        id: 'Pragmático',
        title: 'Pragmático de Resultados',
        desc: 'El rendimiento deportivo en la cancha acelera tu prestigio dirigencial y confianza.',
        perk: getPresidentialStyleModifiers('Pragmático').perkSummary,
        icon: Flame,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30'
    }
];

export const ProfileScreen: React.FC<ProfileScreenProps> = React.memo(({ gameState, dispatch }) => {
    const { playerProfile: rawProfile, mandate, boardConfidence, electoralPromises, team, season, seasonHistory, allTeams } = gameState;
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'MANDATE' | 'PALMARES' | 'STINTS' | 'ELECTIONS'>('MANDATE');

    const playerProfile = useMemo(() => {
        let p = rawProfile;
        if ((!p || !p.name) && typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('apex_last_player_profile');
                if (cached) {
                    p = { ...JSON.parse(cached), ...p };
                }
            } catch (_) {
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

    const [showStyleModal, setShowStyleModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const selectedStyle = playerProfile?.style || 'Equilibrado';
    const styleMods = useMemo(() => getPresidentialStyleModifiers(selectedStyle), [selectedStyle]);

    // Experience & Progression Level (with retroactive baseline if legacy save had 0 XP)
    const totalXp = useMemo(() => {
        const storedXp = playerProfile?.experience ?? 0;
        if (storedXp > 0) return storedXp;
        return calculateBaselinePresidentXp(gameState);
    }, [playerProfile?.experience, gameState]);

    const currentLevelInfo = useMemo(() => getPresidentLevelInfo(totalXp), [totalXp]);

    // Socios Approval Rating
    const fanApproval = useMemo(() => calculateFanApproval(gameState), [gameState]);

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

    const mandateYear = mandate?.currentYear || 1;
    const isElectionYear = mandate?.isElectionYear || mandateYear >= 4;

    // Curate diverse prospective clubs across same league and higher/peer tiers
    const prospectiveClubs = useMemo(() => {
        const sameLeague = allTeams.filter(t => t.id !== team.id && t.leagueId === team.leagueId);
        const ordered = [...sameLeague].sort((a, b) => {
            const tierOrder = { Lower: 1, Mid: 2, Top: 3 };
            return tierOrder[a.tier] - tierOrder[b.tier] || a.budget - b.budget;
        });
        const lowerSample = ordered.find(t => t.tier === 'Lower');
        const midSample = ordered.filter(t => t.tier === 'Mid').slice(0, 2);
        const topSample = ordered.filter(t => t.tier === 'Top').slice(0, 2);
        const picked = [lowerSample, ...midSample, ...topSample].filter((t): t is Team => Boolean(t));
        if (picked.length < 4) {
            for (const c of ordered) {
                if (!picked.some(p => p.id === c.id)) picked.push(c);
                if (picked.length >= 4) break;
            }
        }
        return picked.slice(0, 4);
    }, [allTeams, team.id, team.leagueId]);

    const syncLocalStorageProfile = useCallback((patch: Record<string, unknown>) => {
        if (typeof window === 'undefined') return;
        try {
            const current = playerProfile || { name: 'Presidente' };
            localStorage.setItem('apex_last_player_profile', JSON.stringify({ ...current, ...patch }));
        } catch (_) {
            // ignore quota errors
        }
    }, [playerProfile]);

    const handleSelectStyle = useCallback((styleId: string) => {
        setShowStyleModal(false);
        dispatch({
            type: 'UPDATE_PLAYER_PROFILE',
            payload: { style: styleId }
        });
        syncLocalStorageProfile({ style: styleId });
        showToast(`Estilo actualizado a ${styleId}.`, 'success');
    }, [dispatch, syncLocalStorageProfile, showToast]);

    const handleSaveProfileDetails = useCallback((data: {
        name: string;
        firstName: string;
        lastName: string;
        nationality: string;
        age?: number;
        photo?: string;
    }) => {
        dispatch({
            type: 'UPDATE_PLAYER_PROFILE',
            payload: data
        });
        syncLocalStorageProfile(data);
        showToast('Perfil presidencial actualizado.', 'success');
    }, [dispatch, syncLocalStorageProfile, showToast]);

    const handleSwitchClub = useCallback((club: Team) => {
        dispatch({ type: 'SWITCH_CLUB', payload: { clubId: club.id } });
        setActiveTab('MANDATE');
        showToast(`Asumiste la presidencia de ${club.name}.`, 'success');
    }, [dispatch, showToast]);

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24 max-w-5xl mx-auto animate-fade-in">
            <ProfileHeroCard
                fullName={fullName}
                profilePhoto={profilePhoto}
                nationality={nationality}
                age={age}
                currentLevelInfo={currentLevelInfo}
                selectedStyle={selectedStyle}
                stylePerkSummary={styleMods.perkSummary}
                team={team}
                mandateTotal={mandate?.totalMandates || 1}
                mandateYear={mandateYear}
                careerStats={careerStats}
                onOpenStyleModal={() => setShowStyleModal(true)}
                onOpenEditModal={() => setShowEditModal(true)}
            />

            {/* STICKY TAB NAVIGATION */}
            <nav className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-1.5 bg-[var(--apex-darker,#070A13)]/95 backdrop-blur">
                <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-2xl" role="tablist" aria-label="Secciones de perfil">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'MANDATE'}
                        onClick={() => setActiveTab('MANDATE')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'MANDATE' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Landmark className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Mandato</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'PALMARES'}
                        onClick={() => setActiveTab('PALMARES')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'PALMARES' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Trophy className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Palmarés</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'STINTS'}
                        onClick={() => setActiveTab('STINTS')}
                        className={`h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'STINTS' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Building2 className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Clubes</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'ELECTIONS'}
                        onClick={() => setActiveTab('ELECTIONS')}
                        className={`relative h-10 px-2 rounded-xl text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            activeTab === 'ELECTIONS' ? 'bg-[var(--apex-gold)] text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Vote className="w-3.5 h-3.5 hidden sm:inline" />
                        <span>Elecciones</span>
                        {isElectionYear && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
                        )}
                    </button>
                </div>
            </nav>

            {/* TAB CONTENT */}
            {activeTab === 'MANDATE' && (
                <MandatePoliticalTab
                    team={team}
                    mandateYear={mandateYear}
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
                    onSwitchClub={handleSwitchClub}
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

            {/* EDIT PROFILE MODAL */}
            <EditProfileModal
                isOpen={showEditModal}
                initialFirstName={firstName || fullName.split(' ')[0] || ''}
                initialLastName={lastName || fullName.split(' ').slice(1).join(' ') || ''}
                initialNationality={nationality}
                initialAge={age}
                initialPhoto={profilePhoto}
                onSave={handleSaveProfileDetails}
                onClose={() => setShowEditModal(false)}
            />
        </div>
    );
});
