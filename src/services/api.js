// Capa de datos centralizada. Hoy lee los arrays simulados de `src/data`; cuando exista el
// backend real, solo hay que reemplazar el cuerpo de cada función por un `fetch` a
// `${import.meta.env.VITE_API_URL}/...` — los componentes que llaman a estas funciones no
// necesitan cambiar, porque ya reciben los datos como promesas con esta misma forma.
import { proyectos, getProyectoById as buscarProyectoPorId } from '../data/proyectos'
import { lotes, getLotesByProyecto as buscarLotesPorProyecto, getLoteById as buscarLotePorId } from '../data/lotes'
import { asesoresMock } from '../data/asesoresMock'
import { HORARIOS_VISITA_MOCK } from '../data/horariosVisitaMock'
import { fechaLocalISO } from '../utils/formato'
import { getClienteMockById } from '../data/clientesMock'
import { getIntegranteById } from '../data/equipo'
import { seguimientoMock } from '../data/seguimientoMock'
import { solicitudesMock } from '../data/solicitudesMock'
import { visitasMock } from '../data/visitasMock'
import { historialMock } from '../data/historialMock'
import { documentosMock } from '../data/documentosMock'
import { notificacionesMock } from '../data/notificacionesMock'
import { CLAVES, guardarJSON, leerJSON } from '../utils/almacenamiento'

const LATENCIA_SIMULADA_MS = 250

function esperar(ms = LATENCIA_SIMULADA_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// "Base de datos" en memoria para las solicitudes/visitas enviadas durante esta sesión.
const solicitudes = []
const visitas = []

/**
 * Campos agregados de un proyecto calculados a partir de sus lotes. Con el backend real
 * los devolverá la propia consulta SQL de /api/proyectos (COUNT / MIN sobre `lotes`).
 * `precioDesde` es null mientras ningún lote tenga precio cargado.
 */
function resumirLotes(lotesDelProyecto) {
  const preciosCargados = lotesDelProyecto.map((l) => l.precio_total).filter((p) => p !== null)
  const areas = lotesDelProyecto.map((l) => l.area_m2)

  return {
    totalLotes: lotesDelProyecto.length,
    lotesDisponibles: lotesDelProyecto.filter((l) => l.estado === 'DISPONIBLE').length,
    areaDesde: areas.length ? Math.min(...areas) : null,
    areaHasta: areas.length ? Math.max(...areas) : null,
    precioDesde: preciosCargados.length ? Math.min(...preciosCargados) : null,
  }
}

function conResumen(proyecto) {
  return { ...proyecto, ...resumirLotes(buscarLotesPorProyecto(proyecto.id)) }
}

// Caché de lectura: la primera consulta simula latencia de red; las siguientes son inmediatas.
let cacheProyectos = null

/** Equivalente simulado de GET /api/proyectos */
export async function getProyectos() {
  if (!cacheProyectos) {
    await esperar()
    cacheProyectos = proyectos.map(conResumen)
  }
  return cacheProyectos
}

/** Equivalente simulado de GET /api/proyectos/:id */
export async function getProyecto(id) {
  await esperar()
  const proyecto = buscarProyectoPorId(id)
  if (!proyecto) throw new Error('No encontramos ese proyecto.')
  return conResumen(proyecto)
}

/** Equivalente simulado de GET /api/proyectos/:id/lotes */
export async function getLotesDeProyecto(proyectoId) {
  await esperar()
  return buscarLotesPorProyecto(proyectoId)
}

/** Equivalente simulado de GET /api/lotes/:id */
export async function getLote(id) {
  await esperar()
  const lote = buscarLotePorId(id)
  if (!lote) throw new Error('No encontramos ese lote.')
  return lote
}

/** Equivalente simulado de GET /api/lotes */
export async function getTodosLosLotes() {
  await esperar()
  return lotes
}

// Campos de login mock que nunca deben salir de la "base de datos" hacia las pantallas.
const CAMPOS_PRIVADOS = ['usuario', 'password']

function sinCredenciales(registro) {
  return Object.fromEntries(Object.entries(registro).filter(([campo]) => !CAMPOS_PRIVADOS.includes(campo)))
}

/** Equivalente simulado de GET /api/asesores */
export async function getAsesores() {
  await esperar()
  return asesoresMock.map(sinCredenciales)
}

/**
 * Equivalente simulado de GET /api/visitas/horarios?proyectoId=&fecha=&asesorId=
 * Hoy devuelve los horarios MOCK (`data/horariosVisitaMock.js`), sin los que ya pasaron si la
 * fecha es hoy. Con la base de datos real debe devolver solo los horarios libres de ese
 * proyecto, día y (si se envía) asesor; la interfaz no necesita cambiar.
 */
export async function getHorariosVisita({ fecha }) {
  await esperar()
  if (!fecha) return []

  if (fecha !== fechaLocalISO()) return HORARIOS_VISITA_MOCK

  const ahora = new Date()
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
  return HORARIOS_VISITA_MOCK.filter((hora) => {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + m > minutosAhora
  })
}

/**
 * Equivalente simulado de POST /api/solicitudes.
 * Cubre "solicitar información" y "solicitar cotización": ambas quedan asociadas a un
 * asesor (`asesorId`), nunca a todos, y se distinguen por `datos.tipo`.
 */
export async function crearSolicitud(datos) {
  await esperar()

  const camposRequeridos = ['tipo', 'nombre', 'celular', 'asesorId']
  const faltante = camposRequeridos.find((campo) => !String(datos[campo] ?? '').trim())
  if (faltante) {
    throw new Error(`El campo "${faltante}" es obligatorio.`)
  }

  const solicitud = {
    id: solicitudes.length + 1,
    fechaRegistro: new Date().toISOString(),
    ...datos,
  }
  solicitudes.push(solicitud)
  return solicitud
}

/** Equivalente simulado de POST /api/visitas. Queda asociada a un asesor (`asesorId`). */
export async function crearVisita(datos) {
  await esperar()

  const camposRequeridos = ['nombre', 'celular', 'fecha', 'hora', 'asesorId']
  const faltante = camposRequeridos.find((campo) => !String(datos[campo] ?? '').trim())
  if (faltante) {
    throw new Error(`El campo "${faltante}" es obligatorio.`)
  }

  const visita = {
    id: visitas.length + 1,
    fechaRegistro: new Date().toISOString(),
    ...datos,
  }
  visitas.push(visita)
  return visita
}


// ─────────────────────────────────────────────────────────────────────────────────────────────
// ÁREA INTERNA (cliente / asesor) — datos de DEMOSTRACIÓN.
// Mismas reglas que arriba: con el backend real solo cambia el cuerpo de cada función. Los lotes
// se buscan por `codigo` en los datos reales del plano, así área, precio y estado no se duplican.
// ─────────────────────────────────────────────────────────────────────────────────────────────

function datosDeLote(loteCodigo) {
  const lote = lotes.find((l) => l.codigo === loteCodigo) ?? null
  const proyecto = lote ? buscarProyectoPorId(lote.proyectoId) : null
  return { loteCodigo, lote, proyecto }
}

/** Cliente con los cambios guardados desde "Mi perfil" en este navegador, sin credenciales. */
function clienteConCambios(cliente) {
  if (!cliente) return null
  const cambios = leerJSON(CLAVES.perfilesClientes, {})?.[cliente.id] ?? {}
  return sinCredenciales({ ...cliente, ...cambios })
}

function resumenPersona(persona) {
  return persona ? { id: persona.id, nombre: persona.nombre, telefono: persona.telefono ?? null } : null
}

/** Agrega proyecto, lote, cliente y asesor a una solicitud / visita / documento. */
function enriquecer(registro) {
  return {
    ...registro,
    ...datosDeLote(registro.loteCodigo),
    cliente: resumenPersona(clienteConCambios(getClienteMockById(registro.clienteId))),
    asesor: resumenPersona(asesoresMock.find((a) => a.id === registro.asesorId)),
  }
}

const claveFecha = (r) => `${r.fecha ?? ''} ${r.hora ?? ''}`
const porFechaAsc = (a, b) => claveFecha(a).localeCompare(claveFecha(b))
const porFechaDesc = (a, b) => porFechaAsc(b, a)
const deCliente = (lista, clienteId) => lista.filter((r) => String(r.clienteId) === String(clienteId))
const deAsesor = (lista, asesorId) => lista.filter((r) => r.asesorId === asesorId)
const seguimientoDeCliente = (clienteId) =>
  seguimientoMock.find((s) => String(s.clienteId) === String(clienteId)) ?? null

function proximaVisita(visitasOrdenadas) {
  const hoy = fechaLocalISO()
  return visitasOrdenadas.find((v) => v.estado === 'PROGRAMADA' && v.fecha >= hoy) ?? null
}

/** Equivalente simulado de GET /api/clientes/:id */
export async function getCliente(id) {
  await esperar()
  const cliente = clienteConCambios(getClienteMockById(id))
  if (!cliente) throw new Error('No encontramos tus datos de cliente.')
  return cliente
}

/**
 * Equivalente simulado de PUT /api/clientes/:id. Hoy guarda los cambios solo en el localStorage de
 * este navegador (no hay base de datos). El DNI y el código no se editan.
 */
export async function actualizarPerfilCliente(id, cambios) {
  await esperar()
  const nombre = String(cambios.nombre ?? '').trim()
  const telefono = String(cambios.telefono ?? '').trim()
  const email = String(cambios.email ?? '').trim()

  if (!nombre) throw new Error('El nombre es obligatorio.')
  if (!/^\d{9}$/.test(telefono)) throw new Error('El teléfono debe tener 9 dígitos.')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('El correo no es válido.')

  const todos = leerJSON(CLAVES.perfilesClientes, {}) ?? {}
  todos[id] = { nombre, telefono, email }
  if (!guardarJSON(CLAVES.perfilesClientes, todos)) {
    throw new Error('Este navegador no permite guardar los cambios.')
  }
  return clienteConCambios(getClienteMockById(id))
}

/** Equivalente simulado de GET /api/clientes/:id/lotes (lotes de interés del cliente). */
export async function getLotesDeCliente(clienteId) {
  await esperar()
  return (seguimientoDeCliente(clienteId)?.lotesInteres ?? []).map(datosDeLote)
}

/** Equivalente simulado de GET /api/clientes/:id/solicitudes (más recientes primero). */
export async function getSolicitudesDeCliente(clienteId) {
  await esperar()
  return deCliente(solicitudesMock, clienteId).map(enriquecer).sort(porFechaDesc)
}

/** Equivalente simulado de GET /api/clientes/:id/visitas */
export async function getVisitasDeCliente(clienteId) {
  await esperar()
  const lista = deCliente(visitasMock, clienteId).map(enriquecer).sort(porFechaAsc)
  return { visitas: lista, proxima: proximaVisita(lista) }
}

/** Equivalente simulado de GET /api/clientes/:id/historial (orden cronológico). */
export async function getHistorialDeCliente(clienteId) {
  await esperar()
  return deCliente(historialMock, clienteId).sort(porFechaAsc)
}

/** Equivalente simulado de GET /api/clientes/:id/documentos */
export async function getDocumentosDeCliente(clienteId) {
  await esperar()
  return deCliente(documentosMock, clienteId).map(enriquecer)
}

/** Equivalente simulado de GET /api/clientes/:id/notificaciones (más recientes primero). */
export async function getNotificacionesDeCliente(clienteId) {
  await esperar()
  return deCliente(notificacionesMock, clienteId).sort(porFechaDesc)
}

/** Datos del dashboard del cliente en una sola consulta. */
export async function getResumenCliente(clienteId) {
  await esperar()
  const cliente = clienteConCambios(getClienteMockById(clienteId))
  if (!cliente) throw new Error('No encontramos tus datos de cliente.')

  const seguimiento = seguimientoDeCliente(clienteId)
  const visitas = deCliente(visitasMock, clienteId).map(enriquecer).sort(porFechaAsc)
  const solicitudes = deCliente(solicitudesMock, clienteId)

  return {
    cliente,
    asesor: resumenPersona(asesoresMock.find((a) => a.id === cliente.asesorId)),
    etapa: seguimiento?.etapa ?? 'NUEVO',
    lotes: (seguimiento?.lotesInteres ?? []).map(datosDeLote),
    totalSolicitudes: solicitudes.length,
    solicitudesAbiertas: solicitudes.filter((s) => s.estado === 'PENDIENTE' || s.estado === 'EN_ATENCION').length,
    proximaVisita: proximaVisita(visitas),
  }
}

/** Equivalente simulado de GET /api/asesores/:id (perfil del equipo en `data/equipo.js`, sin credenciales). */
export async function getAsesor(id) {
  await esperar()
  const asesor = asesoresMock.find((a) => a.id === id)
  if (!asesor) throw new Error('No encontramos tu perfil de asesor.')
  return { ...sinCredenciales(asesor), perfil: getIntegranteById(id) }
}

/**
 * Equivalente simulado de GET /api/asesores/:id/clientes: cada cliente asignado con su
 * seguimiento comercial (etapa, lotes de interés, notas y última interacción).
 */
export async function getCarteraDeAsesor(asesorId) {
  await esperar()
  return deAsesor(seguimientoMock, asesorId)
    .map((seguimiento) => ({
      ...seguimiento,
      notas: [...seguimiento.notas],
      cliente: clienteConCambios(getClienteMockById(seguimiento.clienteId)),
      lotes: seguimiento.lotesInteres.map(datosDeLote),
    }))
    .sort((a, b) => b.ultimaInteraccion.localeCompare(a.ultimaInteraccion))
}

/** Equivalente simulado de GET /api/asesores/:id/solicitudes (más recientes primero). */
export async function getSolicitudesDeAsesor(asesorId) {
  await esperar()
  return deAsesor(solicitudesMock, asesorId).map(enriquecer).sort(porFechaDesc)
}

/** Equivalente simulado de GET /api/asesores/:id/visitas (agenda en orden cronológico). */
export async function getAgendaDeAsesor(asesorId) {
  await esperar()
  return deAsesor(visitasMock, asesorId).map(enriquecer).sort(porFechaAsc)
}

const TITULO_ACTIVIDAD = {
  INFORMACION: 'Nueva solicitud de información',
  COTIZACION: 'Nueva solicitud de cotización',
  VISITA: 'Nueva visita agendada',
  SEPARACION: 'Nueva solicitud de separación',
}

/** Indicadores y actividad reciente del dashboard del asesor (calculados con los datos demo). */
export async function getResumenAsesor(asesorId) {
  await esperar()
  const hoy = fechaLocalISO()
  const solicitudes = deAsesor(solicitudesMock, asesorId)
  const cartera = deAsesor(seguimientoMock, asesorId)

  return {
    indicadores: {
      clientes: cartera.length,
      solicitudesPendientes: solicitudes.filter((s) => s.estado === 'PENDIENTE').length,
      visitasProgramadas: deAsesor(visitasMock, asesorId).filter((v) => v.estado === 'PROGRAMADA' && v.fecha >= hoy).length,
      cotizaciones: solicitudes.filter((s) => s.tipo === 'COTIZACION').length,
      separaciones: solicitudes.filter((s) => s.tipo === 'SEPARACION').length,
      ventas: cartera.filter((s) => s.etapa === 'VENTA').length,
    },
    actividad: solicitudes
      .filter((s) => s.estado !== 'CANCELADA')
      .map(enriquecer)
      .sort(porFechaDesc)
      .slice(0, 6)
      .map((s) => ({ ...s, titulo: TITULO_ACTIVIDAD[s.tipo] })),
  }
}
