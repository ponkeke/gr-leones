import { Check } from 'lucide-react'
import './SelectorAsesor.css'

function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

/**
 * Lista de asesores con selección única. La solicitud queda asociada SOLO al asesor elegido,
 * nunca a todos. Un asesor no disponible se muestra (para que el cliente sepa que existe) pero
 * no se puede elegir. `estado` viene de `useAsesores`: 'cargando' | 'listo' | 'error'.
 */
function SelectorAsesor({ id, etiqueta, asesores, estado, seleccionadoId, onSeleccionar, error }) {
  if (estado === 'cargando') {
    return <p className="selector-asesor-mensaje">Cargando asesores…</p>
  }

  if (estado === 'error') {
    return (
      <p className="selector-asesor-mensaje selector-asesor-mensaje-error">
        No pudimos cargar la lista de asesores. Cierra esta ventana y vuelve a intentarlo.
      </p>
    )
  }

  if (asesores.length === 0) {
    return <p className="selector-asesor-mensaje">Por el momento no hay asesores disponibles.</p>
  }

  return (
    <>
      <div
        id={id}
        role="radiogroup"
        aria-label={etiqueta}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        tabIndex={-1}
        className="selector-asesor-lista"
      >
        {asesores.map((asesor) => {
          const seleccionado = seleccionadoId === asesor.id

          return (
            <button
              type="button"
              key={asesor.id}
              role="radio"
              aria-checked={seleccionado}
              disabled={!asesor.disponible}
              className={`selector-asesor-item${seleccionado ? ' seleccionado' : ''}`}
              onClick={() => onSeleccionar(asesor.id)}
            >
              {asesor.foto ? (
                <img className="selector-asesor-foto" src={asesor.foto} alt="" />
              ) : (
                <span className="selector-asesor-foto selector-asesor-iniciales" aria-hidden="true">
                  {iniciales(asesor.nombre)}
                </span>
              )}

              <span className="selector-asesor-info">
                <strong>{asesor.nombre}</strong>
                <small>{asesor.cargo}</small>
                <small className={`selector-asesor-estado ${asesor.disponible ? 'disponible' : 'no-disponible'}`}>
                  ● {asesor.disponible ? 'Disponible' : 'No disponible'}
                </small>
              </span>

              <span className="selector-asesor-accion" aria-hidden="true">
                {!asesor.disponible && 'No disponible'}
                {asesor.disponible && seleccionado && (
                  <>
                    <Check size={14} /> Seleccionado
                  </>
                )}
                {asesor.disponible && !seleccionado && 'Seleccionar'}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <small id={`${id}-error`} className="selector-asesor-error">
          {error}
        </small>
      )}
    </>
  )
}

export default SelectorAsesor
