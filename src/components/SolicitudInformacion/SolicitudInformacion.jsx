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
  filasDelLote,
  etiquetaLote,
  ERROR_ASESOR,
} from '../Solicitud/utilidades'
import { crearSolicitud } from '../../services/api'

const MOTIVOS = [
  'Precio y formas de pago',
  'Disponibilidad del lote',
  'Ubicación y cómo llegar',
  'Características del proyecto',
  'Financiamiento',
  'Otro',
].map((motivo) => ({ value: motivo, label: motivo }))

const CAMPOS_INICIALES = { nombre: '', celular: '', correo: '', motivo: '', mensaje: '' }

/**
 * "Solicitar información": para quien todavía está averiguando. Pide solo lo mínimo para que un
 * asesor pueda contactarlo (nombre y celular); el proyecto/lote llega solo, sin reescribirlo.
 */
function SolicitudInformacion({ isOpen, ...props }) {
  if (!isOpen) return null
  return <FormularioInformacion {...props} />
}

function FormularioInformacion({ onClose, onVolver = onClose, textoVolver, proyecto, lote }) {
  const { asesores, estado: estadoAsesores } = useAsesores()
  const [datos, setDatos] = useState(CAMPOS_INICIALES)
  const [asesorId, setAsesorId] = useState(null)
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('editando') // 'editando' | 'enviando' | 'exito'
  const [errorEnvio, setErrorEnvio] = useState(null)
  const formularioRef = useRef(null)

  const asesor = asesores.find((a) => a.id === asesorId)
  const hayCambios = asesorId !== null || Object.keys(CAMPOS_INICIALES).some((c) => datos[c] !== CAMPOS_INICIALES[c])

  const cambiar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: null }))
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
      await crearSolicitud({
        tipo: 'informacion',
        proyectoId: proyecto?.id ?? null,
        proyectoNombre: proyecto?.nombre ?? null,
        loteId: lote?.id ?? null,
        loteCodigo: lote?.codigo ?? null,
        asesorId,
        nombre: datos.nombre.trim(),
        celular: datos.celular.trim(),
        correo: datos.correo.trim(),
        motivo: datos.motivo || null,
        mensaje: datos.mensaje.trim(),
      })
      setEstado('exito')
    } catch {
      setEstado('editando')
      setErrorEnvio('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo nuevamente.')
    }
  }

  if (estado === 'exito') {
    return (
      <Modal titulo="¡Solicitud enviada!" descripcion="Tu consulta fue registrada correctamente." onCerrar={onClose}>
        <Confirmacion
          mensajes={['El asesor seleccionado se pondrá en contacto contigo.']}
          filas={[
            { etiqueta: 'Asesor asignado', valor: asesor?.nombre, ancho: true },
            { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
            { etiqueta: 'Lote', valor: etiquetaLote(lote) },
          ]}
          textoBoton={textoVolver ?? (lote ? 'Volver al lote' : 'Cerrar')}
          onVolver={onVolver}
        />
      </Modal>
    )
  }

  return (
    <Modal
      titulo="Solicita información"
      descripcion="Déjanos tus datos y un asesor comercial se pondrá en contacto contigo para resolver tus dudas sobre este proyecto o lote."
      onCerrar={onClose}
      cerrarAlClicFuera={!hayCambios}
    >
      <form ref={formularioRef} className="solicitud-form" onSubmit={enviar} noValidate>
        <ListaDatos titulo="Estás consultando por" filas={filasDelLote(proyecto, lote)} />

        <NotaObligatorios />

        <Seccion paso="1" titulo="Tus datos de contacto">
          <div className="solicitud-campos">
            <Campo id="info-nombre" etiqueta="Nombre completo" obligatorio error={errores.nombre} ancho>
              <input
                {...propsDeCampo('info-nombre', errores.nombre)}
                autoComplete="name"
                placeholder="Ej. María Pérez Quispe"
                value={datos.nombre}
                onChange={(e) => cambiar('nombre', e.target.value)}
              />
            </Campo>

            <Campo id="info-celular" etiqueta="Celular" obligatorio error={errores.celular}>
              <input
                {...propsDeCampo('info-celular', errores.celular)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej. 987 654 321"
                value={datos.celular}
                onChange={(e) => cambiar('celular', e.target.value)}
              />
            </Campo>

            <Campo id="info-correo" etiqueta="Correo electrónico" error={errores.correo}>
              <input
                {...propsDeCampo('info-correo', errores.correo)}
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
          titulo="¿Qué deseas consultar?"
          descripcion="Opcional: elige un tema para que tu asesor llegue preparado."
        >
          <GrupoOpciones
            id="info-motivo"
            etiqueta="¿Qué deseas consultar?"
            opciones={MOTIVOS}
            valor={datos.motivo}
            onCambiar={(valor) => cambiar('motivo', valor)}
            permitirQuitar
          />

          <Campo id="info-mensaje" etiqueta="Mensaje adicional">
            <textarea
              id="info-mensaje"
              rows={3}
              placeholder="Escribe aquí cualquier duda o comentario."
              value={datos.mensaje}
              onChange={(e) => cambiar('mensaje', e.target.value)}
            />
          </Campo>
        </Seccion>

        <Seccion
          paso="3"
          titulo="Elige a tu asesor"
          descripcion="Elige el asesor que prefieres para que pueda atender tu consulta."
        >
          <SelectorAsesor
            id="info-asesor"
            etiqueta="Asesor que atenderá tu consulta"
            asesores={asesores}
            estado={estadoAsesores}
            seleccionadoId={asesorId}
            onSeleccionar={elegirAsesor}
            error={errores.asesor}
          />
        </Seccion>

        <BotonEnviar
          texto="Solicitar información"
          enviando={estado === 'enviando'}
          errorEnvio={errorEnvio}
          aclaracion="Un asesor se pondrá en contacto contigo."
        />
      </form>
    </Modal>
  )
}

export default SolicitudInformacion
