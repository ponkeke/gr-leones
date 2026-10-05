import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal/Modal'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Tabla } from '../../components/areaInterna/Partes'
import {
  actualizarPreguntaFrecuente,
  crearPreguntaFrecuente,
  eliminarPreguntaFrecuente,
  getPreguntasFrecuentesAdmin,
} from '../../services/api'
import { formatearFecha } from '../../utils/formato'

/** CRUD de preguntas frecuentes. Solo las activas se muestran en /preguntas-frecuentes. */
function PreguntasFrecuentesAdmin() {
  const { datos, estado, error } = useDatos('preguntas-admin', getPreguntasFrecuentesAdmin)
  if (estado !== 'listo') {
    return (
      <>
        <EncabezadoPagina titulo="Preguntas frecuentes" />
        <EstadoCarga estado={estado} error={error} />
      </>
    )
  }
  return <ListaPreguntas inicial={datos} />
}

function ListaPreguntas({ inicial }) {
  const [preguntas, setPreguntas] = useState(inicial)
  const [editando, setEditando] = useState(null) // null | 'nueva' | pregunta
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)

  const recargar = async () => setPreguntas(await getPreguntasFrecuentesAdmin())

  const ejecutar = async (accion) => {
    setProcesando(true)
    setError(null)
    try {
      await accion()
      await recargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setProcesando(false)
    }
  }

  const eliminar = (p) => {
    if (!window.confirm(`¿Eliminar la pregunta “${p.pregunta}”?`)) return
    ejecutar(() => eliminarPreguntaFrecuente(p.id))
  }

  const columnas = [
    {
      titulo: 'Pregunta',
      render: (p) => (
        <span>
          <strong>{p.pregunta}</strong>
          <span className="panel-texto-secundario">{p.respuesta}</span>
        </span>
      ),
    },
    {
      titulo: 'Categoría / orden',
      render: (p) => (
        <span>
          {p.categoria ?? '—'}
          <span className="panel-texto-secundario">Orden: {p.orden ?? '—'}</span>
        </span>
      ),
    },
    {
      titulo: 'Estado',
      render: (p) => (
        <span className={`panel-estado panel-estado-${p.activa ? 'ok' : 'neutro'}`}>{p.activa ? 'Activa' : 'Inactiva'}</span>
      ),
    },
    { titulo: 'Actualizada', render: (p) => formatearFecha(p.fechaActualizacion) },
    {
      titulo: 'Acciones',
      render: (p) => (
        <span className="panel-acciones">
          <button type="button" className="panel-boton-secundario" disabled={procesando} onClick={() => setEditando(p)}>
            <Pencil size={14} aria-hidden="true" /> Editar
          </button>
          <button
            type="button"
            className="panel-boton-secundario"
            disabled={procesando}
            onClick={() => ejecutar(() => actualizarPreguntaFrecuente(p.id, { activa: !p.activa }))}
          >
            {p.activa ? 'Desactivar' : 'Activar'}
          </button>
          <button type="button" className="panel-boton-secundario" disabled={procesando} onClick={() => eliminar(p)}>
            <Trash2 size={14} aria-hidden="true" /> Eliminar
          </button>
        </span>
      ),
    },
  ]

  return (
    <>
      <EncabezadoPagina
        titulo="Preguntas frecuentes"
        subtitulo="Crea, edita, activa o desactiva las preguntas. Solo las activas se muestran en el sitio."
      >
        <button type="button" className="btn-buscar panel-boton" onClick={() => setEditando('nueva')}>
          <Plus size={15} aria-hidden="true" /> Nueva pregunta
        </button>
      </EncabezadoPagina>
      {error && <p className="panel-error" role="alert">{error}</p>}
      <Tabla columnas={columnas} filas={preguntas} vacio="No hay preguntas registradas." />
      {editando && (
        <EditorPregunta
          pregunta={editando === 'nueva' ? null : editando}
          onGuardado={recargar}
          onCerrar={() => setEditando(null)}
        />
      )}
    </>
  )
}

function EditorPregunta({ pregunta, onGuardado, onCerrar }) {
  const [datos, setDatos] = useState({
    pregunta: pregunta?.pregunta ?? '',
    respuesta: pregunta?.respuesta ?? '',
    categoria: pregunta?.categoria ?? '',
    orden: pregunta?.orden ?? '',
    activa: pregunta?.activa ?? true,
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const guardar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      if (pregunta) await actualizarPreguntaFrecuente(pregunta.id, datos)
      else await crearPreguntaFrecuente(datos)
      await onGuardado()
      onCerrar()
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  const hayCambios = datos.pregunta !== (pregunta?.pregunta ?? '') || datos.respuesta !== (pregunta?.respuesta ?? '')

  return (
    <Modal
      titulo={pregunta ? 'Editar pregunta' : 'Nueva pregunta'}
      onCerrar={onCerrar}
      cerrarAlClicFuera={!hayCambios}
      className="panel-modal"
    >
      <form className="panel-formulario" onSubmit={guardar} noValidate>
        <label className="panel-campo panel-campo-ancho">
          Pregunta
          <input required value={datos.pregunta} onChange={(e) => setDatos((d) => ({ ...d, pregunta: e.target.value }))} />
        </label>
        <label className="panel-campo panel-campo-ancho">
          Respuesta
          <textarea required value={datos.respuesta} onChange={(e) => setDatos((d) => ({ ...d, respuesta: e.target.value }))} />
        </label>
        <label className="panel-campo">
          Categoría (opcional)
          <input value={datos.categoria} maxLength={60} onChange={(e) => setDatos((d) => ({ ...d, categoria: e.target.value }))} />
        </label>
        <label className="panel-campo">
          Orden (opcional)
          <input type="number" min="0" step="1" value={datos.orden} onChange={(e) => setDatos((d) => ({ ...d, orden: e.target.value }))} />
        </label>
        <label className="panel-campo panel-campo-ancho panel-casilla">
          <input type="checkbox" checked={datos.activa} onChange={(e) => setDatos((d) => ({ ...d, activa: e.target.checked }))} />
          Mostrar en el sitio (activa)
        </label>
        {error && <p className="panel-error" role="alert">{error}</p>}
        <div className="panel-formulario-acciones">
          <button type="submit" className="btn-buscar panel-boton" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="button" className="panel-boton-secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default PreguntasFrecuentesAdmin
