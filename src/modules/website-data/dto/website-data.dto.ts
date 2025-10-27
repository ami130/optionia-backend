import { IsOptional, IsString, IsArray, IsEmail } from 'class-validator';

export class CreateWebsiteDataDto {
  @IsOptional() @IsString() baseLogo?: string;
  @IsOptional() @IsString() secondaryLogo?: string;
  @IsOptional() @IsString() favicon?: string;

  @IsOptional() @IsString() primaryColor?: string;
  @IsOptional() @IsString() secondaryColor?: string;
  @IsOptional() @IsString() backgroundColor?: string;
  @IsOptional() @IsString() textColor?: string;

  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsArray() metaKeywords?: string[];

  // Owner Info
  @IsOptional() @IsString() ownerName?: string;
  @IsOptional() @IsString() brandName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() supportEmail?: string;
  @IsOptional() @IsString() hotline?: string;
  @IsOptional() @IsString() businessAddress?: string;
  @IsOptional() @IsString() secondaryBusinessAddress?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() twitter?: string;
  @IsOptional() @IsString() secondaryLink?: string;
  @IsOptional() @IsString() bin?: string;
}
