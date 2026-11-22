import React, { useMemo, useState, useCallback } from 'react';
import { GameState, Player, Team } from '../../types';
import { ALL_COMPETITIONS, CompetitionItem } from './league/constants';
import { customPacksService } from '../../services/customPacks/packService';
import { usePacksVersion } from '../../data/teams/helpers';
import { useGameStore } from '../../state/gameStore';
import { getUserTeam } from '../../state/selectors';
import { PlayerStats, TeamHighlights, CupInfo } from './statistics/types';
import { CompSelectorBar } from './statistics/CompSelectorBar';
import { TournamentOverviewCards } from './statistics/TournamentOverviewCards';
import { StatsLeaderboards } from './statistics/StatsLeaderboards';

interface StatisticsScreenProps {
    gameState: GameState;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = React.memo(({ gameState }) => {
    const packsVersion = usePacksVersion();
    const dispatch = useGameStore(s => s.dispatch);
    const userTeam = getUserTeam(gameState);

    const [selectedCompId, setSelectedCompId] = useState<string>(userTeam?.leagueId || gameState?.team?.leagueId || 'PREMIER_LEAGUE');
    const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

    const selectedCompDef = useMemo(() => {
        return ALL_COMPETITIONS.find(c => c.id === selectedCompId) ||
               ALL_COMPETITIONS.find(c => c.id === 'PREMIER_LEAGUE') ||
               ALL_COMPETITIONS[0];
    }, [selectedCompId]);

    const compLogo = useMemo(() => {
        return customPacksService.resolveCompetitionLogo(selectedCompDef.id, selectedCompDef.name, selectedCompDef.logo);
    }, [selectedCompDef, packsVersion]);

    const isLeague = selectedCompDef.type === 'LEAGUE';

    const userLeagueComp = ALL_COMPETITIONS.find(c => c.id === userTeam?.leagueId);
    const userCountry = userLeagueComp?.country || (userTeam as any)?.country || 'Argentina';
    const userCupComp = ALL_COMPETITIONS.find(c => c.country === userCountry && c.type === 'CUP');
    const isEuropean = ['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia'].includes(userCountry);
    const userContinentalComp = ALL_COMPETITIONS.find(c => c.id === (isEuropean ? 'CHAMPIONS_LEAGUE' : 'COPA_LIBERTADORES'));
    const intercontinentalComp = ALL_COMPETITIONS.find(c => c.id === 'COPA_INTERCONTINENTAL');

    const teamsById = useMemo(() => {
        const map = new Map<number, Team>();
        for (const t of gameState.allTeams) {
            map.set(t.id, t);
        }
        return map;
    }, [gameState.allTeams]);

    const teamNamesByLeague = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const t of gameState.allTeams) {
            if (!t.leagueId) continue;
            let list = map.get(t.leagueId);
            if (!list) {
                list = [];
                map.set(t.leagueId, list);
            }
            list.push(t.name.toLowerCase());
        }
        return map;
    }, [gameState.allTeams]);

    const quickShortcuts = useMemo(() => {
        return [userLeagueComp, userCupComp, userContinentalComp, intercontinentalComp].filter(Boolean) as CompetitionItem[];
    }, [userLeagueComp, userCupComp, userContinentalComp, intercontinentalComp]);

    const filteredCompetitions = useMemo(() => {
        let list = ALL_COMPETITIONS.filter(c => c.id !== 'CLUB_RANKINGS');

        if (selectedRegion === 'INT') {
            list = list.filter(c => c.category === 'INTERNATIONAL');
        } else if (selectedRegion === 'SUDAMERICA') {
            const southAmericanCountries = ['Argentina', 'Brasil', 'Chile', 'Colombia', 'Paraguay', 'México'];
            list = list.filter(c => c.country && southAmericanCountries.includes(c.country));
        } else if (selectedRegion === 'EUROPA') {
            const europeanCountries = ['Inglaterra', 'España', 'Alemania', 'Italia', 'Francia'];
            list = list.filter(c => c.country && europeanCountries.includes(c.country));
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.country && c.country.toLowerCase().includes(q)) ||
                teamNamesByLeague.get(c.id)?.some(n => n.includes(q))
            );
        }

        return list;
    }, [selectedRegion, searchQuery, teamNamesByLeague]);

    const leagueTeams = useMemo(() => {
        if (!isLeague) return [];
        return gameState.allTeams.filter(t => t.leagueId === selectedCompDef.id);
    }, [isLeague, gameState.allTeams, selectedCompDef.id]);

    const playerStats = useMemo(() => {
        if (!isLeague) return [];
        const stats: PlayerStats[] = [];
        leagueTeams.forEach(team => {
            (team.squad || []).forEach(player => {
                const appearances = player.stats?.appearances || 0;
                const goals = player.stats?.goals || 0;
                const assists = player.stats?.assists || 0;
                const cleanSheets = player.stats?.cleanSheets || 0;

                if (goals > 0 || assists > 0 || appearances > 0 || cleanSheets > 0) {
                    const baseRating = (player.rating || 75) / 10;
                    const performanceScore = appearances > 0
                        ? (goals * 0.45 + assists * 0.35 + cleanSheets * 0.30) / appearances
                        : 0;
                    const averageRating = Number(Math.min(9.9, Math.max(5.5, baseRating * 0.7 + performanceScore * 1.5 + 2.0)).toFixed(2));

                    stats.push({
                        player,
                        team,
                        teamId: team.id,
                        teamName: team.name,
                        teamLogo: team.logo,
                        goals,
                        assists,
                        matches: appearances,
                        cleanSheets,
                        averageRating
                    });
                }
            });
        });
        return stats;
    }, [isLeague, leagueTeams]);

    const topScorers = useMemo(() => {
        if (isLeague) {
            return [...playerStats]
                .filter(s => s.goals > 0)
                .sort((a, b) => b.goals - a.goals || b.player.rating - a.player.rating)
                .slice(0, 15);
        }

        if (selectedCompDef.cupKey) {
            const cup = (gameState.cups as any)[selectedCompDef.cupKey];
            const cupScorers = cup?.statistics?.topScorers || [];
            if (!Array.isArray(cupScorers) || cupScorers.length === 0) return [];

            return [...cupScorers]
                .filter(cs => cs && cs.goals > 0)
                .sort((a, b) => b.goals - a.goals)
                .slice(0, 15)
                .map(cs => {
                    const team = teamsById.get(cs.teamId);
                    const player = team?.squad.find(p => p.id === cs.playerId) || {
                        id: cs.playerId,
                        name: cs.playerName,
                        position: 'DEL',
                        rating: 75,
                    } as Player;

                    return {
                        player,
                        team: team || { id: cs.teamId, name: cs.teamName, logo: '' } as Team,
                        teamId: cs.teamId,
                        teamName: cs.teamName,
                        teamLogo: team?.logo || '',
                        goals: cs.goals,
                        assists: 0,
                        matches: 0
                    };
                });
        }

        return [];
    }, [isLeague, playerStats, selectedCompDef, gameState.cups, teamsById]);

    const topAssists = useMemo(() => {
        if (isLeague) {
            return [...playerStats]
                .filter(s => s.assists > 0)
                .sort((a, b) => b.assists - a.assists || b.player.rating - a.player.rating)
                .slice(0, 15);
        }

        if (selectedCompDef.cupKey) {
            const cup = (gameState.cups as any)[selectedCompDef.cupKey];
            const cupAssisters = cup?.statistics?.topAssisters || [];
            if (!Array.isArray(cupAssisters) || cupAssisters.length === 0) return [];

            return [...cupAssisters]
                .filter(ca => ca && ca.assists > 0)
                .sort((a, b) => b.assists - a.assists)
                .slice(0, 15)
                .map(ca => {
                    const team = teamsById.get(ca.teamId);
                    const player = team?.squad.find(p => p.id === ca.playerId) || {
                        id: ca.playerId,
                        name: ca.playerName,
                        position: 'CEN',
                        rating: 75,
                    } as Player;

                    return {
                        player,
                        team: team || { id: ca.teamId, name: ca.teamName, logo: '' } as Team,
                        teamId: ca.teamId,
                        teamName: ca.teamName,
                        teamLogo: team?.logo || '',
                        goals: 0,
                        assists: ca.assists,
                        matches: 0
                    };
                });
        }

        return [];
    }, [isLeague, playerStats, selectedCompDef, gameState.cups, teamsById]);

    const topCleanSheets = useMemo(() => {
        if (!isLeague) return [];
        return [...playerStats]
            .filter(s => s.player.position === 'POR' && (s.cleanSheets || 0) > 0)
            .sort((a, b) => (b.cleanSheets || 0) - (a.cleanSheets || 0) || b.player.rating - a.player.rating)
            .slice(0, 15);
    }, [isLeague, playerStats]);

    const topMVPs = useMemo(() => {
        if (!isLeague) return [];
        return [...playerStats]
            .filter(s => s.matches >= 2)
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0) || b.goals - a.goals || b.assists - a.assists)
            .slice(0, 15);
    }, [isLeague, playerStats]);

    const teamHighlights = useMemo((): TeamHighlights | null => {
        if (!isLeague) return null;
        const currentTable = gameState.leagueTables[selectedCompDef.id] || [];
        if (currentTable.length === 0) return null;

        const bestAttackEntry = [...currentTable].sort((a, b) => b.goalsFor - a.goalsFor)[0];
        const bestAttackTeam = bestAttackEntry ? teamsById.get(bestAttackEntry.teamId) : undefined;

        const bestDefenseEntry = [...currentTable].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
        const bestDefenseTeam = bestDefenseEntry ? teamsById.get(bestDefenseEntry.teamId) : undefined;

        const totalGoals = currentTable.reduce((acc, row) => acc + (row.goalsFor || 0), 0);
        const totalMatchesPlayed = currentTable.reduce((acc, row) => acc + (row.played || 0), 0) / 2;
        const avgGoals = totalMatchesPlayed > 0 ? (totalGoals / totalMatchesPlayed).toFixed(2) : '0.00';

        return {
            bestAttackTeam,
            bestAttackGoals: bestAttackEntry?.goalsFor || 0,
            bestDefenseTeam,
            bestDefenseGoals: bestDefenseEntry?.goalsAgainst || 0,
            totalGoals,
            totalMatchesPlayed: Math.round(totalMatchesPlayed),
            avgGoals
        };
    }, [isLeague, selectedCompDef.id, gameState.leagueTables, teamsById]);

    const cupInfo = useMemo((): CupInfo | null => {
        if (isLeague || !selectedCompDef.cupKey) return null;
        const cup = (gameState.cups as any)[selectedCompDef.cupKey];
        if (!cup) return null;

        const phaseName = cup.phase === 'finished' ? 'Finalizada'
            : cup.phase === 'knockout' ? 'Fase Eliminatoria'
            : cup.phase === 'swiss' ? 'Fase de Liga Suiza'
            : 'Fase de Grupos';

        const lastChampion = cup.statistics?.championsHistory?.[0];
        const lastChampionTeam = lastChampion ? teamsById.get(lastChampion.winnerId) : null;

        return {
            phaseName,
            lastChampionName: lastChampion?.winnerName || lastChampionTeam?.name,
            lastChampionTeam,
            season: lastChampion?.season
        };
    }, [isLeague, selectedCompDef, gameState.cups, teamsById]);

    const handleSelectPlayer = useCallback((player: Player) => {
        dispatch({ type: 'SET_VIEWING_PLAYER', payload: player });
    }, [dispatch]);

    const handleToggleSelector = useCallback(() => {
        setIsSelectorOpen(prev => !prev);
    }, []);

    const handleSelectComp = useCallback((id: string) => {
        setSelectedCompId(id);
        setIsSelectorOpen(false);
    }, []);

    return (
        <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 pb-24 animate-fade-in max-w-5xl mx-auto">
            {/* 1. COMPACT HEADER */}
            <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Estadísticas</h1>
                    <span className="text-[11px] font-bold text-slate-400 truncate block">
                        Temporada {gameState.season} · {selectedCompDef.name}
                    </span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#0D1220] border border-white/10 text-right shrink-0">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">Goleador</span>
                    <span className="text-sm font-black text-[var(--apex-gold)] leading-none tabular-nums">
                        {topScorers[0] ? `${topScorers[0].goals}G` : '0G'}
                    </span>
                </div>
            </header>

            {/* 2. COMPETITION SELECTOR & SHORTCUTS */}
            <CompSelectorBar
                selectedCompDef={selectedCompDef}
                compLogo={compLogo}
                season={gameState.season}
                isSelectorOpen={isSelectorOpen}
                onToggleSelector={handleToggleSelector}
                quickShortcuts={quickShortcuts}
                selectedCompId={selectedCompId}
                onSelectComp={handleSelectComp}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filteredCompetitions={filteredCompetitions}
            />

            {/* 3. OVERVIEW METRICS */}
            <TournamentOverviewCards
                teamHighlights={teamHighlights}
                cupInfo={cupInfo}
            />

            {/* 4. LEADERBOARDS */}
            <StatsLeaderboards
                topScorers={topScorers}
                topAssists={topAssists}
                topCleanSheets={topCleanSheets}
                topMVPs={topMVPs}
                isLeague={isLeague}
                onSelectPlayer={handleSelectPlayer}
            />
        </div>
    );
});
