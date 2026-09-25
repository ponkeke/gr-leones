import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getSolicitudesDeCliente } from '../../services/api'
import { ESTADOS_SOLICITUD, TIPOS_SOLICITUD, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

const COLUMNAS = [
  { titulo: 'Tipo', render: (s) => TIPOS_SOLICITUD[s.tipo] },
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Fecha', render: (s) => formatearFecha(s.fecha) },
  { titulo: 'Estado', render: (s) => <Insignia estado={buscarEstado(ESTADOS_SOLICITUD, s.estado)} /> },
  { titulo: 'Asesor asignado', render: (s) => s.asesor?.nombre ?? 'Por asignar' },
]

function MisSolicitudes() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`solicitudes-cliente-${usuario.id}`, () => getSolicitudesDeCliente(usuario.id))

  return (
    <>
      <EncabezadoPagina
        titulo="Mis solicitudes"
        subtitulo="Información, cotizaciones, visitas y separaciones que solicitaste."
      >
        <a className="btn-buscar panel-boton" href="/proyectospage">Nueva solicitud</a>
      </EncabezadoPagina>
      {estado === 'listo' ? (
        <Tabla columnas={COLUMNAS} filas={datos} vacio="Aún no realizaste solicitudes." />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default MisSolicitudes
