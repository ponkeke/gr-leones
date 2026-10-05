// ESTRATEGIA MOCK — contenido público: preguntas frecuentes, testimonios, noticias, galería, historias
// de compradores, reconocimientos, contenido para inversionistas y redes sociales. Se usa a través de
// `services/api.js`. Cada función equivale a un endpoint REST (la versión real está en `../http/index.js`).
// Los permisos se validan AQUÍ (no basta con ocultar botones).
import { getClienteMockById } from '../../data/clientesMock'
import { LARGO_COMENTARIO, PUNTUACION_MAXIMA, PUNTUACION_SATISFECHO, esPublicado } from '../../data/contenido'
import { getProyectoById, proyectos } from '../../data/proyectos'
import { redesSocialesEmpresa } from '../../data/redesSociales'
import { fechaLocalISO } from '../../utils/formato'
import { conRedConfirmada } from '../compartido'
import { CLAVES, leerJSON } from '../../utils/almacenamiento'
import {
  adminDeSesion,
  clienteDeSesion,
  esperar,
  guardarColeccion,
  leerColeccion,
  mismoId,
  siguienteId,
} from './almacen'
import { EVENTOS, publicar } from './eventosDominio'

function exigirAdmin() {
  const admin = adminDeSesion()
  if (!admin) throw new Error('Esta acción es solo para administración.')
  return admin
}

const texto = (valor) => String(valor ?? '').trim()
const porIdAsc = (a, b) => a.id - b.id
// Por `orden` (los que no tienen orden van al final) y, a igual orden, por id.
const porOrden = (a, b) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER) || porIdAsc(a, b)
const porFechaReciente = (a, b) => String(b.fecha ?? '').localeCompare(String(a.fecha ?? '')) || b.id - a.id

// ── Preguntas frecuentes (tabla `preguntas_frecuentes`) ────────────────────────────────────────

function validarPregunta({ pregunta, respuesta, categoria, orden }) {
  const p = texto(pregunta)
  const r = texto(respuesta)
  const c = texto(categoria)
  if (p.length < 5) throw new Error('Escribe la pregunta (al menos 5 caracteres).')
  if (r.length < 5) throw new Error('Escribe la respuesta (al menos 5 caracteres).')
  if (c.length > 60) throw new Error('La categoría puede tener hasta 60 caracteres.')
  const numero = orden === '' || orden === null || orden === undefined ? null : Number(orden)
  if (numero !== null && (!Number.isInteger(numero) || numero < 0)) throw new Error('El orden debe ser un número entero (0 o más).')
  return { pregunta: p, respuesta: r, categoria: c || null, orden: numero }
}

/** GET /api/preguntas-frecuentes — público: solo las activas, en su `orden`. */
export async function getPreguntasFrecuentes() {
  await esperar()
  return leerColeccion(CLAVES.preguntasFrecuentes).filter((p) => p.activa).sort(porOrden)
}

/** GET /api/admin/preguntas-frecuentes — todas, activas e inactivas. */
export async function getPreguntasFrecuentesAdmin() {
  await esperar()
  exigirAdmin()
  return [...leerColeccion(CLAVES.preguntasFrecuentes)].sort(porOrden)
}

/** POST /api/admin/preguntas-frecuentes */
export async function crearPreguntaFrecuente(datos) {
  await esperar()
  exigirAdmin()
  const lista = leerColeccion(CLAVES.preguntasFrecuentes)
  const hoy = fechaLocalISO()
  const nueva = { id: siguienteId(lista), ...validarPregunta(datos), activa: datos.activa !== false, fechaCreacion: hoy, fechaActualizacion: hoy }
  guardarColeccion(CLAVES.preguntasFrecuentes, [...lista, nueva])
  return nueva
}

/** PATCH /api/admin/preguntas-frecuentes/:id — texto, categoría, orden y/o `activa`. */
export async function actualizarPreguntaFrecuente(id, cambios) {
  await esperar()
  exigirAdmin()
  const lista = leerColeccion(CLAVES.preguntasFrecuentes)
  const actual = lista.find((p) => mismoId(p.id, id))
  if (!actual) throw new Error('No encontramos esa pregunta.')

  const editaTexto = ['pregunta', 'respuesta', 'categoria', 'orden'].some((campo) => campo in cambios)
  const actualizada = {
    ...actual,
    ...(editaTexto ? validarPregunta({ ...actual, ...cambios }) : {}),
    ...('activa' in cambios ? { activa: Boolean(cambios.activa) } : {}),
    fechaActualizacion: fechaLocalISO(),
  }
  guardarColeccion(CLAVES.preguntasFrecuentes, lista.map((p) => (p === actual ? actualizada : p)))
  return actualizada
}

/** DELETE /api/admin/preguntas-frecuentes/:id */
export async function eliminarPreguntaFrecuente(id) {
  await esperar()
  exigirAdmin()
  const lista = leerColeccion(CLAVES.preguntasFrecuentes)
  if (!lista.some((p) => mismoId(p.id, id))) throw new Error('No encontramos esa pregunta.')
  guardarColeccion(CLAVES.preguntasFrecuentes, lista.filter((p) => !mismoId(p.id, id)))
}

// ── Testimonios (tabla `testimonios`) ──────────────────────────────────────────────────────────

/** "María López" -> "María L." (el público no ve apellidos completos). */
function nombreVisible(nombre) {
  const partes = texto(nombre).split(/\s+/).filter(Boolean)
  if (partes.length === 0) return 'Cliente'
  return partes.length === 1 ? partes[0] : `${partes[0]} ${partes[1].charAt(0).toUpperCase()}.`
}

/** Nombre actual del cliente (con los cambios de "Mi perfil"). */
function nombreDelCliente(clienteId) {
  const cliente = getClienteMockById(clienteId)
  const cambios = leerJSON(CLAVES.perfilesClientes, {})?.[clienteId] ?? {}
  return cambios.nombre ?? cliente?.nombre ?? null
}

const vistaPublica = (t) => ({
  id: t.id,
  nombreVisible: t.nombreVisible,
  puntuacion: t.puntuacion,
  comentario: t.comentario,
  proyecto: getProyectoById(t.proyectoId)?.nombre ?? null,
  fecha: t.fechaRevision ?? t.fechaCreacion,
})
const porFechaDesc = (a, b) => (b.fechaCreacion ?? '').localeCompare(a.fechaCreacion ?? '') || b.id - a.id

/** GET /api/testimonios — público: solo los publicados, sin datos personales. */
export async function getTestimoniosPublicados() {
  await esperar()
  return leerColeccion(CLAVES.testimonios).filter((t) => t.estado === 'PUBLICADO').sort(porFechaDesc).map(vistaPublica)
}

/**
 * GET /api/testimonios/resumen — "Clientes satisfechos", calculado SOLO con los testimonios
 * publicados (nunca se inventa una cifra). `satisfechos` = opiniones de PUNTUACION_SATISFECHO o más.
 */
export async function getResumenSatisfaccion() {
  await esperar()
  const publicados = leerColeccion(CLAVES.testimonios).filter((t) => t.estado === 'PUBLICADO')
  const distribucion = Array.from({ length: PUNTUACION_MAXIMA }, (_, i) => ({
    puntuacion: PUNTUACION_MAXIMA - i,
    cantidad: publicados.filter((t) => t.puntuacion === PUNTUACION_MAXIMA - i).length,
  }))
  const total = publicados.length
  return {
    total,
    promedio: total ? Math.round((publicados.reduce((suma, t) => suma + t.puntuacion, 0) / total) * 10) / 10 : null,
    satisfechos: publicados.filter((t) => t.puntuacion >= PUNTUACION_SATISFECHO).length,
    distribucion,
  }
}

/** GET /api/clientes/me/testimonios — los testimonios del cliente en sesión (con su estado). */
export async function getMisTestimonios() {
  await esperar()
  const cliente = clienteDeSesion()
  if (!cliente) throw new Error('Ingresa como cliente para ver tus testimonios.')
  return leerColeccion(CLAVES.testimonios).filter((t) => mismoId(t.clienteId, cliente.id)).sort(porFechaDesc)
}

/**
 * POST /api/testimonios — solo clientes autenticados. Queda PENDIENTE hasta que administración lo
 * revise. Mientras tenga uno pendiente, el cliente no puede enviar otro.
 */
export async function crearTestimonio({ puntuacion, comentario, proyectoId = null }) {
  await esperar()
  const cliente = clienteDeSesion()
  if (!cliente) throw new Error('Solo los clientes con cuenta pueden dejar un testimonio.')

  const estrellas = Number(puntuacion)
  const mensaje = texto(comentario)
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > PUNTUACION_MAXIMA) throw new Error(`Elige una puntuación de 1 a ${PUNTUACION_MAXIMA} estrellas.`)
  if (mensaje.length < LARGO_COMENTARIO.minimo) throw new Error(`Escribe tu comentario (al menos ${LARGO_COMENTARIO.minimo} caracteres).`)
  if (mensaje.length > LARGO_COMENTARIO.maximo) throw new Error(`El comentario puede tener hasta ${LARGO_COMENTARIO.maximo} caracteres.`)
  // Proyecto opcional: el cliente puede indicar sobre qué proyecto opina.
  const sinProyecto = proyectoId === null || proyectoId === undefined || proyectoId === ''
  const proyecto = sinProyecto ? null : getProyectoById(proyectoId)
  if (!sinProyecto && !proyecto) throw new Error('El proyecto elegido no existe.')

  const lista = leerColeccion(CLAVES.testimonios)
  if (lista.some((t) => mismoId(t.clienteId, cliente.id) && t.estado === 'PENDIENTE')) {
    throw new Error('Ya tienes un testimonio pendiente de revisión. Podrás enviar otro cuando sea revisado.')
  }

  const nuevo = {
    id: siguienteId(lista),
    clienteId: cliente.id,
    proyectoId: proyecto?.id ?? null,
    nombreVisible: nombreVisible(nombreDelCliente(cliente.id) ?? cliente.nombre),
    puntuacion: estrellas,
    comentario: mensaje,
    estado: 'PENDIENTE',
    fechaCreacion: new Date().toISOString(),
    fechaRevision: null,
    revisadoPor: null,
  }
  guardarColeccion(CLAVES.testimonios, [...lista, nuevo])
  return nuevo
}

/** GET /api/admin/testimonios — todos, con el nombre completo del cliente para revisarlos. */
export async function getTestimoniosAdmin() {
  await esperar()
  exigirAdmin()
  return leerColeccion(CLAVES.testimonios)
    .map((t) => ({
      ...t,
      nombreCliente: nombreDelCliente(t.clienteId),
      codigoCliente: getClienteMockById(t.clienteId)?.codigo ?? null,
      proyecto: getProyectoById(t.proyectoId)?.nombre ?? null,
    }))
    .sort(porFechaDesc)
}

/** PATCH /api/admin/testimonios/:id — publicar u ocultar. Al publicarse se avisa al cliente. */
export async function cambiarEstadoTestimonio(id, estado) {
  await esperar()
  const admin = exigirAdmin()
  if (!['PUBLICADO', 'OCULTO'].includes(estado)) throw new Error('El estado no es válido.')
  const lista = leerColeccion(CLAVES.testimonios)
  const actual = lista.find((t) => mismoId(t.id, id))
  if (!actual) throw new Error('No encontramos ese testimonio.')
  if (actual.estado === estado) return actual

  const actualizado = { ...actual, estado, fechaRevision: new Date().toISOString(), revisadoPor: { id: admin.id, nombre: admin.nombre } }
  guardarColeccion(CLAVES.testimonios, lista.map((t) => (t === actual ? actualizado : t)))
  if (estado === 'PUBLICADO') {
    publicar(EVENTOS.testimonioPublicado, { clienteId: actual.clienteId })
  }
  return actualizado
}

/** DELETE /api/admin/testimonios/:id */
export async function eliminarTestimonio(id) {
  await esperar()
  exigirAdmin()
  const lista = leerColeccion(CLAVES.testimonios)
  if (!lista.some((t) => mismoId(t.id, id))) throw new Error('No encontramos ese testimonio.')
  guardarColeccion(CLAVES.testimonios, lista.filter((t) => !mismoId(t.id, id)))
}

// ── Contenido publicado por la empresa (solo lectura pública) ──────────────────────────────────
// Noticias, galería, historias, reconocimientos e inversionistas empiezan VACÍOS: el sitio muestra un
// estado vacío hasta que la API entregue contenido real. Solo se muestra lo que está PUBLICADO.

/** Proyecto resumido para mostrar junto al contenido: { id, nombre } o null. */
const proyectoResumido = (proyectoId) => {
  const proyecto = getProyectoById(proyectoId)
  return proyecto ? { id: proyecto.id, nombre: proyecto.nombre } : null
}

/** GET /api/noticias — noticias y novedades publicadas (más recientes primero; a igual fecha, por orden). */
export async function getNoticias() {
  await esperar()
  return leerColeccion(CLAVES.noticias)
    .filter(esPublicado)
    .sort((a, b) => String(b.fecha ?? '').localeCompare(String(a.fecha ?? '')) || porOrden(a, b))
}

/** GET /api/galeria?proyectoId= — imágenes y videos publicados, en su orden (opcionalmente de un proyecto). */
export async function getGaleria({ proyectoId = null } = {}) {
  await esperar()
  return leerColeccion(CLAVES.galeria)
    .filter(esPublicado)
    .filter((m) => proyectoId === null || mismoId(m.proyectoId, proyectoId))
    .sort(porOrden)
    .map((m) => ({ ...m, proyecto: proyectoResumido(m.proyectoId) }))
}

/** GET /api/historias-compradores — solo las publicadas (más recientes primero). */
export async function getHistoriasCompradores() {
  await esperar()
  return leerColeccion(CLAVES.historiasCompradores)
    .filter(esPublicado)
    .sort(porFechaReciente)
    .map((h) => ({ ...h, proyecto: proyectoResumido(h.proyectoId) }))
}

/** GET /api/reconocimientos — solo los publicados (más recientes primero). */
export async function getReconocimientos() {
  await esperar()
  return leerColeccion(CLAVES.reconocimientos).filter(esPublicado).sort((a, b) => (b.anio ?? 0) - (a.anio ?? 0) || b.id - a.id)
}

/** GET /api/contenido-inversionistas — bloques publicados, en su orden. */
export async function getContenidoInversionistas() {
  await esperar()
  return leerColeccion(CLAVES.contenidoInversionistas).filter(esPublicado).sort(porOrden)
}

/**
 * GET /api/redes-sociales — { plataforma, url, icono, estado, confirmada }. Solo una red ACTIVA con
 * una URL real se muestra como enlace; las demás, "Por confirmar".
 */
export async function getRedesSociales() {
  return redesSocialesEmpresa.map(conRedConfirmada)
}

/** Proyectos para los selectores de contenido (testimonio o galería por proyecto): [{ id, nombre }]. */
export async function getProyectosParaContenido() {
  return proyectos.map((p) => ({ id: p.id, nombre: p.nombre }))
}
