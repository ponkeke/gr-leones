// HORARIOS DE VISITA — MOCK. La empresa todavía no entregó sus horarios reales de atención ni
// existe una tabla de disponibilidad: estas horas son SOLO de ejemplo para poder probar el flujo
// "Agendar visita". No representan la agenda real de ningún asesor.
//
// Cuando exista la base de datos, `getHorariosVisita` (services/api.js) debe consultar la
// disponibilidad real (proyecto + fecha + asesor) y este archivo se puede eliminar.
// Formato 24 h "HH:mm"; la interfaz los muestra como "09:00 AM".
export const HORARIOS_VISITA_MOCK = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
