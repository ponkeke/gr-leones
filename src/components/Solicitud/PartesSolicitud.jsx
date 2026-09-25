import { CheckCircle2 } from 'lucide-react'
import './Solicitud.css'

/** Bloque numerado del formulario ("1. Tus datos", "2. Elige tu asesor"…). */
export function Seccion({ paso, titulo, descripcion, children }) {
  return (
    <section className="solicitud-seccion">
      <h3 className="solicitud-seccion-titulo">
        {paso && <span className="solicitud-paso" aria-hidden="true">{paso}</span>}
        {titulo}
      </h3>
      {descripcion && <p className="solicitud-seccion-descripcion">{descripcion}</p>}
      {children}
    </section>
  )
}

/** Etiqueta visible + campo + mensaje de error. Los opcionales lo dicen; los obligatorios llevan *. */
export function Campo({ id, etiqueta, obligatorio = false, error, ayuda, ancho = false, children }) {
  return (
    <div className={`solicitud-campo${ancho ? ' solicitud-campo-ancho' : ''}`}>
      <label htmlFor={id} className="solicitud-etiqueta">
        {etiqueta}
        {obligatorio ? (
          <span className="solicitud-obligatorio" aria-hidden="true"> *</span>
        ) : (
          <span className="solicitud-opcional"> (opcional)</span>
        )}
      </label>
      {children}
      {error ? (
        <small id={`${id}-error`} className="solicitud-error-campo">{error}</small>
      ) : (
        ayuda && <small className="solicitud-ayuda">{ayuda}</small>
      )}
    </div>
  )
}

export function NotaObligatorios() {
  return (
    <p className="solicitud-nota-obligatorios">
      Los campos marcados con <span className="solicitud-obligatorio">*</span> son obligatorios.
    </p>
  )
}

/**
 * Opciones de selección única con aspecto de botón (más fáciles de tocar en móvil que un radio).
 * `permitirQuitar`: volver a tocar la opción elegida la deselecciona (para preguntas opcionales).
 */
export function GrupoOpciones({ id, etiqueta, opciones, valor, onCambiar, error, permitirQuitar = false, className = '' }) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={etiqueta}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      tabIndex={-1}
      className={`solicitud-opciones ${className}`.trim()}
    >
      {opciones.map((opcion) => {
        const elegida = valor === opcion.value
        return (
          <button
            key={opcion.value}
            type="button"
            role="radio"
            aria-checked={elegida}
            className="solicitud-opcion"
            onClick={() => onCambiar(elegida && permitirQuitar ? '' : opcion.value)}
          >
            {opcion.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Lista de datos (lote consultado, resumen antes de enviar, confirmación).
 * Una fila sin valor se omite, salvo que tenga `pendiente` (p. ej. "Sin elegir" en el resumen).
 */
export function ListaDatos({ titulo, filas, variante = 'normal' }) {
  const visibles = filas.filter((f) => (f.valor !== null && f.valor !== undefined && f.valor !== '') || f.pendiente)
  if (visibles.length === 0) return null

  return (
    <section className={`solicitud-lista solicitud-lista-${variante}`}>
      {titulo && <h3 className="solicitud-lista-titulo">{titulo}</h3>}
      <dl>
        {visibles.map((fila) => {
          const tieneValor = fila.valor !== null && fila.valor !== undefined && fila.valor !== ''
          return (
            <div key={fila.etiqueta} className={fila.ancho ? 'solicitud-lista-ancho' : undefined}>
              <dt>{fila.etiqueta}</dt>
              <dd className={tieneValor ? undefined : 'solicitud-lista-pendiente'}>
                {tieneValor ? fila.valor : fila.pendiente}
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}

/** Botón principal + frase que explica qué pasa al pulsarlo. */
export function BotonEnviar({ texto, textoEnviando = 'Enviando…', enviando, aclaracion, errorEnvio }) {
  return (
    <div className="solicitud-envio">
      {errorEnvio && (
        <p className="solicitud-error-envio" role="alert">
          {errorEnvio}
        </p>
      )}
      <button type="submit" className="solicitud-boton" disabled={enviando}>
        {enviando ? textoEnviando : texto}
      </button>
      {aclaracion && <p className="solicitud-aclaracion">{aclaracion}</p>}
    </div>
  )
}

/** Pantalla final tras enviar. El título lo muestra el encabezado del modal. */
export function Confirmacion({ mensajes, filas, nota, textoBoton, onVolver }) {
  return (
    <div className="solicitud-confirmacion" role="status">
      <CheckCircle2 size={48} color="#f5c400" aria-hidden="true" />

      {mensajes.map((mensaje) => (
        <p key={mensaje} className="solicitud-confirmacion-mensaje">{mensaje}</p>
      ))}

      <ListaDatos filas={filas} variante="confirmacion" />

      {nota && <p className="solicitud-confirmacion-nota">{nota}</p>}

      <button type="button" className="solicitud-boton" onClick={onVolver} autoFocus>
        {textoBoton}
      </button>
    </div>
  )
}
