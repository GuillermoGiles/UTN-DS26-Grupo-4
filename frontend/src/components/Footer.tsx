// Definimos las props tipadas que exige la consigna
type FooterProps = {
  nombreNegocio: string;
  anio: number;
};

export function Footer({ nombreNegocio, anio }: FooterProps) {
  return (
    <footer className="bg-dark text-light text-center py-4 mt-auto w-100">
      <div className="container">
        <h5 className="fw-bold mb-2">{nombreNegocio}</h5>
        <p className="text-muted small mb-2">
          Sistema de Gestión de Turnos y Vehículos
        </p>
        <hr className="border-secondary" />
        <p className="mb-0 small">
          &copy; {anio} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}