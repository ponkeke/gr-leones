// SESIÓN LOCAL del área interna (cliente / asesor / administrador). Es independiente de la estrategia
// de datos: no sabe si la identidad la validó el mock o la API real. Quien autentica es
// `iniciarSesion()` de `services/api.js` (estrategia mock o http), que al terminar llama a
// `guardarSesion()`; el resto de la aplicación solo LEE la sesión desde aquí.
//
// IMPORTANTE: esto NO es seguridad. La sesión vive en localStorage y cualquiera puede editarla; las
// protecciones del frontend (menús, redirecciones) solo evitan confusión. Con la API real, la
// identidad y los permisos los valida el servidor en cada endpoint.
//
// Forma guardada: { id, codigo, nombre, tipo, cargo, token? }. Nunca contraseñas. El `token` (solo
// con la API real) lo lee únicamente `http/cliente.js`; `obtenerUsuarioSesion()` no lo devuelve, para
// que no circule por componentes ni estado de React.
import { CLAVES, borrar, guardarJSON, leerJSON } from '../utils/almacenamiento'

export const TIPOS_USUARIO = {
  cliente: { etiqueta: 'Cliente', inicio: '/cliente/dashboard' },
  asesor: { etiqueta: 'Asesor', inicio: '/asesor/dashboard' },
  // La clave coincide con el prefijo de sus rutas (/admin/...).
  admin: { etiqueta: 'Administrador', inicio: '/admin/dashboard' },
}

/** Evento de `window` que se emite cuando la API rechaza el token de la sesión (sesión vencida). */
export const EVENTO_SESION_EXPIRADA = 'leones:sesion-expirada'

function leerSesionGuardada() {
  const sesion = leerJSON(CLAVES.sesion)
  if (!sesion || !TIPOS_USUARIO[sesion.tipo] || sesion.id === undefined) return null
  return sesion
}

/** Sesión actual (sin token) o null (también si el valor guardado no tiene la forma esperada). */
export function obtenerUsuarioSesion() {
  const sesion = leerSesionGuardada()
  if (!sesion) return null
  const usuario = { ...sesion }
  delete usuario.token
  return usuario
}

/** Token de la API real, o null (sesión mock o sin sesión). Solo lo usa `http/cliente.js`. */
export function obtenerTokenSesion() {
  return leerSesionGuardada()?.token ?? null
}

/** Guarda la sesión recién autenticada. Solo conserva los campos conocidos (nunca contraseñas). */
export function guardarSesion({ id, codigo, nombre, tipo, cargo = null }, token = null) {
  const sesion = { id, codigo, nombre, tipo, cargo, ...(token ? { token } : {}) }
  guardarJSON(CLAVES.sesion, sesion)
  return obtenerUsuarioSesion()
}

/** Actualiza campos visibles de la sesión (p. ej. el nombre tras editar el perfil). */
export function actualizarSesion(cambios) {
  const sesion = leerSesionGuardada()
  if (!sesion) return null
  // La identidad y las credenciales no se cambian desde aquí.
  const nueva = { ...sesion, ...cambios }
  ;['id', 'tipo', 'token', 'password'].forEach((campo) => {
    if (campo in sesion) nueva[campo] = sesion[campo]
    else delete nueva[campo]
  })
  guardarJSON(CLAVES.sesion, nueva)
  return obtenerUsuarioSesion()
}

export function borrarSesion() {
  borrar(CLAVES.sesion)
}

/**
 * La API rechazó el token (HTTP 401): borra la sesión y avisa para que el área interna lleve a /login.
 * `token` es el que se envió en la petición rechazada: si mientras tanto se abrió otra sesión, no se toca.
 */
export function expirarSesion(token) {
  if (!token || obtenerTokenSesion() !== token) return
  borrarSesion()
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
}

export function estaAutenticado() {
  return obtenerUsuarioSesion() !== null
}

export function rutaDeInicio(sesion) {
  return TIPOS_USUARIO[sesion?.tipo]?.inicio ?? '/login'
}
