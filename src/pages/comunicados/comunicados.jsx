import { useState } from 'react'
import './comunicados.css'
import terreno1 from '../../assets/images/terreno1.png'
import novedades from '../../assets/images/novedades-titulo.png'
import leoncom from '../../assets/images/leon-comunicados.png'
import leonbusc from '../../assets/images/leon-buscando.png'

import { MapPin } from 'lucide-react'

// PENDIENTE: los comunicados todavía no tienen contenido completo ni página propia. Cuando
// existan, agregar a cada objeto un campo `enlace` (ruta o URL): "Leer más" lo abrirá solo.
const comunicados = [
  {
    categoria: 'Novedad',
    fecha: '07 SEP 2026',
    titulo: 'NUEVA ETAPA DE NUESTRO PROYECTO VELAMAR',
    descripcion:
      'Conoce la información y novedades de nuestros proyectos inmobiliarios.',
    imagen: terreno1,
  },
  {
    categoria: 'Evento',
    fecha: '03 SEP 2026',
    titulo: 'FERIA INMOBILIARIA LEONES 2026',
    descripcion:
      'Participa en nuestros eventos y conoce las nuevas oportunidades inmobiliarias.',
    imagen: terreno1,
  },
  {
    categoria: 'Avance de obra',
    fecha: '28 AGO 2026',
    titulo: 'AVANCE DE OBRAS – VELAMAR',
    descripcion:
      'Conoce el avance de las obras y el desarrollo de nuestros proyectos.',
    imagen: terreno1,
  },
  {
    categoria: 'Consejos',
    fecha: '20 AGO 2026',
    titulo: '¿POR QUÉ INVERTIR EN TERRENOS?',
    descripcion:
      'Descubre las ventajas de invertir en terrenos para tu futuro.',
    imagen: terreno1,
  },
  {
    categoria: 'Importante',
    fecha: '12 AGO 2026',
    titulo: 'NUEVAS OPCIONES DE FINANCIAMIENTO',
    descripcion:
      'Conoce nuestras alternativas y facilidades para adquirir tu terreno.',
    imagen: terreno1,
  },
  {
    categoria: 'Evento',
    fecha: '05 AGO 2026',
    titulo: 'VISÍTANOS EN NUESTRA OFICINA',
    descripcion:
      'Nuestro equipo está listo para brindarte toda la información que necesitas.',
    imagen: terreno1,
  },
]

// Cada botón de filtro y la categoría que muestra (`null` = todas).
const FILTROS = [
  { etiqueta: 'Todos', categoria: null },
  { etiqueta: 'Novedades', categoria: 'Novedad' },
  { etiqueta: 'Eventos', categoria: 'Evento' },
  { etiqueta: 'Avances de obra', categoria: 'Avance de obra' },
  { etiqueta: 'Consejos', categoria: 'Consejos' },
  { etiqueta: 'Importante', categoria: 'Importante' },
]

const MESES = { ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5, JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11 }

// "07 SEP 2026" -> marca de tiempo, para poder ordenar por fecha.
function fechaComoNumero(texto) {
  const [dia, mes, anio] = texto.split(' ')
  return new Date(Number(anio), MESES[mes] ?? 0, Number(dia)).getTime()
}

// Para buscar sin distinguir mayúsculas ni tildes.
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// PENDIENTE: ruta o URL de la página/calendario de próximos eventos (aún no existe).
// Al asignarla, "Ver calendario" navegará allí.
const URL_CALENDARIO = null

function Comunicados() {
  const [filtroActivo, setFiltroActivo] = useState(FILTROS[0].etiqueta)
  const [busqueda, setBusqueda] = useState('')
  const [masRecientesPrimero, setMasRecientesPrimero] = useState(true)

  const categoriaActiva = FILTROS.find((filtro) => filtro.etiqueta === filtroActivo).categoria
  const texto = normalizar(busqueda.trim())

  const comunicadosVisibles = comunicados
    .filter((comunicado) => !categoriaActiva || comunicado.categoria === categoriaActiva)
    .filter(
      (comunicado) =>
        !texto || normalizar(`${comunicado.titulo} ${comunicado.descripcion}`).includes(texto),
    )
    .sort((a, b) => {
      const diferencia = fechaComoNumero(b.fecha) - fechaComoNumero(a.fecha)
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

            <p>
              Mantente al día con nuestras novedades, avances, eventos y más.
            </p>
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
              <span>{masRecientesPrimero ? 'Más recientes' : 'Más antiguos'}⌄</span>
            </button>
          </div>

          <div className="comunicados-grid">
            {comunicadosVisibles.map((comunicado) => (
              <article
                className="comunicado-card"
                key={`${comunicado.fecha}-${comunicado.titulo}`}
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
                    ▣ &nbsp; {comunicado.fecha}
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

          {comunicadosVisibles.length === 0 && (
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

          <button className="banner-button" type="button" onClick={verCalendario}>
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