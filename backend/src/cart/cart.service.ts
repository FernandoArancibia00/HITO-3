import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

export interface CartResponse {
  items: CartItem[];
  total: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(userId: number): Promise<CartResponse> {
    return this.loadCart(userId, this.cartItemsRepository);
  }

  async add(userId: number, dto: CreateCartItemDto): Promise<CartResponse> {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.getRepository(Product).findOne({
        where: { id: dto.productId, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException('El producto no existe o está inactivo');
      }

      if (product.sellerId === userId) {
        throw new BadRequestException(
          'No puedes agregar tus propios productos al carrito',
        );
      }

      const repository = manager.getRepository(CartItem);
      const item = await repository.findOne({
        where: { userId, productId: dto.productId },
        lock: { mode: 'pessimistic_write' },
      });
      const quantity = (item?.quantity ?? 0) + dto.quantity;

      this.validateStock(product, quantity);

      const cartItem =
        item ??
        repository.create({
          userId,
          productId: dto.productId,
          quantity,
        });
      cartItem.quantity = quantity;
      await repository.save(cartItem);

      return this.loadCart(userId, repository);
    });
  }

  async update(
    userId: number,
    itemId: number,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const snapshot = await this.cartItemsRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!snapshot) {
      throw new NotFoundException(
        'El ítem no existe en el carrito del usuario',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const product = await manager.getRepository(Product).findOne({
        where: { id: snapshot.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException('El producto del carrito no existe');
      }

      const repository = manager.getRepository(CartItem);
      const item = await repository.findOne({
        where: { id: itemId, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException(
          'El ítem no existe en el carrito del usuario',
        );
      }

      this.validateStock(product, dto.quantity);
      item.quantity = dto.quantity;
      await repository.save(item);

      return this.loadCart(userId, repository);
    });
  }

  async remove(userId: number, itemId: number): Promise<CartResponse> {
    const result = await this.cartItemsRepository.delete({ id: itemId, userId });

    if (!result.affected) {
      throw new NotFoundException(
        'El ítem no existe en el carrito del usuario',
      );
    }

    return this.findAll(userId);
  }

  async clear(userId: number): Promise<void> {
    await this.cartItemsRepository.delete({ userId });
  }

  private validateStock(product: Product, quantity: number): void {
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Stock insuficiente para '${product.title}'`,
      );
    }
  }

  private async loadCart(
    userId: number,
    repository: Repository<CartItem>,
  ): Promise<CartResponse> {
    const items = await repository
      .createQueryBuilder('cartItem')
      .innerJoinAndSelect('cartItem.product', 'product')
      .leftJoin('product.seller', 'seller')
      .addSelect([
        'seller.id',
        'seller.name',
        'seller.career',
        'seller.campus',
      ])
      .leftJoinAndSelect('product.category', 'category')
      .where('cartItem.userId = :userId', { userId })
      .orderBy('cartItem.id', 'ASC')
      .getMany();

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    return { items, total };
  }
}
