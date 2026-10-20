import { useEffect, useState } from 'react';

/** Devuelve el valor recién cuando dejó de cambiar durante `ms` (para buscadores). */
export function useDebounce<T>(valor: T, ms: number): T {
  const [demorado, setDemorado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setDemorado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return demorado;
}
