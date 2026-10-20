import { Badge } from 'react-bootstrap';
import type { EstadoTurno } from '../types/turno';
import type { ProximoService } from '../types/vehiculo';
import { fechaLarga, km, mostrarPatente } from '../utils/formato';
import { TEXTO_ESTADO_TURNO } from '../utils/estados';

const ESTILO_TURNO: Record<EstadoTurno, { bg: string; dark?: boolean }> = {
  PENDIENTE: { bg: 'secondary' },
  CONFIRMADO: { bg: 'info', dark: true },
  EN_PROCESO: { bg: 'warning', dark: true },
  COMPLETADO: { bg: 'success' },
  CANCELADO: { bg: 'danger' },
};

export function EstadoTurnoBadge({ estado }: { estado: EstadoTurno }) {
  const e = ESTILO_TURNO[estado];
  return (
    <Badge bg={e.bg} text={e.dark ? 'dark' : undefined}>
      {TEXTO_ESTADO_TURNO[estado]}
    </Badge>
  );
}

const ESTILO_SERVICE = {
  'sin-datos': { bg: 'secondary', texto: 'Sin service registrado' },
  ok: { bg: 'success', texto: 'Service al día' },
  proximo: { bg: 'warning', texto: 'Service próximo' },
  vencido: { bg: 'danger', texto: 'Service vencido' },
} as const;

/** Estado del service con el detalle de cuándo toca (km o fecha). */
export function ServiceBadge({ service, detalle = false }: { service: ProximoService; detalle?: boolean }) {
  const e = ESTILO_SERVICE[service.estado];
  const partes: string[] = [];
  if (service.proximoKm !== null) partes.push(`a los ${km(service.proximoKm)}`);
  if (service.proximaFecha) partes.push(`antes del ${fechaLarga(service.proximaFecha)}`);
  return (
    <span className="d-inline-flex flex-column gap-1">
      <Badge bg={e.bg} text={service.estado === 'proximo' ? 'dark' : undefined} className="align-self-start">
        {e.texto}
      </Badge>
      {detalle && partes.length > 0 && <small className="text-muted">Próximo: {partes.join(' o ')}</small>}
    </span>
  );
}

export function Patente({ patente }: { patente: string }) {
  return (
    <span className="badge bg-secondary text-white px-2 py-1" style={{ letterSpacing: '1px' }}>
      {mostrarPatente(patente)}
    </span>
  );
}
