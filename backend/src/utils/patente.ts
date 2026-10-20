/** "ab 123-cd" → "AB123CD". Es la forma en que se guarda y se busca. */
export function normalizarPatente(patente: string): string {
  return patente.replace(/[\s-]/g, "").toUpperCase();
}

/** Formatos argentinos: viejo (ABC123) y Mercosur (AB123CD). */
export const PATENTE_REGEX = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
