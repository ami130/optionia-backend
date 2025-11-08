import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsOptional, IsObject, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsOptional()
  @IsObject()
  imageIndexMap?: Record<string, number>;

  @IsOptional()
  existingImages?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return value;
  })
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return value;
  })
  status?: boolean;
}
