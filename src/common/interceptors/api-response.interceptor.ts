// src/common/interceptors/api-response.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseService } from '../services/response.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private readonly responseService: ResponseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const serializedData = instanceToPlain(data);

        // Skip if already formatted
        if (serializedData?.success !== undefined) {
          return serializedData;
        }

        // Skip if it's a paginated response (let PaginationInterceptor handle it)
        if (serializedData?.data && serializedData?.meta) {
          return serializedData;
        }

        // Format standard success response
        return this.responseService.success(serializedData);
      }),
    );
  }
}

// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// // src/common/interceptors/api-response.interceptor.ts
// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { ResponseService } from '../services/response.service';
// import { instanceToPlain } from 'class-transformer';

// @Injectable()
// export class ApiResponseInterceptor implements NestInterceptor {
//   constructor(private readonly responseService: ResponseService) {}

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const ctx = context.switchToHttp();
//     const request = ctx.getRequest();

//     return next.handle().pipe(
//       map((data) => {
//         // Apply serialization manually
//         const serializedData = instanceToPlain(data);

//         // If already formatted, return as-is
//         if (serializedData?.success !== undefined) {
//           return serializedData;
//         }

//         // Format standard success response
//         return this.responseService.success(serializedData);
//       }),
//     );
//   }
// }
