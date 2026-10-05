import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getSeparaciones } from '../../services/api'
import { ESTADOS_SEPARACION, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

const COLUMNAS = [
  { titulo: 'Fecha', render: (s) => formatearFecha(s.fecha) },
  { titulo: 'Cliente', render: (s) => s.cliente?.nombre ?? '—' },
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Asesor', render: (s) => s.asesor?.nombre ?? '—' },
  { titulo: 'Registrada por', render: (s) => s.registradoPor?.nombre ?? '—' },
  { titulo: 'Estado', render: (s) => <Insignia estado={buscarEstado(ESTADOS_SEPARACION, s.estado)} /> },
]

// Registro de separaciones. Se crean desde Clientes → Gestionar → Lotes del cliente.
function SeparacionesAdmin() {
  const { datos, estado, error } = useDatos('separaciones-admin', getSeparaciones)

  return (
    <>
      <EncabezadoPagina
        titulo="Separaciones"
        subtitulo="Lotes separados registrados. Para registrar una nueva: Clientes → Gestionar → Lotes del cliente."
      />
      {estado === 'listo' ? (
        <Tabla columnas={COLUMNAS} filas={datos} vacio="Todavía no se registró ninguna separación." />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default SeparacionesAdmin
