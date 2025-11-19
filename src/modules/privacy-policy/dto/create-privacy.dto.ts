// src/modules/privacy-policy/dto/create-privacy.dto.ts
import { IsString, IsOptional, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';

export class CreatePrivacyDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(255)
  slug: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNotEmpty({ message: 'Page ID is required' })
  pageId: number;
}
