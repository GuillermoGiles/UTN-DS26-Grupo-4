import { useState } from 'react';
import { apiFetch } from '../services/api';

// Usa apiFetch para que la URL base y el Bearer token salgan del mismo lugar que el resto de la app
export function usePost<T>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = async (body: unknown): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      return await apiFetch<T>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error };
}
