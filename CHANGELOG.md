# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Custom hooks: `useNotification` y `useAutoSave` para mejor organización del código
- Error Boundary component para manejo graceful de errores
- Estructura modular de constants (teamLogos, squadHelpers, championship)
- Archivo `.env.example` para documentar variables de entorno
- Documentación CONTRIBUTING.md con guías de contribución

### Changed
- README.md actualizado con características de Phase 3 (copas y multi-liga)

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
