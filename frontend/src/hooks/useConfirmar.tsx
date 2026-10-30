import { useCallback, useState, type ReactNode } from 'react';
import { Modal } from 'react-bootstrap';
import { FiAlertTriangle } from 'react-icons/fi';

type Opciones = {
  titulo: string;
  texto?: ReactNode;
  boton?: string; // texto del botón que confirma (por defecto "Borrar")
};

/**
 * Diálogo de confirmación con el estilo de la app (en vez del window.confirm del navegador).
 * Uso:  const { confirmar, modalConfirmar } = useConfirmar();
 *       if (!(await confirmar({ titulo: '¿Borrar a Juan?' }))) return;
 *       ...y renderizar {modalConfirmar} en la pantalla.
 */
export function useConfirmar() {
  const [pedido, setPedido] = useState<{ opciones: Opciones; responder: (ok: boolean) => void } | null>(null);

  const confirmar = useCallback(
    (opciones: Opciones) => new Promise<boolean>((responder) => setPedido({ opciones, responder })),
    [],
  );

  const cerrar = (ok: boolean) => {
    pedido?.responder(ok);
    setPedido(null);
  };

  const modalConfirmar = (
    <Modal show={pedido !== null} onHide={() => cerrar(false)} centered>
      <Modal.Body className="p-4 d-flex gap-3 align-items-start">
        <span className="icon-circle" style={{ background: '#fdecea', color: '#c4432c', flexShrink: 0 }}><FiAlertTriangle /></span>
        <div>
          <h5 className="display fs-5 mb-2">{pedido?.opciones.titulo}</h5>
          {pedido?.opciones.texto && <p className="text-muted mb-0">{pedido.opciones.texto}</p>}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 px-4 pb-4">
        <button type="button" className="btn-sgi-ghost" onClick={() => cerrar(false)}>No, volver</button>
        <button type="button" className="btn-sgi" onClick={() => cerrar(true)} autoFocus>{pedido?.opciones.boton ?? 'Borrar'}</button>
      </Modal.Footer>
    </Modal>
  );

  return { confirmar, modalConfirmar };
}
