import { apiClient } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { User } from '@/types/user';


export async function getCurrentUserProfile(): Promise<User> {
  const res = await apiClient.get<ApiSuccess<{ user: User }>>('/users/me');
  return res.data.data.user;
}
