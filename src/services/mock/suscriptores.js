// SUSCRIPTORES del bus de eventos de dominio (`./eventosDominio.js`). Aquí vive lo que antes estaba
// escrito dentro de cada operación comercial: los textos del historial del cliente y de las
// notificaciones. Cada evento tiene como mucho dos suscriptores y SIEMPRE en este orden:
//   1. historial   (crearEventoHistorial)
//   2. notificaciones (crearNotificacion): cliente antes que asesor, como antes.
// El orden importa: el id de cada registro sale de `siguienteId` en el momento de crearlo.
//
// Los datos de cada evento los publica la operación YA resueltos (nombres, descripción del lote,
// detalle…), para que aquí no se repitan consultas. Si no hay destinatario (visitante sin cuenta, sin
// asesor anterior…), `crearEventoHistorial` / `crearNotificacion` lo ignoran, como siempre.
import { crearEventoHistorial, crearNotificacion } from './almacen'
import { EVENTOS, suscribir } from './eventosDominio'

// ── Historial del cliente ──────────────────────────────────────────────────────────────────────
const historial = {
  [EVENTOS.solicitudCreada]: ({ clienteId, tipoTexto, donde }) => {
    crearEventoHistorial(clienteId, `${tipoTexto} registrada`, donde)
  },
  [EVENTOS.solicitudActualizada]: ({ clienteId, detalle }) => {
    crearEventoHistorial(clienteId, 'Solicitud actualizada', detalle)
  },
  [EVENTOS.visitaAgendada]: ({ clienteId, detalle }) => {
    crearEventoHistorial(clienteId, 'Visita agendada', detalle)
  },
  [EVENTOS.visitaActualizada]: ({ clienteId, titulo, detalle }) => {
    crearEventoHistorial(clienteId, titulo, detalle)
  },
  [EVENTOS.contactoRegistrado]: ({ clienteId, asesorNombre }) => {
    crearEventoHistorial(clienteId, 'Contacto de tu asesor', `${asesorNombre} registró un contacto contigo.`)
  },
  [EVENTOS.etapaActualizada]: ({ clienteId, etapa }) => {
    crearEventoHistorial(clienteId, 'Estado comercial actualizado', `Tu proceso de compra pasó a la etapa "${etapa}".`)
  },
  [EVENTOS.clienteReasignado]: ({ clienteId, nuevoAsesorNombre }) => {
    crearEventoHistorial(clienteId, 'Cambio de asesor', `Desde ahora te acompaña ${nuevoAsesorNombre}.`)
  },
  [EVENTOS.separacionRegistrada]: ({ clienteId, donde, avanzaEtapa }) => {
    crearEventoHistorial(clienteId, 'Separación registrada', `${donde}: el lote quedó separado a tu nombre.`)
    if (avanzaEtapa) {
      crearEventoHistorial(clienteId, 'Estado comercial actualizado', 'Tu proceso de compra pasó a la etapa "Separación".')
    }
  },
  [EVENTOS.clienteDadoDeAlta]: ({ clienteId, codigo }) => {
    crearEventoHistorial(clienteId, 'Alta como cliente', `Grupo Leones registró tus datos y te asignó el código ${codigo}.`)
  },
  [EVENTOS.cuentaActivada]: ({ clienteId }) => {
    crearEventoHistorial(clienteId, 'Cuenta activada', 'Activaste tu cuenta de cliente con tu código.')
  },
}

// ── Notificaciones ─────────────────────────────────────────────────────────────────────────────
const notificaciones = {
  [EVENTOS.solicitudCreada]: ({ clienteId, asesorId, tipoTexto, donde, asesorNombre, clienteNombre }) => {
    crearNotificacion('cliente', clienteId, 'Recibimos tu solicitud', `Tu ${tipoTexto.toLowerCase()} (${donde}) fue registrada. ${asesorNombre ?? 'Tu asesor'} se pondrá en contacto contigo.`)
    crearNotificacion('asesor', asesorId, `Nueva ${tipoTexto.toLowerCase()}`, `${clienteNombre ?? 'Un cliente'} · ${donde}.`)
  },
  [EVENTOS.solicitudActualizada]: ({ clienteId, detalle }) => {
    crearNotificacion('cliente', clienteId, 'Tu solicitud fue actualizada', detalle)
  },
  [EVENTOS.visitaAgendada]: ({ clienteId, asesorId, detalle, asesorNombre, clienteNombre }) => {
    crearNotificacion('cliente', clienteId, 'Recibimos tu solicitud de visita', `${detalle}. Queda pendiente de confirmación por ${asesorNombre ?? 'tu asesor'}.`)
    crearNotificacion('asesor', asesorId, 'Nueva visita por confirmar', `${clienteNombre ?? 'Un cliente'} · ${detalle}.`)
  },
  [EVENTOS.visitaActualizada]: ({ clienteId, asesorId, estado, titulo, detalle, esAsesor, esCliente, asesorNombre, clienteNombre }) => {
    if (esAsesor && estado !== 'REALIZADA') {
      crearNotificacion('cliente', clienteId, titulo, `Tu visita (${detalle}) fue ${estado === 'CONFIRMADA' ? 'confirmada' : 'cancelada'} por ${asesorNombre ?? 'tu asesor'}.`)
    }
    if (esCliente) {
      crearNotificacion('asesor', asesorId, 'Visita cancelada por el cliente', `${clienteNombre ?? 'El cliente'} canceló su visita (${detalle}).`)
    }
  },
  [EVENTOS.etapaActualizada]: ({ clienteId, etapa }) => {
    crearNotificacion('cliente', clienteId, 'Tu proceso de compra avanzó', `Tu proceso ahora está en la etapa "${etapa}".`)
  },
  [EVENTOS.clienteReasignado]: ({ clienteId, nuevoAsesorId, anteriorAsesorId, nuevoAsesorNombre, clienteNombre, clienteCodigo }) => {
    crearNotificacion('cliente', clienteId, 'Tienes un nuevo asesor', `${nuevoAsesorNombre} te acompañará desde ahora en tu proceso de compra.`)
    crearNotificacion('asesor', nuevoAsesorId, 'Nuevo cliente asignado', `${clienteNombre} (${clienteCodigo}) ahora está a tu cargo. Lo verás en Clientes y Seguimiento.`)
    crearNotificacion('asesor', anteriorAsesorId, 'Cliente reasignado', `${clienteNombre} (${clienteCodigo}) pasó a cargo de ${nuevoAsesorNombre}.`)
  },
  [EVENTOS.separacionRegistrada]: ({ clienteId, asesorId, donde, clienteNombre, registradoPor }) => {
    crearNotificacion('cliente', clienteId, 'Lote separado', `Se registró la separación del lote (${donde}) a tu nombre. Lo verás en Mis lotes → Lotes separados.`)
    crearNotificacion('asesor', asesorId, 'Separación registrada', `${clienteNombre} · ${donde}. Registrada por ${registradoPor}.`)
  },
  [EVENTOS.clienteDadoDeAlta]: ({ asesorId, nombre, codigo }) => {
    crearNotificacion('asesor', asesorId, 'Nuevo cliente asignado', `${nombre} (${codigo}) fue dado de alta y está a tu cargo. Su cuenta queda pendiente de activación.`)
  },
  [EVENTOS.cuentaActivada]: ({ clienteId, asesorId, nombre, codigo, asesorNombre }) => {
    crearNotificacion('cliente', clienteId, 'Te damos la bienvenida', `Tu cuenta está activa. ${asesorNombre ?? 'Tu asesor'} te acompañará en tu proceso de compra.`)
    crearNotificacion('asesor', asesorId, 'Cliente activó su cuenta', `${nombre} (${codigo}) ya puede ingresar al área de clientes.`)
  },
  [EVENTOS.testimonioPublicado]: ({ clienteId }) => {
    crearNotificacion('cliente', clienteId, 'Tu testimonio fue publicado', 'Gracias por compartir tu experiencia: ya aparece en la sección Testimonios del sitio.')
  },
}

/**
 * Registra los suscriptores en el bus. Explícito (lo llama `./index.js` una vez) e idempotente: las
 * funciones son siempre las mismas y el bus no admite el mismo suscriptor dos veces por evento, así
 * que llamarla de nuevo (p. ej. al recargar módulos en desarrollo) no duplica historial ni avisos.
 * Primero se registran todos los de historial y después los de notificaciones: ese es el orden.
 */
export function registrarSuscriptores() {
  Object.entries(historial).forEach(([tipo, suscriptor]) => suscribir(tipo, suscriptor))
  Object.entries(notificaciones).forEach(([tipo, suscriptor]) => suscribir(tipo, suscriptor))
}
