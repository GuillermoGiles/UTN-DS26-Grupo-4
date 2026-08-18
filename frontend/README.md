# Frontend — SGI Lavadero y Lubricentro San José

## Descripción

Frontend del Sistema de Gestión Integral para el Lavadero y Lubricentro "San José". Permite gestionar servicios, clientes, vehículos, turnos, lavados y usuarios a través de una interfaz web responsiva.

## Stack Tecnológico

- **React 19** + **TypeScript** — librería de UI con tipado estático
- **Vite** — bundler y dev server
- **React Router DOM v7** — navegación SPA sin recarga
- **React Bootstrap + Bootstrap 5** — componentes UI responsivos
- **Zod** — validación de esquemas en formularios
- **React Hook Form** — manejo eficiente de formularios
- **React Icons** — iconografía

## Estructura del Proyecto

```
frontend/src/
├── components/          # Componentes reutilizables
│   ├── Layout/          #   Header, Footer, Layout wrapper
│   ├── NavbarSGI.tsx    #   Barra de navegación
│   ├── ServicioDestacado.tsx
│   ├── TurnoCard.tsx
│   └── ResumenCaja.tsx
├── pages/               # Páginas (una por ruta)
│   ├── Home.tsx         #   Landing page con servicios destacados
│   ├── Servicios.tsx    #   Catálogo de servicios
│   ├── ServicioNuevo.tsx#   Alta de servicio (formulario + Zod)
│   ├── Clientes.tsx     #   Directorio de clientes
│   ├── ClienteNuevo.tsx #   Alta de cliente (formulario + Zod)
│   ├── PerfilCliente.tsx#   Detalle de cliente
│   ├── VehiculosPage.tsx#   Listado de vehículos
│   ├── VehiculoNuevo.tsx#   Alta de vehículo
│   ├── AltaTurno.tsx    #   Alta de turno (formulario + Zod)
│   ├── AltaLavado.tsx   #   Registro de lavado
│   ├── AltaUsuario.tsx  #   Alta de usuario/empleado
│   └── PanelGestion.tsx #   Panel administrativo
├── hooks/
│   └── useFetch.ts      # Hook genérico para consumir APIs (data/loading/error)
├── schemas/             # Esquemas Zod para validación de formularios
│   ├── clienteSchema.ts
│   └── servicioSchema.ts
├── validations/         # Esquemas Zod adicionales
│   ├── turnoSchema.ts
│   ├── lavadoSchema.ts
│   └── usuarioSchema.ts
├── types/
│   └── servicio.ts      # Interfaces TypeScript del dominio
├── data/
│   └── servicios.ts     # Datos mock hardcodeados
└── assets/              # Imágenes y recursos estáticos
```

## Navegación (Rutas)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Landing con servicios destacados |
| `/servicios` | Servicios | Catálogo completo de servicios |
| `/servicios/nuevo` | ServicioNuevo | Formulario de alta de servicio |
| `/clientes` | Clientes | Directorio de clientes |
| `/clientes/nuevo` | ClienteNuevo | Formulario de alta de cliente |
| `/perfil-cliente` | PerfilCliente | Detalle/ficha de un cliente |
| `/vehiculos` | VehiculosPage | Listado de vehículos |
| `/vehiculos/nuevo` | VehiculoNuevo | Alta de vehículo |
| `/turnos/nuevo` | AltaTurno | Reserva de turno |
| `/lavados/nuevo` | AltaLavado | Registro de lavado |
| `/usuarios/nuevo` | AltaUsuario | Alta de usuario/empleado |
| `/panel` | PanelGestion | Panel administrativo |

## Datos Mock

Los datos de prueba se encuentran en `public/` como archivos JSON estáticos (`servicios.json`, `clientes.json`) consumidos por el hook `useFetch`. En la versión de producción, estos se reemplazarán por llamadas a la API del backend.

## Cómo ejecutar

```bash
cd frontend
npm install
npm run dev
# Abrir http://localhost:5173
```
