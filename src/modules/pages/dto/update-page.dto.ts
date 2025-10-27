// src/modules/pages/dto/update-page.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { 
  IsOptional, 
  IsNumber, 
  ValidateNested, 
  IsArray,
  IsString,
  IsBoolean 
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePageChildDto {
  @IsOptional()
  @IsNumber()
  id?: number; // ✅ Required for updates

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePageChildDto)
  children?: UpdatePageChildDto[];
}