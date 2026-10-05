import { useState } from 'react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import Estrellas from '../../components/Estrellas/Estrellas'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { cambiarEstadoTestimonio, eliminarTestimonio, getTestimoniosAdmin } from '../../services/api'
import { ESTADOS_TESTIMONIO } from '../../data/contenido'
import { buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

const fechaCorta = (iso) => formatearFecha(String(iso ?? '').slice(0, 10))

/** Revisión de testimonios: solo los PUBLICADOS aparecen en el sitio. */
function TestimoniosAdmin() {
  const { datos, estado, error } = useDatos('testimonios-admin', getTestimoniosAdmin)
  return (
    <>
      <EncabezadoPagina
        titulo="Testimonios"
        subtitulo="Revisa los testimonios que envían los clientes. Solo los publicados se muestran en el sitio."
      >
        <a className="panel-boton-secundario" href="/testimonios">Ver en el sitio</a>
      </EncabezadoPagina>
      {estado !== 'listo' ? <EstadoCarga estado={estado} error={error} /> : <ListaTestimonios inicial={datos} />}
    </>
  )
}

function ListaTestimonios({ inicial }) {
  const [testimonios, setTestimonios] = useState(inicial)
  const [filtro, setFiltro] = useState('')
  const [procesando, setProcesando] = useState(null)
  const [error, setError] = useState(null)

  const ejecutar = async (id, accion) => {
    setProcesando(id)
    setError(null)
    try {
      await accion()
      setTestimonios(await getTestimoniosAdmin())
    } catch (e) {
      setError(e.message)
    } finally {
      setProcesando(null)
    }
  }

  const eliminar = (t) => {
    if (!window.confirm(`¿Eliminar definitivamente el testimonio de ${t.nombreCliente ?? t.nombreVisible}?`)) return
    ejecutar(t.id, () => eliminarTestimonio(t.id))
  }

  const columnas = [
    { titulo: 'Fecha', render: (t) => fechaCorta(t.fechaCreacion) },
    {
      titulo: 'Cliente',
      render: (t) => (
        <span>
          {t.nombreCliente ?? '—'}
          <span className="panel-texto-secundario">{[t.codigoCliente, `Se publica como “${t.nombreVisible}”`].filter(Boolean).join(' · ')}</span>
        </span>
      ),
    },
    { titulo: 'Puntuación', render: (t) => <Estrellas valor={t.puntuacion} /> },
    { titulo: 'Comentario', render: (t) => <span className="panel-linea-detalle">“{t.comentario}”</span> },
    { titulo: 'Proyecto', render: (t) => t.proyecto ?? '—' },
    { titulo: 'Estado', render: (t) => <Insignia estado={buscarEstado(ESTADOS_TESTIMONIO, t.estado)} /> },
    {
      titulo: 'Acciones',
      render: (t) => (
        <span className="panel-acciones">
          {t.estado !== 'PUBLICADO' && (
            <button type="button" className="btn-buscar panel-boton" disabled={procesando !== null} onClick={() => ejecutar(t.id, () => cambiarEstadoTestimonio(t.id, 'PUBLICADO'))}>
              <Eye size={14} aria-hidden="true" /> Publicar
            </button>
          )}
          {t.estado !== 'OCULTO' && (
            <button type="button" className="panel-boton-secundario" disabled={procesando !== null} onClick={() => ejecutar(t.id, () => cambiarEstadoTestimonio(t.id, 'OCULTO'))}>
              <EyeOff size={14} aria-hidden="true" /> Ocultar
            </button>
          )}
          <button type="button" className="panel-boton-secundario" disabled={procesando !== null} onClick={() => eliminar(t)} aria-label="Eliminar testimonio">
            <Trash2 size={14} aria-hidden="true" /> Eliminar
          </button>
        </span>
      ),
    },
  ]

  const filas = filtro ? testimonios.filter((t) => t.estado === filtro) : testimonios

  return (
    <>
      <div className="panel-formulario panel-filtros">
        <label className="panel-campo">
          Estado
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS_TESTIMONIO.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="panel-error" role="alert">{error}</p>}
      <Tabla columnas={columnas} filas={filas} vacio={filtro ? 'No hay testimonios con ese estado.' : 'Todavía no hay testimonios enviados por clientes.'} />
    </>
  )
}

export default TestimoniosAdmin
