import React, { useState, useRef } from 'react';
import { GameState } from '../../types';
import { TrophyIcon } from '../icons';
import { ALL_COMPETITIONS } from './league/constants';
import { LeagueTable } from './league/LeagueTable';
import { CupView } from './league/CupView';
import { CompetitionSidebar } from './league/CompetitionSidebar';

interface LeagueScreenProps {
    gameState: GameState;
}

export const LeagueScreen: React.FC<LeagueScreenProps> = ({ gameState }) => {
    const playerTeamLeague = gameState.team.leagueId;
    
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(playerTeamLeague);
    const [searchQuery, setSearchQuery] = useState('');
    const [cupTab, setCupTab] = useState<'ROUNDS' | 'STATS'>('ROUNDS');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'INTERNATIONAL': true,
        'Inglaterra': false,
        'España': false,
        'Alemania': false,
        'Italia': false,
        'Francia': false,
        'Argentina': false,
        'Brasil': false
    });
    const contentRef = useRef<HTMLDivElement>(null);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSelectCompetition = (id: string) => {
        setSelectedCompetitionId(id);
        setCupTab('ROUNDS');
        setTimeout(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const selectedCompDef = ALL_COMPETITIONS.find(c => c.id === selectedCompetitionId);

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Panel Lateral (Sidebar) */}
                <CompetitionSidebar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCompetitionId={selectedCompetitionId}
                    onSelectCompetition={handleSelectCompetition}
                    expandedSections={expandedSections}
                    onToggleSection={toggleSection}
                    allCompetitions={ALL_COMPETITIONS}
                />

                {/* Panel Derecho (Contenido) */}
                <div className="flex-1 min-w-0" ref={contentRef}>
                    {!selectedCompDef ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-900/30 border border-white/5 rounded-3xl p-6 text-center">
                            <TrophyIcon className="w-16 h-16 text-slate-700 mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Explorador de Competiciones</h3>
                            <p className="text-slate-500 text-sm mt-2 max-w-sm">Selecciona una liga o copa desde el panel lateral para ver sus estadísticas, resultados y formato.</p>
                        </div>
                    ) : selectedCompDef.type === 'LEAGUE' ? (
                        <LeagueTable
                            table={gameState.leagueTables[selectedCompDef.id]}
                            title={selectedCompDef.name}
                            logoPath={selectedCompDef.logo}
                            isFirstDiv={selectedCompDef.isFirstDiv || false}
                            leagueId={selectedCompDef.id}
                            gameState={gameState}
                        />
                    ) : selectedCompDef.type === 'CUP' && selectedCompDef.cupKey ? (
                        <CupView
                            cup={(gameState.cups as any)[selectedCompDef.cupKey]}
                            gameState={gameState}
                            cupTab={cupTab}
                            setCupTab={setCupTab}
                        />
                    ) : null}
                </div>

            </div>
        </div>
    );
};
