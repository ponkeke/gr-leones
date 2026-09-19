import { formatearSoles } from './formato'

// Lógica pura del Simulador de Costos (sin React, sin datos): recibe números y devuelve números.
// Así el mismo cálculo se puede probar aparte y, más adelante, reemplazar o validar contra el backend.

const redondear = (valor) => Math.round((valor + Number.EPSILON) * 100) / 100

// Acepta "20000", "20,000" o "20,000.50" (coma solo como separador de miles, punto decimal, máx. 2 decimales).
const FORMATO_MONTO = /^-?(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/

/** Texto del campo -> número. `null` si está vacío, `NaN` si no es un monto válido. */
export function parsearMonto(texto) {
  const limpio = String(texto ?? '').trim()
  if (limpio === '') return null
  if (!FORMATO_MONTO.test(limpio)) return Number.NaN
  return Number(limpio.replace(/,/g, ''))
}

/** Devuelve el mensaje de error para mostrar al usuario, o `null` si los datos son válidos. */
export function validarSimulacion({ precio, inicial, cuotas }) {
  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0) {
    return 'El precio de este lote aún no está confirmado, por eso no se puede simular.'
  }
  if (inicial === null) return 'Ingresa el monto de la inicial (puede ser S/ 0).'
  if (Number.isNaN(inicial)) return 'La inicial debe ser un monto numérico, por ejemplo 20000.'
  if (inicial < 0) return 'La inicial no puede ser negativa.'
  if (inicial > precio) {
    return `La inicial no puede ser mayor que el precio del lote (${formatearSoles(precio)}).`
  }
  if (!Number.isInteger(cuotas) || cuotas <= 0) return 'Selecciona un número de cuotas mayor que 0.'
  return null
}

/**
 * Precio - Inicial = Saldo;  Saldo / N° de cuotas = Cuota estimada.
 * Asume datos ya validados con `validarSimulacion`.
 */
export function calcularSimulacion({ precio, inicial, cuotas }) {
  const saldo = redondear(precio - inicial)

  // PUNTO DE EXTENSIÓN — condiciones reales de la empresa, hoy NO aplicadas:
  // intereses, gastos administrativos, descuentos y promociones modificarían `montoFinanciado`
  // (saldo + cargos - descuentos) antes de dividirlo en cuotas. Mientras no haya datos
  // confirmados, se financia exactamente el saldo.
  const montoFinanciado = saldo

  return {
    precio,
    inicial,
    saldo,
    cuotas,
    cuotaEstimada: redondear(montoFinanciado / cuotas),
    total: redondear(inicial + montoFinanciado),
  }
}
