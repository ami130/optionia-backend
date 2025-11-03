import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { BlogType } from '../enum/blog-type.enum';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  image?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readingTime?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wordCount?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsEnum(BlogType)
  blogType?: BlogType;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  metaData?: any;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pageId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsArray()
  authorIds?: number[];

  @IsOptional()
  @IsArray()
  tagIds?: number[];
}
