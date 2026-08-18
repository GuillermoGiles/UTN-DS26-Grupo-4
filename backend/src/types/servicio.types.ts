export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  desc: string;
  tipo: "lavadero" | "lubricentro";
}
