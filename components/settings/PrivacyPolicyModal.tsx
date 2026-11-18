import React from 'react';
import { Modal } from '../ui/Modal';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
    return (
        <Modal title="Política de Privacidad y Protección de Datos" onClose={onClose} maxWidth="max-w-2xl">
            <div className="space-y-4 text-sm text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
                <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-lg text-xs text-sky-300">
                    <strong>Cumplimiento Google Play Store:</strong> Apex AI Football President está diseñado con un modelo de privacidad por defecto (Privacy-by-Design), permitiendo juego 100% offline y sin rastreo de actividad invasiva.
                </div>

                <div>
                    <h4 className="text-white font-bold text-base mb-1">1. ¿Qué datos recopilamos?</h4>
                    <p className="text-slate-400">
                        • <strong>Modo Local:</strong> Si no inicias sesión con Google, tus partidas y tácticas se guardan únicamente en el almacenamiento interno de tu dispositivo (IndexedDB / LocalStorage). No se envía ningún dato a servidores externos.<br/>
                        • <strong>Modo Nube (Google OAuth):</strong> Si conectas tu cuenta de Google, Supabase almacena únicamente tu correo, nombre público, avatar provisto por Google, tus partidas de respaldo y tu puntuación en el Salón de la Fama.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold text-base mb-1">2. Datos que NUNCA recopilamos</h4>
                    <p className="text-slate-400">
                        No accedemos a tu lista de contactos, ni a la cámara o micrófono del teléfono, ni a tu ubicación geográfica (GPS). El juego no incluye pasarelas de pago ocultas ni solicita información financiera real.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold text-base mb-1">3. Eliminación de Cuenta y Datos (Derecho al Olvido)</h4>
                    <p className="text-slate-400">
                        Puedes purgar y eliminar irrevocablemente todos tus registros de la nube y del almacenamiento local en cualquier momento desde <strong>Ajustes &gt; Zona de Peligro</strong>.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold text-base mb-1">4. Servicios Externos de Confianza</h4>
                    <p className="text-slate-400">
                        Utilizamos Google Identity Services para el inicio de sesión y Supabase para el almacenamiento encriptado con seguridad por filas (RLS).
                    </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                    <span>Versión 2026.1 • Actualizado Noviembre 2026</span>
                    <a 
                        href="/privacy.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline font-medium"
                    >
                        Abrir versión web completa
                    </a>
                </div>
            </div>
        </Modal>
    );
};
