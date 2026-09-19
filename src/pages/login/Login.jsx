import { useState } from 'react'
import { LogIn } from 'lucide-react'
import './Login.css'

/**
 * Formulario de acceso del Área Cliente. Valida los campos en el frontend y deja la
 * estructura lista para conectarse a un endpoint real de autenticación (DNI + contraseña)
 * más adelante — por ahora no hay backend de usuarios, así que solo confirma el envío.
 */
function Login() {
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [estado, setEstado] = useState('idle') // 'idle' | 'enviando' | 'enviado'

  const enviar = (evento) => {
    evento.preventDefault()
    setEstado('enviando')

    // TODO: reemplazar por POST /api/auth/login cuando exista el backend de usuarios.
    setTimeout(() => setEstado('enviado'), 400)
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <h1>Área cliente</h1>
        <p className="lotes-subtitulo">Ingresa con tu DNI y contraseña para ver tus lotes y pagos.</p>

        <form className="login-form" onSubmit={enviar}>
          <input
            required
            placeholder="DNI"
            maxLength={8}
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn-buscar login-btn" type="submit" disabled={estado === 'enviando'}>
            <LogIn size={15} /> {estado === 'enviando' ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        {estado === 'enviado' && (
          <p className="login-aviso">
            El acceso al Área Cliente se habilitará cuando se conecte la base de datos de usuarios.
          </p>
        )}
      </div>
    </section>
  )
}

export default Login
