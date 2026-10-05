import { useState } from 'react'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Tabla } from '../../components/areaInterna/Partes'
import { METRICAS_RANKING, getRankingAsesores } from '../../services/api'

const mostrar = (metrica, valor) => (valor === null ? '—' : metrica.porcentaje ? `${valor.toLocaleString('es-PE')}%` : valor)

/**
 * Ranking de asesores: tabla comparable ordenada por la métrica que elija administración. Solo usa
 * métricas que existen en el sistema; no asigna puntajes ni destaca "ganadores".
 */
function RankingAdmin() {
  const { datos, estado, error } = useDatos('ranking-admin', getRankingAsesores)
  const [orden, setOrden] = useState(METRICAS_RANKING[0].clave)
  const metrica = METRICAS_RANKING.find((m) => m.clave === orden)

  // De mayor a menor por la métrica elegida; los "sin datos" al final; empates por nombre.
  const filas = [...(datos ?? [])].sort((a, b) => {
    if (a[orden] === null && b[orden] === null) return a.nombre.localeCompare(b.nombre)
    if (a[orden] === null) return 1
    if (b[orden] === null) return -1
    return b[orden] - a[orden] || a.nombre.localeCompare(b.nombre)
  })

  const columnas = [
    { titulo: 'Asesor', render: (f) => <span>{f.nombre}<span className="panel-texto-secundario">{f.codigo}</span></span> },
    ...METRICAS_RANKING.map((m) => ({
      titulo: m.etiqueta,
      render: (f) => (m.clave === orden ? <strong>{mostrar(m, f[m.clave])}</strong> : mostrar(m, f[m.clave])),
    })),
  ]

  return (
    <>
      <EncabezadoPagina
        titulo="Ranking de asesores"
        subtitulo="Comparación con los datos registrados en el sistema. El orden depende solo de la métrica elegida."
      />
      <div className="panel-formulario panel-filtros">
        <label className="panel-campo">
          Ordenar por
          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            {METRICAS_RANKING.map((m) => (
              <option key={m.clave} value={m.clave}>{m.etiqueta}</option>
            ))}
          </select>
        </label>
      </div>
      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        <>
          <Tabla columnas={columnas} filas={filas} claveFila={(f) => f.asesorId} vacio="No hay asesores registrados." />
          <p className="panel-texto-secundario panel-seccion">
            Ordenado por “{metrica.etiqueta}”, de mayor a menor. “—” significa que todavía no hay datos para calcularla (por
            ejemplo, % de atención sin solicitudes). Las ventas y comisiones se sumarán cuando existan en el sistema.
          </p>
        </>
      )}
    </>
  )
}

export default RankingAdmin
