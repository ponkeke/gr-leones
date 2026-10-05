import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, InsigniaLote, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getLotesDeCliente } from '../../services/api'
import { formatearPrecio } from '../../utils/formato'

// Área, precio y disponibilidad vienen de los datos del plano (`data/lotes/`): un precio sin
// cargar se muestra como "Por confirmar", igual que en la página pública de lotes. La
// "Disponibilidad" es la del lote en el plano (para todos), no la relación del cliente con él.
const COLUMNAS = [
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Manzana', render: (f) => f.lote?.manzana ?? '—' },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Área', render: (f) => (f.lote ? `${f.lote.area_m2} m²` : '—') },
  { titulo: 'Precio', render: (f) => formatearPrecio(f.lote?.precio_total) },
  { titulo: 'Disponibilidad', render: (f) => <InsigniaLote estado={f.lote?.estado} /> },
  {
    titulo: 'Acciones',
    render: (f) =>
      f.lote ? (
        <span className="panel-acciones">
          <a className="panel-boton-secundario" href={`/lotes?id=${f.lote.proyectoId}`}>Ver plano</a>
          <a className="panel-boton-secundario" href={`/simulador-costos?lote=${f.lote.id}`}>Simular costos</a>
        </span>
      ) : '—',
  },
]

// Un grupo por relación (RELACIONES_LOTE). Separados y comprados llegarán con la futura separación.
const GRUPOS = [
  {
    relacion: 'INTERES',
    titulo: 'Lotes de interés',
    vacio: 'Todavía no consultaste ningún lote.',
  },
  {
    relacion: 'SEPARADO',
    titulo: 'Lotes separados',
    vacio: 'No tienes lotes separados. La separación se coordina con tu asesor.',
  },
  {
    relacion: 'COMPRADO',
    titulo: 'Lotes comprados',
    vacio: 'Aún no tienes lotes comprados.',
  },
]

function MisLotes() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`lotes-cliente-${usuario.id}`, () => getLotesDeCliente(usuario.id))

  return (
    <>
      <EncabezadoPagina
        titulo="Mis lotes"
        subtitulo="Solicitar información, una cotización o una visita deja el lote como “de interés”: no lo separa ni lo reserva a tu nombre."
      />
      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        GRUPOS.map((grupo, indice) => (
          <section key={grupo.relacion} className={indice > 0 ? 'panel-seccion' : undefined}>
            <h2 className="panel-seccion-titulo">{grupo.titulo}</h2>
            <Tabla
              columnas={COLUMNAS}
              filas={datos.filter((f) => f.relacion === grupo.relacion)}
              claveFila={(f) => f.loteCodigo}
              vacio={grupo.vacio}
            />
          </section>
        ))
      )}
    </>
  )
}

export default MisLotes
