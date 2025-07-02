import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class commonQueryDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  @IsIn(['title', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  // Add more filter fields as needed
}
