import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Vacio } from '../../components/areaInterna/Partes'
import { getHistorialDeCliente } from '../../services/api'
import { formatearFecha } from '../../utils/formato'

function HistorialComprador() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`historial-cliente-${usuario.id}`, () => getHistorialDeCliente(usuario.id))

  return (
    <>
      <EncabezadoPagina titulo="Historial" subtitulo="Tus acciones con Grupo Leones, en orden cronológico." />

      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : datos.length === 0 ? (
        <Vacio texto="Todavía no hay movimientos en tu historial." />
      ) : (
        <section className="panel-tarjeta">
          <ol className="panel-linea">
            {datos.map((item) => (
              <li key={item.id} className="panel-linea-item">
                <time className="panel-linea-fecha" dateTime={item.fecha}>{formatearFecha(item.fecha)}</time>
                <div className="panel-linea-cuerpo">
                  <p className="panel-linea-titulo">{item.titulo}</p>
                  {item.detalle && <p className="panel-linea-detalle">{item.detalle}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}

export default HistorialComprador
