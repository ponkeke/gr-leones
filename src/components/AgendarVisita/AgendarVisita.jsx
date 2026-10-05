import { useRef, useState } from 'react'
import Modal from '../Modal/Modal'
import SelectorAsesor from '../SelectorAsesor/SelectorAsesor'
import Calendario, { MarcaLeyenda } from '../Calendario/Calendario'
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
import { useContactoDeSesion } from '../Solicitud/useContactoDeSesion'
import {
  validarNombre,
  validarCelular,
  validarCorreo,
  propsDeCampo,
  enfocarPrimerError,
  etiquetaLote,
  ERROR_ASESOR,
} from '../Solicitud/utilidades'
import { crearVisita, getFechasDisponibles, getHorariosVisita } from '../../services/api'
import { formatearFechaConDia, formatearHora } from '../../utils/formato'

const CAMPOS_INICIALES = { nombre: '', celular: '', correo: '', fecha: '', hora: '' }
const SIN_FECHAS = { estado: 'sin-asesor', lista: [], desde: null, hasta: null } // 'sin-asesor' | 'cargando' | 'listo' | 'error'
const SIN_HORARIOS = { estado: 'sin-fecha', lista: [] } // 'sin-fecha' | 'cargando' | 'listo' | 'error'

/**
 * "Agendar visita": el cliente elige asesor, luego uno de los días en que ese asesor atiende
 * (`getFechasDisponibles`) y uno de sus horarios libres (`getHorariosVisita`); revisa el resumen y
 * confirma. `crearVisita` vuelve a validar el horario: si otra persona lo reservó mientras tanto,
 * se pide otro sin perder lo escrito.
 */
function AgendarVisita({ isOpen, ...props }) {
  if (!isOpen) return null
  return <FormularioVisita {...props} />
}

function FormularioVisita({ onClose, onVolver = onClose, textoVolver, proyecto, lote }) {
  const { asesores, estado: estadoAsesores } = useAsesores()
  const [datos, setDatos] = useState(CAMPOS_INICIALES)
  const [asesorId, setAsesorId] = useState(null)
  const [fechas, setFechas] = useState(SIN_FECHAS)
  const [horarios, setHorarios] = useState(SIN_HORARIOS)
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('editando') // 'editando' | 'revisando' | 'enviando' | 'exito'
  const [errorEnvio, setErrorEnvio] = useState(null)
  const formularioRef = useRef(null)
  const consultaFechas = useRef(0)
  const consultaHorarios = useRef(0)
  const camposBase = useContactoDeSesion(CAMPOS_INICIALES, setDatos)

  const asesor = asesores.find((a) => a.id === asesorId)
  const hayCambios = asesorId !== null || Object.keys(camposBase).some((c) => datos[c] !== camposBase[c])
  const ubicacion = proyecto?.ubicacion ?? 'Por confirmar con tu asesor'

  const cambiar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: null }))
  }

  // Solo se guarda la respuesta de la última consulta (el cliente pudo cambiar de asesor o de día).
  const cargarFechas = (id) => {
    const consulta = ++consultaFechas.current
    setFechas({ ...SIN_FECHAS, estado: 'cargando' })
    getFechasDisponibles(id)
      .then(({ fechas: lista, desde, hasta }) => {
        if (consulta === consultaFechas.current) setFechas({ estado: 'listo', lista, desde, hasta })
      })
      .catch(() => {
        if (consulta === consultaFechas.current) setFechas({ ...SIN_FECHAS, estado: 'error' })
      })
  }

  const cargarHorarios = (id, fecha) => {
    const consulta = ++consultaHorarios.current
    setHorarios({ estado: 'cargando', lista: [] })
    getHorariosVisita({ asesorId: id, fecha })
      .then((lista) => {
        if (consulta === consultaHorarios.current) setHorarios({ estado: 'listo', lista })
      })
      .catch(() => {
        if (consulta === consultaHorarios.current) setHorarios({ estado: 'error', lista: [] })
      })
  }

  // Otro asesor = otra agenda: se descartan día y hora (los datos de contacto se conservan).
  const elegirAsesor = (id) => {
    setErrores((prev) => ({ ...prev, asesor: null, fecha: null, hora: null }))
    if (id === asesorId) return
    setAsesorId(id)
    setDatos((prev) => ({ ...prev, fecha: '', hora: '' }))
    consultaHorarios.current++
    setHorarios(SIN_HORARIOS)
    cargarFechas(id)
  }

  const cambiarFecha = (fecha) => {
    setDatos((prev) => ({ ...prev, fecha, hora: '' }))
    setErrores((prev) => ({ ...prev, fecha: null, hora: null }))
    cargarHorarios(asesorId, fecha)
  }

  // Lleva al paso indicado. Si el formulario se está volviendo a mostrar (tras la revisión), espera
  // unos cuadros a que exista.
  const irA = (id, intentos = 10) => {
    requestAnimationFrame(() => {
      const destino = formularioRef.current?.querySelector(`#${id}`)
      if (!destino) {
        if (intentos > 0) irA(id, intentos - 1)
        return
      }
      destino.scrollIntoView({ behavior: 'smooth', block: 'center' })
      destino.focus({ preventScroll: true })
    })
  }

  const elegirOtraFecha = () => {
    setDatos((prev) => ({ ...prev, fecha: '', hora: '' }))
    consultaHorarios.current++
    setHorarios(SIN_HORARIOS)
    irA('visita-fecha')
  }

  const elegirOtroAsesor = () => irA('visita-asesor')

  const revisar = (evento) => {
    evento.preventDefault()

    const nuevosErrores = {
      nombre: validarNombre(datos.nombre),
      celular: validarCelular(datos.celular),
      correo: validarCorreo(datos.correo),
      asesor: asesorId ? null : ERROR_ASESOR,
      fecha: asesorId && !datos.fecha ? 'Elige el día de tu visita.' : null,
      hora: datos.fecha && !datos.hora ? 'Elige un horario para tu visita.' : null,
    }
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some(Boolean)) {
      enfocarPrimerError(formularioRef.current)
      return
    }
    setErrorEnvio(null)
    setEstado('revisando')
  }

  const confirmar = async () => {
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
    } catch (error) {
      if (error.codigo !== 'HORARIO_NO_DISPONIBLE') {
        setEstado('revisando')
        setErrorEnvio('No pudimos registrar tu visita. Revisa tu conexión e inténtalo nuevamente.')
        return
      }
      // El horario se ocupó mientras el cliente revisaba: vuelve al formulario con todo lo que
      // escribió, la agenda actualizada y el aviso en el paso de horarios.
      setDatos((prev) => ({ ...prev, hora: '' }))
      setErrores({ hora: error.message })
      setEstado('editando')
      cargarFechas(asesorId)
      cargarHorarios(asesorId, datos.fecha)
      irA('visita-horarios')
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

  if (estado === 'revisando' || estado === 'enviando') {
    return (
      <Modal
        titulo="Confirma tu visita"
        descripcion="Revisa los datos antes de confirmar."
        onCerrar={onClose}
        cerrarAlClicFuera={false}
      >
        <div className="solicitud-revision">
          <ListaDatos
            titulo="Confirmar visita"
            variante="resumen"
            filas={[
              { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
              { etiqueta: 'Lote', valor: etiquetaLote(lote) },
              { etiqueta: 'Asesor', valor: asesor?.nombre },
              { etiqueta: 'Fecha', valor: formatearFechaConDia(datos.fecha) },
              { etiqueta: 'Hora', valor: formatearHora(datos.hora) },
              {
                etiqueta: 'Datos de contacto',
                valor: [datos.nombre.trim(), datos.celular.trim()].filter(Boolean).join(' · '),
                ancho: true,
              },
            ]}
          />
          {errorEnvio && (
            <p className="solicitud-error-envio" role="alert">
              {errorEnvio}
            </p>
          )}
          <button type="button" className="solicitud-boton" disabled={estado === 'enviando'} onClick={confirmar}>
            {estado === 'enviando' ? 'Agendando…' : 'Confirmar visita'}
          </button>
          <button
            type="button"
            className="solicitud-boton-secundario"
            disabled={estado === 'enviando'}
            onClick={() => setEstado('editando')}
          >
            Volver y modificar
          </button>
        </div>
      </Modal>
    )
  }

  // Horarios libres por día (solo vienen los días con al menos uno).
  const libresPorFecha = new Map(fechas.lista.map((f) => [f.fecha, f.libres]))
  const hayHorarioLibre = horarios.lista.some((h) => h.disponible)
  const cantidadLibres = horarios.lista.filter((h) => h.disponible).length
  const textoLibres = (n) => `${n} ${n === 1 ? 'horario libre' : 'horarios libres'}`
  const opcionesHora = horarios.lista.map(({ hora, disponible }) => ({
    value: hora,
    deshabilitada: !disponible,
    label: disponible ? (
      formatearHora(hora)
    ) : (
      <>
        <s>{formatearHora(hora)}</s>
        <small>No disponible</small>
      </>
    ),
  }))

  return (
    <Modal
      titulo="Agenda tu visita"
      descripcion="Conoce el proyecto personalmente y recibe atención de un asesor comercial."
      onCerrar={onClose}
      cerrarAlClicFuera={!hayCambios}
    >
      <form ref={formularioRef} className="solicitud-form" onSubmit={revisar} noValidate>
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

        <Seccion
          paso="2"
          titulo="¿Con qué asesor deseas realizar tu visita?"
          descripcion="El asesor que elijas te acompañará en la visita. Verás solo los días y horarios en que puede atenderte."
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

        <Seccion paso="3" titulo="¿Qué día te gustaría visitar el proyecto?">
          {fechas.estado === 'sin-asesor' && (
            <p className="solicitud-mensaje-suave">Primero elige el asesor que te acompañará.</p>
          )}
          {fechas.estado === 'cargando' && <p className="solicitud-mensaje-suave">Buscando fechas disponibles…</p>}
          {fechas.estado === 'error' && (
            <p className="solicitud-error-campo">No pudimos cargar las fechas. Vuelve a elegir el asesor.</p>
          )}
          {fechas.estado === 'listo' && fechas.lista.length === 0 && (
            <SinHorarios
              mensaje={`${asesor?.nombre ?? 'Este asesor'} no tiene horarios disponibles por ahora.`}
              onOtroAsesor={elegirOtroAsesor}
            />
          )}
          {fechas.estado === 'listo' && fechas.lista.length > 0 && (
            <>
              <Calendario
                key={asesorId}
                id="visita-fecha"
                etiqueta="Fecha de la visita"
                desde={fechas.desde}
                hasta={fechas.hasta}
                seleccionada={datos.fecha}
                onSeleccionar={cambiarFecha}
                invalido={Boolean(errores.fecha)}
                infoDia={(fecha) =>
                  libresPorFecha.has(fecha)
                    ? { habilitado: true, tipo: 'disponible', detalle: textoLibres(libresPorFecha.get(fecha)) }
                    : { habilitado: false, tipo: 'sin-disponibilidad', detalle: 'Sin horarios disponibles' }
                }
                leyenda={
                  <>
                    <MarcaLeyenda tipo="disponible">Disponible</MarcaLeyenda>
                    <MarcaLeyenda tipo="sin-disponibilidad">Sin disponibilidad</MarcaLeyenda>
                    <MarcaLeyenda tipo="seleccionado">Tu elección</MarcaLeyenda>
                  </>
                }
              />
              <p className="solicitud-ayuda">
                {datos.fecha
                  ? `Elegiste el ${formatearFechaConDia(datos.fecha)}.`
                  : `Solo puedes elegir los días resaltados: son los días en que ${asesor?.nombre ?? 'el asesor'} tiene horarios libres.`}
              </p>
            </>
          )}
          {errores.fecha && (
            <small id="visita-fecha-error" className="solicitud-error-campo">{errores.fecha}</small>
          )}
        </Seccion>

        <Seccion paso="4" titulo="Selecciona un horario disponible">
          <div id="visita-horarios" tabIndex={-1} className="solicitud-seccion">
            {horarios.estado === 'sin-fecha' && (
              <p className="solicitud-mensaje-suave">Primero elige el día de tu visita.</p>
            )}
            {horarios.estado === 'cargando' && <p className="solicitud-mensaje-suave">Buscando horarios…</p>}
            {horarios.estado === 'error' && (
              <p className="solicitud-error-campo">No pudimos cargar los horarios. Vuelve a elegir la fecha.</p>
            )}
            {horarios.estado === 'listo' && !hayHorarioLibre && (
              <SinHorarios
                mensaje="Este asesor no tiene horarios disponibles para esta fecha."
                onOtraFecha={elegirOtraFecha}
                onOtroAsesor={elegirOtroAsesor}
              />
            )}
            {horarios.estado === 'listo' && hayHorarioLibre && (
              <p className="solicitud-resumen-horarios">
                {formatearFechaConDia(datos.fecha)}: {textoLibres(cantidadLibres)} de {horarios.lista.length}.
              </p>
            )}
            {horarios.estado === 'listo' && hayHorarioLibre && (
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
            {horarios.estado === 'listo' && hayHorarioLibre && (
              <div className="solicitud-leyenda-horas" aria-hidden="true">
                <span><i className="solicitud-muestra-hora" /> Libre</span>
                <span><i className="solicitud-muestra-hora solicitud-muestra-ocupada" /> No disponible</span>
                <span><i className="solicitud-muestra-hora solicitud-muestra-elegida" /> Tu elección</span>
              </div>
            )}
            {errores.hora && (
              <small id="visita-hora-error" className="solicitud-error-campo" role="alert">{errores.hora}</small>
            )}
          </div>
        </Seccion>

        <ListaDatos
          titulo="Resumen de tu visita"
          variante="resumen"
          filas={[
            { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
            { etiqueta: 'Lote', valor: etiquetaLote(lote) },
            { etiqueta: 'Asesor', valor: asesor?.nombre, pendiente: 'Sin elegir' },
            { etiqueta: 'Fecha', valor: formatearFechaConDia(datos.fecha), pendiente: 'Sin elegir' },
            { etiqueta: 'Hora', valor: formatearHora(datos.hora), pendiente: 'Sin elegir' },
            {
              etiqueta: 'Datos de contacto',
              valor: [datos.nombre.trim(), datos.celular.trim()].filter(Boolean).join(' · '),
              pendiente: 'Sin completar',
              ancho: true,
            },
          ]}
        />

        <BotonEnviar texto="Revisar y confirmar" enviando={false} errorEnvio={null} />
      </form>
    </Modal>
  )
}

/** Aviso cuando no hay horarios, con salidas que no borran lo que el cliente ya escribió. */
function SinHorarios({ mensaje, onOtraFecha, onOtroAsesor }) {
  return (
    <div className="solicitud-sin-horarios" role="status">
      <p>{mensaje}</p>
      <div className="solicitud-sin-horarios-acciones">
        {onOtraFecha && (
          <button type="button" className="solicitud-boton-secundario" onClick={onOtraFecha}>
            Elegir otra fecha
          </button>
        )}
        <button type="button" className="solicitud-boton-secundario" onClick={onOtroAsesor}>
          Elegir otro asesor
        </button>
      </div>
    </div>
  )
}

export default AgendarVisita
