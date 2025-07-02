import { IsNotEmpty, IsNumber, IsString, IsArray, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  stock: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    // Handles both: already an array (Postman "tags[]=1&tags[]=2") or a string "[1,2]"
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(Number) : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value.map(Number) : [];
  })
  tagIds: number[];
}
