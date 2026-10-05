// BUS DE EVENTOS DE DOMINIO del Mock (patrón Observer). Las operaciones comerciales (`comercial.js`,
// `contenido.js`) publican el HECHO que acaba de ocurrir ("se creó una solicitud", "se confirmó una
// visita"…) y los suscriptores (`./suscriptores.js`) reaccionan: historial del cliente y notificaciones.
//
// Es interno del Mock: con la API real, historial y notificaciones los genera el servidor, así que ni
// la estrategia HTTP, ni `api.js`, ni el contrato conocen este módulo. Tampoco tiene relación con
// `leones:almacen` (aviso de que una colección cambió, ver `almacen.js`) ni con
// `leones:sesion-expirada` (ver `../sesion.js`): son mecanismos distintos y no se mezclan.
//
// Reglas:
//   · SÍNCRONO: `publicar()` ejecuta a los suscriptores antes de volver, en la misma pila, así que
//     el efecto ya está guardado cuando la operación termina (igual que cuando se escribía en línea).
//   · ORDEN: los suscriptores de un evento se ejecutan en el orden en que se registraron.
//   · ERRORES: una excepción de un suscriptor se propaga a quien publica y corta a los siguientes,
//     como ocurría cuando las escrituras estaban dentro de la propia operación.

/** Hechos de negocio que hoy generan historial y/o notificaciones. */
export const EVENTOS = {
  solicitudCreada: 'solicitud.creada',
  solicitudActualizada: 'solicitud.actualizada',
  visitaAgendada: 'visita.agendada',
  visitaActualizada: 'visita.actualizada',
  contactoRegistrado: 'seguimiento.contactoRegistrado',
  etapaActualizada: 'seguimiento.etapaActualizada',
  clienteReasignado: 'cliente.reasignado',
  separacionRegistrada: 'separacion.registrada',
  clienteDadoDeAlta: 'cliente.dadoDeAlta',
  cuentaActivada: 'cuenta.activada',
  testimonioPublicado: 'testimonio.publicado',
}

// tipo → Set de suscriptores (un Set conserva el orden de registro y no admite el mismo suscriptor dos veces).
const suscriptores = new Map()

/**
 * Registra `suscriptor(datos)` para los eventos de `tipo`. Registrar la misma función dos veces para
 * el mismo tipo no la duplica. Devuelve `cancelar()`.
 */
export function suscribir(tipo, suscriptor) {
  if (typeof suscriptor !== 'function') throw new TypeError('El suscriptor debe ser una función.')
  if (!suscriptores.has(tipo)) suscriptores.set(tipo, new Set())
  suscriptores.get(tipo).add(suscriptor)
  return () => suscriptores.get(tipo)?.delete(suscriptor)
}

/** Avisa a los suscriptores de `tipo` con `datos`. Sin suscriptores no hace nada. */
export function publicar(tipo, datos) {
  const registrados = suscriptores.get(tipo)
  if (!registrados) return
  // Copia: un suscriptor que se cancele (o registre otro) durante la entrega no altera esta ronda.
  for (const suscriptor of [...registrados]) suscriptor(datos)
}

/** Cantidad de suscriptores de `tipo` (útil para comprobar que el registro no se duplica). */
export const cantidadDeSuscriptores = (tipo) => suscriptores.get(tipo)?.size ?? 0
