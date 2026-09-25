import { formatearLote } from '../../utils/formato'

/** "María López" -> "ML". */
export function iniciales(nombre) {
  return String(nombre ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
}

/** Primer nombre, con la primera letra en mayúscula: "ROMELY SCHIPPER" -> "Romely". */
export function primerNombre(nombre) {
  const primero = String(nombre ?? '').trim().split(/\s+/)[0] ?? ''
  return primero.charAt(0).toUpperCase() + primero.slice(1).toLowerCase()
}

/** Registro enriquecido por `services/api.js` ({ lote, loteCodigo }) -> "MZ A - 03". */
export function textoLote(registro) {
  return registro?.lote ? formatearLote(registro.lote) : registro?.loteCodigo ?? '—'
}

/** Nombre del proyecto del registro, con la capitalización de la tarjeta pública. */
export function textoProyecto(registro) {
  return registro?.proyecto?.nombre ?? '—'
}

/** Enlaces de ejemplo del equipo (wa.me/51XXXX…, instagram.com/...) se tratan como pendientes. */
export function esEnlacePendiente(url) {
  return !url || /X{3,}|\.\.\.|dominio\.com/i.test(url)
}
