import { useCallback, useEffect, useState } from 'react';
import * as tutorialsApi from '@/api/tutorials.api';
import { extractErrorMessage } from '@/api/axios';
import type { ListTutorialsParams, Tutorial } from '@/types/tutorial';

interface UseTutorialsResult {
  tutorials: Tutorial[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTutorials(params: ListTutorialsParams): UseTutorialsResult {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bump to force a refetch without changing filter params.
  const [refetchToken, setRefetchToken] = useState(0);

  const difficulty = params.difficulty;
  const limit = params.limit;
  const offset = params.offset;

  const fetchTutorials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tutorialsApi.getTutorials({ difficulty, limit, offset });
      setTutorials(result.tutorials);
      setCount(result.count);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, limit, offset, refetchToken]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { tutorials, count, isLoading, error, refetch };
}
