import { useCallback, useEffect, useState } from 'react';
import * as recommendationsApi from '@/api/recommendations.api';
import { extractErrorMessage } from '@/api/axios';
import type { Recommendation } from '@/types/recommendation';

interface UseRecommendationsResult {
  recommendations: Recommendation[];
  usedFallback: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecommendations(limit = 10): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await recommendationsApi.getRecommendations(limit);
      setRecommendations(result.recommendations);
      setUsedFallback(result.usedFallback);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, refetchToken]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { recommendations, usedFallback, isLoading, error, refetch };
}
