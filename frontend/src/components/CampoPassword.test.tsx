import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampoPassword } from './CampoPassword';

describe('CampoPassword: mostrar u ocultar la contraseña (Dado / Cuando / Entonces)', () => {
  it('Dado el campo oculto, Cuando toca el ojito, Entonces la contraseña se ve; y al tocarlo de nuevo se oculta', () => {
    render(<CampoPassword aria-label="Contraseña" defaultValue="secreta123" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('Dado un error de validación, Entonces se muestra debajo del campo', () => {
    render(<CampoPassword aria-label="Contraseña" error="Mínimo 6 caracteres" />);
    expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toHaveClass('is-invalid');
  });
});
