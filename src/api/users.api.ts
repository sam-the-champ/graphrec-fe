import { apiClient } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { User } from '@/types/user';

/**
 * Identical response shape to GET /api/auth/me (see user.controller.js
 * comment: it's a deliberate alias). Kept as its own API function so the
 * Profile page can call the /users namespace semantically, even though
 * today it returns exactly the same data as auth.api.ts's getMe().
 */
export async function getCurrentUserProfile(): Promise<User> {
  const res = await apiClient.get<ApiSuccess<{ user: User }>>('/users/me');
  return res.data.data.user;
}
