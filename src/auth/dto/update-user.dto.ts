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

  /**
   * SAME TRANSFORMER USED IN CreateUserDto
   * This ensures update also accepts:
   * - ["React","JS"]
   * - '["React","JS"]'
   * - "{React,JS}"
   * - "React,JS"
   * - "React"
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];

    // Already an array
    if (Array.isArray(value)) return value;

    // JSON string
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}

    // PostgreSQL array format: "{A,B,C}"
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      return value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim());
    }

    // Comma separated
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((v) => v.trim());
    }

    // Single string
    return [String(value).trim()];
  })
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];
}
