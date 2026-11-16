import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @ApiProperty({ example: 2 })
  @PrimaryGeneratedColumn()
  id: number;

  // Identificador legible para URLs y filtros (ej. 'libros'); no se modifica después de crearlo
  @ApiProperty({ example: 'tecnologia' })
  @Column({ type: 'varchar', length: 50, unique: true })
  slug: string;

  @ApiProperty({ example: 'Tecnología y Accesorios' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  // Nombre de un ícono de Bootstrap Icons sin el prefijo 'bi-' (ej. 'book', 'laptop')
  @ApiProperty({ example: 'laptop' })
  @Column({ type: 'varchar', length: 50 })
  icon: string;
}
