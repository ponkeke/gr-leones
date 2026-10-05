import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Vacio } from '../../components/areaInterna/Partes'
import { getNotificaciones, marcarNotificacionesLeidas } from '../../services/api'
import { formatearFecha } from '../../utils/formato'

// La usan el área del cliente y la del asesor: siempre muestra las del usuario en sesión.
function Notificaciones() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`notificaciones-${usuario.tipo}-${usuario.id}`, () =>
    getNotificaciones(usuario.tipo, usuario.id),
  )

  if (estado !== 'listo') {
    return (
      <>
        <EncabezadoPagina titulo="Notificaciones" />
        <EstadoCarga estado={estado} error={error} />
      </>
    )
  }
  return <ListaNotificaciones inicial={datos} />
}

// "Marcar como leídas" se guarda en el almacén mock (`services/api.js`).
function ListaNotificaciones({ inicial }) {
  const { refrescarNotificaciones } = useAreaInterna()
  const [notificaciones, setNotificaciones] = useState(inicial)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(null)
  const sinLeer = notificaciones.filter((n) => !n.leida).length

  const marcarTodas = async () => {
    setGuardando(true)
    setErrorGuardado(null)
    try {
      setNotificaciones(await marcarNotificacionesLeidas(notificaciones.filter((n) => !n.leida).map((n) => n.id)))
      refrescarNotificaciones()
    } catch (e) {
      setErrorGuardado(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Notificaciones"
        subtitulo={sinLeer ? `Tienes ${sinLeer} ${sinLeer === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}.` : 'Estás al día.'}
      >
        {sinLeer > 0 && (
          <button type="button" className="panel-boton-secundario" onClick={marcarTodas} disabled={guardando}>
            <CheckCheck size={15} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Marcar todas como leídas'}
          </button>
        )}
      </EncabezadoPagina>

      {errorGuardado && <p className="panel-error" role="alert">{errorGuardado}</p>}

      {notificaciones.length === 0 ? (
        <Vacio texto="No tienes notificaciones." />
      ) : (
        <ul className="panel-lista">
          {notificaciones.map((n) => (
            <li key={n.id} className={`panel-tarjeta panel-lista-item ${n.leida ? '' : 'panel-no-leida'}`}>
              <span className={`panel-punto ${n.leida ? 'panel-punto-leida' : ''}`} aria-hidden="true" />
              <div>
                <p className="panel-lista-titulo">
                  {n.titulo}
                  {!n.leida && <span className="panel-oculto"> (sin leer)</span>}
                </p>
                <p className="panel-linea-detalle">{n.mensaje}</p>
                <p className="panel-texto-secundario">{formatearFecha(n.fecha)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default Notificaciones
