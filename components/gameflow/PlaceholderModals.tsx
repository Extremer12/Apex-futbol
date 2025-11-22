
import React from 'react';
import { Modal } from '../ui/Modal';
import { DashboardIcon, SquadIcon, TransfersIcon, LeagueIcon, FinancesIcon, SettingsIcon } from '../icons';

export const PlaceholderModal: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
    <Modal title={title} onClose={onClose}>
        <div className="text-center p-4">
            <h3 className="text-lg font-bold text-sky-400 mb-2">Próximamente</h3>
            <p className="text-slate-300">Esta característica estará disponible en futuras actualizaciones. ¡Gracias por jugar a Apex AI!</p>
        </div>
    </Modal>
);

export const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
     <Modal title="Acerca de Apex AI" onClose={onClose}>
        <div className="space-y-4 text-slate-300 text-sm">
            <p><strong>Apex AI</strong> es un simulador de gestión de fútbol para un solo jugador en el que te pones en la piel del presidente de un club.</p>
            <p>Tu misión es llevar a tu equipo a la gloria gestionando las finanzas, navegando por el mercado de fichajes y manteniendo alta la moral de la directiva y del equipo. Cada decisión cuenta.</p>
            <p>El juego utiliza la IA generativa de Google para crear noticias dinámicas, informes de partidos y escenarios de negociación, haciendo que cada partida sea única.</p>
             <p className="text-xs text-slate-500 pt-4 border-t border-slate-800">Este juego es una demostración de frontend y no almacena datos en un servidor. Todo el progreso se guarda localmente en tu navegador.</p>
        </div>
    </Modal>
);

export const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
        <div className="flex items-start gap-4">
            <div className="text-sky-400 mt-1">{icon}</div>
            <div>
                <h4 className="font-bold text-white">{title}</h4>
                <p className="text-slate-300">{children}</p>
            </div>
        </div>
    );
    
    return (
        <Modal title="Ayuda y Tutorial" onClose={onClose}>
            <div className="space-y-5 text-sm">
                 <div>
                    <h3 className="text-lg font-bold text-sky-400 mb-3 border-b border-slate-800 pb-2">Tu Objetivo</h3>
                    <p className="text-slate-300">Como presidente, tu principal objetivo es mantener la <strong>confianza de la junta directiva</strong> por encima de 0. Logra esto ganando partidos, manteniendo las finanzas saneadas y gestionando la plantilla de manera eficaz. Si la confianza llega a 0, ¡serás despedido!</p>
                </div>
                <div>
                     <h3 className="text-lg font-bold text-sky-400 mb-3 border-b border-slate-800 pb-2">Navegación</h3>
                    <div className="space-y-4">
                        <Section icon={<DashboardIcon className="w-6 h-6" />} title="Panel">
                            Es tu centro de operaciones. Aquí puedes ver el estado del club, leer las últimas noticias, revisar los partidos de la semana y avanzar en el tiempo.
                        </Section>
                         <Section icon={<SquadIcon className="w-6 h-6" />} title="Plantilla">
                            Gestiona tu equipo. Revisa las estadísticas de tus jugadores, su moral y su valor. Puedes poner a jugadores en la lista de fichajes desde aquí.
                        </Section>
                         <Section icon={<TransfersIcon className="w-6 h-6" />} title="Fichajes">
                            Busca y negocia la compra de nuevos jugadores para fortalecer tu equipo. ¡Usa tu presupuesto sabiamente!
                        </Section>
                         <Section icon={<LeagueIcon className="w-6 h-6" />} title="Liga">
                            Consulta la clasificación, los resultados y la forma de todos los equipos del campeonato.
                        </Section>
                         <Section icon={<FinancesIcon className="w-6 h-6" />} title="Finanzas">
                            Revisa el balance del club, el presupuesto para fichajes y el flujo de caja semanal. Una buena salud financiera es clave para el éxito a largo plazo.
                        </Section>
                         <Section icon={<SettingsIcon className="w-6 h-6" />} title="Ajustes">
                            Guarda tu partida o sal al menú principal. ¡Recuerda guardar tu progreso!
                        </Section>
                    </div>
                </div>
            </div>
        </Modal>
    )
};
