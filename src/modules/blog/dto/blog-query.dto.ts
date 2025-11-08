// src/modules/blog/dto/blog-query.dto.ts
import { IsOptional, IsNumber, Min, IsString, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class BlogFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  category?: string; // Change from number to string for slug

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  tagSlugs?: string; // Change from tagIds to tagSlugs

  @IsOptional()
  @IsString()
  tagIds?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  author?: number;

  @IsOptional()
  @IsString()
  blogType?: string;

  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  status?: boolean;
}
