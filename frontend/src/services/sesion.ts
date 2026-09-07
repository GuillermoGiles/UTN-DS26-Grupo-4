export function guardarToken(token: string) {
  localStorage.setItem('token', token);
}

export function obtenerToken(): string | null {
  return localStorage.getItem('token');
}

export function borrarToken() {
  localStorage.removeItem('token');
}
