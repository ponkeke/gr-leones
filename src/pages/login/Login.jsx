import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'
import { TIPOS_USUARIO, iniciarSesion, obtenerUsuarioSesion, rutaDeInicio } from '../../utils/authMock'
import './Login.css'

/**
 * Acceso al área interna para clientes y asesores. Por ahora valida contra datos MOCK
 * (`utils/authMock.js`): no hay backend, JWT ni seguridad real. Cuando exista el endpoint de
 * autenticación solo cambia `iniciarSesion()`.
 */
function Login() {
  // Si ya hay una sesión abierta, se va directo a su panel.
  const [sesionPrevia] = useState(obtenerUsuarioSesion)
  const [tipo, setTipo] = useState('cliente')
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [estado, setEstado] = useState('idle') // 'idle' | 'enviando' | 'error' | 'ok'

  useEffect(() => {
    if (sesionPrevia) window.location.replace(rutaDeInicio(sesionPrevia))
  }, [sesionPrevia])

  const elegirTipo = (nuevoTipo) => {
    setTipo(nuevoTipo)
    if (estado === 'error') setEstado('idle')
  }

  const enviar = (evento) => {
    evento.preventDefault()
    setEstado('enviando')

    // Pequeña espera para que el cambio de estado del botón se note (simula la petición).
    setTimeout(() => {
      const sesion = iniciarSesion({ tipo, usuario, password })
      if (!sesion) {
        setEstado('error')
        return
      }
      setEstado('ok')
      window.location.href = rutaDeInicio(sesion)
    }, 300)
  }

  if (sesionPrevia) return null

  return (
    <section className="login-page">
      <div className="login-card">
        <h1>Área {TIPOS_USUARIO[tipo].etiqueta.toLowerCase()}</h1>
        <p className="lotes-subtitulo">
          {tipo === 'cliente'
            ? 'Ingresa con tu usuario o código de cliente para ver tus lotes, solicitudes y visitas.'
            : 'Ingresa con tu usuario o código de asesor para gestionar tus clientes.'}
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

          {estado === 'error' && (
            <p className="login-error" role="alert">Usuario o contraseña incorrectos.</p>
          )}

          <button className="btn-buscar login-btn" type="submit" disabled={estado === 'enviando' || estado === 'ok'}>
            <LogIn size={15} /> {estado === 'enviando' || estado === 'ok' ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="login-aviso">
          Acceso de demostración: por ahora los usuarios y la información del área interna son simulados.
        </p>
      </div>
    </section>
  )
}

export default Login
