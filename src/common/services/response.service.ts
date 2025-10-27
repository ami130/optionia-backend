/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import {
  ApiResponse,
  PaginatedApiResponse,
  ErrorResponse,
  AuthTokenResponseWithUser,
  SeoMeta,
} from '../interfaces/api-response.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResponseService {
  private readonly baseUrl: string;
  private readonly version: string;
  private readonly environment: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    this.version = this.configService.get<string>('API_VERSION') || '1.0.0';
    this.environment = this.configService.get<string>('NODE_ENV') || 'development';
  }

  /**
   * ✅ Standard success response
   */
  success<T>(data: T, message = 'Request successful', seo?: SeoMeta, metaExtras?: Record<string, any>): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        version: this.version,
        environment: this.environment,
        ...metaExtras,
      },
      ...(seo ? { seo } : {}),
    };
  }

  /**
   * ✅ Paginated success response
   */
  paginatedSuccess<T>(
    data: T[],
    pagination: {
      total: number;
      page: number;
      limit: number;
    },
    message = 'Data retrieved successfully',
    seo?: SeoMeta,
    metaExtras?: Record<string, any>,
  ): PaginatedApiResponse<T> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return {
      success: true,
      message,
      data,
      meta: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        version: this.version,
        environment: this.environment,
        ...metaExtras,
      },
      ...(seo ? { seo } : {}),
    };
  }

  /**
   * ✅ Authentication response
   */
  authSuccess(
    accessToken: string,
    expiresIn: number,
    user: { id: number; username: string; email: string; role: string },
    refreshToken?: string,
    seo?: SeoMeta,
  ): ApiResponse<AuthTokenResponseWithUser> {
    const responseData: AuthTokenResponseWithUser = {
      access_token: accessToken,
      expires_in: expiresIn,
      token_type: 'Bearer',
      refresh_token: refreshToken || '',
      user,
    };

    return this.success(responseData, 'Authentication successful', seo);
  }

  /**
   * ❌ Error response (generic)
   */
  error(message: string, errorDetails?: ErrorResponse): ApiResponse<null> {
    const baseMeta = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      version: this.version,
      environment: this.environment,
    };

    return {
      success: false,
      message,
      data: null,
      meta: {
        ...baseMeta,
        ...(errorDetails || {}),
      },
    };
  }

  /**
   * ⚠️ Validation error (structured)
   */
  validationError(errors: Record<string, string[]>): ApiResponse<null> {
    return this.error('Validation failed', {
      error: 'ValidationError',
      details: errors,
    });
  }
}

// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable prettier/prettier */
// import { Injectable } from '@nestjs/common';
// import {
//   ApiResponse,
//   PaginatedApiResponse,
//   ErrorResponse,
//   AuthTokenResponseWithUser,
//   SeoMeta,
// } from '../interfaces/api-response.interface';

// @Injectable()
// export class ResponseService {
//   // ✅ Generic success response
//   success<T>(
//     data: T,
//     message = 'Request successful',
//     seo?: SeoMeta,
//     metaExtras?: Record<string, any>,
//   ): ApiResponse<T> {
//     return {
//       success: true,
//       message,
//       data,
//       meta: {
//         timestamp: new Date().toISOString(),
//         path: metaExtras?.path || undefined,
//         version: metaExtras?.version || '1.0.0',
//         ...metaExtras,
//       },
//       seo, // ✅ optional SEO data
//     };
//   }

//   // ✅ Paginated success response
//   paginatedSuccess<T>(
//     data: T[],
//     pagination: {
//       total: number;
//       page: number;
//       limit: number;
//     },
//     message = 'Data retrieved successfully',
//     seo?: SeoMeta,
//     metaExtras?: Record<string, any>,
//   ): PaginatedApiResponse<T> {
//     const totalPages = Math.ceil(pagination.total / pagination.limit);

//     return {
//       success: true,
//       message,
//       data,
//       meta: {
//         total: pagination.total,
//         page: pagination.page,
//         limit: pagination.limit,
//         totalPages,
//         timestamp: new Date().toISOString(),
//         ...metaExtras,
//       },
//       seo, // ✅ added SEO metadata for paginated results too
//     };
//   }

//   // ✅ Authentication success response
//   authSuccess(
//     accessToken: string,
//     expiresIn: number,
//     user: { id: number; username: string; email: string; role: string },
//     refreshToken?: string,
//     seo?: SeoMeta,
//   ): ApiResponse<AuthTokenResponseWithUser> {
//     const responseData: AuthTokenResponseWithUser = {
//       access_token: accessToken,
//       expires_in: expiresIn,
//       token_type: 'Bearer',
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       },
//       refresh_token: refreshToken || '',
//     };

//     return this.success(responseData, 'Authentication successful', seo);
//   }

//   // ✅ Error response with structured meta info
//   error(message: string, errorDetails?: ErrorResponse): ApiResponse<null> {
//     const response: ApiResponse<null> = {
//       success: false,
//       message,
//       data: null,
//       meta: {
//         timestamp: new Date().toISOString(),
//       },
//     };

//     if (errorDetails) {
//       response.meta = {
//         ...(response.meta ?? {}),
//         ...errorDetails,
//         timestamp: (response.meta?.timestamp ?? new Date().toISOString()),
//       };
//     }

//     return response;
//   }

//   // ✅ Validation error response
//   validationError(errors: Record<string, string[]>): ApiResponse<null> {
//     return this.error('Validation failed', {
//       error: 'ValidationError',
//       details: errors,
//     });
//   }
// }
