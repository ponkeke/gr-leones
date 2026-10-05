import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Indicador, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { actualizarVisita, getVisitasDeCliente } from '../../services/api'
import { ESTADOS_VISITA, ESTADOS_VISITA_ACTIVOS, buscarEstado } from '../../data/procesoComercial'
import { fechaLocalISO, formatearFechaConDia, formatearHora } from '../../utils/formato'

function MisVisitas() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`visitas-cliente-${usuario.id}`, () => getVisitasDeCliente(usuario.id))

  return (
    <>
      <EncabezadoPagina titulo="Agenda de visitas" subtitulo="Tus visitas a los proyectos, programadas y anteriores.">
        {/* El agendamiento real se hace desde el detalle del lote (formulario "Agendar visita"). */}
        <a className="btn-buscar panel-boton" href="/proyectospage">Agendar otra visita</a>
      </EncabezadoPagina>

      {estado !== 'listo' ? <EstadoCarga estado={estado} error={error} /> : <ListaVisitas inicial={datos} />}
    </>
  )
}

// Se puede cancelar una visita pendiente o confirmada que todavía no pasó (nunca una realizada).
const sePuedeCancelar = (v) => ESTADOS_VISITA_ACTIVOS.includes(v.estado) && v.fecha >= fechaLocalISO()

function ListaVisitas({ inicial }) {
  const { usuario } = useAreaInterna()
  const [datos, setDatos] = useState(inicial)
  const [procesandoId, setProcesandoId] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  const cancelar = async (visita) => {
    if (!window.confirm(`¿Cancelar tu visita del ${formatearFechaConDia(visita.fecha)} a las ${formatearHora(visita.hora)}?`)) return
    setProcesandoId(visita.id)
    setErrorAccion(null)
    try {
      await actualizarVisita(visita.id, { estado: 'CANCELADA' })
      setDatos(await getVisitasDeCliente(usuario.id))
    } catch (e) {
      setErrorAccion(e.message)
    } finally {
      setProcesandoId(null)
    }
  }

  const columnas = [
    { titulo: 'Proyecto', render: textoProyecto },
    { titulo: 'Lote', render: textoLote },
    { titulo: 'Fecha', render: (v) => formatearFechaConDia(v.fecha) },
    { titulo: 'Hora', render: (v) => formatearHora(v.hora) },
    { titulo: 'Asesor', render: (v) => v.asesor?.nombre ?? '—' },
    { titulo: 'Estado', render: (v) => <Insignia estado={buscarEstado(ESTADOS_VISITA, v.estado)} /> },
    {
      titulo: 'Acciones',
      render: (v) =>
        sePuedeCancelar(v) ? (
          <button
            type="button"
            className="panel-boton-secundario"
            disabled={procesandoId !== null}
            onClick={() => cancelar(v)}
          >
            {procesandoId === v.id ? 'Cancelando…' : 'Cancelar'}
          </button>
        ) : (
          '—'
        ),
    },
  ]

  return (
    <>
      <div className="panel-rejilla">
        <Indicador
          icono={CalendarDays}
          etiqueta="Próxima visita"
          valor={datos.proxima ? `${formatearFechaConDia(datos.proxima.fecha)} · ${formatearHora(datos.proxima.hora)}` : 'Sin visitas programadas'}
          detalle={
            datos.proxima
              ? `${textoProyecto(datos.proxima)} · ${textoLote(datos.proxima)} · con ${datos.proxima.asesor?.nombre ?? 'tu asesor'} · ${buscarEstado(ESTADOS_VISITA, datos.proxima.estado).label}`
              : 'Cuando agendes una visita aparecerá aquí.'
          }
        />
      </div>

      <section className="panel-seccion">
        <h2 className="panel-seccion-titulo">Todas mis visitas</h2>
        {errorAccion && <p className="panel-error" role="alert">{errorAccion}</p>}
        <Tabla columnas={columnas} filas={datos.visitas} vacio="Aún no tienes visitas registradas." />
      </section>
    </>
  )
}

export default MisVisitas
