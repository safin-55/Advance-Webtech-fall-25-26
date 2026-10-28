import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, ValueTransformer } from 'typeorm';

const numberTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('products')
export class Product {
  @ApiProperty({ example: 1, readOnly: true })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Notebook' })
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @ApiProperty({ example: 'Stationery' })
  @Column({ type: 'varchar', length: 80 })
  category!: string;

  @ApiProperty({ example: 120.5 })
  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: numberTransformer })
  price!: number;

  @ApiProperty({ example: 50 })
  @Column({ type: 'int' })
  quantity!: number;
}
