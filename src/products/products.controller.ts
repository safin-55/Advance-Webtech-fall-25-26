import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PositiveIdPipe } from '../common/positive-id.pipe';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBadRequestResponse({ description: 'Invalid JSON fields, values, or ID.' })
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create and save a product' })
  @ApiCreatedResponse({ type: Product })
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Return all saved products' })
  @ApiOkResponse({ type: [Product] })
  findAll() {
    return this.products.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a product by its database-generated ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'The product does not exist.' })
  findOne(@Param('id', PositiveIdPipe) id: number) {
    return this.products.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one or more product fields' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'The product does not exist.' })
  update(@Param('id', PositiveIdPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product from the database' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Returns a success message and the deleted ID.' })
  @ApiNotFoundResponse({ description: 'The product does not exist.' })
  remove(@Param('id', PositiveIdPipe) id: number) {
    return this.products.remove(id);
  }
}
