import { CircleHelp, ClipboardList, Handshake, LandPlot, UserCog, Users } from 'lucide-react'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Distribucion, EncabezadoPagina, EstadoCarga, Indicador, Tabla } from '../../components/areaInterna/Partes'
import { getEstadisticasGenerales } from '../../services/api'

/** Estadísticas generales: conteos de todas las entidades, calculados con los datos existentes. */
function EstadisticasAdmin() {
  const { datos, estado, error } = useDatos('estadisticas-admin', getEstadisticasGenerales)

  return (
    <>
      <EncabezadoPagina titulo="Estadísticas generales" subtitulo="Conteos calculados con todos los datos registrados en el sistema." />
      {estado !== 'listo' ? <EstadoCarga estado={estado} error={error} /> : <Contenido datos={datos} />}
    </>
  )
}

function Contenido({ datos }) {
  const sinCliente = datos.registrosSinCliente
  const totalSinCliente = sinCliente.solicitudes + sinCliente.visitas + sinCliente.seguimientos
  const estadosLote = datos.lotes.porEstado.map((e) => e.value)

  const columnasLotes = [
    { titulo: 'Proyecto', render: (f) => f.proyecto },
    { titulo: 'Total', render: (f) => f.total },
    ...estadosLote.map((valor, i) => ({ titulo: datos.lotes.porEstado[i].label, render: (f) => f.porEstado.find((e) => e.value === valor).cantidad })),
  ]

  return (
    <>
      <div className="panel-rejilla">
        <Indicador icono={Users} etiqueta="Clientes" valor={datos.clientes.total} detalle={`${datos.clientes.activadas} activados · ${datos.clientes.pendientes} pendientes`} />
        <Indicador icono={UserCog} etiqueta="Asesores" valor={datos.asesores} />
        <Indicador icono={ClipboardList} etiqueta="Solicitudes" valor={datos.solicitudes.total} />
        <Indicador icono={Handshake} etiqueta="Separaciones vigentes" valor={datos.separacionesVigentes} />
        <Indicador icono={LandPlot} etiqueta="Lotes" valor={datos.lotes.total} detalle={`En ${datos.lotes.porProyecto.length} proyectos`} />
        <Indicador icono={CircleHelp} etiqueta="Preguntas frecuentes" valor={datos.preguntasFrecuentes.activas} detalle={`activas de ${datos.preguntasFrecuentes.total}`} />
      </div>

      <div className="panel-rejilla-2 panel-seccion">
        <Distribucion titulo="Solicitudes por estado" items={datos.solicitudes.porEstado} />
        <Distribucion titulo="Visitas por estado" items={datos.visitas.porEstado} />
        <Distribucion titulo={`Seguimientos por etapa (${datos.seguimientos.total})`} items={datos.seguimientos.porEtapa} />
        <Distribucion titulo="Testimonios por estado" items={datos.testimonios} vacio="Todavía no hay testimonios." />
        <Distribucion titulo="Lotes por estado (todos los proyectos)" items={datos.lotes.porEstado} />
      </div>

      <section className="panel-seccion">
        <h2 className="panel-seccion-titulo">Lotes por proyecto</h2>
        <Tabla columnas={columnasLotes} filas={datos.lotes.porProyecto} claveFila={(f) => f.proyecto} />
        <p className="panel-texto-secundario">Estado según el plano comercial de cada proyecto, más las separaciones registradas en el sistema.</p>
      </section>

      {totalSinCliente > 0 && (
        <p className="panel-aviso panel-seccion">
          Hay registros de clientes que ya no existen ({sinCliente.solicitudes} solicitudes, {sinCliente.visitas} visitas,{' '}
          {sinCliente.seguimientos} seguimientos). No se cuentan en los indicadores por cliente.
        </p>
      )}
    </>
  )
}

export default EstadisticasAdmin
