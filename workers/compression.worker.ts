/**
 * Dedicated Web Worker for off-main-thread Gzip V3 compression & backward-compatible decompression.
 */
import { decompressAnyString, gzipCompressToBase64V3 } from '../utils/compressionCore';

interface CompressionWorkerRequest {
    id: number;
    action: 'compress' | 'decompress';
    payload: string;
}

interface CompressionWorkerResponse {
    id: number;
    ok: boolean;
    result?: string;
    error?: string;
}

self.onmessage = async (event: MessageEvent<CompressionWorkerRequest>) => {
    const { id, action, payload } = event.data;
    try {
        const result = action === 'compress'
            ? await gzipCompressToBase64V3(payload)
            : await decompressAnyString(payload);

        const response: CompressionWorkerResponse = { id, ok: true, result };
        self.postMessage(response);
    } catch (err) {
        const response: CompressionWorkerResponse = {
            id,
            ok: false,
            error: err instanceof Error ? err.message : String(err)
        };
        self.postMessage(response);
    }
};
