import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/api';

/**
 * GET a la API con los tres estados (data / loading / error).
 * - url null: no pide nada (ej. todavía no se eligió el cliente).
 * - recargar(): vuelve a pedir, para refrescar después de un alta, edición o borrado.
 */
export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(url !== null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (url === null) return; // nada que pedir: el valor devuelto se deriva abajo
    let montado = true;

    async function fetchData(ruta: string) {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFetch<T>(ruta);
        if (montado) setData(result);
      } catch (err) {
        if (montado) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (montado) setLoading(false);
      }
    }

    fetchData(url);
    return () => {
      montado = false;
    };
  }, [url, version]);

  // Con url null no hay carga en curso ni datos (se deriva, sin setState en el efecto)
  return {
    data: url === null ? null : data,
    loading: url === null ? false : loading,
    error: url === null ? null : error,
    recargar,
  };
}
