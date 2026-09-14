# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

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
