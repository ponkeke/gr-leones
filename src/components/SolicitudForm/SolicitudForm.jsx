import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import './SolicitudForm.css'
import { crearSolicitud, crearVisita } from '../../services/api'

const TITULOS = {
  informacion: 'Solicitar información',
  cotizacion: 'Solicitar cotización',
  visita: 'Agendar visita',
}

const CAMPOS_INICIALES = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  correo: '',
  mensaje: '',
  fecha: '',
  hora: '',
}

/**
 * Modal reutilizable para "Solicitar información", "Solicitar cotización" y "Agendar visita".
 * `simulacion` es opcional: si viene del Simulador de costos, viaja con la solicitud.
 */
function SolicitudForm({ isOpen, onClose, tipo = 'informacion', proyecto, lote, simulacion }) {
  const [datos, setDatos] = useState(CAMPOS_INICIALES)
  const [estado, setEstado] = useState('idle') // 'idle' | 'enviando' | 'exito' | 'error'
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const esVisita = tipo === 'visita'

  const actualizarCampo = (campo) => (evento) => {
    setDatos((prev) => ({ ...prev, [campo]: evento.target.value }))
  }

  const cerrar = () => {
    setDatos(CAMPOS_INICIALES)
    setEstado('idle')
    setError(null)
    onClose()
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    setEstado('enviando')
    setError(null)

    const payload = {
      tipo,
      proyectoId: proyecto?.id ?? null,
      proyectoNombre: proyecto?.nombre ?? null,
      loteId: lote?.id ?? null,
      loteCodigo: lote?.codigo ?? null,
      simulacion: simulacion ?? null,
      nombre: datos.nombre,
      apellido: datos.apellido,
      dni: datos.dni,
      telefono: datos.telefono,
      correo: datos.correo,
      mensaje: datos.mensaje,
    }

    try {
      if (esVisita) {
        await crearVisita({ ...payload, fecha: datos.fecha, hora: datos.hora })
      } else {
        await crearSolicitud(payload)
      }
      setEstado('exito')
    } catch (err) {
      setEstado('error')
      setError(err.message)
    }
  }

  return (
    <div className="solicitud-overlay" role="dialog" aria-modal="true" onClick={cerrar}>
      <div className="solicitud-modal" onClick={(e) => e.stopPropagation()}>
        <button className="solicitud-cerrar" onClick={cerrar} aria-label="Cerrar">
          <X size={18} />
        </button>

        {estado === 'exito' ? (
          <div className="solicitud-exito">
            <CheckCircle2 size={46} color="#f5c400" />
            <h3>¡Solicitud enviada!</h3>
            <p>
              Gracias{datos.nombre ? `, ${datos.nombre}` : ''}. Un asesor de Grupo Leones se
              pondrá en contacto contigo muy pronto.
            </p>
            <button className="btn-buscar" onClick={cerrar}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h3 className="solicitud-titulo">{TITULOS[tipo]}</h3>

            {(proyecto || lote) && (
              <p className="solicitud-referencia">
                {proyecto?.nombre}
                {lote ? ` · Lote ${lote.codigo} (${lote.manzana})` : ''}
              </p>
            )}

            <form className="solicitud-form" onSubmit={enviar}>
              <div className="solicitud-grid">
                <input
                  required
                  placeholder="Nombre"
                  value={datos.nombre}
                  onChange={actualizarCampo('nombre')}
                />
                <input
                  required
                  placeholder="Apellido"
                  value={datos.apellido}
                  onChange={actualizarCampo('apellido')}
                />
                <input
                  required
                  placeholder="DNI"
                  value={datos.dni}
                  onChange={actualizarCampo('dni')}
                />
                <input
                  required
                  type="tel"
                  placeholder="Teléfono"
                  value={datos.telefono}
                  onChange={actualizarCampo('telefono')}
                />
                <input
                  required
                  type="email"
                  className="solicitud-span-2"
                  placeholder="Correo electrónico"
                  value={datos.correo}
                  onChange={actualizarCampo('correo')}
                />

                {esVisita && (
                  <>
                    <input
                      required
                      type="date"
                      placeholder="Fecha"
                      value={datos.fecha}
                      onChange={actualizarCampo('fecha')}
                    />
                    <input
                      required
                      type="time"
                      placeholder="Hora"
                      value={datos.hora}
                      onChange={actualizarCampo('hora')}
                    />
                  </>
                )}

                <textarea
                  className="solicitud-span-2"
                  placeholder="Mensaje (opcional)"
                  rows={3}
                  value={datos.mensaje}
                  onChange={actualizarCampo('mensaje')}
                />
              </div>

              {estado === 'error' && <p className="solicitud-error">{error}</p>}

              <button className="btn-buscar solicitud-enviar" type="submit" disabled={estado === 'enviando'}>
                {estado === 'enviando' ? 'Enviando…' : 'Enviar'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default SolicitudForm
