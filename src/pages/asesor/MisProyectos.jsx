import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Dato, EncabezadoPagina, EstadoCarga, InsigniaLote, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getCarteraDeAsesor, getProyectos } from '../../services/api'
import { formatearPrecio } from '../../utils/formato'

async function cargar(asesorId) {
  const [proyectos, cartera] = await Promise.all([getProyectos(), getCarteraDeAsesor(asesorId)])
  // Una fila por lote de interés de cada cliente de la cartera.
  const lotesConInteres = cartera.flatMap((registro) =>
    registro.lotes.map((lote) => ({ ...lote, id: `${registro.id}-${lote.loteCodigo}`, cliente: registro.cliente })),
  )
  return { proyectos, lotesConInteres }
}

const COLUMNAS_LOTES = [
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Área', render: (f) => (f.lote ? `${f.lote.area_m2} m²` : '—') },
  { titulo: 'Precio', render: (f) => formatearPrecio(f.lote?.precio_total) },
  { titulo: 'Estado', render: (f) => <InsigniaLote estado={f.lote?.estado} /> },
  { titulo: 'Cliente interesado', render: (f) => f.cliente?.nombre ?? '—' },
]

function MisProyectos() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`proyectos-asesor-${usuario.id}`, () => cargar(usuario.id))

  return (
    <>
      <EncabezadoPagina titulo="Mis lotes / proyectos" subtitulo="Proyectos en venta y los lotes que interesan a tus clientes." />

      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        <>
          <div className="panel-rejilla">
            {datos.proyectos.map((proyecto) => (
              <article key={proyecto.id} className="panel-tarjeta">
                <h2 className="panel-seccion-titulo">{proyecto.nombre}</h2>
                <dl className="panel-datos panel-datos-compactos">
                  <Dato etiqueta="Ubicación">{proyecto.ubicacion ?? <span className="panel-pendiente">Por confirmar</span>}</Dato>
                  <Dato etiqueta="Lotes">{proyecto.totalLotes}</Dato>
                  <Dato etiqueta="Disponibles">{proyecto.lotesDisponibles}</Dato>
                  <Dato etiqueta="Área">
                    {proyecto.areaDesde === null ? '—' : `${proyecto.areaDesde} – ${proyecto.areaHasta} m²`}
                  </Dato>
                </dl>
                <div className="panel-acciones panel-acciones-inicio panel-seccion">
                  <a className="panel-boton-secundario" href={`/lotes?id=${proyecto.id}`}>Ver plano y lotes</a>
                </div>
              </article>
            ))}
          </div>

          <section className="panel-seccion">
            <h2 className="panel-seccion-titulo">Lotes de interés de mis clientes</h2>
            <Tabla columnas={COLUMNAS_LOTES} filas={datos.lotesConInteres} vacio="Tus clientes aún no registran lotes de interés." />
          </section>
        </>
      )}
    </>
  )
}

export default MisProyectos
