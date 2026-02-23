import { useState, useEffect, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseQueryOptions<T> {
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>;
  dependencies?: any[];
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: PostgrestError) => void;
}

export function useSupabaseQuery<T>({
  queryFn,
  dependencies = [],
  enabled = true,
  onSuccess,
  onError,
}: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: queryError } = await queryFn();

      if (queryError) {
        console.error('Query error:', queryError);
        setError(queryError);
        setLoading(false);
        onError?.(queryError);
      } else if (result) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      const error = err as PostgrestError;
      setError(error);
      setLoading(false);
      onError?.(error);
    }
  }, [queryFn, enabled, onSuccess, onError]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch };
}
