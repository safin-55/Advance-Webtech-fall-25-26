import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scryptSync } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { assertUpdateHasFields } from '../common/assert-update';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
  ) {}

  private checkExperience(age: number, yearsOfWorking: number): void {
    if (yearsOfWorking > age) {
      throw new BadRequestException('yearsOfWorking cannot be greater than age.');
    }
  }

  private async save(employee: Employee): Promise<Employee> {
    try {
      return await this.employees.save(employee);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const driver = error.driverError as { code?: string; message?: string };
        if (
          driver.code === '23505' ||
          driver.code === 'ER_DUP_ENTRY' ||
          driver.message?.includes('UNIQUE constraint failed: employees.email')
        ) {
          throw new ConflictException('An employee with this email already exists.');
        }
      }
      throw error;
    }
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    this.checkExperience(dto.age, dto.yearsOfWorking);
    const saved = await this.save(
      this.employees.create({ ...dto, password: hashPassword(dto.password) }),
    );
    return this.findOne(saved.id);
  }

  findAll(): Promise<Employee[]> {
    return this.employees.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employees.findOneBy({ id });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} was not found.`);
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    assertUpdateHasFields(dto);
    const employee = await this.findOne(id);
    this.checkExperience(
      dto.age ?? employee.age,
      dto.yearsOfWorking ?? employee.yearsOfWorking,
    );
    const changes = { ...dto };
    if (changes.password !== undefined) changes.password = hashPassword(changes.password);
    await this.save(Object.assign(employee, changes));
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const result = await this.employees.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Employee with ID ${id} was not found.`);
    return { message: 'Employee deleted successfully.', id };
  }
}
