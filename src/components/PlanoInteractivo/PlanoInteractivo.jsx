import { useEffect, useState } from 'react'
import { Plus, Minus, RotateCcw, Maximize2, X } from 'lucide-react'
import './PlanoInteractivo.css'
import { ESTADOS_LOTE, ESTADO_COLOR, ESTADO_LABEL } from '../../data/estados'
import { chalay2Plano } from './planos/chalay2'

// Un plano interactivo (viewBox + geometrías) por proyecto. Hoy solo existe el de Chalay II
// (`./planos/chalay2.js`, única fuente de verdad de su geometría, exportada tal cual desde
// Map My Img); los demás proyectos caen al respaldo de imagen simple más abajo hasta que tengan
// su propio levantamiento (`./planos/sanAgustin1.js` y `./planos/sanAgustin2.js`).
const PLANOS_POR_PROYECTO = {
  1: chalay2Plano,
}

// El viewBox de cada plano ("0 0 687 1600") también define el tamaño de la imagen de fondo:
// se parsea en vez de duplicar ancho/alto a mano, para que la imagen y los polígonos nunca
// puedan desalinearse por un número escrito aparte.
function dimensionesDeViewBox(viewBox) {
  const [, , ancho, alto] = viewBox.split(' ').map(Number)
  return { ancho, alto }
}

// El código de cada polígono viene con el formato fijo que exporta Map My Img:
// "<PREFIJO-PROYECTO>-MZA-<letra de manzana>-<número de lote>", p. ej. "CHALAY-II-MZA-C-01".
// En vez de comparar ese string contra `lote.codigo` (que en los datos del proyecto usa otro
// formato, "CHALAY-II-MZC-01"), se extrae manzana + número y se busca por esos dos campos.
// Así el polígono encuentra su lote sin importar de dónde vengan los datos (mock hoy, PostgreSQL
// después) ni qué formato de código usen.
const PATRON_CODIGO_POLIGONO = /-MZA-([A-Z])-(\d+)$/

function loteDelPoligono(codigoPoligono, lotes) {
  const coincidencia = codigoPoligono.match(PATRON_CODIGO_POLIGONO)
  if (!coincidencia) return null

  const [, letraManzana, numeroLote] = coincidencia
  const manzana = `MZ ${letraManzana}`
  const numero = Number(numeroLote)

  return lotes.find((lote) => lote.manzana === manzana && lote.numero === numero) ?? null
}

const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_PASO = 0.4

/**
 * Plano interactivo de un proyecto: geovisor con la imagen del plano de fondo y, encima, un SVG
 * con un polígono por lote. La geometría (viewBox + `points`) es fija y viene de Map My Img; el
 * color de cada polígono es dinámico y sale del estado actual del lote (`ESTADO_COLOR`), nunca se
 * guarda en el SVG. Si el proyecto todavía no tiene polígonos (`PLANOS_POR_PROYECTO`), se muestra
 * solo la imagen del plano, sin overlay.
 *
 * Autocontenido: además de los polígonos, maneja su propio zoom, tooltip al pasar el mouse y un
 * modo de pantalla completa (con cierre por X, clic fuera y ESC). `Lotes.jsx` solo lo integra y
 * reacciona a `onSeleccionarLote` para abrir el panel de detalle que ya existe en esa página.
 */
function PlanoInteractivo({ proyectoId, imagen, nombreProyecto, lotes = [], seleccionadoId, onSeleccionarLote }) {
  const [ampliado, setAmpliado] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [hover, setHover] = useState(null) // { lote, x, y } | null

  const plano = PLANOS_POR_PROYECTO[proyectoId]
  const { ancho, alto } = plano ? dimensionesDeViewBox(plano.viewBox) : {}

  // El zoom no debe arrastrarse entre la vista normal y la ampliada: se reinicia en cada punto
  // donde `ampliado` cambia (en vez de un efecto separado, que dispararía un segundo render).
  const abrirAmpliado = () => {
    setAmpliado(true)
    setZoom(1)
  }

  const cerrarAmpliado = () => {
    setAmpliado(false)
    setZoom(1)
    // El polígono bajo el mouse desaparece del DOM al cerrar (o cambia de tamaño), así que su
    // `onMouseLeave` nunca llega a disparar: sin esto el tooltip quedaría flotando en pantalla.
    setHover(null)
  }

  // Cierra el visor ampliado con ESC.
  useEffect(() => {
    if (!ampliado) return

    const alPresionarTecla = (e) => {
      if (e.key === 'Escape') cerrarAmpliado()
    }

    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [ampliado])

  const acercar = () => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_PASO) * 100) / 100))
  const alejar = () => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_PASO) * 100) / 100))
  const restablecer = () => setZoom(1)

  const manejarSeleccion = (lote) => {
    if (!lote) return
    onSeleccionarLote?.(lote)
    setHover(null)
    // Solo cierra (y reinicia el zoom) si el clic vino del visor ampliado; en la vista normal
    // seleccionar un lote no debe alterar el zoom que el usuario ya tenía.
    if (ampliado) cerrarAmpliado()
  }

  const etiquetaPlano = `Plano interactivo de ${nombreProyecto ?? 'proyecto'}`

  const panel = (
    <div className="plano-lienzo">
      <div className="plano-lienzo-scroll">
        <div className="plano-lienzo-marco">
          <div className="plano-lienzo-zoom" style={{ transform: `scale(${zoom})` }}>
            {plano ? (
              <svg
                className="plano-svg"
                viewBox={plano.viewBox}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={etiquetaPlano}
              >
                {/* Imagen real del proyecto: capa de fondo, fija. El SVG (misma viewBox) queda
                    transparente encima, así que imagen y polígonos siempre escalan juntos. */}
                <image href={imagen} x="0" y="0" width={ancho} height={alto} />

                {/* Geometrías de los lotes: capa interactiva, siempre visible desde el inicio */}
                {plano.poligonos.map((geometria) => {
                  const lote = loteDelPoligono(geometria.codigo, lotes)
                  const color = lote ? ESTADO_COLOR[lote.estado] : 'transparent'
                  const esSeleccionado = Boolean(lote && seleccionadoId != null && lote.id === seleccionadoId)

                  const propsComunes = {
                    key: geometria.codigo,
                    className: [
                      'plano-lote',
                      lote ? '' : 'sin-datos',
                      esSeleccionado ? 'plano-lote-seleccionado' : '',
                    ]
                      .filter(Boolean)
                      .join(' '),
                    fill: color || 'transparent',
                    'data-lote': geometria.codigo,
                    tabIndex: lote ? 0 : -1,
                    onClick: () => manejarSeleccion(lote),
                    onKeyDown: (e) => {
                      if (lote && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        manejarSeleccion(lote)
                      }
                    },
                    onMouseMove: (e) => {
                      if (!lote) return
                      setHover({ lote, x: e.clientX, y: e.clientY })
                    },
                    onMouseLeave: () => setHover(null),
                  }

                  // La geometría (points o x/y/width/height) viene tal cual de `./planos/chalay2.js`;
                  // solo decide qué elemento SVG dibujar, nunca se recalcula ni se inventa.
                  return geometria.tipo === 'rect' ? (
                    <rect
                      {...propsComunes}
                      x={geometria.x}
                      y={geometria.y}
                      width={geometria.width}
                      height={geometria.height}
                    />
                  ) : (
                    <polygon {...propsComunes} points={geometria.points} />
                  )
                })}
              </svg>
            ) : (
              <img className="plano-imagen-simple" src={imagen} alt={etiquetaPlano} />
            )}
          </div>
        </div>
      </div>

      {plano && (
        <div className="plano-controles-zoom">
          <button type="button" onClick={alejar} disabled={zoom <= ZOOM_MIN} aria-label="Alejar">
            <Minus size={15} />
          </button>
          <button type="button" onClick={restablecer} aria-label="Restablecer zoom">
            <RotateCcw size={14} />
          </button>
          <button type="button" onClick={acercar} disabled={zoom >= ZOOM_MAX} aria-label="Acercar">
            <Plus size={15} />
          </button>
        </div>
      )}

      <button
        type="button"
        className="plano-ampliar-btn"
        onClick={ampliado ? cerrarAmpliado : abrirAmpliado}
        aria-label={ampliado ? 'Cerrar plano ampliado' : 'Ver plano en pantalla completa'}
      >
        {ampliado ? <X size={17} /> : <Maximize2 size={16} />}
      </button>

      {plano && (
        <div className="plano-leyenda">
          {ESTADOS_LOTE.map((estado) => (
            <div className="plano-leyenda-item" key={estado.value}>
              <span className="plano-leyenda-color" style={{ background: estado.color }} />
              <span>{estado.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Panel del lote: nada aquí. Al seleccionar, `onSeleccionarLote` abre el modal de detalle
          que ya existe en Lotes.jsx; este componente no dibuja ningún panel propio. */}

      {hover && (
        <div className="plano-tooltip" style={{ left: hover.x + 16, top: hover.y + 16 }}>
          <strong>{hover.lote.codigo}</strong>
          <span>{ESTADO_LABEL[hover.lote.estado] ?? hover.lote.estado}</span>
          <span>{hover.lote.area_m2} m²</span>
        </div>
      )}
    </div>
  )

  if (!ampliado) {
    return <div className="plano-interactivo">{panel}</div>
  }

  return (
    <div className="plano-interactivo-overlay" role="dialog" aria-modal="true" onClick={cerrarAmpliado}>
      <div className="plano-interactivo-overlay-contenido" onClick={(e) => e.stopPropagation()}>
        {panel}
      </div>
    </div>
  )
}

export default PlanoInteractivo
