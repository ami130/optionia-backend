// create-page.dto.ts
import { IsString, IsOptional, IsBoolean, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePageChildDto {
  @IsString() title: string;
  @IsString() url: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsNumber() order?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePageChildDto)
  children?: CreatePageChildDto[];
}

export class CreatePageDto {
  @IsString() name: string;
  @IsString() title: string;
  @IsString() url: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() navbarShow?: boolean;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsArray() metaKeywords?: string[];
  @IsOptional() @IsString() canonicalUrl?: string;
  @IsOptional() @IsString() backgroundImage?: string;
  @IsOptional() @IsString() backgroundColor?: string;
  @IsOptional() @IsString() textColor?: string;
  @IsOptional() @IsNumber() order?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePageChildDto)
  children?: CreatePageChildDto[];
  @IsOptional() @IsNumber() parentId?: number;
}
