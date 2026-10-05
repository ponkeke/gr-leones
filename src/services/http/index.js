// ESTRATEGIA HTTP de la fuente de datos: implementa el MISMO contrato que `../mock/index.js`, pero
// contra la API REST real (Express + PostgreSQL). Se activa con VITE_API_URL (ver `../fuenteDatos.js`).
//
// Cada función llama al endpoint propuesto en `docs/CONTRATO_API.md` y pasa la respuesta por su
// adaptador (`./adaptadores.js`), para que las pantallas reciban exactamente la misma forma que con el
// mock. Las reglas de negocio (validaciones, permisos, historial, notificaciones) las aplica la API;
// aquí no se repiten. Si un endpoint definitivo cambia, se ajusta la ruta aquí y nada más.
import { redesSocialesEmpresa } from '../../data/redesSociales'
import { ERRORES_AUTENTICACION, conRedConfirmada, errorDeAutenticacion, proximaVisita, tarjetaDeNoticia, tarjetasDelPlano } from '../compartido'
import { TIPOS_USUARIO, borrarSesion, guardarSesion, obtenerUsuarioSesion } from '../sesion'
import { API_URL, ErrorApi, solicitar } from './cliente'
import {
  adaptarAsesor,
  adaptarBloqueInversionista,
  adaptarCliente,
  adaptarDisponibilidad,
  adaptarErrorDeHorario,
  adaptarEventoActividad,
  adaptarEventoHistorial,
  adaptarFechasDisponibles,
  adaptarHistoria,
  adaptarHorario,
  adaptarLote,
  adaptarLoteDeCliente,
  adaptarMultimedia,
  adaptarNoticia,
  adaptarNotificacion,
  adaptarPregunta,
  adaptarProyecto,
  adaptarReconocimiento,
  adaptarRedSocial,
  adaptarRegistroComercial,
  adaptarResumenAsesor,
  adaptarResumenCliente,
  adaptarSeguimiento,
  adaptarTestimonio,
  lista,
  sinCambios,
} from './adaptadores'

export { METRICAS_RANKING, TIPOS_ACTIVIDAD } from '../../data/reportes'

const get = (ruta, consulta) => solicitar(ruta, { consulta })
const enviar = (metodo, ruta, cuerpo) => solicitar(ruta, { metodo, cuerpo })

// ── Proyectos y lotes ──────────────────────────────────────────────────────────────────────────
export const getProyectos = async () => lista(adaptarProyecto)(await get('/proyectos'))
export const getProyecto = async (id) => adaptarProyecto(await get(`/proyectos/${id}`))
export const getLotesDeProyecto = async (proyectoId) => lista(adaptarLote)(await get(`/proyectos/${proyectoId}/lotes`))
export const getLote = async (id) => adaptarLote(await get(`/lotes/${id}`))
export const getTodosLosLotes = async () => lista(adaptarLote)(await get('/lotes'))

/** /comunicados: noticias publicadas de la API + hechos de los planos (misma lógica que el mock). */
export async function getComunicados() {
  const [noticias, proyectos] = await Promise.all([getNoticias(), getProyectos()])
  const imagenPorDefecto = proyectos[0]?.imagen ?? null
  return [...noticias.map((n) => tarjetaDeNoticia(n, imagenPorDefecto)), ...tarjetasDelPlano(proyectos)]
}

// ── Asesores y disponibilidad ──────────────────────────────────────────────────────────────────
export const getAsesores = async () => lista(adaptarAsesor)(await get('/asesores'))
export const getAsesor = async (id) => adaptarAsesor(await get(`/asesores/${id}`))
export const getDisponibilidadDeAsesor = async (asesorId) => adaptarDisponibilidad(await get(`/asesores/${asesorId}/disponibilidad`))
export const guardarHorarioSemanal = async (diaSemana, horas) =>
  adaptarDisponibilidad(await enviar('PUT', `/asesores/me/disponibilidad/semanal/${diaSemana}`, { horas }))
export const guardarHorarioDeFecha = async (fecha, horas) =>
  adaptarDisponibilidad(await enviar('PUT', `/asesores/me/disponibilidad/fechas/${fecha}`, { horas }))
export const getFechasDisponibles = async (asesorId) => adaptarFechasDisponibles(await get(`/asesores/${asesorId}/fechas-disponibles`))
export const getHorariosVisita = async ({ asesorId, fecha }) => lista(adaptarHorario)(await get('/visitas/horarios', { asesorId, fecha }))

// ── Visitas ────────────────────────────────────────────────────────────────────────────────────
export async function crearVisita(datos) {
  try {
    return adaptarRegistroComercial(await enviar('POST', '/visitas', datos))
  } catch (error) {
    throw adaptarErrorDeHorario(error)
  }
}
export const actualizarVisita = async (id, { estado }) => adaptarRegistroComercial(await enviar('PATCH', `/visitas/${id}`, { estado }))

/** { visitas, proxima }: si la API devuelve solo la lista, la próxima se calcula igual que en el mock. */
export async function getVisitasDeCliente(clienteId) {
  const respuesta = await get(`/clientes/${clienteId}/visitas`)
  const visitas = lista(adaptarRegistroComercial)(Array.isArray(respuesta) ? respuesta : respuesta?.visitas ?? respuesta)
  const proxima = respuesta?.proxima !== undefined ? adaptarRegistroComercial(respuesta.proxima) : proximaVisita(visitas)
  return { visitas, proxima }
}
export const getAgendaDeAsesor = async (asesorId) => lista(adaptarRegistroComercial)(await get(`/asesores/${asesorId}/visitas`))

// ── Solicitudes y seguimiento ──────────────────────────────────────────────────────────────────
export const crearSolicitud = async (datos) => adaptarRegistroComercial(await enviar('POST', '/solicitudes', datos))
export const actualizarSolicitud = async (id, { estado }) => adaptarRegistroComercial(await enviar('PATCH', `/solicitudes/${id}`, { estado }))
export const getSolicitudesDeCliente = async (clienteId) => lista(adaptarRegistroComercial)(await get(`/clientes/${clienteId}/solicitudes`))
export const getSolicitudesDeAsesor = async (asesorId) => lista(adaptarRegistroComercial)(await get(`/asesores/${asesorId}/solicitudes`))
export const getCarteraDeAsesor = async (asesorId) => lista(adaptarSeguimiento)(await get(`/asesores/${asesorId}/clientes`))
export const actualizarSeguimiento = async (id, cambios = {}) => adaptarSeguimiento(await enviar('PATCH', `/seguimiento/${id}`, cambios))

// ── Cliente ────────────────────────────────────────────────────────────────────────────────────
export const getCliente = async (id) => adaptarCliente(await get(`/clientes/${id}`))

/** Cliente en sesión o null. Sin sesión de cliente no se consulta la API (visitantes, asesores, admin). */
export async function getClienteDeSesion() {
  if (obtenerUsuarioSesion()?.tipo !== 'cliente') return null
  return adaptarCliente(await get('/clientes/me'))
}
export const actualizarPerfilCliente = async (id, cambios) => adaptarCliente(await enviar('PUT', `/clientes/${id}`, cambios))
export const getLotesDeCliente = async (clienteId) => lista(adaptarLoteDeCliente)(await get(`/clientes/${clienteId}/lotes`))
export const getDocumentosDeCliente = async (clienteId) => lista(adaptarRegistroComercial)(await get(`/clientes/${clienteId}/documentos`))
export const getHistorialDeCliente = async (clienteId) => lista(adaptarEventoHistorial)(await get(`/clientes/${clienteId}/historial`))
export const getResumenCliente = async (clienteId) => adaptarResumenCliente(await get(`/clientes/${clienteId}/resumen`))

// ── Notificaciones ─────────────────────────────────────────────────────────────────────────────
// La API identifica al usuario por su token; tipo e id se envían solo como referencia.
export const getNotificaciones = async (tipoUsuario, usuarioId) =>
  lista(adaptarNotificacion)(await get('/notificaciones', { tipo: tipoUsuario, usuarioId }))
export const marcarNotificacionesLeidas = async (ids) => lista(adaptarNotificacion)(await enviar('PATCH', '/notificaciones/leidas', { ids }))

// ── Paneles de asesor y administración ─────────────────────────────────────────────────────────
export const getResumenAsesor = async (asesorId) => adaptarResumenAsesor(await get(`/asesores/${asesorId}/resumen`))
export const getResumenAdmin = async () => sinCambios(await get('/admin/resumen'))
export const getClientesAdmin = async () => lista(adaptarCliente)(await get('/admin/clientes'))
export const getAsesoresAdmin = async () => lista(adaptarAsesor)(await get('/admin/asesores'))
export const getSolicitudesAdmin = async () => lista(adaptarRegistroComercial)(await get('/admin/solicitudes'))
export const getVisitasAdmin = async () => lista(adaptarRegistroComercial)(await get('/admin/visitas'))
export const getSeparaciones = async () => lista(adaptarRegistroComercial)(await get('/admin/separaciones'))
export const reasignarCliente = async (clienteId, nuevoAsesorId) =>
  adaptarCliente(await enviar('PATCH', `/admin/clientes/${clienteId}/asesor`, { asesorId: nuevoAsesorId }))
export const registrarSeparacion = async (clienteId, loteCodigo) =>
  adaptarRegistroComercial(await enviar('POST', '/separaciones', { clienteId, loteCodigo }))

// ── Inicio y cierre de sesión ──────────────────────────────────────────────────────────────────
// POST /api/auth/login (docs/CONTRATO_API.md): usuario o código + contraseña → token + usuario
// { id, codigo, nombre, tipo, cargo }. `tipo` (la pestaña elegida) se envía como dato de apoyo: la API
// debe verificar a qué tipo pertenece la cuenta, y aquí además se rechaza una respuesta de otro tipo.
// El 401/404 del login significa credenciales incorrectas (no es una sesión vencida) y se muestra un
// mensaje único. 403 con `{ codigo: 'CUENTA_PENDIENTE' }` es una PROPUESTA aún sin confirmar con la API.
// No hay endpoint de logout documentado: cerrar sesión solo borra la sesión local (ver CONTRATO_API.md §5).
export async function iniciarSesion({ tipo, usuario, password }) {
  let datos
  try {
    datos = await solicitar('/auth/login', { metodo: 'POST', cuerpo: { usuario, password, tipo } })
  } catch (error) {
    if (!(error instanceof ErrorApi) || error.estado === undefined) throw error
    if (error.estado === 403 && error.datos?.codigo === ERRORES_AUTENTICACION.cuentaPendiente) {
      throw errorDeAutenticacion(ERRORES_AUTENTICACION.cuentaPendiente, error.message)
    }
    if ([400, 401, 403, 404, 422].includes(error.estado)) throw errorDeAutenticacion(ERRORES_AUTENTICACION.credenciales)
    throw error
  }

  const cuenta = datos?.usuario
  const token = typeof datos?.token === 'string' && datos.token ? datos.token : null
  const valida = cuenta && token && cuenta.id !== undefined && cuenta.id !== null && TIPOS_USUARIO[cuenta.tipo] && cuenta.tipo === tipo
  if (!valida) throw errorDeAutenticacion(ERRORES_AUTENTICACION.credenciales)
  return guardarSesion(cuenta, token)
}

export async function cerrarSesion() {
  borrarSesion()
}

// ── Alta y activación de cuentas ───────────────────────────────────────────────────────────────
export const crearCliente = async (datos) => adaptarCliente(await enviar('POST', '/admin/clientes', datos))
export const verificarCodigoActivacion = async ({ codigo, dni }) => sinCambios(await enviar('POST', '/auth/activacion/verificar', { codigo, dni }))
export const activarCuentaCliente = async (datos) => sinCambios(await enviar('POST', '/auth/activacion', datos))

// ── Contenido ──────────────────────────────────────────────────────────────────────────────────
export const getPreguntasFrecuentes = async () => lista(adaptarPregunta)(await get('/preguntas-frecuentes'))
export const getPreguntasFrecuentesAdmin = async () => lista(adaptarPregunta)(await get('/admin/preguntas-frecuentes'))
export const crearPreguntaFrecuente = async (datos) => adaptarPregunta(await enviar('POST', '/admin/preguntas-frecuentes', datos))
export const actualizarPreguntaFrecuente = async (id, cambios) => adaptarPregunta(await enviar('PATCH', `/admin/preguntas-frecuentes/${id}`, cambios))
export const eliminarPreguntaFrecuente = async (id) => {
  await enviar('DELETE', `/admin/preguntas-frecuentes/${id}`)
}

export const getTestimoniosPublicados = async () => lista(adaptarTestimonio)(await get('/testimonios'))
export const getResumenSatisfaccion = async () => sinCambios(await get('/testimonios/resumen'))
export const getMisTestimonios = async () => lista(adaptarTestimonio)(await get('/clientes/me/testimonios'))
export const crearTestimonio = async (datos) => adaptarTestimonio(await enviar('POST', '/testimonios', datos))
export const getTestimoniosAdmin = async () => lista(adaptarTestimonio)(await get('/admin/testimonios'))
export const cambiarEstadoTestimonio = async (id, estado) => adaptarTestimonio(await enviar('PATCH', `/admin/testimonios/${id}`, { estado }))
export const eliminarTestimonio = async (id) => {
  await enviar('DELETE', `/admin/testimonios/${id}`)
}

export const getNoticias = async () => lista(adaptarNoticia)(await get('/noticias'))
export const getGaleria = async ({ proyectoId = null } = {}) => lista(adaptarMultimedia)(await get('/galeria', { proyectoId }))
export const getHistoriasCompradores = async () => lista(adaptarHistoria)(await get('/historias-compradores'))
export const getReconocimientos = async () => lista(adaptarReconocimiento)(await get('/reconocimientos'))
export const getContenidoInversionistas = async () => lista(adaptarBloqueInversionista)(await get('/contenido-inversionistas'))

/** Redes oficiales desde la API; si todavía no existe el endpoint, las de la configuración local. */
export async function getRedesSociales() {
  try {
    return lista(adaptarRedSocial)(await get('/redes-sociales')).map(conRedConfirmada)
  } catch {
    return redesSocialesEmpresa.map(conRedConfirmada)
  }
}
export const getProyectosParaContenido = async () => (await getProyectos()).map((p) => ({ id: p.id, nombre: p.nombre }))

// ── Reportes (los calcula la API) ──────────────────────────────────────────────────────────────
export const getIndicadoresComerciales = async () => sinCambios(await get('/admin/indicadores'))
export const getIndiceConversion = async () => sinCambios(await get('/admin/conversion'))
export const getRankingAsesores = async () => sinCambios(await get('/admin/ranking-asesores'))
export const getEstadisticasGenerales = async () => sinCambios(await get('/admin/estadisticas'))
export const getActividadReciente = async ({ tipo = null, limite = 60 } = {}) =>
  lista(adaptarEventoActividad)(await get('/admin/actividad', { tipo, limite }))

/**
 * Tiempo real entre dispositivos: se suscribe al flujo SSE propuesto `/api/admin/actividad/stream`.
 * Cada mensaje del servidor dispara `alCambiar()`. Devuelve `cancelar()`. Si el navegador no
 * soporta EventSource, no se suscribe (la pantalla sigue teniendo el botón "Actualizar").
 */
export function suscribirActividad(alCambiar) {
  if (typeof EventSource === 'undefined' || !API_URL) return () => {}
  const fuente = new EventSource(`${API_URL}/api/admin/actividad/stream`)
  fuente.onmessage = () => alCambiar()
  return () => fuente.close()
}

/** Solo existe en la estrategia mock: con la API real no hay datos locales que reconstruir. */
export function resetMockData() {}
