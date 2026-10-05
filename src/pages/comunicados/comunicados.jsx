import { useEffect, useState } from 'react'
import './comunicados.css'
import novedades from '../../assets/images/novedades-titulo.webp'
import leoncom from '../../assets/images/leon-comunicados.webp'
import leonbusc from '../../assets/images/leon-buscando.webp'

import { MapPin } from 'lucide-react'
import { getComunicados } from '../../services/api'

// Los comunicados llegan de `getComunicados()` (services/api.js). La empresa todavía no redactó
// comunicados propios: por ahora solo se publican hechos que ya están en los datos de cada
// proyecto (plano comercial y avance). Cada uno trae `enlace`: "Leer más" lo abre. Una página de
// detalle propia queda para cuando exista contenido completo.

// Cada botón de filtro y la categoría que muestra (`null` = todas).
const FILTROS = [
  { etiqueta: 'Todos', categoria: null },
  { etiqueta: 'Novedades', categoria: 'Novedad' },
  { etiqueta: 'Eventos', categoria: 'Evento' },
  { etiqueta: 'Avances de obra', categoria: 'Avance de obra' },
  { etiqueta: 'Consejos', categoria: 'Consejos' },
  { etiqueta: 'Importante', categoria: 'Importante' },
]

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

// "2026-09-07" -> "07 SEP 2026" (el formato que ya usaba la tarjeta).
function fechaComunicado(iso) {
  const [anio, mes, dia] = iso.split('-')
  return `${dia} ${MESES[Number(mes) - 1]} ${anio}`
}

// Para buscar sin distinguir mayúsculas ni tildes.
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// PENDIENTE: ruta o URL de la página/calendario de próximos eventos (aún no existe).
// Al asignarla, "Ver calendario" navegará allí.
const URL_CALENDARIO = null

function Comunicados() {
  const [comunicados, setComunicados] = useState([])
  const [estadoCarga, setEstadoCarga] = useState('cargando') // 'cargando' | 'listo' | 'error'
  const [filtroActivo, setFiltroActivo] = useState(FILTROS[0].etiqueta)
  const [busqueda, setBusqueda] = useState('')
  const [masRecientesPrimero, setMasRecientesPrimero] = useState(true)

  useEffect(() => {
    let cancelado = false
    getComunicados()
      .then((datos) => {
        if (cancelado) return
        setComunicados(datos)
        setEstadoCarga('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoCarga('error')
      })
    return () => {
      cancelado = true
    }
  }, [])

  const categoriaActiva = FILTROS.find((filtro) => filtro.etiqueta === filtroActivo).categoria
  const texto = normalizar(busqueda.trim())

  const comunicadosVisibles = comunicados
    .filter((comunicado) => !categoriaActiva || comunicado.categoria === categoriaActiva)
    .filter(
      (comunicado) =>
        !texto || normalizar(`${comunicado.titulo} ${comunicado.descripcion}`).includes(texto),
    )
    .sort((a, b) => {
      const diferencia = b.fecha.localeCompare(a.fecha)
      return masRecientesPrimero ? diferencia : -diferencia
    })

  const leerMas = (comunicado) => {
    if (comunicado.enlace) window.location.assign(comunicado.enlace)
  }

  const verCalendario = () => {
    if (URL_CALENDARIO) window.location.assign(URL_CALENDARIO)
  }

  return (
    <section className="comunicados">
      {/* ENCABEZADO PRINCIPAL */}
      <div className="comunicados-hero">
        <div className="comunicados-hero-overlay"></div>

        <div className="container comunicados-hero-contenido">
          <div className="comunicados-titulo">

            <img
                className="logo-comunicados"
                src={novedades}
                alt="Novedades y Comunicados"
                />

          </div>

         <div className="comunicados-hero-imagen">
        <img
            src={leoncom}
            alt="Personaje de Grupo Inmobiliario Leones"
        />
        </div>
          
        </div>
      </div>

      {/* FILTROS */}
      <div className="comunicados-filtros-container">
        <div className="container comunicados-filtros">
          <div className="filtros-categorias">
            {FILTROS.map((filtro) => (
              <button
                key={filtro.etiqueta}
                type="button"
                className={filtroActivo === filtro.etiqueta ? 'filtro-activo' : undefined}
                onClick={() => setFiltroActivo(filtro.etiqueta)}
              >
                {filtro.etiqueta}
              </button>
            ))}
          </div>

          <div className="comunicados-buscador">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar comunicado..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
        </div>
      </div>

      {/* LISTADO DE COMUNICADOS */}
      <div className="comunicados-listado">
        <div className="container">
          <div className="comunicados-listado-cabecera">
            <h2>Últimos comunicados</h2>

            <button
              className="ordenar-button"
              type="button"
              onClick={() => setMasRecientesPrimero((valor) => !valor)}
            >
              ☷ &nbsp; Ordenar por:
              <span>{masRecientesPrimero ? 'Más recientes' : 'Más antiguos'} ▼ </span>
            </button>
          </div>

          <div className="comunicados-grid">
            {comunicadosVisibles.map((comunicado) => (
              <article
                className="comunicado-card"
                key={comunicado.id}
              >
                <div className="comunicado-imagen">
                  <img
                    src={comunicado.imagen}
                    alt={comunicado.titulo}
                  />

                  <span className="comunicado-categoria">
                    {comunicado.categoria}
                  </span>

                  {/* PENDIENTE: guardar favoritos requiere definir dónde se guardan (cuenta de
                      usuario o dispositivo) y dónde se consultan; aún no está definido. */}
                  <button
                    className="comunicado-favorito"
                    type="button"
                    aria-label="Guardar comunicado"
                  >
                    ♡
                  </button>
                </div>

                <div className="comunicado-contenido">
                  <span className="comunicado-fecha">
                    ▣ &nbsp; {fechaComunicado(comunicado.fecha)}
                  </span>

                  <h3>{comunicado.titulo}</h3>

                  <p>{comunicado.descripcion}</p>

                  <button
                    className="comunicado-leer"
                    type="button"
                    onClick={() => leerMas(comunicado)}
                  >
                    Leer más →
                  </button>
                </div>
              </article>
            ))}
          </div>

          {estadoCarga === 'cargando' && <p className="lotes-subtitulo">Cargando comunicados…</p>}
          {estadoCarga === 'error' && (
            <p className="lotes-subtitulo">No pudimos cargar los comunicados. Intenta nuevamente.</p>
          )}
          {estadoCarga === 'listo' && comunicadosVisibles.length === 0 && (
            <p className="lotes-subtitulo">No hay comunicados que coincidan con tu búsqueda.</p>
          )}
        </div>
      </div>

      {/* BANNER INFERIOR */}
      <div className="comunicados-banner">
        <div className="container comunicados-banner-contenido">
          <div className="banner-icono">
            <MapPin size={58} strokeWidth={2} />
            </div>

          <div className="banner-texto">
            <span>SE PARTE DE NUESTROS</span>
            <h2>PRÓXIMOS EVENTOS</h2>
            <p>Conoce ferias, lanzamientos y más.</p>
          </div>

          <button
            className="banner-button"
            type="button"
            onClick={verCalendario}
            disabled={!URL_CALENDARIO}
            title={URL_CALENDARIO ? undefined : 'Calendario de eventos por confirmar'}
          >
            Ver calendario →
          </button>

          <div className="banner-personaje">
            
            <img
              src={leonbusc}
              alt="Personaje de Grupo Leones"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Comunicados