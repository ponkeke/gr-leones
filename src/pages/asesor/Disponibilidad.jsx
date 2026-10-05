import { useState } from 'react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, Enlace, EstadoCarga } from '../../components/areaInterna/Partes'
import Calendario, { MarcaLeyenda } from '../../components/Calendario/Calendario'
import { getAgendaDeAsesor, getDisponibilidadDeAsesor, guardarHorarioDeFecha, guardarHorarioSemanal } from '../../services/api'
import { ESTADOS_VISITA_ACTIVOS } from '../../data/procesoComercial'
import {
  DIAS_AGENDABLES,
  DIAS_SEMANA,
  DURACION_VISITA_MIN,
  HORAS_DE_ATENCION,
  aMinutos,
  horasDelDia,
  nombreDiaPlural,
  textoRangos,
} from '../../data/disponibilidad'
import { diaDeLaSemana, fechaLocalISO, formatearFechaConDia, formatearHora, sumarDias } from '../../utils/formato'

/**
 * "Mi disponibilidad": el asesor marca en qué días y horas puede recibir visitas. Los clientes
 * solo pueden agendar en esos horarios (y nunca en uno que ya tenga otra visita).
 */
function Disponibilidad() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`disponibilidad-${usuario.id}`, async () => {
    const [disponibilidad, agenda] = await Promise.all([getDisponibilidadDeAsesor(usuario.id), getAgendaDeAsesor(usuario.id)])
    return { disponibilidad, visitas: agenda.filter((v) => ESTADOS_VISITA_ACTIVOS.includes(v.estado)) }
  })

  return (
    <>
      <EncabezadoPagina
        titulo="Mi disponibilidad"
        subtitulo="Marca los días y horarios en que puedes recibir visitas. Los clientes solo podrán agendar en esos horarios."
      >
        <Enlace a="/asesor/agenda" className="panel-boton-secundario">Ver mi agenda</Enlace>
      </EncabezadoPagina>

      {estado !== 'listo' ? <EstadoCarga estado={estado} error={error} /> : <EditorDisponibilidad inicial={datos.disponibilidad} visitas={datos.visitas} />}
    </>
  )
}

function EditorDisponibilidad({ inicial, visitas }) {
  const [disponibilidad, setDisponibilidad] = useState(inicial)
  const [fecha, setFecha] = useState(null)
  // Cambia en cada guardado: vuelve a montar el editor del día con lo que quedó guardado.
  const [version, setVersion] = useState(0)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState(null) // { tipo: 'exito' | 'error', texto }

  const [hoy] = useState(fechaLocalISO)
  const hasta = sumarDias(hoy, DIAS_AGENDABLES)

  const guardar = async (acciones, textoExito) => {
    setGuardando(true)
    setAviso(null)
    try {
      let resultado = disponibilidad
      for (const accion of acciones) resultado = await accion()
      setDisponibilidad(resultado)
      setVersion((v) => v + 1)
      setAviso({ tipo: 'exito', texto: textoExito })
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message })
    } finally {
      setGuardando(false)
    }
  }

  // Días con visitas vigentes: se marcan con un punto en el calendario.
  const visitasPorDia = visitas.reduce((mapa, v) => mapa.set(v.fecha, (mapa.get(v.fecha) ?? 0) + 1), new Map())

  const infoDia = (dia) => {
    const excepcion = disponibilidad.excepciones[dia]
    const horas = horasDelDia(disponibilidad, dia)
    const tipo = excepcion ? (excepcion.length ? 'especial' : 'bloqueado') : horas.length ? 'disponible' : 'sin-horario'
    const cantidadVisitas = visitasPorDia.get(dia) ?? 0
    const detalle = [
      { especial: 'Horario especial', bloqueado: 'No disponible', disponible: 'Horario semanal', 'sin-horario': 'Sin horario' }[tipo],
      horas.length ? textoRangos(horas) : null,
      cantidadVisitas ? `${cantidadVisitas} ${cantidadVisitas === 1 ? 'visita' : 'visitas'}` : null,
    ]
      .filter(Boolean)
      .join(' · ')
    return { habilitado: true, tipo, detalle, marca: cantidadVisitas > 0 }
  }

  const excepcionesProximas = Object.entries(disponibilidad.excepciones)
    .filter(([dia]) => dia >= hoy)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      <div className="panel-disponibilidad">
        <section className="panel-tarjeta">
          <h2 className="panel-seccion-titulo">Elige un día</h2>
          <Calendario
            id="disponibilidad-calendario"
            etiqueta="Días para configurar"
            desde={hoy}
            hasta={hasta}
            seleccionada={fecha}
            onSeleccionar={(dia) => {
              setFecha(dia)
              setAviso(null)
            }}
            infoDia={infoDia}
            leyenda={
              <>
                <MarcaLeyenda tipo="disponible">Horario semanal</MarcaLeyenda>
                <MarcaLeyenda tipo="especial">Horario especial</MarcaLeyenda>
                <MarcaLeyenda tipo="bloqueado">No disponible</MarcaLeyenda>
                <MarcaLeyenda tipo="sin-horario">Sin horario</MarcaLeyenda>
                <MarcaLeyenda tipo="marca">Con visitas</MarcaLeyenda>
              </>
            }
          />
        </section>

        <section className="panel-tarjeta" aria-live="polite">
          {fecha ? (
            <EditorDia
              key={`${fecha}-${version}`}
              fecha={fecha}
              disponibilidad={disponibilidad}
              visitas={visitas.filter((v) => v.fecha === fecha)}
              guardando={guardando}
              onGuardar={guardar}
            />
          ) : (
            <p className="panel-texto-secundario">
              Elige un día en el calendario para marcar tus horarios. Puedes guardarlos para todas las semanas o solo para ese día.
            </p>
          )}
          {aviso && (
            <p className={aviso.tipo === 'exito' ? 'panel-exito' : 'panel-error'} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
              {aviso.texto}
            </p>
          )}
        </section>
      </div>

      <div className="panel-rejilla-2 panel-seccion">
        <section className="panel-tarjeta">
          <h2 className="panel-seccion-titulo">Horario semanal</h2>
          <dl className="panel-horario-semanal">
            {DIAS_SEMANA.map(({ dia, nombre }) => {
              const horas = disponibilidad.semanal[dia] ?? []
              return (
                <div key={dia} className="panel-dato">
                  <dt>{nombre}</dt>
                  <dd className={horas.length ? undefined : 'panel-pendiente'}>{horas.length ? textoRangos(horas) : 'No disponible'}</dd>
                </div>
              )
            })}
          </dl>
        </section>

        <section className="panel-tarjeta">
          <h2 className="panel-seccion-titulo">Días con horario especial</h2>
          {excepcionesProximas.length === 0 ? (
            <p className="panel-texto-secundario">No tienes días con horario especial ni días marcados como no disponibles.</p>
          ) : (
            <ul className="panel-lista">
              {excepcionesProximas.map(([dia, horas]) => (
                <li key={dia} className="panel-lista-item panel-excepcion">
                  <div>
                    <p className="panel-lista-titulo">{formatearFechaConDia(dia)}</p>
                    <p className={horas.length ? 'panel-texto-secundario' : 'panel-texto-alerta'}>
                      {horas.length ? textoRangos(horas) : 'No disponible'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="panel-boton-secundario"
                    disabled={guardando}
                    onClick={() =>
                      guardar([() => guardarHorarioDeFecha(dia, null)], `${formatearFechaConDia(dia)} vuelve a tu horario semanal.`)
                    }
                  >
                    Usar horario semanal
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

/** Horas del día elegido (se marcan y desmarcan) y las formas de guardarlas. */
function EditorDia({ fecha, disponibilidad, visitas, guardando, onGuardar }) {
  const [horas, setHoras] = useState(() => horasDelDia(disponibilidad, fecha))
  const dia = diaDeLaSemana(fecha)
  const excepcion = disponibilidad.excepciones[fecha]
  const plural = nombreDiaPlural(dia)
  const fechaTexto = formatearFechaConDia(fecha)

  const origen = excepcion
    ? excepcion.length
      ? 'Este día tiene un horario especial (solo para esta fecha).'
      : 'Este día está marcado como no disponible.'
    : disponibilidad.semanal[dia]?.length
      ? `Este día usa tu horario semanal de los ${plural}.`
      : `Aún no tienes horarios para los ${plural}.`

  const visitaA = (hora) => visitas.find((v) => Math.abs(aMinutos(v.hora) - aMinutos(hora)) < DURACION_VISITA_MIN)
  const alternar = (hora) => setHoras((lista) => (lista.includes(hora) ? lista.filter((h) => h !== hora) : [...lista, hora].sort()))

  const guardarSemanal = () =>
    onGuardar(
      [() => guardarHorarioSemanal(dia, horas), ...(excepcion ? [() => guardarHorarioDeFecha(fecha, null)] : [])],
      horas.length ? `Guardado: atiendes todos los ${plural}, ${textoRangos(horas)}.` : `Guardado: los ${plural} ya no atiendes.`,
    )

  return (
    <>
      <h2 className="panel-seccion-titulo">{fechaTexto}</h2>
      <p className="panel-texto-secundario">{origen}</p>

      <div className="panel-horas" role="group" aria-label={`Horarios del ${fechaTexto}`}>
        {HORAS_DE_ATENCION.map((hora) => {
          const visita = visitaA(hora)
          const marcada = horas.includes(hora)
          // Visita en una hora que el asesor desmarcó: sigue vigente, se avisa en rojo.
          const clase = ['panel-hora', visita && 'panel-hora-con-visita', visita && !marcada && 'panel-hora-alerta']
          return (
            <button
              key={hora}
              type="button"
              className={clase.filter(Boolean).join(' ')}
              aria-pressed={marcada}
              title={visita ? `Visita con ${visita.cliente?.nombre ?? 'un cliente'}` : undefined}
              onClick={() => alternar(hora)}
            >
              {formatearHora(hora)}
              {visita && <small>{marcada ? 'Visita agendada' : 'Visita fuera de horario'}</small>}
            </button>
          )
        })}
      </div>

      <div className="panel-leyenda-horas" aria-hidden="true">
        <span><i className="panel-muestra-hora panel-muestra-marcada" /> Disponible</span>
        <span><i className="panel-muestra-hora" /> Sin marcar</span>
        <span><i className="panel-muestra-hora panel-muestra-visita" /> Con visita</span>
      </div>

      {visitas.length > 0 && (
        <p className="panel-texto-secundario">
          Tienes {visitas.length === 1 ? 'una visita' : `${visitas.length} visitas`} este día (
          {visitas.map((v) => `${formatearHora(v.hora)} con ${v.cliente?.nombre ?? 'un cliente'}`).join(', ')}). Quitar el horario no
          la cancela: para eso usa tu Agenda.
        </p>
      )}

      <div className="panel-formulario-acciones">
        <button type="button" className="btn-buscar panel-boton" disabled={guardando} onClick={guardarSemanal}>
          {guardando ? 'Guardando…' : `Guardar para todos los ${plural}`}
        </button>
        <button
          type="button"
          className="panel-boton-secundario"
          disabled={guardando || horas.length === 0}
          onClick={() => onGuardar([() => guardarHorarioDeFecha(fecha, horas)], `Guardado: horario especial para el ${fechaTexto}.`)}
        >
          Guardar solo para este día
        </button>
        <button
          type="button"
          className="panel-boton-secundario"
          disabled={guardando || (excepcion && excepcion.length === 0)}
          onClick={() => onGuardar([() => guardarHorarioDeFecha(fecha, [])], `Guardado: el ${fechaTexto} no estarás disponible.`)}
        >
          No disponible este día
        </button>
        {excepcion && (
          <button
            type="button"
            className="panel-boton-secundario"
            disabled={guardando}
            onClick={() => onGuardar([() => guardarHorarioDeFecha(fecha, null)], `${fechaTexto} vuelve a tu horario semanal.`)}
          >
            Usar horario semanal
          </button>
        )}
      </div>
    </>
  )
}

export default Disponibilidad
