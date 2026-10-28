/**
 * Aviso de "cambió el stock" entre pantallas que no comparten estado.
 * El contador de insumos bajos del menú (Sidebar) se pide una vez al entrar; cuando algo
 * mueve el stock (cargar/ajustar un insumo, completar un turno, registrar un lavado),
 * esa pantalla llama a avisarCambioDeStock() y el Sidebar vuelve a pedir /insumos.
 */
export const EVENTO_STOCK = 'sgi:stock-actualizado';

export const avisarCambioDeStock = () => window.dispatchEvent(new Event(EVENTO_STOCK));
