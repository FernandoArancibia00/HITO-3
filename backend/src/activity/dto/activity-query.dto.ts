import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ACTIVITY_TYPES, ActivityType } from '../schemas/activity-log.schema';

export class ActivityQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar historial por tipo de actividad',
    enum: ACTIVITY_TYPES,
    example: 'product_view',
  })
  @IsOptional()
  @IsIn(ACTIVITY_TYPES, {
    message:
      'El parámetro type debe ser uno de: product_view, search, favorite_added, order_created, order_status_changed',
  })
  type?: ActivityType;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de registros a devolver (por defecto 20, máximo 100)',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El parámetro limit debe ser un número entero' })
  @Min(1, { message: 'El parámetro limit debe ser al menos 1' })
  @Max(100, { message: 'El parámetro limit no puede superar 100' })
  limit?: number = 20;
}
