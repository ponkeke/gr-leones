import { useEffect, useMemo, useState } from 'react'
import { MapPin, Rows3, LayoutGrid, MessageCircle, FileText, CalendarDays, Calculator, ChevronRight } from 'lucide-react'
import './Lotes.css'
import { getProyectos, getProyecto, getLotesDeProyecto } from '../../services/api'
import { ESTADOS_LOTE, ESTADO_COLOR, ESTADO_LABEL } from '../../data/estados'
import { formatearPrecio, formatearFecha } from '../../utils/formato'
import Modal from '../../components/Modal/Modal'
import SolicitudInformacion from '../../components/SolicitudInformacion/SolicitudInformacion'
import SolicitudCotizacion from '../../components/SolicitudCotizacion/SolicitudCotizacion'
import AgendarVisita from '../../components/AgendarVisita/AgendarVisita'
import PlanoInteractivo from '../../components/PlanoInteractivo/PlanoInteractivo'
import { lotesMock } from '../../data/lotesMock'
import planoChalayII from '../../assets/images/chalay2.jpg'
import planoSanAgustinI from '../../assets/images/sanAgustin1.jpg'
import planoSanAgustinII from '../../assets/images/sanAgustin2.jpg'

const TODOS = 'TODOS'

const FILTROS_INICIALES = { estado: TODOS, manzana: '', area: '', busqueda: '' }

// Imagen del plano por proyecto (id de `data/proyectos.js`), usada solo en la vista Plano de esta
// página. `proyecto.imagenPlano` sigue existiendo para el resto del sitio; estas son las imágenes
// que coinciden en tamaño con el SVG interactivo de Chalay II (y se preparan del mismo modo para
// San Agustín I/II cuando tengan su propio levantamiento).
const PLANOS_POR_PROYECTO = {
  1: planoChalayII,
  2: planoSanAgustinI,
  3: planoSanAgustinII,
}

function useQueryId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('id')
}

function numeroDeLote(lote) {
  return String(lote.numero).padStart(2, '0')
}

function Lotes() {
  const idInicial = useQueryId()
  const [proyectoId, setProyectoId] = useState(idInicial)
  const [proyectos, setProyectos] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [lotes, setLotes] = useState([])
  const [estadoCarga, setEstadoCarga] = useState('cargando') // 'cargando' | 'listo' | 'error'
  const [error, setError] = useState(null)
  const [vista, setVista] = useState('lista') // 'lista' | 'plano'
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [loteSeleccionado, setLoteSeleccionado] = useState(null)
  // 'solicitud-informacion' | 'solicitud-cotizacion' | 'agendar-visita' | null
  const [solicitudActiva, setSolicitudActiva] = useState(null)

  useEffect(() => {
    getProyectos().then(setProyectos).catch(() => {})
  }, [])

  useEffect(() => {
    if (!proyectoId) return

    let cancelado = false

    Promise.all([getProyecto(proyectoId), getLotesDeProyecto(proyectoId)])
      .then(([proyectoData, lotesData]) => {
        if (cancelado) return
        setProyecto(proyectoData)
        setLotes(lotesData)
        setEstadoCarga('listo')
      })
      .catch((err) => {
        if (cancelado) return
        setError(err.message)
        setEstadoCarga('error')
      })

    return () => {
      cancelado = true
    }
  }, [proyectoId])

  // Botón Atrás/Adelante del navegador: `seleccionarProyecto` cambia la URL con pushState, pero
  // eso no vuelve a montar la página. Al recorrer el historial se relee `?id=` y la interfaz
  // se sincroniza con la URL.
  useEffect(() => {
    const alCambiarHistorial = () => {
      const id = new URLSearchParams(window.location.search).get('id')

      if (String(id ?? '') === String(proyectoId ?? '')) return

      setLoteSeleccionado(null)
      setSolicitudActiva(null)
      setFiltros(FILTROS_INICIALES)
      setError(null)
      setEstadoCarga('cargando')
      setProyectoId(id)
    }

    window.addEventListener('popstate', alCambiarHistorial)
    return () => window.removeEventListener('popstate', alCambiarHistorial)
  }, [proyectoId])

  const seleccionarProyecto = (id) => {
    setLoteSeleccionado(null)
    setSolicitudActiva(null)
    setFiltros(FILTROS_INICIALES)
    setEstadoCarga('cargando')
    setProyectoId(id)
    window.history.pushState({}, '', `/lotes?id=${id}`)
  }

  const cambiarFiltro = (campo, valor) => setFiltros((prev) => ({ ...prev, [campo]: valor }))

  const cerrarDetalleLote = () => {
    setSolicitudActiva(null)
    setLoteSeleccionado(null)
  }

  // Cerrar un formulario (X, ESC, "Volver al lote") deja al usuario otra vez en el detalle del lote.
  const cerrarSolicitud = () => setSolicitudActiva(null)

  // El simulador recibe solo el id del lote y vuelve a pedir sus datos por `services/api`.
  const irAlSimulador = (lote) => {
    window.location.assign(`/simulador-costos?lote=${lote.id}`)
  }

  // Opciones de los filtros: salen de los lotes del proyecto elegido, nunca de otro proyecto.
  const manzanas = useMemo(() => [...new Set(lotes.map((l) => l.manzana))], [lotes])
  const areas = useMemo(() => [...new Set(lotes.map((l) => l.area_m2))].sort((a, b) => a - b), [lotes])

  const conteoPorEstado = useMemo(() => {
    const conteo = { [TODOS]: lotes.length }
    ESTADOS_LOTE.forEach((e) => {
      conteo[e.value] = lotes.filter((l) => l.estado === e.value).length
    })
    return conteo
  }, [lotes])

  const lotesFiltrados = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase()

    return lotes.filter((lote) => {
      if (filtros.estado !== TODOS && lote.estado !== filtros.estado) return false
      if (filtros.manzana && lote.manzana !== filtros.manzana) return false
      if (filtros.area && lote.area_m2 !== Number(filtros.area)) return false
      if (texto) {
        // Solo dígitos -> número de lote exacto; cualquier otro texto -> parte del código.
        const coincide = /^\d+$/.test(texto)
          ? lote.numero === Number(texto)
          : lote.codigo.toLowerCase().includes(texto)
        if (!coincide) return false
      }
      return true
    })
  }, [lotes, filtros])

  // El plano necesita datos incluso si la API todavía no responde con lotes reales (`lotes: []`
  // es una respuesta válida). Mientras no exista PostgreSQL, cae a `lotesMock`; el día que la API
  // ya devuelva lotes, este `useMemo` elige `lotes` sin que haya que tocar `PlanoInteractivo`.
  const lotesParaPlano = useMemo(() => (lotes.length > 0 ? lotes : lotesMock), [lotes])

  return (
    <section id="lotes" className="lotes">
      <div className="container lotes-contenido">
        <h1>Lotes</h1>

        {!proyectoId && (
          <>
            <p className="lotes-subtitulo">Selecciona un proyecto para ver sus lotes disponibles.</p>
            <div className="proyectos-filtros lotes-selector">
              {proyectos.map((p) => (
                <button key={p.id} onClick={() => seleccionarProyecto(p.id)}>
                  {p.nombre}
                </button>
              ))}
            </div>
          </>
        )}

        {proyectoId && estadoCarga === 'cargando' && <p className="lotes-subtitulo">Cargando lotes…</p>}

        {proyectoId && estadoCarga === 'error' && <p className="lotes-subtitulo">{error}</p>}

        {proyectoId && estadoCarga === 'listo' && proyecto && (
          <>
            <div className="lotes-encabezado">
              <div>
                <p className="lotes-proyecto-ubicacion">
                  <MapPin size={14} /> {proyecto.ubicacion ?? 'Ubicación por confirmar'}
                </p>
                <h2>{proyecto.nombre}</h2>
              </div>

              <div className="lotes-acciones-encabezado">
                <div className="lotes-vista-toggle">
                  <button
                    className={vista === 'lista' ? 'activo' : ''}
                    onClick={() => setVista('lista')}
                  >
                    <Rows3 size={15} /> Lista
                  </button>
                  <button
                    className={vista === 'plano' ? 'activo' : ''}
                    onClick={() => setVista('plano')}
                  >
                    <LayoutGrid size={15} /> Plano
                  </button>
                </div>

                {proyectos.length > 1 && (
                  <select
                    value={proyectoId}
                    onChange={(e) => seleccionarProyecto(e.target.value)}
                    className="lotes-select-proyecto"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {vista === 'lista' && lotes.length === 0 && (
              <p className="lotes-subtitulo">Este proyecto todavía no tiene lotes registrados.</p>
            )}

            {vista === 'lista' && lotes.length > 0 && (
              <>
                {/* Filtros de la vista lista: reutilizan el estilo del panel de Proyectos */}
                <div className="proyectos-panel lotes-filtros">
                  <div className="proyectos-filtros">
                    {[{ value: TODOS, label: 'Todos' }, ...ESTADOS_LOTE].map((e) => (
                      <button
                        key={e.value}
                        className={filtros.estado === e.value ? 'filtro-activo' : undefined}
                        onClick={() => cambiarFiltro('estado', e.value)}
                      >
                        {e.label} ({conteoPorEstado[e.value]})
                      </button>
                    ))}
                  </div>

                  <form className="proyectos-formulario lotes-filtros-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="proyectos-input">
                      <span>⌕</span>
                      <input
                        type="text"
                        placeholder="Buscar por número o código de lote..."
                        value={filtros.busqueda}
                        onChange={(e) => cambiarFiltro('busqueda', e.target.value)}
                      />
                    </div>

                    <select value={filtros.manzana} onChange={(e) => cambiarFiltro('manzana', e.target.value)}>
                      <option value="">Manzana</option>
                      {manzanas.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <select value={filtros.area} onChange={(e) => cambiarFiltro('area', e.target.value)}>
                      <option value="">Área</option>
                      {areas.map((a) => (
                        <option key={a} value={a}>{a} m²</option>
                      ))}
                    </select>

                    <button className="btn-buscar" type="button" onClick={() => setFiltros(FILTROS_INICIALES)}>
                      Limpiar
                    </button>
                  </form>
                </div>

                <div className="proyectos-resultados">
                  <strong>
                    {lotesFiltrados.length} de {lotes.length} {lotes.length === 1 ? 'lote' : 'lotes'}
                  </strong>
                </div>

                {lotesFiltrados.length === 0 && (
                  <p className="lotes-subtitulo">No hay lotes que coincidan con los filtros seleccionados.</p>
                )}
              </>
            )}

            {vista === 'lista' && lotesFiltrados.length > 0 && (
              <div className="lotes-grid">
                {lotesFiltrados.map((lote) => (
                  <article className="lote-card" key={lote.id}>
                    <div className="lote-card-header">
                      <span>{lote.codigo}</span>
                      <span
                        className="lote-estado-badge"
                        style={{ background: ESTADO_COLOR[lote.estado] }}
                      >
                        {ESTADO_LABEL[lote.estado]}
                      </span>
                    </div>

                    <p className="lote-manzana">{lote.manzana} · Lote {numeroDeLote(lote)}</p>

                    <div className="lote-datos">
                      <div>
                        <small>Área</small>
                        <strong>{lote.area_m2} m²</strong>
                      </div>
                      <div>
                        <small>Precio</small>
                        <strong>{formatearPrecio(lote.precio_total)}</strong>
                      </div>
                      <div>
                        <small>Precio/m²</small>
                        <strong>{formatearPrecio(lote.precio_m2)}</strong>
                      </div>
                    </div>

                    <button className="btn-proyecto lote-ver-btn" onClick={() => setLoteSeleccionado(lote)}>
                      Ver lote →
                    </button>
                  </article>
                ))}
              </div>
            )}

            {vista === 'plano' && (() => {
              const imagenPlano = PLANOS_POR_PROYECTO[proyecto.id] ?? proyecto.imagenPlano
              if (!imagenPlano) return null

              return (
                <div className="plano-vista">
                  <p className="plano-vista-info">
                    Plano del proyecto · {formatearFecha(proyecto.planoFecha)}
                  </p>

                  <PlanoInteractivo
                    proyectoId={proyecto.id}
                    imagen={imagenPlano}
                    nombreProyecto={proyecto.nombre}
                    lotes={lotesParaPlano}
                    seleccionadoId={loteSeleccionado?.id}
                    onSeleccionarLote={setLoteSeleccionado}
                  />
                </div>
              )
            })()}
          </>
        )}
      </div>

      {loteSeleccionado && (() => {
        const esDisponible = loteSeleccionado.estado === 'DISPONIBLE'

        return (
          <Modal
            titulo={loteSeleccionado.codigo}
            descripcion={`${proyecto?.nombre ?? ''} · ${loteSeleccionado.manzana} · Lote ${numeroDeLote(loteSeleccionado)}`}
            onCerrar={cerrarDetalleLote}
            tamano="pequeno"
          >
            <span
              className="lote-estado-badge lote-detalle-badge"
              style={{ background: ESTADO_COLOR[loteSeleccionado.estado] }}
            >
              {ESTADO_LABEL[loteSeleccionado.estado]}
            </span>

            <div className="lote-datos lote-detalle-datos">
              <div>
                <small>Área</small>
                <strong>{loteSeleccionado.area_m2} m²</strong>
              </div>
              <div>
                <small>Manzana</small>
                <strong>{loteSeleccionado.manzana}</strong>
              </div>
              <div>
                <small>Precio total</small>
                <strong>{formatearPrecio(loteSeleccionado.precio_total)}</strong>
              </div>
              <div>
                <small>Precio/m²</small>
                <strong>{formatearPrecio(loteSeleccionado.precio_m2)}</strong>
              </div>
            </div>

            {loteSeleccionado.estadoFecha && (
              <p className="lote-detalle-descripcion">
                Estado según el plano comercial del {formatearFecha(loteSeleccionado.estadoFecha)}.
              </p>
            )}

            {/* Tres caminos explicados en lenguaje sencillo: el visitante elige según lo que quiere hacer. */}
            <h4 className="lote-detalle-pregunta">¿Qué quieres hacer?</h4>

            <div className="lote-detalle-opciones">
              <button className="lote-opcion" onClick={() => setSolicitudActiva('solicitud-informacion')}>
                <MessageCircle size={20} aria-hidden="true" />
                <span>
                  <strong>Solicitar información</strong>
                  <small>Quiero resolver mis dudas.</small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>

              <button
                className="lote-opcion"
                disabled={!esDisponible}
                onClick={() => setSolicitudActiva('solicitud-cotizacion')}
              >
                <FileText size={20} aria-hidden="true" />
                <span>
                  <strong>Solicitar cotización</strong>
                  <small>
                    {esDisponible ? 'Quiero conocer el precio.' : 'Solo se puede cotizar un lote disponible.'}
                  </small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>

              <button className="lote-opcion" onClick={() => setSolicitudActiva('agendar-visita')}>
                <CalendarDays size={20} aria-hidden="true" />
                <span>
                  <strong>Agendar visita</strong>
                  <small>Quiero conocer el proyecto.</small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>

            <button className="lote-detalle-simular" onClick={() => irAlSimulador(loteSeleccionado)}>
              <Calculator size={15} aria-hidden="true" /> Simular cuotas de este lote
            </button>
          </Modal>
        )
      })()}

      <SolicitudInformacion
        isOpen={solicitudActiva === 'solicitud-informacion'}
        onClose={cerrarSolicitud}
        proyecto={proyecto}
        lote={loteSeleccionado}
      />

      <SolicitudCotizacion
        isOpen={solicitudActiva === 'solicitud-cotizacion'}
        onClose={cerrarSolicitud}
        proyecto={proyecto}
        lote={loteSeleccionado}
      />

      {/* "Volver al proyecto": tras agendar se cierra también el detalle del lote. */}
      <AgendarVisita
        isOpen={solicitudActiva === 'agendar-visita'}
        onClose={cerrarSolicitud}
        onVolver={cerrarDetalleLote}
        proyecto={proyecto}
        lote={loteSeleccionado}
      />
    </section>
  )
}

export default Lotes
