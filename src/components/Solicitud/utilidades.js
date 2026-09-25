// Validaciones y ayudas compartidas por los tres formularios (información, cotización y visita).
// Los mensajes están pensados para alguien que entra por primera vez: dicen qué falta y cómo
// corregirlo, sin términos internos.
import { formatearLote, formatearPrecio } from '../../utils/formato'

export function validarNombre(valor) {
  if (valor.trim().length < 3) return 'Escribe tu nombre completo.'
  return null
}

/** Celular peruano: 9 dígitos que empiezan con 9. Acepta espacios, guiones y el prefijo +51. */
export function validarCelular(valor) {
  const digitos = valor.replace(/[\s-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '')
  if (!digitos) return 'Escribe tu número de celular para que tu asesor pueda contactarte.'
  if (!/^9\d{8}$/.test(digitos)) return 'Revisa tu celular: debe tener 9 dígitos y empezar con 9.'
  return null
}

/** El correo es opcional: solo se valida si se escribió algo. */
export function validarCorreo(valor) {
  if (!valor.trim()) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) return 'Revisa tu correo, por ejemplo: nombre@correo.com'
  return null
}

export const TIPOS_DOCUMENTO = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'Carné de extranjería' },
]

export function validarDocumento(tipo, numero) {
  const valor = numero.trim()
  if (!valor) return 'Escribe tu número de documento.'
  if (tipo === 'DNI' && !/^\d{8}$/.test(valor)) return 'El DNI tiene 8 dígitos.'
  if (tipo === 'RUC' && !/^\d{11}$/.test(valor)) return 'El RUC tiene 11 dígitos.'
  if (tipo === 'CE' && !/^[A-Za-z0-9]{8,12}$/.test(valor)) return 'El carné de extranjería tiene entre 8 y 12 caracteres.'
  return null
}

export const ERROR_ASESOR = 'Elige un asesor para continuar.'

/** Props de accesibilidad de un campo: marca el error y lo enlaza con su mensaje. */
export function propsDeCampo(id, error) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

/** Tras un envío con errores, lleva al usuario al primero (también en móvil, con el teclado abierto). */
export function enfocarPrimerError(formulario) {
  requestAnimationFrame(() => {
    const campo = formulario?.querySelector('[aria-invalid="true"]')
    if (!campo) return
    campo.scrollIntoView({ behavior: 'smooth', block: 'center' })
    campo.focus({ preventScroll: true })
  })
}

/** Filas con los datos del lote que el cliente ya eligió (no los vuelve a escribir). */
export function filasDelLote(proyecto, lote, { conPrecio = false } = {}) {
  const filas = [{ etiqueta: 'Proyecto', valor: proyecto?.nombre, ancho: true }]
  if (!lote) return filas

  filas.push(
    { etiqueta: 'Manzana', valor: lote.manzana },
    { etiqueta: 'Lote', valor: String(lote.numero).padStart(2, '0') },
    { etiqueta: 'Área', valor: `${lote.area_m2} m²` },
  )
  // Solo si el precio existe: nunca se muestra un precio inventado.
  if (conPrecio && lote.precio_total !== null && lote.precio_total !== undefined) {
    filas.push({ etiqueta: 'Precio de lista', valor: formatearPrecio(lote.precio_total) })
  }
  return filas
}

/** "MZ A - 07" o null si la solicitud no viene de un lote concreto. */
export function etiquetaLote(lote) {
  return lote ? formatearLote(lote) : null
}
