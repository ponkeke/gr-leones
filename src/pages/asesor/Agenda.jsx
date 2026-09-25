import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getAgendaDeAsesor } from '../../services/api'
import { ESTADOS_VISITA, buscarEstado } from '../../data/procesoComercial'
import { fechaLocalISO, formatearFechaConDia, formatearHora } from '../../utils/formato'

const COLUMNAS = [
  { titulo: 'Fecha', render: (v) => formatearFechaConDia(v.fecha) },
  { titulo: 'Hora', render: (v) => formatearHora(v.hora) },
  { titulo: 'Cliente', render: (v) => v.cliente?.nombre ?? '—' },
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Tipo de visita', render: (v) => v.tipo },
  { titulo: 'Estado', render: (v) => <Insignia estado={buscarEstado(ESTADOS_VISITA, v.estado)} /> },
]

function Agenda() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`agenda-asesor-${usuario.id}`, () => getAgendaDeAsesor(usuario.id))

  const hoy = fechaLocalISO()
  const proximas = (datos ?? []).filter((v) => v.fecha >= hoy)
  // Las anteriores, de la más reciente a la más antigua.
  const anteriores = (datos ?? []).filter((v) => v.fecha < hoy).reverse()

  return (
    <>
      <EncabezadoPagina titulo="Agenda" subtitulo="Visitas de tus clientes a los proyectos." />

      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        <>
          <section>
            <h2 className="panel-seccion-titulo">Próximas visitas</h2>
            <Tabla columnas={COLUMNAS} filas={proximas} vacio="No tienes visitas próximas." />
          </section>
          <section className="panel-seccion">
            <h2 className="panel-seccion-titulo">Visitas anteriores</h2>
            <Tabla columnas={COLUMNAS} filas={anteriores} vacio="Aún no hay visitas anteriores." />
          </section>
        </>
      )}
    </>
  )
}

export default Agenda
