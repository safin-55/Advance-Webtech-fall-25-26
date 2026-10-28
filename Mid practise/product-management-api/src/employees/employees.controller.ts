import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PositiveIdPipe } from '../common/positive-id.pipe';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { EmployeesService } from './employees.service';

@ApiTags('Employees')
@ApiBadRequestResponse({ description: 'Invalid JSON fields, values, or ID.' })
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an employee; the dummy password is write-only' })
  @ApiCreatedResponse({ type: Employee })
  @ApiConflictResponse({ description: 'Email already exists.' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employees.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Return all saved employees without passwords' })
  @ApiOkResponse({ type: [Employee] })
  findAll() {
    return this.employees.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find an employee by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Employee })
  @ApiNotFoundResponse({ description: 'The employee does not exist.' })
  findOne(@Param('id', PositiveIdPipe) id: number) {
    return this.employees.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one or more employee fields' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Employee })
  @ApiConflictResponse({ description: 'Email already exists.' })
  @ApiNotFoundResponse({ description: 'The employee does not exist.' })
  update(@Param('id', PositiveIdPipe) id: number, @Body() dto: UpdateEmployeeDto) {
    return this.employees.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee from the database' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Returns a success message and the deleted ID.' })
  @ApiNotFoundResponse({ description: 'The employee does not exist.' })
  remove(@Param('id', PositiveIdPipe) id: number) {
    return this.employees.remove(id);
  }
}
