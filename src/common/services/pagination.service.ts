// src/common/services/pagination.service.ts
import { Injectable } from '@nestjs/common';
import { Repository, FindManyOptions, FindOptionsWhere, ILike, In, Equal, ObjectLiteral, FindOptionsOrder } from 'typeorm';
import { PaginationMeta, PaginatedResponse, SearchFilter } from '../interfaces/pagination.interface';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class PaginationService {
  async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    paginationDto: PaginationDto,
    searchFilters: SearchFilter[] = [],
    relations: string[] = [],
    defaultSort: string = 'createdAt',
    defaultOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<T>[] | FindOptionsWhere<T> = this.buildWhereConditions(searchFilters, search);

    // Build find options
    const order: FindOptionsOrder<T> = {
      [sortBy || defaultSort]: sortOrder || defaultOrder
    } as FindOptionsOrder<T>;
    const findOptions: FindManyOptions<T> = {
      where,
      relations,
      order,
      skip,
      take: limit,
    };

    // Get data and total count
    const [data, total] = await repository.findAndCount(findOptions);

    // Calculate pagination metadata
    const meta = this.calculatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  private buildWhereConditions<T>(
    searchFilters: SearchFilter[],
    search?: string,
  ): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
    const whereConditions: FindOptionsWhere<T>[] = [];
    const baseCondition: FindOptionsWhere<T> = {};

    // Add search filters
    searchFilters.forEach(filter => {
      switch (filter.operator) {
        case 'like':
          baseCondition[filter.field] = ILike(`%${filter.value}%`);
          break;
        case 'in':
          baseCondition[filter.field] = In(filter.value);
          break;
        case 'equals':
        default:
          baseCondition[filter.field] = Equal(filter.value);
          break;
      }
    });

    // If we have a global search, create OR conditions
    if (search) {
      // This is a simplified version - you might want to make this configurable
      whereConditions.push(
        { ...baseCondition, title: ILike(`%${search}%`) } as FindOptionsWhere<T>,
        { ...baseCondition, subtitle: ILike(`%${search}%`) } as FindOptionsWhere<T>,
        { ...baseCondition, content: ILike(`%${search}%`) } as FindOptionsWhere<T>,
      );
    } else {
      whereConditions.push(baseCondition);
    }

    return whereConditions.length === 1 ? whereConditions[0] : whereConditions;
  }

  private calculatePaginationMeta(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Advanced query builder method
  async advancedPaginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    paginationDto: PaginationDto,
    customWhere: FindOptionsWhere<T> | FindOptionsWhere<T>[] = {},
    relations: string[] = [],
    order: FindOptionsOrder<T> = { createdAt: 'DESC' } as unknown as FindOptionsOrder<T>,
  ): Promise<PaginatedResponse<T>> {
    const { page=1, limit = 10} = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await repository.findAndCount({
      where: customWhere,
      relations,
      order,
      skip,
      take: limit,
    });

    const meta = this.calculatePaginationMeta(total, page, limit);

    return { data, meta };
  }
}