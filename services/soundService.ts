/**
 * Lightweight Web Audio synthesizer for match events and UI feedback.
 * Works 100% offline with zero external audio assets.
 */

const SOUND_STORAGE_KEY = 'apex_sound_enabled';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
        audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

export function isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        return localStorage.getItem(SOUND_STORAGE_KEY) !== 'false';
    } catch {
        return true;
    }
}

export function setSoundEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
    } catch {
        // ignore storage quota errors
    }
}

function playTone(freq: number, durationSec: number, type: OscillatorType = 'sine', peakGain = 0.08, delaySec = 0): void {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const start = ctx.currentTime + delaySec;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + durationSec);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + durationSec + 0.02);
    } catch {
        // Ignore audio playback errors in locked autoplay contexts
    }
}

export function playUiClick(): void {
    playTone(540, 0.055, 'triangle', 0.05);
}

export function playWhistle(): void {
    playTone(2680, 0.12, 'sine', 0.05, 0);
    playTone(2820, 0.22, 'sine', 0.055, 0.14);
}

export function playGoalChime(): void {
    playTone(523.25, 0.14, 'triangle', 0.08, 0);
    playTone(659.25, 0.14, 'triangle', 0.08, 0.11);
    playTone(783.99, 0.28, 'triangle', 0.09, 0.22);
}

export function playAlertTone(): void {
    playTone(440, 0.1, 'sine', 0.06, 0);
    playTone(587.33, 0.16, 'sine', 0.06, 0.11);
}
