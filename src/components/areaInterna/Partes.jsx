import { Check, Info } from 'lucide-react'
import { useAreaInterna } from './contexto'
import { ESTADO_COLOR, ESTADO_LABEL } from '../../data/estados'

/** Enlace interno: cambia de página sin recargar (Ctrl/Cmd + clic sigue abriendo otra pestaña). */
export function Enlace({ a, children, onNavegar, ...resto }) {
  const { navegar } = useAreaInterna()

  const alHacerClic = (evento) => {
    if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
    evento.preventDefault()
    navegar(a)
    onNavegar?.()
  }

  return (
    <a href={a} onClick={alHacerClic} {...resto}>
      {children}
    </a>
  )
}

export function EncabezadoPagina({ titulo, subtitulo, children }) {
  return (
    <header className="panel-encabezado">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="panel-subtitulo">{subtitulo}</p>}
      </div>
      {children && <div className="panel-encabezado-acciones">{children}</div>}
    </header>
  )
}

/** Recordatorio visible de que la información es simulada. */
export function AvisoDemo({ children }) {
  return (
    <p className="panel-aviso">
      <Info size={15} aria-hidden="true" />
      <span>{children ?? 'Datos de demostración: la información de esta sección es simulada y no corresponde a registros reales.'}</span>
    </p>
  )
}

/** Insignia de estado. `estado`: { label, tono } (ver catálogos en `data/procesoComercial.js`). */
export function Insignia({ estado }) {
  return <span className={`panel-estado panel-estado-${estado.tono}`}>{estado.label}</span>
}

/** Estado de un lote con los mismos colores del plano (DISPONIBLE, SEPARADO…). */
export function InsigniaLote({ estado }) {
  if (!estado) return <span className="panel-estado panel-estado-neutro">Por confirmar</span>
  const color = ESTADO_COLOR[estado]
  return (
    <span className="panel-estado" style={{ color, borderColor: color }}>
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  )
}

export function Indicador({ icono: Icono, etiqueta, valor, detalle, a }) {
  const contenido = (
    <>
      <span className="panel-indicador-icono">
        <Icono size={20} aria-hidden="true" />
      </span>
      <span className="panel-indicador-textos">
        <span className="panel-indicador-etiqueta">{etiqueta}</span>
        <strong className="panel-indicador-valor">{valor}</strong>
        {detalle && <span className="panel-indicador-detalle">{detalle}</span>}
      </span>
    </>
  )

  return a ? (
    <Enlace a={a} className="panel-tarjeta panel-indicador panel-indicador-enlace">
      {contenido}
    </Enlace>
  ) : (
    <div className="panel-tarjeta panel-indicador">{contenido}</div>
  )
}

/** Mensaje mientras carga o si falló la carga (`estado` de `useDatos`). */
export function EstadoCarga({ estado, error }) {
  if (estado === 'error') return <p className="panel-mensaje panel-mensaje-error">{error}</p>
  return <p className="panel-mensaje">Cargando…</p>
}

export function Vacio({ texto }) {
  return <p className="panel-mensaje">{texto}</p>
}

/**
 * Tabla que en pantallas angostas se convierte en tarjetas (cada celda muestra su título con
 * `data-label`, ver Panel.css). `columnas`: [{ titulo, render(fila) }].
 */
export function Tabla({ columnas, filas, vacio = 'No hay registros.', claveFila = (fila) => fila.id }) {
  if (filas.length === 0) return <Vacio texto={vacio} />

  return (
    <div className="panel-tabla-contenedor">
      <table className="panel-tabla">
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna.titulo} scope="col">{columna.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={claveFila(fila)}>
              {columnas.map((columna) => (
                <td key={columna.titulo} data-label={columna.titulo}>
                  {columna.render(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Pasos de un proceso: ✓ completos, el actual resaltado, ○ pendientes. */
export function Pasos({ pasos, completados }) {
  return (
    <ol className="panel-pasos">
      {pasos.map((paso, indice) => {
        const estado = indice < completados ? 'hecho' : indice === completados ? 'actual' : 'pendiente'
        return (
          <li key={paso} className={`panel-paso panel-paso-${estado}`}>
            <span className="panel-paso-marca" aria-hidden="true">
              {estado === 'hecho' ? <Check size={13} strokeWidth={3} /> : indice + 1}
            </span>
            <span className="panel-paso-texto">
              {paso}
              <span className="panel-oculto">
                {estado === 'hecho' ? ' (completado)' : estado === 'actual' ? ' (en curso)' : ' (pendiente)'}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Fila "etiqueta: valor" de las fichas de perfil. */
export function Dato({ etiqueta, children }) {
  return (
    <div className="panel-dato">
      <dt>{etiqueta}</dt>
      <dd>{children}</dd>
    </div>
  )
}
