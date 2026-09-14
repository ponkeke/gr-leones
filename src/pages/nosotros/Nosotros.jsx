import { useRef, useState } from 'react'
import {
  Gem,
  Users,
  BarChart3,
  Handshake,
  Target,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from 'lucide-react'

import './Nosotros.css'
import leonN from '../../assets/images/leon-nosotros.png'
import asVen1 from '../../assets/images/asVentas1.png'
import asVen2 from '../../assets/images/asVentas2.png'
import asVen3 from '../../assets/images/asVentas3.png'
import asVen4 from '../../assets/images/asVentas4.png'
import drCom from '../../assets/images/drComercial.png'


const caracteristicas = [
  {
    icono: Gem,
    titulo: 'Compromiso',
    subtitulo: 'Con tu futuro',
  },
  {
    icono: Users,
    titulo: 'Experiencia',
    subtitulo: 'En el sector',
  },
  {
    icono: BarChart3,
    titulo: 'Transparencia',
    subtitulo: 'En cada proceso',
  },
  {
    icono: Handshake,
    titulo: 'Cercanía',
    subtitulo: 'Con nuestros clientes',
  },
]

const categorias = [
  'Todos',
  'Directivos',
  'Asesores',
  'Administración',
]

const integrantes = [
  {
    // TODO: reemplazar por la fotografía real del Director General
    id: 'director-general',
    nombre: 'Nombre del integrante',
    cargo: 'Director General',
    frase: 'Construimos confianza para crear grandes proyectos.',
    categoria: 'Directivos',
    imagen: '/images/equipo-director-general.jpg',
  },
  {
    id: 'director-comercial',
    nombre: 'Nombre del integrante',
    cargo: 'Director Comercial',
    frase: 'Cada cliente merece un proyecto pensado a su medida.',
    categoria: 'Directivos',
    imagen: drCom,
  },
  {
    id: 'asesora-ventas-1',
    nombre: 'Nombre del integrante',
    cargo: 'Asesora de ventas',
    frase: 'La planificación es la base de todo gran resultado.',
    categoria: 'Asesores',
    imagen: asVen1,
  },
  {
    id: 'asesora-ventas-2',
    nombre: 'Nombre del integrante',
    cargo: 'Asesora de ventas',
    frase: 'La planificación es la base de todo gran resultado.',
    categoria: 'Asesores',
    imagen: asVen2,
  },
  {
    id: 'asesora-ventas-3',
    nombre: 'Nombre del integrante',
    cargo: 'Asesora de ventas',
    frase: 'La transparencia legal protege cada inversión.',
    categoria: 'Asesores',
    imagen: asVen3,
  },
  {
    id: 'asesora-ventas-4',
    nombre: 'Nombre del integrante',
    cargo: 'Asesora de ventas',
    frase: 'La transparencia legal protege cada inversión.',
    categoria: 'Asesores',
    imagen: asVen4,
  },
  {
    // TODO: reemplazar por la fotografía real de la Gerencia de Administración
    id: 'gerente-administracion',
    nombre: 'Nombre del integrante',
    cargo: 'Gerente de Administración',
    frase: 'La organización interna sostiene el crecimiento del grupo.',
    categoria: 'Administración',
    imagen: '/images/equipo-gerente-administracion.jpg',
  },
]

const pilares = [
  {
    icono: Target,
    titulo: 'Misión',
    descripcion:
      'Desarrollar proyectos inmobiliarios de calidad que generen bienestar y valor duradero para nuestros clientes.',
  },
  {
    icono: Eye,
    titulo: 'Visión',
    descripcion:
      'Ser el grupo inmobiliario de referencia en la región, reconocido por su excelencia, innovación y confianza.',
  },
  {
    icono: HeartHandshake,
    titulo: 'Valores',
    descripcion:
      'Actuamos con integridad, cercanía y compromiso en cada proyecto que emprendemos.',
  },
]

const valoresLista = [
  {
    icono: ShieldCheck,
    etiqueta: 'Integridad',
  },
  {
    icono: Lightbulb,
    etiqueta: 'Innovación',
  },
  {
    icono: HeartHandshake,
    etiqueta: 'Compromiso',
  },
  {
    icono: Award,
    etiqueta: 'Calidad',
  },
  {
    icono: Users,
    etiqueta: 'Trabajo en equipo',
  },
]

function EquipoAvatar({ src, alt }) {
  const [errorCarga, setErrorCarga] = useState(false)

  if (errorCarga) {
    return (
      <div className="equipo-avatar-fallback">
        <UserRound size={38} strokeWidth={1.5} />
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

const DURACION_TRANSICION = 550

function Nosotros() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [indiceActivo, setIndiceActivo] = useState(0)
  const [transicionBloqueada, setTransicionBloqueada] = useState(false)
  const bloqueoTimeoutRef = useRef(null)

  const integrantesFiltrados =
    categoriaActiva === 'Todos'
      ? integrantes
      : integrantes.filter(
          (persona) => persona.categoria === categoriaActiva
        )

  const totalIntegrantes = integrantesFiltrados.length

  const cambiarCategoria = (categoria) => {
    if (bloqueoTimeoutRef.current) {
      window.clearTimeout(bloqueoTimeoutRef.current)
    }

    setTransicionBloqueada(false)
    setCategoriaActiva(categoria)
    setIndiceActivo(0)
  }

  const conBloqueoTransicion = (accion) => {
    if (transicionBloqueada) return

    accion()
    setTransicionBloqueada(true)

    bloqueoTimeoutRef.current = window.setTimeout(() => {
      setTransicionBloqueada(false)
    }, DURACION_TRANSICION)
  }

  const irSiguiente = () => {
    if (totalIntegrantes <= 1) return

    conBloqueoTransicion(() => {
      setIndiceActivo((prev) => (prev + 1) % totalIntegrantes)
    })
  }

  const irAnterior = () => {
    if (totalIntegrantes <= 1) return

    conBloqueoTransicion(() => {
      setIndiceActivo(
        (prev) => (prev - 1 + totalIntegrantes) % totalIntegrantes
      )
    })
  }

  const irAIndice = (indice) => {
    if (indice === indiceActivo) return

    conBloqueoTransicion(() => {
      setIndiceActivo(indice)
    })
  }

  const calcularOffset = (indice) => {
    if (totalIntegrantes <= 1) return 0

    let diferencia = indice - indiceActivo

    if (diferencia > totalIntegrantes / 2) {
      diferencia -= totalIntegrantes
    }

    if (diferencia < -totalIntegrantes / 2) {
      diferencia += totalIntegrantes
    }

    return diferencia
  }

  const claseOffset = (offset) => {
    const limitado = Math.max(-3, Math.min(3, offset))

    if (limitado === 0) return 'offset-0'

    return limitado < 0
      ? `offset-neg-${Math.abs(limitado)}`
      : `offset-pos-${limitado}`
  }

  return (
    <section className="nosotros">

      {/* =====================================================
          BLOQUE 1: HERO CON FONDO PROPIO
      ===================================================== */}

      <section className="nosotros-hero-bloque">
        <div className="nosotros-hero-overlay" />

        <div className="nosotros-contenedor">
          <div className="nosotros-hero">

            <div className="nosotros-hero-texto">
              <span className="nosotros-eyebrow">
                Nosotros
              </span>

              <h1 className="nosotros-titulo">
                Un gran equipo
                <br />
                <span className="texto-dorado">
                  detrás de grandes
                </span>
                <br />
                proyectos
              </h1>

              <p className="nosotros-descripcion">
                En Grupo Inmobiliario Leones del Sur trabajamos con
                compromiso, experiencia y una visión clara: ayudarte
                a construir un mejor futuro.
              </p>

              <div className="nosotros-caracteristicas">
                {caracteristicas.map((item) => {
                  const Icono = item.icono

                  return (
                    <div
                      className="caracteristica-item"
                      key={item.titulo}
                    >
                      <span className="caracteristica-icono">
                        <Icono
                          size={22}
                          strokeWidth={1.8}
                        />
                      </span>

                      <span className="caracteristica-texto">
                        <span className="caracteristica-titulo">
                          {item.titulo}
                        </span>

                        <span className="caracteristica-sub">
                          {item.subtitulo}
                        </span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="nosotros-hero-visual">
              <div className="nosotros-hero-imagen">
                <img
                  src={leonN}
                  alt="Equipo de Grupo Inmobiliario Leones del Sur"
                />
              </div>

              <div className="nosotros-frase-decorativa">
                <p>
                  Personas que
                  <br />
                  construyen
                  <br />
                  confianza
                </p>

                <svg
                  className="frase-subrayado"
                  viewBox="0 0 180 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 13C45 2 130 2 175 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          BLOQUE 2: EQUIPO CON FONDO INDEPENDIENTE
      ===================================================== */}

      <section className="equipo-bloque">
        <div className="nosotros-contenedor">
          <div className="equipo-seccion">

            <div className="equipo-encabezado">
              <div className="equipo-encabezado-texto">
                <span className="nosotros-eyebrow">
                  Nuestro equipo
                </span>

                <h2 className="seccion-titulo">
                  Conoce a nuestro{' '}
                  <span className="texto-dorado">
                    equipo
                  </span>
                </h2>

                <p className="seccion-descripcion">
                  Contamos con un equipo de profesionales comprometidos
                  que te acompañarán en cada paso de tu inversión.
                </p>
              </div>

              <div className="equipo-filtros">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    className={`filtro-btn ${
                      categoriaActiva === categoria
                        ? 'filtro-activo'
                        : ''
                    }`}
                    onClick={() => cambiarCategoria(categoria)}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            </div>

            <div className="equipo-carrusel">
              <button
                type="button"
                className="equipo-flecha"
                onClick={irAnterior}
                aria-label="Perfil anterior"
                disabled={totalIntegrantes <= 1}
              >
                <ChevronLeft
                  size={23}
                  strokeWidth={2}
                />
              </button>

              <div className="equipo-carrusel-track">
                {integrantesFiltrados.map((persona, indice) => {
                  const offset = calcularOffset(indice)
                  const esCentro = offset === 0

                  return (
                    <article
                      key={persona.id}
                      className={`equipo-card ${
                        esCentro
                          ? 'equipo-card-centro'
                          : 'equipo-card-lateral'
                      } ${claseOffset(offset)}`}
                      onClick={() => {
                        if (!esCentro) {
                          irAIndice(indice)
                        }
                      }}
                    >
                      <div className="equipo-avatar">
                        <EquipoAvatar
                          src={persona.imagen}
                          alt={persona.nombre}
                        />
                      </div>

                      <h3 className="equipo-nombre">
                        {persona.nombre}
                      </h3>

                      <p className="equipo-cargo">
                        {persona.cargo}
                      </p>

                      {esCentro && (
                        <>
                          <span
                            className="linea-dorada linea-centrada linea-equipo"
                            aria-hidden="true"
                          />

                          <p className="equipo-frase">
                            “{persona.frase}”
                          </p>
                        </>
                      )}
                    </article>
                  )
                })}
              </div>

              <button
                type="button"
                className="equipo-flecha"
                onClick={irSiguiente}
                aria-label="Perfil siguiente"
                disabled={totalIntegrantes <= 1}
              >
                <ChevronRight
                  size={23}
                  strokeWidth={2}
                />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          BLOQUE 3: MISIÓN, VISIÓN Y VALORES
      ===================================================== */}

      <section className="pilares-bloque">
        <div className="nosotros-contenedor">
          <div className="pilares-seccion">

            <div className="seccion-encabezado">
              <span className="nosotros-eyebrow">
                Lo que nos define
              </span>

              <h2 className="seccion-titulo">
                Misión, visión y valores
              </h2>

              <span
                className="linea-dorada linea-centrada"
                aria-hidden="true"
              />
            </div>

            <div className="pilares-grid">
              {pilares.map((item) => {
                const Icono = item.icono

                return (
                  <article
                    className="pilar-card"
                    key={item.titulo}
                  >
                    <div className="pilar-icono">
                      <Icono
                        size={27}
                        strokeWidth={1.8}
                      />
                    </div>

                    <h3 className="pilar-titulo">
                      {item.titulo}
                    </h3>

                    <p className="pilar-descripcion">
                      {item.descripcion}
                    </p>
                  </article>
                )
              })}
            </div>

            <div className="valores-lista">
              {valoresLista.map((valor) => {
                const Icono = valor.icono

                return (
                  <div
                    className="valor-chip"
                    key={valor.etiqueta}
                  >
                    <Icono
                      size={16}
                      strokeWidth={2}
                    />

                    <span>
                      {valor.etiqueta}
                    </span>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </section>

    </section>
  )
}

export default Nosotros