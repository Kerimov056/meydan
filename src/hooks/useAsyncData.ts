import { DependencyList, useCallback, useEffect, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, dependencies: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Məlumat yüklənmədi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, setData, loading, refreshing, error, reload: () => load(true) };
}
