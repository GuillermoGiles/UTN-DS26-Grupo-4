import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        const result = await apiFetch<T>(url);
        if (montado) setData(result);
      } catch (err) {
        if (montado && err instanceof Error) setError(err.message);
        else if (montado) setError(String(err));
      } finally {
        if (montado) setLoading(false);
      }
    }
    
    fetchData();
    return () => { montado = false; };
  }, [url]);

  return { data, loading, error };
}
