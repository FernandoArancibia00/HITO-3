import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';

// Uso: @Roles(UserRole.ADMIN) junto a @UseGuards(JwtAuthGuard, RolesGuard)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
