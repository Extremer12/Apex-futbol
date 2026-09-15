# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### UI/UX & Aesthetics
- **Noticias en Modal & Rostros de Fichajes**: Las noticias del Dashboard ahora son interactivas; al hacer clic abren un modal detallado de lectura completa con formato limpio (sin `\n` crudos), badges oficiales y ficha del jugador involucrado. Además, las noticias de fichajes muestran directamente la foto/rostro del futbolista en miniatura en lugar de la imagen genérica.
- **Radar de Fichajes**: Renovada la columna lateral ("Actualizaciones de Mercado") reemplazando avatares cartoon por el nuevo "Radar de Fichajes" con `PlayerAvatar` auténtico, media OVR, club, valor de mercado y etiquetas contextuales (*Transferible*, *Fin Contrato*, *Estrella Top*), con acceso directo al perfil del jugador.
- **Base de Datos de Rostros Ampliada**: Añadidos IDs y nombres para toda la plantilla del FC Barcelona (Gavi, Pedri, Olmo, Balde, Cubarsí, Christensen, Ferran Torres, Fermín López, Iñigo Martínez, Casadó, etc.), Real Madrid, y figuras de La Liga mediante el CDN oficial de FotMob.
- **Corrección de Logos 404 en La Liga**: Reemplazadas las URLs caídas de jsdelivr por endpoints verificados 200 OK de Transfermarkt para Las Palmas, Leganés, Mallorca, Girona, Valladolid y Alavés en `argentineLogos.ts` y `TEAM_LOGOS`.
- **UEFA Champions League 2026 (Formato Oficial)**: Implementada la estructura oficial de 36 equipos con tabla unificada de Fase de Liga (sistema suizo).
  - Puestos 1 al 8 clasifican directo a Octavos de Final como cabezas de serie (`seededTeamIds`).
  - Puestos 9 al 24 disputan los **Playoffs de 16-avos** (8 cruces ida/vuelta).
  - Puestos 25 al 36 quedan eliminados definitivamente de competencias europeas.
  - Los 8 ganadores de Playoffs avanzan a Octavos para medirse contra el top 8 preclasificado.
- **Solución al Desincronizador de Partidos de Champions**: Corregida la inicialización de `swissFixtures` en `gameFactory.ts` (desfase de semanas midweek coincidentes con el schedule general) evitando que el motor de simulación descarte partidos de Champions pendientes y obligue a jugar la fecha de Liga en su lugar.
- **Historial Completo de Copas y Resultados**: Renovada la vista `CupView.tsx` con navegación por 3 pestañas persistentes (*Cuadro Eliminatorio*, *Tabla de Posiciones* y *Partidos y Resultados*), permitiendo consultar en cualquier momento la tabla suiza de 36 clubes o fase de grupos (Libertadores/Sudamericana) y todos los partidos históricos por jornada y fase con marcadores, goles y penales.
- **Rediseño Pantalla Completa de Fin de Mandato Presidencial (Elecciones)**: Sustituido el modal antiguo y bloqueante por una experiencia en pantalla completa broadcast de alta gama (`ElectionScreen.tsx`) al culminar el ciclo de 4 años:
  - **Balance de Gestión Ordenado**: Tarjetas concisas de títulos obtenidos en el cuatrienio, porcentaje de apoyo popular, balance económico y ratio de cumplimiento de promesas electorales, sin saturación de texto.
  - **Sondeo e Intención de Voto**: Barra de proyección con indicador de mayoría absoluta del 50% y cálculo justo según títulos ganados, solvencia financiera y promesas cumplidas.
  - **Libertad de Navegación**: Botón de cierre `Revisar Club` en la cabecera para posponer la votación y examinar plantilla o finanzas, acompañado de un banner sticky sutil en el menú principal para abrir los comicios cuando el usuario lo decida.
  - **Escrutinio Animado y Transición Limpia**: Micro-animación de recuento de votos en urna, proclamación de reelección para el nuevo mandato de 4 años (reseteo a año 1 de 4, aumento de aprobación popular y avance de temporada sin recargas de página), o cese solemne con envío de puntaje al Leaderboard global y reinicio limpio de carrera.

### Security & Database (Supabase)
- **Cloud Saves Limit**: Aplicada migración de producción `check_cloud_saves_limit()` para restringir a 3 slots de guardado por cuenta en la nube.
- **Seguridad en RPCs**: Revocado permiso `EXECUTE` al rol `anon` para `increment_pack_downloads(UUID)` y `check_cloud_saves_limit()`.
- **Optimización RLS**: Reescribidas 13 políticas de seguridad a nivel de fila usando `(select auth.uid())` en lugar de evaluación por fila, eliminando 13 warnings de rendimiento del advisor de Supabase.
- **Tipado Supabase**: Actualizada definición TypeScript de RPCs en `types/supabase.ts`.

### Performance & Bundle Splitting
- **Code-Splitting con React.lazy**: Separadas pantallas y modales pesados (`CinematicOverlay`, `SeasonEndModal`, `PlayerDetailModal`, `SaveGameModal`, `EventModal`, `TeamSelection`, `ProfileCreation`, etc.), reduciendo el bundle principal `index.js` de 551 kB a 457 kB.
- **Service Worker Versioning**: Actualizado `sw.js` a versión `apex-ai-v3-2026` para invalidación limpia de caché en nuevas versiones.

### Features & Gameloop
- **Leaderboard Global Activo**: Conectado el servicio de Leaderboard a `SeasonEndModal` y `GameOverScreen` para calcular y registrar el Score Presidencial en el ranking de Supabase.
- **Rediseño GameOverScreen**: Nueva pantalla de fin de carrera estilo broadcast con desglose completo de mandatos, títulos, valor de club, apoyo popular, score presidencial y publicación en leaderboard.
- **Validación Robusta de Guardados**: Validación estructural estricta en `services/db.ts` para importación de partidas `.apexsave`.
- **Limpieza Estética**: Eliminados emojis genéricos en sponsors (`economy.ts`, `FinancesScreen.tsx`, `SponsorshipScreen.tsx`) y `ErrorBoundary.tsx` reemplazados por iconos vectoriales Lucide.
- **Eliminación de Tipos `any`**: Tipado estricto en motores de simulación (`cupProgressionHandler.ts`, `cinematicsDetector.ts`, `cupGenerator.ts`, `seasonManager.ts`).

## [0.3.0] - 2024-12-02 - Phase 3: Multi-League & Cups

### Added
- **Championship League**: Segunda división con 24 equipos
- **FA Cup**: Competición de copa con eliminación directa
- **Carabao Cup**: Segunda competición de copa
- Sistema de progresión automática de copas
- Extra time y penalties en partidos de copa
- Helpers de simulación: `advanceCupRound`, `determineCupWinner`
- Tipo `GameAction` para mejor type safety en el reducer

### Changed
- `generateCupDraw` ahora acepta parámetro de competición
- `generateSeasonSchedule` maneja múltiples ligas (PL + Championship)
- Reducer actualizado para manejar estado de copas
- App.tsx integra lógica de progresión de copas

### Fixed
- Eliminado caso duplicado de `START_NEW_SEASON` en reducer
- Corregidos tipos en inicialización de copas

## [0.2.0] - 2024-11-30 - Premier League Enhancement

### Added
- Sistema de liga Premier League completo (20 equipos)
- Calendario de 38 jornadas
- Tabla de posiciones dinámica
- Sistema de temporadas con envejecimiento de jugadores

### Changed
- Mejorada simulación de partidos
- Optimizadas estadísticas de equipos

## [0.1.0] - 2024-11-29 - Initial Release

### Added
- Sistema de gestión de plantilla
- Cantera juvenil
- Mercado de fichajes con negociación
- Gestión financiera
- Debate presidencial interactivo
- Simulación de partidos en vivo
- Sistema de guardado/carga con IndexedDB
- PWA capabilities
- Interfaz moderna con Tailwind CSS

### Features
- 20 equipos de Premier League
- Estadísticas detalladas de jugadores
- Sistema de moral
- Contratos y edades
- Retiros automáticos
- Regeneración de jugadores

---

## Tipos de Cambios

- `Added` - Nuevas funcionalidades
- `Changed` - Cambios en funcionalidades existentes
- `Deprecated` - Funcionalidades que serán eliminadas
- `Removed` - Funcionalidades eliminadas
- `Fixed` - Correcciones de bugs
- `Security` - Correcciones de seguridad
