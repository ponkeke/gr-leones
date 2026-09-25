import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, InsigniaLote, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getLotesDeCliente } from '../../services/api'
import { formatearPrecio } from '../../utils/formato'

// Área, precio y estado vienen de los datos del plano (`data/lotes/`): un precio sin cargar
// se muestra como "Por confirmar", igual que en la página pública de lotes.
const COLUMNAS = [
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Manzana', render: (f) => f.lote?.manzana ?? '—' },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Área', render: (f) => (f.lote ? `${f.lote.area_m2} m²` : '—') },
  { titulo: 'Precio', render: (f) => formatearPrecio(f.lote?.precio_total) },
  { titulo: 'Estado', render: (f) => <InsigniaLote estado={f.lote?.estado} /> },
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

function MisLotes() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`lotes-cliente-${usuario.id}`, () => getLotesDeCliente(usuario.id))

  return (
    <>
      <EncabezadoPagina titulo="Mis lotes" subtitulo="Lotes en los que registraste tu interés." />
      {estado === 'listo' ? (
        <Tabla columnas={COLUMNAS} filas={datos} claveFila={(f) => f.loteCodigo} vacio="Todavía no tienes lotes de interés." />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default MisLotes
