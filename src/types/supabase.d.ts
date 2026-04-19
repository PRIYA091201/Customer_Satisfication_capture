import { CustomerFeedback, HealthCheck } from './database.types';

/**
 * Augment the Supabase Database type definitions.
 * This allows for better type safety when working with Supabase client.
 */
declare module '@supabase/supabase-js' {
  export interface Database {
    public: {
      Tables: {
        customer_feedback: {
          Row: CustomerFeedback;
          Insert: Omit<CustomerFeedback, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<CustomerFeedback, 'id' | 'created_at' | 'updated_at'>>;
        };
        health_check: {
          Row: HealthCheck;
          Insert: Omit<HealthCheck, 'id' | 'timestamp'>;
          Update: Partial<Omit<HealthCheck, 'id' | 'timestamp'>>;
        };
        migrations: {
          Row: {
            id: number;
            name: string;
            applied_at: string;
          };
          Insert: Omit<Row, 'id' | 'applied_at'>;
          Update: Partial<Omit<Row, 'id' | 'applied_at'>>;
        };
      };
      
      Functions: {
        get_average_rating: {
          Args: Record<string, never>;
          Returns: number;
        };
        get_rating_counts: {
          Args: Record<string, never>;
          Returns: Array<{ rating: number; count: number }>;
        };
        get_feedback_stats: {
          Args: { days?: number };
          Returns: Record<string, any>;
        };
        execute_sql: {
          Args: { query: string; params?: any[] };
          Returns: any;
        };
      };
    };
  }
}

// Export nothing, this is just for type augmentation
export {};