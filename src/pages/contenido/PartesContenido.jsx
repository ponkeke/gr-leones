import { Info } from 'lucide-react'
import './Contenido.css'

/** Encabezado de las páginas de contenido: etiqueta dorada, título (con `destacado` en dorado) y bajada. */
export function EncabezadoContenido({ eyebrow, titulo, destacado, children }) {
  return (
    <header className="contenido-encabezado">
      <span className="contenido-eyebrow">{eyebrow}</span>
      <h1 className="contenido-titulo">
        {titulo} {destacado && <span>{destacado}</span>}
      </h1>
      <span className="contenido-linea" aria-hidden="true" />
      {children && <p className="contenido-lead">{children}</p>}
    </header>
  )
}

/** Estado vacío: se muestra mientras no exista contenido real (nunca se rellena con datos inventados). */
export function EstadoVacio({ titulo, children, icono: Icono = Info }) {
  return (
    <div className="contenido-vacio" role="status">
      <Icono size={22} aria-hidden="true" />
      <div>
        <strong>{titulo}</strong>
        {children}
      </div>
    </div>
  )
}

/** Etiqueta obligatoria para cualquier contenido de demostración (`esEjemplo: true`). */
export function EtiquetaEjemplo() {
  return <span className="contenido-ejemplo">Contenido de ejemplo</span>
}

export function Cargando({ estado, texto = 'Cargando…' }) {
  if (estado === 'error') return <p className="contenido-cargando">No pudimos cargar esta información. Intenta nuevamente.</p>
  return <p className="contenido-cargando">{texto}</p>
}
