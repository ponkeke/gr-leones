// Datos mock de asesores comerciales mientras no existe backend/API de asesores.
// Nombre, cargo y foto se reutilizan del equipo real (`data/equipo.js`,
// categoría "Asesores"): no se inventan personas nuevas. El celular real de cada asesor
// todavía no fue entregado, por eso queda en null (no se inventa un número).
// `disponible` es un estado operativo temporal (todos disponibles por defecto) que en el
// futuro vendrá del backend en tiempo real; no es una afirmación real sobre cada persona.
// `codigo`, `usuario` y `password` son credenciales de DEMOSTRACIÓN para el login mock del área
// interna (`utils/authMock.js`): no son cuentas reales ni ofrecen seguridad alguna. `getAsesores()`
// las quita antes de entregar la lista a los formularios públicos.
import asVen1 from '../assets/images/asVentas1.png'
import asVen2 from '../assets/images/asVentas2.png'
import asVen3 from '../assets/images/asVentas3.png'
import asVen4 from '../assets/images/asVentas4.png'

export const asesoresMock = [
  {
    id: 'asesora-ventas-1',
    codigo: 'ASE001',
    usuario: 'asesor01',
    password: '123456',
    nombre: 'Romely Schipper',
    cargo: 'Asesora de ventas',
    telefono: null,
    foto: asVen1,
    disponible: true,
  },
  {
    id: 'asesora-ventas-2',
    codigo: 'ASE002',
    usuario: 'asesor02',
    password: '123456',
    nombre: 'Nahomy Limas',
    cargo: 'Asesora de ventas',
    telefono: null,
    foto: asVen2,
    disponible: true,
  },
  {
    id: 'asesora-ventas-3',
    codigo: 'ASE003',
    usuario: 'asesor03',
    password: '123456',
    nombre: 'Lucero Beltrán',
    cargo: 'Asesora de ventas',
    telefono: null,
    foto: asVen3,
    disponible: true,
  },
  {
    id: 'asesora-ventas-4',
    codigo: 'ASE004',
    usuario: 'asesor04',
    password: '123456',
    nombre: 'Alessandra Mercado',
    cargo: 'Asesora de ventas',
    telefono: null,
    foto: asVen4,
    disponible: true,
  },
]
