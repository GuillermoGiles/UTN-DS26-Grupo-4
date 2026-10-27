import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FiEye, FiEyeOff } from 'react-icons/fi';

type Props = Omit<ComponentPropsWithoutRef<typeof Form.Control>, 'type'> & { error?: string };

/**
 * Input de contraseña con el botón para mostrarla u ocultarla.
 * Se usa igual que un Form.Control con react-hook-form: <CampoPassword {...register('password')} />
 */
export const CampoPassword = forwardRef<HTMLInputElement, Props>(function CampoPassword({ error, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup hasValidation>
      <Form.Control ref={ref} type={visible ? 'text' : 'password'} isInvalid={!!error} {...props} />
      <button
        type="button"
        className="btn btn-outline-secondary d-flex align-items-center"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <FiEyeOff /> : <FiEye />}
      </button>
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </InputGroup>
  );
});
