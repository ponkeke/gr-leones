// DISPONIBILIDAD DE LOS ASESORES para agendar visitas. Aquí no hay horarios de nadie: cada asesor
// marca los suyos en "Mi disponibilidad" y se guardan en el almacén mock (`services/api.js`). Sin
// configuración, un asesor no tiene horarios y el cliente no puede agendar con él.
//
// Forma de la disponibilidad de un asesor:
//   semanal:     { [día 0-6, 0 = domingo]: ['09:00', '10:00', …] }  se repite cada semana
//   excepciones: { 'YYYY-MM-DD': ['14:00', …] }                     solo ese día; [] = no disponible
// Con el backend real serán las tablas de disponibilidad semanal y de excepciones por fecha.
import { diaDeLaSemana, formatearHora } from '../utils/formato'

// Horas que el asesor puede marcar (bloques de una hora, formato 24 h "HH:mm"). Solo son las
// opciones de la pantalla: ninguna está disponible hasta que el asesor la marque.
export const HORAS_DE_ATENCION = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
]

// Cada visita ocupa al asesor este tiempo: otra visita no puede empezar a menos de 60 minutos.
export const DURACION_VISITA_MIN = 60

// Hasta cuántos días hacia adelante se puede agendar (y configurar) una visita.
export const DIAS_AGENDABLES = 60

// Días en el orden de la semana peruana (lunes primero), con el número de Date#getDay.
export const DIAS_SEMANA = [
  { dia: 1, nombre: 'Lunes' },
  { dia: 2, nombre: 'Martes' },
  { dia: 3, nombre: 'Miércoles' },
  { dia: 4, nombre: 'Jueves' },
  { dia: 5, nombre: 'Viernes' },
  { dia: 6, nombre: 'Sábado' },
  { dia: 0, nombre: 'Domingo' },
]

/** "Miércoles" -> "miércoles", "Sábado" -> "sábados" (para "todos los …"). */
export function nombreDiaPlural(dia) {
  const nombre = DIAS_SEMANA.find((d) => d.dia === dia).nombre.toLowerCase()
  return nombre.endsWith('s') ? nombre : `${nombre}s`
}

/** Horas configuradas para una fecha: la excepción de ese día o, si no hay, su horario semanal. */
export function horasDelDia(disponibilidad, fecha) {
  return [...(disponibilidad.excepciones[fecha] ?? disponibilidad.semanal[diaDeLaSemana(fecha)] ?? [])].sort()
}

export const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

const deMinutos = (minutos) => `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`

/** ['09:00', '10:00', '14:00'] -> "09:00 AM – 11:00 AM · 02:00 PM – 03:00 PM" (bloques seguidos juntos). */
export function textoRangos(horas) {
  const rangos = []
  ;[...horas].sort().forEach((hora) => {
    const inicio = aMinutos(hora)
    const ultimo = rangos[rangos.length - 1]
    if (ultimo && ultimo.fin === inicio) ultimo.fin = inicio + DURACION_VISITA_MIN
    else rangos.push({ inicio, fin: inicio + DURACION_VISITA_MIN })
  })
  return rangos.map((r) => `${formatearHora(deMinutos(r.inicio))} – ${formatearHora(deMinutos(r.fin))}`).join(' · ')
}
