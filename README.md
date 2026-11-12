# Marketplace UNAB — Hito 3

Plataforma web Full Stack del Marketplace Universitario (Desarrollo Web y Móvil, segundo semestre 2026).
Continúa el prototipo React del Taller 2 y lo amplía con backend propio, PostgreSQL, MongoDB y Swagger.

> 🚧 En construcción. Este README se completa al cierre del hito (tarea T08).

## Integrantes

- Felipe Briceño
- Javier Leiva
- Damian Acevedo
- Fernando Arancibia

## Estructura

```
frontend/   React + Vite (base: prototipo del Taller 2)
backend/    API REST con NestJS (en desarrollo)
docs/       Diagramas, contrato de endpoints, uso de IA
```

## Ejecutar el frontend (por ahora)

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

## Flujo de trabajo

- `main`: versión entregable. Solo recibe merges desde `release/*`.
- `develop`: integración del equipo. Rama por defecto.
- `feature/<area>-<tarea>`: una rama por tarea, entra a `develop` por Pull Request revisado.
