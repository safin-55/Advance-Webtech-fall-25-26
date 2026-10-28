import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PositiveIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!/^[1-9]\d*$/.test(value) || Number(value) > 2147483647) {
      throw new BadRequestException('id must be a positive integer up to 2147483647.');
    }
    return Number(value);
  }
}
