import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '@/types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  // Fail loudly at dev-time rather than silently hitting a relative URL.
  // eslint-disable-next-line no-console
  console.error(
    '[config] VITE_API_BASE_URL is not set. Copy .env.example to .env and set it to your backend URL (e.g. http://localhost:5000/api).'
  );
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_STORAGE_KEY = 'graphrec_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}


apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fired whenever the backend rejects a token as missing/invalid/expired
 * (401 UNAUTHORIZED, per auth.middleware.js). AuthContext subscribes to
 * this to clear local state and redirect to /login — this is how the app
 * handles "expired authentication" without inventing a refresh-token flow
 * the backend doesn't implement.
 */
type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

export function onUnauthorized(listener: UnauthorizedListener): void {
  unauthorizedListener = listener;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && unauthorizedListener) {
      unauthorizedListener();
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a human-readable message from any error thrown by apiClient,
 * falling back gracefully for network errors / unexpected shapes so the
 * UI never has to render a raw Axios error object.
 */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) {
      // Surface field-level validation details if present (400s from Zod).
      if (body.error.details && body.error.details.length > 0) {
        return `${body.error.message}: ${body.error.details
          .map((d) => `${d.path} — ${d.message}`)
          .join('; ')}`;
      }
      return body.error.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Could not reach the server. Check your connection and try again.';
    }
    return error.message || 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
