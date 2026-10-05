// CLIENTES DE DEMOSTRACIÓN para el área interna (login mock). Son personas ficticias: no son
// clientes reales de la empresa. `usuario`/`password` solo sirven para el login simulado de
// `utils/authMock.js` (no hay seguridad real). `asesorId` enlaza con `./asesoresMock.js`.
//
// Cuando exista PostgreSQL, este archivo se reemplaza por la tabla `clientes` y la contraseña deja
// de estar en el frontend.
//
// ACTIVACIÓN: estos clientes de demostración ya tienen contraseña y NO llevan el campo `activado`,
// así que se consideran activos. Solo los clientes que da de alta administración (guardados en
// localStorage, ver `getClientes()`) nacen con `activado: false` hasta que activan su cuenta.
import { CLAVES, leerJSON } from '../utils/almacenamiento'

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
  
]

/**
 * Todos los clientes: los de demostración + los dados de alta por administración en este navegador
 * (`leones_clientes`, los escribe `services/api.js`). Es la lista que usan el login y la API.
 */
export function getClientes() {
  const nuevos = leerJSON(CLAVES.clientes, [])
  return Array.isArray(nuevos) ? [...clientesMock, ...nuevos] : clientesMock
}

/** Una cuenta está activa salvo que se haya creado pendiente de activación (`activado: false`). */
export function cuentaActivada(cliente) {
  return cliente?.activado !== false
}

export function getClienteMockById(id) {
  return getClientes().find((cliente) => String(cliente.id) === String(id)) ?? null
}
