import { useState } from 'react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, Enlace, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { actualizarVisita, getAgendaDeAsesor } from '../../services/api'
import { ESTADOS_VISITA, TRANSICIONES_VISITA, buscarEstado } from '../../data/procesoComercial'
import { fechaLocalISO, formatearFechaConDia, formatearHora } from '../../utils/formato'

// Botón de cada cambio de estado posible (los permitidos salen de TRANSICIONES_VISITA).
const ACCIONES = {
  CONFIRMADA: { texto: 'Confirmar', procesando: 'Confirmando…' },
  REALIZADA: { texto: 'Marcar como realizada', procesando: 'Guardando…' },
  CANCELADA: { texto: 'Cancelar', procesando: 'Cancelando…', pregunta: '¿Cancelar esta visita? Se avisará al cliente.' },
}

function Agenda() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`agenda-asesor-${usuario.id}`, () => getAgendaDeAsesor(usuario.id))

  return (
    <>
      <EncabezadoPagina
        titulo="Agenda"
        subtitulo="Visitas de tus clientes a los proyectos. Confirma las pendientes y registra las realizadas."
      >
        {/* Los clientes solo pueden agendar en los horarios que el asesor marca allí. */}
        <Enlace a="/asesor/disponibilidad" className="panel-boton-secundario">Mi disponibilidad</Enlace>
      </EncabezadoPagina>

      {estado !== 'listo' ? <EstadoCarga estado={estado} error={error} /> : <ListaAgenda inicial={datos} />}
    </>
  )
}

function ListaAgenda({ inicial }) {
  const [visitas, setVisitas] = useState(inicial)
  const [procesando, setProcesando] = useState(null) // { id, estado } | null
  const [errorAccion, setErrorAccion] = useState(null)

  const hoy = fechaLocalISO()
  const proximas = visitas.filter((v) => v.fecha >= hoy)
  // Las anteriores, de la más reciente a la más antigua.
  const anteriores = visitas.filter((v) => v.fecha < hoy).reverse()

  const cambiarEstado = async (visita, nuevoEstado) => {
    const pregunta = ACCIONES[nuevoEstado].pregunta
    if (pregunta && !window.confirm(pregunta)) return
    setProcesando({ id: visita.id, estado: nuevoEstado })
    setErrorAccion(null)
    try {
      const actualizada = await actualizarVisita(visita.id, { estado: nuevoEstado })
      setVisitas((lista) => lista.map((v) => (v.id === actualizada.id ? actualizada : v)))
    } catch (e) {
      setErrorAccion(e.message)
    } finally {
      setProcesando(null)
    }
  }

  const columnas = [
    { titulo: 'Fecha', render: (v) => formatearFechaConDia(v.fecha) },
    { titulo: 'Hora', render: (v) => formatearHora(v.hora) },
    {
      titulo: 'Cliente',
      render: (v) => (
        <span>
          {v.cliente?.nombre ?? '—'}
          <span className="panel-texto-secundario">
            {[v.clienteId ? null : 'Visitante web', v.cliente?.telefono].filter(Boolean).join(' · ')}
          </span>
        </span>
      ),
    },
    { titulo: 'Proyecto', render: textoProyecto },
    { titulo: 'Lote', render: textoLote },
    { titulo: 'Tipo de visita', render: (v) => v.tipo },
    { titulo: 'Estado', render: (v) => <Insignia estado={buscarEstado(ESTADOS_VISITA, v.estado)} /> },
    {
      titulo: 'Acciones',
      render: (v) => {
        const posibles = TRANSICIONES_VISITA[v.estado] ?? []
        if (posibles.length === 0) return '—'
        return (
          <span className="panel-acciones">
            {posibles.map((nuevoEstado) => (
              <button
                key={nuevoEstado}
                type="button"
                className={nuevoEstado === 'CANCELADA' ? 'panel-boton-secundario' : 'btn-buscar panel-boton'}
                disabled={procesando !== null}
                onClick={() => cambiarEstado(v, nuevoEstado)}
              >
                {procesando?.id === v.id && procesando.estado === nuevoEstado
                  ? ACCIONES[nuevoEstado].procesando
                  : ACCIONES[nuevoEstado].texto}
              </button>
            ))}
          </span>
        )
      },
    },
  ]

  return (
    <>
      {errorAccion && <p className="panel-error" role="alert">{errorAccion}</p>}
      <section>
        <h2 className="panel-seccion-titulo">Próximas visitas</h2>
        <Tabla columnas={columnas} filas={proximas} vacio="No tienes visitas próximas." />
      </section>
      <section className="panel-seccion">
        <h2 className="panel-seccion-titulo">Visitas anteriores</h2>
        <Tabla columnas={columnas} filas={anteriores} vacio="Aún no hay visitas anteriores." />
      </section>
    </>
  )
}

export default Agenda
