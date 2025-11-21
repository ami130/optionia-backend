import { IsArray, IsOptional, IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsNumber()
  roleId?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  linkedinProfile?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  /**
   * FINAL WORKING TRANSFORMER FOR EXPERTISE
   * Accepts:
   * - array: ["React","JS"]
   * - JSON string: '["React","JS"]'
   * - pg array string: "{React,JS}"
   * - comma separated: "React,JS"
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];

    // Already array
    if (Array.isArray(value)) return value;

    // JSON string
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}

    // PostgreSQL array format "{React,JS}"
    if (
      typeof value === 'string' &&
      value.startsWith('{') &&
      value.endsWith('}')
    ) {
      return value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim());
    }

    // Comma separated string
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((v) => v.trim());
    }

    // Plain string
    return [String(value).trim()];
  })
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];
}
