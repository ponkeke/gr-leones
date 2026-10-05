// Validación de credenciales de DEMOSTRACIÓN del login mock. Las cuentas están en archivos del
// frontend (`data/*Mock.js`) con contraseña en texto plano: NO representa autenticación de producción.
// Solo la usa la estrategia mock (`./auth.js`) y la capa de compatibilidad `utils/authMock.js`.
import { cuentaActivada, getClientes } from '../../data/clientesMock'
import { asesoresMock } from '../../data/asesoresMock'
import { administradoresMock } from '../../data/administradoresMock'
import { CLAVES, leerJSON } from '../../utils/almacenamiento'

// Funciones: los clientes incluyen los dados de alta por administración (cambian en tiempo de uso).
const USUARIOS_POR_TIPO = {
  cliente: getClientes,
  asesor: () => asesoresMock,
  admin: () => administradoresMock,
}

const normalizar = (texto) => String(texto ?? '').trim().toLowerCase()

const coincideIdentificador = (u, identificador) =>
  Boolean(identificador) && (normalizar(u.usuario) === identificador || normalizar(u.codigo) === identificador)

/** Datos mínimos de la sesión (nunca la contraseña). */
function datosDeSesion(usuario, tipo) {
  const cambiosPerfil = tipo === 'cliente' ? leerJSON(CLAVES.perfilesClientes, {})?.[usuario.id] : null

  return {
    id: usuario.id,
    codigo: usuario.codigo,
    nombre: cambiosPerfil?.nombre ?? usuario.nombre,
    tipo,
    cargo: tipo === 'cliente' ? null : usuario.cargo ?? null,
  }
}

/**
 * Valida usuario (o código) + contraseña + tipo contra los datos mock. No guarda nada.
 * Devuelve los datos de sesión, o null si las credenciales no coinciden.
 */
export function autenticarMock({ tipo, usuario, password }) {
  const candidatos = USUARIOS_POR_TIPO[tipo]?.()
  if (!candidatos) return null

  const identificador = normalizar(usuario)
  // Una cuenta pendiente de activación todavía no tiene contraseña: no puede iniciar sesión.
  const encontrado = candidatos.find(
    (u) => coincideIdentificador(u, identificador) && cuentaActivada(u) && Boolean(u.password) && u.password === password,
  )
  return encontrado ? datosDeSesion(encontrado, tipo) : null
}

/** true si `usuario` es el código (o usuario) de un cliente que aún no activó su cuenta (solo mock). */
export function esCuentaPendienteDeActivacion(usuario) {
  const identificador = normalizar(usuario)
  return getClientes().some((c) => coincideIdentificador(c, identificador) && !cuentaActivada(c))
}
