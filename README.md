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

## Pruebas de reglas de negocio (T27)

Desde la carpeta `backend`, ejecuta:

```bash
npm test
```

El comando compila el backend y ejecuta las pruebas con el test runner integrado de Node.js (`node:test`), sin dependencias adicionales. Se verifican:

- Rechazo de pedidos con el carrito vacío.
- Rechazo por stock insuficiente al crear el pedido.
- Rechazo de una transición de estado inválida.
- Restauración del stock al cancelar un pedido pagado.

Para probar el flujo completo contra la API y PostgreSQL, importa `docs/pruebas/t27-business-rules.postman_collection.json` en Postman. Completa `buyerToken`, `sellerToken` y `productId` con usuarios y un producto de prueba aislado; ejecuta las solicitudes en orden. La colección comprueba carrito vacío, transición inválida, pagos rechazado y aprobado, y restauración del stock.

## Integración con API pública — Open Library (T06)

El Marketplace UNAB integra la API pública de Open Library para facilitar la publicación de libros universitarios.

**API utilizada:** Open Library Search API

**Endpoint:** `https://openlibrary.org/search.json`

**Método HTTP:** GET

**Parámetros:** `q` (término de búsqueda) y `limit=6`.

**Datos utilizados:**
- Título del libro.
- Autor o autores.
- Año de primera publicación.
- Identificador de portada para obtener su imagen.

**Justificación de la integración:**

La API se consume directamente desde el frontend React porque es pública y no requiere una clave de autenticación. Su finalidad es autocompletar el formulario de publicación, reduciendo la cantidad de información que debe ingresar manualmente el vendedor.

**Funcionamiento:**

1. El usuario busca un libro mediante Open Library.
2. Selecciona un resultado utilizando el botón "Usar Datos para Publicar".
3. El formulario recibe automáticamente el título, la descripción, la portada y la categoría.
4. El vendedor completa los datos comerciales, como precio, stock y condición.
5. La publicación se envía a `POST /api/products` y se almacena en PostgreSQL.

**Manejo de errores:**

La consulta utiliza `AbortController` con un timeout de 8 segundos. Si Open Library no responde dentro de ese plazo, se cancela la solicitud y se muestra un mensaje para intentar nuevamente. También se manejan errores HTTP y fallos de conexión.

**Prueba realizada:**

Se buscó un libro de Harry Potter, se importaron sus datos, se publicó mediante el formulario y se verificó su almacenamiento en PostgreSQL con el ID 21.
