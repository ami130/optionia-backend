import { IsString, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

/* ========== BUTTON CONFIG DTO ========== */
export class ButtonConfigDto {
  @IsString()
  text: string;

  @IsString()
  link: string;

  @IsString()
  bgColor: string;

  @IsString()
  textColor: string;
}

/* ========== ICON CONFIG DTO ========== */
export class IconConfigDto {
  @IsString()
  id: string;

  @IsString()
  icon: string;

  @IsString()
  text: string;

  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  bgColor?: string;
}

/* ========== CONTENT BLOCK DTO ========== */
export class ContentBlockDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  heading: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IconConfigDto)
  icons?: IconConfigDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ButtonConfigDto)
  buttons?: ButtonConfigDto[];
}

/* ========== SECTION CONFIG DTO ========== */
export class SectionConfigDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  key: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  contents: ContentBlockDto[];
}

/* ========== WEBSITE META DTO ========== */
export class WebsiteMetaDto {
  @IsString()
  baseLogo: string;

  @IsString()
  secondaryLogo: string;

  @IsString()
  favicon: string;

  @IsString()
  primaryColor: string;

  @IsString()
  secondaryColor: string;

  @IsString()
  backgroundColor: string;

  @IsString()
  textColor: string;

  @IsString()
  metaTitle: string;

  @IsString()
  metaDescription: string;

  @IsArray()
  @IsString({ each: true })
  metaKeywords: string[];
}

/* ========== CREATE PAGE DTO ========== */
export class CreatePageDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  key: string;

  @ValidateNested()
  @Type(() => WebsiteMetaDto)
  websiteMeta: WebsiteMetaDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionConfigDto)
  sections: SectionConfigDto[];

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  version?: number;

  @IsOptional()
  updatedBy?: string;
}

/* ========== UPDATE PAGE DTO ========== */
export class UpdatePageDto extends PartialType(CreatePageDto) {}
