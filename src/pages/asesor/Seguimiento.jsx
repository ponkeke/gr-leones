import { useEffect, useState } from 'react'
import { PhoneCall, RefreshCw, StickyNote } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia, Pasos, Vacio } from '../../components/areaInterna/Partes'
import { textoLoteConRelacion, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { actualizarSeguimiento, getCarteraDeAsesor } from '../../services/api'
import { ETAPAS_CLIENTE, PASOS_ASESOR, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

function Seguimiento() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`cartera-${usuario.id}`, () => getCarteraDeAsesor(usuario.id))

  return (
    <>
      <EncabezadoPagina
        titulo="Seguimiento comercial"
        subtitulo="El avance de cada cliente. Los cambios se guardan en este navegador (demostración) y se reflejan en el área del cliente."
      />
      {estado === 'listo' ? <ListaSeguimiento inicial={datos} /> : <EstadoCarga estado={estado} error={error} />}
    </>
  )
}

function ListaSeguimiento({ inicial }) {
  const [cartera, setCartera] = useState(inicial)
  // /asesor/seguimiento?cliente=2 (desde "Clientes") resalta y muestra a ese cliente.
  const [clienteDestacado] = useState(() => new URLSearchParams(window.location.search).get('cliente'))

  useEffect(() => {
    if (!clienteDestacado) return
    document.getElementById(`seguimiento-cliente-${clienteDestacado}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [clienteDestacado])

  const reemplazar = (actualizado) =>
    setCartera((lista) => lista.map((registro) => (registro.id === actualizado.id ? actualizado : registro)))

  if (cartera.length === 0) return <Vacio texto="No tienes clientes asignados." />

  return (
    <div className="panel-lista">
      {cartera.map((registro) => (
        <TarjetaSeguimiento
          key={registro.id}
          registro={registro}
          destacado={String(registro.clienteId) === clienteDestacado}
          onActualizado={reemplazar}
        />
      ))}
    </div>
  )
}

function TarjetaSeguimiento({ registro, destacado, onActualizado }) {
  const [formulario, setFormulario] = useState(null) // null | 'contacto' | 'nota' | 'estado'
  const [texto, setTexto] = useState('')
  const [nuevaEtapa, setNuevaEtapa] = useState(registro.etapa)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(null)

  const etapa = buscarEstado(ETAPAS_CLIENTE, registro.etapa)
  const lotePrincipal = registro.lotes[0]

  const abrir = (tipo) => {
    setFormulario((actual) => (actual === tipo ? null : tipo))
    setTexto('')
    setNuevaEtapa(registro.etapa)
    setErrorGuardado(null)
  }

  // Cada formulario se traduce a un cambio de `actualizarSeguimiento` (se guarda en el almacén mock).
  const cambioDelFormulario = () => {
    if (formulario === 'contacto') return { nota: { tipo: 'CONTACTO', texto: texto.trim() || 'Contacto registrado.' } }
    if (formulario === 'nota') return texto.trim() ? { nota: { tipo: 'NOTA', texto: texto.trim() } } : null
    if (formulario === 'estado' && nuevaEtapa !== registro.etapa) return { etapa: nuevaEtapa }
    return null
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const cambio = cambioDelFormulario()
    if (!cambio) {
      if (formulario !== 'nota') setFormulario(null)
      return
    }

    setGuardando(true)
    setErrorGuardado(null)
    try {
      onActualizado(await actualizarSeguimiento(registro.id, cambio))
      setFormulario(null)
      setTexto('')
    } catch (e) {
      setErrorGuardado(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <article
      id={`seguimiento-cliente-${registro.clienteId}`}
      className={`panel-tarjeta panel-seguimiento ${destacado ? 'panel-no-leida' : ''}`}
    >
      <header className="panel-seguimiento-cabecera">
        <dl className="panel-datos">
          <div className="panel-dato">
            <dt>Cliente</dt>
            <dd>{registro.cliente?.nombre ?? '—'}</dd>
          </div>
          <div className="panel-dato">
            <dt>Proyecto</dt>
            <dd>{textoProyecto(lotePrincipal)}</dd>
          </div>
          <div className="panel-dato">
            <dt>Lote</dt>
            <dd>{registro.lotes.length ? registro.lotes.map(textoLoteConRelacion).join(', ') : '—'}</dd>
          </div>
          <div className="panel-dato">
            <dt>Estado</dt>
            <dd><Insignia estado={etapa} /></dd>
          </div>
        </dl>
      </header>

      <h3 className="panel-seccion-titulo panel-seguimiento-subtitulo">Proceso</h3>
      <Pasos pasos={PASOS_ASESOR} completados={etapa.pasosAsesor} />

      <div className="panel-acciones panel-acciones-inicio panel-seguimiento-acciones">
        <button type="button" className="panel-boton-secundario" aria-expanded={formulario === 'contacto'} onClick={() => abrir('contacto')}>
          <PhoneCall size={14} aria-hidden="true" /> Registrar contacto
        </button>
        <button type="button" className="panel-boton-secundario" aria-expanded={formulario === 'nota'} onClick={() => abrir('nota')}>
          <StickyNote size={14} aria-hidden="true" /> Agregar nota
        </button>
        <button type="button" className="panel-boton-secundario" aria-expanded={formulario === 'estado'} onClick={() => abrir('estado')}>
          <RefreshCw size={14} aria-hidden="true" /> Actualizar estado
        </button>
      </div>

      {formulario && (
        <form className="panel-formulario panel-seguimiento-formulario" onSubmit={enviar}>
          {formulario === 'estado' ? (
            <label className="panel-campo">
              Nuevo estado
              <select value={nuevaEtapa} onChange={(e) => setNuevaEtapa(e.target.value)}>
                {ETAPAS_CLIENTE.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="panel-campo panel-campo-ancho">
              {formulario === 'contacto' ? 'Detalle del contacto (opcional)' : 'Nota'}
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                required={formulario === 'nota'}
                placeholder={formulario === 'contacto' ? 'Ej.: Llamada, confirmó interés en el lote.' : 'Escribe una nota interna…'}
              />
            </label>
          )}
          {errorGuardado && <p className="panel-error" role="alert">{errorGuardado}</p>}
          <div className="panel-formulario-acciones">
            <button type="submit" className="btn-buscar panel-boton" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
            <button type="button" className="panel-boton-secundario" onClick={() => setFormulario(null)} disabled={guardando}>Cancelar</button>
          </div>
        </form>
      )}

      <h3 className="panel-seccion-titulo panel-seguimiento-subtitulo">Notas</h3>
      {registro.notas.length === 0 ? (
        <p className="panel-texto-secundario">Sin notas todavía.</p>
      ) : (
        <ol className="panel-linea">
          {[...registro.notas].reverse().map((nota, indice) => (
            <li key={`${nota.fecha}-${registro.notas.length - indice}`} className="panel-linea-item">
              <time className="panel-linea-fecha" dateTime={nota.fecha}>{formatearFecha(nota.fecha)}</time>
              <div className="panel-linea-cuerpo">
                <p className="panel-linea-titulo">{TITULO_NOTA[nota.tipo] ?? 'Nota'}</p>
                <p className="panel-linea-detalle">{nota.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="panel-texto-secundario">Última interacción: {formatearFecha(registro.ultimaInteraccion)}</p>
    </article>
  )
}

const TITULO_NOTA = {
  CONTACTO: 'Contacto registrado',
  NOTA: 'Nota',
  ESTADO: 'Cambio de estado',
  // Las registra administración (reasignación y separación de lotes).
  ALTA: 'Alta como cliente',
  ASIGNACION: 'Cambio de asesor',
  SEPARACION: 'Separación registrada',
}

export default Seguimiento
