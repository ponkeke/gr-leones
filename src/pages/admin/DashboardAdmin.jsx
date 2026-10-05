import { CalendarClock, ClipboardList, Handshake, UserCog, Users } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Indicador } from '../../components/areaInterna/Partes'
import { getResumenAdmin } from '../../services/api'

// Resumen sencillo calculado con el almacén mock. Sin indicadores de conversión ni ranking (fase posterior).
function DashboardAdmin() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`resumen-admin-${usuario.id}`, getResumenAdmin)

  return (
    <>
      <EncabezadoPagina
        titulo="Panel de administración"
        subtitulo="Resumen calculado con los datos de demostración guardados en este navegador."
      />
      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : (
        <div className="panel-rejilla">
          <Indicador icono={Users} etiqueta="Clientes" valor={datos.clientes} a="/admin/clientes" />
          <Indicador icono={UserCog} etiqueta="Asesores" valor={datos.asesores} a="/admin/asesores" />
          <Indicador icono={ClipboardList} etiqueta="Solicitudes pendientes" valor={datos.solicitudesPendientes} a="/admin/solicitudes" />
          <Indicador icono={CalendarClock} etiqueta="Visitas pendientes" valor={datos.visitasPendientes} detalle="Por confirmar" a="/admin/visitas" />
          <Indicador icono={Handshake} etiqueta="Lotes separados" valor={datos.lotesSeparados} a="/admin/separaciones" />
        </div>
      )}
    </>
  )
}

export default DashboardAdmin
