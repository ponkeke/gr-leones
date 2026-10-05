import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Tabla } from '../../components/areaInterna/Partes'
import { getAsesoresAdmin } from '../../services/api'

const COLUMNAS = [
  { titulo: 'Código', render: (a) => a.codigo },
  { titulo: 'Nombre', render: (a) => a.nombre },
  { titulo: 'Cargo', render: (a) => a.cargo },
  { titulo: 'Teléfono', render: (a) => a.telefono ?? <span className="panel-pendiente">Por confirmar</span> },
  { titulo: 'Clientes asignados', render: (a) => a.clientesAsignados },
  { titulo: 'Solicitudes pendientes', render: (a) => a.solicitudesPendientes },
  { titulo: 'Visitas por confirmar', render: (a) => a.visitasPendientes },
]

// Solo supervisión: no es un ranking ni un indicador de desempeño.
function AsesoresAdmin() {
  const { datos, estado, error } = useDatos('asesores-admin', getAsesoresAdmin)

  return (
    <>
      <EncabezadoPagina titulo="Asesores" subtitulo="Equipo comercial y su carga actual de clientes y pendientes." />
      {estado === 'listo' ? (
        <Tabla columnas={COLUMNAS} filas={datos} vacio="No hay asesores registrados." />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default AsesoresAdmin
