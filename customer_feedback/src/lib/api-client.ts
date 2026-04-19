import { createClient } from '@supabase/supabase-js';

// Types
export interface CustomerFeedback {
  id?: number;
  customer_name: string;
  rating: number;
  comments?: string;
  source?: string;
  device_info?: Record<string, any>;
  is_anonymous?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackStats {
  averageRating: number;
  ratingCounts: { rating: number; count: number }[];
  totalCount: number;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
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

// API client class
export class ApiClient {
  private readonly apiUrl: string;
  private readonly supabase: any;
  private token: string | null = null;

  constructor(apiUrl: string = '', supabaseUrl?: string, supabaseKey?: string) {
    this.apiUrl = apiUrl || '/api';
    
    // Initialize Supabase if credentials are provided
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  // Set authentication token
  public setToken(token: string): void {
    this.token = token;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Feedback API methods
  public async getFeedback(options?: PaginationOptions): Promise<PaginatedResponse<CustomerFeedback>> {
    const params = new URLSearchParams();
    
    if (options) {
      if (options.page) params.append('page', options.page.toString());
      if (options.pageSize) params.append('pageSize', options.pageSize.toString());
      if (options.orderBy) params.append('orderBy', options.orderBy);
      if (options.orderDirection) params.append('orderDirection', options.orderDirection);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<PaginatedResponse<CustomerFeedback>>(`/feedback${queryString}`);
  }

  public async getFeedbackById(id: number | string): Promise<CustomerFeedback> {
    return this.request<CustomerFeedback>(`/feedback/${id}`);
  }

  public async createFeedback(feedback: CustomerFeedback): Promise<CustomerFeedback> {
    return this.request<CustomerFeedback>('/feedback', 'POST', feedback);
  }

  public async updateFeedback(id: number | string, feedback: Partial<CustomerFeedback>): Promise<CustomerFeedback> {
    return this.request<CustomerFeedback>(`/feedback/${id}`, 'PUT', feedback);
  }

  public async deleteFeedback(id: number | string): Promise<void> {
    return this.request<void>(`/feedback/${id}`, 'DELETE');
  }

  public async getFeedbackStats(): Promise<FeedbackStats> {
    return this.request<FeedbackStats>('/feedback/stats');
  }

  // Real-time subscription using Supabase (if available)
  public subscribeFeedbackChanges(callback: (payload: any) => void): (() => void) | null {
    if (!this.supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const subscription = this.supabase
      .channel('public:customer_feedback')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_feedback' },
        callback
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      this.supabase.removeChannel(subscription);
    };
  }

  // WebSocket connection for real-time updates
  public connectWebSocket(url: string = 'ws://localhost:3000'): WebSocket {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // Keep-alive ping
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
    
    return ws;
  }
}

// Create and export a default instance
export const apiClient = new ApiClient();

export default apiClient;