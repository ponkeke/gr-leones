// Catálogos del proceso comercial que usan el área del cliente y la del asesor. Un solo lugar
// para los estados y sus etiquetas, así las dos vistas hablan igual de lo mismo.
//
// `tono` decide el color de la insignia (ver `.panel-estado-*` en `components/areaInterna/Panel.css`):
// 'pendiente' (dorado) | 'proceso' | 'ok' (verde) | 'cancelado' (rojo) | 'neutro' (gris).

// Etapa del cliente en el embudo del asesor, en el orden en que avanza.
// `pasosAsesor` / `pasosCliente`: cuántos pasos de PASOS_ASESOR / PASOS_CLIENTE quedan completos.
export const ETAPAS_CLIENTE = [
  { value: 'NUEVO', label: 'Nuevo', tono: 'pendiente', pasosAsesor: 0, pasosCliente: 0 },
  { value: 'CONTACTADO', label: 'Contactado', tono: 'proceso', pasosAsesor: 1, pasosCliente: 0 },
  { value: 'EN_SEGUIMIENTO', label: 'En seguimiento', tono: 'proceso', pasosAsesor: 2, pasosCliente: 1 },
  { value: 'COTIZACION', label: 'Cotización', tono: 'proceso', pasosAsesor: 3, pasosCliente: 2 },
  { value: 'VISITA', label: 'Visita', tono: 'proceso', pasosAsesor: 4, pasosCliente: 3 },
  { value: 'SEPARACION', label: 'Separación', tono: 'ok', pasosAsesor: 5, pasosCliente: 4 },
  { value: 'VENTA', label: 'Venta', tono: 'ok', pasosAsesor: 6, pasosCliente: 5 },
]

// Relación de un cliente con un lote. Consultar, cotizar o agendar una visita SOLO lo deja "de
// interés": no reserva ni separa el lote. SEPARADO sale de una separación vigente (la registra
// administración, ver PUEDEN_REGISTRAR_SEPARACION); COMPRADO todavía no existe.
export const RELACIONES_LOTE = [
  { value: 'INTERES', label: 'De interés', tono: 'neutro' },
  { value: 'SEPARADO', label: 'Separado', tono: 'proceso' },
  { value: 'COMPRADO', label: 'Comprado', tono: 'ok' },
]

// SEPARACIÓN DE LOTES. Por ahora solo existe la transición INTERES → SEPARADO. Una separación
// VIGENTE deja el lote como "Separado" para el cliente y lo quita de la venta; SEPARADO → COMPRADO
// (venta) todavía NO existe.
export const ESTADOS_SEPARACION = [
  { value: 'VIGENTE', label: 'Vigente', tono: 'proceso' },
]

// Quién puede registrar una separación (tipos de usuario de `utils/authMock.js`). Hoy solo
// administración; para permitírselo también al asesor, basta con agregar 'asesor' aquí.
export const PUEDEN_REGISTRAR_SEPARACION = ['admin']

// Cuenta del cliente: la da de alta administración (PENDIENTE) y el cliente la activa con su código.
export const ESTADOS_CUENTA = [
  { value: 'PENDIENTE', label: 'Pendiente de activación', tono: 'pendiente' },
  { value: 'ACTIVADA', label: 'Activada', tono: 'ok' },
]

export const PASOS_ASESOR =['Contactado', 'Información enviada', 'Cotización', 'Visita', 'Separación', 'Venta']
export const PASOS_CLIENTE = ['Información', 'Cotización', 'Visita', 'Separación', 'Compra']

export const TIPOS_SOLICITUD = {
  INFORMACION: 'Solicitud de información',
  COTIZACION: 'Solicitud de cotización',
  VISITA: 'Agenda de visita',
  SEPARACION: 'Separación',
}

export const ESTADOS_SOLICITUD = [
  { value: 'PENDIENTE', label: 'Pendiente', tono: 'pendiente' },
  { value: 'EN_ATENCION', label: 'En atención', tono: 'proceso' },
  { value: 'ATENDIDA', label: 'Atendida', tono: 'ok' },
  { value: 'CANCELADA', label: 'Cancelada', tono: 'cancelado' },
]

// Una visita nace PENDIENTE (la agenda el cliente) y el asesor la confirma, la marca como
// realizada o la cancela. `TRANSICIONES_VISITA` dice a qué estados puede pasar desde cada uno.
export const ESTADOS_VISITA = [
  { value: 'PENDIENTE', label: 'Pendiente', tono: 'pendiente' },
  { value: 'CONFIRMADA', label: 'Confirmada', tono: 'proceso' },
  { value: 'REALIZADA', label: 'Realizada', tono: 'ok' },
  { value: 'CANCELADA', label: 'Cancelada', tono: 'cancelado' },
]

export const TRANSICIONES_VISITA = {
  PENDIENTE: ['CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['REALIZADA', 'CANCELADA'],
}

/** Visitas que siguen vigentes (todavía pueden ocurrir). */
export const ESTADOS_VISITA_ACTIVOS = ['PENDIENTE', 'CONFIRMADA']

export const ESTADOS_DOCUMENTO = [
  { value: 'DISPONIBLE', label: 'Disponible', tono: 'ok' },
  { value: 'PENDIENTE', label: 'Pendiente', tono: 'pendiente' },
]

/** Busca `{ label, tono }` de un valor en uno de los catálogos de arriba. */
export function buscarEstado(catalogo, valor) {
  return catalogo.find((estado) => estado.value === valor) ?? { value: valor, label: valor ?? '—', tono: 'neutro' }
}
