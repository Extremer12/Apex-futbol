<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Apex AI - Football Manager Game

Un juego de gestión de fútbol completo y totalmente funcional sin dependencias de IA, construido con React, TypeScript y Vite.

## 🎮 Características

### Gestión Completa
- **Sistema de Plantilla**: Administra hasta 25 jugadores con estadísticas detalladas
- **Cantera Juvenil**: Desarrolla jóvenes talentos y promociónales al primer equipo
- **Mercado de Fichajes**: Negocia fichajes con lógica determinista inteligente
- **Gestión Financiera**: Control de presupuesto, salarios e ingresos semanales

### Experiencia de Juego
- **Debate Presidencial Interactivo**: Sistema de elección mediante 6 preguntas de opción múltiple con oponentes virtuales
- **Simulación de Partidos**: Motor de simulación realista con animaciones en vivo
- **Liga Completa**: Sistema de liga con 20 equipos, calendario completo y tabla de posiciones
- **Sistema de Temporadas**: Envejecimiento de jugadores, retiros y regeneración automática

### Características Técnicas
- **Guardado Local**: Sistema de guardado/carga con IndexedDB
- **Sin Dependencias de IA**: Lógica de juego 100% determinista y local
- **PWA**: Instalable como aplicación web progresiva
- **Interfaz Moderna**: UI responsive con Tailwind CSS y animaciones fluidas

## 🚀 Ejecutar Localmente

**Prerequisitos:** Node.js (v16 o superior)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Extremer12/Apex-futbol.git
   cd Apex-futbol
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   - Navega a `http://localhost:3000`

## 🏗️ Compilar para Producción

```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
Apex-ai/
├── components/          # Componentes React
│   ├── gameflow/       # Flujo del juego (inicio, selección, debate)
│   ├── screens/        # Pantallas principales (Dashboard, Plantilla, etc.)
│   └── ui/             # Componentes UI reutilizables
├── services/           # Servicios
│   ├── gameLogic.ts    # Lógica de noticias y negociaciones
│   ├── electionDebate.ts # Sistema de debate presidencial
│   ├── simulation.ts   # Motor de simulación de partidos
│   └── db.ts           # Persistencia con IndexedDB
├── state/              # Gestión de estado (reducer)
├── App.tsx             # Componente principal
├── types.ts            # Definiciones TypeScript
├── constants.tsx       # Datos de equipos y constantes
└── utils.ts            # Funciones auxiliares
```

## 🎯 Cómo Jugar

1. **Crea tu Perfil**: Ingresa tu nombre como presidente
2. **Elige un Equipo**: Selecciona entre 20 equipos de diferentes niveles
3. **Gana las Elecciones**: Responde 6 preguntas estratégicas para convencer a la junta
4. **Gestiona tu Club**: 
   - Juega partidos semanales
   - Ficha y vende jugadores
   - Administra finanzas
   - Desarrolla tu cantera
5. **Compite por el Título**: Lleva a tu equipo a la cima de la liga

## 🛠️ Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS 4** - Estilos modernos
- **IndexedDB** - Almacenamiento local persistente

## 🎨 Características Destacadas

### Sistema de Debate Presidencial
- 8 preguntas únicas con 3 opciones cada una
- Dificultad adaptativa según el tier del equipo
- Oponentes virtuales con IA simulada
- Feedback visual inmediato

### Motor de Simulación
- Cálculo basado en estadísticas de jugadores por posición
- Factores de moral, forma y localía
- Animación en vivo con eventos del partido
- Sistema de goles realista

### Gestión de Plantilla
- Sistema de moral de jugadores (5 niveles)
- Contratos y edades
- Retiros automáticos por edad
- Regeneración de jugadores (regens)

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 👨‍💻 Autor

Desarrollado por [Extremer12](https://github.com/Extremer12)

## 🔗 Links

- **Demo en Vivo**: [Apex AI en Vercel](https://apex-futbol.vercel.app)
- **Repositorio**: [GitHub](https://github.com/Extremer12/Apex-futbol)
