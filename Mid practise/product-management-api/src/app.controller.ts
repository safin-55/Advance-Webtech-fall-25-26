import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Status')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Confirm the API is running' })
  status() {
    return {
      message: 'Product and Employee Management API is running',
      documentation: '/docs',
      endpoints: ['/products', '/employees'],
    };
  }
}
