// CLIENTES DE DEMOSTRACIÓN para el área interna (login mock). Son personas ficticias: no son
// clientes reales de la empresa. `usuario`/`password` solo sirven para el login simulado de
// `utils/authMock.js` (no hay seguridad real). `asesorId` enlaza con `./asesoresMock.js`.
//
// Cuando exista PostgreSQL, este archivo se reemplaza por la tabla `clientes` y la contraseña deja
// de estar en el frontend.
export const clientesMock = [
  {
    id: 1,
    codigo: 'CLI001',
    nombre: 'María López',
    usuario: 'cliente01',
    password: '123456',
    dni: '70000001',
    telefono: '999999999',
    email: 'maria@gmail.com',
    asesorId: 'asesora-ventas-1',
  },
  {
    id: 2,
    codigo: 'CLI002',
    nombre: 'Carlos Pérez',
    usuario: 'cliente02',
    password: '123456',
    dni: '70000002',
    telefono: '988888888',
    email: 'carlos@gmail.com',
    asesorId: 'asesora-ventas-1',
  },
  {
    id: 3,
    codigo: 'CLI003',
    nombre: 'Rosa Huamán',
    usuario: 'cliente03',
    password: '123456',
    dni: '70000003',
    telefono: '977777777',
    email: 'rosa@gmail.com',
    asesorId: 'asesora-ventas-1',
  },
  {
    id: 4,
    codigo: 'CLI004',
    nombre: 'Jorge Quispe',
    usuario: 'cliente04',
    password: '123456',
    dni: '70000004',
    telefono: '966666666',
    email: 'jorge@gmail.com',
    asesorId: 'asesora-ventas-2',
  },
]

export function getClienteMockById(id) {
  return clientesMock.find((cliente) => String(cliente.id) === String(id)) ?? null
}
