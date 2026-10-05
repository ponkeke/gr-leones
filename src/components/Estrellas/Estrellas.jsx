import { Star } from 'lucide-react'
import { PUNTUACION_MAXIMA } from '../../data/contenido'
import './Estrellas.css'

/**
 * Puntuación con estrellas. Sin `onCambiar` solo muestra el valor; con `onCambiar` es un grupo de
 * selección (1 a PUNTUACION_MAXIMA) usable con teclado.
 */
function Estrellas({ valor = 0, onCambiar, tamano = 16, etiqueta = 'Puntuación', invalido = false, id }) {
  const numeros = Array.from({ length: PUNTUACION_MAXIMA }, (_, i) => i + 1)

  if (!onCambiar) {
    return (
      <span className="estrellas" role="img" aria-label={`${valor} de ${PUNTUACION_MAXIMA} estrellas`}>
        {numeros.map((n) => (
          <Star key={n} size={tamano} className={n <= valor ? 'estrella-llena' : 'estrella-vacia'} aria-hidden="true" />
        ))}
      </span>
    )
  }

  return (
    <div id={id} className="estrellas estrellas-seleccion" role="radiogroup" aria-label={etiqueta} aria-invalid={invalido || undefined}>
      {numeros.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          className="estrella-boton"
          onClick={() => onCambiar(n)}
        >
          <Star size={tamano} className={n <= valor ? 'estrella-llena' : 'estrella-vacia'} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

export default Estrellas
