import { useState } from 'react'
import Modal from '../../components/Modal/Modal'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Dato, EncabezadoPagina, EstadoCarga, Insignia, InsigniaLote, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { actualizarSolicitud, getSolicitudesDeAsesor } from '../../services/api'
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

// Los cambios de estado se guardan en el almacén mock (`services/api.js`) y avisan al cliente.
function ListaSolicitudes({ inicial }) {
  const [solicitudes, setSolicitudes] = useState(inicial)
  const [filtro, setFiltro] = useState('')
  const [abiertaId, setAbiertaId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(null)

  const abierta = solicitudes.find((s) => s.id === abiertaId) ?? null
  const filas = filtro ? solicitudes.filter((s) => s.estado === filtro) : solicitudes

  const abrir = (id) => {
    setErrorGuardado(null)
    setAbiertaId(id)
  }

  const cambiarEstado = async (id, nuevoEstado) => {
    setGuardando(true)
    setErrorGuardado(null)
    try {
      const actualizada = await actualizarSolicitud(id, { estado: nuevoEstado })
      setSolicitudes((lista) => lista.map((s) => (s.id === id ? actualizada : s)))
    } catch (e) {
      setErrorGuardado(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const columnas = [
    {
      titulo: 'Cliente',
      render: (s) => (
        <span>
          {s.cliente?.nombre ?? '—'}
          {!s.clienteId && <span className="panel-texto-secundario">Visitante web</span>}
        </span>
      ),
    },
    { titulo: 'Tipo de solicitud', render: (s) => TIPOS_SOLICITUD[s.tipo] },
    { titulo: 'Proyecto', render: textoProyecto },
    { titulo: 'Lote', render: textoLote },
    { titulo: 'Fecha', render: (s) => formatearFecha(s.fecha) },
    { titulo: 'Estado', render: (s) => <Insignia estado={buscarEstado(ESTADOS_SOLICITUD, s.estado)} /> },
    {
      titulo: 'Acción',
      render: (s) => (
        <button type="button" className="panel-boton-secundario" onClick={() => abrir(s.id)}>
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
          className="panel-modal"
        >
          <dl className="panel-datos">
            <Dato etiqueta="Cliente">{abierta.cliente?.nombre ?? '—'}</Dato>
            <Dato etiqueta="Origen">{abierta.clienteId ? 'Cliente registrado' : 'Visitante del sitio web'}</Dato>
            <Dato etiqueta="Teléfono">{abierta.cliente?.telefono ?? '—'}</Dato>
            {abierta.cliente?.correo && <Dato etiqueta="Correo">{abierta.cliente.correo}</Dato>}
            <Dato etiqueta="Proyecto">{textoProyecto(abierta)}</Dato>
            <Dato etiqueta="Lote">{textoLote(abierta)}</Dato>
            <Dato etiqueta="Estado del lote"><InsigniaLote estado={abierta.lote?.estado} /></Dato>
            <Dato etiqueta="Estado de la solicitud"><Insignia estado={buscarEstado(ESTADOS_SOLICITUD, abierta.estado)} /></Dato>
          </dl>

          {abierta.motivo && (
            <div className="panel-seccion">
              <h3 className="panel-seccion-titulo">Tema de la consulta</h3>
              <p className="panel-linea-detalle">{abierta.motivo}</p>
            </div>
          )}

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
                  disabled={guardando}
                  onClick={() => cambiarEstado(abierta.id, e.value)}
                >
                  {e.label}
                </button>
              ))}
            </div>
            {errorGuardado && <p className="panel-error" role="alert">{errorGuardado}</p>}
            <p className="panel-texto-secundario">El cambio se guarda en este navegador (demostración) y se avisa al cliente.</p>
          </div>
        </Modal>
      )}
    </>
  )
}

export default Solicitudes
