import { useState } from 'react'
import Modal from '../../components/Modal/Modal'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Dato, EncabezadoPagina, EstadoCarga, Insignia, InsigniaLote, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getSolicitudesDeAsesor } from '../../services/api'
import { ESTADOS_SOLICITUD, TIPOS_SOLICITUD, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

function Solicitudes() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`solicitudes-asesor-${usuario.id}`, () => getSolicitudesDeAsesor(usuario.id))

  if (estado !== 'listo') {
    return (
      <>
        <EncabezadoPagina titulo="Solicitudes" />
        <EstadoCarga estado={estado} error={error} />
      </>
    )
  }
  return <ListaSolicitudes inicial={datos} />
}

// Los cambios de estado solo viven en esta pantalla (no hay backend todavía).
function ListaSolicitudes({ inicial }) {
  const [solicitudes, setSolicitudes] = useState(inicial)
  const [filtro, setFiltro] = useState('')
  const [abiertaId, setAbiertaId] = useState(null)

  const abierta = solicitudes.find((s) => s.id === abiertaId) ?? null
  const filas = filtro ? solicitudes.filter((s) => s.estado === filtro) : solicitudes

  const cambiarEstado = (id, nuevoEstado) =>
    setSolicitudes((lista) => lista.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s)))

  const columnas = [
    { titulo: 'Cliente', render: (s) => s.cliente?.nombre ?? '—' },
    { titulo: 'Tipo de solicitud', render: (s) => TIPOS_SOLICITUD[s.tipo] },
    { titulo: 'Proyecto', render: textoProyecto },
    { titulo: 'Lote', render: textoLote },
    { titulo: 'Fecha', render: (s) => formatearFecha(s.fecha) },
    { titulo: 'Estado', render: (s) => <Insignia estado={buscarEstado(ESTADOS_SOLICITUD, s.estado)} /> },
    {
      titulo: 'Acción',
      render: (s) => (
        <button type="button" className="panel-boton-secundario" onClick={() => setAbiertaId(s.id)}>
          Ver detalle
        </button>
      ),
    },
  ]

  return (
    <>
      <EncabezadoPagina titulo="Solicitudes" subtitulo="Solicitudes de información, cotización, visita y separación de tus clientes." />

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

      <Tabla columnas={columnas} filas={filas} vacio="No hay solicitudes con ese estado." />

      {abierta && (
        <Modal
          titulo={TIPOS_SOLICITUD[abierta.tipo]}
          descripcion={`Solicitud #${abierta.id} · ${formatearFecha(abierta.fecha)}`}
          onCerrar={() => setAbiertaId(null)}
        >
          <dl className="panel-datos">
            <Dato etiqueta="Cliente">{abierta.cliente?.nombre ?? '—'}</Dato>
            <Dato etiqueta="Teléfono">{abierta.cliente?.telefono ?? '—'}</Dato>
            <Dato etiqueta="Proyecto">{textoProyecto(abierta)}</Dato>
            <Dato etiqueta="Lote">{textoLote(abierta)}</Dato>
            <Dato etiqueta="Estado del lote"><InsigniaLote estado={abierta.lote?.estado} /></Dato>
            <Dato etiqueta="Estado de la solicitud"><Insignia estado={buscarEstado(ESTADOS_SOLICITUD, abierta.estado)} /></Dato>
          </dl>

          {abierta.mensaje && (
            <div className="panel-seccion">
              <h3 className="panel-seccion-titulo">Mensaje del cliente</h3>
              <p className="panel-linea-detalle">{abierta.mensaje}</p>
            </div>
          )}

          <div className="panel-seccion">
            <h3 className="panel-seccion-titulo">Actualizar estado</h3>
            <div className="panel-acciones panel-acciones-inicio">
              {ESTADOS_SOLICITUD.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  className={e.value === abierta.estado ? 'btn-buscar panel-boton' : 'panel-boton-secundario'}
                  aria-pressed={e.value === abierta.estado}
                  onClick={() => cambiarEstado(abierta.id, e.value)}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <p className="panel-texto-secundario">El cambio es de demostración: no se guarda al salir de la página.</p>
          </div>
        </Modal>
      )}
    </>
  )
}

export default Solicitudes
