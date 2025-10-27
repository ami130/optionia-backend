// 🧩 Basic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: ApiMeta;
  seo?: SeoMeta; // <-- ✅ added SEO meta for frontend rendering
}

// 🧩 Pagination Response
export interface PaginatedApiResponse<T> extends Omit<ApiResponse<T[]>, 'meta'> {
  meta: PaginationMeta;
  seo?: SeoMeta;
}

// 🧩 Common Metadata (applies to all responses)
export interface ApiMeta {
  timestamp: string;
  path?: string;
  requestId?: string;
  version?: string;
  [key: string]: any;
}

// 🧩 Pagination-specific Metadata
export interface PaginationMeta extends ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 🧩 SEO Metadata (applies to every page like /blog, /service, /project)
export interface SeoMeta {
  metaTitle: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  };
  twitterCard?: {
    title?: string;
    description?: string;
    image?: string;
    handle?: string;
  };
}

// 🧩 Authentication Responses
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
}

export interface ErrorResponse {
  error?: string;
  details?: Record<string, any>;
}
