// src/modules/pricing/dto/pricing.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class PricingFeatureDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  ordering?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ComparisonRowDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  label: string;

  @IsString()
  free_value: string;

  @IsString()
  pro_value: string;

  @IsString()
  advanced_value: string;

  @IsOptional()
  @IsNumber()
  ordering?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ComparisonTableDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  section_title: string;

  @IsOptional()
  @IsNumber()
  ordering?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComparisonRowDto)
  rows: ComparisonRowDto[];
}

export class PricingPlanDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_popular?: boolean;

  @IsOptional()
  @IsNumber()
  trial_days?: number;

  @IsString()
  button_text: string;

  @IsString()
  button_link: string; // Changed from @IsUrl() to @IsString() for flexibility

  @IsNumber()
  monthly_price: number;

  @IsOptional()
  @IsNumber()
  yearly_price?: number;

  @IsOptional()
  @IsNumber()
  discount_percentage?: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsNumber()
  ordering?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingFeatureDto)
  features: PricingFeatureDto[];
}

export class UpdatePricingDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingPlanDto)
  plans: PricingPlanDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComparisonTableDto)
  comparison_tables: ComparisonTableDto[];
}