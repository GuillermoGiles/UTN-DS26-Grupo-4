import { Link } from 'react-router-dom';
import { BsCarFrontFill } from 'react-icons/bs';

export function Marca({ a = '/' }: { a?: string }) {
  return (
    <Link to={a} className="marca" aria-label="Gestión San José, inicio">
      <span className="marca-icono"><BsCarFrontFill size={20} /></span>
      <span>Gestión San José</span>
    </Link>
  );
}
