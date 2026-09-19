
import { useEffect, useMemo, useState } from 'react'
import './Proyectospage.css'
import proyecto from '../../assets/images/E-terreno.png'
import {
  MapPin,
  Grid2X2,
  House,
} from 'lucide-react'
import { getProyectos, getTodosLosLotes } from '../../services/api'
import { ESTADOS_LOTE } from '../../data/estados'
import { formatearPrecio, etiquetaDisponibilidad } from '../../utils/formato'

const TODAS_UBICACIONES = 'Todos'

const RANGOS_AREA = [
  { id: 'hasta-100', etiqueta: 'Hasta 100 m²', min: 0, max: 100 },
  { id: '101-120', etiqueta: '101 - 120 m²', min: 101, max: 120 },
  { id: 'mas-120', etiqueta: 'Más de 120 m²', min: 121, max: Infinity },
]

const RANGOS_PRECIO = [
  { id: 'menos-80', etiqueta: 'Menos de S/ 80,000', min: 0, max: 79999 },
  { id: '80-90', etiqueta: 'S/ 80,000 - S/ 90,000', min: 80000, max: 90000 },
  { id: 'mas-90', etiqueta: 'Más de S/ 90,000', min: 90001, max: Infinity },
]

function plural(cantidad, singular, pluralTexto) {
  return cantidad === 1 ? singular : pluralTexto
}

function ProyectosPage() {
  const [proyectos, setProyectos] = useState([])
  const [lotes, setLotes] = useState([])
  const [estadoCarga, setEstadoCarga] = useState('cargando') // 'cargando' | 'listo' | 'error'

  const [ubicacion, setUbicacion] = useState(TODAS_UBICACIONES)
  const [busqueda, setBusqueda] = useState('')
  const [area, setArea] = useState('')
  const [precio, setPrecio] = useState('')
  const [estadoLote, setEstadoLote] = useState('')
  const [orden, setOrden] = useState('recientes')

  useEffect(() => {
    let cancelado = false

    Promise.all([getProyectos(), getTodosLosLotes()])
      .then(([proyectosData, lotesData]) => {
        if (cancelado) return
        setProyectos(proyectosData)
        setLotes(lotesData)
        setEstadoCarga('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoCarga('error')
      })

    return () => {
      cancelado = true
    }
  }, [])

  const irADetalle = (id) => {
    window.location.assign(`/detalle-proyecto?id=${id}`)
  }

  const ubicaciones = useMemo(
    () => [...new Set(proyectos.map((p) => p.ubicacion).filter(Boolean))],
    [proyectos],
  )

  const lotesPorProyecto = useMemo(() => {
    const mapa = {}
    lotes.forEach((lote) => {
      ;(mapa[lote.proyectoId] ??= []).push(lote)
    })
    return mapa
  }, [lotes])

  // Los precios aún no están cargados: el filtro de precio se activa solo cuando exista alguno.
  const hayPrecios = lotes.some((l) => l.precio_total !== null)

  const proyectosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    const rangoArea = RANGOS_AREA.find((r) => r.id === area)
    const rangoPrecio = RANGOS_PRECIO.find((r) => r.id === precio)

    const lista = proyectos.filter((p) => {
      const lotesDelProyecto = lotesPorProyecto[p.id] ?? []

      if (ubicacion !== TODAS_UBICACIONES && p.ubicacion !== ubicacion) return false
      if (texto && !`${p.nombre} ${p.ubicacion ?? ''}`.toLowerCase().includes(texto)) return false
      if (rangoArea && !lotesDelProyecto.some((l) => l.area_m2 >= rangoArea.min && l.area_m2 <= rangoArea.max)) {
        return false
      }
      if (
        rangoPrecio &&
        !lotesDelProyecto.some(
          (l) => l.precio_total !== null && l.precio_total >= rangoPrecio.min && l.precio_total <= rangoPrecio.max,
        )
      ) {
        return false
      }
      if (estadoLote && !lotesDelProyecto.some((l) => l.estado === estadoLote)) return false
      return true
    })

    // "Más recientes" conserva el orden de los datos (todavía no hay fecha de registro).
    if (orden === 'recientes') return lista

    const factor = orden === 'precio-menor' ? 1 : -1
    return [...lista].sort((a, b) => {
      if (a.precioDesde === null && b.precioDesde === null) return 0
      if (a.precioDesde === null) return 1
      if (b.precioDesde === null) return -1
      return factor * (a.precioDesde - b.precioDesde)
    })
  }, [proyectos, lotesPorProyecto, ubicacion, busqueda, area, precio, estadoLote, orden])

  const listo = estadoCarga === 'listo'
  const totalDisponibles = proyectos.reduce((suma, p) => suma + p.lotesDisponibles, 0)

  return (
    <section className="proyectos-page">
      <div className="proyectos-page-contenido">

        {/* Encabezado */}
        <div className="proyectos-hero-contenedor">
        <div className="proyectos-intro">
          <div className="proyectos-intro-overlay"></div>

          <div className="proyectos-titulo">
            <img
                className="logo-proyecto"
                src={proyecto}
                alt="Proyecto"
                />

            <p className="proyectos-descripcion">
              Descubre nuestros proyectos pensados
              <br />
              para construir tu futuro.
            </p>
          </div>

          
        </div>

        {/* Indicadores */}
         <div className="proyectos-indicadores">
              <div className="indicador">
                <MapPin className="indicador-icono" />

                <div>
                  <strong>{listo ? ubicaciones.length : '–'}</strong>
                  <span>{plural(ubicaciones.length, 'Ubicación', 'Ubicaciones')}</span>
                </div>
              </div>

              <div className="indicador">
                <Grid2X2 className="indicador-icono" />

                <div>
                  <strong>{listo ? totalDisponibles : '–'}</strong>
                  <span>{plural(totalDisponibles, 'Lote disponible', 'Lotes disponibles')}</span>
                </div>
              </div>

              <div className="indicador">
                <House className="indicador-icono" />

                <div>
                  <strong>{listo ? proyectos.length : '–'}</strong>
                  <span>{plural(proyectos.length, 'Proyecto', 'Proyectos')}</span>
                </div>
              </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="proyectos-panel">
          <div className="proyectos-filtros">
            {[TODAS_UBICACIONES, ...ubicaciones].map((opcion) => (
              <button
                key={opcion}
                className={ubicacion === opcion ? 'filtro-activo' : undefined}
                onClick={() => setUbicacion(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>

          <form className="proyectos-formulario" onSubmit={(e) => e.preventDefault()}>
            <div className="proyectos-input">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Buscar un proyecto o ubicación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Área del lote</option>
              {RANGOS_AREA.map((r) => (
                <option key={r.id} value={r.id}>{r.etiqueta}</option>
              ))}
            </select>

            <select
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              disabled={!hayPrecios}
              title={hayPrecios ? undefined : 'Los precios aún están por confirmar'}
            >
              <option value="">Rango de precio</option>
              {RANGOS_PRECIO.map((r) => (
                <option key={r.id} value={r.id}>{r.etiqueta}</option>
              ))}
            </select>

            <select value={estadoLote} onChange={(e) => setEstadoLote(e.target.value)}>
              <option value="">Estado</option>
              {ESTADOS_LOTE.map((e) => (
                <option key={e.value} value={e.value}>
                  Con lotes {e.label.toLowerCase()}s
                </option>
              ))}
            </select>

            <button className="btn-buscar" type="submit">
              Buscar <span>→</span>
            </button>
          </form>
        </div>

        {/* Título de resultados */}
        <div className="proyectos-resultados">
          <strong>
            {proyectosFiltrados.length}{' '}
            {plural(proyectosFiltrados.length, 'proyecto encontrado', 'proyectos encontrados')}
          </strong>

          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">☷ Ordenar por Más recientes</option>
            <option value="precio-menor">Precio menor</option>
            <option value="precio-mayor">Precio mayor</option>
          </select>
        </div>

        {estadoCarga === 'cargando' && <p className="lotes-subtitulo">Cargando proyectos…</p>}
        {estadoCarga === 'error' && (
          <p className="lotes-subtitulo">No se pudo cargar los proyectos. Intenta nuevamente.</p>
        )}
        {listo && proyectosFiltrados.length === 0 && (
          <p className="lotes-subtitulo">No se encontraron proyectos con los filtros seleccionados.</p>
        )}

        {/* Tarjetas */}
        {listo && (
          <div className="proyectos-grid">
            {proyectosFiltrados.map((item) => (
              <article className="proyecto-card" key={item.id}>
                <div className="proyecto-imagen">
                  <img src={item.imagen} alt={item.nombre} />

                  <span className="proyecto-estado">
                    {etiquetaDisponibilidad(item)}
                  </span>

                  {/* PENDIENTE: guardar favoritos requiere definir dónde se guardan (cuenta de
                      usuario o dispositivo) y dónde se consultan; aún no está definido. */}
                  <button className="proyecto-favorito" aria-label="Agregar a favoritos">
                    ♡
                  </button>
                </div>

                <div className="proyecto-info">
                  <h2>{item.nombre}</h2>

                  <p className="proyecto-ubicacion">
                     {item.ubicacion ?? 'Ubicación por confirmar'}
                  </p>

                  <div className="proyecto-detalles">
                    <div>
                      <small>Área desde</small>
                      <strong>{item.areaDesde} m²</strong>
                    </div>

                    <div>
                      <small>Precio desde</small>
                      <strong>{formatearPrecio(item.precioDesde)}</strong>
                    </div>

                    <div>
                      <small>Tipo</small>
                      <strong>Residencial</strong>
                    </div>
                  </div>

                  <p className="proyecto-descripcion">
                    {item.descripcion}
                  </p>

                  <div className="proyecto-acciones">
                    <button className="btn-detalles" onClick={() => irADetalle(item.id)}>
                      Ver más detalles →
                    </button>

                    <button className="btn-proyecto" onClick={() => irADetalle(item.id)}>
                      Ver proyecto <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


export default ProyectosPage
