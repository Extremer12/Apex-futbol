/**
 * Pure compression/decompression core shared between main-thread fallback
 * and the off-thread Web Worker.
 *
 * Formats supported:
 *  - V3: Native Gzip stream ("V3:" prefix + gzip payload bytes) encoded as Base64.
 *        Removes the 16-bit LZW dictionary ceiling for arbitrarily large saves.
 *  - V2: Byte-level 16-bit LZW ("V2:" prefix), backward compatible read/write.
 *  - V1: Legacy unescape/escape LZW saves, backward compatible read.
 */

const V3_HEADER = [0x56, 0x33, 0x3a] as const; // "V3:"
const BASE64_CHUNK_SIZE = 0x8000;
const LZW_MAX_16BIT_CODE = 65536;

export function uint8ToBase64(bytes: Uint8Array): string {
    const chunks: string[] = [];
    for (let i = 0; i < bytes.length; i += BASE64_CHUNK_SIZE) {
        const slice = bytes.subarray(i, Math.min(i + BASE64_CHUNK_SIZE, bytes.length));
        chunks.push(String.fromCharCode(...slice));
    }
    return btoa(chunks.join(''));
}

export function base64ToUint8(base64: string): Uint8Array {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
}

function hasV3Prefix(bytes: Uint8Array): boolean {
    return bytes.length >= 3 &&
        bytes[0] === V3_HEADER[0] &&
        bytes[1] === V3_HEADER[1] &&
        bytes[2] === V3_HEADER[2];
}

async function runStreamTransform(
    input: Uint8Array,
    stream: CompressionStream | DecompressionStream
): Promise<Uint8Array> {
    const writer = stream.writable.getWriter();
    const copy = new Uint8Array(input.byteLength);
    copy.set(input);
    const writePromise = writer.write(copy).then(() => writer.close());

    const chunks: Uint8Array[] = [];
    const reader = stream.readable.getReader();
    let totalLength = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLength += value.byteLength;
    }

    await writePromise;

    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return merged;
}

/**
 * Synchronous V2 16-bit LZW compressor with strict dictionary cap (< 65536)
 * so legacy synchronous callers never corrupt Uint16 codes.
 */
export function compressStringSyncV2(uncompressed: string): string {
    if (!uncompressed) return '';

    const bytes = new TextEncoder().encode(uncompressed);
    const dict = new Map<string, number>();
    const out: number[] = [];
    let code = 256;

    let phrase = String.fromCharCode(bytes[0]);
    for (let i = 1; i < bytes.length; i++) {
        const curr = String.fromCharCode(bytes[i]);
        const combined = phrase + curr;
        if (dict.has(combined)) {
            phrase = combined;
        } else {
            out.push(phrase.length > 1 ? dict.get(phrase)! : phrase.charCodeAt(0));
            if (code < LZW_MAX_16BIT_CODE) {
                dict.set(combined, code++);
            }
            phrase = curr;
        }
    }
    out.push(phrase.length > 1 ? dict.get(phrase)! : phrase.charCodeAt(0));

    const uint16 = new Uint16Array(out);
    const uint8 = new Uint8Array(uint16.buffer);
    const payload = new Uint8Array(3 + uint8.length);
    payload[0] = 0x56; // 'V'
    payload[1] = 0x32; // '2'
    payload[2] = 0x3a; // ':'
    payload.set(uint8, 3);
    return uint8ToBase64(payload);
}

/**
 * Synchronous V2/V1 legacy decompressor.
 */
export function decompressLegacyBinary(bin: string): string {
    if (bin.startsWith('V2:')) {
        const rawBin = bin.slice(3);
        const uint8 = new Uint8Array(rawBin.length);
        for (let i = 0; i < rawBin.length; i++) {
            uint8[i] = rawBin.charCodeAt(i);
        }
        const uint16 = new Uint16Array(uint8.buffer);
        const dict = new Map<number, number[]>();

        let currCode = uint16[0];
        let oldPhrase = [currCode];
        const outBytes: number[] = [...oldPhrase];
        let code = 256;

        for (let i = 1; i < uint16.length; i++) {
            currCode = uint16[i];
            let phrase: number[];
            if (currCode < 256) {
                phrase = [currCode];
            } else if (dict.has(currCode)) {
                phrase = dict.get(currCode)!;
            } else {
                phrase = [...oldPhrase, oldPhrase[0]];
            }
            for (let j = 0; j < phrase.length; j++) {
                outBytes.push(phrase[j]);
            }
            if (code < LZW_MAX_16BIT_CODE) {
                dict.set(code++, [...oldPhrase, phrase[0]]);
            }
            oldPhrase = phrase;
        }

        return new TextDecoder().decode(new Uint8Array(outBytes));
    }

    // Legacy V1 fallback (for saves created before V2)
    let compressed: string;
    try {
        compressed = decodeURIComponent(escape(bin));
    } catch {
        compressed = bin;
    }

    const dict: Record<number, string> = {};
    const data = (compressed + '').split('');
    let currChar = data[0];
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase: string;

    for (let i = 1; i < data.length; i++) {
        const currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        } else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }

    return out.join('');
}

/**
 * Compresses UTF-8 string using native CompressionStream('gzip') with "V3:" prefix.
 * Falls back to capped V2 LZW only if CompressionStream is unavailable.
 */
export async function gzipCompressToBase64V3(uncompressed: string): Promise<string> {
    if (!uncompressed) return '';

    if (typeof CompressionStream === 'undefined') {
        return compressStringSyncV2(uncompressed);
    }

    const inputBytes = new TextEncoder().encode(uncompressed);
    const gzipped = await runStreamTransform(inputBytes, new CompressionStream('gzip'));

    const prefixed = new Uint8Array(3 + gzipped.byteLength);
    prefixed[0] = V3_HEADER[0];
    prefixed[1] = V3_HEADER[1];
    prefixed[2] = V3_HEADER[2];
    prefixed.set(gzipped, 3);

    return uint8ToBase64(prefixed);
}

/**
 * Decompresses V3 (Gzip), V2 (byte LZW), or V1 (legacy LZW) Base64 payloads.
 */
export async function decompressAnyString(compressedBase64: string): Promise<string> {
    if (!compressedBase64) return '';

    try {
        const bytes = base64ToUint8(compressedBase64);

        if (hasV3Prefix(bytes)) {
            if (typeof DecompressionStream === 'undefined') {
                throw new Error('DecompressionStream is not supported in this runtime');
            }
            const rawGzip = bytes.subarray(3);
            const decompressed = await runStreamTransform(rawGzip, new DecompressionStream('gzip'));
            return new TextDecoder().decode(decompressed);
        }

        // Decode binary string for legacy V2: / V1 LZW decoders
        const chunks: string[] = [];
        for (let i = 0; i < bytes.length; i += BASE64_CHUNK_SIZE) {
            const slice = bytes.subarray(i, Math.min(i + BASE64_CHUNK_SIZE, bytes.length));
            chunks.push(String.fromCharCode(...slice));
        }
        return decompressLegacyBinary(chunks.join(''));
    } catch (err) {
        console.error('Failed to decompress save state:', err);
        return compressedBase64;
    }
}
