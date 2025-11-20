import { IsArray, IsOptional, IsString, IsEmail, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  roleId?: number;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  linkedinProfile?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Handle expertise transformation from string to array
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // If it's a comma-separated string, split it
        if (value.includes(',')) {
          return value.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '');
        }
        // If it's a single string, wrap it in array
        return value.trim() ? [value.trim()] : [];
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];
}