const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  BadRequestException,
  ConflictException,
} = require('@nestjs/common');
const { CartItem } = require('../dist/cart/entities/cart-item.entity');
const { Product } = require('../dist/products/entities/product.entity');
const { Order } = require('../dist/orders/entities/order.entity');
const { OrderItem } = require('../dist/orders/entities/order-item.entity');
const { OrderStatus } = require('../dist/orders/entities/order.entity');
const { OrdersService } = require('../dist/orders/orders.service');

function createQueryBuilder(rows) {
  const query = {
    where: () => query,
    orderBy: () => query,
    setLock: () => query,
    leftJoin: () => query,
    addSelect: () => query,
    andWhere: () => query,
    getMany: async () => rows,
    getOne: async () => rows,
  };
  return query;
}

function createService(repositories, activityLog = async () => undefined) {
  const manager = {
    getRepository(entity) {
      const repository = repositories.get(entity);
      if (!repository) {
        throw new Error(`No hay repositorio simulado para ${entity.name}`);
      }
      return repository;
    },
  };

  const dataSource = {
    transaction: (callback) => callback(manager),
  };

  return new OrdersService({}, {}, {}, dataSource, { log: activityLog });
}

async function assertHttpError(promise, ErrorType, statusCode) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof ErrorType);
    assert.equal(error.getStatus(), statusCode);
    return true;
  });
}

test('rechaza crear un pedido con el carrito vacío', async () => {
  const cartRepository = {
    createQueryBuilder: () => createQueryBuilder([]),
  };
  const service = createService(new Map([[CartItem, cartRepository]]));

  await assertHttpError(
    service.createFromCart(4),
    BadRequestException,
    400,
  );
});

test('rechaza crear un pedido cuando el stock ya no alcanza', async () => {
  const cartRepository = {
    createQueryBuilder: () =>
      createQueryBuilder([{ productId: 12, quantity: 2 }]),
  };
  const productRepository = {
    findOne: async () => ({ id: 12, title: 'Libro', stock: 1 }),
  };
  const service = createService(
    new Map([
      [CartItem, cartRepository],
      [Product, productRepository],
    ]),
  );

  await assertHttpError(
    service.createFromCart(4),
    ConflictException,
    409,
  );
});

test('rechaza una transición de pendiente a entregado', async () => {
  const orderRepository = {
    findOne: async () => ({
      id: 21,
      buyerId: 4,
      status: OrderStatus.PENDING,
    }),
  };
  const orderItemsRepository = {
    find: async () => [{ sellerId: 8 }],
  };
  const service = createService(
    new Map([
      [Order, orderRepository],
      [OrderItem, orderItemsRepository],
    ]),
  );

  await assertHttpError(
    service.updateStatus(21, 8, OrderStatus.DELIVERED),
    ConflictException,
    409,
  );
});

test('restaura el stock al cancelar un pedido pagado', async () => {
  const order = {
    id: 21,
    buyerId: 4,
    status: OrderStatus.PAID,
  };
  const product = { id: 12, stock: 3 };
  let savedProducts;
  let activityEntry;

  const orderRepository = {
    findOne: async () => order,
    save: async (value) => value,
  };
  const orderItemsRepository = {
    find: async () => [
      { orderId: 21, productId: 12, sellerId: 8, quantity: 2 },
    ],
    createQueryBuilder: () => createQueryBuilder([]),
  };
  const productRepository = {
    findOne: async () => product,
    save: async (values) => {
      savedProducts = values;
      return values;
    },
  };
  const service = createService(
    new Map([
      [Order, orderRepository],
      [OrderItem, orderItemsRepository],
      [Product, productRepository],
    ]),
    async (entry) => {
      activityEntry = entry;
    },
  );

  const updatedOrder = await service.updateStatus(
    21,
    4,
    OrderStatus.CANCELLED,
  );

  assert.equal(product.stock, 5);
  assert.deepEqual(savedProducts, [product]);
  assert.equal(updatedOrder.status, OrderStatus.CANCELLED);
  assert.equal(activityEntry.orderId, 21);
  assert.equal(activityEntry.meta.status, OrderStatus.CANCELLED);
});
