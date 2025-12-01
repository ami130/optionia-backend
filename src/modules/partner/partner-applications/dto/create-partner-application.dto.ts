// src/modules/partner-applications/dto/create-partner-application.dto.ts
import { IsString, IsEmail, IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class CreatePartnerApplicationDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @IsOptional()
  @IsString()
  partnerType?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  contacted?: boolean;
}

export class UpdatePartnerApplicationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @IsOptional()
  @IsString()
  partnerType?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  contacted?: boolean;
}

export class UpdateContactedDto {
  @IsBoolean()
  contacted: boolean;
}