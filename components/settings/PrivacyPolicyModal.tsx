import React from 'react';
import { Modal } from '../ui/Modal';
import { Shield, Lock, EyeOff, Database, Trash2, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
    return (
        <Modal title="Política de Privacidad y Protección de Datos" onClose={onClose} maxWidth="max-w-2xl">
            <div className="space-y-4 text-xs md:text-sm text-slate-300 max-h-[72vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Header Badge */}
                <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-sky-200">
                    <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-white block mb-0.5">Cumplimiento Google Play Store & Privacidad por Diseño</strong>
                        Apex AI Football President opera con un modelo offline-first prioritario: tu juego es privado, tus decisiones quedan en tu dispositivo y no comercializamos tus datos personales.
                    </div>
                </div>

                {/* Section 1 */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Database className="w-4 h-4 text-[var(--apex-gold)]" />
                        <h4>1. Almacenamiento y Datos de Juego</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        • <strong className="text-slate-200">Modo Local (Predeterminado):</strong> Si juegas sin iniciar sesión, el 100% de tus carreras, fichajes, tácticas y estadísticas se guardan de forma privada en el almacenamiento interno de tu dispositivo (IndexedDB / LocalStorage). No enviamos telemetría ni datos de partida a ningún servidor externo.<br />
                        • <strong className="text-slate-200">Modo Nube (Google OAuth):</strong> Si inicias sesión de forma voluntaria, Supabase almacena de manera encriptada tu dirección de correo electrónico, nombre público, avatar provisto por Google, tus copias de respaldo de partida y tu puntuación en el Salón de la Fama.
                    </p>
                </div>

                {/* Section 2 */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <h4>2. Modo Base y Recursos de la Comunidad</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        El juego se distribuye oficialmente en <strong className="text-slate-200">Modo Base</strong> con gráficos vectoriales neutrales (SVG) generados algorítmicamente para respetar los derechos de propiedad intelectual. La instalación de paquetes de escudos o fotos es una personalización cosmética opcional iniciada por el usuario. Todos los paquetes descargados o importados se almacenan exclusivamente en el almacenamiento local del dispositivo y pueden purgarse en cualquier momento con un clic.
                    </p>
                </div>

                {/* Section 3 */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <EyeOff className="w-4 h-4 text-amber-400" />
                        <h4>3. Datos y Permisos que NUNCA Solicitamos</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        No solicitamos acceso a tu cámara, micrófono, agenda telefónica de contactos ni ubicación geográfica (GPS). No recopilamos identificadores de publicidad cross-app y no solicitamos datos bancarios ni de tarjetas de crédito.
                    </p>
                </div>

                {/* Section 4 */}
                <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-red-200 font-bold text-sm">
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <h4>4. Eliminación de Cuenta y Datos (Derecho al Olvido)</h4>
                    </div>
                    <p className="text-red-200/80 text-xs leading-relaxed">
                        Puedes purgar y eliminar definitivamente todos tus registros tanto del almacenamiento local como de los servidores en la nube en cualquier momento dirigiéndote a <strong className="text-white">Ajustes &gt; Zona de Peligro</strong> y pulsando <strong className="text-white">"Borrar Todos los Datos y Eliminar Cuenta"</strong>. También puedes solicitar la eliminación enviando un correo a <code>soporte@apexfootball.app</code>.
                    </p>
                </div>

                {/* Footer bar */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                    <span>Versión 2026.2 • Google Play Data Safety Compliant</span>
                    <a
                        href="/privacy.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors"
                    >
                        <span>Abrir política web completa</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </Modal>
    );
};
