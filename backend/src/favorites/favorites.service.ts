import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Favorite } from './entities/favorite.entity';

const PG_UNIQUE_VIOLATION = '23505';

function isPgUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error as QueryFailedError & { code?: string }).code ===
      PG_UNIQUE_VIOLATION
  );
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(userId: number): Promise<Product[]> {
    const favorites = await this.favoritesRepository
      .createQueryBuilder('favorite')
      .innerJoinAndSelect('favorite.product', 'product')
      .leftJoin('product.seller', 'seller')
      .addSelect([
        'seller.id',
        'seller.name',
        'seller.career',
        'seller.campus',
      ])
      .leftJoinAndSelect('product.category', 'category')
      .where('favorite.userId = :userId', { userId })
      .orderBy('favorite.createdAt', 'DESC')
      .getMany();

    return favorites.map((favorite) => favorite.product);
  }

  async add(userId: number, productId: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('El producto no existe o está inactivo');
    }

    if (
      await this.favoritesRepository.exists({
        where: { userId, productId },
      })
    ) {
      throw new ConflictException('El producto ya está en favoritos');
    }

    try {
      await this.favoritesRepository.insert({ userId, productId });
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        throw new ConflictException('El producto ya está en favoritos');
      }
      throw error;
    }
  }

  async remove(userId: number, productId: number): Promise<void> {
    const result = await this.favoritesRepository.delete({ userId, productId });

    if (!result.affected) {
      throw new NotFoundException('El producto no está en tus favoritos');
    }
  }
}
