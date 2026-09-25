import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import './SimuladorCostos.css'
import { getLote, getProyecto } from '../../services/api'
import { ESTADO_COLOR, ESTADO_LABEL } from '../../data/estados'
import { OPCIONES_CUOTAS } from '../../data/simulador'
import { formatearSoles } from '../../utils/formato'
import { parsearMonto, validarSimulacion, calcularSimulacion } from '../../utils/simulador'
import SolicitudCotizacion from '../../components/SolicitudCotizacion/SolicitudCotizacion'

function useQueryLote() {
  const params = new URLSearchParams(window.location.search)
  return params.get('lote')
}

/**
 * Simulador de costos de un lote. El lote llega por la URL (`/simulador-costos?lote=<id>`) y sus
 * datos (y los del proyecto) se piden por `services/api`, igual que el resto de páginas: el usuario
 * no reescribe nada. Es solo una estimación: no reserva, no vende y no cambia el estado del lote.
 */
function SimuladorCostos() {
  const loteId = useQueryLote()
  const [lote, setLote] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [estadoCarga, setEstadoCarga] = useState(loteId ? 'cargando' : 'error') // 'cargando' | 'listo' | 'error'
  const [errorCarga, setErrorCarga] = useState(loteId ? null : 'Elige un lote para simular su costo.')

  const [inicial, setInicial] = useState('')
  const [cuotas, setCuotas] = useState('')
  const [errorForm, setErrorForm] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false)
  const resultadoRef = useRef(null)

  useEffect(() => {
    if (!loteId) return

    let cancelado = false

    getLote(loteId)
      .then(async (loteData) => {
        const proyectoData = await getProyecto(loteData.proyectoId)
        if (cancelado) return
        setLote(loteData)
        setProyecto(proyectoData)
        setEstadoCarga('listo')
      })
      .catch((err) => {
        if (cancelado) return
        setErrorCarga(err.message)
        setEstadoCarga('error')
      })

    return () => {
      cancelado = true
    }
  }, [loteId])

  // En móvil el resultado queda debajo del formulario: lo acercamos a la vista al calcular.
  useEffect(() => {
    if (resultado) resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [resultado])

  // Cambiar cualquier dato invalida el resultado anterior (evita mostrar cifras desactualizadas).
  const alCambiar = (setter) => (evento) => {
    setter(evento.target.value)
    setResultado(null)
    setErrorForm(null)
  }

  const calcular = (evento) => {
    evento.preventDefault()

    const entrada = { precio: lote.precio_total, inicial: parsearMonto(inicial), cuotas: Number(cuotas) }
    const mensaje = validarSimulacion(entrada)

    if (mensaje) {
      setErrorForm(mensaje)
      setResultado(null)
      return
    }

    setErrorForm(null)
    setResultado(calcularSimulacion(entrada))
  }

  if (estadoCarga === 'cargando') {
    return (
      <section className="simulador">
        <div className="simulador-estado">Cargando simulador…</div>
      </section>
    )
  }

  if (estadoCarga === 'error') {
    return (
      <section className="simulador">
        <div className="simulador-estado">
          <p>{errorCarga ?? 'No se pudo cargar el lote.'}</p>
          <a className="btn-proyecto" href="/lotes">
            Ir a lotes
          </a>
        </div>
      </section>
    )
  }

  const precioConfirmado = typeof lote.precio_total === 'number'
  const esDisponible = lote.estado === 'DISPONIBLE'
  const simulacionDeshabilitada = !precioConfirmado

  return (
    <section className="simulador">
      <div className="simulador-contenido">
        <a className="simulador-volver" href={`/lotes?id=${lote.proyectoId}`}>
          <ArrowLeft size={14} /> Volver a lotes
        </a>

        <h1>Simulador de costos</h1>
        <p className="simulador-subtitulo">
          Estima cuánto pagarías por este lote. Es una referencia: no reserva ni compra el lote.
        </p>

        <div className="simulador-grid">
          {/* DATOS DEL LOTE — vienen de la selección, no se escriben */}
          <div className="simulador-panel">
            <h2 className="simulador-panel-titulo">Datos del lote</h2>

            <dl className="simulador-datos">
              <div className="simulador-dato-ancho">
                <dt>Proyecto</dt>
                <dd>{proyecto.nombre}</dd>
              </div>
              <div>
                <dt>Código</dt>
                <dd>{lote.codigo}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <span className="lote-estado-badge" style={{ background: ESTADO_COLOR[lote.estado] }}>
                    {ESTADO_LABEL[lote.estado]}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Manzana</dt>
                <dd>{lote.manzana}</dd>
              </div>
              <div>
                <dt>Lote</dt>
                <dd>{String(lote.numero).padStart(2, '0')}</dd>
              </div>
              <div>
                <dt>Área</dt>
                <dd>{lote.area_m2} m²</dd>
              </div>
              <div>
                <dt>Precio</dt>
                <dd className="simulador-dato-precio">
                  {precioConfirmado ? formatearSoles(lote.precio_total) : 'Por confirmar'}
                </dd>
              </div>
            </dl>

            {!esDisponible && (
              <p className="simulador-aviso">
                Este lote figura como {ESTADO_LABEL[lote.estado].toLowerCase()}: puedes simular, pero no solicitar
                cotización.
              </p>
            )}
          </div>

          {/* CONFIGURA TU SIMULACIÓN */}
          <form className="simulador-panel simulador-form" onSubmit={calcular} noValidate>
            <h2 className="simulador-panel-titulo">Configura tu simulación</h2>

            {!precioConfirmado && (
              <p className="simulador-aviso">
                El precio de este lote aún no está confirmado, por eso todavía no se puede calcular una cuota.
              </p>
            )}

            <label className="simulador-campo" htmlFor="simulador-inicial">
              <span>Inicial</span>
              <div className="simulador-input-moneda">
                <b>S/</b>
                <input
                  id="simulador-inicial"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={inicial}
                  onChange={alCambiar(setInicial)}
                  disabled={simulacionDeshabilitada}
                />
              </div>
            </label>

            <label className="simulador-campo" htmlFor="simulador-cuotas">
              <span>Número de cuotas</span>
              <select
                id="simulador-cuotas"
                value={cuotas}
                onChange={alCambiar(setCuotas)}
                disabled={simulacionDeshabilitada}
              >
                <option value="">Selecciona</option>
                {OPCIONES_CUOTAS.map((n) => (
                  <option key={n} value={n}>
                    {n} cuotas
                  </option>
                ))}
              </select>
            </label>

            {errorForm && (
              <p className="simulador-error" role="alert">
                {errorForm}
              </p>
            )}

            <button className="btn-buscar simulador-calcular" type="submit" disabled={simulacionDeshabilitada}>
              Calcular
            </button>
          </form>

          {/* RESULTADO */}
          {resultado && (
            <div className="simulador-panel simulador-resultado" ref={resultadoRef}>
              <h2 className="simulador-panel-titulo">Resultado</h2>

              <dl className="simulador-filas">
                <div>
                  <dt>Precio del lote</dt>
                  <dd>{formatearSoles(resultado.precio)}</dd>
                </div>
                <div>
                  <dt>Inicial</dt>
                  <dd>{formatearSoles(resultado.inicial)}</dd>
                </div>
                <div>
                  <dt>Saldo</dt>
                  <dd>{formatearSoles(resultado.saldo)}</dd>
                </div>
                <div>
                  <dt>Número de cuotas</dt>
                  <dd>{resultado.cuotas}</dd>
                </div>
                <div className="simulador-fila-destacada">
                  <dt>Cuota estimada</dt>
                  <dd>{formatearSoles(resultado.cuotaEstimada)}</dd>
                </div>
                <div>
                  <dt>Total estimado</dt>
                  <dd>{formatearSoles(resultado.total)}</dd>
                </div>
              </dl>

              <p className="simulador-nota">
                Estimación referencial: no incluye intereses, gastos administrativos ni otros conceptos.
              </p>

              <button
                className="btn-proyecto simulador-cotizar"
                disabled={!esDisponible}
                title={!esDisponible ? 'Solo se puede cotizar un lote disponible' : undefined}
                onClick={() => setMostrarSolicitud(true)}
              >
                Solicitar cotización
              </button>
            </div>
          )}
        </div>
      </div>

      <SolicitudCotizacion
        isOpen={mostrarSolicitud}
        onClose={() => setMostrarSolicitud(false)}
        textoVolver="Volver al simulador"
        proyecto={proyecto}
        lote={lote}
        simulacion={resultado}
      />
    </section>
  )
}

export default SimuladorCostos
