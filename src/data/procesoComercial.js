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

export const PASOS_ASESOR = ['Contactado', 'Información enviada', 'Cotización', 'Visita', 'Separación', 'Venta']
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

export const ESTADOS_VISITA = [
  { value: 'PROGRAMADA', label: 'Programada', tono: 'pendiente' },
  { value: 'REALIZADA', label: 'Realizada', tono: 'ok' },
  { value: 'CANCELADA', label: 'Cancelada', tono: 'cancelado' },
]

export const ESTADOS_DOCUMENTO = [
  { value: 'DISPONIBLE', label: 'Disponible', tono: 'ok' },
  { value: 'PENDIENTE', label: 'Pendiente', tono: 'pendiente' },
]

/** Busca `{ label, tono }` de un valor en uno de los catálogos de arriba. */
export function buscarEstado(catalogo, valor) {
  return catalogo.find((estado) => estado.value === valor) ?? { value: valor, label: valor ?? '—', tono: 'neutro' }
}
