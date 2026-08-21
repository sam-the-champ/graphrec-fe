import { apiClient } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth';
import type { User } from '@/types/user';

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', payload);
  return res.data.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', payload);
  return res.data.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiSuccess<{ user: User }>>('/auth/me');
  return res.data.data.user;
}
