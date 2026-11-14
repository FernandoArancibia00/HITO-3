# Historias de usuario

Este documento define los actores del Marketplace UNAB y las historias de usuario que guían el desarrollo del Hito 3. Cada historia tiene una prioridad y un criterio de aceptación que permite verificarla en la demostración.

## 1. Actores

| Actor | Descripción |
| --- | --- |
| **Comprador** | Estudiante de la UNAB registrado en la plataforma. Busca productos, los guarda en favoritos, los agrega al carrito, crea pedidos, realiza pagos simulados y conversa con los vendedores. Todo usuario nuevo parte con este rol (`buyer`). |
| **Vendedor** | Estudiante que publica productos. Un usuario pasa a ser vendedor (`seller`) automáticamente al publicar su primer producto y **sigue pudiendo comprar**: el mismo usuario puede actuar como comprador y como vendedor. Administra sus publicaciones y atiende los pedidos que contienen sus productos. |
| **Administrador** | Usuario creado en los datos iniciales (`admin`). Gestiona las categorías del catálogo. |

Los visitantes sin sesión pueden ver el catálogo, el detalle de un producto y el perfil público de un vendedor, pero deben iniciar sesión para usar favoritos, carrito, pedidos, mensajes o publicar.

**Prioridades**

- **Alta:** imprescindible para cumplir las funcionalidades obligatorias y la demostración.
- **Media:** completa una funcionalidad obligatoria o mejora notablemente la experiencia.
- **Baja:** valor agregado; se puede recortar si falta tiempo sin afectar el alcance mínimo.

## 2. Resumen

| ID | Actor | Historia | Prioridad |
| --- | --- | --- | --- |
| HU01 | Comprador | Registrarse e iniciar sesión | Alta |
| HU02 | Comprador / Vendedor | Editar su perfil | Media |
| HU03 | Comprador | Ver el perfil público de un vendedor | Media |
| HU04 | Vendedor | Publicar un producto | Alta |
| HU05 | Vendedor | Autocompletar un libro desde Open Library | Media |
| HU06 | Vendedor | Editar y desactivar sus publicaciones | Alta |
| HU07 | Administrador | Gestionar categorías | Media |
| HU08 | Comprador | Buscar, filtrar y ordenar productos | Alta |
| HU09 | Comprador | Guardar productos en favoritos | Media |
| HU10 | Comprador | Agregar productos al carrito con cantidad | Alta |
| HU11 | Comprador | Crear un pedido y pagarlo en modo simulado | Alta |
| HU12 | Comprador | Revisar sus compras y cancelar un pedido | Alta |
| HU13 | Vendedor | Revisar sus ventas y actualizar el estado del pedido | Alta |
| HU14 | Comprador | Conversar con el vendedor de un producto | Alta |
| HU15 | Comprador | Ver los productos vistos recientemente | Baja |

Total: 9 historias de prioridad Alta, 5 de prioridad Media y 1 de prioridad Baja.

## 3. Detalle de las historias

### Usuarios y perfiles

**HU01 · Registro e inicio de sesión** — Prioridad: **Alta**

Como **comprador** quiero **registrarme con mi correo y luego iniciar sesión** para **comprar, guardar favoritos y comunicarme con los vendedores**.

*Criterio de aceptación:* el registro pide nombre, correo y contraseña (mínimo 8 caracteres), y opcionalmente carrera, campus y teléfono. Un correo ya registrado muestra un mensaje de error. Al registrarse o iniciar sesión, el usuario queda con la sesión abierta y su nombre aparece en la barra de navegación. Con credenciales incorrectas se muestra un mensaje genérico, sin indicar cuál dato falló.

**HU02 · Edición del perfil** — Prioridad: **Media**

Como **comprador o vendedor** quiero **editar mi nombre, carrera, campus y teléfono** para **que los demás estudiantes sepan quién soy y cómo coordinar la entrega**.

*Criterio de aceptación:* los cambios se guardan y se mantienen al volver a iniciar sesión. El correo y el rol no se pueden modificar desde el perfil.

**HU03 · Perfil público del vendedor** — Prioridad: **Media**

Como **comprador** quiero **ver el perfil de un vendedor con sus otras publicaciones** para **conocer su carrera y campus y decidir si le compro**.

*Criterio de aceptación:* desde el detalle de un producto se llega al perfil del vendedor, que muestra nombre, carrera, campus y sus productos activos. El perfil nunca muestra el correo ni datos de la contraseña.

### Publicación y administración de productos

**HU04 · Publicar un producto** — Prioridad: **Alta**

Como **vendedor** quiero **publicar un producto con título, descripción, precio, stock, condición (nuevo o usado), imagen y categoría** para **ofrecerlo a otros estudiantes**.

*Criterio de aceptación:* el formulario valida que el precio sea un entero mayor a 0, el stock un entero mayor o igual a 0, la descripción tenga al menos 10 caracteres y la categoría sea obligatoria. El vendedor se toma del usuario conectado (no se escribe a mano). Al publicar su primer producto, el usuario pasa a tener rol de vendedor. El producto aparece en el catálogo para otros usuarios en otro navegador.

**HU05 · Autocompletar un libro desde Open Library** — Prioridad: **Media**

Como **vendedor** quiero **buscar un libro en Open Library y usar sus datos en el formulario** para **publicar libros universitarios más rápido y con su portada**.

*Criterio de aceptación:* la búsqueda muestra estados de carga, sin resultados y error (incluido cuando Open Library no responde a tiempo). Al elegir un libro se abre el formulario de publicación con el título, la descripción y la portada ya completados, y la publicación termina guardándose en el catálogo.

**HU06 · Administrar mis publicaciones** — Prioridad: **Alta**

Como **vendedor** quiero **ver mis publicaciones, editarlas y desactivarlas** para **mantener actualizados el precio y el stock y retirar lo que ya no vendo**.

*Criterio de aceptación:* la página "Mis publicaciones" lista todos mis productos, incluidos los desactivados. Desactivar pide confirmación y el producto deja de aparecer en el catálogo, pero sigue existiendo en los pedidos antiguos. Un usuario no puede editar ni desactivar productos de otro: no ve los botones y, si lo intenta directamente contra la API, recibe un error de permisos.

### Categorías, búsqueda y filtros

**HU07 · Gestionar categorías** — Prioridad: **Media**

Como **administrador** quiero **crear, renombrar y eliminar categorías** para **mantener ordenado el catálogo**.

*Criterio de aceptación:* solo el administrador puede crear, editar o eliminar categorías. No se puede crear una categoría con un identificador o nombre repetido, ni eliminar una categoría que tenga productos asociados. Las categorías se muestran en la barra lateral con su ícono.

**HU08 · Buscar, filtrar y ordenar productos** — Prioridad: **Alta**

Como **comprador** quiero **buscar por texto y filtrar por categoría, rango de precio y condición, ordenando por más recientes o por precio** para **encontrar rápido lo que necesito**.

*Criterio de aceptación:* la búsqueda considera el título, la descripción y el nombre del vendedor. Los filtros se pueden combinar y limpiar. Solo se muestran productos activos y con stock. Si el precio mínimo es mayor que el máximo se muestra un error. Los resultados se cargan por páginas y, si no hay coincidencias, se muestra un mensaje de "sin resultados".

### Favoritos y carrito

**HU09 · Favoritos** — Prioridad: **Media**

Como **comprador** quiero **marcar productos como favoritos** para **revisarlos después sin tener que buscarlos de nuevo**.

*Criterio de aceptación:* el corazón de la tarjeta agrega o quita el producto de favoritos y el contador de la barra de navegación se actualiza. Los favoritos se mantienen al cerrar sesión y al entrar desde otro navegador. Un producto no puede estar dos veces en favoritos. Sin sesión, el corazón lleva al inicio de sesión.

**HU10 · Carrito con cantidades** — Prioridad: **Alta**

Como **comprador** quiero **agregar productos al carrito indicando la cantidad** para **comprar varios artículos en un solo pedido**.

*Criterio de aceptación:* agregar un producto que ya está en el carrito suma la cantidad. No se puede pedir más unidades que el stock disponible ni agregar productos propios; en ambos casos se muestra un mensaje con el motivo. Se puede cambiar la cantidad, eliminar un producto o vaciar el carrito. El total lo calcula el servidor y el carrito se mantiene entre sesiones.

### Creación y seguimiento de pedidos

**HU11 · Crear un pedido y pagarlo** — Prioridad: **Alta**

Como **comprador** quiero **confirmar mi carrito como pedido y pagarlo con una tarjeta simulada** para **concretar la compra**.

*Criterio de aceptación:* al confirmar se crea un pedido en estado `pendiente` con el precio de cada producto al momento de la compra; el stock se descuenta y el carrito queda vacío. Si otro usuario compró las últimas unidades antes, se muestra un error indicando qué producto ya no tiene stock y no se crea nada. El pago pide un número de 16 dígitos: si termina en `0000` la transacción queda `rechazada` y el pedido sigue `pendiente`; en otro caso queda `aprobada` y el pedido pasa a `pagado`. Un pedido ya pagado no se puede pagar de nuevo.

**HU12 · Mis compras y cancelación** — Prioridad: **Alta**

Como **comprador** quiero **ver mis pedidos con su estado y poder cancelarlos antes del envío** para **hacer seguimiento de mis compras y corregir un error**.

*Criterio de aceptación:* la página "Mis compras" lista mis pedidos con el estado como etiqueta de color. El detalle muestra productos, total, la línea de tiempo de estados y las transacciones. Puedo cancelar un pedido `pendiente` o `pagado` (con confirmación), y al cancelarlo el stock vuelve a estar disponible. No puedo ver pedidos de otros usuarios.

### Estados de pedidos y transacciones simuladas

**HU13 · Mis ventas y cambio de estado** — Prioridad: **Alta**

Como **vendedor** quiero **ver los pedidos que incluyen mis productos y actualizar su estado** para **informar al comprador cuándo lo envío, cuándo está listo para retiro y cuándo se entregó**.

*Criterio de aceptación:* la página "Mis ventas" muestra solo los productos propios de cada pedido. Los estados avanzan en el orden `pendiente` → `pagado` → `enviado` o `listo_retiro` → `entregado`; cualquier salto fuera de ese orden (por ejemplo, de `pendiente` a `entregado`) se rechaza con un mensaje. El comprador ve el nuevo estado al revisar su pedido desde otro navegador.

### Conversaciones e historial de interacción

**HU14 · Chat con el vendedor** — Prioridad: **Alta**

Como **comprador** quiero **enviar mensajes al vendedor desde el detalle de un producto** para **resolver dudas y coordinar la entrega en el campus**.

*Criterio de aceptación:* el botón "Contactar al vendedor" abre la conversación de ese producto o la crea si no existía. No se puede abrir una conversación con uno mismo. La bandeja "Mensajes" muestra las conversaciones ordenadas por el último mensaje, con el producto, la otra persona y la cantidad de mensajes no leídos. Los mensajes tienen entre 1 y 1000 caracteres, se actualizan periódicamente y solo los participantes pueden leerlos.

**HU15 · Vistos recientemente** — Prioridad: **Baja**

Como **comprador** quiero **ver los últimos productos que revisé** para **volver a ellos sin buscarlos otra vez**.

*Criterio de aceptación:* con sesión iniciada, el inicio muestra una sección "Vistos recientemente" con hasta 10 productos, sin repetidos y del más reciente al más antiguo. El perfil incluye una pestaña "Mi actividad" con el historial de vistas, búsquedas y cambios de pedidos.

## 4. Cobertura de las funcionalidades obligatorias

| Funcionalidad obligatoria del caso | Historias |
| --- | --- |
| Usuarios y perfiles de comprador/vendedor | HU01, HU02, HU03, HU12, HU13 |
| Publicación y administración de productos | HU04, HU05, HU06 |
| Categorías, búsqueda y filtros | HU07, HU08 |
| Favoritos y carrito | HU09, HU10 |
| Creación y seguimiento de pedidos | HU11, HU12 |
| Estados de pedidos y transacciones simuladas | HU11, HU13 |
| Persistencia NoSQL (conversaciones e historial de interacción) | HU14, HU15 |

Las páginas "Mis compras" (HU12) y "Mis ventas" (HU13) son, respectivamente, el perfil de comprador y el perfil de vendedor que pide el caso.
