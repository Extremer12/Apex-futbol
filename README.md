<div align="center">
<img width="1200" height="475" alt="Apex AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Apex AI: Football President ⚽💼

**El simulador de gestión futbolística definitivo donde el poder reside en la presidencia.**
Construido con React 19, TypeScript y un motor de simulación local de alto rendimiento.

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://apex-futbol.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)

</div>

---

## 🏛️ El Sistema Presidencial (Core del Juego)

A diferencia de otros managers, en **Apex AI** no eres solo un entrenador; eres el **Presidente**. Tu éxito se mide por tu capacidad para mantener el control político y financiero del club.

### 🗳️ Mandato de 4 Años
- **Elecciones Democráticas**: Cada 4 temporadas debes enfrentarte a las urnas. Tu gestión determinará si los socios te reeligen o te expulsan del club.
- **Debate Presidencial**: Antes de empezar, define tu visión respondiendo a preguntas críticas que marcarán tus **Promesas Electorales**.
- **Aprobación de los Socios**: Un indicador dinámico basado en resultados deportivos, salud financiera y cumplimiento de promesas.

### 🏰 Club Hub: El Despacho del Presidente
- Gestiona la **infraestructura del estadio** y autoriza proyectos de expansión millonarios.
- Monitorea la **confianza de la junta directiva** y el progreso de tus promesas en tiempo real.
- Analiza los factores de aprobación para ajustar tu estrategia política.

---

## 👔 Delegación Deportiva

Como presidente, tú eliges el camino:
- **Director Técnico**: Contrata entrenadores con diferentes estilos (Atacante, Defensivo, Posesión) que gestionarán la táctica por ti.
- **Mercado Galáctico**: Decide si invertir en superestrellas para aumentar el marketing o apostar por la cantera.
- **La Academia**: Desarrolla jóvenes talentos y promociónalos al primer equipo para asegurar el futuro del club.

---

## 💰 Economía 2.0 y Patrocinios

- **Marketplace de Sponsors**: Firma acuerdos con marcas de ropa, patrocinadores de camiseta y derechos de nombre del estadio.
- **Bonos por Rendimiento**: Elige entre contratos seguros o apuestas arriesgadas con grandes bonos si alcanzas el Top 4 o el ascenso.
- **Premios de Liga**: Recibe inyecciones de capital masivas según tu posición final en la tabla.
- **Gastos Operativos**: Gestiona el balance semanal controlando salarios, mantenimiento y marketing.

---

## 🎮 Características Técnicas

- **Arquitectura Robusta**: Lógica de simulación desacoplada mediante Custom Hooks (`useSimulation`, `useGameSave`).
- **Web Workers**: Motor de simulación asíncrono para mantener la UI fluida incluso durante cálculos pesados.
- **Offline First**: Persistencia total mediante IndexedDB. Juega sin conexión en cualquier momento.
- **Diseño Premium**: Interfaz moderna con animaciones de micro-interacciones, modo oscuro y gradientes dinámicos.

---

## 📁 Estructura del Proyecto

```
Apex-ai/
├── components/          # Componentes React (ClubHub, Dashboard, etc.)
├── services/           # Lógica de Negocio (Economy, Simulation, Political)
├── state/              # Reducer y gestión de estado centralizada
├── hooks/              # Lógica de hooks personalizados
├── data/               # Bases de datos de equipos (Premier, La Liga, etc.)
├── workers/            # Simulación en hilos secundarios
└── types.ts            # Definiciones de tipos estrictos
```

---

## 🚀 Instalación y Desarrollo

1. **Clonar y Acceder**:
   ```bash
   git clone https://github.com/Extremer12/Apex-futbol.git
   cd Apex-futbol
   ```

2. **Dependencias**:
   ```bash
   npm install
   ```

3. **Lanzar**:
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Autor

Desarrollado por **[Extremer12](https://github.com/Extremer12)**. 
*Llevando la gestión deportiva al siguiente nivel.*

---
<div align="center">
  <p>¿Tienes lo que hay que tener para ser el presidente más exitoso de la historia?</p>
  <a href="https://apex-futbol.vercel.app"><strong>JUGAR AHORA</strong></a>
</div>
