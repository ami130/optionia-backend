import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsOptional, IsObject } from 'class-validator';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsOptional()
  @IsObject()
  imageIndexMap?: Record<string, number>;

  @IsOptional()
  existingImages?: string[];
}
