// Autenticación de la estrategia MOCK. Mismo contrato que `../http/auth.js`:
//   iniciarSesion({ tipo, usuario, password }) → sesión { id, codigo, nombre, tipo, cargo } (ya guardada)
//     lanza Error con `codigo`: CREDENCIALES_INVALIDAS | CUENTA_PENDIENTE
//   cerrarSesion() → borra la sesión local
// Las cuentas de demostración no ofrecen seguridad real (ver `./credenciales.js`).
import { ERRORES_AUTENTICACION, errorDeAutenticacion } from '../compartido'
import { borrarSesion, guardarSesion } from '../sesion'
import { esperar } from './almacen'
import { autenticarMock, esCuentaPendienteDeActivacion } from './credenciales'

export async function iniciarSesion({ tipo, usuario, password }) {
  await esperar()
  const sesion = autenticarMock({ tipo, usuario, password })
  if (!sesion) {
    // Un cliente dado de alta que aún no activó su cuenta no tiene contraseña todavía.
    if (tipo === 'cliente' && esCuentaPendienteDeActivacion(usuario)) throw errorDeAutenticacion(ERRORES_AUTENTICACION.cuentaPendiente, 'Tu cuenta todavía no está activada.')
    throw errorDeAutenticacion(ERRORES_AUTENTICACION.credenciales)
  }
  return guardarSesion(sesion)
}

export async function cerrarSesion() {
  borrarSesion()
}
