# Guía de Creación y Distribución de Packs Comunitarios

Esta guía explica en detalle cómo la comunidad y los desarrolladores pueden crear, empaquetar, validar y distribuir paquetes de recursos visuales para **Apex AI**, inspirándose en el modelo de packs de *Superkickoff*.

---

## 1. Estructura de un Pack

Un paquete comunitario es un conjunto de archivos estáticos organizados de forma declarativa. Puede distribuirse como un archivo `.zip` o como un archivo de manifiesto remoto `manifest.json`.

> [!IMPORTANT]
> **REGLA DE SEGURIDAD**: Los paquetes comunitarios **NUNCA** pueden contener código ejecutable (JavaScript, HTML, WebAssembly ni ejecutables nativos). Solo se permiten imágenes estáticas en formato `.webp`, `.png`, `.svg` o `.jpg`.

### Estructura de carpetas recomendada:
```
mi-pack-comunitario/
├── manifest.json
└── assets/
    ├── players/
    │   ├── 101.webp
    │   ├── 102.webp
    │   └── 103.webp
    ├── teams/
    │   ├── 1.webp
    │   ├── 2.webp
    │   └── 701.webp
    ├── competitions/
    │   ├── premier-league.svg
    │   └── champions-league.svg
    └── trophies/
        └── champions-league.webp
```

---

## 2. Formato del Archivo `manifest.json`

Cada paquete debe incluir un archivo `manifest.json` en su raíz que cumpla con el estándar de esquema de la versión 1:

```json
{
  "schemaVersion": 1,
  "id": "argentina-faces-2026",
  "name": "Argentina Faces 2026",
  "version": "1.0.0",
  "category": "player-faces",
  "author": {
    "id": "cristian-dev",
    "name": "Cristian",
    "isVerified": true,
    "role": "ADMIN"
  },
  "description": "Rostros de futbolistas en alta resolución para los clubes de la Liga Argentina.",
  "isOfficial": true,
  "gameVersionMin": "1.0.0",
  "assetCount": 350,
  "sizeBytes": 14200000,
  "license": {
    "type": "Community / Attribution",
    "rightsDeclared": true,
    "declarationText": "El autor declara contar con los derechos o licencias de uso correspondientes."
  },
  "assets": {
    "players": {
      "101": "assets/players/101.webp",
      "102": "assets/players/102.webp",
      "103": "assets/players/103.webp"
    },
    "teams": {
      "701": "assets/teams/701.webp"
    }
  }
}
```

### Campos Obligatorios:
- `schemaVersion`: Debe ser `1`.
- `id`: Identificador único en minúsculas y guiones (ej. `premier-league-faces`).
- `name`: Nombre descriptivo visible para los usuarios en el catálogo.
- `version`: Versión siguiendo **Versionado Semántico (SemVer)** (ej. `1.0.0`, `1.1.0`, `2.0.0`).
- `category`: Una de las siguientes categorías admitidas:
  - `player-faces`: Rostros de jugadores.
  - `team-logos`: Escudos de clubes.
  - `league-logos`: Logos de ligas.
  - `competition-logos`: Logos de torneos y copas internacionales.
  - `trophies`: Modelos de trofeos y vitrinas.
  - `flags`: Banderas de selecciones nacionales.
  - `kits`: Camisetas de equipos.
  - `stadiums`: Imágenes de estadios.
  - `managers`: Fotos de entrenadores.
  - `all-in-one`: Paquetes que combinan múltiples categorías.
- `author`: Objeto con `id` y `name`.
- `assets`: Mapa organizado por tipo (`players`, `teams`, `competitions`, `trophies`, etc.) donde las claves corresponden a los **IDs del juego**.

---

## 3. Convención de IDs del Juego

Para que los recursos se vinculen automáticamente sin modificar el código de juego, utiliza los IDs canónicos:

| Tipo | Clave / ID | Ejemplo |
|---|---|---|
| Jugador | ID numérico del jugador | `"101"` (Bukayo Saka), `"102"` (Martin Ødegaard) |
| Equipo | ID numérico del equipo o slug | `"1"` (Arsenal), `"701"` (Boca Juniors), `"702"` (River Plate) |
| Torneo | ID en minúsculas o snake_case | `"champions_league"`, `"copa_libertadores"` |
| Banderas | Código ISO alfa-3 o alfa-2 | `"ARG"`, `"ENG"`, `"ESP"`, `"BRA"` |

---

## 4. Herramienta Automatizada: Pack Builder CLI

El proyecto incluye un script CLI para automatizar la generación, compresión a WebP y armado del manifest:

### Uso:
```bash
npm run build-pack -- --input=./mis_imagenes --output=./dist_pack --name="Mi Nuevo Pack" --category=player-faces
```

### Funciones del CLI:
1. Lee los archivos de entrada (e.g. `101.png`, `102.jpg`).
2. Valida dimensiones y nombres de archivo.
3. Convierte y comprime imágenes a formato `.webp` de alta eficiencia.
4. Genera automáticamente el archivo `manifest.json` con los hashes SHA-256 de integridad.
5. Empaqueta el resultado en un archivo `.zip` listo para publicar.

---

## 5. Ciclo de Moderación y Publicación

1. **Envío por parte del usuario**:
   - Los usuarios pueden subir contribuciones individuales a través del botón **"Contribuir"** en la pantalla de *Packs de la Comunidad*.
   - El sistema valida el tamaño del archivo (< 2 MB) y el formato (WebP, PNG, SVG).
   - Se crea un registro con estado inicial `pending`.

2. **Revisión por Moderadores (`MODERATOR` / `ADMIN`)**:
   - Estados posibles:
     - `pending`: Pendiente de revisión técnica y visual.
     - `approved`: Aprobado para inclusión en el catálogo público.
     - `rejected`: Rechazado (por baja calidad o derechos inapropiados).
     - `flagged`: Reportado por la comunidad para revisión urgente.

3. **Packs Oficiales del Desarrollador**:
   - Los packs publicados con la cuenta del desarrollador reciben la insignia especial `✓ Oficial` y una prioridad base predeterminada más alta (`priority: 20-30`).

---

## 6. Cómo Agregar una Nueva Categoría en el Futuro

El sistema está diseñado de forma modular. Para añadir una nueva categoría (por ejemplo `stadium-3d` o `player-audio`):
1. Añadir el identificador a `ResourceType` y `PackCategory` en `services/resources/ResourceTypes.ts`.
2. Implementar el fallback correspondiente en `services/resources/ResourceFallback.ts`.
3. Registrar la pestaña en `CATEGORY_TABS` dentro de `components/screens/settings/CommunityPacksSection.tsx`.
4. El `PackResolver` y `PackManager` procesarán automáticamente la nueva categoría sin requerir cambios en el motor de juego.
