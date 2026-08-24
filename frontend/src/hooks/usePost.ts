import { useState } from 'react';

export function usePost<T>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = async (body: unknown): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(errData.error || `Error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error };
}
