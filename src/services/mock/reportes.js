// REPORTES DE ADMINISTRACIÓN: indicadores comerciales, índice de conversión, ranking de asesores,
// estadísticas generales y actividad reciente. Todo se CALCULA con los datos que ya existen
// (clientes, solicitudes, visitas, seguimiento, separaciones, lotes, testimonios): nada se inventa.
// Si un dato todavía no existe en el sistema (p. ej. ventas), se informa como "no disponible".
// Con el backend real, cada función será una consulta SQL agregada (COUNT / GROUP BY).
import { asesoresMock } from '../../data/asesoresMock'
import { cuentaActivada, getClienteMockById, getClientes } from '../../data/clientesMock'
import { ESTADOS_TESTIMONIO } from '../../data/contenido'
import { ESTADOS_LOTE } from '../../data/estados'
import { METRICAS_RANKING, TIPOS_ACTIVIDAD } from '../../data/reportes'
import { lotes } from '../../data/lotes'
import { proyectos, getProyectoById } from '../../data/proyectos'
import { ESTADOS_SOLICITUD, ESTADOS_VISITA, ESTADOS_VISITA_ACTIVOS, ETAPAS_CLIENTE, TIPOS_SOLICITUD, buscarEstado } from '../../data/procesoComercial'
import { fechaLocalISO, formatearLote } from '../../utils/formato'
import { CLAVES, leerJSON } from '../../utils/almacenamiento'
import { EVENTO_ALMACEN, adminDeSesion, esperar, leerColeccion, mismoId } from './almacen'
import { lotesConEstado } from './lotesComerciales'

function exigirAdmin() {
  if (!adminDeSesion()) throw new Error('Esta sección es solo para administración.')
}

/** Porcentaje redondeado a 1 decimal, o null si no hay base (nunca "0 %" inventado ni NaN). */
const porcentaje = (parte, total) => (total > 0 ? Math.round((parte / total) * 1000) / 10 : null)

/** [{ value, label, tono, cantidad }] para cada valor de un catálogo. */
const contarPor = (lista, campo, catalogo) =>
  catalogo.map((item) => ({ ...item, cantidad: lista.filter((r) => r[campo] === item.value).length }))

/** Datos base de todos los reportes, leídos una vez por consulta. */
function leerDatos() {
  const clientes = getClientes()
  const idsClientes = new Set(clientes.map((c) => String(c.id)))
  const esClienteExistente = (id) => id !== null && id !== undefined && idsClientes.has(String(id))
  const seguimientos = leerColeccion(CLAVES.seguimiento)
  return {
    clientes,
    esClienteExistente,
    solicitudes: leerColeccion(CLAVES.solicitudes),
    visitas: leerColeccion(CLAVES.visitas),
    seguimientos,
    // Solo los seguimientos de clientes que existen (los de clientes eliminados se informan aparte).
    seguimientosVigentes: seguimientos.filter((s) => esClienteExistente(s.clienteId)),
    separaciones: leerColeccion(CLAVES.separaciones).filter((s) => s.estado === 'VIGENTE'),
    testimonios: leerColeccion(CLAVES.testimonios),
  }
}

/** Asesor asignado de un cliente: el de su seguimiento o, si aún no tiene, el de su ficha. */
const asesorAsignado = (cliente, seguimientos) =>
  seguimientos.find((s) => mismoId(s.clienteId, cliente.id))?.asesorId ?? cliente.asesorId ?? null

// ── Indicadores comerciales ────────────────────────────────────────────────────────────────────

/** GET /api/admin/indicadores */
export async function getIndicadoresComerciales() {
  await esperar()
  exigirAdmin()
  const d = leerDatos()
  const hoy = fechaLocalISO()
  const solicitudesCanceladas = d.solicitudes.filter((s) => s.estado === 'CANCELADA').length
  const solicitudesAtendidas = d.solicitudes.filter((s) => s.estado === 'ATENDIDA').length
  const visitasRealizadas = d.visitas.filter((v) => v.estado === 'REALIZADA').length
  const visitasCanceladas = d.visitas.filter((v) => v.estado === 'CANCELADA').length

  return {
    solicitudes: {
      total: d.solicitudes.length,
      desdeVisitantes: d.solicitudes.filter((s) => s.clienteId === null || s.clienteId === undefined).length,
      porEstado: contarPor(d.solicitudes, 'estado', ESTADOS_SOLICITUD),
      porTipo: Object.entries(TIPOS_SOLICITUD).map(([value, label]) => ({ value, label, cantidad: d.solicitudes.filter((s) => s.tipo === value).length })),
      // Atendidas sobre las que no se cancelaron.
      tasaAtencion: porcentaje(solicitudesAtendidas, d.solicitudes.length - solicitudesCanceladas),
    },
    visitas: {
      total: d.visitas.length,
      proximas: d.visitas.filter((v) => ESTADOS_VISITA_ACTIVOS.includes(v.estado) && v.fecha >= hoy).length,
      porEstado: contarPor(d.visitas, 'estado', ESTADOS_VISITA),
      // Realizadas sobre las visitas ya cerradas (realizadas + canceladas).
      tasaRealizacion: porcentaje(visitasRealizadas, visitasRealizadas + visitasCanceladas),
    },
    cartera: contarPor(d.seguimientosVigentes, 'etapa', ETAPAS_CLIENTE),
    separacionesVigentes: d.separaciones.length,
    cuentas: {
      activadas: d.clientes.filter(cuentaActivada).length,
      pendientes: d.clientes.filter((c) => !cuentaActivada(c)).length,
    },
  }
}

// ── Índice de conversión ───────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/conversion — cuántos clientes registrados llegaron a cada etapa:
 *   solicitud → seguimiento (el asesor ya los contactó) → visita realizada → separación → venta.
 * Cada etapa se cuenta con su propio dato real (un cliente puede llegar a una etapa sin pasar por
 * la anterior). La venta todavía no se registra en el sistema: se informa como no disponible.
 */
export async function getIndiceConversion() {
  await esperar()
  exigirAdmin()
  const d = leerDatos()
  const base = d.clientes.length
  const clientesCon = (lista, condicion = () => true) =>
    new Set(lista.filter((r) => d.esClienteExistente(r.clienteId) && condicion(r)).map((r) => String(r.clienteId))).size

  const etapas = [
    { clave: 'SOLICITUD', etiqueta: 'Solicitud', descripcion: 'Clientes con al menos una solicitud (información, cotización, visita o separación).', cantidad: clientesCon(d.solicitudes) },
    { clave: 'SEGUIMIENTO', etiqueta: 'Seguimiento', descripcion: 'Clientes que su asesor ya contactó (etapa distinta de “Nuevo”).', cantidad: clientesCon(d.seguimientosVigentes, (s) => s.etapa !== 'NUEVO') },
    { clave: 'VISITA', etiqueta: 'Visita', descripcion: 'Clientes con al menos una visita realizada.', cantidad: clientesCon(d.visitas, (v) => v.estado === 'REALIZADA') },
    { clave: 'SEPARACION', etiqueta: 'Separación', descripcion: 'Clientes con un lote separado (separación vigente).', cantidad: clientesCon(d.separaciones) },
    { clave: 'VENTA', etiqueta: 'Venta', descripcion: 'Todavía no existe el registro de ventas en el sistema.', cantidad: null, disponible: false },
  ]

  let anterior = base
  const conTasas = etapas.map((etapa) => {
    if (etapa.disponible === false) return { ...etapa, sobreAnterior: null, sobreBase: null }
    const resultado = { ...etapa, disponible: true, sobreAnterior: porcentaje(etapa.cantidad, anterior), sobreBase: porcentaje(etapa.cantidad, base) }
    anterior = etapa.cantidad
    return resultado
  })

  return {
    clientesRegistrados: base,
    etapas: conTasas,
    // Contactos que llegaron sin cuenta (no forman parte de la base de clientes).
    solicitudesDeVisitantes: d.solicitudes.filter((s) => s.clienteId === null || s.clienteId === undefined).length,
  }
}

// ── Ranking de asesores ────────────────────────────────────────────────────────────────────────

/** GET /api/admin/ranking-asesores — métricas por asesor; el orden lo elige quien consulta. */
export async function getRankingAsesores() {
  await esperar()
  exigirAdmin()
  const d = leerDatos()
  return asesoresMock.map((asesor) => {
    const recibidas = d.solicitudes.filter((s) => s.asesorId === asesor.id)
    const atendidas = recibidas.filter((s) => s.estado === 'ATENDIDA').length
    const canceladas = recibidas.filter((s) => s.estado === 'CANCELADA').length
    return {
      asesorId: asesor.id,
      nombre: asesor.nombre,
      codigo: asesor.codigo,
      clientesAsignados: d.clientes.filter((c) => asesorAsignado(c, d.seguimientos) === asesor.id).length,
      solicitudesRecibidas: recibidas.length,
      solicitudesAtendidas: atendidas,
      tasaAtencion: porcentaje(atendidas, recibidas.length - canceladas),
      visitasRealizadas: d.visitas.filter((v) => v.asesorId === asesor.id && v.estado === 'REALIZADA').length,
      separaciones: d.separaciones.filter((s) => s.asesorId === asesor.id).length,
    }
  })
}

// ── Estadísticas generales ─────────────────────────────────────────────────────────────────────

/** GET /api/admin/estadisticas */
export async function getEstadisticasGenerales() {
  await esperar()
  exigirAdmin()
  const d = leerDatos()
  const lotesActuales = lotesConEstado(lotes)
  const lotesPorProyecto = proyectos.map((proyecto) => {
    const delProyecto = lotesActuales.filter((l) => l.proyectoId === proyecto.id)
    return { proyecto: proyecto.nombre, total: delProyecto.length, porEstado: contarPor(delProyecto, 'estado', ESTADOS_LOTE) }
  })
  const huerfano = (r) => r.clienteId !== null && r.clienteId !== undefined && !d.esClienteExistente(r.clienteId)
  const preguntas = leerColeccion(CLAVES.preguntasFrecuentes)

  return {
    clientes: { total: d.clientes.length, activadas: d.clientes.filter(cuentaActivada).length, pendientes: d.clientes.filter((c) => !cuentaActivada(c)).length },
    asesores: asesoresMock.length,
    solicitudes: { total: d.solicitudes.length, porEstado: contarPor(d.solicitudes, 'estado', ESTADOS_SOLICITUD) },
    visitas: { total: d.visitas.length, porEstado: contarPor(d.visitas, 'estado', ESTADOS_VISITA) },
    seguimientos: { total: d.seguimientosVigentes.length, porEtapa: contarPor(d.seguimientosVigentes, 'etapa', ETAPAS_CLIENTE) },
    separacionesVigentes: d.separaciones.length,
    lotes: {
      total: lotesActuales.length,
      porEstado: contarPor(lotesActuales, 'estado', ESTADOS_LOTE),
      porProyecto: lotesPorProyecto,
    },
    testimonios: contarPor(d.testimonios, 'estado', ESTADOS_TESTIMONIO),
    preguntasFrecuentes: { total: preguntas.length, activas: preguntas.filter((p) => p.activa).length },
    // Registros que apuntan a un cliente que ya no existe (se excluyen de los demás cálculos).
    registrosSinCliente: {
      solicitudes: d.solicitudes.filter(huerfano).length,
      visitas: d.visitas.filter(huerfano).length,
      seguimientos: d.seguimientos.filter(huerfano).length,
    },
  }
}

// ── Actividad reciente ─────────────────────────────────────────────────────────────────────────

function nombreCliente(clienteId) {
  const cambios = leerJSON(CLAVES.perfilesClientes, {})?.[clienteId] ?? {}
  return cambios.nombre ?? getClienteMockById(clienteId)?.nombre ?? null
}

const nombreAsesor = (asesorId) => asesoresMock.find((a) => a.id === asesorId)?.nombre ?? null

function quien(registro) {
  if (registro.clienteId === null || registro.clienteId === undefined) {
    return registro.contacto?.nombre ? `${registro.contacto.nombre} (visitante web)` : 'Visitante web'
  }
  return nombreCliente(registro.clienteId) ?? `Cliente #${registro.clienteId} (ya no existe)`
}

function dondeLote(loteCodigo, proyectoId) {
  const lote = lotes.find((l) => l.codigo === loteCodigo)
  const proyecto = getProyectoById(lote?.proyectoId ?? proyectoId)
  return [proyecto?.nombre, lote ? formatearLote(lote) : null].filter(Boolean).join(' · ')
}

// Siempre "solicitud de …": una solicitud de separación NO es una separación registrada.
const TITULO_SOLICITUD = {
  INFORMACION: 'Nueva solicitud de información',
  COTIZACION: 'Nueva solicitud de cotización',
  VISITA: 'Nueva solicitud de visita',
  SEPARACION: 'Nueva solicitud de separación',
}

const TITULO_NOTA = { CONTACTO: 'Contacto registrado', NOTA: 'Nota interna', ESTADO: 'Cambio de etapa', ASIGNACION: 'Cliente reasignado' }

/**
 * GET /api/admin/actividad — eventos que YA ocurrieron, a partir de las fechas guardadas en cada
 * registro (más recientes primero). No es una transmisión en vivo: ver `suscribirActividad`.
 * `fecha` puede ser un ISO con hora o solo "YYYY-MM-DD" (datos que no guardaron la hora).
 */
export async function getActividadReciente({ tipo = null, limite = 60 } = {}) {
  await esperar()
  exigirAdmin()
  const d = leerDatos()
  const eventos = []
  const agregar = (evento) => {
    if (evento.fecha) eventos.push(evento)
  }

  d.solicitudes.forEach((s) => {
    const cual = TIPOS_SOLICITUD[s.tipo] ?? 'Solicitud'
    agregar({ id: `sol-${s.id}`, tipo: 'solicitud', fecha: s.fechaRegistro ?? s.fecha, titulo: TITULO_SOLICITUD[s.tipo] ?? 'Nueva solicitud', detalle: `${quien(s)} → ${nombreAsesor(s.asesorId) ?? 'sin asesor'} · ${dondeLote(s.loteCodigo, s.proyectoId)}` })
    if (s.fechaActualizacion) {
      agregar({ id: `sol-${s.id}-estado`, tipo: 'solicitud', fecha: s.fechaActualizacion, titulo: `Solicitud: ${buscarEstado(ESTADOS_SOLICITUD, s.estado).label.toLowerCase()}`, detalle: `${cual} de ${quien(s)} · ${nombreAsesor(s.asesorId) ?? ''}` })
    }
  })
  d.visitas.forEach((v) => {
    const cuando = `${v.fecha} ${v.hora}`
    agregar({ id: `vis-${v.id}`, tipo: 'visita', fecha: v.fechaRegistro, titulo: 'Visita agendada', detalle: `${quien(v)} con ${nombreAsesor(v.asesorId) ?? '—'} · ${cuando}` })
    if (v.fechaActualizacion) {
      agregar({ id: `vis-${v.id}-estado`, tipo: 'visita', fecha: v.fechaActualizacion, titulo: `Visita ${buscarEstado(ESTADOS_VISITA, v.estado).label.toLowerCase()}`, detalle: `${quien(v)} con ${nombreAsesor(v.asesorId) ?? '—'} · ${cuando}` })
    }
  })
  d.seguimientos.forEach((s) => {
    s.notas.forEach((nota, indice) => {
      if (!TITULO_NOTA[nota.tipo]) return
      agregar({ id: `seg-${s.id}-${indice}`, tipo: 'seguimiento', fecha: nota.fecha, titulo: TITULO_NOTA[nota.tipo], detalle: `${quien(s)} · ${nota.texto}` })
    })
  })
  d.separaciones.forEach((s) => {
    agregar({ id: `sep-${s.id}`, tipo: 'separacion', fecha: s.fechaRegistro ?? s.fecha, titulo: 'Separación registrada', detalle: `${quien(s)} · ${dondeLote(s.loteCodigo, s.proyectoId)} · por ${s.registradoPor?.nombre ?? 'administración'}` })
  })
  d.clientes.forEach((c) => {
    if (c.fechaAlta) agregar({ id: `alta-${c.id}`, tipo: 'cuenta', fecha: c.fechaAlta, titulo: 'Cliente dado de alta', detalle: `${c.nombre} (${c.codigo}) · asesor ${nombreAsesor(c.asesorId) ?? '—'}` })
    if (c.fechaActivacion) agregar({ id: `act-${c.id}`, tipo: 'cuenta', fecha: c.fechaActivacion, titulo: 'Cuenta activada', detalle: `${c.nombre} (${c.codigo})` })
  })
  d.testimonios.forEach((t) => {
    agregar({ id: `tes-${t.id}`, tipo: 'testimonio', fecha: t.fechaCreacion, titulo: 'Testimonio recibido', detalle: `${t.nombreVisible} · ${t.puntuacion}/5` })
    if (t.fechaRevision) agregar({ id: `tes-${t.id}-rev`, tipo: 'testimonio', fecha: t.fechaRevision, titulo: `Testimonio ${buscarEstado(ESTADOS_TESTIMONIO, t.estado).label.toLowerCase()}`, detalle: `${t.nombreVisible} · por ${t.revisadoPor?.nombre ?? 'administración'}` })
  })

  return eventos
    .filter((e) => !tipo || e.tipo === tipo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))
    .slice(0, limite)
}

/**
 * Avisa cuando cambian los datos: en esta pestaña (evento del almacén) y en otras pestañas del
 * mismo navegador (evento 'storage'). Son cambios reales, no una simulación. Con el backend, esta
 * función se reemplaza por una suscripción SSE/WebSocket con la misma firma. Devuelve `cancelar()`.
 */
export function suscribirActividad(alCambiar) {
  const enOtraPestana = (evento) => {
    if (evento.key === null || String(evento.key).startsWith('leones_')) alCambiar()
  }
  window.addEventListener(EVENTO_ALMACEN, alCambiar)
  window.addEventListener('storage', enOtraPestana)
  return () => {
    window.removeEventListener(EVENTO_ALMACEN, alCambiar)
    window.removeEventListener('storage', enOtraPestana)
  }
}

// Catálogos que la pantalla importa desde `services/api.js` (definidos en data/reportes.js).
export { METRICAS_RANKING, TIPOS_ACTIVIDAD }
