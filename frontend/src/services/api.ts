import { obtenerToken } from './sesion';

export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const BASE = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = obtenerToken();
  const tieneHeaderAuth = Boolean(
    opciones.headers && (
      opciones.headers instanceof Headers
        ? opciones.headers.has('Authorization')
        : Array.isArray(opciones.headers)
        ? opciones.headers.some(([k]) => k.toLowerCase() === 'authorization')
        : 'Authorization' in (opciones.headers as Record<string, unknown>)
    )
  );
  const seEnvioToken = Boolean(token) || tieneHeaderAuth;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opciones.headers,
  };

  const res = await fetch(`${BASE}${ruta}`, {
    ...opciones,
    headers,
  });

  const cuerpo = await res.json().catch(() => null);

  if (!res.ok) {
    // Si el backend responde 401 y se había enviado un token, la sesión venció o no es válida
    if (res.status === 401 && seEnvioToken && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(EVENTO_SESION_EXPIRADA, {
          detail: {
            status: res.status,
            mensaje: cuerpo?.error ?? 'Sesión expirada',
          },
        })
      );
    }

    const mensaje = cuerpo?.error ?? `Error ${res.status}`;
    throw new ApiError(res.status, mensaje, cuerpo);
  }

  return cuerpo as T;
}

