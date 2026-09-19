import './NoEncontrada.css'

/** Vista para rutas que no existen (en Netlify la regla SPA sirve la app para cualquier URL). */
function NoEncontrada() {
  return (
    <section className="no-encontrada">
      <span className="no-encontrada-codigo">404</span>
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe o fue movida.</p>
      <a className="btn-proyecto" href="/inicio">
        Volver al inicio
      </a>
    </section>
  )
}

export default NoEncontrada
