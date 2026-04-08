# Contexto del Proyecto: Front-Transcriptor

## Descripción
Este es el frontend de una PWA (Progressive Web App) para la transcripción y resumen de audios, desarrollada para el laboratorio Ludolab.

## Stack Tecnológico
- **Framework:** React con Vite
- **Lenguaje:** TypeScript
- **Estado:** PWA con `vite-plugin-pwa` (Service Worker en `src/sw.ts`)
- **Routing:** React Router (en `AppRouter.tsx`)

## Estructura de carpetas
- `src/components`: Componentes reutilizables.
- `src/assets`: Imágenes y estilos globales.
- `src/sw.ts`: Lógica del Service Worker para la PWA.

## Reglas de desarrollo
- Usar siempre **Functional Components**.
- Mantener el tipado de TypeScript estricto.
- Backend esperado: FastAPI con MongoDB (en puerto 8000).