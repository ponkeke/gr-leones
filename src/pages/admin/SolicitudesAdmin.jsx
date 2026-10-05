import { useState } from 'react'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getSolicitudesAdmin } from '../../services/api'
import { ESTADOS_SOLICITUD, TIPOS_SOLICITUD, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

const COLUMNAS = [
  {
    titulo: 'Cliente',
    render: (s) => (
      <span>
        {s.cliente?.nombre ?? '—'}
        {!s.clienteId && <span className="panel-texto-secundario">Visitante web</span>}
      </span>
    ),
  },
  { titulo: 'Tipo', render: (s) => TIPOS_SOLICITUD[s.tipo] ?? s.tipo },
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Asesor', render: (s) => s.asesor?.nombre ?? '—' },
  { titulo: 'Fecha', render: (s) => formatearFecha(s.fecha) },
  { titulo: 'Estado', render: (s) => <Insignia estado={buscarEstado(ESTADOS_SOLICITUD, s.estado)} /> },
]

// Supervisión: el estado de cada solicitud lo gestiona su asesor.
function SolicitudesAdmin() {
  const { datos, estado, error } = useDatos('solicitudes-admin', getSolicitudesAdmin)
  const [filtro, setFiltro] = useState('')

  return (
    <>
      <EncabezadoPagina titulo="Solicitudes" subtitulo="Todas las solicitudes de información, cotización, visita y separación." />
      <div className="panel-formulario panel-filtros">
        <label className="panel-campo">
          Estado
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS_SOLICITUD.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </label>
      </div>
      {estado === 'listo' ? (
        <Tabla
          columnas={COLUMNAS}
          filas={filtro ? datos.filter((s) => s.estado === filtro) : datos}
          vacio="No hay solicitudes con ese estado."
        />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default SolicitudesAdmin
