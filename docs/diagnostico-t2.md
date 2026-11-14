# Diagnóstico del Taller 2

Este documento analiza el prototipo React entregado en el Taller 2 y define qué se conserva, qué se modifica y qué se amplía para convertirlo en la plataforma Full Stack del Hito 3 (caso **Marketplace universitario**).

## 1. Punto de partida

El Taller 2 es una aplicación de una sola página construida con **React 18 + Vite 5 + Bootstrap 5.3 + Bootstrap Icons**. No tiene backend: los productos salen de un archivo JSON local y todo lo que cambia el usuario (publicaciones, carrito y favoritos) se guarda en el `localStorage` del navegador. La única fuente de datos externa es la API pública de Open Library.

La base visual es buena y se mantiene; el trabajo del Hito 3 consiste en mover los datos y las reglas de negocio a una API propia sin perder la interfaz.

## 2. Inventario del código actual

| Archivo | Qué hace hoy |
| --- | --- |
| `frontend/src/main.jsx` | Monta `<App />` directamente, sin proveedores de contexto ni enrutador. |
| `frontend/src/App.jsx` | Concentra todo el estado (productos, carrito, favoritos, filtros, modales, toast), todos los handlers y el layout completo (hero, catálogo, footer). |
| `frontend/src/data/products.json` | 8 productos de ejemplo con campos en español (`nombre`, `precio`, `descripcion`, `imagen`, `categoria`, `vendedor`). Es la fuente principal del catálogo. |
| Constante `CATEGORIAS` en `frontend/src/App.jsx` | 6 categorías fijas (`libros`, `tecnologia`, `deportes`, `utiles`, `hogar`, `snacks`) más la opción "todas", cada una con su ícono de Bootstrap Icons. |
| `frontend/src/components/Navbar.jsx` | Logo, botones "Buscar Libros (API)" y "Publicar Producto", contadores de favoritos y carrito. |
| `frontend/src/components/Sidebar.jsx` | Búsqueda por texto, selección de categoría y rango de precios. |
| `frontend/src/components/ProductCard.jsx` | Tarjeta de producto con favorito, agregar al carrito, ver detalle y eliminar. |
| `frontend/src/components/ProductDetailModal.jsx` | Detalle del producto con el vendedor mostrado como texto libre. |
| `frontend/src/components/ProductFormModal.jsx` | Formulario de publicación con validaciones (título obligatorio, precio > 0, categoría obligatoria, descripción de al menos 10 caracteres, vendedor obligatorio). |
| `frontend/src/components/CartOffcanvas.jsx` | Panel lateral del carrito con selector de cantidad, eliminar, vaciar y botón de checkout. |
| `frontend/src/components/FavoritesOffcanvas.jsx` | Panel lateral de favoritos con opción de mover al carrito. |
| `frontend/src/components/BookSearchModal.jsx` + `frontend/src/services/openLibraryApi.js` | Búsqueda de libros en Open Library con estados de carga, error y sin resultados; permite autocompletar el formulario de publicación. |
| `frontend/src/context/CartContext.jsx` | Contexto de carrito con cantidades y control de stock en el cliente (ver sección 2.1). |
| `frontend/src/pages/CheckoutPage.jsx` | Página de checkout con resumen del pedido y formulario de pago simulado (ver sección 2.1). |
| `frontend/src/styles/styles.css` | Estilos institucionales (colores UNAB, tarjetas, offcanvas, modales). |

### 2.1 Estado de `CartContext` y `CheckoutPage`

Ambos archivos **existen pero todavía no están conectados a la aplicación**:

- `main.jsx` no envuelve la aplicación en `CartProvider`, por lo que el contexto nunca se activa. `App.jsx` sigue manejando su propio arreglo `cart` y se lo pasa por props a `CartOffcanvas`, que solo recurre al contexto cuando no recibe props.
- `CheckoutPage` no está enlazada desde ninguna parte: no hay rutas y el botón de checkout del carrito no tiene destino.
- Ambos **simulan el pedido en el cliente**. `CartContext` valida el stock con un valor por defecto (999), ya que los productos de `products.json` no tienen campo `stock`. `CheckoutPage` arma un pedido y una transacción con IDs aleatorios después de un `setTimeout`, aplica la regla "tarjeta terminada en `0000` = rechazada" en el navegador y vacía el carrito local. No se guarda nada en un servidor ni se descuenta stock.

Lo que sí sirve de estos archivos es la forma de los datos: ya usan los nombres de la API del Hito 3 (`quantity`, `unitPrice`, `status`, `method: "simulado"`, `aprobada` / `rechazada`) y la interfaz de cantidades y pago se puede conservar al conectarla al backend.

## 3. Qué se conserva

| Elemento | Motivo |
| --- | --- |
| Stack de frontend (React 18, Vite 5, Bootstrap 5.3, Bootstrap Icons) | Funciona y el equipo lo conoce; no hay razón para cambiarlo. |
| Componentes visuales: `Navbar`, `Sidebar`, `ProductCard`, `ProductDetailModal`, `ProductFormModal`, `CartOffcanvas`, `FavoritesOffcanvas`, `BookSearchModal` | La interfaz cumple; solo cambia de dónde vienen los datos. |
| `styles.css` e imágenes | Identidad visual del marketplace. |
| Validaciones de `ProductFormModal` | Se mantienen en el frontend y se replican en el backend (descripción ≥ 10 caracteres, precio > 0, categoría obligatoria). |
| Integración con Open Library (`openLibraryApi.js` + `BookSearchModal`) | Ya maneja carga, error y vacío. Se mantiene en el frontend porque no requiere clave y solo autocompleta el formulario de publicación; se le agrega un tiempo de espera máximo. |
| Las 6 categorías y sus íconos | Se reutilizan los mismos identificadores (`slug`) e íconos, pero almacenados en la base de datos. |
| Los 8 productos de `products.json` | Pasan a los datos de prueba (seed) de PostgreSQL. |
| Estado vacío del catálogo y toast de notificaciones | Se extraen como componentes reutilizables. |
| Interfaz de cantidades del carrito y de pago de `CartOffcanvas` / `CheckoutPage` | Se conecta a la API en vez de calcular en el cliente. |

## 4. Qué se modifica

| Qué hay hoy | Problema para el Hito 3 | Cambio |
| --- | --- | --- |
| `products.json` importado en `App.jsx` como fuente del catálogo | Datos fijos en el frontend como fuente principal, lo que el enunciado no permite. | Los productos se guardan en PostgreSQL y se obtienen con `GET /api/products`. El archivo se elimina. |
| Productos, carrito y favoritos en `localStorage` | No hay persistencia real ni datos compartidos entre usuarios o navegadores. | Se reemplazan por llamadas a `/api/products`, `/api/cart` y `/api/favorites`. En `localStorage` solo queda el token de sesión. |
| Constante `CATEGORIAS` en `App.jsx` | Categorías fijas en el código. | Tabla `categories` y `GET /api/categories`. |
| Campos en español (`nombre`, `precio`, `imagen`, `categoria`) | No coinciden con la convención de la API (campos en inglés). | Se usan `title`, `price`, `description`, `imageUrl`, `categoryId`; los textos de la interfaz siguen en español. |
| Campo `vendedor` como texto libre (ej. "Juan Pérez (Ingeniería Civil Informática)") | No existen usuarios: cualquiera puede publicar a nombre de otro y borrar cualquier producto. | `sellerId` con clave foránea a `users`; el vendedor se toma del usuario autenticado y solo el dueño puede editar o desactivar su producto. El campo "vendedor" desaparece del formulario. |
| Eliminar producto lo quita del arreglo | Se pierde el registro y romperá pedidos antiguos que lo referencien. | Borrado lógico (`isActive = false`). |
| `App.jsx` concentra estado, filtros y todos los handlers | Archivo difícil de mantener y de trabajar en paralelo. | Se separa en `pages/` (una por ruta), `context/` (sesión y carrito) y `services/` (un archivo por recurso de la API). |
| Sin rutas: una sola página con modales y paneles laterales | No hay lugar para Login, Mis compras, Mis ventas, Mensajes o Perfil. | Se agrega React Router 6 con las páginas nuevas; catálogo, carrito y favoritos se mantienen visualmente. |
| Filtrado con `useMemo` sobre todo el arreglo en el cliente | No escala cuando los datos vienen del servidor. | Búsqueda, filtros, orden y paginación como parámetros de `GET /api/products`. |
| Carrito sin stock real; `CartContext` y `CheckoutPage` sin conectar y simulando el pedido en el navegador | No hay pedidos reales, no se descuenta stock y la transacción no queda registrada. | El carrito se guarda en el servidor; el checkout crea un pedido real (`POST /api/orders`) y luego registra el pago simulado (`POST /api/orders/:id/pay`). El stock se valida y descuenta en el backend. |
| `window.confirm` para eliminar y vaciar el carrito | Diálogos del navegador, inconsistentes con el resto de la interfaz. | Diálogo de confirmación propio con Bootstrap. |
| Productos sin `stock` ni `condition` | No se puede controlar disponibilidad ni informar el estado del artículo. | Campos `stock` (entero ≥ 0) y `condition` (`nuevo` / `usado`) en el formulario y en la base. |

## 5. Qué se amplía

| Ampliación | Descripción |
| --- | --- |
| Backend propio | API REST con NestJS 10 organizada en controladores, servicios, DTO, entidades y configuración, con validaciones y un formato de error común. |
| Base de datos relacional | PostgreSQL 16 con TypeORM y migraciones: usuarios, categorías, productos, favoritos, carrito, pedidos, detalle de pedidos y transacciones. |
| Base de datos documental | MongoDB 7 para las conversaciones comprador–vendedor y el historial de actividad del usuario. |
| Usuarios y autenticación | Registro, inicio de sesión con JWT, contraseñas cifradas con bcrypt y roles `buyer`, `seller` y `admin`. Un usuario pasa a ser vendedor al publicar su primer producto y puede seguir comprando. |
| Perfiles | Perfil propio editable y perfil público de vendedor con sus productos activos. |
| Pedidos y estados | Pedido creado desde el carrito dentro de una transacción SQL, con estados `pendiente` → `pagado` → `enviado` / `listo_retiro` → `entregado` y cancelación antes del envío (devuelve el stock). |
| Transacciones simuladas | Pago con número de tarjeta de 16 dígitos registrado en la tabla `transactions` como `aprobada` o `rechazada`. |
| Chat comprador–vendedor | Conversación por producto entre comprador y vendedor; hoy esta funcionalidad no existe en el prototipo. |
| Historial de actividad | Registro de productos vistos, búsquedas y cambios de pedidos; sección "Vistos recientemente". |
| Documentación de la API | Swagger/OpenAPI en `/api/docs`. |
| Ejecución con Docker Compose | Frontend, backend, PostgreSQL y MongoDB levantados con un solo comando, con datos de prueba cargados automáticamente. |
| Estados de interfaz | Carga, error, vacío y éxito en cada página, usando componentes comunes. |

## 6. Cobertura de las funcionalidades obligatorias

| Funcionalidad obligatoria | En el Taller 2 | En el Hito 3 |
| --- | --- | --- |
| Usuarios y perfiles de comprador/vendedor | No existe; el vendedor es un texto libre. | Registro, login, roles, perfil propio, perfil público de vendedor, "Mis compras" y "Mis ventas". |
| Publicación y administración de productos | Publicar y eliminar en `localStorage`, sin dueño. | CRUD en PostgreSQL; solo el dueño edita o desactiva; página "Mis publicaciones". |
| Categorías, búsqueda y filtros | Categorías fijas y filtrado en el cliente. | Categorías en base de datos (administradas por el administrador) y búsqueda, filtros, orden y paginación en el backend. |
| Favoritos y carrito | En `localStorage`, carrito sin cantidades reales en la app. | Persistidos por usuario en PostgreSQL; carrito con cantidades y validación de stock. |
| Creación y seguimiento de pedidos | No existe ("comprar" no genera nada). | Pedido real desde el carrito y seguimiento desde las vistas de comprador y vendedor. |
| Estados de pedidos y transacciones simuladas | Solo una simulación en el cliente, no conectada. | Estados con transiciones validadas en el backend y transacciones registradas en la base de datos. |
