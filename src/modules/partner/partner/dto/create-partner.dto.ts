// src/modules/partners/dto/create-partner.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsUrl, IsNumber, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(200)
  websiteLink?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  status?: boolean = true;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsOptional()
  meta_data?: any;
}

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {
  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
