// Estados válidos de un lote. Mismos valores y colores que usará más adelante el geovisor
// (PostgreSQL: columna `estado` de la tabla `lotes`), para que ambos sistemas se vean iguales.
export const ESTADOS_LOTE = [
  { value: 'DISPONIBLE', label: 'Disponible', color: '#22c55e' },
  { value: 'RESERVADO', label: 'Reservado', color: '#f59e0b' },
  { value: 'SEPARADO', label: 'Separado', color: '#3b82f6' },
  { value: 'VENDIDO', label: 'Vendido', color: '#6b7280' },
]

export const ESTADO_COLOR = Object.fromEntries(ESTADOS_LOTE.map((e) => [e.value, e.color]))
export const ESTADO_LABEL = Object.fromEntries(ESTADOS_LOTE.map((e) => [e.value, e.label]))
