import { CalendarDays } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Indicador, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getVisitasDeCliente } from '../../services/api'
import { ESTADOS_VISITA, buscarEstado } from '../../data/procesoComercial'
import { formatearFechaConDia, formatearHora } from '../../utils/formato'

const COLUMNAS = [
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Fecha', render: (v) => formatearFechaConDia(v.fecha) },
  { titulo: 'Hora', render: (v) => formatearHora(v.hora) },
  { titulo: 'Asesor', render: (v) => v.asesor?.nombre ?? '—' },
  { titulo: 'Estado', render: (v) => <Insignia estado={buscarEstado(ESTADOS_VISITA, v.estado)} /> },
]

function MisVisitas() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`visitas-cliente-${usuario.id}`, () => getVisitasDeCliente(usuario.id))

  return (
    <>
      <EncabezadoPagina titulo="Agenda de visitas" subtitulo="Tus visitas a los proyectos, programadas y anteriores.">
        {/* El agendamiento real se hace desde el detalle del lote (formulario "Agendar visita"). */}
        <a className="btn-buscar panel-boton" href="/proyectospage">Agendar otra visita</a>
      </EncabezadoPagina>

      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        <>
          <div className="panel-rejilla">
            <Indicador
              icono={CalendarDays}
              etiqueta="Próxima visita"
              valor={datos.proxima ? `${formatearFechaConDia(datos.proxima.fecha)} · ${formatearHora(datos.proxima.hora)}` : 'Sin visitas programadas'}
              detalle={
                datos.proxima
                  ? `${textoProyecto(datos.proxima)} · ${textoLote(datos.proxima)} · con ${datos.proxima.asesor?.nombre ?? 'tu asesor'}`
                  : 'Cuando agendes una visita aparecerá aquí.'
              }
            />
          </div>

          <section className="panel-seccion">
            <h2 className="panel-seccion-titulo">Todas mis visitas</h2>
            <Tabla columnas={COLUMNAS} filas={datos.visitas} vacio="Aún no tienes visitas registradas." />
          </section>
        </>
      )}
    </>
  )
}

export default MisVisitas
