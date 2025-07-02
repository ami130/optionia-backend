/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/common/dto/pagination.dto.ts
import { IsOptional, IsNumber, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer'; // ✅ Correct import

export class PaginationOptionsDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Math.max(Number(value), 1))
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Math.min(Math.max(Number(value), 1), 100))
  limit: number = 10;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsIn(['title', 'createdAt', 'updatedAt'], {
    message: 'sortBy must be one of: title, createdAt, updatedAt',
  })
  sortBy: string = 'createdAt';
}

export function WithPagination<Filters>(filterDto: new () => Filters) {
  class PaginationWithFilters extends PaginationOptionsDto {
    @IsOptional()
    @Type(() => filterDto)
    filters?: Filters;
  }

  return PaginationWithFilters;
}
