import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ActivityService } from '../activity/activity.service';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import {
  Transaction,
  TransactionMethod,
  TransactionStatus,
} from './entities/transaction.entity';

export type OrderResponse = Order & { items: OrderItem[] };
export type OrderDetailResponse = OrderResponse & {
  buyer: User;
  transactions: Transaction[];
};
export interface PaymentResponse {
  transaction: Transaction;
  order: OrderResponse;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [
    OrderStatus.SHIPPED,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
    private readonly activityService: ActivityService,
  ) {}

  async createFromCart(buyerId: number): Promise<OrderResponse> {
    return this.dataSource.transaction(async (manager) => {
      const cartRepository = manager.getRepository(CartItem);
      const cartItems = await cartRepository
        .createQueryBuilder('cartItem')
        .where('cartItem.userId = :buyerId', { buyerId })
        .orderBy('cartItem.productId', 'ASC')
        .setLock('pessimistic_write')
        .getMany();

      if (cartItems.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      const productRepository = manager.getRepository(Product);
      const products = new Map<number, Product>();
      const orderLines: { cartItem: CartItem; product: Product }[] = [];

      for (const cartItem of cartItems) {
        const product = await productRepository.findOne({
          where: { id: cartItem.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException('El producto del carrito no existe');
        }

        if (product.stock < cartItem.quantity) {
          throw new ConflictException(
            `Stock insuficiente para '${product.title}'`,
          );
        }

        products.set(product.id, product);
        orderLines.push({ cartItem, product });
      }

      const total = orderLines.reduce(
        (sum, { cartItem, product }) =>
          sum + product.price * cartItem.quantity,
        0,
      );

      const orderRepository = manager.getRepository(Order);
      const order = await orderRepository.save(
        orderRepository.create({
          buyerId,
          total,
          status: OrderStatus.PENDING,
        }),
      );

      const orderItemsRepository = manager.getRepository(OrderItem);
      const orderItems = orderLines.map(({ cartItem, product }) => {
        product.stock -= cartItem.quantity;

        return orderItemsRepository.create({
          orderId: order.id,
          productId: product.id,
          sellerId: product.sellerId,
          quantity: cartItem.quantity,
          unitPrice: product.price,
        });
      });

      await productRepository.save([...products.values()]);
      await orderItemsRepository.save(orderItems);
      await cartRepository.delete({ userId: buyerId });

      const items = await this.loadItems(
        [order.id],
        orderItemsRepository,
      );

      return Object.assign(order, { items });
    });
  }

  async findAll(buyerId: number): Promise<OrderResponse[]> {
    const orders = await this.ordersRepository.find({
      where: { buyerId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    return this.attachItems(orders, this.orderItemsRepository);
  }

  async findSales(sellerId: number): Promise<OrderResponse[]> {
    const sellerItems = await this.orderItemsRepository.find({
      select: { orderId: true },
      where: { sellerId },
    });
    const orderIds = [...new Set(sellerItems.map((item) => item.orderId))];

    if (orderIds.length === 0) {
      return [];
    }

    const orders = await this.ordersRepository.find({
      where: { id: In(orderIds) },
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    return this.attachItems(orders, this.orderItemsRepository, sellerId);
  }

  async findOne(id: number, userId: number): Promise<OrderDetailResponse> {
    const order = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.buyer', 'buyer')
      .addSelect(['buyer.id', 'buyer.name', 'buyer.career', 'buyer.campus'])
      .leftJoinAndSelect('order.transactions', 'transaction')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      throw new NotFoundException('El pedido no existe');
    }

    const items = await this.loadItems(
      [order.id],
      this.orderItemsRepository,
    );
    const isBuyer = order.buyerId === userId;
    const isSeller = items.some((item) => item.sellerId === userId);

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('No participas en este pedido');
    }

    return Object.assign(order, {
      items,
      buyer: order.buyer,
      transactions: order.transactions ?? [],
    });
  }

  async pay(
    id: number,
    buyerId: number,
    cardNumber: string,
  ): Promise<PaymentResponse> {
    const payment = await this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const order = await orderRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('El pedido no existe');
      }

      if (order.buyerId !== buyerId) {
        throw new ForbiddenException('Solo el comprador puede pagar el pedido');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new ConflictException(
          "Solo se puede pagar un pedido en estado 'pendiente'",
        );
      }

      const transactionRepository = manager.getRepository(Transaction);
      const status = cardNumber.endsWith('0000')
        ? TransactionStatus.REJECTED
        : TransactionStatus.APPROVED;
      const transaction = await transactionRepository.save(
        transactionRepository.create({
          orderId: order.id,
          amount: order.total,
          method: TransactionMethod.SIMULATED,
          status,
        }),
      );

      if (status === TransactionStatus.APPROVED) {
        order.status = OrderStatus.PAID;
        await orderRepository.save(order);
      }

      const items = await this.loadItems(
        [order.id],
        manager.getRepository(OrderItem),
      );

      return {
        transaction,
        order: Object.assign(order, { items }),
      };
    });

    if (payment.transaction.status === TransactionStatus.APPROVED) {
      void this.activityService.log({
        userId: buyerId,
        type: 'order_status_changed',
        orderId: id,
        meta: { status: OrderStatus.PAID },
      });
    }

    return payment;
  }

  async updateStatus(
    id: number,
    userId: number,
    status: OrderStatus,
  ): Promise<OrderResponse> {
    const updatedOrder = await this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const order = await orderRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('El pedido no existe');
      }

      const orderItemsRepository = manager.getRepository(OrderItem);
      const orderItems = await orderItemsRepository.find({
        where: { orderId: id },
        order: { productId: 'ASC' },
      });
      const isBuyer = order.buyerId === userId;
      const isSeller = orderItems.some((item) => item.sellerId === userId);

      if (!isBuyer && !isSeller) {
        throw new ForbiddenException('No participas en este pedido');
      }

      if (status === OrderStatus.CANCELLED) {
        if (!isBuyer) {
          throw new ForbiddenException(
            'Solo el comprador puede cancelar el pedido',
          );
        }
      } else if (
        status === OrderStatus.SHIPPED ||
        status === OrderStatus.READY_FOR_PICKUP ||
        status === OrderStatus.DELIVERED
      ) {
        if (!isSeller) {
          throw new ForbiddenException(
            'Solo un vendedor del pedido puede actualizar este estado',
          );
        }
      } else {
        throw new ForbiddenException(
          'El estado pagado solo se asigna al aprobar el pago',
        );
      }

      if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
        throw new ConflictException(
          `No se puede cambiar el pedido de '${order.status}' a '${status}'`,
        );
      }

      if (status === OrderStatus.CANCELLED) {
        const productRepository = manager.getRepository(Product);
        const products: Product[] = [];

        for (const item of orderItems) {
          const product = await productRepository.findOne({
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!product) {
            throw new NotFoundException(
              'El producto asociado al pedido no existe',
            );
          }

          product.stock += item.quantity;
          products.push(product);
        }

        await productRepository.save(products);
      }

      order.status = status;
      await orderRepository.save(order);

      const items = await this.loadItems([order.id], orderItemsRepository);
      return Object.assign(order, { items });
    });

    void this.activityService.log({
      userId,
      type: 'order_status_changed',
      orderId: id,
      meta: { status },
    });

    return updatedOrder;
  }

  private async attachItems(
    orders: Order[],
    repository: Repository<OrderItem>,
    sellerId?: number,
  ): Promise<OrderResponse[]> {
    if (orders.length === 0) {
      return [];
    }

    const items = await this.loadItems(
      orders.map((order) => order.id),
      repository,
      sellerId,
    );
    const itemsByOrder = new Map<number, OrderItem[]>();

    for (const item of items) {
      const orderItems = itemsByOrder.get(item.orderId) ?? [];
      orderItems.push(item);
      itemsByOrder.set(item.orderId, orderItems);
    }

    return orders.map((order) =>
      Object.assign(order, { items: itemsByOrder.get(order.id) ?? [] }),
    );
  }

  private loadItems(
    orderIds: number[],
    repository: Repository<OrderItem>,
    sellerId?: number,
  ): Promise<OrderItem[]> {
    const query = repository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .addSelect(['product.id', 'product.title', 'product.imageUrl'])
      .where('item.orderId IN (:...orderIds)', { orderIds })
      .orderBy('item.id', 'ASC');

    if (sellerId !== undefined) {
      query.andWhere('item.sellerId = :sellerId', { sellerId });
    }

    return query.getMany();
  }
}
