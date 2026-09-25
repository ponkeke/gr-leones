import { useRef, useState } from 'react'
import Modal from '../Modal/Modal'
import SelectorAsesor from '../SelectorAsesor/SelectorAsesor'
import { Seccion, Campo, NotaObligatorios, ListaDatos, BotonEnviar, Confirmacion } from '../Solicitud/PartesSolicitud'
import { useAsesores } from '../Solicitud/useAsesores'
import {
  TIPOS_DOCUMENTO,
  validarDocumento,
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
import { formatearPrecio, formatearSoles } from '../../utils/formato'

const CAMPOS_INICIALES = {
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  nombre: '',
  direccion: '',
  celular: '',
  correo: '',
}

/**
 * "Solicitar cotización": para quien ya quiere el precio formal de un lote. Los datos del lote
 * (proyecto, manzana, lote, área y precio de lista si existe) llegan solos. `simulacion` es
 * opcional y solo llega desde el Simulador de costos. La cotización queda asociada a UN asesor.
 */
function SolicitudCotizacion({ isOpen, ...props }) {
  if (!isOpen) return null
  return <FormularioCotizacion {...props} />
}

function FormularioCotizacion({ onClose, onVolver = onClose, textoVolver, proyecto, lote, simulacion }) {
  const { asesores, estado: estadoAsesores } = useAsesores()
  const [datos, setDatos] = useState(CAMPOS_INICIALES)
  const [asesorId, setAsesorId] = useState(null)
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('editando') // 'editando' | 'enviando' | 'exito'
  const [errorEnvio, setErrorEnvio] = useState(null)
  const formularioRef = useRef(null)

  const asesor = asesores.find((a) => a.id === asesorId)
  const hayCambios = asesorId !== null || Object.keys(CAMPOS_INICIALES).some((c) => datos[c] !== CAMPOS_INICIALES[c])
  const esEmpresa = datos.tipoDocumento === 'RUC'
  const tienePrecio = lote?.precio_total !== null && lote?.precio_total !== undefined

  const cambiar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: null }))
  }

  const cambiarTipoDocumento = (valor) => {
    setDatos((prev) => ({ ...prev, tipoDocumento: valor }))
    setErrores((prev) => ({ ...prev, numeroDocumento: null }))
  }

  const elegirAsesor = (id) => {
    setAsesorId(id)
    setErrores((prev) => ({ ...prev, asesor: null }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()

    const nuevosErrores = {
      numeroDocumento: validarDocumento(datos.tipoDocumento, datos.numeroDocumento),
      nombre: esEmpresa && !datos.nombre.trim() ? 'Escribe la razón social.' : validarNombre(datos.nombre),
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
        tipo: 'cotizacion',
        proyectoId: proyecto?.id ?? null,
        proyectoNombre: proyecto?.nombre ?? null,
        loteId: lote?.id ?? null,
        loteCodigo: lote?.codigo ?? null,
        simulacion: simulacion ?? null,
        asesorId,
        tipoDocumento: datos.tipoDocumento,
        numeroDocumento: datos.numeroDocumento.trim(),
        nombre: datos.nombre.trim(),
        direccion: datos.direccion.trim(),
        celular: datos.celular.trim(),
        correo: datos.correo.trim(),
      })
      setEstado('exito')
    } catch {
      setEstado('editando')
      setErrorEnvio('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo nuevamente.')
    }
  }

  if (estado === 'exito') {
    return (
      <Modal titulo="Solicitud de cotización enviada" onCerrar={onClose}>
        <Confirmacion
          mensajes={['Un asesor comercial revisará tu solicitud y se pondrá en contacto contigo.']}
          filas={[
            { etiqueta: 'Asesor asignado', valor: asesor?.nombre, ancho: true },
            { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
            { etiqueta: 'Lote', valor: etiquetaLote(lote) },
            { etiqueta: 'Área', valor: lote ? `${lote.area_m2} m²` : null },
          ]}
          textoBoton={textoVolver ?? (lote ? 'Volver al lote' : 'Cerrar')}
          onVolver={onVolver}
        />
      </Modal>
    )
  }

  return (
    <Modal
      titulo="Solicita tu cotización"
      descripcion="Completa tus datos para solicitar una cotización del lote que estás consultando."
      onCerrar={onClose}
      cerrarAlClicFuera={!hayCambios}
    >
      <form ref={formularioRef} className="solicitud-form" onSubmit={enviar} noValidate>
        <ListaDatos titulo="Lote que estás cotizando" filas={filasDelLote(proyecto, lote, { conPrecio: true })} />

        {simulacion && (
          <ListaDatos
            titulo="Tu simulación (referencial)"
            filas={[
              { etiqueta: 'Inicial', valor: formatearSoles(simulacion.inicial) },
              { etiqueta: 'Cuotas', valor: String(simulacion.cuotas) },
              { etiqueta: 'Cuota estimada', valor: formatearSoles(simulacion.cuotaEstimada) },
            ]}
          />
        )}

        <NotaObligatorios />

        <Seccion
          paso="1"
          titulo="Tus datos"
          descripcion="Los usamos para preparar la cotización a tu nombre."
        >
          <div className="solicitud-campos">
            <Campo id="cotiz-tipo-documento" etiqueta="Tipo de documento" obligatorio>
              <select
                id="cotiz-tipo-documento"
                value={datos.tipoDocumento}
                onChange={(e) => cambiarTipoDocumento(e.target.value)}
              >
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </Campo>

            <Campo id="cotiz-documento" etiqueta="Número de documento" obligatorio error={errores.numeroDocumento}>
              <input
                {...propsDeCampo('cotiz-documento', errores.numeroDocumento)}
                inputMode={datos.tipoDocumento === 'CE' ? 'text' : 'numeric'}
                maxLength={datos.tipoDocumento === 'RUC' ? 11 : datos.tipoDocumento === 'DNI' ? 8 : 12}
                placeholder={datos.tipoDocumento === 'RUC' ? '11 dígitos' : datos.tipoDocumento === 'DNI' ? '8 dígitos' : 'Número del carné'}
                value={datos.numeroDocumento}
                onChange={(e) => cambiar('numeroDocumento', e.target.value)}
              />
            </Campo>

            <Campo
              id="cotiz-nombre"
              etiqueta={esEmpresa ? 'Razón social' : 'Nombre completo'}
              obligatorio
              error={errores.nombre}
              ancho
            >
              <input
                {...propsDeCampo('cotiz-nombre', errores.nombre)}
                autoComplete={esEmpresa ? 'organization' : 'name'}
                placeholder={esEmpresa ? 'Nombre de la empresa' : 'Ej. María Pérez Quispe'}
                value={datos.nombre}
                onChange={(e) => cambiar('nombre', e.target.value)}
              />
            </Campo>

            <Campo id="cotiz-direccion" etiqueta="Dirección" ancho>
              <input
                id="cotiz-direccion"
                autoComplete="street-address"
                placeholder="Av., calle, número, distrito"
                value={datos.direccion}
                onChange={(e) => cambiar('direccion', e.target.value)}
              />
            </Campo>

            <Campo id="cotiz-celular" etiqueta="Celular" obligatorio error={errores.celular}>
              <input
                {...propsDeCampo('cotiz-celular', errores.celular)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej. 987 654 321"
                value={datos.celular}
                onChange={(e) => cambiar('celular', e.target.value)}
              />
            </Campo>

            <Campo id="cotiz-correo" etiqueta="Correo electrónico" error={errores.correo}>
              <input
                {...propsDeCampo('cotiz-correo', errores.correo)}
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
          titulo="¿Con qué asesor deseas gestionar tu cotización?"
          descripcion="Tu cotización quedará a cargo del asesor que elijas."
        >
          <SelectorAsesor
            id="cotiz-asesor"
            etiqueta="Asesor que gestionará tu cotización"
            asesores={asesores}
            estado={estadoAsesores}
            seleccionadoId={asesorId}
            onSeleccionar={elegirAsesor}
            error={errores.asesor}
          />
        </Seccion>

        <ListaDatos
          titulo="Resumen de tu solicitud"
          variante="resumen"
          filas={[
            { etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true },
            { etiqueta: 'Lote', valor: etiquetaLote(lote) },
            { etiqueta: 'Área', valor: lote ? `${lote.area_m2} m²` : null },
            { etiqueta: 'Precio de lista', valor: tienePrecio ? formatearPrecio(lote.precio_total) : null },
            { etiqueta: 'Asesor', valor: asesor?.nombre, pendiente: 'Sin elegir' },
          ]}
        />

        <BotonEnviar
          texto="Solicitar cotización"
          enviando={estado === 'enviando'}
          errorEnvio={errorEnvio}
          aclaracion="Tu asesor revisará tu solicitud y se pondrá en contacto contigo."
        />
      </form>
    </Modal>
  )
}

export default SolicitudCotizacion
