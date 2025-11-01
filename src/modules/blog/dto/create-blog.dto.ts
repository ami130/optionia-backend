// src/modules/blog/dto/create-blog.dto.ts
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  metaData?: any;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  status?: string; // published, draft

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readingTime?: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pageId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  categoryId: number;
}
