import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
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

  @IsOptional()
  @IsNumber()
  plan_id?: number;
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

  @IsOptional()
  @IsNumber()
  table_id?: number;
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
  button_link: string;

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