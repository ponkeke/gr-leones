// HISTORIAL DEL COMPRADOR (datos de DEMOSTRACIÓN): acciones del cliente en orden cronológico.
// Solo ilustra la interfaz; no describe un proceso de compra real. Son los datos INICIALES: los
// eventos nuevos (solicitudes, visitas, cambios de etapa) los agrega `services/api.js` al almacén mock.
export const historialMock = [
  { id: 1, clienteId: 1, fecha: '2026-09-12', titulo: 'Solicitud de información', detalle: 'Residencial Chalay II · Lote A-03' },
  { id: 2, clienteId: 1, fecha: '2026-09-14', titulo: 'Cotización recibida', detalle: 'Cotización del lote A-03 enviada por tu asesora.' },
  { id: 3, clienteId: 1, fecha: '2026-09-16', titulo: 'Visita agendada', detalle: 'Visita al proyecto programada para el 28/09/2026.' },
  { id: 4, clienteId: 1, fecha: '2026-09-20', titulo: 'Seguimiento comercial', detalle: 'Tu asesora se comunicó contigo para confirmar la visita.' },
  { id: 5, clienteId: 1, fecha: '2026-09-22', titulo: 'Solicitud de información', detalle: 'Residencial Chalay II · Lote A-05' },
]
