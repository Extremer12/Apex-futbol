# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Bug Fixes & Engine Stability
- **Realismo en el Mercado de Fichajes y Preservación de Edades**:
  - **Corrección de Edades de Jugadores Reales (`gameFactory.ts`)**: Se eliminó la sobreescritura aleatoria que asignaba edades entre 18 y 33 años a todos los futbolistas al iniciar una partida. Ahora las edades reales de las plantillas (como Lewandowski con 36 años, Cavani con 37, Modrić con 39) se preservan rigurosamente.
  - **Prestigio Continental y Rechazo Realista (`gameLogic.ts`)**: Se implementó una cláusula de prestigio continental en las negociaciones de clubes y contratos personales. Jugadores estrella que militan en ligas europeas de élite (rating >= 83) rechazan transferencias a clubes de ligas sudamericanas por razones de competitividad y Champions League, evitando traspasos inverosímiles como Robert Lewandowski firmando por Boca Juniors.
  - **Alineación de Moneda y Presupuestos de Compradores**: Normalizados los valores de futbolistas y presupuestos de la IA para que los clubes de todas las ligas puedan emitir contraofertas y compras válidas.

- **Economía Realista y Presupuestos Coherentes en Sudamérica**:
  - **Eliminación del Doble Cómputo Financiero Semanal (`gameLifecycleReducer.ts`)**: Se corrigió un error por el cual las fechas entre semana (*midweek*) volvían a acreditar los derechos de televisión y contratos de patrocinio semanales sin descontar los salarios de la plantilla, inflando los balances de manera desproporcionada. Los turnos de mitad de semana ahora solo computan la recaudación de taquilla si el equipo juega de local.
  - **Calibración Económica por Región (`economy.ts`)**:
    - **Derechos de TV**: La Liga Profesional Argentina se ajustó de $550k/semana a $85k/semana (~$4.4M anuales); Primera Nacional a $22k/semana; Brasileirão a $160k/semana; Chile y Paraguay a $30k-$35k/semana.
    - **Patrocinadores y Mercado Comercial**: Los contratos de camisetas e indumentaria en Sudamérica ahora reflejan valores reales del continente (~15% a 20% de las cifras de gigantes europeos).
    - **Taquilla y Precios de Entradas**: Las entradas en estadios sudamericanos se adaptaron a valores locales ($18 USD para clubes grandes, $12 medianos) en lugar de la tarifa europea unificada de $50 USD.
    - **Premios por Título**: Escala de premios de campeón de liga ajustada al contexto sudamericano ($12M base para campeón argentino).
  - **Asignación Presupuestaria de la Directiva al Iniciar Temporada (`seasonManager.ts`)**: Al comenzar el segundo año, la directiva ya no entrega el 100% de la tesorería acumulada para transferencias. El presupuesto de fichajes cuenta con un tope realista por directiva (máximo $14M para Boca/River, $5M para clubes medianos), evitando presupuestos de $130M+ en el fútbol argentino.
  - **Filtro de Fichajes Asequibles (`TransfersMarketTab.tsx`)**: Ajustado para tomar el menor valor entre el presupuesto asignado de transferencias y la tesorería real (`Math.min`), impidiendo ofertar por encima del presupuesto autorizado.

- **Venta de Jugadores y Sistema Dinámico de Ofertas Entrantes**:
  - **Nueva Pestaña "Vender / Mi Plantilla" (`TransfersSquadTab.tsx`)**: Integrada en la navegación del Mercado de Fichajes (`TransfersScreen.tsx`), permite revisar toda la plantilla del club, con valor de mercado, salario, contrato, estado de transferible y un botón directo **"⚡ Ofrecer a Clubes"**.
  - **Acción Inmediata de Difusión al Mercado (`OFFER_PLAYER_TO_CLUBS`)**: Al ofrecer un futbolista mediante el botón, el motor lo declara transferible y sondea a clubes con necesidad táctica y presupuesto disponible, generando de 1 a 2 ofertas formales inmediatas en la bandeja de entrada y en las noticias.
  - **Probabilidad Aumentada de Ofertas en Simulación Semanal (`simulationNewsHandler.ts`)**: La probabilidad de que clubes externos envíen propuestas por futbolistas transferibles se elevó del 30% al 75% semanal. Además, se añadió interés espontáneo por figuras y promesas no transferibles (30% de probabilidad semanal).

- **Corrección de Marcador Global y Penales en Eliminatorias de Ida y Vuelta (Sudamericana, Libertadores, Champions, Europa League)**:
  - **Detección Rigurosa del Partido de Ida**: Corregida la búsqueda de partidos anteriores en el Worker de simulación (`simulation.worker.ts`). Anteriormente, `schedule.find` podía capturar un partido previo de la fase de grupos entre ambos clubes (por ejemplo, un 0-0 de la fecha 8) en lugar del partido de ida de la eliminatoria actual, provocando que un 0-0 en la vuelta fuese interpretado como un 0-0 global y forzara penales indebidamente cuando se había ganado 1-0 en la ida.
  - **Cálculo Exacto de Puntos Globales y Prórroga**: Se garantiza que el partido de ida termine siempre en los 90 minutos reglamentarios sin tiempo extra ni penales, y que el partido de vuelta solo recurra a prórroga/penales si el resultado global entre ambos partidos está estrictamente empatado.
  - **Sincronización en UI de Simulación y Copas**: Los marcadores globales (`aggregateScore`), etiquetas de "Ida" y "Vuelta", y el ganador final del cruce se reflejan con precisión en el visor de partido (`FullScreenMatchSimulation.tsx`), en el resumen de resultados y en el árbol de la competición.
- **Corrección Integral del Visor de Copas ("Partidos y Resultados")**:
  - **Mapeo Real de Partidos Jugados (`CupView.tsx`)**: Se sincronizaron todas las rondas y fechas con el calendario real (`gameState.schedule`), asegurando que se visualicen los marcadores reales, goleadores y tandas de penales disputadas en lugar de enfrentamientos no jugados o vacíos.
  - **Desglose de Ida y Vuelta en Rondas K.O.**: Ahora cada fase eliminatoria muestra de forma clara e independiente los partidos de Ida y Vuelta con etiquetas distintivas y el cómputo global en tiempo real.
  - **Separación de Fechas en Fase de Grupos**: Las llaves de eliminación directa ya no se filtran de forma errónea como "Fecha 7" u "8" en la fase de grupos.
- **Prevención de Cinemáticas Prematuras en Pantalla de Simulación**:
  - **Retención de Eventos Cinemáticos (`useSimulation.ts`)**: Se posterga el despacho de cinemáticas de clasificación o eliminatorias (como el pase a la siguiente fase en la última fecha de grupos) hasta que el usuario hace clic en el botón "Continuar" tras finalizar el partido, evitando que la cinemática salte sobre el visor mientras el partido aún se está jugando o simulando.
  - **Blindaje en `App.tsx`**: El componente `CinematicOverlay` ahora verifica que la fase de partido no esté en estado `LIVE` antes de montarse.

- **Corrección Integral de Cruces Ida y Vuelta en Copas Internacionales (Champions, Libertadores, Sudamericana)**:
  - **Blindaje de Partidos de Vuelta en el Calendario (`cupProgressionHandler.ts`)**: Corregido el filtro de limpieza al final de `handleCupProgression` que solo registraba `fixtures` (partidos de ida) y purgaba erróneamente todos los partidos de vuelta (`secondLegFixtures`) del `schedule`, impidiendo que las eliminatorias avanzaran a Cuartos, Semifinales y Final.
  - **Sincronización en Web Worker (`simulation.worker.ts`)**: Añadido soporte para registrar los resultados de los partidos de vuelta en `round.secondLegFixtures` dentro de las rondas de la copa.
  - **Resolución Completa en Cierre de Temporada (`finalizeSingleCupCompetition` en `cupGenerator.ts`)**: Actualizado el motor de resolución automática para simular tanto el partido de ida como el de vuelta, determinar el ganador global por resultado agregado y penales, y coronar a todos los campeones restantes sin dejar ninguna copa "En Disputa".
  - **Detección de Usuario en Cruces de 2 Piernas (`seasonUtils.ts`)**: Mejorada la función `isSeasonCompleted` para evaluar el estado real del usuario en eliminatorias a doble partido (no concluir la temporada si resta disputar la vuelta, y calcular el clasificado mediante el marcador global).
- **Solución al Bucle Infinito en Bundesliga / Ligas de 34 Semanas**: 
  - Corregida la duración oficial del calendario en `seasonUtils.ts` (`maxLeagueWeek = 34` para Bundesliga, 2. Bundesliga y Ligue 1).
  - Eliminada la restricción que bloqueaba la finalización de temporada esperando a la semana 38 por copas europeas de la IA cuando el usuario ya no tenía partidos pendientes, permitiendo que `isSeasonCompleted` active el cierre de temporada oportunamente y ejecute la resolución automática (`finalizeSeasonCompetitions`).
  - Blindada la detección de campeones en `cinematicsDetector.ts`: la cinemática `LEAGUE_WIN` ahora se dispara exclusivamente en la última fecha de liga con un ID determinista y comprobación de trofeos previos / cola de cinemáticas, evitando que se reproduzca en bucle al simular.
- **Corrección de Logo 404 (SSV Ulm)**: Actualizada la URL del escudo del SSV Ulm 1846 en `data/teams/secondDivisions.ts` (reemplazado endpoint inexistente `1456.png` por el oficial verificado `1458.png` con respuesta HTTP 200 OK).

- **Rediseño Integral de Historial y Palmarés (`CompetitionHistoryView.tsx` & `TrophyRoomScreen.tsx`)**:
  - **Filtros por País y Región Intuitivos**: Se sustituyó la lista horizontal caótica de más de 25 torneos por una barra de navegación con chips organizados por región (*Todos, Internacionales, Argentina, España, Inglaterra, Alemania, Italia, Francia, Brasil, México, Paraguay*) y buscador en tiempo real con botón de limpieza instantánea.
  - **Escudos Oficiales de Clubes**: En la tabla del Palmarés y en el historial de ediciones finalizadas, cada club (campeón y subcampeón) se renderiza con su escudo oficial o vectorial auténtico en lugar de texto plano o números genéricos.
  - **Tarjetas Broadcast Limpias**: Eliminado el exceso de texto explicativo redundante; la cabecera ahora muestra una insignia de competición compacta, estilo transmisión deportiva, con total de ediciones disputadas, clubes galardonados y el campeón más laureado.
- **Renovación Visual de Logros Presidenciales**:
  - **Paleta de Color y Elegancia**: Se eliminó el aspecto oscuro, apagado y plano. Cada categoría cuenta ahora con un tema visual elegante y distintivo (*Ámbar/Dorado* para Títulos, *Cian/Zafiro* para Gestión, *Esmeralda/Menta* para Fichajes y *Púrpura/Amatista* para Hitos Especiales) con sutiles degradados y bordes iluminados.
  - **Cero Iconos/Emojis Genéricos**: Se reemplazaron todos los emojis genéricos (🏆, 👑, ⭐) por iconos vectoriales SVG profesionales de Lucide (`Trophy`, `Crown`, `Coins`, `Building2`, `Sparkles`, `ArrowRightLeft`, etc.).
  - **Barra de Progreso y Badges de Estado**: Barra de progreso general estilo broadcast en degradado áurico, insignias elegantes de estado (*Conseguido / Bloqueado*) y barras de progreso individuales para cada meta.
- **Pantalla de Inicio Más Limpia**: Eliminado el botón redundante "Logos & Packs" de la barra superior; el acceso a los packs de la comunidad se gestiona exclusivamente desde la tarjeta principal destacada del menú, dejando una cabecera despejada y simétrica.
- **Formulario de Perfil de Presidente Realista (`ProfileCreation.tsx`)**:
  - Eliminado el selector de "Nivel de Experiencia" (Novato/Experimentado/Leyenda) al no tener impacto mecánico en el juego.
  - Añadidos campos directos para **Nombre**, **Apellido**, **Edad** (selector numérico 21-85 años) y **Nacionalidad** (con selector completo de banderas de las principales naciones del fútbol).
  - Actualizada la pantalla de perfil del presidente (`ProfileScreen.tsx`) para exhibir con elegancia la edad junto a la nacionalidad del dirigente.
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
- **Optimización Visual de Cierre de Temporada**:
  - **Cards de Movimientos de Categoría (`HeroSection.tsx`)**: Reestructuradas las tarjetas de ascensos y descensos con contención estricta `min-w-0` y badges compactos, eliminando solapamientos de texto y desbordamientos en resoluciones de PC.
  - **Botón Proporcional de Nueva Temporada**: Reemplazado el botón gigante y desproporcionado por un control estético, compacto y estilizado (`Comenzar Temporada X`) alineado armoniosamente con `Ver Resumen Completo`.
  - **Header Simétrico y Limpio en Resumen Detallado (`SeasonEndModal.tsx`)**: Rediseñado el encabezado con alineación simétrica de los botones `Volver` y `Comenzar Temporada` sin emojis ni iconos genéricos, totalmente adaptado a pantallas móviles y de escritorio.
  - **Eliminación de Botones Duplicados**: Suprimida la sección de botones redundantes al final del scroll para mantener una experiencia limpia y libre de duplicidades.

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
