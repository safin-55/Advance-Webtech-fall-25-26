import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @ApiProperty({ example: 1, readOnly: true })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Amina Rahman' })
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @ApiProperty({ example: 'amina@example.com' })
  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  @ApiProperty({ example: '+8801712345678' })
  @Column({ type: 'varchar', length: 25 })
  phone!: string;

  // Accept the required dummy password, store a salted hash, never return it.
  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @ApiProperty({ example: 25 })
  @Column({ type: 'int' })
  age!: number;

  @ApiProperty({ example: 3 })
  @Column({ type: 'int' })
  yearsOfWorking!: number;
}
