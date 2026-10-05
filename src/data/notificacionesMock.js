// NOTIFICACIONES (datos de DEMOSTRACIÓN). No se envían correos ni mensajes reales. Cada una tiene
// su destinatario (`destinatarioTipo`: 'cliente' | 'asesor' + `destinatarioId`). Son solo los datos
// INICIALES: `services/api.js` los copia al almacén mock y agrega las que generan los eventos.
export const notificacionesMock = [
  { id: 1, destinatarioTipo: 'cliente', destinatarioId: 1, fecha: '2026-09-22', titulo: 'Recibimos tu solicitud', mensaje: 'Tu solicitud de información del lote A-05 fue registrada.', leida: false },
  { id: 2, destinatarioTipo: 'cliente', destinatarioId: 1, fecha: '2026-09-20', titulo: 'Visita confirmada', mensaje: 'Tu visita del 28/09/2026 a las 10:00 AM quedó confirmada.', leida: false },
  { id: 3, destinatarioTipo: 'cliente', destinatarioId: 1, fecha: '2026-09-14', titulo: 'Cotización disponible', mensaje: 'Ya puedes revisar la cotización del lote A-03 en Documentos.', leida: true },
]
