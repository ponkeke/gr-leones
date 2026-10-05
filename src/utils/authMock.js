// CAPA DE COMPATIBILIDAD TEMPORAL. La sesión pasó a `services/sesion.js` y el inicio/cierre de sesión a
// `services/api.js` (`iniciarSesion`, `cerrarSesion`, con estrategia mock o http). Ninguna pantalla ni
// servicio importa ya este archivo; se conserva solo para no romper importaciones antiguas y se puede
// borrar cuando se confirme que nadie lo usa.
//
// IMPORTANTE: las credenciales mock no son autenticación de producción (ver `services/mock/credenciales.js`).
import { autenticarMock, esCuentaPendienteDeActivacion } from '../services/mock/credenciales'
import {
  TIPOS_USUARIO,
  actualizarSesion,
  borrarSesion,
  estaAutenticado,
  guardarSesion,
  obtenerUsuarioSesion,
  rutaDeInicio,
} from '../services/sesion'

export { TIPOS_USUARIO, actualizarSesion, estaAutenticado, esCuentaPendienteDeActivacion, obtenerUsuarioSesion, rutaDeInicio }

/** Versión síncrona antigua del login mock: devuelve la sesión creada, o null si no coinciden las credenciales. */
export function iniciarSesion(credenciales) {
  const sesion = autenticarMock(credenciales)
  return sesion ? guardarSesion(sesion) : null
}

export const cerrarSesion = borrarSesion
