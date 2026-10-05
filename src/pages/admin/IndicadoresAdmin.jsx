import { CalendarCheck, CalendarClock, ClipboardCheck, ClipboardList, Handshake, UserCheck } from 'lucide-react'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Distribucion, EncabezadoPagina, EstadoCarga, Indicador } from '../../components/areaInterna/Partes'
import { getIndicadoresComerciales } from '../../services/api'

const textoPorcentaje = (valor) => (valor === null ? 'Sin datos' : `${valor.toLocaleString('es-PE')}%`)

/** Indicadores comerciales calculados con los datos existentes (nada estimado ni inventado). */
function IndicadoresAdmin() {
  const { datos, estado, error } = useDatos('indicadores-admin', getIndicadoresComerciales)

  return (
    <>
      <EncabezadoPagina
        titulo="Indicadores comerciales"
        subtitulo="Calculados con las solicitudes, visitas, seguimientos, separaciones y cuentas registradas en el sistema."
      />
      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        <>
          <div className="panel-rejilla">
            <Indicador icono={ClipboardList} etiqueta="Solicitudes" valor={datos.solicitudes.total} detalle={`${datos.solicitudes.desdeVisitantes} de visitantes sin cuenta`} a="/admin/solicitudes" />
            <Indicador icono={ClipboardCheck} etiqueta="Tasa de atención" valor={textoPorcentaje(datos.solicitudes.tasaAtencion)} detalle="Atendidas sobre las no canceladas" />
            <Indicador icono={CalendarClock} etiqueta="Visitas próximas" valor={datos.visitas.proximas} detalle="Pendientes o confirmadas desde hoy" a="/admin/visitas" />
            <Indicador icono={CalendarCheck} etiqueta="Tasa de realización" valor={textoPorcentaje(datos.visitas.tasaRealizacion)} detalle="Realizadas sobre las ya cerradas" />
            <Indicador icono={Handshake} etiqueta="Separaciones vigentes" valor={datos.separacionesVigentes} a="/admin/separaciones" />
            <Indicador icono={UserCheck} etiqueta="Cuentas activadas" valor={datos.cuentas.activadas} detalle={`${datos.cuentas.pendientes} pendientes de activación`} a="/admin/clientes" />
          </div>

          <div className="panel-rejilla-2 panel-seccion">
            <Distribucion titulo="Solicitudes por estado" items={datos.solicitudes.porEstado} />
            <Distribucion titulo="Solicitudes por tipo" items={datos.solicitudes.porTipo} />
            <Distribucion titulo="Visitas por estado" items={datos.visitas.porEstado} />
            <Distribucion titulo="Clientes por etapa comercial" items={datos.cartera} />
          </div>
        </>
      )}
    </>
  )
}

export default IndicadoresAdmin
