# Diseño de Colecciones y Justificación NoSQL (MongoDB)

## 1. Colecciones Implementadas

En el Marketplace UNAB, PostgreSQL gestiona toda la información transaccional y relacional (users, products, categories, favorites, cart_items, orders, order_items, transactions), mientras que MongoDB almacena las conversaciones entre comprador y vendedor (conversations) y la bitácora de actividad del usuario (activity_logs).

---

### 1.1 Colección: conversations

Almacena cada hilo de conversación iniciado por un comprador interesado en un producto específico, junto con el arreglo embebido de mensajes intercambiados entre el comprador y el vendedor.

Ejemplo de documento:
{
  "_id": "67363a90f1a2b3c4d5e6f7a8",
  "productId": 12,
  "buyerId": 4,
  "sellerId": 7,
  "messages": [
    {
      "senderId": 4,
      "text": "¿Sigue disponible?",
      "sentAt": "2026-11-12T15:02:00.000Z",
      "read": false
    },
    {
      "senderId": 7,
      "text": "¡Hola! Sí, entrego en campus Casona.",
      "sentAt": "2026-11-12T15:05:10.000Z",
      "read": true
    }
  ],
  "lastMessageAt": "2026-11-12T15:05:10.000Z",
  "createdAt": "2026-11-12T15:02:00.000Z"
}

Nota: Al exponer el documento en la API REST, _id se transforma y entrega como id en formato string.

Índices:
- Índice compuesto único { productId: 1, buyerId: 1 } (unique: true): Garantiza a nivel de base de datos que un comprador no pueda abrir dos conversaciones duplicadas sobre el mismo producto. Si vuelve a contactar al vendedor desde el producto, se reutiliza la conversación existente.
- Índice de consulta { buyerId: 1, lastMessageAt: -1 } y { sellerId: 1, lastMessageAt: -1 }: Optimiza el endpoint GET /api/conversations para listar la bandeja de entrada del usuario ordenada desde el mensaje más reciente al más antiguo.

Funcionalidad que la utiliza:
- Chat comprador–vendedor (POST /api/conversations, GET /api/conversations, GET /api/conversations/:id/messages, POST /api/conversations/:id/messages): Permite que desde el detalle de un producto el comprador pulse "Contactar al vendedor", envíe consultas sobre stock o lugar de entrega en el campus y reciba respuestas con contador de mensajes no leídos (unreadCount).

---

### 1.2 Colección: activity_logs

Registra eventos de navegación e interacción de los usuarios dentro de la plataforma para alimentar el historial personal y la sección de productos vistos recientemente.

Ejemplo de documento:
{
  "_id": "67363b12f1a2b3c4d5e6f7b9",
  "userId": 4,
  "type": "product_view",
  "productId": 12,
  "orderId": null,
  "meta": {
    "search": "calculadora"
  },
  "createdAt": "2026-11-12T15:00:00.000Z"
}

Tipos de eventos soportados (type):
- product_view: El usuario visualizó el detalle de un producto.
- search: El usuario realizó una búsqueda o filtrado en el catálogo (guardando los términos en meta).
- favorite_added: El usuario marcó un producto como favorito.
- order_created: El usuario generó un nuevo pedido.
- order_status_changed: Cambio de estado en un pedido (pagado, enviado, listo_retiro, entregado, cancelado).

Índices:
- Índice compuesto { userId: 1, createdAt: -1 }: Permite recuperar rápidamente la línea de tiempo de actividad del usuario conectado en GET /api/activity/me.
- Índice compuesto { userId: 1, type: 1, createdAt: -1 }: Acelera la obtención de los últimos 10 productos vistos sin repetir en GET /api/activity/me/recent-products.

Funcionalidad que la utiliza:
- Vistos recientemente en HomePage (GET /api/activity/me/recent-products): Muestra al usuario conectado los últimos productos que revisó.
- Pestaña "Mi actividad" en ProfilePage (GET /api/activity/me): Muestra la línea de tiempo de acciones realizadas por el usuario.

---

## 2. Justificación del Modelo Documental (Por qué MongoDB y no SQL)

1. Lectura atómica de mensajes embebidos (Localidad de datos):
   En un chat comprador–vendedor, los mensajes se agregan continuamente ($push) y se leen siempre juntos como una conversación completa. Guardarlos como un arreglo de subdocumentos dentro de conversations permite recuperar todo el historial del chat en una sola lectura de disco sin ejecutar JOIN costosos entre tablas.
2. Esquema flexible y polimórfico (meta en activity_logs):
   Cada tipo de evento en activity_logs requiere metadatos distintos: una búsqueda guarda { search, category }, un cambio de estado de pedido guarda { previousStatus, newStatus }, y una vista de producto no requiere metadatos adicionales. El campo meta aprovecha la flexibilidad nativa de BSON sin obligar a crear decenas de columnas NULL en una tabla SQL.
3. Alta frecuencia de escritura sin bloqueo transaccional:
   Las vistas de productos y búsquedas ocurren en cada clic del usuario. Al delegar estos registros a MongoDB de forma asíncrona (tolerante a fallos sin interrumpir las transacciones ACID de PostgreSQL), evitamos sobrecargar el motor relacional que procesa el stock y los pagos.

---

## 3. Ausencia de Duplicación de Datos entre PostgreSQL y MongoDB

El diseño respeta estrictamente la separación de responsabilidades:
- MongoDB solo almacena identificadores enteros (productId, buyerId, sellerId, userId, orderId) que apuntan a las claves primarias de PostgreSQL.
- Nunca se duplican nombres de usuarios, correos, títulos de productos, precios ni imágenes dentro de MongoDB. Si un vendedor actualiza el título o la foto de su producto en PostgreSQL, el listado de conversaciones en GET /api/conversations refleja el cambio de inmediato porque cruza los IDs en tiempo de consulta.
