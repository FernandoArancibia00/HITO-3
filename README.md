# Marketplace UNAB — Hito 3

Plataforma web Full Stack del Marketplace Universitario (Desarrollo Web y Móvil, segundo semestre 2026).
Continúa el prototipo React del Taller 2 y lo amplía con backend propio, PostgreSQL, MongoDB y Swagger.

## Integrantes

- Felipe Briceño
- Javier Leiva
- Damian Acevedo
- Fernando Arancibia

## Estructura

```
frontend/   React + Vite (base: prototipo del Taller 2)
backend/    API REST con NestJS, TypeORM y Mongoose
docs/       Diagramas, contrato de endpoints, uso de IA
```


## Instalación y ejecución del proyecto

### Requisitos previos

Para ejecutar Marketplace UNAB se necesita:

- Git.
- Docker Desktop instalado y en ejecución.
- Conexión a Internet para descargar las imágenes y dependencias necesarias.

No es necesario instalar PostgreSQL ni MongoDB por separado, ya que ambos se ejecutan mediante Docker.

### 1. Clonar el repositorio

```bash
git clone https://github.com/FernandoArancibia00/HITO-3.git
cd HITO-3
```

### 2. Configurar las variables de entorno

El proyecto utiliza variables de entorno para configurar las bases de datos, la autenticación, los puertos y la comunicación entre frontend y backend.

El archivo `docker-compose.yml` incluye valores predeterminados para desarrollo local. Se recomienda configurar un archivo `.env` en la raíz del proyecto, especialmente para establecer un `JWT_SECRET` propio.

### 3. Iniciar todos los servicios

Desde la carpeta raíz del proyecto, ejecutar:

```bash
docker compose up -d --build
```

Docker construirá e iniciará automáticamente los cuatro servicios:

- `postgres`: base de datos relacional.
- `mongo`: base de datos documental.
- `backend`: API REST desarrollada con NestJS.
- `frontend`: interfaz web desarrollada con React y Vite.

### 4. Acceder a la aplicación

Una vez iniciados los servicios:

| Recurso | Dirección |
|---|---|
| Marketplace UNAB | http://localhost:5173 |
| API REST | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |
| Comprobación de servicios | http://localhost:3000/api/health |

### 5. Comprobar los contenedores

```bash
docker compose ps
```

Este comando muestra el estado de los servicios.

### 6. Detener la aplicación

```bash
docker compose down
```

Los datos almacenados en PostgreSQL y MongoDB se conservan mediante los volúmenes `postgres_data` y `mongo_data`.

**Importante:** ejecutar `docker compose down -v` también elimina los volúmenes, lo que puede provocar la pérdida de los datos locales.


## Configuración de variables de entorno

El proyecto utiliza un archivo `.env` para configurar la conexión entre los servicios, la autenticación y los puertos de desarrollo.

Se incluye `.env.example` como plantilla de configuración.

### Crear el archivo .env

Desde la raíz del proyecto, en PowerShell:

```powershell
Copy-Item .env.example .env
```

En Linux o macOS:

```bash
cp .env.example .env
```

### Variables disponibles

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API NestJS. Por defecto, `3000`. |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. |
| `MONGO_URI` | Cadena de conexión a MongoDB. |
| `JWT_SECRET` | Clave secreta utilizada para firmar tokens de autenticación. |
| `JWT_EXPIRES_IN` | Tiempo de expiración de los tokens JWT. Por defecto, `1d`. |
| `CORS_ORIGIN` | Origen autorizado para realizar solicitudes al backend. |
| `POSTGRES_USER` | Usuario de PostgreSQL. |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL. |
| `POSTGRES_DB` | Nombre de la base de datos PostgreSQL. |
| `VITE_API_URL` | Dirección de la API utilizada por React. |

### Configuración de desarrollo con Docker

En la configuración proporcionada:

- PostgreSQL utiliza el nombre de servicio `postgres` y el puerto `5432`.
- MongoDB utiliza el nombre de servicio `mongo` y el puerto `27017`.
- El backend se ejecuta en `http://localhost:3000`.
- El frontend se ejecuta en `http://localhost:5173`.
- El frontend consulta la API mediante `http://localhost:3000/api`.

Los nombres `postgres` y `mongo` permiten que los contenedores se comuniquen dentro de la red de Docker.

### Consideraciones de seguridad

Los valores presentes en `.env.example` corresponden a un entorno de desarrollo local.

Antes de utilizar el proyecto en un entorno público, se deben establecer contraseñas seguras y reemplazar el valor predeterminado de `JWT_SECRET`.

El archivo `.env` no debe subirse al repositorio, ya que puede contener credenciales privadas.


## Flujo de trabajo

- `main`: versión entregable. Solo recibe merges desde `release/*`.
- `develop`: integración del equipo. Rama por defecto.
- `feature/<area>-<tarea>`: una rama por tarea, entra a `develop` por Pull Request revisado.


## Arquitectura del sistema

Marketplace UNAB utiliza una arquitectura Full Stack basada en una interfaz web React, una API REST NestJS y dos sistemas de almacenamiento de datos.

### Tecnologías utilizadas

| Componente | Tecnología | Función |
|---|---|---|
| Frontend | React 18 + Vite 5 | Interfaz web del Marketplace |
| Backend | NestJS 10 | API REST y lógica de negocio |
| Base de datos relacional | PostgreSQL 16 | Almacenamiento de entidades y relaciones |
| ORM | TypeORM | Acceso a PostgreSQL |
| Base de datos documental | MongoDB 7 | Almacenamiento documental |
| ODM | Mongoose | Acceso a MongoDB |
| Contenedores | Docker Compose | Ejecución integrada de los servicios |
| Documentación API | Swagger | Consulta y prueba de endpoints |
| API externa | Open Library | Búsqueda de información bibliográfica |

### Comunicación entre componentes

1. El usuario interactúa con la aplicación React desde el navegador.
2. El frontend realiza solicitudes HTTP a la API REST de NestJS.
3. El backend procesa las solicitudes mediante controladores y servicios.
4. PostgreSQL almacena los datos relacionales utilizando TypeORM.
5. MongoDB proporciona almacenamiento documental mediante Mongoose.
6. Open Library permite consultar libros y completar automáticamente los datos de publicación.

Los cuatro servicios principales se ejecutan mediante Docker Compose.

### Módulos del backend

El backend organiza sus funcionalidades en los siguientes módulos, registrados en `AppModule`:

| Módulo | Responsabilidad |
|---|---|
| `HealthModule` | Comprobación del estado de los servicios |
| `UsersModule` | Gestión de usuarios |
| `AuthModule` | Autenticación |
| `CategoriesModule` | Gestión de categorías |
| `ProductsModule` | Gestión de publicaciones |
| `FavoritesModule` | Gestión de favoritos |
| `CartModule` | Gestión del carrito de compras |
| `OrdersModule` | Gestión de pedidos |
| `ConversationsModule` | Conversaciones entre usuarios |
| `ActivityModule` | Registro de actividad |

### Persistencia de datos

El proyecto utiliza dos sistemas de almacenamiento:

**PostgreSQL:** base de datos relacional gestionada mediante TypeORM. La opción `synchronize: false` evita la sincronización automática del esquema, permitiendo controlar sus cambios mediante migraciones.

**MongoDB:** base de datos documental conectada mediante Mongoose.

La conexión a ambas bases de datos se configura mediante las variables `DATABASE_URL` y `MONGO_URI`, respectivamente.


## Funcionalidades del Marketplace

Marketplace UNAB es una plataforma web orientada a la compraventa de productos entre integrantes de la comunidad universitaria.

El frontend está desarrollado con React y utiliza React Router para gestionar la navegación entre las diferentes páginas.

### Funcionalidades de acceso público

| Funcionalidad | Ruta | Descripción |
|---|---|---|
| Página principal | `/` | Acceso al catálogo del Marketplace. |
| Detalle de producto | `/products/:id` | Página de información de un producto. |
| Inicio de sesión | `/login` | Acceso a una cuenta existente. |
| Registro | `/register` | Creación de una cuenta de usuario. |
| Perfil del vendedor | `/users/:id` | Visualización del perfil público de un vendedor. |

### Funcionalidades para usuarios autenticados

| Funcionalidad | Ruta | Descripción |
|---|---|---|
| Carrito de compras | `/cart` | Interfaz para gestionar productos seleccionados. |
| Checkout | `/checkout` | Interfaz para procesar una compra. |
| Mis pedidos | `/orders` | Consulta de pedidos del comprador. |
| Detalle de pedido | `/orders/:id` | Información de un pedido específico. |
| Mis ventas | `/sales` | Consulta de ventas del usuario. |
| Mis publicaciones | `/my-products` | Gestión de productos publicados. |
| Mensajes | `/messages` | Acceso a las conversaciones del usuario. |
| Conversación | `/messages/:id` | Visualización de una conversación específica. |
| Mi perfil | `/profile` | Información del perfil personal. |

### Protección de rutas

La aplicación utiliza el componente `ProtectedRoute` para restringir el acceso a las páginas que requieren una sesión iniciada.

Cuando un usuario intenta acceder a una de estas rutas sin autenticación, es redirigido a `/login`.

El estado de autenticación se gestiona mediante `AuthProvider`, mientras que el carrito utiliza `CartProvider`.

### Integración con Open Library

Desde la sección de publicaciones, el usuario puede buscar información bibliográfica mediante Open Library y utilizar los resultados para completar el formulario de un producto.

Esta integración se documenta detalladamente en la sección "Integración con API pública — Open Library (T06)".

### Alcance de la documentación

Las rutas y páginas anteriores están definidas en `frontend/src/App.jsx`. Su existencia no sustituye las pruebas funcionales, que deben realizarse antes de la entrega final.


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


## Endpoints de la API REST

El backend de Marketplace UNAB expone una API REST desarrollada con NestJS.

**URL base:** `http://localhost:3000/api`

**Documentación interactiva:** http://localhost:3000/api/docs

### Autenticación y usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/register` | Registrar un usuario. |
| POST | `/auth/login` | Iniciar sesión. |
| GET | `/users/me` | Consultar el perfil propio. |
| PATCH | `/users/me` | Actualizar el perfil propio. |
| GET | `/users/:id` | Consultar un usuario por ID. |

### Productos y categorías

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/products` | Consultar productos. |
| GET | `/products/mine` | Consultar publicaciones propias. |
| GET | `/products/:id` | Consultar un producto por ID. |
| POST | `/products` | Crear una publicación. |
| PATCH | `/products/:id` | Actualizar una publicación. |
| DELETE | `/products/:id` | Eliminar una publicación. |
| GET | `/categories` | Consultar categorías. |
| POST | `/categories` | Crear una categoría. |
| PATCH | `/categories/:id` | Actualizar una categoría. |
| DELETE | `/categories/:id` | Eliminar una categoría. |

### Favoritos y carrito

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/favorites` | Consultar favoritos. |
| POST | `/favorites/:productId` | Agregar un producto a favoritos. |
| DELETE | `/favorites/:productId` | Quitar un producto de favoritos. |
| GET | `/cart` | Consultar el carrito. |
| POST | `/cart` | Agregar un producto al carrito. |
| PATCH | `/cart/:itemId` | Actualizar un elemento del carrito. |
| DELETE | `/cart/:itemId` | Eliminar un elemento del carrito. |
| DELETE | `/cart` | Vaciar el carrito. |

### Pedidos y ventas

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/orders` | Crear un pedido. |
| GET | `/orders` | Consultar pedidos. |
| GET | `/orders/sales` | Consultar ventas. |
| GET | `/orders/:id` | Consultar un pedido por ID. |
| PATCH | `/orders/:id/status` | Actualizar el estado de un pedido. |
| POST | `/orders/:id/pay` | Procesar el pago de un pedido. |

### Conversaciones y actividad

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/conversations` | Consultar conversaciones. |
| POST | `/conversations` | Crear una conversación. |
| GET | `/conversations/:id/messages` | Consultar mensajes de una conversación. |
| POST | `/conversations/:id/messages` | Enviar un mensaje. |
| GET | `/activity/me/recent-products` | Consultar productos recientes del usuario. |
| GET | `/activity/me` | Consultar la actividad del usuario. |

### Estado de los servicios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Comprobar el estado del backend y sus conexiones. |

### Autenticación y validación

Algunos endpoints requieren autenticación mediante JWT. Los requisitos de acceso, parámetros, cuerpos de solicitud y respuestas deben consultarse en Swagger.

Las rutas anteriores se identificaron en los controladores NestJS del proyecto. Su disponibilidad efectiva se comprobará durante las pruebas finales de integración.


## Base de datos, migraciones y datos iniciales

Marketplace UNAB utiliza PostgreSQL 16 como base de datos relacional y TypeORM para gestionar las entidades y sus relaciones.

### Migraciones

El proyecto utiliza migraciones para crear y actualizar la estructura de PostgreSQL.

La configuración de TypeORM establece `synchronize: false`, por lo que los cambios del esquema se gestionan mediante migraciones en lugar de sincronización automática.

Los archivos se encuentran en:

`backend/src/database/migrations/`

### Datos iniciales (seed)

El proyecto incluye un script de carga de datos de prueba:

`backend/src/database/seeds/seed.ts`

Este mecanismo permite preparar información inicial para probar las funcionalidades del Marketplace.

### Inicialización automática con Docker

Al ejecutar:

```bash
docker compose up -d --build
```

El contenedor del backend realiza automáticamente las siguientes operaciones:

1. Ejecuta las migraciones pendientes con `npm run migration:run`.
2. Ejecuta el script de datos iniciales con `npm run seed`.
3. Inicia la API REST de NestJS.

Estas operaciones están configuradas en `backend/Dockerfile`.

Por lo tanto, no es necesario ejecutar manualmente las migraciones ni el seed durante la instalación habitual con Docker.

### Comandos disponibles para desarrollo

Los siguientes comandos se encuentran definidos en `backend/package.json`:

| Comando | Descripción |
|---|---|
| `npm run build` | Compila el backend NestJS. |
| `npm run migration:generate` | Genera una migración de TypeORM. |
| `npm run migration:run` | Ejecuta migraciones pendientes. |
| `npm run seed` | Ejecuta el script de datos iniciales. |
| `npm test` | Compila el backend y ejecuta las pruebas automatizadas de pedidos. |

Para utilizar manualmente las migraciones o el seed es necesario contar con el backend compilado y las variables de conexión correctamente configuradas.

### Persistencia de PostgreSQL

Docker Compose utiliza el volumen `postgres_data` para conservar la información de PostgreSQL entre reinicios de los contenedores.

El comando `docker compose down` detiene y elimina los contenedores, pero conserva los volúmenes.

El comando `docker compose down -v` también elimina los volúmenes y puede provocar la pérdida de los datos almacenados localmente.



## Documentación complementaria

El proyecto cuenta con documentación técnica y funcional en la carpeta `docs/`, que complementa la información presentada en este README.

| Documento | Contenido |
|---|---|
| [Diagnóstico del Taller 2](docs/diagnostico-t2.md) | Análisis del prototipo original y cambios necesarios para convertirlo en una aplicación Full Stack. |
| [Diseño de la API REST](docs/endpoints.md) | Contrato de endpoints, métodos HTTP, autenticación, solicitudes, respuestas y errores. |
| [Historias de usuario](docs/historias-usuario.md) | Actores, prioridades y criterios de aceptación del Marketplace. |
| [Modelo entidad-relación](docs/modelo-er.md) | Diseño de las tablas y relaciones de PostgreSQL. |
| [Mapa de navegación](docs/navegacion.md) | Rutas del frontend y navegación entre las páginas. |
| [Diseño NoSQL](docs/nosql.md) | Justificación del uso de MongoDB y diseño de las colecciones de conversaciones y actividad. |

### Pruebas con Postman

Se incluye la siguiente colección para comprobar reglas de negocio del backend:

[Pruebas T27 — Colección Postman](docs/pruebas/t27-business-rules.postman_collection.json)

La colección permite verificar distintos escenarios de carrito, pedidos, pagos simulados y control de stock.

### Documentación interactiva

Con el backend en ejecución, Swagger permite explorar la API REST:

http://localhost:3000/api/docs


## Limitaciones y consideraciones del sistema

Marketplace UNAB corresponde a un proyecto académico Full Stack desarrollado para el Hito 3 de Desarrollo Web y Móvil.

### Limitaciones conocidas

- **Pagos simulados:** el sistema permite procesar estados de pago dentro de la aplicación, pero no realiza transacciones bancarias reales.
- **Dependencia de Open Library:** la búsqueda bibliográfica requiere conexión a Internet y disponibilidad del servicio externo.
- **Entorno local:** la configuración documentada está orientada a ejecutar el proyecto mediante Docker Compose en un equipo de desarrollo.
- **Credenciales de desarrollo:** los valores de `.env.example` son referenciales y deben reemplazarse por credenciales seguras antes de cualquier despliegue público.

### Validaciones pendientes para la entrega

Antes de publicar la versión final, se deben comprobar:

1. El funcionamiento completo de las compras, ventas y pagos simulados.
2. La comunicación entre los módulos del frontend y backend.
3. La persistencia de datos después de reiniciar los contenedores.
4. La activación del timeout de 8 segundos de Open Library ante una respuesta lenta.
5. La ejecución exitosa de las pruebas automatizadas y compilaciones finales.

Estas verificaciones forman parte del proceso de integración y preparación de la entrega final del proyecto.


## Pruebas y verificación del sistema

Marketplace UNAB cuenta con comandos de compilación, pruebas automatizadas del backend y verificaciones manuales para comprobar el funcionamiento de la aplicación.

### 1. Compilación del frontend

Desde la raíz del proyecto, instalar las dependencias si todavía no están disponibles:

```powershell
npm --prefix frontend ci
```

Ejecutar la compilación de producción:

```powershell
npm --prefix frontend run build
```

Una compilación exitosa permite comprobar que Vite puede generar los archivos de producción del frontend. Esto no reemplaza las pruebas funcionales.

### 2. Pruebas automatizadas del backend

Desde la raíz del proyecto:

```powershell
npm --prefix backend test
```

El comando compila NestJS y ejecuta las pruebas automatizadas definidas en `backend/test/orders.service.test.js`.

Las pruebas incluyen validaciones de reglas de negocio relacionadas con pedidos, stock y cambios de estado.

### 3. Verificación de los servicios Docker

Iniciar el proyecto:

```powershell
docker compose up -d --build
```

Comprobar el estado de los contenedores:

```powershell
docker compose ps
```

Consultar el endpoint de salud:

`http://localhost:3000/api/health`

Este endpoint permite comprobar el estado del backend y sus conexiones.

### 4. Pruebas funcionales manuales

Durante las pruebas de integración se deben verificar los siguientes escenarios:

| Área | Verificación |
|---|---|
| Autenticación | Registrar un usuario e iniciar sesión. |
| Catálogo | Consultar productos y aplicar filtros. |
| Publicaciones | Crear, editar y consultar productos. |
| Open Library | Buscar libros y utilizar sus datos para publicar. |
| Favoritos | Agregar y quitar productos de favoritos. |
| Carrito | Agregar productos, modificar cantidades y eliminarlos. |
| Pedidos | Crear pedidos y consultar sus detalles. |
| Pagos simulados | Verificar los resultados de pago previstos por el sistema. |
| Ventas | Consultar pedidos asociados al vendedor. |
| Mensajería | Iniciar conversaciones y enviar mensajes. |
| Perfil | Consultar y actualizar la información del usuario. |

Esta tabla corresponde a un plan de comprobación y no implica que todos los escenarios hayan sido validados.

### 5. Prueba de la API REST

Con el backend en ejecución, acceder a:

`http://localhost:3000/api/docs`

Swagger permite consultar los endpoints, sus parámetros y los esquemas de solicitud y respuesta.

Las pruebas específicas de reglas de negocio se describen en la siguiente sección.


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


## Uso de inteligencia artificial

Durante el desarrollo del Marketplace UNAB, el equipo acordó utilizar inteligencia artificial únicamente como herramienta de apoyo en tres situaciones:

- **Uso de consola:** orientación para ejecutar comandos y comprender errores de terminal.
- **Verificaciones:** apoyo para revisar resultados, identificar posibles problemas y comprobar el funcionamiento del proyecto.
- **Estructura básica:** orientación para organizar inicialmente archivos, documentación y componentes.

### Experiencia de los integrantes

**Felipe Briceño:** Utilicé ChatGPT principalmente para orientarme con comandos de consola, verificar configuraciones y organizar la documentación. Me permitió avanzar de manera más ordenada, comprobando los resultados directamente en el proyecto.

**Javier Leiva:** La IA me sirvió como apoyo para organizar estructuras iniciales y resolver dudas puntuales al trabajar con la terminal. Las sugerencias se revisaron antes de aplicarlas.

**Damian Acevedo:** Recurrí a la IA para aclarar comandos y ordenar algunos pasos de verificación. Fue útil como referencia, pero las comprobaciones se realizaron directamente en el proyecto.

**Fernando Arancibia:** Utilicé la IA para consultar comandos y organizar estructuras básicas durante el trabajo. Me ayudó a despejar dudas, manteniendo la revisión de los resultados como parte del proceso.

### Criterio de uso

La inteligencia artificial se utilizó como herramienta complementaria y no como sustituto del trabajo del equipo. La implementación, las decisiones técnicas y la validación final quedaron bajo responsabilidad de los integrantes.