import { useEffect, useState } from 'react'
import { Bell, ExternalLink, LogOut, Menu, X } from 'lucide-react'
import { useAreaInterna } from './contexto'
import { Enlace } from './Partes'
import { iniciales } from './formatoPanel'
import './Panel.css'

/** Pequeño contador dorado de notificaciones sin leer ("9+" desde 10). Nada si no hay. */
function Contador({ cantidad }) {
  if (!cantidad) return null
  return (
    <span className="panel-contador">
      {cantidad > 9 ? '9+' : cantidad}
      <span className="panel-oculto"> sin leer</span>
    </span>
  )
}

/**
 * Marco del área interna: sidebar con el menú del tipo de usuario + barra superior con su nombre.
 * En pantallas angostas (≤ 960px) el sidebar se abre como panel lateral con el botón ☰.
 */
function PanelLayout({ menu, etiquetaArea, subtituloUsuario, children }) {
  const { usuario, ruta, salir, noLeidas } = useAreaInterna()
  const rutaNotificaciones = menu.find((item) => item.notificaciones)?.a
  const [menuAbierto, setMenuAbierto] = useState(false)
  const cerrarMenu = () => setMenuAbierto(false)

  useEffect(() => {
    if (!menuAbierto) return
    const alPulsarTecla = (evento) => {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [menuAbierto])

  return (
    <div className={`panel-app ${menuAbierto ? 'panel-app-menu-abierto' : ''}`}>
      <aside className="panel-sidebar" id="panel-menu" aria-label={`Menú del ${etiquetaArea.toLowerCase()}`}>
        <div className="panel-sidebar-cabecera">
          <a href="/inicio" className="panel-logo">
            <img src="/logo2026.png" alt="Grupo Inmobiliario Leones" />
          </a>
          <button type="button" className="panel-sidebar-cerrar" aria-label="Cerrar menú" onClick={cerrarMenu}>
            <X size={20} />
          </button>
        </div>

        <p className="panel-sidebar-area">{etiquetaArea}</p>

        <nav className="panel-nav">
          {menu.map(({ a, etiqueta, icono: Icono, notificaciones }) => (
            <Enlace
              key={a}
              a={a}
              className={`panel-nav-enlace ${ruta === a ? 'activo' : ''}`}
              aria-current={ruta === a ? 'page' : undefined}
              onNavegar={cerrarMenu}
            >
              <Icono size={18} aria-hidden="true" />
              <span>{etiqueta}</span>
              {notificaciones && <Contador cantidad={noLeidas} />}
            </Enlace>
          ))}
        </nav>

        <div className="panel-sidebar-pie">
          <a href="/inicio" className="panel-nav-enlace">
            <ExternalLink size={18} aria-hidden="true" />
            <span>Ir al sitio web</span>
          </a>
          <button type="button" className="panel-nav-enlace panel-nav-salir" onClick={salir}>
            <LogOut size={18} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="panel-fondo-menu" onClick={cerrarMenu} aria-hidden="true" />

      <div className="panel-principal">
        <header className="panel-topbar">
          <button
            type="button"
            className="panel-hamburguesa"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            aria-controls="panel-menu"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <Menu size={20} />
          </button>

          {rutaNotificaciones && (
            <Enlace
              a={rutaNotificaciones}
              className={`panel-topbar-notificaciones ${ruta === rutaNotificaciones ? 'activo' : ''}`}
              aria-label={noLeidas ? `Notificaciones: ${noLeidas} sin leer` : 'Notificaciones'}
              title="Notificaciones"
            >
              <Bell size={18} aria-hidden="true" />
              <Contador cantidad={noLeidas} />
            </Enlace>
          )}

          <div className="panel-usuario">
            <span className="panel-avatar" aria-hidden="true">{iniciales(usuario.nombre)}</span>
            <span className="panel-usuario-textos">
              <strong>{usuario.nombre}</strong>
              <span>{subtituloUsuario}</span>
            </span>
          </div>

          <button type="button" className="panel-boton-secundario panel-topbar-salir" onClick={salir}>
            <LogOut size={15} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </header>

        <main className="panel-contenido">{children}</main>
      </div>
    </div>
  )
}

export default PanelLayout
