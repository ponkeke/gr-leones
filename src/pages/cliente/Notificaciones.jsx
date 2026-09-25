import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Vacio } from '../../components/areaInterna/Partes'
import { getNotificacionesDeCliente } from '../../services/api'
import { formatearFecha } from '../../utils/formato'

function Notificaciones() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`notificaciones-cliente-${usuario.id}`, () => getNotificacionesDeCliente(usuario.id))

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

// "Marcar como leídas" solo cambia el estado local de esta pantalla (no hay backend).
function ListaNotificaciones({ inicial }) {
  const [notificaciones, setNotificaciones] = useState(inicial)
  const sinLeer = notificaciones.filter((n) => !n.leida).length

  const marcarTodas = () => setNotificaciones((lista) => lista.map((n) => ({ ...n, leida: true })))

  return (
    <>
      <EncabezadoPagina
        titulo="Notificaciones"
        subtitulo={sinLeer ? `Tienes ${sinLeer} ${sinLeer === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}.` : 'Estás al día.'}
      >
        {sinLeer > 0 && (
          <button type="button" className="panel-boton-secundario" onClick={marcarTodas}>
            <CheckCheck size={15} aria-hidden="true" /> Marcar todas como leídas
          </button>
        )}
      </EncabezadoPagina>

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
                <p className="panel-linea-detalle">{n.texto}</p>
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
