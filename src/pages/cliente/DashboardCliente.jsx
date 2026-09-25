import { CalendarDays, ClipboardList, MapPinned, TrendingUp } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Indicador, Pasos } from '../../components/areaInterna/Partes'
import { primerNombre, textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getResumenCliente } from '../../services/api'
import { ETAPAS_CLIENTE, PASOS_CLIENTE, buscarEstado } from '../../data/procesoComercial'
import { formatearFechaConDia, formatearHora } from '../../utils/formato'

function DashboardCliente() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`resumen-cliente-${usuario.id}`, () => getResumenCliente(usuario.id))

  if (estado !== 'listo') return <EstadoCarga estado={estado} error={error} />

  const { cliente, asesor, lotes, totalSolicitudes, solicitudesAbiertas, proximaVisita } = datos
  const etapa = buscarEstado(ETAPAS_CLIENTE, datos.etapa)
  const pasoActual = PASOS_CLIENTE[etapa.pasosCliente] ?? 'Compra completada'

  return (
    <>
      <EncabezadoPagina
        titulo={`Te damos la bienvenida, ${primerNombre(cliente.nombre)}`}
        subtitulo="Aquí puedes seguir tus lotes de interés, tus solicitudes y tus visitas."
      />

      <div className="panel-rejilla">
        <Indicador
          icono={MapPinned}
          etiqueta="Lotes de interés"
          valor={lotes.length}
          detalle={lotes[0] ? `${textoProyecto(lotes[0])} · ${textoLote(lotes[0])}` : 'Aún no tienes lotes registrados'}
          a="/cliente/lotes"
        />
        <Indicador
          icono={ClipboardList}
          etiqueta="Solicitudes"
          valor={totalSolicitudes}
          detalle={`${solicitudesAbiertas} en curso`}
          a="/cliente/solicitudes"
        />
        <Indicador
          icono={CalendarDays}
          etiqueta="Próxima visita"
          valor={proximaVisita ? formatearHora(proximaVisita.hora) : '—'}
          detalle={
            proximaVisita
              ? `${formatearFechaConDia(proximaVisita.fecha)} · ${textoLote(proximaVisita)}`
              : 'No tienes visitas programadas'
          }
          a="/cliente/visitas"
        />
        <Indicador icono={TrendingUp} etiqueta="Estado del proceso" valor={pasoActual}
          detalle={`${etapa.pasosCliente} de ${PASOS_CLIENTE.length} pasos completados`}
        />
      </div>

      <section className="panel-seccion panel-tarjeta">
        <h2 className="panel-seccion-titulo">Mi proceso de compra</h2>
        <Pasos pasos={PASOS_CLIENTE} completados={etapa.pasosCliente} />
        {asesor && (
          <p className="panel-subtitulo">
            Te acompaña: <strong>{asesor.nombre}</strong>
          </p>
        )}
      </section>
    </>
  )
}

export default DashboardCliente
