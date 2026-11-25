import React, { useEffect, useId, useRef } from 'react';
import { closeTopLayer } from '../ui/topLayerDialog';

interface AuthGateProps {
    onClose: () => void;
    onGoogle: () => void;
    isLoading: boolean;
    errorMsg: string | null;
}

const PILLARS = [
    { num: '01', label: 'Nube Multidispositivo', detail: 'Continúa tu carrera en PC o móvil' },
    { num: '02', label: 'Salón de la Fama', detail: 'Compite en el ranking mundial' },
    { num: '03', label: 'Sincronización Oficial', detail: 'Respaldo automático protegido' },
];

/**
 * Fullscreen (100vw × 100dvh) cinematic sign-in scene ("Salida por el Túnel").
 * 4 GPU parallax planes driven by pointer / gyroscope + gentle idle camera drift,
 * zero generic icons or emojis.
 */
export const AuthGate: React.FC<AuthGateProps> = ({ onClose, onGoogle, isLoading, errorMsg }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    // Open in browser Top Layer (StrictMode-safe)
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (!dialog.open) dialog.showModal();

        let disposed = false;
        const handleClose = () => {
            if (disposed || dialog.open) return;
            dialog.returnValue = '';
            onCloseRef.current();
        };
        const handleCancel = (e: Event) => {
            e.preventDefault();
            void closeTopLayer(dialog);
        };

        dialog.addEventListener('close', handleClose);
        dialog.addEventListener('cancel', handleCancel);
        return () => {
            disposed = true;
            dialog.removeEventListener('close', handleClose);
            dialog.removeEventListener('cancel', handleCancel);
            if (dialog.open) dialog.close();
        };
    }, []);

    // Smooth GPU parallax (pointer + touch + gyroscope + subtle idle camera sway)
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let raf = 0;
        let userX = 0;
        let userY = 0;
        let curX = 0;
        let curY = 0;
        let lastInputAt = 0;
        const t0 = performance.now();

        const loop = (now: number) => {
            const elapsed = (now - t0) * 0.001;
            const idleWeight = Math.min(1, Math.max(0, (now - lastInputAt - 1200) / 1800));
            const idleX = Math.sin(elapsed * 0.55) * 0.32;
            const idleY = Math.cos(elapsed * 0.4) * 0.2;

            const targetX = userX * (1 - idleWeight) + idleX * idleWeight;
            const targetY = userY * (1 - idleWeight) + idleY * idleWeight;

            curX += (targetX - curX) * 0.075;
            curY += (targetY - curY) * 0.075;

            stage.style.setProperty('--px', curX.toFixed(4));
            stage.style.setProperty('--py', curY.toFixed(4));
            raf = requestAnimationFrame(loop);
        };

        const onPointerMove = (e: PointerEvent) => {
            userX = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
            userY = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
            lastInputAt = performance.now();
        };

        const onOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma == null || e.beta == null) return;
            userX = Math.max(-1, Math.min(1, e.gamma / 24));
            userY = Math.max(-1, Math.min(1, (e.beta - 45) / 24));
            lastInputAt = performance.now();
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('deviceorientation', onOrientation, { passive: true });
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('deviceorientation', onOrientation);
        };
    }, []);

    const dismiss = () => {
        void closeTopLayer(dialogRef.current);
    };

    return (
        <dialog ref={dialogRef} aria-labelledby={titleId} className="apex-gate">
            <div ref={stageRef} className="apex-gate-stage">
                {/* Layer 1 — Nocturnal stadium tunnel (deepest plane) */}
                <div
                    aria-hidden
                    className="apex-gate-layer apex-gate-bg"
                    style={{ backgroundImage: 'url("/assets/bg/home.webp")' }}
                />

                {/* Layer 2 — Volumetric floodlight cones */}
                <div aria-hidden className="apex-gate-layer apex-gate-beams">
                    <span />
                    <span />
                    <span />
                </div>

                {/* Layer 3 — Rising stadium light dust / embers */}
                <div aria-hidden className="apex-gate-layer apex-gate-dust" />

                {/* Vignette, bottom pitch horizon glow & grain */}
                <div aria-hidden className="apex-gate-shade" />
                <div aria-hidden className="apex-grain" />

                {/* Foreground UI */}
                <div className="apex-gate-content">
                    {/* Minimal top bar */}
                    <div className="apex-gate-topbar">
                        <span className="apex-gate-status">
                            <i aria-hidden />
                            Online · Global Server
                        </span>
                        <button type="button" onClick={dismiss} className="apex-gate-skip">
                            Omitir
                        </button>
                    </div>

                    {/* Layer 4 — Counter-moving foreground brand & broadcast headline */}
                    <div className="apex-gate-hero">
                        <div className="apex-gate-logo-wrap">
                            <img
                                src="/assets/logo.webp"
                                alt="Apex AI Football Club President"
                                className="apex-gate-logo"
                            />
                        </div>

                        <p className="apex-gate-kicker">Acceso Oficial · Palco Presidencial</p>
                        <h1 id={titleId} className="apex-gate-title">
                            Toma el Mando<br />
                            <span>De Tu Club</span>
                        </h1>
                        <div aria-hidden className="apex-gate-rule" />
                    </div>

                    {/* Broadcast HUD strip + Actions (zero generic icons) */}
                    <div className="apex-gate-bottom">
                        <ol className="apex-gate-hud">
                            {PILLARS.map((item, idx) => (
                                <li key={item.num} style={{ animationDelay: `${0.28 + idx * 0.08}s` }}>
                                    <span className="apex-gate-num">{item.num}</span>
                                    <div className="min-w-0">
                                        <strong>{item.label}</strong>
                                        <small>{item.detail}</small>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        {errorMsg && (
                            <p role="alert" className="apex-gate-error">
                                {errorMsg}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={onGoogle}
                            disabled={isLoading}
                            autoFocus
                            className="apex-gate-google"
                        >
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>{isLoading ? 'Conectando con Google…' : 'Continuar con Google'}</span>
                        </button>

                        <button type="button" onClick={dismiss} className="apex-gate-guest">
                            Jugar como invitado
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};
