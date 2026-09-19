// Capa de datos centralizada. Hoy lee los arrays simulados de `src/data`; cuando exista el
// backend real, solo hay que reemplazar el cuerpo de cada función por un `fetch` a
// `${import.meta.env.VITE_API_URL}/...` — los componentes que llaman a estas funciones no
// necesitan cambiar, porque ya reciben los datos como promesas con esta misma forma.
import { proyectos, getProyectoById as buscarProyectoPorId } from '../data/proyectos'
import { lotes, getLotesByProyecto as buscarLotesPorProyecto, getLoteById as buscarLotePorId } from '../data/lotes'



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

/** Equivalente simulado de POST /api/solicitudes */
export async function crearSolicitud(datos) {
  await esperar()

  const camposRequeridos = ['nombre', 'apellido', 'dni', 'telefono', 'correo']
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

/** Equivalente simulado de POST /api/visitas */
export async function crearVisita(datos) {
  await esperar()

  const camposRequeridos = ['nombre', 'telefono', 'correo', 'fecha', 'hora']
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

