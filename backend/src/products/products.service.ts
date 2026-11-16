import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { UsersService } from '../users/users.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto, ProductSort } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// Escapa los comodines de LIKE para que un '%' o '_' escrito por el usuario se busque literal
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, '\\$&');
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  // Consulta base de todas las lecturas: trae la categoría completa y solo los datos
  // públicos del vendedor (nunca correo, teléfono, rol ni passwordHash)
  private baseQuery(): SelectQueryBuilder<Product> {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.seller', 'seller')
      .addSelect(['seller.id', 'seller.name', 'seller.career', 'seller.campus'])
      .leftJoinAndSelect('product.category', 'category');
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedProducts> {
    const { search, category, minPrice, maxPrice, condition, sort, page, limit } =
      query;

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw new BadRequestException(
        'El precio mínimo no puede ser mayor que el precio máximo',
      );
    }

    // El catálogo solo muestra productos activos y con stock
    const qb = this.baseQuery()
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.stock > 0');

    const term = search?.trim();
    if (term) {
      // Los OR van entre paréntesis para no anular los filtros AND anteriores
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('product.title ILIKE :search')
            .orWhere('product.description ILIKE :search')
            .orWhere('seller.name ILIKE :search');
        }),
      ).setParameter('search', `%${escapeLike(term)}%`);
    }
    if (category) {
      qb.andWhere('category.slug = :category', { category });
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (condition) {
      qb.andWhere('product.condition = :condition', { condition });
    }

    // El id como segundo criterio deja un orden estable entre páginas
    switch (sort) {
      case ProductSort.PRICE_ASC:
        qb.orderBy('product.price', 'ASC').addOrderBy('product.id', 'ASC');
        break;
      case ProductSort.PRICE_DESC:
        qb.orderBy('product.price', 'DESC').addOrderBy('product.id', 'DESC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC').addOrderBy('product.id', 'DESC');
    }

    // Las relaciones son ManyToOne (no multiplican filas), así que offset/limit es seguro
    const [data, total] = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  // Mis publicaciones: incluye inactivos y sin stock
  findMine(userId: number): Promise<Product[]> {
    return this.baseQuery()
      .where('product.sellerId = :userId', { userId })
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('product.id', 'DESC')
      .getMany();
  }

  // Devuelve también los inactivos (para pedidos antiguos y "Mis publicaciones")
  async findOne(id: number): Promise<Product> {
    const product = await this.baseQuery()
      .where('product.id = :id', { id })
      .getOne();
    if (!product) {
      throw new NotFoundException('El producto no existe');
    }
    return product;
  }

  async create(dto: CreateProductDto, sellerId: number): Promise<Product> {
    // 404 si la categoría no existe
    await this.categoriesService.findOne(dto.categoryId);

    // sellerId siempre viene del token; el DTO no tiene ese campo
    const saved = await this.productsRepository.save(
      this.productsRepository.create({ ...dto, sellerId }),
    );

    // Al publicar su primer producto, un buyer pasa a seller
    await this.usersService.promoteToSeller(sellerId);

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProductDto, userId: number): Promise<Product> {
    const product = await this.findOwnedProduct(id, userId);

    if (dto.categoryId !== undefined) {
      await this.categoriesService.findOne(dto.categoryId);
    }

    // TypeORM ignora las propiedades undefined: solo cambia lo que vino en el body
    Object.assign(product, dto);
    await this.productsRepository.save(product);

    return this.findOne(id);
  }

  // Borrado lógico: el producto se conserva para pedidos, favoritos y carritos
  async remove(id: number, userId: number): Promise<void> {
    const product = await this.findOwnedProduct(id, userId);
    product.isActive = false;
    await this.productsRepository.save(product);
  }

  // 404 si no existe, 403 si existe pero es de otro usuario
  private async findOwnedProduct(id: number, userId: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('El producto no existe');
    }
    if (product.sellerId !== userId) {
      throw new ForbiddenException('Solo el dueño puede modificar este producto');
    }
    return product;
  }
}
