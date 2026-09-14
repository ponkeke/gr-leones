import './comunicados.css'
import terreno1 from '../../assets/images/terreno1.png'
import novedades from '../../assets/images/novedades-titulo.png'
import leoncom from '../../assets/images/leon-comunicados.png'
import leonbusc from '../../assets/images/leon-buscando.png'

import { MapPin } from 'lucide-react'

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

function Comunicados() {
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
            <button className="filtro-activo">Todos</button>
            <button>Novedades</button>
            <button>Eventos</button>
            <button>Avances de obra</button>
            <button>Consejos</button>
            <button>Importante</button>
          </div>

          <div className="comunicados-buscador">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Buscar comunicado..."
            />
          </div>
        </div>
      </div>

      {/* LISTADO DE COMUNICADOS */}
      <div className="comunicados-listado">
        <div className="container">
          <div className="comunicados-listado-cabecera">
            <h2>Últimos comunicados</h2>

            <button className="ordenar-button">
              ☷ &nbsp; Ordenar por:
              <span>Más recientes⌄</span>
            </button>
          </div>

          <div className="comunicados-grid">
            {comunicados.map((comunicado, index) => (
              <article
                className="comunicado-card"
                key={index}
              >
                <div className="comunicado-imagen">
                  <img
                    src={comunicado.imagen}
                    alt={comunicado.titulo}
                  />

                  <span className="comunicado-categoria">
                    {comunicado.categoria}
                  </span>

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
                  >
                    Leer más →
                  </button>
                </div>
              </article>
            ))}
          </div>
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

          <button className="banner-button" type="button">
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