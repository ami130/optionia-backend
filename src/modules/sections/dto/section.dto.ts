import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, ValidateNested, IsObject } from 'class-validator';

export class SectionButtonDto {
  @IsString() link: string;
  @IsString() text: string;
  @IsOptional() @IsString() bgColor?: string;
  @IsOptional() @IsString() textColor?: string;
}

export class SectionIconDto {
  @IsString() id: string;
  @IsString() icon: string;
  @IsString() text: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() bgColor?: string;
}

export class SectionItemDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) keyPoints?: string[];
  @IsOptional() @IsObject() metadata?: Record<string, any>;

  @IsOptional() @IsNumber() order?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionIconDto)
  icons?: SectionIconDto[];

  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionButtonDto)
  buttons?: SectionButtonDto[];
}

export class CreateSectionDto {
  @IsString()
  name: string;

  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() backgroundImage?: string;
  @IsOptional() @IsString() contentAlignment?: string;
  @IsOptional() @IsString() backgroundColor?: string;
  @IsOptional() @IsString() textColor?: string;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsNumber() order?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) keyPoints?: string[];
  @IsOptional() @IsObject() metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionItemDto)
  contents?: SectionItemDto[];
}

export class UpdateSectionDto extends CreateSectionDto {}
