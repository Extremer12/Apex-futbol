/**
 * High-performance save compression utility.
 *
 * - Primary API (`compressStringAsync` / `decompressStringAsync`):
 *   Runs Gzip (`V3:`) off the main thread in a dedicated Web Worker
 *   with automatic fallback to native `CompressionStream('gzip')`.
 *   Supports reading `V3:` (Gzip), `V2:` (byte LZW), and `V1` (legacy LZW).
 * - Legacy synchronous exports (`compressString` / `decompressString`):
 *   Preserved for backwards compatibility (with capped 16-bit V2 dictionary).
 */

import {
    base64ToUint8,
    compressStringSyncV2,
    decompressAnyString,
    decompressLegacyBinary,
    gzipCompressToBase64V3
} from './compressionCore';

interface PendingJob {
    resolve: (value: string) => void;
    reject: (reason: unknown) => void;
}

let workerInstance: Worker | null = null;
let workerFailed = false;
let jobCounter = 0;
const pendingJobs = new Map<number, PendingJob>();

function getCompressionWorker(): Worker | null {
    if (workerFailed || typeof window === 'undefined' || typeof Worker === 'undefined') {
        return null;
    }
    if (workerInstance) {
        return workerInstance;
    }

    try {
        const worker = new Worker(
            new URL('../workers/compression.worker.ts', import.meta.url),
            { type: 'module' }
        );
        worker.onmessage = (event: MessageEvent<{ id: number; ok: boolean; result?: string; error?: string }>) => {
            const { id, ok, result, error } = event.data;
            const job = pendingJobs.get(id);
            if (!job) return;
            pendingJobs.delete(id);
            if (ok) {
                job.resolve(result ?? '');
            } else {
                job.reject(new Error(error || 'Compression worker error'));
            }
        };
        worker.onerror = (err) => {
            workerFailed = true;
            workerInstance = null;
            pendingJobs.forEach(job => job.reject(err));
            pendingJobs.clear();
        };
        workerInstance = worker;
        return workerInstance;
    } catch {
        workerFailed = true;
        return null;
    }
}

function runInWorker(action: 'compress' | 'decompress', payload: string): Promise<string> | null {
    const worker = getCompressionWorker();
    if (!worker) return null;

    return new Promise((resolve, reject) => {
        const id = ++jobCounter;
        pendingJobs.set(id, { resolve, reject });
        try {
            worker.postMessage({ id, action, payload });
        } catch (err) {
            pendingJobs.delete(id);
            reject(err);
        }
    });
}

/**
 * Compresses a save payload into Base64 Gzip (`V3:`) off the main thread.
 */
export async function compressStringAsync(uncompressed: string): Promise<string> {
    if (!uncompressed) return '';

    const workerPromise = runInWorker('compress', uncompressed);
    if (workerPromise) {
        try {
            return await workerPromise;
        } catch {
            // Fall back to direct async CompressionStream if Worker is blocked
        }
    }

    return gzipCompressToBase64V3(uncompressed);
}

/**
 * Decompresses `V3:` (Gzip), `V2:` (16-bit LZW), or `V1` (legacy LZW) save payloads.
 */
export async function decompressStringAsync(compressedBase64: string): Promise<string> {
    if (!compressedBase64) return '';

    const workerPromise = runInWorker('decompress', compressedBase64);
    if (workerPromise) {
        try {
            return await workerPromise;
        } catch {
            // Fall back to direct async decompression if Worker is blocked
        }
    }

    return decompressAnyString(compressedBase64);
}

/**
 * Synchronous V2 LZW compression (kept for legacy tests/callers).
 */
export function compressString(uncompressed: string): string {
    return compressStringSyncV2(uncompressed);
}

/**
 * Synchronous V2/V1 LZW decompression (kept for legacy tests/callers).
 */
export function decompressString(compressedBase64: string): string {
    if (!compressedBase64) return '';
    try {
        const bytes = base64ToUint8(compressedBase64);
        if (bytes.length >= 3 && bytes[0] === 0x56 && bytes[1] === 0x33 && bytes[2] === 0x3a) {
            throw new Error('V3 gzip payload requires decompressStringAsync');
        }
        const chunks: string[] = [];
        for (let i = 0; i < bytes.length; i += 0x8000) {
            const slice = bytes.subarray(i, Math.min(i + 0x8000, bytes.length));
            chunks.push(String.fromCharCode(...slice));
        }
        return decompressLegacyBinary(chunks.join(''));
    } catch (e) {
        console.error('Failed to decompress save state:', e);
        return compressedBase64;
    }
}
