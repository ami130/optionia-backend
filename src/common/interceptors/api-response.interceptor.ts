// src/common/interceptors/api-response.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseService } from '../services/response.service';
import { instanceToPlain } from 'class-transformer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  private readonly baseUrl: string;

  constructor(
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
  ) {
    // ✅ Load from environment, fallback to localhost
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.url;
    const method = request.method;

    return next.handle().pipe(
      map((data) => {
        const serializedData = instanceToPlain(data);

        // 1️⃣ Skip already formatted responses
        if (serializedData?.success !== undefined) return serializedData;

        // 2️⃣ Skip paginated responses
        if (serializedData?.data && serializedData?.meta) return serializedData;

        // 3️⃣ Generate SEO metadata dynamically
        const seo = this.generateSeoMetadata(path, serializedData);

        // 4️⃣ Extra metadata
        const extraMeta = {
          path,
          method,
          apiVersion: '1.0.0',
          environment: this.configService.get<string>('NODE_ENV') || 'development',
          timestamp: new Date().toISOString(),
        };

        // 5️⃣ Unified formatted response
        return this.responseService.success(serializedData, 'Request successful', seo, extraMeta);
      }),
    );
  }

  private generateSeoMetadata(path: string, data: any) {
    const cleanPath = path.replace(/\//g, ' ').trim() || 'Home';
    const title =
      typeof data === 'object' && data?.title
        ? data.title
        : `${cleanPath.charAt(0).toUpperCase()}${cleanPath.slice(1)}`;
    const description =
      typeof data === 'object' && data?.description
        ? data.description
        : `Explore ${title} and more at Optionia.`;

    // ✅ Safe URL builder
    const canonicalUrl = new URL(path, this.baseUrl).toString();

    return {
      metaTitle: `${title} | Optionia`,
      metaDescription: description,
      canonicalUrl,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  }
}

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
//     return next.handle().pipe(
//       map((data) => {
//         const serializedData = instanceToPlain(data);

//         // Skip if already formatted
//         if (serializedData?.success !== undefined) {
//           return serializedData;
//         }

//         // Skip if it's a paginated response (let PaginationInterceptor handle it)
//         if (serializedData?.data && serializedData?.meta) {
//           return serializedData;
//         }

//         // Format standard success response
//         return this.responseService.success(serializedData);
//       }),
//     );
//   }
// }

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
