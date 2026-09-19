import { useEffect, useState } from 'react'
import { MapPin, Grid2X2, Ruler, Tag } from 'lucide-react'
import './DetalleProyecto.css'
import { getProyecto } from '../../services/api'
import SolicitudForm from '../../components/SolicitudForm/SolicitudForm'
import { formatearPrecio, etiquetaDisponibilidad } from '../../utils/formato'

function useQueryId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('id')
}

function DetalleProyecto() {
  const id = useQueryId()
  const [proyecto, setProyecto] = useState(null)
  const [estado, setEstado] = useState('cargando') // 'cargando' | 'listo' | 'error'
  const [error, setError] = useState(null)
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false)

  useEffect(() => {
    let cancelado = false

    getProyecto(id)
      .then((proyectoData) => {
        if (cancelado) return
        setProyecto(proyectoData)
        setEstado('listo')
      })
      .catch((err) => {
        if (cancelado) return
        setError(err.message)
        setEstado('error')
      })

    return () => {
      cancelado = true
    }
  }, [id])

  const irALotes = () => {
    window.location.href = `/lotes?id=${id}`
  }

  if (estado === 'cargando') {
    return (
      <section className="detalle-proyecto">
        <div className="detalle-proyecto-estado">Cargando proyecto…</div>
      </section>
    )
  }

  if (estado === 'error') {
    return (
      <section className="detalle-proyecto">
        <div className="detalle-proyecto-estado">
          <p>{error ?? 'No se pudo cargar el proyecto.'}</p>
          <a className="btn-proyecto" href="/proyectospage">
            Volver a proyectos
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="detalle-proyecto">
      <div className="detalle-proyecto-contenido">
        <div className="detalle-proyecto-imagen">
          <img src={proyecto.imagen} alt={proyecto.nombre} />
          <span className="proyecto-estado">{etiquetaDisponibilidad(proyecto)}</span>
        </div>

        <div className="detalle-proyecto-info">
          <p className="detalle-proyecto-ubicacion">
            <MapPin size={14} /> {proyecto.ubicacion ?? 'Ubicación por confirmar'}
          </p>

          <h1>{proyecto.nombre}</h1>

          <p className="detalle-proyecto-descripcion">{proyecto.descripcion}</p>

          <div className="detalle-proyecto-datos">
            <div>
              <Tag size={18} className="indicador-icono" />
              <div>
                <small>Precio desde</small>
                <strong>{formatearPrecio(proyecto.precioDesde)}</strong>
              </div>
            </div>

            <div>
              <Ruler size={18} className="indicador-icono" />
              <div>
                <small>Área desde</small>
                <strong>{proyecto.areaDesde} m²</strong>
              </div>
            </div>

            <div>
              <Grid2X2 size={18} className="indicador-icono" />
              <div>
                <small>Lotes registrados</small>
                <strong>{proyecto.totalLotes}</strong>
              </div>
            </div>

            <div>
              <Grid2X2 size={18} className="indicador-icono" />
              <div>
                <small>Disponibles</small>
                <strong>{proyecto.lotesDisponibles}</strong>
              </div>
            </div>
          </div>

          <div className="detalle-proyecto-acciones">
            <button className="btn-proyecto" onClick={irALotes}>
              Elegir lote <span>→</span>
            </button>

            <button className="btn-detalles" onClick={() => setMostrarSolicitud(true)}>
              Solicitar información
            </button>
          </div>
        </div>
      </div>

      <SolicitudForm
        isOpen={mostrarSolicitud}
        onClose={() => setMostrarSolicitud(false)}
        tipo="informacion"
        proyecto={proyecto}
      />
    </section>
  )
}

export default DetalleProyecto
