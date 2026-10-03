# Arquitectura del Sistema de Recursos Visuales (Resource System)

Este documento describe la arquitectura técnica del sistema centralizado de recursos visuales de Apex AI. Su objetivo es desacoplar por completo los **datos de juego** (jugadores, estadísticas, IDs, tablas, finanzas, simulaciones) de los **recursos visuales** (rostros, escudos, trofeos, banderas, equipaciones, estadios).

---

## 1. Principios de Diseño

1. **Separación Estricta de Responsabilidades**:
   - El motor de simulación, la lógica de traspasos y los componentes de la interfaz **nunca** almacenan ni conocen URLs directas de proveedores externos (FotMob, Transfermarkt, etc.).
   - La resolución de cualquier recurso visual se solicita exclusivamente a través del `ResourceManager`.

2. **Cero Dependencia de Red y Fallbacks Robustos**:
   - Si no hay conexión a internet o el usuario no ha instalado ningún pack comunitario, el juego genera siluetas vectoriales de alta calidad, escudos divididos por color oficial con iniciales, copas 3D y banderas ISO en formato SVG inline (`ResourceFallback`).
   - La interfaz **nunca se rompe** ni muestra iconos de imagen rota.

3. **Caché en Múltiples Capas (Multi-tier Caching)**:
   - **Nivel 1 (Memoria RAM)**: Búsqueda sincrónica en `0ms` mediante `Map<string, string>`. Los componentes React renderizan de forma instantánea sin parpadeos ni peticiones asíncronas bloqueantes.
   - **Nivel 2 (IndexedDB `ApexPacksDB`)**: Almacenamiento local persistente de Blobs e imágenes importadas de packs comunitarios. No requiere volver a descargar imágenes al reiniciar el juego.

4. **Compatibilidad y Combinación de Packs**:
   - Varios packs pueden coexistir al mismo tiempo (ej. *Argentina Faces* + *World Club Logos* + *Champions League Trophies*).
   - Cuando dos packs ofrecen el mismo recurso para un ID, un sistema de **prioridad configurable (1-100)** determina cuál prevalece.

---

## 2. Diagrama de la Arquitectura

```
                        +----------------------------+
                        |      COMPONENTE UI         |
                        | (PlayerAvatar, TeamLogo,   |
                        |  TrophyRoom, LeagueTable)  |
                        +--------------+-------------+
                                       |
                                       | getPlayerFace(101)
                                       v
                        +----------------------------+
                        |      ResourceManager       |
                        +--------------+-------------+
                                       |
                                       v
                        +----------------------------+
                        |        PackResolver        |
                        +--------------+-------------+
                                       |
           +---------------------------+---------------------------+
           | (Paso 1)                  | (Paso 2)                  | (Paso 3)
           v                           v                           v
+----------------------+   +-----------------------+   +----------------------+
|  Memoria RAM Hot     |   |   Packs Instalados    |   |  Default Community   |
| (ResourceCache: 0ms) |   | (Ordenados Prioridad) |   |  CDN Provider        |
+----------------------+   +-----------------------+   +----------------------+
                                       | (Si no existe)
                                       v
                           +-----------------------+
                           |   ResourceFallback    |
                           |  (SVG Procedural 0ms) |
                           +-----------------------+
```

---

## 3. Componentes Principales

Los módulos se encuentran en el directorio `services/resources/`:

| Archivo | Responsabilidad |
|---|---|
| `ResourceTypes.ts` | Definiciones TypeScript fuertes (`ResourceType`, `PackManifest`, `InstalledPack`, `PackCatalogItem`, `UserRole`, etc.). |
| `ResourceManager.ts` | Fachada principal accesible mediante singleton `resourceManager`. Expone métodos unificados (`playerFace`, `teamLogo`, `competitionLogo`, `trophy`, `countryFlag`, `kit`, `stadium`, `manager`). |
| `PackResolver.ts` | Motor de resolución en cascada con prioridad descendente y soporte de sobreescritura. |
| `PackManager.ts` | Gestión de ciclo de vida de los paquetes (instalación, desinstalación, activación, cambio de prioridades, verificación de actualizaciones semver). |
| `PackManifest.ts` | Validador estricto y sanitizador de seguridad que previene path traversal (`../`), esquemas maliciosos (`javascript:`) y extensiones no permitidas. |
| `PackCatalog.ts` | Catálogo de paquetes remotos oficiales y comunitarios con búsqueda, filtrado por categorías y ordenamiento. |
| `ResourceCache.ts` | Capa de persistencia con IndexedDB y gestión de memoria contra fugas de `Blob` / `objectURL`. |
| `ResourceFallback.ts` | Generador procedural de imágenes vectoriales SVG para cuando ningún asset está instalado. |
| `ContributionService.ts` | Módulo de envío de recursos visuales por parte de los usuarios, con límites de tamaño (2 MB) y validación de tipo MIME. |
| `ModerationService.ts` | Control de acceso basado en roles (`USER`, `CREATOR`, `MODERATOR`, `ADMIN`) para revisión y aprobación de contenido. |

---

## 4. API de Uso para Desarrolladores

### Resolver el rostro de un jugador:
```typescript
import { resourceManager } from '@/services/resources/ResourceManager';

// Mediante ID numérico o con metadatos de apoyo
const faceUrl = resourceManager.playerFace(101, { name: 'Bukayo Saka', position: 'DEL' });
```

### Resolver el escudo de un equipo:
```typescript
const logoUrl = resourceManager.teamLogo(701, { 
    name: 'Boca Juniors', 
    primaryColor: '#003366', 
    secondaryColor: '#FFCC00' 
});
```

### Resolver una competición o copa:
```typescript
const compLogo = resourceManager.competitionLogo('CHAMPIONS_LEAGUE', 'UEFA Champions League');
const trophyUrl = resourceManager.trophy('copa_libertadores', 'Copa Libertadores');
```

### Resolver la bandera de un país:
```typescript
const flagUrl = resourceManager.countryFlag('ARG');
```

### Suscribirse a cambios en caliente:
```typescript
useEffect(() => {
    return resourceManager.subscribe(() => {
        // Se ejecuta cuando el usuario instala, activa o cambia prioridades de un pack
    });
}, []);
```
*(Nota: El sistema además actualiza automáticamente el campo reactivo `packsVersion` en el store Zustand de la app).*

---

## 5. Pruebas Automatizadas

El sistema cuenta con una suite completa de pruebas unitarias en `tests/resources/resourceManager.test.ts`:
- Validación de generación de SVG en `ResourceFallback`.
- Prevención de path traversal y URLs maliciosas en `PackManifestValidator`.
- Resolución en cascada y prioridad de paquetes en `PackResolver`.
- Métodos públicos de `ResourceManager`.
- Comparador semántico de versiones (SemVer).
- Validación de límites en `ContributionService`.
- Permisos por rol en `ModerationService`.

Para ejecutar las pruebas:
```bash
npm test
```
