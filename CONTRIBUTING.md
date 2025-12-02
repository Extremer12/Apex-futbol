# Contribuyendo a Apex AI

¡Gracias por tu interés en contribuir a Apex AI! Este documento proporciona pautas para contribuir al proyecto.

## 🚀 Cómo Empezar

1. **Fork el repositorio**
2. **Clona tu fork**
   ```bash
   git clone https://github.com/tu-usuario/Apex-futbol.git
   cd Apex-futbol
   ```
3. **Instala las dependencias**
   ```bash
   npm install
   ```
4. **Crea una rama para tu feature**
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```

## 📝 Convenciones de Código

### TypeScript
- Usa TypeScript estricto
- Define tipos explícitos para todas las funciones y variables
- Evita `any` - usa tipos específicos o `unknown`
- Documenta funciones públicas con JSDoc

### React
- Usa componentes funcionales con hooks
- Implementa `React.memo` para componentes que renderizan frecuentemente
- Usa `useCallback` y `useMemo` estratégicamente
- Mantén componentes pequeños y enfocados (< 200 líneas)

### Nombres
- **Componentes**: PascalCase (`TeamCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useNotification.ts`)
- **Funciones**: camelCase (`calculateTeamStats`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_PLAYERS`)
- **Tipos/Interfaces**: PascalCase (`PlayerProfile`)

### Estructura de Archivos
```
src/
├── components/
│   ├── gameflow/      # Flujo del juego
│   ├── screens/       # Pantallas principales
│   └── ui/            # Componentes reutilizables
├── services/          # Lógica de negocio
├── hooks/             # Custom hooks
├── state/             # Gestión de estado
├── constants/         # Constantes y datos
└── types.ts           # Definiciones de tipos
```

## 🎯 Proceso de Contribución

### 1. Issues
- Revisa los issues existentes antes de crear uno nuevo
- Usa las plantillas de issues cuando estén disponibles
- Sé descriptivo: incluye pasos para reproducir bugs

### 2. Pull Requests
- Haz commits pequeños y atómicos
- Escribe mensajes de commit descriptivos (ver abajo)
- Asegúrate de que el código compila sin errores
- Actualiza la documentación si es necesario
- Enlaza el PR con el issue relacionado

### 3. Mensajes de Commit
Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción breve

Descripción detallada (opcional)

Refs: #123
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación
- `style`: Formato de código (sin cambios funcionales)
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```
feat(cups): add FA Cup progression logic
fix(simulation): correct penalty shootout calculation
docs(readme): update installation instructions
refactor(constants): split teams into separate modules
```

## 🧪 Testing

Antes de enviar un PR:

1. **Build exitoso**
   ```bash
   npm run build
   ```

2. **Prueba manual**
   - Inicia el juego
   - Prueba la funcionalidad afectada
   - Verifica que no haya regresiones

3. **Tests (cuando estén disponibles)**
   ```bash
   npm test
   ```

## 📋 Checklist de PR

- [ ] El código compila sin errores ni warnings
- [ ] He probado los cambios localmente
- [ ] He actualizado la documentación relevante
- [ ] He seguido las convenciones de código
- [ ] Los commits siguen Conventional Commits
- [ ] He enlazado el issue relacionado

## 🎨 Guías de Diseño

### UI/UX
- Mantén la estética oscura y moderna
- Usa la paleta de colores existente (slate/sky/green/red)
- Asegura que los componentes sean responsive
- Añade animaciones sutiles para mejorar UX

### Performance
- Evita re-renders innecesarios
- Usa lazy loading para componentes pesados
- Optimiza imágenes y assets
- Mantén el bundle size bajo control

## 🐛 Reportar Bugs

Incluye en tu reporte:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots/videos si aplica
- Información del navegador/OS
- Logs de consola relevantes

## 💡 Sugerir Features

Para nuevas funcionalidades:
- Describe el problema que resuelve
- Propón una solución
- Considera alternativas
- Piensa en el impacto en usuarios existentes

## 📞 Contacto

- Issues: [GitHub Issues](https://github.com/Extremer12/Apex-futbol/issues)
- Autor: [@Extremer12](https://github.com/Extremer12)

## 📜 Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la licencia MIT del proyecto.

---

¡Gracias por contribuir a Apex AI! 🎮⚽
