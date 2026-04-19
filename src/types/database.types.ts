export interface BaseRecord {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerFeedback extends BaseRecord {
  customer_name: string;
  rating: number;
  comments?: string;
}

export interface HealthCheck extends BaseRecord {
  status: string;
  timestamp: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export type DbTables = {
  customer_feedback: CustomerFeedback;
  health_check: HealthCheck;
};

// Type-safe table references
export const Tables = {
  CUSTOMER_FEEDBACK: 'customer_feedback' as keyof DbTables,
  HEALTH_CHECK: 'health_check' as keyof DbTables,
};