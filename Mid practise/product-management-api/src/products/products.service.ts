import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { assertUpdateHasFields } from '../common/assert-update';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  create(dto: CreateProductDto): Promise<Product> {
    return this.products.save(this.products.create(dto));
  }

  findAll(): Promise<Product[]> {
    return this.products.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.products.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product with ID ${id} was not found.`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    assertUpdateHasFields(dto);
    const product = await this.findOne(id);
    return this.products.save(Object.assign(product, dto));
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const result = await this.products.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Product with ID ${id} was not found.`);
    return { message: 'Product deleted successfully.', id };
  }
}
