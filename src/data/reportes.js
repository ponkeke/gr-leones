// CATÁLOGOS DE LOS REPORTES DE ADMINISTRACIÓN. Son iguales con cualquier fuente de datos (mock o
// API real): los usan las pantallas y las dos estrategias de `src/services/`.

// Métricas comparables del ranking de asesores que existen hoy. Para sumar una nueva (p. ej. ventas
// con la BD), se agrega aquí y la API/el mock deben devolver ese campo por asesor.
export const METRICAS_RANKING = [
  { clave: 'clientesAsignados', etiqueta: 'Clientes asignados' },
  { clave: 'solicitudesRecibidas', etiqueta: 'Solicitudes recibidas' },
  { clave: 'solicitudesAtendidas', etiqueta: 'Solicitudes atendidas' },
  { clave: 'tasaAtencion', etiqueta: '% de atención', porcentaje: true },
  { clave: 'visitasRealizadas', etiqueta: 'Visitas realizadas' },
  { clave: 'separaciones', etiqueta: 'Separaciones' },
]

// Tipos de evento de "Actividad reciente" (filtro de la pantalla).
export const TIPOS_ACTIVIDAD = [
  { value: 'solicitud', label: 'Solicitudes' },
  { value: 'visita', label: 'Visitas' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'separacion', label: 'Separaciones' },
  { value: 'cuenta', label: 'Cuentas' },
  { value: 'testimonio', label: 'Testimonios' },
]
