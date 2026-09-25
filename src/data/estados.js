// Estados válidos de un lote. Mismos valores y colores que usará más adelante el geovisor
// (PostgreSQL: columna `estado` de la tabla `lotes`), para que ambos sistemas se vean iguales.
export const ESTADOS_LOTE = [
  { value: 'DISPONIBLE', label: 'Disponible', color: '#6dc560' },
  { value: 'RESERVADO', label: 'Reservado', color: '#bdbdbd' },
  { value: 'SEPARADO', label: 'Separado', color: '#f5dd2b' },
  { value: 'VENDIDO', label: 'Vendido', color: '#fb4e4e' },
]

export const ESTADO_COLOR = Object.fromEntries(ESTADOS_LOTE.map((e) => [e.value, e.color]))
export const ESTADO_LABEL = Object.fromEntries(ESTADOS_LOTE.map((e) => [e.value, e.label]))
