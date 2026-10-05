import { useState } from 'react'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getVisitasAdmin } from '../../services/api'
import { ESTADOS_VISITA, buscarEstado } from '../../data/procesoComercial'
import { formatearFechaConDia, formatearHora } from '../../utils/formato'

const COLUMNAS = [
  {
    titulo: 'Cliente',
    render: (v) => (
      <span>
        {v.cliente?.nombre ?? '—'}
        {!v.clienteId && <span className="panel-texto-secundario">Visitante web</span>}
      </span>
    ),
  },
  { titulo: 'Asesor', render: (v) => v.asesor?.nombre ?? '—' },
  { titulo: 'Proyecto', render: textoProyecto },
  { titulo: 'Lote', render: textoLote },
  { titulo: 'Fecha', render: (v) => formatearFechaConDia(v.fecha) },
  { titulo: 'Hora', render: (v) => formatearHora(v.hora) },
  { titulo: 'Estado', render: (v) => <Insignia estado={buscarEstado(ESTADOS_VISITA, v.estado)} /> },
]

// Supervisión: confirmar, realizar o cancelar una visita lo hace el asesor desde su agenda.
function VisitasAdmin() {
  const { datos, estado, error } = useDatos('visitas-admin', getVisitasAdmin)
  const [filtro, setFiltro] = useState('')

  return (
    <>
      <EncabezadoPagina titulo="Visitas" subtitulo="Todas las visitas agendadas, en orden cronológico." />
      <div className="panel-formulario panel-filtros">
        <label className="panel-campo">
          Estado
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS_VISITA.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </label>
      </div>
      {estado === 'listo' ? (
        <Tabla
          columnas={COLUMNAS}
          filas={filtro ? datos.filter((v) => v.estado === filtro) : datos}
          vacio="No hay visitas con ese estado."
        />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default VisitasAdmin
