/**
 * Robust LZW / Base64 string compressor for JSON game saves.
 * Byte-level encoding via TextEncoder/TextDecoder guarantees full UTF-8 support
 * (emojis, accents, symbols) without corruption.
 * Backward compatible with legacy v1 unescape/escape saves.
 */

export function compressString(uncompressed: string): string {
    if (!uncompressed) return '';
    
    // Encode UTF-8 string to bytes so code points never exceed 255
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
            dict.set(combined, code++);
            phrase = curr;
        }
    }
    out.push(phrase.length > 1 ? dict.get(phrase)! : phrase.charCodeAt(0));

    // Convert 16-bit integer codes to binary byte string
    const uint16 = new Uint16Array(out);
    const uint8 = new Uint8Array(uint16.buffer);
    let bin = 'V2:';
    for (let i = 0; i < uint8.length; i++) {
        bin += String.fromCharCode(uint8[i]);
    }
    return btoa(bin);
}

export function decompressString(compressedBase64: string): string {
    if (!compressedBase64) return '';

    try {
        const bin = atob(compressedBase64);

        // Modern V2 byte-level LZW decompression
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
                outBytes.push(...phrase);
                dict.set(code++, [...oldPhrase, phrase[0]]);
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
    } catch (e) {
        console.error('Failed to decompress save state:', e);
        return compressedBase64;
    }
}
