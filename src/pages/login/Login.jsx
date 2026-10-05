import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'
import { iniciarSesion } from '../../services/api'
import { ERRORES_AUTENTICACION, MENSAJE_CREDENCIALES_INVALIDAS } from '../../services/compartido'
import { TIPOS_USUARIO, obtenerUsuarioSesion, rutaDeInicio } from '../../services/sesion'
import ActivarCuenta from './ActivarCuenta'
import './Login.css'

// Texto de ayuda de cada tipo de usuario (las pestañas salen de TIPOS_USUARIO).
const AYUDA_POR_TIPO = {
  cliente: 'Ingresa con tu usuario o código de cliente para ver tus lotes, solicitudes y visitas.',
  asesor: 'Ingresa con tu usuario o código de asesor para gestionar tus clientes.',
  admin: 'Ingresa con tu usuario o código de administrador para supervisar clientes, asesores y separaciones.',
}

/**
 * Acceso al área interna para clientes, asesores y administración. `iniciarSesion()` (services/api.js)
 * valida con la estrategia activa: cuentas MOCK de demostración o `POST /api/auth/login`. La sesión se
 * guarda en `services/sesion.js`. Las protecciones de esta pantalla no sustituyen la validación del servidor.
 */
function Login() {
  // Si ya hay una sesión abierta, se va directo a su panel.
  const [sesionPrevia] = useState(obtenerUsuarioSesion)
  const [tipo, setTipo] = useState('cliente')
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [estado, setEstado] = useState('idle') // 'idle' | 'enviando' | 'error' | 'pendiente' | 'ok'
  const [mensajeError, setMensajeError] = useState(MENSAJE_CREDENCIALES_INVALIDAS)
  // "/login?activar" abre directamente "Activar mi cuenta" (enlace que puede compartir la empresa).
  const [modo, setModo] = useState(() => (new URLSearchParams(window.location.search).has('activar') ? 'activar' : 'ingresar'))
  const [recienActivada, setRecienActivada] = useState(false)

  useEffect(() => {
    if (sesionPrevia) window.location.replace(rutaDeInicio(sesionPrevia))
  }, [sesionPrevia])

  const elegirTipo = (nuevoTipo) => {
    setTipo(nuevoTipo)
    if (estado === 'error') setEstado('idle')
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    setEstado('enviando')

    try {
      const sesion = await iniciarSesion({ tipo, usuario, password })
      setEstado('ok')
      window.location.href = rutaDeInicio(sesion)
    } catch (error) {
      // Un cliente dado de alta que aún no activó su cuenta no tiene contraseña todavía.
      if (error.codigo === ERRORES_AUTENTICACION.cuentaPendiente) {
        setEstado('pendiente')
        return
      }
      // Credenciales incorrectas: mensaje único. Otros fallos (sin conexión, servidor) muestran su mensaje.
      setMensajeError(error.codigo === ERRORES_AUTENTICACION.credenciales ? MENSAJE_CREDENCIALES_INVALIDAS : error.message)
      setEstado('error')
    }
  }

  const alActivar = (codigo) => {
    setModo('ingresar')
    setTipo('cliente')
    setUsuario(codigo)
    setPassword('')
    setEstado('idle')
    setRecienActivada(true)
  }

  if (sesionPrevia) return null

  if (modo === 'activar') {
    return (
      <section className="login-page">
        <div className="login-card">
          <ActivarCuenta onActivada={alActivar} onVolver={() => setModo('ingresar')} />
        </div>
      </section>
    )
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <h1>Área {TIPOS_USUARIO[tipo].etiqueta.toLowerCase()}</h1>
        <p className="lotes-subtitulo">
          {AYUDA_POR_TIPO[tipo]}
        </p>

        <div className="login-tipos" role="radiogroup" aria-label="Tipo de usuario">
          {Object.entries(TIPOS_USUARIO).map(([valor, { etiqueta }]) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={tipo === valor}
              className={`login-tipo ${tipo === valor ? 'activo' : ''}`}
              onClick={() => elegirTipo(valor)}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        <form className="login-form" onSubmit={enviar}>
          <input
            required
            placeholder="Usuario o código"
            aria-label="Usuario o código"
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Contraseña"
            aria-label="Contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {recienActivada && estado === 'idle' && (
            <p className="login-exito" role="status">
              Tu cuenta quedó activada. Ingresa con tu código y la contraseña que acabas de crear.
            </p>
          )}
          {estado === 'error' && (
            <p className="login-error" role="alert">{mensajeError}</p>
          )}
          {estado === 'pendiente' && (
            <p className="login-error" role="alert">
              Tu cuenta todavía no está activada. Actívala con tu código en “Activar mi cuenta”.
            </p>
          )}

          <button className="btn-buscar login-btn" type="submit" disabled={estado === 'enviando' || estado === 'ok'}>
            <LogIn size={15} /> {estado === 'enviando' || estado === 'ok' ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        {tipo === 'cliente' && (
          <button type="button" className="login-enlace" onClick={() => setModo('activar')}>
            ¿Grupo Leones te entregó un código de cliente? Activar mi cuenta
          </button>
        )}

        <p className="login-aviso">
          Acceso de demostración: por ahora los usuarios y la información del área interna son simulados.
        </p>
      </div>
    </section>
  )
}

export default Login
