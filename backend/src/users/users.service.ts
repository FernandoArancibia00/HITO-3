import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

const USER_NOT_FOUND_MESSAGE = 'El usuario no existe';

export interface PublicProfile {
  id: number;
  name: string;
  career: string | null;
  campus: string | null;
  products: Product[];
}

// Texto opcional del perfil: se recorta y un texto vacío se guarda como null
function optionalText(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // Repositorio registrado con forFeature en UsersModule: no se importa ProductsModule,
    // así se evita la dependencia circular (ProductsModule ya importa UsersModule)
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  // Única consulta que incluye passwordHash: la usa el login para comparar con bcrypt
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  create(data: DeepPartial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  // Un buyer pasa a seller al publicar. El WHERE incluye role = buyer, así que un admin
  // o un seller quedan igual y llamarlo varias veces no tiene efecto
  async promoteToSeller(userId: number): Promise<void> {
    await this.usersRepository.update(
      { id: userId, role: UserRole.BUYER },
      { role: UserRole.SELLER },
    );
  }

  // GET /users/me. passwordHash tiene select: false, así que nunca viene en el resultado
  async findMe(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }
    return user;
  }

  // PATCH /users/me. Solo cambia los campos que vinieron en el body
  async updateMe(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findMe(id);

    if (dto.name !== undefined) user.name = dto.name.trim();
    const career = optionalText(dto.career);
    const campus = optionalText(dto.campus);
    const phone = optionalText(dto.phone);
    if (career !== undefined) user.career = career;
    if (campus !== undefined) user.campus = campus;
    if (phone !== undefined) user.phone = phone;

    await this.usersRepository.save(user);
    return this.findMe(id);
  }

  // GET /users/:id. Datos públicos del usuario y sus productos activos con stock
  async findPublicProfile(id: number): Promise<PublicProfile> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    // Misma forma que ProductsService.baseQuery: category completa y solo los datos
    // públicos del vendedor (nunca correo, teléfono, rol ni passwordHash)
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.seller', 'seller')
      .addSelect(['seller.id', 'seller.name', 'seller.career', 'seller.campus'])
      .leftJoinAndSelect('product.category', 'category')
      .where('product.sellerId = :id', { id })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .andWhere('product.stock > 0')
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('product.id', 'DESC')
      .getMany();

    return {
      id: user.id,
      name: user.name,
      career: user.career,
      campus: user.campus,
      products,
    };
  }
}
