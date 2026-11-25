// Converts raw art in public/apexassets into optimized WebP files in public/assets.
// Usage: node scripts/optimize-assets.mjs
import sharp from 'sharp';
import { mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'design/apexassets';
const OUT = 'public/assets';

const JOBS = [
    // Vertical backgrounds 1170x2532
    ['Fondos verticales/Entrada nocturna al estadio de fútbol.png', 'bg/home.webp', 1170, 2532],
    ['Fondos verticales/Vestuario futbolístico moderno en azul.png', 'bg/squad.webp', 1170, 2532],
    ['Fondos verticales/Oficina ejecutiva futbolera con skyline nocturno.png', 'bg/transfers.webp', 1170, 2532],
    ['Fondos verticales/Galería de trofeos bajo luces azules.png', 'bg/tournaments.webp', 1170, 2532],
    ['Fondos verticales/Sala de análisis deportivo futurista.png', 'bg/finances.webp', 1170, 2532],
    ['Fondos verticales/Estadio futurista al atardecer.png', 'bg/club.webp', 1170, 2532],
    ['Fondos verticales/Conferencia de prensa futbolística azul.png', 'bg/election.webp', 1170, 2532],
    ['Fondos verticales/Celebración nocturna del trofeo en el estadio.png', 'bg/season-end.webp', 1170, 2532],
    ['Fondos verticales/Partido nocturno bajo luces azules.png', 'bg/match.webp', 1170, 2532],
    // Hero banners 1290x600
    ['Banners principales/Estadio azul bajo la tormenta.png', 'hero/next-match.webp', 1290, 600],
    ['Banners principales/Contrato y fútbol bajo las luces.png', 'hero/transfers.webp', 1290, 600],
    ['Banners principales/Sala corporativa con vista al estadio.png', 'hero/board.webp', 1290, 600],
    ['Banners principales/Sala ejecutiva con trofeo de fútbol.png', 'hero/club.webp', 1290, 600],
    ['Banners principales/Trofeo de campeonato bajo las luces del estadio.png', 'hero/tournaments.webp', 1290, 600],
    ['Banners principales/Trofeo dorado bajo las luces del estadio.png', 'hero/trophies.webp', 1290, 600],
];

const LOGO_SRC = 'public/logo-sinfondo-512.png';
if (existsSync(LOGO_SRC)) {
    const dest = join(OUT, 'logo.webp');
    mkdirSync(OUT, { recursive: true });
    await sharp(LOGO_SRC).trim().resize(512, null, { withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 95 }).toFile(dest);
    console.log('logo.webp'.padEnd(26), Math.round(statSync(dest).size / 1024) + ' KB');
}

for (const [src, out, w, h] of JOBS) {
    const input = join(SRC, src);
    if (!existsSync(input)) { console.warn('missing', input); continue; }
    const dest = join(OUT, out);
    mkdirSync(join(dest, '..'), { recursive: true });
    await sharp(input).resize(w, h, { fit: 'cover', position: 'centre' }).webp({ quality: 74, effort: 6 }).toFile(dest);
    console.log(out.padEnd(26), Math.round(statSync(dest).size / 1024) + ' KB');
}
