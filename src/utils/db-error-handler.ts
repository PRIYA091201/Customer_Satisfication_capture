import { PostgrestError } from '@supabase/supabase-js';
import logger from './logger';

/**
 * Database error types
 */
export enum DbErrorType {
  // Connection errors
  CONNECTION_FAILED = 'connection_failed',
  CONNECTION_LOST = 'connection_lost',
  TIMEOUT = 'timeout',
  
  // Authentication errors
  AUTH_FAILED = 'auth_failed',
  PERMISSION_DENIED = 'permission_denied',
  
  // Data errors
  CONSTRAINT_VIOLATION = 'constraint_violation',
  FOREIGN_KEY_VIOLATION = 'foreign_key_violation',
  UNIQUE_VIOLATION = 'unique_violation',
  NOT_NULL_VIOLATION = 'not_null_violation',
  CHECK_VIOLATION = 'check_violation',
  
  // Query errors
  SYNTAX_ERROR = 'syntax_error',
  INVALID_PARAMETER = 'invalid_parameter',
  
  // Other errors
  TABLE_NOT_FOUND = 'table_not_found',
  COLUMN_NOT_FOUND = 'column_not_found',
  VALUE_TOO_LONG = 'value_too_long',
  
  // Generic errors
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Structured database error with additional context
 */
export interface DbError {
  type: DbErrorType;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  originalError?: any;
}

/**
 * Handle PostgrestError and convert to structured DbError
 */
export function handlePostgrestError(error: PostgrestError, context?: string): DbError {
  if (!error) {
    return {
      type: DbErrorType.UNKNOWN_ERROR,
      message: 'Unknown database error',
    };
  }

  // Log the error with context if provided
  if (context) {
    logger.error(`Database error in ${context}:`, error);
  } else {
    logger.error('Database error:', error);
  }

  // Analyze error code to determine type
  const { code, message, details, hint } = error;

  let errorType = DbErrorType.UNKNOWN_ERROR;
  let errorMessage = message || 'Unknown database error';

  // Map Postgres error codes to our error types
  // See: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (code) {
    // Connection errors
    if (code === '08000' || code === '08003' || code === '08006') {
      errorType = DbErrorType.CONNECTION_FAILED;
    } 
    // Authentication errors
    else if (code === '28000' || code === '28P01') {
      errorType = DbErrorType.AUTH_FAILED;
    } 
    else if (code === '42501') {
      errorType = DbErrorType.PERMISSION_DENIED;
    }
    // Constraint violations
    else if (code.startsWith('23')) {
      if (code === '23503') {
        errorType = DbErrorType.FOREIGN_KEY_VIOLATION;
      } else if (code === '23505') {
        errorType = DbErrorType.UNIQUE_VIOLATION;
      } else if (code === '23502') {
        errorType = DbErrorType.NOT_NULL_VIOLATION;
      } else if (code === '23514') {
        errorType = DbErrorType.CHECK_VIOLATION;
      } else {
        errorType = DbErrorType.CONSTRAINT_VIOLATION;
      }
    }
    // Syntax errors
    else if (code.startsWith('42')) {
      if (code === '42P01') {
        errorType = DbErrorType.TABLE_NOT_FOUND;
      } else if (code === '42703') {
        errorType = DbErrorType.COLUMN_NOT_FOUND;
      } else {
        errorType = DbErrorType.SYNTAX_ERROR;
      }
    }
    // Timeout errors
    else if (code === '57014') {
      errorType = DbErrorType.TIMEOUT;
    }
    // Value errors
    else if (code === '22001') {
      errorType = DbErrorType.VALUE_TOO_LONG;
    }
    // Server errors
    else if (code.startsWith('53') || code.startsWith('54') || code.startsWith('58') || code.startsWith('XX')) {
      errorType = DbErrorType.SERVER_ERROR;
    }
  }

  // Format friendly error message based on type
  switch (errorType) {
    case DbErrorType.UNIQUE_VIOLATION:
      errorMessage = 'This record already exists. Duplicate entry found.';
      break;
    case DbErrorType.FOREIGN_KEY_VIOLATION:
      errorMessage = 'Referenced record does not exist.';
      break;
    case DbErrorType.NOT_NULL_VIOLATION:
      errorMessage = 'Required field is missing.';
      break;
    case DbErrorType.TABLE_NOT_FOUND:
      errorMessage = 'The requested table does not exist.';
      break;
    case DbErrorType.CONNECTION_FAILED:
      errorMessage = 'Could not connect to database.';
      break;
    case DbErrorType.PERMISSION_DENIED:
      errorMessage = 'You do not have permission to perform this operation.';
      break;
    default:
      // Use the original message if we don't have a friendly version
      break;
  }

  return {
    type: errorType,
    message: errorMessage,
    code,
    details,
    hint,
    originalError: error
  };
}

/**
 * Wrap database operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context?: string
): Promise<{ data: T | null; error: DbError | null }> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      return { 
        data: null, 
        error: handlePostgrestError(error, context)
      };
    }
    
    return { data, error: null };
  } catch (error: any) {
    logger.error(`Unexpected error in database operation${context ? ` (${context})` : ''}:`, error);
    
    return {
      data: null,
      error: {
        type: DbErrorType.UNKNOWN_ERROR,
        message: error.message || 'An unexpected error occurred',
        originalError: error
      }
    };
  }
}

/**
 * Map database error to appropriate HTTP status code
 */
export function mapErrorToStatusCode(error: DbError): number {
  switch (error.type) {
    case DbErrorType.NOT_FOUND:
      return 404;
    case DbErrorType.PERMISSION_DENIED:
      return 403;
    case DbErrorType.AUTH_FAILED:
      return 401;
    case DbErrorType.UNIQUE_VIOLATION:
    case DbErrorType.CONSTRAINT_VIOLATION:
    case DbErrorType.FOREIGN_KEY_VIOLATION:
    case DbErrorType.NOT_NULL_VIOLATION:
    case DbErrorType.VALUE_TOO_LONG:
    case DbErrorType.INVALID_PARAMETER:
      return 400;
    case DbErrorType.CONNECTION_FAILED:
    case DbErrorType.CONNECTION_LOST:
    case DbErrorType.TIMEOUT:
      return 503;
    case DbErrorType.TABLE_NOT_FOUND:
    case DbErrorType.COLUMN_NOT_FOUND:
    case DbErrorType.SYNTAX_ERROR:
    case DbErrorType.SERVER_ERROR:
    default:
      return 500;
  }
}

export default {
  DbErrorType,
  handlePostgrestError,
  withErrorHandling,
  mapErrorToStatusCode
};