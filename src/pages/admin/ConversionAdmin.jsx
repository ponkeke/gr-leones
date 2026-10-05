import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga } from '../../components/areaInterna/Partes'
import { getIndiceConversion } from '../../services/api'

const textoPorcentaje = (valor) => (valor === null ? '—' : `${valor.toLocaleString('es-PE')}%`)

/**
 * Índice de conversión: cuántos clientes registrados llegaron a cada etapa. La venta todavía no se
 * registra en el sistema, así que se muestra como no disponible (nunca como un número inventado).
 */
function ConversionAdmin() {
  const { datos, estado, error } = useDatos('conversion-admin', getIndiceConversion)

  return (
    <>
      <EncabezadoPagina
        titulo="Índice de conversión"
        subtitulo="Clientes registrados que llegaron a cada etapa: solicitud → seguimiento → visita → separación → venta."
      />
      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        <>
          <p className="panel-texto-secundario">
            Base: <strong>{datos.clientesRegistrados}</strong> clientes registrados. Además hubo{' '}
            <strong>{datos.solicitudesDeVisitantes}</strong> solicitudes de visitantes sin cuenta (no forman parte de la base).
          </p>

          <ol className="panel-embudo panel-seccion">
            {datos.etapas.map((etapa, indice) => {
              const ancho = etapa.disponible && datos.clientesRegistrados ? (etapa.cantidad / datos.clientesRegistrados) * 100 : 0
              return (
                <li key={etapa.clave} className={`panel-tarjeta panel-embudo-etapa ${etapa.disponible ? '' : 'no-disponible'}`}>
                  <div>
                    <p className="panel-lista-titulo">{indice + 1}. {etapa.etiqueta}</p>
                    <p className="panel-texto-secundario">{etapa.descripcion}</p>
                  </div>
                  <span className="panel-distribucion-barra" aria-hidden="true">
                    <span style={{ width: `${ancho}%` }} />
                  </span>
                  <div className="panel-embudo-cifras">
                    {etapa.disponible ? (
                      <>
                        <strong>{etapa.cantidad}</strong>
                        <span className="panel-texto-secundario">
                          {textoPorcentaje(etapa.sobreBase)} del total
                          {indice > 0 && <> · {textoPorcentaje(etapa.sobreAnterior)} de la etapa anterior</>}
                        </span>
                      </>
                    ) : (
                      <span className="panel-pendiente">No disponible</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          <p className="panel-texto-secundario panel-seccion">
            Cada etapa se cuenta con su propio dato real: un cliente puede llegar a una etapa sin haber pasado por la anterior
            (por ejemplo, una separación sin visita registrada). Cuando exista el registro de ventas, la última etapa se calculará
            automáticamente.
          </p>
        </>
      )}
    </>
  )
}

export default ConversionAdmin
