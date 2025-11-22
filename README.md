<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Apex AI - Football Manager Game

Una aplicación de gestión de fútbol impulsada por IA, construida con React, TypeScript y Google Gemini AI.

## 🎮 Características

- **Gestión de Equipo**: Administra tu plantilla, fichajes y finanzas
- **IA Generativa**: Noticias y eventos generados dinámicamente con Google Gemini
- **Sistema de Elecciones**: Convence a la junta directiva para conseguir el puesto
- **Simulación de Partidos**: Sistema realista de simulación de partidos
- **Guardado de Partidas**: Guarda y carga múltiples partidas
- **Interfaz Moderna**: UI responsive con Tailwind CSS
- **PWA**: Instalable como aplicación web progresiva

## 🚀 Ejecutar Localmente

**Prerequisitos:** Node.js (v16 o superior)

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Extremer13/Apex-AI-.git
   cd Apex-AI-
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar API Key:**
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Añade tu clave de API de Gemini:
     ```
     GEMINI_API_KEY=tu_clave_api_aqui
     ```
   - Obtén tu API key en: https://ai.google.dev/

4. **Ejecutar la aplicación:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
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
│   ├── gameflow/       # Flujo del juego (inicio, selección, etc.)
│   ├── screens/        # Pantallas principales
│   └── ui/             # Componentes UI reutilizables
├── services/           # Servicios (API, simulación, DB)
├── state/              # Gestión de estado (reducer)
├── App.tsx             # Componente principal
├── types.ts            # Definiciones TypeScript
├── constants.tsx       # Datos de equipos y constantes
└── utils.ts            # Funciones auxiliares
```

## 🛠️ Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos
- **Google Gemini AI** - Generación de contenido
- **IndexedDB** - Almacenamiento local

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 👨‍💻 Autor

Desarrollado por [Extremer13](https://github.com/Extremer13)
