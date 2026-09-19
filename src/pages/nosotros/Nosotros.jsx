import { useEffect, useRef, useState } from 'react'
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
  Briefcase,
  MapPin,
  Languages,
  Mail,
  MessageCircle,
  X,
} from 'lucide-react'

import './Nosotros.css'
import leonN from '../../assets/images/leon-nosotros.png'
import asVen1 from '../../assets/images/asVentas1.png'
import asVen2 from '../../assets/images/asVentas2.png'
import asVen3 from '../../assets/images/asVentas3.png'
import asVen4 from '../../assets/images/asVentas4.png'
import drCom from '../../assets/images/drComercial.png'
import nosotros from '../../assets/images/nosotros-logo.png'

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
]

/*
  Datos del panel que aparece al pasar el mouse (o tocar) la tarjeta.

  Todavía NO existen en el proyecto, por eso están en null y el panel
  no muestra esas filas. Para completarlos, sobrescribe el campo en el
  integrante correspondiente (después del `...PERFIL_PENDIENTE`):

    descripcion:   'Texto de "Más sobre mí"'
    experiencia:   '+ 6 años'
    especialidad:  'Venta de lotes residenciales y comerciales'
    zona:          'Huancayo y alrededores'
    idiomas:       ['Español', 'Inglés básico']   (o un texto simple)
    redes: {                                       (solo las que existan;
      whatsapp:  'https://wa.me/51XXXXXXXXX',       enlaces completos)
      linkedin:  'https://www.linkedin.com/in/...',
      instagram: 'https://www.instagram.com/...',
      facebook:  'https://www.facebook.com/...',
      email:     'mailto:correo@dominio.com',
    }
    contacto:      'https://wa.me/51XXXXXXXXX'     (enlace del botón "Contáctame")
*/
const PERFIL_PENDIENTE = {
  descripcion: null,
  experiencia: null,
  especialidad: null,
  zona: null,
  idiomas: null,
  redes: null,
  contacto: null,
}

const integrantes = [
  {
    // TODO: reemplazar por la fotografía real del Director General
    id: 'director-general',
    nombre: 'Nombre del integrante',
    cargo: 'Director General',
    frase: 'Construimos confianza para crear grandes proyectos.',
    categoria: 'Directivos',
    imagen: '/images/equipo-director-general.jpg',
    ...PERFIL_PENDIENTE,
  },
  {
    id: 'director-comercial',
    nombre: 'ALEX CRISTOBAL',
    cargo: 'Director Comercial',
    frase: 'Cada cliente merece un proyecto pensado a su medida.',
    categoria: 'Directivos',
    imagen: drCom,
    ...PERFIL_PENDIENTE,
  },
  {
    id: 'asesora-ventas-1',
    nombre: 'ROMELY SCHIPPER',
    cargo: 'Asesora de ventas',
    frase: 'La planificación es la base de todo gran resultado.',
    categoria: 'Asesores',
    imagen: asVen1,
    ...PERFIL_PENDIENTE,
  },
  {
    id: 'asesora-ventas-2',
    nombre: 'NAHOMY LIMAS',
    cargo: 'Asesora de ventas',
    frase: 'La planificación es la base de todo gran resultado.',
    categoria: 'Asesores',
    imagen: asVen2,
    ...PERFIL_PENDIENTE,
  },
  {
    id: 'asesora-ventas-3',
    nombre: 'LUCERO BELTRÁN',
    cargo: 'Asesora de ventas',
    frase: 'La transparencia legal protege cada inversión.',
    categoria: 'Asesores',
    imagen: asVen3,
    ...PERFIL_PENDIENTE,
  },
  {
    id: 'asesora-ventas-4',
    nombre: 'ALESSANDRA MERCADO',
    cargo: 'Asesora de ventas',
    frase: 'La transparencia legal protege cada inversión.',
    categoria: 'Asesores',
    imagen: asVen4,
    ...PERFIL_PENDIENTE,
  },
  {
    // TODO: reemplazar por la fotografía real de la Gerencia de Administración
    id: 'gerente-administracion',
    nombre: 'Nombre del integrante',
    cargo: 'Gerente de Administración',
    frase: 'La organización interna sostiene el crecimiento del grupo.',
    categoria: 'Administración',
    imagen: '/images/equipo-gerente-administracion.jpg',
    ...PERFIL_PENDIENTE,
  },
]

// Filas del panel de detalle, en orden. Solo se dibujan las que tienen dato.
const DETALLES_PANEL = [
  { clave: 'descripcion', etiqueta: 'Más sobre mí', icono: UserRound },
  { clave: 'experiencia', etiqueta: 'Años de experiencia', icono: Briefcase },
  { clave: 'especialidad', etiqueta: 'Especialidad', icono: Target },
  { clave: 'zona', etiqueta: 'Zona de atención', icono: MapPin },
  { clave: 'idiomas', etiqueta: 'Idiomas', icono: Languages },
]

// Instagram, LinkedIn y Facebook no vienen en lucide-react 1.x: SVG propio.
function SvgRed({ children }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const REDES_PANEL = [
  {
    clave: 'whatsapp',
    etiqueta: 'WhatsApp',
    icono: <MessageCircle size={16} strokeWidth={1.9} aria-hidden="true" />,
  },
  {
    clave: 'linkedin',
    etiqueta: 'LinkedIn',
    icono: (
      <SvgRed>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </SvgRed>
    ),
  },
  {
    clave: 'instagram',
    etiqueta: 'Instagram',
    icono: (
      <SvgRed>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </SvgRed>
    ),
  },
  {
    clave: 'facebook',
    etiqueta: 'Facebook',
    icono: (
      <SvgRed>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </SvgRed>
    ),
  },
  {
    clave: 'email',
    etiqueta: 'Correo',
    icono: <Mail size={16} strokeWidth={1.9} aria-hidden="true" />,
  },
]

const textoDetalle = (valor) =>
  Array.isArray(valor) ? valor.join(' | ') : valor

const abreEnPestanaNueva = (url) => /^https?:/i.test(url)

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

// Devuelve true mientras la media query coincide (se actualiza al cambiar
// el tamaño de la ventana).
function useMediaQuery(consulta) {
  const [coincide, setCoincide] = useState(
    () => window.matchMedia(consulta).matches
  )

  useEffect(() => {
    const lista = window.matchMedia(consulta)
    const alCambiar = (evento) => setCoincide(evento.matches)

    lista.addEventListener('change', alCambiar)
    return () => lista.removeEventListener('change', alCambiar)
  }, [consulta])

  return coincide
}

// UN SOLO panel para todo el carrusel: recibe al integrante activo y
// dibuja sus datos. Al cambiar de integrante (key) el contenido se vuelve
// a montar y entra con un fundido. Los campos sin dato no se dibujan.
function EquipoPanel({
  persona,
  abierto,
  cerrable,
  onCerrar,
  onPointerEnter,
  onPointerLeave,
}) {
  const filas = DETALLES_PANEL.filter(
    (detalle) => textoDetalle(persona[detalle.clave])
  )
  const redes = REDES_PANEL.filter(
    (red) => persona.redes && persona.redes[red.clave]
  )
  const contacto = persona.contacto
  const hayDetalle = filas.length > 0 || redes.length > 0 || Boolean(contacto)

  return (
    <aside
      className={`equipo-panel ${abierto ? 'equipo-panel-abierto' : ''} ${
        hayDetalle ? '' : 'equipo-panel-simple'
      }`}
      aria-hidden={!abierto}
      aria-label={`Información de ${persona.nombre}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {cerrable && (
        <button
          type="button"
          className="equipo-panel-cerrar"
          aria-label="Cerrar información"
          onClick={onCerrar}
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      )}

      <div className="equipo-panel-cuerpo" key={persona.id}>
        <div className="equipo-panel-perfil">
          <div className="equipo-panel-foto">
            <EquipoAvatar src={persona.imagen} alt={persona.nombre} />
          </div>

          <h3 className="equipo-panel-nombre">{persona.nombre}</h3>
          <p className="equipo-panel-cargo">{persona.cargo}</p>

          {persona.frase && (
            <>
              <span
                className="linea-dorada linea-equipo-panel"
                aria-hidden="true"
              />
              <p className="equipo-panel-frase">“{persona.frase}”</p>
            </>
          )}
        </div>

        {hayDetalle && (
          <div className="equipo-panel-info">
            {filas.length > 0 && (
              <ul className="equipo-panel-lista">
                {filas.map((detalle) => {
                  const Icono = detalle.icono

                  return (
                    <li key={detalle.clave} className="equipo-panel-fila">
                      <span className="equipo-panel-icono">
                        <Icono size={15} strokeWidth={1.9} aria-hidden="true" />
                      </span>

                      <span className="equipo-panel-texto">
                        <span className="equipo-panel-etiqueta">
                          {detalle.etiqueta}
                        </span>
                        <span className="equipo-panel-valor">
                          {textoDetalle(persona[detalle.clave])}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}

            {(redes.length > 0 || contacto) && (
              <div className="equipo-panel-acciones">
                {redes.map((red) => (
                  <a
                    key={red.clave}
                    className="equipo-red"
                    href={persona.redes[red.clave]}
                    aria-label={`${red.etiqueta} de ${persona.nombre}`}
                    title={red.etiqueta}
                    {...(abreEnPestanaNueva(persona.redes[red.clave])
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {red.icono}
                  </a>
                ))}

                {contacto && (
                  <a
                    className="equipo-contactame"
                    href={contacto}
                    {...(abreEnPestanaNueva(contacto)
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    <MessageCircle size={15} strokeWidth={2} aria-hidden="true" />
                    Contáctame
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

// Pantallas donde el panel va a la derecha del carrusel y se abre con hover.
// Por debajo de este ancho va debajo del carrusel y se abre con toque/clic.
const CONSULTA_PANEL_LATERAL = '(min-width: 1100px)'

// Tiempo de gracia al salir de una tarjeta o del panel: cubre el espacio
// entre ambos y evita que el panel parpadee al cruzar de uno a otro.
const RETARDO_CIERRE_PANEL = 160

// Con el panel ya abierto, el mouse debe DETENERSE este tiempo sobre otra
// tarjeta para cambiar de integrante. Así, al ir de la tarjeta al panel
// pasando por encima de una vecina, el panel no cambia de asesor a mitad
// de camino.
const RETARDO_CAMBIO_PANEL = 250

const DURACION_TRANSICION = 550

function Nosotros() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [indiceActivo, setIndiceActivo] = useState(0)
  const [transicionBloqueada, setTransicionBloqueada] = useState(false)
  // Panel de información (único): { id, abierto, origen }.
  // origen 'mouse' = hover (escritorio); 'toque' = toque/clic (táctil o
  // pantallas angostas). Con 'toque' el panel sigue a la tarjeta central.
  const [panel, setPanel] = useState({
    id: null,
    abierto: false,
    origen: 'mouse',
  })
  const modoLateral = useMediaQuery(CONSULTA_PANEL_LATERAL)
  const bloqueoTimeoutRef = useRef(null)
  const cierrePanelRef = useRef(null)
  const cambioPanelRef = useRef(null)
  // Tipo del último puntero (mouse/touch/pen): en mouse abre el hover,
  // en táctil abre el toque, y así el toque no se cancela a sí mismo.
  const ultimoPunteroRef = useRef(null)

  // Abierto con toque/clic, el panel puede quedar bajo el pliegue de la
  // pantalla: se espera a que termine de desplegarse y se lleva a la vista.
  useEffect(() => {
    if (!panel.abierto || panel.origen !== 'toque') return

    const espera = window.setTimeout(() => {
      document
        .querySelector('.equipo-panel-abierto')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 300)

    return () => window.clearTimeout(espera)
  }, [panel.abierto, panel.origen])

  // Abierto con toque/clic: tocar fuera del carrusel y del panel lo cierra.
  useEffect(() => {
    if (!panel.abierto || panel.origen !== 'toque') return

    const cerrarAlTocarFuera = (evento) => {
      if (!evento.target.closest('.equipo-escenario')) {
        setPanel((actual) => ({ ...actual, abierto: false }))
      }
    }

    document.addEventListener('pointerdown', cerrarAlTocarFuera)
    return () =>
      document.removeEventListener('pointerdown', cerrarAlTocarFuera)
  }, [panel.abierto, panel.origen])

  const integrantesFiltrados =
    categoriaActiva === 'Todos'
      ? integrantes
      : integrantes.filter(
          (persona) => persona.categoria === categoriaActiva
        )

  const totalIntegrantes = integrantesFiltrados.length

  // Integrante central del carrusel y el que muestra el panel: con hover es
  // el de la tarjeta señalada; con toque/clic, el central.
  const integranteCentral = integrantesFiltrados[indiceActivo]
  const asesorActivo =
    (panel.origen === 'toque'
      ? integranteCentral
      : integrantesFiltrados.find((persona) => persona.id === panel.id)) ??
    integranteCentral
  const panelAbierto = panel.abierto && Boolean(asesorActivo)

  const cambiarCategoria = (categoria) => {
    if (bloqueoTimeoutRef.current) {
      window.clearTimeout(bloqueoTimeoutRef.current)
    }

    setTransicionBloqueada(false)
    window.clearTimeout(cierrePanelRef.current)
    window.clearTimeout(cambioPanelRef.current)
    setPanel((actual) => ({ ...actual, abierto: false }))
    setCategoriaActiva(categoria)
    setIndiceActivo(0)
  }

  const conBloqueoTransicion = (accion) => {
    if (transicionBloqueada) return

    accion()
    // El panel abierto con toque sigue a la tarjeta central; el de hover
    // se cierra porque la tarjeta señalada cambia de lugar.
    window.clearTimeout(cierrePanelRef.current)
    window.clearTimeout(cambioPanelRef.current)
    setPanel((actual) =>
      actual.origen === 'toque' ? actual : { ...actual, abierto: false }
    )
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

  const cancelarCierrePanel = () => {
    window.clearTimeout(cierrePanelRef.current)
  }

  const programarCierrePanel = () => {
    window.clearTimeout(cierrePanelRef.current)

    cierrePanelRef.current = window.setTimeout(() => {
      setPanel((actual) =>
        actual.origen === 'mouse' ? { ...actual, abierto: false } : actual
      )
    }, RETARDO_CIERRE_PANEL)
  }

  // Hover (solo mouse, solo con el panel al costado): entrar en CUALQUIER
  // tarjeta visible muestra el panel con los datos de ESA tarjeta. Si el
  // panel estaba cerrado se abre al instante; si ya estaba abierto con otro
  // integrante, cambia cuando el mouse se detiene sobre la nueva tarjeta.
  const alEntrarTarjeta = (evento, id) => {
    if (evento.pointerType !== 'mouse' || !modoLateral) return

    cancelarCierrePanel()
    window.clearTimeout(cambioPanelRef.current)

    const mostrar = () => setPanel({ id, abierto: true, origen: 'mouse' })

    if (!panel.abierto || panel.origen !== 'mouse') {
      mostrar()
    } else if (panel.id !== id) {
      cambioPanelRef.current = window.setTimeout(mostrar, RETARDO_CAMBIO_PANEL)
    }
  }

  const alSalirTarjeta = (evento) => {
    if (evento.pointerType !== 'mouse' || !modoLateral) return

    window.clearTimeout(cambioPanelRef.current)
    programarCierrePanel()
  }

  // El panel también es zona de hover: mientras el mouse esté sobre él, o
  // sobre la tarjeta, no se cierra.
  const alEntrarPanel = (evento) => {
    if (evento.pointerType !== 'mouse') return

    cancelarCierrePanel()
    window.clearTimeout(cambioPanelRef.current)
  }

  const alSalirPanel = (evento) => {
    if (evento.pointerType === 'mouse') programarCierrePanel()
  }

  const cerrarPanel = () => {
    cancelarCierrePanel()
    setPanel((actual) => ({ ...actual, abierto: false }))
  }

  // Clic/toque: las laterales pasan al centro (comportamiento existente).
  // En la central alterna el panel, salvo con mouse en escritorio, donde
  // ya lo maneja el hover.
  const alTocarTarjeta = (evento, indice, esCentro) => {
    if (!esCentro) {
      irAIndice(indice)
      return
    }

    if (modoLateral && ultimoPunteroRef.current === 'mouse') return
    if (evento.target.closest('a')) return

    setPanel((actual) =>
      actual.abierto && actual.origen === 'toque'
        ? { ...actual, abierto: false }
        : { id: integranteCentral.id, abierto: true, origen: 'toque' }
    )
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
              

              <img
                className="logo-nosotros"
                src={nosotros}
                alt="Proyecto"
                  />

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

            <div className="equipo-escenario">
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
                    // Tarjeta cuyo dato muestra el panel / las demás visibles
                    const seleccionada =
                      panelAbierto && asesorActivo.id === persona.id
                    const apagada =
                      panelAbierto && !seleccionada && Math.abs(offset) <= 1

                    return (
                      <article
                        key={persona.id}
                        className={`equipo-card ${
                          esCentro
                            ? 'equipo-card-centro'
                            : 'equipo-card-lateral'
                        } ${claseOffset(offset)} ${
                          seleccionada ? 'equipo-card-seleccionada' : ''
                        } ${apagada ? 'equipo-card-apagada' : ''}`}
                        onPointerDown={(evento) => {
                          ultimoPunteroRef.current = evento.pointerType
                        }}
                        onPointerEnter={(evento) =>
                          alEntrarTarjeta(evento, persona.id)
                        }
                        onPointerLeave={alSalirTarjeta}
                        onClick={(evento) =>
                          alTocarTarjeta(evento, indice, esCentro)
                        }
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

              {/* Panel único: muestra los datos del integrante activo */}
              <div
                className={`equipo-panel-zona ${
                  panelAbierto ? 'equipo-panel-zona-abierta' : ''
                }`}
              >
                <div className="equipo-panel-recorte">
                  {asesorActivo && (
                    <EquipoPanel
                      persona={asesorActivo}
                      abierto={panelAbierto}
                      cerrable={!modoLateral || panel.origen === 'toque'}
                      onCerrar={cerrarPanel}
                      onPointerEnter={alEntrarPanel}
                      onPointerLeave={alSalirPanel}
                    />
                  )}
                </div>
              </div>
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