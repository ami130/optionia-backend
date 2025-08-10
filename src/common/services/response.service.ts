/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/common/services/response.service.ts
import { Injectable } from '@nestjs/common';
import {
  ApiResponse,
  PaginatedApiResponse,
  ErrorResponse,
  AuthTokenResponseWithUser,
} from '../interfaces/api-response.interface';

@Injectable()
export class ResponseService {
  success<T>(data: T, message: string = 'Request successful'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  paginatedSuccess<T>(
    data: T[],
    pagination: {
      total: number;
      page: number;
      limit: number;
    },
    message: string = 'Data retrieved successfully',
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
      },
    };
  }

  authSuccess(
    accessToken: string,
    expiresIn: number,
    user: { id: number; username: string; email: string; role: string },
    refreshToken?: string,
  ): ApiResponse<AuthTokenResponseWithUser> {
    const responseData: AuthTokenResponseWithUser = {
      access_token: accessToken,
      expires_in: expiresIn,
      token_type: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      refresh_token: '',
    };

    if (refreshToken) {
      responseData.refresh_token = refreshToken;
    }

    return this.success(responseData, 'Authentication successful');
  }

  error(message: string, errorDetails?: ErrorResponse): ApiResponse<null> {
    const response: ApiResponse<null> = {
      success: false,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    if (errorDetails) {
      response.meta = {
        ...response.meta,
        ...errorDetails,
      };
    }

    return response;
  }

  validationError(errors: Record<string, string[]>): ApiResponse<null> {
    return this.error('Validation failed', {
      error: 'ValidationError',
      details: errors,
    });
  }
}
