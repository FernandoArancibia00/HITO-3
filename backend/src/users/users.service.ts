import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
}
