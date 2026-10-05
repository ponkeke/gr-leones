import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DIAS_SEMANA } from '../../data/disponibilidad'
import { diaDeLaSemana, formatearFechaConDia, sumarDias } from '../../utils/formato'
import './Calendario.css'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const mesDe = (iso) => iso.slice(0, 7) // "2026-09"

function cambiarMes(mes, delta) {
  const [anio, numero] = mes.split('-').map(Number)
  const fecha = new Date(anio, numero - 1 + delta, 1)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
}

/** Celdas del mes (lunes primero): null para los huecos antes del día 1 y después del último. */
function celdasDelMes(mes) {
  const primero = `${mes}-01`
  const huecos = (diaDeLaSemana(primero) + 6) % 7
  const dias = []
  for (let fecha = primero; mesDe(fecha) === mes; fecha = sumarDias(fecha, 1)) dias.push(fecha)
  const celdas = [...Array(huecos).fill(null), ...dias]
  while (celdas.length % 7) celdas.push(null)
  return celdas
}

/**
 * Calendario mensual de selección de un día. Solo se navega entre los meses de `desde` a `hasta`.
 * `infoDia(fecha)` → { habilitado, tipo, detalle, marca }:
 *   tipo ..... pinta el día ('disponible' | 'especial' | 'bloqueado' | 'sin-horario' | 'sin-disponibilidad')
 *   detalle .. se lee en voz alta junto a la fecha y aparece como ayuda al pasar el mouse
 *   marca .... punto bajo el número (p. ej. "este día tiene visitas")
 * Los días no habilitados y los que quedan fuera de `desde`–`hasta` (pasados) no se pueden elegir.
 */
function Calendario({ id, etiqueta, desde, hasta, seleccionada, onSeleccionar, infoDia, invalido = false, leyenda }) {
  const [mes, setMes] = useState(() => mesDe(seleccionada || desde))
  const [anio, numero] = mes.split('-').map(Number)
  const hayAnterior = mes > mesDe(desde)
  const haySiguiente = mes < mesDe(hasta)

  return (
    <div className="calendario">
      <div className="calendario-cabecera">
        <button
          type="button"
          className="calendario-flecha"
          aria-label="Mes anterior"
          disabled={!hayAnterior}
          onClick={() => setMes((m) => cambiarMes(m, -1))}
        >
          <ChevronLeft size={18} />
        </button>
        <p className="calendario-mes" aria-live="polite">
          {MESES[numero - 1]} {anio}
        </p>
        <button
          type="button"
          className="calendario-flecha"
          aria-label="Mes siguiente"
          disabled={!haySiguiente}
          onClick={() => setMes((m) => cambiarMes(m, 1))}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        id={id}
        role="group"
        aria-label={etiqueta}
        aria-invalid={invalido || undefined}
        aria-describedby={invalido ? `${id}-error` : undefined}
        tabIndex={-1}
        className="calendario-rejilla"
      >
        {DIAS_SEMANA.map(({ nombre }) => (
          <span key={nombre} className="calendario-dia-semana" aria-hidden="true">
            {nombre.charAt(0)}
          </span>
        ))}

        {celdasDelMes(mes).map((fecha, indice) => {
          if (!fecha) return <span key={`hueco-${indice}`} aria-hidden="true" />
          const fueraDeRango = fecha < desde || fecha > hasta
          const { habilitado = false, tipo = null, detalle = null, marca = false } = fueraDeRango ? {} : infoDia(fecha) ?? {}
          const elegida = fecha === seleccionada
          const clases = [
            'calendario-dia',
            fueraDeRango ? 'calendario-dia-fuera' : tipo && `calendario-dia-${tipo}`,
            marca && 'calendario-dia-marca',
            elegida && 'elegida',
          ]

          return (
            <button
              key={fecha}
              type="button"
              data-fecha={fecha}
              className={clases.filter(Boolean).join(' ')}
              aria-pressed={elegida}
              aria-label={[formatearFechaConDia(fecha), fueraDeRango ? 'No disponible' : detalle].filter(Boolean).join('. ')}
              title={fueraDeRango ? undefined : detalle ?? undefined}
              disabled={!habilitado || fueraDeRango}
              onClick={() => onSeleccionar(fecha)}
            >
              {Number(fecha.slice(8))}
            </button>
          )
        })}
      </div>

      {leyenda && <div className="calendario-leyenda">{leyenda}</div>}
    </div>
  )
}

/**
 * Muestra de color + texto para la leyenda del calendario. `tipo`: los mismos de `infoDia`, más
 * 'seleccionado' (día elegido) y 'marca' (punto de "tiene visitas").
 */
export function MarcaLeyenda({ tipo, children }) {
  return (
    <span className="calendario-leyenda-item">
      <span className={`calendario-muestra calendario-dia-${tipo}`} aria-hidden="true" />
      {children}
    </span>
  )
}

export default Calendario
