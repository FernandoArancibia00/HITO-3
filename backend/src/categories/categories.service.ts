import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

const SLUG_IN_USE_MESSAGE = 'Ya existe una categoría con ese slug';
const NAME_IN_USE_MESSAGE = 'Ya existe una categoría con ese nombre';
const DUPLICATE_MESSAGE = 'Ya existe una categoría con ese slug o nombre';
const HAS_PRODUCTS_MESSAGE =
  'No se puede eliminar una categoría que tiene productos asociados';
// Códigos de error de Postgres
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

function isPgError(error: unknown, code: string): boolean {
  return (
    error instanceof QueryFailedError &&
    (error as QueryFailedError & { code?: string }).code === code
  );
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (await this.categoriesRepository.exists({ where: { slug: dto.slug } })) {
      throw new ConflictException(SLUG_IN_USE_MESSAGE);
    }
    if (await this.categoriesRepository.exists({ where: { name: dto.name } })) {
      throw new ConflictException(NAME_IN_USE_MESSAGE);
    }

    try {
      return await this.categoriesRepository.save(
        this.categoriesRepository.create(dto),
      );
    } catch (error) {
      // Dos creaciones simultáneas con el mismo slug o nombre: la base rechaza la segunda
      if (isPgError(error, PG_UNIQUE_VIOLATION)) {
        throw new ConflictException(DUPLICATE_MESSAGE);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Otra categoría (id distinto) ya usa ese nombre
    if (
      dto.name !== undefined &&
      (await this.categoriesRepository.exists({
        where: { name: dto.name, id: Not(id) },
      }))
    ) {
      throw new ConflictException(NAME_IN_USE_MESSAGE);
    }

    this.categoriesRepository.merge(category, dto);
    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (isPgError(error, PG_UNIQUE_VIOLATION)) {
        throw new ConflictException(NAME_IN_USE_MESSAGE);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.categoriesRepository.delete(id);
    } catch (error) {
      // La FK products.categoryId impide borrar una categoría que todavía tiene productos
      if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) {
        throw new ConflictException(HAS_PRODUCTS_MESSAGE);
      }
      throw error;
    }
  }
}
