import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateTermsDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(255)
  slug: string;

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
  @IsOptional()
  content?: string;
}
