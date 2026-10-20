import type { EstadoTurno } from '../types/turno';
import type { ProximoService } from '../types/vehiculo';
import { fechaLarga, km, mostrarPatente } from '../utils/formato';
import { TEXTO_ESTADO_TURNO } from '../utils/estados';

const CLASE_TURNO: Record<EstadoTurno, string> = {
  PENDIENTE: 'estado-pendiente',
  CONFIRMADO: 'estado-confirmado',
  EN_PROCESO: 'estado-proceso',
  COMPLETADO: 'estado-completado',
  CANCELADO: 'estado-cancelado',
};

export function EstadoTurnoBadge({ estado }: { estado: EstadoTurno }) {
  return <span className={`estado ${CLASE_TURNO[estado]}`}>{TEXTO_ESTADO_TURNO[estado]}</span>;
}

const SERVICE = {
  'sin-datos': { clase: 'estado-sin-datos', texto: 'Sin service registrado' },
  ok: { clase: 'estado-confirmado', texto: 'Service al día' },
  proximo: { clase: 'estado-proceso', texto: 'Service próximo' },
  vencido: { clase: 'estado-vencido', texto: 'Service vencido' },
} as const;

/** Estado del service con el detalle de cuándo toca (km o fecha). */
export function ServiceBadge({ service, detalle = false }: { service: ProximoService; detalle?: boolean }) {
  const e = SERVICE[service.estado];
  const partes: string[] = [];
  if (service.proximoKm !== null) partes.push(`a los ${km(service.proximoKm)}`);
  if (service.proximaFecha) partes.push(`antes del ${fechaLarga(service.proximaFecha)}`);
  return (
    <span className="d-inline-flex flex-column gap-1 align-items-start">
      <span className={`estado ${e.clase}`}>{e.texto}</span>
      {detalle && partes.length > 0 && <small className="text-muted">Próximo: {partes.join(' o ')}</small>}
    </span>
  );
}

export function Patente({ patente }: { patente: string }) {
  return <span className="patente">{mostrarPatente(patente)}</span>;
}
