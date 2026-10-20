import { useState } from 'react';
import { Row, Col, Alert, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiAlertTriangle, FiPackage, FiPlus } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { BotonGuardar, EncabezadoPagina } from '../components/Formulario';
import { insumoSchema, movimientoSchema } from '../schemas/insumoSchema';
import { fechaLarga, horaDe, mensajeDeError } from '../utils/formato';
import type { Insumo, InsumoDetalle } from '../types/insumo';

/**
 * Control de insumos (alcance 5.1): stock de aceites, filtros y productos de lavado.
 * Se descuentan solos al completar un turno o registrar un lavado, según la receta de cada servicio.
 * El personal consulta; el ADMIN carga y ajusta.
 */
export function Insumos() {
  const { tieneRol } = useAuth();
  const esAdmin = tieneRol('ADMIN');
  const { data: insumos, loading, error, recargar } = useFetch<Insumo[]>('/insumos');
  const [modal, setModal] = useState<{ tipo: 'nuevo' } | { tipo: 'movimiento'; insumo: Insumo } | null>(null);
  const [verId, setVerId] = useState<number | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const bajos = (insumos ?? []).filter((i) => i.bajo);
  const listo = (texto: string) => { setModal(null); setOk(texto); recargar(); };

  return (
    <div className="page">
      <EncabezadoPagina
        eyebrow="STOCK"
        titulo="Insumos"
        texto="Se descuentan solos cuando se completa un turno o se registra un lavado. La alerta aparece al llegar al mínimo."
        acciones={esAdmin && <button type="button" className="btn-sgi" onClick={() => setModal({ tipo: 'nuevo' })}><FiPlus /> Nuevo insumo</button>}
      />
      {ok && <Alert variant="success" dismissible onClose={() => setOk(null)}>{ok}</Alert>}
      {bajos.length > 0 && (
        <Alert variant="danger" className="d-flex gap-2 align-items-center">
          <FiAlertTriangle className="flex-shrink-0" />
          <span><strong>{bajos.length === 1 ? '1 insumo llegó' : `${bajos.length} insumos llegaron`} al stock mínimo:</strong> {bajos.map((b) => b.nombre).join(', ')}. Conviene reponer.</span>
        </Alert>
      )}

      {loading && <Cargando />}
      {error && <ErrorCarga mensaje={error} />}
      {insumos && (insumos.length === 0 ? <div className="card-sgi"><Vacio>Todavía no hay insumos cargados.</Vacio></div> : (
        <Row className="g-4">
          {insumos.map((i) => {
            const referencia = Math.max(i.stockMinimo * 3, i.stock, 1);
            return (
              <Col key={i.id} md={6} xl={4}>
                <article className="card-sgi h-100 d-flex flex-column">
                  <div className="card-sgi-body d-flex flex-column gap-3 flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <span className={`icon-circle${i.bajo ? ' terracota' : ''}`}>{i.bajo ? <FiAlertTriangle /> : <FiPackage />}</span>
                      <span className={`estado ${i.bajo ? 'estado-vencido' : 'estado-confirmado'}`}>{i.bajo ? 'Stock bajo' : 'Stock OK'}</span>
                    </div>
                    <div>
                      <h3 className="fs-5 mb-1">{i.nombre}</h3>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="kpi-value" style={{ fontSize: '2rem' }}>{Number(i.stock.toFixed(2))}</span>
                        <span className="text-muted">{i.unidad} · mínimo {i.stockMinimo}</span>
                      </div>
                    </div>
                    <div className="progreso" aria-hidden="true">
                      <span style={{ width: `${Math.min(100, (i.stock / referencia) * 100)}%`, background: i.bajo ? 'var(--primary)' : 'var(--teal)' }} />
                    </div>
                    <div className="small text-muted">
                      {i.servicios && i.servicios.length > 0
                        ? <>Lo usan: {i.servicios.map((s) => `${s.servicio.nombre} (${s.cantidad})`).join(', ')}</>
                        : 'Ningún servicio lo usa todavía.'}
                    </div>
                  </div>
                  <div className="d-flex gap-2 p-3 border-top">
                    <button type="button" className="btn-sgi-ghost" onClick={() => setVerId(verId === i.id ? null : i.id)} aria-expanded={verId === i.id}>
                      {verId === i.id ? 'Ocultar movimientos' : 'Movimientos'}
                    </button>
                    {esAdmin && <button type="button" className="btn-sgi-outline btn-sm-sgi ms-auto" onClick={() => setModal({ tipo: 'movimiento', insumo: i })}>Cargar / ajustar</button>}
                  </div>
                  {verId === i.id && <Movimientos id={i.id} unidad={i.unidad} />}
                </article>
              </Col>
            );
          })}
        </Row>
      ))}

      {modal?.tipo === 'nuevo' && <NuevoInsumo onCerrar={() => setModal(null)} onListo={() => listo('Insumo creado.')} />}
      {modal?.tipo === 'movimiento' && <MovimientoModal insumo={modal.insumo} onCerrar={() => setModal(null)} onListo={(t) => listo(t)} />}
    </div>
  );
}

function Movimientos({ id, unidad }: { id: number; unidad: string }) {
  const { data, loading } = useFetch<InsumoDetalle>(`/insumos/${id}`);
  if (loading) return <Cargando />;
  return (
    <div className="border-top" style={{ maxHeight: 260, overflowY: 'auto' }}>
      {(data?.movimientos ?? []).map((m) => (
        <div key={m.id} className="fila py-2">
          <div className="flex-grow-1">
            <div className="small fw-bold">{m.motivo}</div>
            <div className="fila-sub">{fechaLarga(m.fecha)} {horaDe(m.fecha)}</div>
          </div>
          <strong style={{ color: m.cantidad < 0 ? 'var(--primary)' : 'var(--teal)' }}>{m.cantidad > 0 ? '+' : ''}{Number(m.cantidad.toFixed(2))} {unidad}</strong>
        </div>
      ))}
    </div>
  );
}

function NuevoInsumo({ onCerrar, onListo }: { onCerrar: () => void; onListo: () => void }) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(insumoSchema),
    defaultValues: { nombre: '', unidad: 'litros' as const, stock: '', stockMinimo: '' },
  });
  const onSubmit = handleSubmit(async (datos) => {
    setErrorApi(null);
    try {
      await apiFetch('/insumos', { method: 'POST', body: JSON.stringify(datos) });
      onListo();
    } catch (err) {
      setErrorApi(mensajeDeError(err));
    }
  });
  return (
    <Modal show onHide={onCerrar} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton><Modal.Title>Nuevo insumo</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorApi && <Alert variant="danger">{errorApi}</Alert>}
          <Form.Group className="mb-3" controlId="in-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control {...register('nombre')} isInvalid={!!errors.nombre} placeholder="Ej: Aceite 10W-40" />
            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
          </Form.Group>
          <Row className="g-3">
            <Col sm={4}>
              <Form.Group controlId="in-unidad">
                <Form.Label>Unidad</Form.Label>
                <Form.Select {...register('unidad')}><option value="litros">Litros</option><option value="unidades">Unidades</option></Form.Select>
              </Form.Group>
            </Col>
            <Col sm={4}>
              <Form.Group controlId="in-stock">
                <Form.Label>Stock inicial</Form.Label>
                <Form.Control inputMode="decimal" {...register('stock')} isInvalid={!!errors.stock} />
                <Form.Control.Feedback type="invalid">{errors.stock?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={4}>
              <Form.Group controlId="in-minimo">
                <Form.Label>Mínimo</Form.Label>
                <Form.Control inputMode="decimal" {...register('stockMinimo')} isInvalid={!!errors.stockMinimo} />
                <Form.Control.Feedback type="invalid">{errors.stockMinimo?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><BotonGuardar guardando={isSubmitting} texto="Crear insumo" /></Modal.Footer>
      </Form>
    </Modal>
  );
}

function MovimientoModal({ insumo, onCerrar, onListo }: { insumo: Insumo; onCerrar: () => void; onListo: (texto: string) => void }) {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(movimientoSchema),
    defaultValues: { tipo: 'carga' as const, cantidad: '', motivo: 'Compra al proveedor' },
  });
  const onSubmit = handleSubmit(async ({ tipo, cantidad, motivo }) => {
    setErrorApi(null);
    const signo = tipo === 'carga' ? 1 : -1;
    try {
      await apiFetch(`/insumos/${insumo.id}/movimientos`, { method: 'POST', body: JSON.stringify({ cantidad: signo * cantidad, motivo }) });
      onListo(`${insumo.nombre}: ${tipo === 'carga' ? 'se cargaron' : 'se descontaron'} ${cantidad} ${insumo.unidad}.`);
    } catch (err) {
      setErrorApi(mensajeDeError(err));
    }
  });
  return (
    <Modal show onHide={onCerrar} centered>
      <Form onSubmit={onSubmit} noValidate>
        <Modal.Header closeButton><Modal.Title>{insumo.nombre}</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="text-muted">Stock actual: <strong>{insumo.stock} {insumo.unidad}</strong></p>
          {errorApi && <Alert variant="danger">{errorApi}</Alert>}
          <Form.Group className="mb-3" controlId="mv-tipo">
            <Form.Label>Movimiento</Form.Label>
            <Form.Select {...register('tipo')}>
              <option value="carga">Carga (entra mercadería)</option>
              <option value="ajuste">Ajuste (se rompió, se perdió, inventario)</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="mv-cantidad">
            <Form.Label>Cantidad ({insumo.unidad})</Form.Label>
            <Form.Control inputMode="decimal" {...register('cantidad')} isInvalid={!!errors.cantidad} />
            <Form.Control.Feedback type="invalid">{errors.cantidad?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="mv-motivo">
            <Form.Label>Motivo</Form.Label>
            <Form.Control {...register('motivo')} isInvalid={!!errors.motivo} />
            <Form.Control.Feedback type="invalid">{errors.motivo?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer><BotonGuardar guardando={isSubmitting} texto="Registrar movimiento" /></Modal.Footer>
      </Form>
    </Modal>
  );
}
