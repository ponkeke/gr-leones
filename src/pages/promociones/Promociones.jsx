import { useEffect, useMemo, useState } from 'react'
import {
  MapPin,
  Tag,
  ShieldCheck,
  TrendingUp,
  Search,
  Building2,
  Coins,
  LandPlot,
  ArrowUpRight,
  MessageCircle,
} from 'lucide-react'

import './Promociones.css'
import promo from '../../assets/images/promo-logo.webp'
import leonpromo from '../../assets/images/leon-promo.webp'
import { getProyectos } from '../../services/api'
import { etiquetaDisponibilidad, formatearPrecio } from '../../utils/formato'

// TODO: reemplazar por la fotografía real del asesor / tarjeta lateral.
// Colocar el archivo en: public/images/promociones/asesor.png
const IMG_ASESOR = '/images/promociones/asesor.png'

const beneficios = [
  {
    icono: MapPin,
    titulo: 'Ubicaciones estratégicas',
  },
  {
    icono: Tag,
    titulo: 'Precios especiales',
  },
  {
    icono: ShieldCheck,
    titulo: 'Inversión segura',
  },
  {
    icono: TrendingUp,
    titulo: 'Plusvalía garantizada',
  },
]

const OPCION_UBICACION_DEFECTO = 'Todas las ubicaciones'
const OPCION_TIPO_DEFECTO = 'Todos los tipos'

const rangosPrecio = [
  { etiqueta: 'Cualquier precio', min: 0, max: Infinity },
  { etiqueta: 'Hasta S/ 100,000', min: 0, max: 100000 },
  { etiqueta: 'S/ 100,000 - S/ 200,000', min: 100000, max: 200000 },
  { etiqueta: 'Más de S/ 200,000', min: 200000, max: Infinity },
]

// Todavía no hay promociones vigentes confirmadas por la empresa. Para no mostrar proyectos,
// descuentos ni precios inventados, esta sección lista los proyectos REALES del sistema
// (`getProyectos()`, los mismos de /proyectospage). Cuando existan promociones reales, llegarán
// por la API con esta misma forma de tarjeta.
function tarjetaDeProyecto(proyecto) {
  return {
    id: proyecto.id,
    nombre: proyecto.nombre,
    ubicacion: proyecto.ubicacion ?? 'Ubicación por confirmar',
    ciudad: proyecto.ubicacion ? proyecto.ubicacion.split(',')[0].trim() : null,
    // Los proyectos de Leones son de lotes.
    tipo: 'Lote',
    area: proyecto.areaDesde,
    precio: proyecto.precioDesde,
    precioTexto: proyecto.precioDesde === null ? 'Precio por confirmar' : `Desde ${formatearPrecio(proyecto.precioDesde)}`,
    // Insignia calculada con los lotes (no es una promoción).
    estado: etiquetaDisponibilidad(proyecto),
    imagen: proyecto.imagen,
    enlace: `/lotes?id=${proyecto.id}`,
  }
}

/** Opciones de un filtro a partir de los datos (sin valores vacíos ni repetidos). */
const opcionesDe = (tarjetas, campo, opcionDefecto) => [
  opcionDefecto,
  ...new Set(tarjetas.map((tarjeta) => tarjeta[campo]).filter(Boolean)),
]

function ImagenProyecto({ src, alt }) {
  const [errorCarga, setErrorCarga] = useState(false)

  if (errorCarga) {
    return (
      <div className="promo-imagen-fallback">
        <LandPlot size={34} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrorCarga(true)}
    />
  )
}

const filtrosPorDefecto = {
  busqueda: '',
  ubicacion: OPCION_UBICACION_DEFECTO,
  tipo: OPCION_TIPO_DEFECTO,
  rangoPrecio: rangosPrecio[0].etiqueta,
}

function Promociones() {
  const [promociones, setPromociones] = useState([])
  const [estadoCarga, setEstadoCarga] = useState('cargando') // 'cargando' | 'listo' | 'error'

  useEffect(() => {
    let cancelado = false
    getProyectos()
      .then((proyectos) => {
        if (cancelado) return
        setPromociones(proyectos.map(tarjetaDeProyecto))
        setEstadoCarga('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoCarga('error')
      })
    return () => {
      cancelado = true
    }
  }, [])

  const ubicacionesFiltro = useMemo(() => opcionesDe(promociones, 'ciudad', OPCION_UBICACION_DEFECTO), [promociones])
  const tiposFiltro = useMemo(() => opcionesDe(promociones, 'tipo', OPCION_TIPO_DEFECTO), [promociones])
  const [busqueda, setBusqueda] = useState(filtrosPorDefecto.busqueda)
  const [ubicacion, setUbicacion] = useState(filtrosPorDefecto.ubicacion)
  const [tipo, setTipo] = useState(filtrosPorDefecto.tipo)
  const [rangoPrecio, setRangoPrecio] = useState(filtrosPorDefecto.rangoPrecio)

  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosPorDefecto)

  const aplicarFiltros = (evento) => {
    evento.preventDefault()

    setFiltrosAplicados({
      busqueda,
      ubicacion,
      tipo,
      rangoPrecio,
    })
  }

  const promocionesFiltradas = useMemo(() => {
    const rango =
      rangosPrecio.find(
        (item) => item.etiqueta === filtrosAplicados.rangoPrecio
      ) || rangosPrecio[0]

    const texto = filtrosAplicados.busqueda.trim().toLowerCase()

    return promociones.filter((promo) => {
      const coincideTexto =
        texto === '' ||
        promo.nombre.toLowerCase().includes(texto) ||
        promo.ubicacion.toLowerCase().includes(texto)

      const coincideUbicacion =
        filtrosAplicados.ubicacion === OPCION_UBICACION_DEFECTO ||
        promo.ciudad === filtrosAplicados.ubicacion

      const coincideTipo =
        filtrosAplicados.tipo === OPCION_TIPO_DEFECTO ||
        promo.tipo === filtrosAplicados.tipo

      // Sin precio confirmado, el proyecto solo aparece con "Cualquier precio".
      const coincidePrecio =
        rango === rangosPrecio[0] ||
        (promo.precio !== null && promo.precio >= rango.min && promo.precio <= rango.max)

      return coincideTexto && coincideUbicacion && coincideTipo && coincidePrecio
    })
  }, [promociones, filtrosAplicados])

  return (
    <section className="promociones">

      {/* =====================================================
          BLOQUE 1: HERO CON FONDO PROPIO
      ===================================================== */}

      <section className="promo-hero-bloque">
        <div className="promo-hero-overlay" />

        <div className="promo-contenedor">
          <div className="promo-hero">

            <div className="promo-hero-texto">
             <img
                className="logo-promo"
                src={promo}
                alt="promo"
                />

              <p className="promo-descripcion">
                Descubre nuestros proyectos en promoción y encuentra el
                espacio ideal para construir tu próximo hogar o realizar
                una inversión segura.
              </p>

              <div className="promo-beneficios">
                {beneficios.map((item) => {
                  const Icono = item.icono

                  return (
                    <div className="promo-beneficio-item" key={item.titulo}>
                      <span className="promo-beneficio-icono">
                        <Icono size={22} strokeWidth={1.8} />
                      </span>

                      <span className="promo-beneficio-titulo">
                        {item.titulo}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="promo-hero-visual">
              <div className="promo-hero-imagen">
                 <img
                  src={leonpromo}
                  alt="Promociones Grupo Inmobiliario Leones del Sur"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          BLOQUE 2: BUSCADOR Y FILTROS
      ===================================================== */}

      <section className="promo-filtros-bloque">
        <div className="promo-contenedor">
          <form className="promo-filtros-panel" onSubmit={aplicarFiltros}>

            <div className="promo-filtro-campo promo-filtro-busqueda">
              <Search size={17} strokeWidth={2} />
              <input
                type="text"
                placeholder="Buscar por proyecto o ubicación"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            <div className="promo-filtro-campo">
              <MapPin size={17} strokeWidth={2} />
              <select
                value={ubicacion}
                onChange={(evento) => setUbicacion(evento.target.value)}
              >
                {ubicacionesFiltro.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="promo-filtro-campo">
              <Building2 size={17} strokeWidth={2} />
              <select
                value={tipo}
                onChange={(evento) => setTipo(evento.target.value)}
              >
                {tiposFiltro.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="promo-filtro-campo">
              <Coins size={17} strokeWidth={2} />
              <select
                value={rangoPrecio}
                onChange={(evento) => setRangoPrecio(evento.target.value)}
              >
                {rangosPrecio.map((opcion) => (
                  <option key={opcion.etiqueta} value={opcion.etiqueta}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="promo-filtro-boton">
              <Search size={16} strokeWidth={2.2} />
              Buscar
            </button>

          </form>
        </div>
      </section>

      {/* =====================================================
          BLOQUE 3: NUESTRAS PROMOCIONES
      ===================================================== */}

      <section className="promo-listado-bloque">
        <div className="promo-contenedor">
          <div className="promo-listado-seccion">

            <div className="promo-seccion-encabezado">
              <span className="promo-eyebrow">
                Nuestras promociones
              </span>

              <h2 className="promo-seccion-titulo">
                Proyectos en{' '}
                <span className="promo-texto-dorado">venta</span>
              </h2>

              <span
                className="promo-linea-dorada promo-linea-centrada"
                aria-hidden="true"
              />

              <p className="promo-seccion-descripcion">
                Aún no hay promociones vigentes confirmadas. Mientras tanto,
                conoce nuestros proyectos en venta y encuentra el lote ideal para ti.
              </p>
            </div>

            <div className="promo-contenido-grid">

              <div className="promo-proyectos-grid">
                {promocionesFiltradas.map((promo) => (
                  <article className="promo-card" key={promo.id}>
                    <div className="promo-card-imagen">
                      <ImagenProyecto src={promo.imagen} alt={promo.nombre} />
                      <span className="promo-card-estado">
                        {promo.estado}
                      </span>
                    </div>

                    <div className="promo-card-contenido">
                      <h3 className="promo-card-nombre">
                        {promo.nombre}
                      </h3>

                      <div className="promo-card-dato">
                        <MapPin size={14} strokeWidth={2} />
                        <span>{promo.ubicacion}</span>
                      </div>

                      <div className="promo-card-dato">
                        <LandPlot size={14} strokeWidth={2} />
                        <span>{promo.area === null ? 'Área por confirmar' : `Desde ${promo.area} m²`}</span>
                      </div>

                      <div className="promo-card-pie">
                        <span className="promo-card-precio">
                          {promo.precioTexto}
                        </span>

                        <a
                          className="promo-card-boton"
                          href={promo.enlace}
                        >
                          Ver detalles
                          <ArrowUpRight size={15} strokeWidth={2.2} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}

                {estadoCarga === 'cargando' && (
                  <p className="promo-sin-resultados">Cargando proyectos…</p>
                )}

                {estadoCarga === 'error' && (
                  <p className="promo-sin-resultados">
                    No pudimos cargar los proyectos. Intenta nuevamente.
                  </p>
                )}

                {estadoCarga === 'listo' && promocionesFiltradas.length === 0 && (
                  <p className="promo-sin-resultados">
                    No encontramos proyectos con los filtros
                    seleccionados. Intenta con otra búsqueda.
                  </p>
                )}
              </div>

              <aside className="promo-lateral-card">
                <div className="promo-lateral-imagen">
                  {/* TODO: reemplazar por la imagen real (ver IMG_ASESOR arriba) */}
                  <img src={IMG_ASESOR} alt="Asesor Leones del Sur" />
                </div>

                <div className="promo-lateral-contenido">
                  <span
                    className="promo-linea-dorada"
                    aria-hidden="true"
                  />

                  <h3 className="promo-lateral-titulo">
                    Más que promociones, oportunidades para tu futuro.
                  </h3>

                  <p className="promo-lateral-texto">
                    Vive, invierte y crece con Leones del Sur.
                  </p>

                  <a href="#contacto" className="promo-lateral-boton">
                    <MessageCircle size={18} strokeWidth={2} />
                    Contáctanos
                  </a>
                </div>
              </aside>

            </div>

          </div>
        </div>
      </section>

    </section>
  )
}

export default Promociones
