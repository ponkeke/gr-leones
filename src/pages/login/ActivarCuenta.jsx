import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { activarCuentaCliente, verificarCodigoActivacion } from '../../services/api'

/**
 * "Activar mi cuenta": para clientes que Grupo Leones ya registró. En dos pasos:
 *   1. código de cliente (entregado por la empresa) + DNI, para confirmar que es el titular;
 *   2. crear su contraseña y, solo si la empresa no lo registró, su correo.
 * No pide otra vez los datos que ya registró la empresa. Al terminar, `onActivada(codigo)`.
 */
function ActivarCuenta({ onActivada, onVolver }) {
  const [paso, setPaso] = useState('codigo') // 'codigo' | 'datos'
  const [codigo, setCodigo] = useState('')
  const [dni, setDni] = useState('')
  const [cuenta, setCuenta] = useState(null) // { codigo, nombre, faltaCorreo }
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const ejecutar = async (accion) => {
    setEnviando(true)
    setError(null)
    try {
      await accion()
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const verificar = (evento) => {
    evento.preventDefault()
    ejecutar(async () => {
      setCuenta(await verificarCodigoActivacion({ codigo, dni }))
      setPaso('datos')
    })
  }

  const activar = (evento) => {
    evento.preventDefault()
    ejecutar(async () => {
      const activada = await activarCuentaCliente({ codigo, dni, password, confirmacion, email })
      onActivada(activada.codigo)
    })
  }

  return (
    <>
      <h1>Activar mi cuenta</h1>

      {paso === 'codigo' ? (
        <>
          <p className="lotes-subtitulo">
            Usa el código de cliente que te entregó Grupo Leones (por ejemplo, CLI005) y tu DNI.
          </p>
          <form className="login-form" onSubmit={verificar}>
            <input
              required
              placeholder="Código de cliente"
              aria-label="Código de cliente"
              autoComplete="off"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <input
              required
              inputMode="numeric"
              maxLength={8}
              placeholder="DNI"
              aria-label="DNI"
              autoComplete="off"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="btn-buscar login-btn" type="submit" disabled={enviando}>
              <KeyRound size={15} /> {enviando ? 'Verificando…' : 'Continuar'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="lotes-subtitulo">
            Hola, {cuenta.nombre}. Crea la contraseña con la que ingresarás usando tu código {cuenta.codigo}.
          </p>
          <form className="login-form" onSubmit={activar}>
            <input
              required
              type="password"
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              aria-label="Nueva contraseña"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              required
              type="password"
              placeholder="Repite la contraseña"
              aria-label="Repite la contraseña"
              autoComplete="new-password"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
            />
            {cuenta.faltaCorreo && (
              <input
                type="email"
                placeholder="Correo electrónico (opcional)"
                aria-label="Correo electrónico (opcional)"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="btn-buscar login-btn" type="submit" disabled={enviando}>
              <KeyRound size={15} /> {enviando ? 'Activando…' : 'Activar mi cuenta'}
            </button>
          </form>
        </>
      )}

      <button type="button" className="login-enlace" onClick={onVolver}>
        Ya activé mi cuenta: ingresar
      </button>
    </>
  )
}

export default ActivarCuenta
