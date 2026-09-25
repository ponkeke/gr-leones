import { useEffect, useEffectEvent, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './Modal.css'

// Modales abiertos, del más antiguo al más reciente. Sirve para tres cosas:
//   - ESC y la tecla Tab solo actúan sobre el modal de arriba (p. ej. un formulario abierto
//     encima del detalle del lote cierra solo el formulario);
//   - cada modal nuevo queda una capa por encima del anterior (`--nivel`);
//   - el scroll de la página se bloquea mientras haya al menos un modal abierto.
const pila = []
let estiloBodyPrevio = null

const SELECTOR_ENFOCABLES =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

function bloquearScroll() {
  const { body, documentElement } = document
  // Ancho de la barra de scroll: se compensa para que la página no "salte" al ocultarla.
  const anchoBarra = window.innerWidth - documentElement.clientWidth
  estiloBodyPrevio = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  body.style.overflow = 'hidden'
  if (anchoBarra > 0) body.style.paddingRight = `${anchoBarra}px`
}

function liberarScroll() {
  if (!estiloBodyPrevio) return
  document.body.style.overflow = estiloBodyPrevio.overflow
  document.body.style.paddingRight = estiloBodyPrevio.paddingRight
  estiloBodyPrevio = null
}

/**
 * Capa modal común del sitio (detalle de lote y formularios de solicitud).
 *
 * Se monta con un portal directamente en <body>: así ningún contexto de apilamiento de la página
 * (position + z-index, transform, filter…) puede dejarla por debajo del Navbar. El encabezado con
 * el título y la X queda fijo arriba y solo el cuerpo hace scroll, también en móvil.
 *
 * El padre decide cuándo existe: se renderiza `{abierto && <Modal …/>}`.
 * `cerrarAlClicFuera` permite que un formulario con datos escritos no se pierda por un clic
 * accidental fuera del panel (ESC y la X siempre cierran).
 */
function Modal({
  titulo,
  descripcion,
  onCerrar,
  children,
  tamano = 'mediano', // 'pequeno' | 'mediano' | 'grande'
  cerrarAlClicFuera = true,
  className = '',
}) {
  const panelRef = useRef(null)
  const overlayRef = useRef(null)
  const pulsoEnOverlay = useRef(false)
  const idTitulo = useId()
  const idDescripcion = useId()

  const cerrar = useEffectEvent(() => onCerrar())

  useEffect(() => {
    const entrada = {}
    const focoPrevio = document.activeElement

    if (pila.length === 0) bloquearScroll()
    overlayRef.current.style.setProperty('--nivel', pila.length)
    pila.push(entrada)
    panelRef.current.focus()

    const alPulsarTecla = (evento) => {
      if (pila[pila.length - 1] !== entrada) return

      if (evento.key === 'Escape') {
        evento.stopPropagation()
        cerrar()
        return
      }

      // Mantiene el foco dentro del modal al recorrerlo con Tab.
      if (evento.key === 'Tab') {
        const enfocables = [...panelRef.current.querySelectorAll(SELECTOR_ENFOCABLES)]
        if (enfocables.length === 0) return
        const primero = enfocables[0]
        const ultimo = enfocables[enfocables.length - 1]

        if (evento.shiftKey && (document.activeElement === primero || document.activeElement === panelRef.current)) {
          evento.preventDefault()
          ultimo.focus()
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault()
          primero.focus()
        }
      }
    }

    document.addEventListener('keydown', alPulsarTecla)

    return () => {
      document.removeEventListener('keydown', alPulsarTecla)
      pila.splice(pila.indexOf(entrada), 1)
      if (pila.length === 0) liberarScroll()
      if (focoPrevio instanceof HTMLElement && focoPrevio.isConnected) focoPrevio.focus()
    }
  }, [])

  // Solo cierra si el clic empezó y terminó en el fondo: arrastrar una selección de texto desde
  // un campo hacia afuera no debe cerrar el formulario.
  const alPresionarOverlay = (evento) => {
    pulsoEnOverlay.current = evento.target === evento.currentTarget
  }

  const alHacerClicOverlay = (evento) => {
    if (cerrarAlClicFuera && pulsoEnOverlay.current && evento.target === evento.currentTarget) {
      onCerrar()
    }
    pulsoEnOverlay.current = false
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay"
      onPointerDown={alPresionarOverlay}
      onClick={alHacerClicOverlay}
    >
      <div
        ref={panelRef}
        className={`modal-panel modal-${tamano} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descripcion ? idDescripcion : undefined}
        tabIndex={-1}
      >
        <header className="modal-encabezado">
          <div className="modal-encabezado-textos">
            <h2 id={idTitulo} className="modal-titulo">{titulo}</h2>
            {descripcion && (
              <p id={idDescripcion} className="modal-descripcion">{descripcion}</p>
            )}
          </div>

          <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
