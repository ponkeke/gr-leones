const TEXTO_PENDIENTE = 'Por confirmar'

/** 85000 -> "S/ 85,000". Devuelve "Por confirmar" mientras el precio sea null. */
export function formatearPrecio(valor) {
  if (valor === null || valor === undefined) return TEXTO_PENDIENTE
  return `S/ ${valor.toLocaleString('es-PE')}`
}

/**
 * Monto en soles para cálculos: 85000 -> "S/ 85,000", 5416.667 -> "S/ 5,416.67".
 * Solo muestra céntimos si el monto los tiene. Devuelve "—" si no es un número válido (nunca NaN).
 */
export function formatearSoles(valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return '—'
  const redondeado = Math.round((valor + Number.EPSILON) * 100) / 100
  const decimales = Number.isInteger(redondeado) ? 0 : 2
  return `S/ ${redondeado.toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}`
}

/** 2026-09-03 -> "03/09/2026" (sin pasar por Date para evitar desfases de zona horaria). */
export function formatearFecha(iso) {
  if (!iso) return ''
  return iso.split('-').reverse().join('/')
}

/** Etiqueta corta para la insignia del proyecto, calculada con sus lotes (no es un dato inventado). */
export function etiquetaDisponibilidad(proyecto) {
  const n = proyecto.lotesDisponibles ?? 0
  if (n === 0) return 'Sin lotes disponibles'
  return `${n} ${n === 1 ? 'lote disponible' : 'lotes disponibles'}`
}

/** Lote -> "MZ A - 07". */
export function formatearLote(lote) {
  if (!lote) return ''
  return `${lote.manzana} - ${String(lote.numero).padStart(2, '0')}`
}

/** "14:00" -> "02:00 PM". */
export function formatearHora(hhmm) {
  if (!hhmm) return ''
  const [horas, minutos] = hhmm.split(':').map(Number)
  const periodo = horas < 12 ? 'AM' : 'PM'
  const horas12 = horas % 12 === 0 ? 12 : horas % 12
  return `${String(horas12).padStart(2, '0')}:${String(minutos).padStart(2, '0')} ${periodo}`
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** 2026-09-24 -> "Jueves 24/09/2026" (fecha local, sin desfase de zona horaria). */
export function formatearFechaConDia(iso) {
  if (!iso) return ''
  const [anio, mes, dia] = iso.split('-').map(Number)
  const diaSemana = DIAS_SEMANA[new Date(anio, mes - 1, dia).getDay()]
  return `${diaSemana} ${formatearFecha(iso)}`
}

/** Fecha local en formato YYYY-MM-DD (toISOString usaría UTC y de noche daría "mañana" en Perú). */
export function fechaLocalISO(fecha = new Date()) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}
