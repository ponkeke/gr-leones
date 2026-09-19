import { useState, useRef, useEffect } from 'react'
import './Navbar.css'
import Proyecto from '../Proyectos/Proyectos'
import { normalizarRuta } from '../../utils/rutas'

function Navbar() {
  const [mostrarProyectos, setMostrarProyectos] = useState(false)
  // Menú móvil (hamburguesa): solo se ve por debajo de 900px.
  const [menuAbierto, setMenuAbierto] = useState(false)
  const temporizador = useRef(null)
  const ruta = normalizarRuta(window.location.pathname)

  const cerrarMenu = () => setMenuAbierto(false)

  // Con el menú abierto, la tecla Escape lo cierra.
  useEffect(() => {
    if (!menuAbierto) return

    const alPulsarTecla = (evento) => {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }

    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [menuAbierto])

  const claseActiva = (rutas) =>
    rutas.includes(ruta) ? 'active' : undefined

  const abrirProyectos = () => {
    clearTimeout(temporizador.current)
    setMostrarProyectos(true)
  }

  const cerrarProyectos = () => {
    temporizador.current = setTimeout(() => {
      setMostrarProyectos(false)
    }, 300)
  }

  return (
    <header className={`navbar ${menuAbierto ? 'navbar-abierto' : ''}`}>
      <div className="navbar-container">

        {/* LOGO */}
        <a href="/inicio" className="navbar-logo">
          <img
            src="/logo2026.png"
            alt="Grupo Inmobiliario Leones"
          />
        </a>

        {/* MENÚ */}
        <nav className="navbar-menu" id="menu-principal">

          <a href="/inicio" className={claseActiva(['/', '/inicio'])} onClick={cerrarMenu}>
            Inicio
          </a>

          {/* PROYECTOS */}
          <div
            className="nav-proyectos"
            onMouseEnter={abrirProyectos}
            onMouseLeave={cerrarProyectos}
          >
            <a
              href="/proyectospage"
              className={`nav-link-button ${claseActiva(['/proyectospage']) ?? ''}`}
              onClick={cerrarMenu}
            >
              Proyectos
            </a>
            {mostrarProyectos && (
              <div
                className="proyectos-flotante"
                onMouseEnter={abrirProyectos}
                onMouseLeave={cerrarProyectos}
              >
                <Proyecto />
              </div>
            )}
          </div>

          <a href="/lotes" className={claseActiva(['/lotes'])} onClick={cerrarMenu}>Lotes</a>
          <a href="/comunicados" className={claseActiva(['/comunicados'])} onClick={cerrarMenu}>Comunicados</a>
          <a href="/nosotros" className={claseActiva(['/nosotros'])} onClick={cerrarMenu}>Nosotros</a>
          <a href="/promociones" className={claseActiva(['/promociones'])} onClick={cerrarMenu}>Promociones</a>
          <a href="/inicio#contacto" onClick={cerrarMenu}>Contacto</a>

          {/* Área cliente dentro del menú móvil (en escritorio queda oculto y se usa el botón de la derecha) */}
          <button
            className="nav-cliente-movil"
            onClick={() => { window.location.href = '/login' }}
          >
            Área cliente
          </button>

        </nav>

        {/* ÁREA CLIENTE */}
        <button className="client-button" onClick={() => { window.location.href = '/login' }}>
          Área cliente
        </button>

        {/* HAMBURGUESA */}
        <button
          className="menu-button"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>

      </div>
    </header>
  )
}

export default Navbar
