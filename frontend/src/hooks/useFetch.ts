import { useState, useEffect } from 'react';

export function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(url);
                if (!res.ok) throw new Error('Error al cargar los datos');
                setData(await res.json());
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        cargar();
    }, [url]);

    return { data, loading, error };
}
