import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsEnum } from 'class-validator';
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
  @IsEnum(BlogType)
  blogType?: BlogType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return value;
  })
  featured?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return value;
  })
  status?: boolean = true;

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
