// src/common/interfaces/pagination.interface.ts
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SearchFilter {
  field: string;
  value: any;
  operator?: 'equals' | 'like' | 'in' | 'gt' | 'lt';
}
