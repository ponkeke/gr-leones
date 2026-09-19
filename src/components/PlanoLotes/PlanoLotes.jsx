import './PlanoLotes.css'
import { ESTADOS_LOTE } from '../../data/estados'

/**
 * Plano visual de manzanas y lotes (grid de bloques clicables coloreados por estado).
 * No usa coordenadas geográficas reales: es un esquema para elegir un lote mientras no
 * exista el levantamiento topográfico (PostGIS) de cada proyecto.
 * `idsVisibles` (Set) atenúa los lotes que no cumplen los filtros activos.
 */
function PlanoLotes({ lotes, idsVisibles, selectedLoteId, onSelectLote }) {
  const manzanas = [...new Set(lotes.map((l) => l.manzana))]

  return (
    <div className="plano-lotes">
      <div className="plano-leyenda">
        {ESTADOS_LOTE.map((estado) => (
          <span key={estado.value} className="plano-leyenda-item">
            <i style={{ background: estado.color }} />
            {estado.label}
          </span>
        ))}
      </div>

      {manzanas.map((manzana) => (
        <div className="plano-manzana" key={manzana}>
          <h4>{manzana}</h4>

          <div className="plano-grid">
            {lotes
              .filter((lote) => lote.manzana === manzana)
              .map((lote) => {
                const estado = ESTADOS_LOTE.find((e) => e.value === lote.estado)
                const atenuado = idsVisibles && !idsVisibles.has(lote.id)

                return (
                  <button
                    key={lote.id}
                    type="button"
                    className={[
                      'plano-lote',
                      lote.id === selectedLoteId ? 'plano-lote-activo' : '',
                      atenuado ? 'plano-lote-atenuado' : '',
                    ].join(' ')}
                    style={{ '--color-estado': estado?.color ?? '#666' }}
                    onClick={() => onSelectLote(lote)}
                    title={`Lote ${lote.numero} · ${lote.area_m2} m² · ${estado?.label ?? lote.estado}`}
                  >
                    {lote.numero}
                  </button>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlanoLotes
