import { useRef, useState } from 'react'
import Modal from '../Modal/Modal'
import SelectorAsesor from '../SelectorAsesor/SelectorAsesor'
import {
  Seccion,
  Campo,
  NotaObligatorios,
  GrupoOpciones,
  ListaDatos,
  BotonEnviar,
  Confirmacion,
} from '../Solicitud/PartesSolicitud'
import { useAsesores } from '../Solicitud/useAsesores'
import {
  validarNombre,
  validarCelular,
  validarCorreo,
  propsDeCampo,
  enfocarPrimerError,
  etiquetaLote,
  ERROR_ASESOR,
} from '../Solicitud/utilidades'
import { crearVisita, getHorariosVisita } from '../../services/api'
import { fechaLocalISO, formatearFechaConDia, formatearHora } from '../../utils/formato'

const CAMPOS_INICIALES = { nombre: '', celular: '', correo: '', fecha: '', hora: '' }

/**
 * "Agendar visita": el cliente elige qué día y a qué hora quiere conocer el proyecto y con qué
 * asesor. Los horarios se piden a `getHorariosVisita` (hoy MOCK, luego disponibilidad real de la
 * base de datos) solo después de elegir el día. No se permiten fechas pasadas.
 */
function AgendarVisita({ isOpen, ...props }) {
  if (!isOpen) return null
  return <FormularioVisita {...props} />
}

function FormularioVisita({ onClose, onVolver = onClose, textoVolver, proyecto, lote }) {
  const { asesores, estado: estadoAsesores } = useAsesores()
  const [datos, setDatos] = useState(CAMPOS_INICIALES)
  const [asesorId, setAsesorId] = useState(null)
  const [horarios, setHorarios] = useState({ estado: 'sin-fecha', lista: [] }) // 'sin-fecha' | 'cargando' | 'listo' | 'error'
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('editando') // 'editando' | 'enviando' | 'exito'
  const [errorEnvio, setErrorEnvio] = useState(null)
  const formularioRef = useRef(null)
  const consultaHorarios = useRef(0)

  // Se calcula al abrir el formulario: basta para bloquear días pasados en el calendario.
  const [hoy] = useState(fechaLocalISO)

  const asesor = asesores.find((a) => a.id === asesorId)
  const hayCambios = asesorId !== null || Object.keys(CAMPOS_INICIALES).some((c) => datos[c] !== CAMPOS_INICIALES[c])
  const ubicacion = proyecto?.ubicacion ?? 'Por confirmar con tu asesor'

  const cambiar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: null }))
  }

  // Al cambiar el día se descarta la hora elegida y se piden los horarios de ese día.
  const cambiarFecha = (fecha) => {
    setDatos((prev) => ({ ...prev, fecha, hora: '' }))
    setErrores((prev) => ({ ...prev, fecha: null, hora: null }))

    const consulta = ++consultaHorarios.current

    if (!fecha || fecha < hoy) {
      setHorarios({ estado: 'sin-fecha', lista: [] })
      if (fecha) setErrores((prev) => ({ ...prev, fecha: 'Elige una fecha de hoy en adelante.' }))
      return
    }

    setHorarios({ estado: 'cargando', lista: [] })
    getHorariosVisita({ proyectoId: proyecto?.id ?? null, fecha })
      .then((lista) => {
        if (consulta === consultaHorarios.current) setHorarios({ estado: 'listo', lista })
      })
      .catch(() => {
        if (consulta === consultaHorarios.current) setHorarios({ estado: 'error', lista: [] })
      })
  }

  const elegirAsesor = (id) => {
    setAsesorId(id)
    setErrores((prev) => ({ ...prev, asesor: null }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()

    const nuevosErrores = {
      nombre: validarNombre(datos.nombre),
      celular: validarCelular(datos.celular),
      correo: validarCorreo(datos.correo),
      fecha: !datos.fecha
        ? 'Elige el día de tu visita.'
        : datos.fecha < hoy
          ? 'Elige una fecha de hoy en adelante.'
          : null,
      hora: datos.fecha && datos.fecha >= hoy && !datos.hora ? 'Elige un horario para tu visita.' : null,
      asesor: asesorId ? null : ERROR_ASESOR,
    }
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some(Boolean)) {
      enfocarPrimerError(formularioRef.current)
      return
    }

    setEstado('enviando')
    setErrorEnvio(null)

    try {
      await crearVisita({
        proyectoId: proyecto?.id ?? null,
        proyectoNombre: proyecto?.nombre ?? null,
        loteId: lote?.id ?? null,
        loteCodigo: lote?.codigo ?? null,
        asesorId,
        nombre: datos.nombre.trim(),
        celular: datos.celular.trim(),
        correo: datos.correo.trim(),
        fecha: datos.fecha,
        hora: datos.hora,
      })
      setEstado('exito')
    } catch {
      setEstado('editando')
      setErrorEnvio('No pudimos registrar tu visita. Revisa tu conexión e inténtalo nuevamente.')
    }
  }

  if (estado === 'exito') {
    return (
      <Modal titulo="¡Visita agendada!" descripcion="Tu solicitud de visita fue registrada correctamente." onCerrar={onClose}>
        <Confirmacion
          mensajes={[]}
          filas={[
            { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
            { etiqueta: 'Lote', valor: etiquetaLote(lote) },
            { etiqueta: 'Ubicación', valor: ubicacion },
            { etiqueta: 'Fecha', valor: formatearFechaConDia(datos.fecha) },
            { etiqueta: 'Hora', valor: formatearHora(datos.hora) },
            { etiqueta: 'Asesor', valor: asesor?.nombre, ancho: true },
          ]}
          nota="Te recomendamos guardar estos datos para tu visita."
          textoBoton={textoVolver ?? 'Volver al proyecto'}
          onVolver={onVolver}
        />
      </Modal>
    )
  }

  const opcionesHora = horarios.lista.map((hora) => ({ value: hora, label: formatearHora(hora) }))

  return (
    <Modal
      titulo="Agenda tu visita"
      descripcion="Conoce el proyecto personalmente y recibe atención de un asesor comercial."
      onCerrar={onClose}
      cerrarAlClicFuera={!hayCambios}
    >
      <form ref={formularioRef} className="solicitud-form" onSubmit={enviar} noValidate>
        <ListaDatos
          titulo="Vas a visitar"
          filas={[
            { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
            { etiqueta: 'Lote', valor: etiquetaLote(lote) },
            { etiqueta: 'Ubicación', valor: ubicacion },
          ]}
        />

        <NotaObligatorios />

        <Seccion paso="1" titulo="Tus datos de contacto">
          <div className="solicitud-campos">
            <Campo id="visita-nombre" etiqueta="Nombre completo" obligatorio error={errores.nombre} ancho>
              <input
                {...propsDeCampo('visita-nombre', errores.nombre)}
                autoComplete="name"
                placeholder="Ej. María Pérez Quispe"
                value={datos.nombre}
                onChange={(e) => cambiar('nombre', e.target.value)}
              />
            </Campo>

            <Campo id="visita-celular" etiqueta="Celular" obligatorio error={errores.celular}>
              <input
                {...propsDeCampo('visita-celular', errores.celular)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej. 987 654 321"
                value={datos.celular}
                onChange={(e) => cambiar('celular', e.target.value)}
              />
            </Campo>

            <Campo id="visita-correo" etiqueta="Correo electrónico" error={errores.correo}>
              <input
                {...propsDeCampo('visita-correo', errores.correo)}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                value={datos.correo}
                onChange={(e) => cambiar('correo', e.target.value)}
              />
            </Campo>
          </div>
        </Seccion>

        <Seccion paso="2" titulo="¿Qué día te gustaría visitar el proyecto?">
          <div className="solicitud-campos">
            <Campo id="visita-fecha" etiqueta="Fecha de la visita" obligatorio error={errores.fecha}>
              <input
                {...propsDeCampo('visita-fecha', errores.fecha)}
                type="date"
                min={hoy}
                value={datos.fecha}
                onChange={(e) => cambiarFecha(e.target.value)}
              />
            </Campo>
          </div>
        </Seccion>

        <Seccion paso="3" titulo="Selecciona un horario disponible">
          {horarios.estado === 'sin-fecha' && (
            <p className="solicitud-mensaje-suave">Primero elige el día de tu visita.</p>
          )}
          {horarios.estado === 'cargando' && <p className="solicitud-mensaje-suave">Buscando horarios…</p>}
          {horarios.estado === 'error' && (
            <p className="solicitud-error-campo">No pudimos cargar los horarios. Vuelve a elegir la fecha.</p>
          )}
          {horarios.estado === 'listo' && opcionesHora.length === 0 && (
            <p className="solicitud-mensaje-suave">No quedan horarios disponibles para este día. Elige otra fecha.</p>
          )}
          {horarios.estado === 'listo' && opcionesHora.length > 0 && (
            <GrupoOpciones
              id="visita-hora"
              etiqueta="Horario de la visita"
              opciones={opcionesHora}
              valor={datos.hora}
              onCambiar={(valor) => cambiar('hora', valor)}
              error={errores.hora}
              className="solicitud-horas"
            />
          )}
          {errores.hora && (
            <small id="visita-hora-error" className="solicitud-error-campo">{errores.hora}</small>
          )}
        </Seccion>

        <Seccion
          paso="4"
          titulo="¿Con qué asesor deseas realizar tu visita?"
          descripcion="El asesor que elijas te acompañará en la visita."
        >
          <SelectorAsesor
            id="visita-asesor"
            etiqueta="Asesor que te acompañará en la visita"
            asesores={asesores}
            estado={estadoAsesores}
            seleccionadoId={asesorId}
            onSeleccionar={elegirAsesor}
            error={errores.asesor}
          />
        </Seccion>

        <ListaDatos
          titulo="Resumen de tu visita"
          variante="resumen"
          filas={[
            { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
            { etiqueta: 'Lote', valor: etiquetaLote(lote) },
            { etiqueta: 'Fecha', valor: formatearFechaConDia(datos.fecha), pendiente: 'Sin elegir' },
            { etiqueta: 'Hora', valor: formatearHora(datos.hora), pendiente: 'Sin elegir' },
            { etiqueta: 'Asesor', valor: asesor?.nombre, pendiente: 'Sin elegir' },
            {
              etiqueta: 'Datos de contacto',
              valor: [datos.nombre.trim(), datos.celular.trim()].filter(Boolean).join(' · '),
              pendiente: 'Sin completar',
              ancho: true,
            },
          ]}
        />

        <BotonEnviar
          texto="Confirmar visita"
          textoEnviando="Agendando…"
          enviando={estado === 'enviando'}
          errorEnvio={errorEnvio}
        />
      </form>
    </Modal>
  )
}

export default AgendarVisita
