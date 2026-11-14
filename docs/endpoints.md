# Diseño de la API REST

Este documento es el contrato entre el frontend y el backend del Marketplace UNAB. Describe cada endpoint con su método, ruta, autenticación, datos de entrada, respuesta exitosa y errores posibles. La documentación interactiva de la misma API está en Swagger: `http://localhost:3000/api/docs`.

## 1. Convenciones generales

| Tema | Regla |
| --- | --- |
| URL base | `http://localhost:3000/api`. Todas las rutas de este documento van bajo el prefijo `/api` (ej. `GET /products` = `GET http://localhost:3000/api/products`). |
| Nombres | Rutas y campos JSON en inglés y en camelCase. Los valores de estado van en español sin tildes (`pendiente`, `nuevo`, `aprobada`...). |
| IDs | Enteros autoincrementales de PostgreSQL. En MongoDB, `productId`, `buyerId`, `sellerId`, `userId` y `orderId` son esos mismos enteros. |
| Dinero | Pesos chilenos como entero, sin decimales (ej. `15000`). |
| Fechas | ISO 8601 en UTC (ej. `2026-11-12T15:02:00.000Z`). |
| Autenticación | Header `Authorization: Bearer <accessToken>`. El token dura 1 día y su contenido es `{ sub: userId, email, role }`. En este documento, 🔒 indica que el endpoint requiere token. |
| Roles | `buyer` (todo usuario nuevo), `seller` (al publicar su primer producto; sigue pudiendo comprar) y `admin` (solo en los datos iniciales). |
| Un recurso | Se devuelve el objeto directo, sin envoltorio. |
| Listas paginadas | `{ "data": [...], "total": 42, "page": 1, "limit": 12 }`. Por defecto `page=1` y `limit=12`; máximo `limit=50`. |
| Validación | Los campos que no están definidos en el body se rechazan con 400. |

### 1.1 Formato de error

Todos los errores tienen la misma forma:

```json
{
  "statusCode": 400,
  "message": "Stock insuficiente para 'Calculadora Científica Casio FX-991'",
  "error": "Bad Request"
}
```

Cuando la validación detecta varios problemas, `message` es un arreglo de textos; el frontend muestra el primero:

```json
{
  "statusCode": 400,
  "message": ["La descripción debe tener al menos 10 caracteres", "El precio debe ser mayor a 0"],
  "error": "Bad Request"
}
```

### 1.2 Códigos HTTP

| Código | Uso |
| --- | --- |
| 200 | Lectura o edición correcta. |
| 201 | Creación correcta. |
| 204 | Borrado correcto (sin cuerpo). |
| 400 | Error de validación o de regla de negocio. |
| 401 | Sin token, token inválido o expirado, o credenciales incorrectas. |
| 403 | Autenticado pero sin permiso (no es dueño, no es participante o no tiene el rol). |
| 404 | El recurso no existe. |
| 409 | Conflicto: dato duplicado, stock agotado al comprar o transición de estado inválida. |
| 500 | Error no controlado. Devuelve un mensaje genérico, sin detalles internos. |

## 2. Modelos de respuesta

Estos objetos se repiten en varios endpoints. El campo `passwordHash` nunca aparece en una respuesta.

**`AuthUser`** (respuesta de registro e inicio de sesión)

```json
{ "id": 9, "name": "Camila Rojas", "email": "camila.rojas@unab.cl", "role": "buyer", "career": "Ingeniería Comercial", "campus": "Casona" }
```

**`User`** (perfil propio)

```json
{
  "id": 2,
  "name": "Juan Pérez",
  "email": "vendedor1@unab.cl",
  "role": "seller",
  "career": "Ingeniería Civil Informática",
  "campus": "República",
  "phone": "+56912345678",
  "createdAt": "2026-11-10T12:00:00.000Z"
}
```

**`Category`**

```json
{ "id": 2, "slug": "tecnologia", "name": "Tecnología y Accesorios", "icon": "laptop" }
```

**`Product`** (incluye siempre los datos públicos del vendedor y la categoría)

```json
{
  "id": 2,
  "title": "Calculadora Científica Casio FX-991",
  "description": "Casi nueva, la vendo porque me regalaron otra. Batería operativa e incluye tapa protectora original.",
  "price": 15000,
  "stock": 1,
  "condition": "usado",
  "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp",
  "isActive": true,
  "sellerId": 3,
  "categoryId": 2,
  "createdAt": "2026-11-10T12:00:00.000Z",
  "updatedAt": "2026-11-10T12:00:00.000Z",
  "seller": { "id": 3, "name": "María González", "career": "Arquitectura", "campus": "Los Leones" },
  "category": { "id": 2, "slug": "tecnologia", "name": "Tecnología y Accesorios", "icon": "laptop" }
}
```

**`Cart`** (carrito completo; `total` lo calcula el backend)

```json
{
  "items": [
    { "id": 15, "quantity": 2, "product": { "...": "Product" } }
  ],
  "total": 30000
}
```

**`Order`**

```json
{
  "id": 21,
  "buyerId": 9,
  "total": 30000,
  "status": "pendiente",
  "createdAt": "2026-11-12T16:10:00.000Z",
  "updatedAt": "2026-11-12T16:10:00.000Z",
  "items": [
    {
      "id": 40,
      "orderId": 21,
      "productId": 2,
      "sellerId": 3,
      "quantity": 2,
      "unitPrice": 15000,
      "product": { "id": 2, "title": "Calculadora Científica Casio FX-991", "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp" }
    }
  ]
}
```

`unitPrice` es el precio al momento de la compra; no cambia aunque el vendedor edite el producto después.

**`Transaction`**

```json
{ "id": 7, "orderId": 21, "amount": 30000, "method": "simulado", "status": "aprobada", "createdAt": "2026-11-12T16:12:00.000Z" }
```

**`Message`**

```json
{ "senderId": 9, "text": "¿Sigue disponible?", "sentAt": "2026-11-12T15:02:00.000Z", "read": false }
```

**`Conversation`**

```json
{
  "id": "6733a1f0c2a4b5e8f1d2c3b4",
  "productId": 2,
  "buyerId": 9,
  "sellerId": 3,
  "messages": [ { "...": "Message" } ]
}
```

El `id` de una conversación es el `ObjectId` de MongoDB como texto.

### 2.1 Valores permitidos

| Campo | Valores |
| --- | --- |
| `User.role` | `buyer`, `seller`, `admin` |
| `Product.condition` | `nuevo`, `usado` |
| `Order.status` | `pendiente`, `pagado`, `enviado`, `listo_retiro`, `entregado`, `cancelado` |
| `Transaction.method` | `simulado` |
| `Transaction.status` | `aprobada`, `rechazada` |
| `activity_logs.type` | `product_view`, `search`, `favorite_added`, `order_created`, `order_status_changed` |

## 3. Resumen de endpoints

| Módulo | Método | Ruta | 🔒 | Respuesta exitosa |
| --- | --- | --- | --- | --- |
| Health | GET | `/health` | No | 200 `{ postgres, mongo }` |
| Auth | POST | `/auth/register` | No | 201 `{ accessToken, user }` |
| Auth | POST | `/auth/login` | No | 200 `{ accessToken, user }` |
| Users | GET | `/users/me` | Sí | 200 `User` |
| Users | PATCH | `/users/me` | Sí | 200 `User` |
| Users | GET | `/users/:id` | No | 200 perfil público con productos |
| Categories | GET | `/categories` | No | 200 `Category[]` |
| Categories | POST | `/categories` | Sí (admin) | 201 `Category` |
| Categories | PATCH | `/categories/:id` | Sí (admin) | 200 `Category` |
| Categories | DELETE | `/categories/:id` | Sí (admin) | 204 |
| Products | GET | `/products` | No | 200 paginado de `Product` |
| Products | GET | `/products/mine` | Sí | 200 `Product[]` |
| Products | GET | `/products/:id` | No | 200 `Product` |
| Products | POST | `/products` | Sí | 201 `Product` |
| Products | PATCH | `/products/:id` | Sí (dueño) | 200 `Product` |
| Products | DELETE | `/products/:id` | Sí (dueño) | 204 |
| Favorites | GET | `/favorites` | Sí | 200 `Product[]` |
| Favorites | POST | `/favorites/:productId` | Sí | 201 |
| Favorites | DELETE | `/favorites/:productId` | Sí | 204 |
| Cart | GET | `/cart` | Sí | 200 `Cart` |
| Cart | POST | `/cart` | Sí | 201 `Cart` |
| Cart | PATCH | `/cart/:itemId` | Sí | 200 `Cart` |
| Cart | DELETE | `/cart/:itemId` | Sí | 200 `Cart` |
| Cart | DELETE | `/cart` | Sí | 204 |
| Orders | POST | `/orders` | Sí | 201 `Order` |
| Orders | GET | `/orders` | Sí | 200 `Order[]` |
| Orders | GET | `/orders/sales` | Sí | 200 `Order[]` |
| Orders | GET | `/orders/:id` | Sí | 200 `Order` con `buyer` y `transactions` |
| Orders | PATCH | `/orders/:id/status` | Sí | 200 `Order` |
| Orders | POST | `/orders/:id/pay` | Sí | 201 `{ transaction, order }` |
| Conversations | GET | `/conversations` | Sí | 200 bandeja de conversaciones |
| Conversations | POST | `/conversations` | Sí | 201 (o 200 si ya existía) `Conversation` |
| Conversations | GET | `/conversations/:id/messages` | Sí | 200 `Conversation` |
| Conversations | POST | `/conversations/:id/messages` | Sí | 201 `Message` |
| Activity | GET | `/activity/me` | Sí | 200 arreglo de `activity_logs` |
| Activity | GET | `/activity/me/recent-products` | Sí | 200 `Product[]` |

En los controladores, las rutas fijas (`/products/mine`, `/orders/sales`, `/activity/me/recent-products`) se declaran antes de las rutas con parámetro (`/:id`).

Todos los endpoints con 🔒 responden **401** si falta el token, si no es válido o si expiró.

---

## 4. Health

### GET `/health`

| | |
| --- | --- |
| Autenticación | No |
| Body / query | — |
| Respuesta | **200** `{ "postgres": "ok", "mongo": "ok" }` |
| Errores | **500** error no controlado |

Verifica la conexión con PostgreSQL y MongoDB.

---

## 5. Auth

### POST `/auth/register`

| | |
| --- | --- |
| Autenticación | No |
| Body | `{ name, email, password, career?, campus?, phone? }` |
| Validaciones | `name` obligatorio; `email` con formato válido; `password` de al menos 8 caracteres; `career`, `campus` y `phone` texto opcional, sin formato obligatorio. |
| Respuesta | **201** `{ accessToken, user }`. El usuario se crea con rol `buyer`. |
| Errores | **400** datos inválidos · **409** el correo ya está registrado |

Request:

```json
{
  "name": "Camila Rojas",
  "email": "camila.rojas@unab.cl",
  "password": "Password123",
  "career": "Ingeniería Comercial",
  "campus": "Casona",
  "phone": "+56987654321"
}
```

Response **201**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 9,
    "name": "Camila Rojas",
    "email": "camila.rojas@unab.cl",
    "role": "buyer",
    "career": "Ingeniería Comercial",
    "campus": "Casona"
  }
}
```

### POST `/auth/login`

| | |
| --- | --- |
| Autenticación | No |
| Body | `{ email, password }` |
| Respuesta | **200** `{ accessToken, user }` |
| Errores | **400** datos inválidos · **401** credenciales inválidas (mensaje genérico, sin indicar si falló el correo o la contraseña) |

Request:

```json
{ "email": "comprador1@unab.cl", "password": "Password123" }
```

Response **200**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 6,
    "name": "Pedro Soto",
    "email": "comprador1@unab.cl",
    "role": "buyer",
    "career": "Psicología",
    "campus": "República"
  }
}
```

---

## 6. Users

### GET `/users/me` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** `User` del usuario conectado |
| Errores | **401** |

### PATCH `/users/me` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body | `{ name?, career?, campus?, phone? }` |
| Validaciones | `name`, si se envía, no puede estar vacío. `email` y `role` no se pueden modificar: enviarlos produce 400. |
| Respuesta | **200** `User` actualizado |
| Errores | **400** datos inválidos o campos no permitidos · **401** |

Request:

```json
{ "career": "Ingeniería Civil Informática", "campus": "República", "phone": "+56911112222" }
```

Response **200**:

```json
{
  "id": 6,
  "name": "Pedro Soto",
  "email": "comprador1@unab.cl",
  "role": "buyer",
  "career": "Ingeniería Civil Informática",
  "campus": "República",
  "phone": "+56911112222",
  "createdAt": "2026-11-10T12:00:00.000Z"
}
```

### GET `/users/:id`

| | |
| --- | --- |
| Autenticación | No |
| Parámetros | `id`: entero |
| Respuesta | **200** `{ id, name, career, campus, products: Product[] }` con solo los productos activos del usuario. No incluye correo, teléfono ni rol. |
| Errores | **400** `id` no numérico · **404** el usuario no existe |

Response **200**:

```json
{
  "id": 3,
  "name": "María González",
  "career": "Arquitectura",
  "campus": "Los Leones",
  "products": [ { "...": "Product" } ]
}
```

---

## 7. Categories

### GET `/categories`

| | |
| --- | --- |
| Autenticación | No |
| Body / query | — |
| Respuesta | **200** `Category[]` |
| Errores | — |

Response **200**:

```json
[
  { "id": 1, "slug": "libros", "name": "Apuntes y Libros Físicos", "icon": "book" },
  { "id": 2, "slug": "tecnologia", "name": "Tecnología y Accesorios", "icon": "laptop" },
  { "id": 3, "slug": "deportes", "name": "Deportes y Vida Sana", "icon": "trophy" },
  { "id": 4, "slug": "utiles", "name": "Útiles y Papelería", "icon": "pencil-square" },
  { "id": 5, "slug": "hogar", "name": "Artículos para el Hogar/Pieza", "icon": "house-door" },
  { "id": 6, "slug": "snacks", "name": "Snacks y Colaciones", "icon": "cup-hot" }
]
```

### POST `/categories` 🔒 admin

| | |
| --- | --- |
| Autenticación | Sí, rol `admin` |
| Body | `{ slug, name, icon }` |
| Validaciones | Los tres obligatorios. `icon` es el nombre de un ícono de Bootstrap Icons. |
| Respuesta | **201** `Category` |
| Errores | **400** datos inválidos · **401** · **403** no es administrador · **409** ya existe una categoría con ese `slug` o `name` |

Request:

```json
{ "slug": "ropa", "name": "Ropa y Accesorios", "icon": "bag" }
```

Response **201**:

```json
{ "id": 7, "slug": "ropa", "name": "Ropa y Accesorios", "icon": "bag" }
```

### PATCH `/categories/:id` 🔒 admin

| | |
| --- | --- |
| Autenticación | Sí, rol `admin` |
| Body | `{ name?, icon? }` (el `slug` no se modifica) |
| Respuesta | **200** `Category` |
| Errores | **400** datos inválidos · **401** · **403** no es administrador · **404** la categoría no existe · **409** ya existe otra categoría con ese `name` |

Request:

```json
{ "name": "Ropa, Calzado y Accesorios" }
```

Response **200**:

```json
{ "id": 7, "slug": "ropa", "name": "Ropa, Calzado y Accesorios", "icon": "bag" }
```

### DELETE `/categories/:id` 🔒 admin

| | |
| --- | --- |
| Autenticación | Sí, rol `admin` |
| Body / query | — |
| Respuesta | **204** sin cuerpo |
| Errores | **401** · **403** no es administrador · **404** la categoría no existe · **409** la categoría tiene productos asociados |

---

## 8. Products

### GET `/products`

| | |
| --- | --- |
| Autenticación | No |
| Query | `search`, `category`, `minPrice`, `maxPrice`, `condition`, `sort`, `page`, `limit` (todos opcionales) |
| Respuesta | **200** `{ data: Product[], total, page, limit }`. Solo productos activos (`isActive = true`) y con `stock > 0`. |
| Errores | **400** parámetros inválidos o `minPrice` mayor que `maxPrice` |

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| `search` | texto | Busca (sin distinguir mayúsculas) en el título, la descripción y el nombre del vendedor. |
| `category` | texto | `slug` de la categoría (ej. `tecnologia`). |
| `minPrice` / `maxPrice` | entero ≥ 0 | Rango de precio en CLP. `minPrice` debe ser menor o igual que `maxPrice`. |
| `condition` | `nuevo` \| `usado` | Estado del producto. |
| `sort` | `recent` \| `price_asc` \| `price_desc` | Orden: más recientes primero, precio ascendente o precio descendente. |
| `page` | entero ≥ 1 | Página; por defecto `1`. |
| `limit` | entero de 1 a 50 | Resultados por página; por defecto `12`. |

Ejemplo: `GET /products?search=calculadora&category=tecnologia&maxPrice=20000&sort=price_asc&page=1&limit=12`

Response **200**:

```json
{
  "data": [ { "...": "Product" } ],
  "total": 1,
  "page": 1,
  "limit": 12
}
```

### GET `/products/mine` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** `Product[]` del usuario conectado, **incluidos los inactivos** y los sin stock |
| Errores | **401** |

### GET `/products/:id`

| | |
| --- | --- |
| Autenticación | No |
| Parámetros | `id`: entero |
| Respuesta | **200** `Product` (con `seller` y `category`) |
| Errores | **400** `id` no numérico · **404** el producto no existe |

### POST `/products` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body | `{ title, description, price, stock, condition, imageUrl?, categoryId }` |
| Validaciones | `title` obligatorio; `description` de al menos 10 caracteres; `price` entero > 0; `stock` entero ≥ 0 (por defecto 1); `condition` `nuevo` o `usado`; `imageUrl` URL opcional; `categoryId` entero obligatorio. |
| Reglas | El vendedor (`sellerId`) se toma del token, nunca del body. Si el usuario tenía rol `buyer`, pasa a `seller`. |
| Respuesta | **201** `Product` |
| Errores | **400** datos inválidos · **401** · **404** la categoría no existe |

Request:

```json
{
  "title": "Calculadora Científica Casio FX-991",
  "description": "Casi nueva, la vendo porque me regalaron otra. Batería operativa e incluye tapa protectora original.",
  "price": 15000,
  "stock": 1,
  "condition": "usado",
  "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp",
  "categoryId": 2
}
```

Response **201**:

```json
{
  "id": 21,
  "title": "Calculadora Científica Casio FX-991",
  "description": "Casi nueva, la vendo porque me regalaron otra. Batería operativa e incluye tapa protectora original.",
  "price": 15000,
  "stock": 1,
  "condition": "usado",
  "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp",
  "isActive": true,
  "sellerId": 3,
  "categoryId": 2,
  "createdAt": "2026-11-12T14:30:00.000Z",
  "updatedAt": "2026-11-12T14:30:00.000Z",
  "seller": { "id": 3, "name": "María González", "career": "Arquitectura", "campus": "Los Leones" },
  "category": { "id": 2, "slug": "tecnologia", "name": "Tecnología y Accesorios", "icon": "laptop" }
}
```

### PATCH `/products/:id` 🔒 dueño

| | |
| --- | --- |
| Autenticación | Sí, solo el dueño del producto |
| Body | Los mismos campos de `POST /products`, todos opcionales, con las mismas validaciones |
| Respuesta | **200** `Product` actualizado |
| Errores | **400** datos inválidos · **401** · **403** el producto no es del usuario · **404** el producto o la categoría no existen |

Request:

```json
{ "price": 12000, "stock": 2 }
```

Response **200**:

```json
{
  "id": 21,
  "title": "Calculadora Científica Casio FX-991",
  "description": "Casi nueva, la vendo porque me regalaron otra. Batería operativa e incluye tapa protectora original.",
  "price": 12000,
  "stock": 2,
  "condition": "usado",
  "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp",
  "isActive": true,
  "sellerId": 3,
  "categoryId": 2,
  "createdAt": "2026-11-12T14:30:00.000Z",
  "updatedAt": "2026-11-12T18:05:00.000Z",
  "seller": { "id": 3, "name": "María González", "career": "Arquitectura", "campus": "Los Leones" },
  "category": { "id": 2, "slug": "tecnologia", "name": "Tecnología y Accesorios", "icon": "laptop" }
}
```

### DELETE `/products/:id` 🔒 dueño

| | |
| --- | --- |
| Autenticación | Sí, solo el dueño del producto |
| Body / query | — |
| Reglas | Borrado lógico: el producto queda con `isActive = false`, deja de aparecer en el catálogo y se conserva en los pedidos antiguos. |
| Respuesta | **204** sin cuerpo |
| Errores | **401** · **403** el producto no es del usuario · **404** el producto no existe |

---

## 9. Favorites

### GET `/favorites` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** `Product[]` marcados como favoritos por el usuario |
| Errores | **401** |

### POST `/favorites/:productId` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Parámetros | `productId`: entero |
| Respuesta | **201** sin cuerpo |
| Errores | **401** · **404** el producto no existe o está inactivo · **409** el producto ya está en favoritos |

### DELETE `/favorites/:productId` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Parámetros | `productId`: entero |
| Respuesta | **204** sin cuerpo |
| Errores | **401** · **404** el producto no está en los favoritos del usuario |

---

## 10. Cart

### GET `/cart` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** `Cart` (`{ items: [{ id, quantity, product }], total }`) |
| Errores | **401** |

### POST `/cart` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body | `{ productId, quantity }` |
| Validaciones | `productId` entero; `quantity` entero ≥ 1. |
| Reglas | Si el producto ya está en el carrito, se suma la cantidad. La cantidad total no puede superar el stock. No se pueden agregar productos propios. |
| Respuesta | **201** `Cart` completo |
| Errores | **400** datos inválidos, stock insuficiente o producto propio · **401** · **404** el producto no existe o está inactivo |

Request:

```json
{ "productId": 2, "quantity": 2 }
```

Response **201**:

```json
{
  "items": [
    {
      "id": 15,
      "quantity": 2,
      "product": {
        "id": 2,
        "title": "Calculadora Científica Casio FX-991",
        "description": "Casi nueva, la vendo porque me regalaron otra. Batería operativa e incluye tapa protectora original.",
        "price": 15000,
        "stock": 3,
        "condition": "usado",
        "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp",
        "isActive": true,
        "sellerId": 3,
        "categoryId": 2,
        "createdAt": "2026-11-10T12:00:00.000Z",
        "updatedAt": "2026-11-10T12:00:00.000Z",
        "seller": { "id": 3, "name": "María González", "career": "Arquitectura", "campus": "Los Leones" },
        "category": { "id": 2, "slug": "tecnologia", "name": "Tecnología y Accesorios", "icon": "laptop" }
      }
    }
  ],
  "total": 30000
}
```

Error **400** por stock:

```json
{ "statusCode": 400, "message": "Stock insuficiente para 'Calculadora Científica Casio FX-991'", "error": "Bad Request" }
```

### PATCH `/cart/:itemId` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Parámetros | `itemId`: entero (id del ítem del carrito, no del producto) |
| Body | `{ quantity }` (entero ≥ 1, menor o igual al stock) |
| Respuesta | **200** `Cart` completo |
| Errores | **400** cantidad inválida o stock insuficiente · **401** · **404** el ítem no existe en el carrito del usuario |

Request:

```json
{ "quantity": 1 }
```

Response **200**:

```json
{
  "items": [
    { "id": 15, "quantity": 1, "product": { "...": "Product" } }
  ],
  "total": 15000
}
```

### DELETE `/cart/:itemId` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Parámetros | `itemId`: entero |
| Respuesta | **200** `Cart` completo sin ese ítem |
| Errores | **401** · **404** el ítem no existe en el carrito del usuario |

### DELETE `/cart` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **204** sin cuerpo (carrito vaciado) |
| Errores | **401** |

---

## 11. Orders

### Estados del pedido

| Desde | Hacia | Quién |
| --- | --- | --- |
| `pendiente` | `pagado` | Se asigna al aprobarse el pago (`POST /orders/:id/pay`) |
| `pendiente` | `cancelado` | Comprador |
| `pagado` | `enviado` o `listo_retiro` | Vendedor del pedido |
| `pagado` | `cancelado` | Comprador |
| `enviado` | `entregado` | Vendedor del pedido |
| `listo_retiro` | `entregado` | Vendedor del pedido |

Cualquier otra transición se rechaza con **409**. Cancelar un pedido devuelve el stock de sus productos (dentro de una transacción SQL).

### POST `/orders` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body | — (usa el carrito del usuario) |
| Reglas | Dentro de una transacción SQL: vuelve a validar el stock, crea el pedido en estado `pendiente`, crea los ítems copiando el precio actual en `unitPrice`, descuenta el stock y vacía el carrito. Si algo falla, no se guarda nada. |
| Respuesta | **201** `Order` con `items` |
| Errores | **400** el carrito está vacío · **401** · **409** stock insuficiente al momento de comprar (el mensaje indica qué producto) |

Response **201**:

```json
{
  "id": 21,
  "buyerId": 9,
  "total": 30000,
  "status": "pendiente",
  "createdAt": "2026-11-12T16:10:00.000Z",
  "updatedAt": "2026-11-12T16:10:00.000Z",
  "items": [
    {
      "id": 40,
      "orderId": 21,
      "productId": 2,
      "sellerId": 3,
      "quantity": 2,
      "unitPrice": 15000,
      "product": { "id": 2, "title": "Calculadora Científica Casio FX-991", "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp" }
    }
  ]
}
```

Error **409**:

```json
{ "statusCode": 409, "message": "Stock insuficiente para 'Calculadora Científica Casio FX-991'", "error": "Conflict" }
```

### GET `/orders` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** `Order[]` con `items`: las compras del usuario conectado, de la más reciente a la más antigua |
| Errores | **401** |

### GET `/orders/sales` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** `Order[]` que contienen productos del usuario conectado; cada pedido incluye **solo los ítems de ese vendedor** |
| Errores | **401** |

### GET `/orders/:id` 🔒

| | |
| --- | --- |
| Autenticación | Sí, solo el comprador o un vendedor con productos en ese pedido |
| Parámetros | `id`: entero |
| Respuesta | **200** `Order` con `items`, `buyer` y `transactions` |
| Errores | **400** `id` no numérico · **401** · **403** el usuario no participa en el pedido · **404** el pedido no existe |

Response **200**:

```json
{
  "id": 21,
  "buyerId": 9,
  "total": 30000,
  "status": "pagado",
  "createdAt": "2026-11-12T16:10:00.000Z",
  "updatedAt": "2026-11-12T16:12:00.000Z",
  "items": [ { "...": "OrderItem" } ],
  "buyer": { "id": 9, "name": "Camila Rojas", "career": "Ingeniería Comercial", "campus": "Casona" },
  "transactions": [
    { "id": 6, "orderId": 21, "amount": 30000, "method": "simulado", "status": "rechazada", "createdAt": "2026-11-12T16:11:00.000Z" },
    { "id": 7, "orderId": 21, "amount": 30000, "method": "simulado", "status": "aprobada", "createdAt": "2026-11-12T16:12:00.000Z" }
  ]
}
```

### PATCH `/orders/:id/status` 🔒

| | |
| --- | --- |
| Autenticación | Sí, comprador o vendedor del pedido según la tabla de estados |
| Body | `{ status }` |
| Validaciones | `status` debe ser uno de los valores de `Order.status`. |
| Reglas | Solo se permiten las transiciones de la tabla de estados. Cada cambio queda registrado en el historial de actividad. |
| Respuesta | **200** `Order` actualizado |
| Errores | **400** `status` inválido · **401** · **403** el usuario no participa en el pedido o su rol no puede hacer ese cambio · **404** el pedido no existe · **409** transición no válida |

Request:

```json
{ "status": "enviado" }
```

Response **200**:

```json
{
  "id": 21,
  "buyerId": 9,
  "total": 30000,
  "status": "enviado",
  "createdAt": "2026-11-12T16:10:00.000Z",
  "updatedAt": "2026-11-13T10:00:00.000Z",
  "items": [ { "...": "OrderItem" } ]
}
```

Error **409** (ej. de `pendiente` a `entregado`):

```json
{ "statusCode": 409, "message": "No se puede cambiar el pedido de 'pendiente' a 'entregado'", "error": "Conflict" }
```

### POST `/orders/:id/pay` 🔒

| | |
| --- | --- |
| Autenticación | Sí, solo el comprador del pedido |
| Body | `{ cardNumber }` |
| Validaciones | `cardNumber`: exactamente 16 dígitos. |
| Reglas | Pago simulado: si `cardNumber` termina en `0000` la transacción queda `rechazada` y el pedido sigue `pendiente`; en otro caso queda `aprobada` y el pedido pasa a `pagado`. En ambos casos se registra la transacción. Solo se puede pagar un pedido `pendiente`. |
| Respuesta | **201** `{ transaction, order }` |
| Errores | **400** número de tarjeta inválido · **401** · **403** el usuario no es el comprador · **404** el pedido no existe · **409** el pedido no está `pendiente` (ya pagado o cancelado) |

Request:

```json
{ "cardNumber": "4500123456789012" }
```

Response **201** (aprobada):

```json
{
  "transaction": { "id": 7, "orderId": 21, "amount": 30000, "method": "simulado", "status": "aprobada", "createdAt": "2026-11-12T16:12:00.000Z" },
  "order": {
    "id": 21,
    "buyerId": 9,
    "total": 30000,
    "status": "pagado",
    "createdAt": "2026-11-12T16:10:00.000Z",
    "updatedAt": "2026-11-12T16:12:00.000Z",
    "items": [ { "...": "OrderItem" } ]
  }
}
```

Con `"cardNumber": "4500123456780000"` la respuesta es igual, pero con `transaction.status = "rechazada"` y `order.status = "pendiente"`.

---

## 12. Conversations

Las conversaciones se guardan en MongoDB (colección `conversations`). Solo los participantes (comprador y vendedor) pueden leerlas o escribir en ellas.

### GET `/conversations` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** conversaciones del usuario (como comprador o como vendedor), ordenadas por el último mensaje |
| Errores | **401** |

Response **200**:

```json
[
  {
    "id": "6733a1f0c2a4b5e8f1d2c3b4",
    "product": { "id": 2, "title": "Calculadora Científica Casio FX-991", "imageUrl": "https://calculadoras-production.s3.sa-east-1.amazonaws.com/images/991ESPLUSNEGRA.webp" },
    "otherUser": { "id": 3, "name": "María González" },
    "lastMessage": "Sí, la puedo entregar el jueves en el campus.",
    "lastMessageAt": "2026-11-12T15:10:00.000Z",
    "unreadCount": 1
  }
]
```

### POST `/conversations` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body | `{ productId }` |
| Reglas | El vendedor se obtiene del producto. Si ya existe una conversación del usuario sobre ese producto, se devuelve la existente. No se puede abrir una conversación sobre un producto propio. |
| Respuesta | **201** `Conversation` nueva, o **200** si ya existía |
| Errores | **400** datos inválidos o producto propio · **401** · **404** el producto no existe |

Request:

```json
{ "productId": 2 }
```

Response **201**:

```json
{
  "id": "6733a1f0c2a4b5e8f1d2c3b4",
  "productId": 2,
  "buyerId": 9,
  "sellerId": 3,
  "messages": []
}
```

### GET `/conversations/:id/messages` 🔒

| | |
| --- | --- |
| Autenticación | Sí, solo participantes |
| Parámetros | `id`: id de la conversación |
| Reglas | Marca como leídos los mensajes recibidos por el usuario. |
| Respuesta | **200** `{ id, productId, buyerId, sellerId, messages }` |
| Errores | **401** · **403** el usuario no participa en la conversación · **404** la conversación no existe |

Response **200**:

```json
{
  "id": "6733a1f0c2a4b5e8f1d2c3b4",
  "productId": 2,
  "buyerId": 9,
  "sellerId": 3,
  "messages": [
    { "senderId": 9, "text": "¿Sigue disponible?", "sentAt": "2026-11-12T15:02:00.000Z", "read": true },
    { "senderId": 3, "text": "Sí, la puedo entregar el jueves en el campus.", "sentAt": "2026-11-12T15:10:00.000Z", "read": true }
  ]
}
```

### POST `/conversations/:id/messages` 🔒

| | |
| --- | --- |
| Autenticación | Sí, solo participantes |
| Body | `{ text }` |
| Validaciones | `text` entre 1 y 1000 caracteres. |
| Respuesta | **201** `Message` creado |
| Errores | **400** texto vacío o demasiado largo · **401** · **403** el usuario no participa en la conversación · **404** la conversación no existe |

Request:

```json
{ "text": "Perfecto, nos vemos el jueves a las 13:00 en la biblioteca." }
```

Response **201**:

```json
{ "senderId": 9, "text": "Perfecto, nos vemos el jueves a las 13:00 en la biblioteca.", "sentAt": "2026-11-12T15:15:00.000Z", "read": false }
```

---

## 13. Activity

El historial de actividad se guarda en MongoDB (colección `activity_logs`). Se registra al ver un producto, buscar, agregar un favorito, crear un pedido y cambiar el estado de un pedido.

### GET `/activity/me` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Query | `type` (opcional, uno de los valores de `activity_logs.type`) · `limit` (opcional, entero de 1 a 50, por defecto 20) |
| Respuesta | **200** arreglo de registros del usuario, del más reciente al más antiguo |
| Errores | **400** `type` o `limit` inválidos · **401** |

Ejemplo: `GET /activity/me?type=product_view&limit=20`

Response **200**:

```json
[
  {
    "id": "6733a2b1c2a4b5e8f1d2c3c9",
    "userId": 9,
    "type": "product_view",
    "productId": 2,
    "orderId": null,
    "meta": {},
    "createdAt": "2026-11-12T15:00:00.000Z"
  },
  {
    "id": "6733a2a0c2a4b5e8f1d2c3c8",
    "userId": 9,
    "type": "search",
    "productId": null,
    "orderId": null,
    "meta": { "search": "calculadora" },
    "createdAt": "2026-11-12T14:59:00.000Z"
  }
]
```

### GET `/activity/me/recent-products` 🔒

| | |
| --- | --- |
| Autenticación | Sí |
| Body / query | — |
| Respuesta | **200** `Product[]`: los últimos 10 productos vistos por el usuario, sin repetir, del más reciente al más antiguo |
| Errores | **401** |
