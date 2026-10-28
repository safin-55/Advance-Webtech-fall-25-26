import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Amina Rahman', minLength: 1, maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 120)
  name!: string;

  @ApiProperty({ example: 'amina@example.com', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @Length(3, 254)
  email!: string;

  @ApiProperty({
    example: '+8801712345678',
    description: 'Keep phone numbers as strings.',
  })
  @IsString()
  @Length(7, 25)
  @Matches(/^\+?[0-9 ()-]+$/, { message: 'phone must be a valid phone-number string' })
  @Matches(/(?:.*\d){6}/, { message: 'phone must contain at least six digits' })
  phone!: string;

  @ApiProperty({ example: 'Demo1234!', minLength: 4, maxLength: 72, writeOnly: true })
  @IsString()
  @Length(4, 72)
  password!: string;

  @ApiProperty({ example: 25, minimum: 1, maximum: 120 })
  @IsInt()
  @Min(1)
  @Max(120)
  age!: number;

  @ApiProperty({ example: 3, minimum: 0, maximum: 120 })
  @IsInt()
  @Min(0)
  @Max(120)
  yearsOfWorking!: number;
}
