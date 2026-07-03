export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions extends PaginationOptions {
  query?: string;
  filters?: Record<string, unknown>;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface CollectorResult {
  success: boolean;
  itemsFound: number;
  itemsImported: number;
  itemsFailed: number;
  errors: string[];
  duration: number;
}

export interface NormalizedOpportunity {
  title: string;
  description: string;
  url?: string;
  applicationUrl?: string;
  type: string;
  organization?: string;
  location?: string[];
  tags?: string[];
  category?: string;
  salary?: { min?: number; max?: number; currency?: string };
  deadline?: Date;
  startDate?: Date;
  endDate?: Date;
  isRemote?: boolean;
  metadata?: Record<string, unknown>;
}
