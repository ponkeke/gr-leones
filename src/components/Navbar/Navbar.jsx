import { useState, useRef } from 'react'
import './Navbar.css'
import Proyecto from '../Proyectos/Proyectos'

function Navbar() {
  const [mostrarProyectos, setMostrarProyectos] = useState(false)
  const temporizador = useRef(null)

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
    <header className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <a href="/inicio" className="navbar-logo">
          <img
            src="/logo2026.png"
            alt="Grupo Inmobiliario Leones"
          />
        </a>

        {/* MENÚ */}
        <nav className="navbar-menu">

          <a href="/inicio" className="active">
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
              className="nav-link-button"
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

          <a href="/lotes">Lotes</a>
          <a href="/comunicados">Comunicados</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/promociones">Promociones</a>
          <a href="/inicio#contacto">Contacto</a>

        </nav>

        {/* ÁREA CLIENTE */}
        <button className="client-button">
          Área cliente
        </button>

        {/* HAMBURGUESA */}
        <button className="menu-button" aria-label="Abrir menú">
          ☰
        </button>

      </div>
    </header>
  )
}

export default Navbar
