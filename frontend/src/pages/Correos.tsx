import { useState } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { FiAlertCircle, FiMail, FiSend, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../services/api';
import { Cargando, ErrorCarga, Vacio } from '../components/Estado';
import { EncabezadoPagina } from '../components/Formulario';
import { fechaLarga, horaDe, mensajeDeError } from '../utils/formato';
import type { ListadoCorreos } from '../types/insumo';

const ESTADO = {
  ENVIADO: { clase: 'estado-completado', texto: 'Enviado' },
  SIMULADO: { clase: 'estado-sin-datos', texto: 'Simulado' },
  FALLIDO: { clase: 'estado-vencido', texto: 'Falló' },
} as const;

/** Recordatorios por e-mail (alcance 5.1). Salen solos cada hora para los turnos de mañana. */
export function Correos() {
  const { data, loading, error, recargar } = useFetch<ListadoCorreos>('/correos');
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviarManana = async () => {
    setEnviando(true);
    setAviso(null);
    try {
      const r = await apiFetch<{ fecha: string; enviados: number }>('/correos/recordatorios', { method: 'POST' });
      setAviso({ tipo: 'success', texto: r.enviados ? `Se mandaron ${r.enviados} recordatorios para el ${r.fecha}.` : `No quedan turnos del ${r.fecha} sin recordatorio.` });
      recargar();
    } catch (err) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(err) });
    } finally {
      setEnviando(false);
    }
  };

  if (loading && !data) return <Cargando />;
  if (error) return <div className="page"><ErrorCarga mensaje={error} /></div>;
  if (!data) return null;

  return (
    <div className="page">
      <EncabezadoPagina
        eyebrow="RECORDATORIOS"
        titulo="Correos"
        texto="Cada hora el sistema avisa por e-mail a los clientes con turno para mañana. También se puede mandar a mano."
        acciones={<button type="button" className="btn-sgi" onClick={enviarManana} disabled={enviando}><FiSend /> {enviando ? 'Enviando...' : 'Enviar los de mañana'}</button>}
      />
      {!data.configurado && (
        <Alert variant="warning" className="d-flex gap-2">
          <FiAlertCircle className="flex-shrink-0 mt-1" />
          <span><strong>El correo no está configurado.</strong> Faltan las variables SMTP_HOST, SMTP_USER y SMTP_PASS del servidor; mientras tanto los recordatorios quedan registrados como <em>simulados</em> y no le llegan al cliente.</span>
        </Alert>
      )}
      {aviso && <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)}>{aviso.texto}</Alert>}

      <Row className="g-3 mb-4">
        {[
          { icono: <FiCheckCircle />, clase: '', t: 'ENVIADOS', n: data.totales.enviados },
          { icono: <FiMail />, clase: 'ambar', t: 'SIMULADOS', n: data.totales.simulados },
          { icono: <FiXCircle />, clase: 'terracota', t: 'FALLIDOS', n: data.totales.fallidos },
        ].map((k) => (
          <Col key={k.t} md={4}>
            <div className="card-sgi kpi">
              <span className={`icon-circle ${k.clase}`}>{k.icono}</span>
              <div className="kpi-label">{k.t}</div>
              <div className="kpi-value">{k.n}</div>
            </div>
          </Col>
        ))}
      </Row>

      <section className="card-sgi">
        <div className="card-sgi-header"><h5>Últimos envíos</h5></div>
        {data.correos.length === 0 ? <Vacio>Todavía no se mandó ningún recordatorio.</Vacio> : data.correos.map((c) => (
          <div key={c.id} className="fila">
            <div className="flex-grow-1">
              <div className="fila-titulo">{c.asunto}</div>
              <div className="fila-sub">{c.destinatario} · {fechaLarga(c.createdAt)} {horaDe(c.createdAt)}{c.error ? ` · ${c.error}` : ''}</div>
            </div>
            <span className={`estado ${ESTADO[c.estado].clase}`}>{ESTADO[c.estado].texto}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
