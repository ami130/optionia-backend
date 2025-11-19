import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumber,
  IsOptional,
  MaxLength,
  IsUrl,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @IsString() @IsNotEmpty() username: string;
  @IsEmail() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() @MinLength(6) password: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];

  @IsNumber() @Type(() => Number) @IsNotEmpty() roleId: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  @Transform(({ value }) => (value === '' ? null : value)) // Transform empty string to null
  bio?: string;

  @IsString() @IsOptional() @IsUrl() linkedinProfile?: string;
}

export class UpdateUserDto {
  @IsString() @IsOptional() username?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() @MinLength(6) password?: string;
  @IsNumber() @IsOptional() roleId?: number;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];

  @IsString()
  @IsOptional() // ✅ Make sure this is here
  @MaxLength(120)
  @Transform(({ value }) => (value === '' ? undefined : value)) // Handle empty strings
  bio?: string;

  @IsString() @IsOptional() @IsUrl() linkedinProfile?: string;
}
