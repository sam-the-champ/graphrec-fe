/**
 * Matches src/utils/response.js in the backend exactly:
 *   ok/created  -> { success: true, data: T }
 *   errorMiddleware -> { success: false, error: { message, code?, details?, stack? } }
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: ApiErrorDetail[];
    stack?: string;
  };
}
