import { FileText } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getDocumentosDeCliente } from '../../services/api'
import { ESTADOS_DOCUMENTO, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

const COLUMNAS = [
  {
    titulo: 'Documento',
    render: (d) => (
      <span className="panel-lista-item">
        <FileText size={16} aria-hidden="true" color="#f5c400" /> {d.tipo}
      </span>
    ),
  },
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Fecha', render: (d) => (d.fecha ? formatearFecha(d.fecha) : '—') },
  { titulo: 'Estado', render: (d) => <Insignia estado={buscarEstado(ESTADOS_DOCUMENTO, d.estado)} /> },
  {
    titulo: 'Archivo',
    // Aún no hay archivos reales: el botón queda deshabilitado hasta conectar el backend.
    render: () => (
      <button type="button" className="panel-boton-secundario" disabled title="Disponible cuando se conecte el sistema de documentos">
        Descargar
      </button>
    ),
  },
]

function Documentos() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`documentos-cliente-${usuario.id}`, () => getDocumentosDeCliente(usuario.id))

  return (
    <>
      <EncabezadoPagina
        titulo="Documentos"
        subtitulo="Cotizaciones, fichas y constancias de tu proceso. La descarga se habilitará cuando se conecte el sistema de documentos."
      />
      {estado === 'listo' ? (
        <Tabla columnas={COLUMNAS} filas={datos} vacio="Todavía no tienes documentos." />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default Documentos
