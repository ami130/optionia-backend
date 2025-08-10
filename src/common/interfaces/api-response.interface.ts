// src/common/interfaces/api-response.interface.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

export interface PaginatedApiResponse<T> extends Omit<ApiResponse<T[]>, 'meta'> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    timestamp: string;
  };
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthTokenResponseWithUser extends AuthTokenResponse {
  refresh_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface ErrorResponse {
  error?: string;
  details?: Record<string, any>;
}
