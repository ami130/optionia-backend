import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsOptional, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsOptional()
  @IsObject()
  imageIndexMap?: Record<string, number>;

  @IsOptional()
  existingImages?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status?: boolean;
}
