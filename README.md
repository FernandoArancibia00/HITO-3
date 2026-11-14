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


## Estructura de módulos del backend

El backend utiliza NestJS 10 y organiza sus funcionalidades en módulos independientes.

Cada módulo sigue esta estructura:

```text
backend/src/
└── nombre-modulo/
    ├── nombre-modulo.module.ts
    ├── nombre-modulo.controller.ts
    ├── nombre-modulo.service.ts
    ├── dto/
    └── entities/
```

- `module.ts`: registra los controladores y servicios.
- `controller.ts`: define los endpoints HTTP.
- `service.ts`: contiene la lógica de negocio.
- `dto/`: define y valida los datos de entrada.
- `entities/`: contiene las entidades de PostgreSQL.

Los módulos que utilizan MongoDB emplean `schemas/` en lugar de `entities/`.

Los módulos se registran en `AppModule`.

### Documentación de la API

Swagger: http://localhost:3000/api/docs

Comprobación de PostgreSQL y MongoDB:

`GET http://localhost:3000/api/health`
