import { useEffect, useEffectEvent, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Vacio } from '../../components/areaInterna/Partes'
import { TIPOS_ACTIVIDAD, getActividadReciente, suscribirActividad } from '../../services/api'
import { formatearFecha } from '../../utils/formato'

/** "2026-09-28T15:04:00Z" -> "28/09/2026 10:04"; "2026-09-28" -> "28/09/2026" (sin hora registrada). */
function fechaEvento(fecha) {
  if (!fecha.includes('T')) return formatearFecha(fecha)
  const d = new Date(fecha)
  const hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${hora}`
}

const horaActual = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

/**
 * Actividad reciente: los eventos ya registrados, del más nuevo al más antiguo. Se actualiza sola
 * cuando cambian los datos en este navegador (esta pestaña u otra) y con el botón "Actualizar".
 * No es una transmisión en vivo entre dispositivos: eso llegará con el servidor (SSE/WebSocket).
 */
function ActividadAdmin() {
  const [tipo, setTipo] = useState('')
  const [version, setVersion] = useState(0)
  const [actualizado, setActualizado] = useState(horaActual)
  const { datos, estado, error } = useDatos(`actividad-${tipo}-${version}`, () => getActividadReciente({ tipo: tipo || null }))

  const recargar = () => {
    setVersion((v) => v + 1)
    setActualizado(horaActual())
  }
  const alCambiarDatos = useEffectEvent(recargar)

  useEffect(() => suscribirActividad(() => alCambiarDatos()), [])

  return (
    <>
      <EncabezadoPagina
        titulo="Actividad reciente"
        subtitulo="Lo que ocurrió en el sistema, del evento más nuevo al más antiguo. Se actualiza cuando cambian los datos en este navegador."
      >
        <button type="button" className="panel-boton-secundario" onClick={recargar}>
          <RefreshCw size={14} aria-hidden="true" /> Actualizar
        </button>
      </EncabezadoPagina>

      <div className="panel-formulario panel-filtros">
        <label className="panel-campo">
          Tipo de evento
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {TIPOS_ACTIVIDAD.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="panel-texto-secundario">Última actualización: {actualizado}</p>

      {estado !== 'listo' ? (
        <EstadoCarga estado={estado} error={error} />
      ) : datos.length === 0 ? (
        <Vacio texto="Todavía no hay actividad registrada de este tipo." />
      ) : (
        <section className="panel-tarjeta panel-seccion">
          <ol className="panel-linea">
            {datos.map((evento) => (
              <li key={evento.id} className="panel-linea-item">
                <time className="panel-linea-fecha" dateTime={evento.fecha}>{fechaEvento(evento.fecha)}</time>
                <div className="panel-linea-cuerpo">
                  <p className="panel-linea-titulo">
                    {evento.titulo}{' '}
                    <span className="panel-actividad-hora">· {TIPOS_ACTIVIDAD.find((t) => t.value === evento.tipo)?.label}</span>
                  </p>
                  <p className="panel-linea-detalle">{evento.detalle}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}

export default ActividadAdmin
