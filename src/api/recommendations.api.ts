import { apiClient } from './axios';
import type { ApiSuccess } from '@/types/api';
import type { RecommendationsResponse } from '@/types/recommendation';

export async function getRecommendations(limit = 10): Promise<RecommendationsResponse> {
  const res = await apiClient.get<ApiSuccess<RecommendationsResponse>>('/recommendations', {
    params: { limit },
  });
  return res.data.data;
}
