// SESIÓN SIMULADA del área interna (cliente / asesor).
//
// IMPORTANTE: esto NO es seguridad. Las credenciales están en archivos del frontend y la sesión es
// un objeto en localStorage que cualquiera puede editar. Solo sirve para demostrar la navegación
// hasta que exista el backend con autenticación real; entonces `iniciarSesion()` pasará a llamar a
// POST /api/auth/login y las pantallas no necesitarán cambiar.
import { clientesMock } from '../data/clientesMock'
import { asesoresMock } from '../data/asesoresMock'
import { CLAVES, borrar, guardarJSON, leerJSON } from './almacenamiento'

export const TIPOS_USUARIO = {
  cliente: { etiqueta: 'Cliente', inicio: '/cliente/dashboard' },
  asesor: { etiqueta: 'Asesor', inicio: '/asesor/dashboard' },
}

const USUARIOS_POR_TIPO = {
  cliente: clientesMock,
  asesor: asesoresMock,
}

const normalizar = (texto) => String(texto ?? '').trim().toLowerCase()

/** Datos mínimos que se guardan en la sesión (nunca la contraseña). */
function datosDeSesion(usuario, tipo) {
  const cambiosPerfil = tipo === 'cliente' ? leerJSON(CLAVES.perfilesClientes, {})?.[usuario.id] : null

  return {
    id: usuario.id,
    codigo: usuario.codigo,
    nombre: cambiosPerfil?.nombre ?? usuario.nombre,
    tipo,
    cargo: tipo === 'asesor' ? usuario.cargo : null,
  }
}

/**
 * Valida usuario (o código) + contraseña + tipo contra los datos mock.
 * Devuelve la sesión creada, o null si las credenciales no coinciden.
 */
export function iniciarSesion({ tipo, usuario, password }) {
  const candidatos = USUARIOS_POR_TIPO[tipo]
  if (!candidatos) return null

  const identificador = normalizar(usuario)
  const encontrado = candidatos.find(
    (u) =>
      (normalizar(u.usuario) === identificador || normalizar(u.codigo) === identificador) &&
      u.password === password,
  )
  if (!encontrado) return null

  const sesion = datosDeSesion(encontrado, tipo)
  guardarJSON(CLAVES.sesion, sesion)
  return sesion
}

/** Sesión actual o null (también si el valor guardado no tiene la forma esperada). */
export function obtenerUsuarioSesion() {
  const sesion = leerJSON(CLAVES.sesion)
  if (!sesion || !TIPOS_USUARIO[sesion.tipo] || sesion.id === undefined) return null
  return sesion
}

/** Actualiza campos visibles de la sesión (p. ej. el nombre tras editar el perfil). */
export function actualizarSesion(cambios) {
  const sesion = obtenerUsuarioSesion()
  if (!sesion) return null
  const nueva = { ...sesion, ...cambios }
  guardarJSON(CLAVES.sesion, nueva)
  return nueva
}

export function cerrarSesion() {
  borrar(CLAVES.sesion)
}

export function estaAutenticado() {
  return obtenerUsuarioSesion() !== null
}

export function rutaDeInicio(sesion) {
  return TIPOS_USUARIO[sesion?.tipo]?.inicio ?? '/login'
}
