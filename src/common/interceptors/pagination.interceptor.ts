/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
// src/common/interceptors/pagination.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseService } from '../services/response.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  constructor(private readonly responseService: ResponseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const serializedData = instanceToPlain(response);

        // Handle paginated responses
        if (serializedData?.data && typeof serializedData?.meta === 'object' && serializedData.meta !== null) {
          return this.responseService.paginatedSuccess(
            serializedData.data,
            {
              total: serializedData.meta.total,
              page: serializedData.meta.page || 1,
              limit: serializedData.meta.limit || 10,
            },
            serializedData.message || 'Data retrieved successfully',
          );
        }

        return serializedData;
      }),
    );
  }
}
