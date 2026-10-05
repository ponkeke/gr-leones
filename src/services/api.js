// FACHADA DE DATOS: el ÚNICO punto que usan las pantallas para leer y guardar datos.
// No contiene lógica: cada función delega en la estrategia activa (patrón Strategy), elegida en
// `./fuenteDatos.js`:
//   · mock → `./mock/`  datos de prueba en el navegador (hoy, sin API).
//   · http → `./http/`  API REST real; sus respuestas pasan por `./http/adaptadores.js` (Adapter).
// Las dos estrategias exportan los mismos nombres con la misma forma de respuesta, así que cambiar
// de mock a API real no toca ninguna pantalla. Endpoints y entidades: docs/CONTRATO_API.md.
//
// Archivo generado a partir de las estrategias: si se agrega una función, agregarla en `./mock/`
// y en `./http/` con el mismo nombre, y aquí su delegador.
import { fuente } from './fuenteDatos'

export { nombreFuente as fuenteDeDatosActiva } from './fuenteDatos'
export { METRICAS_RANKING, TIPOS_ACTIVIDAD } from '../data/reportes'


// ── Comercial: proyectos, lotes, asesores, disponibilidad, visitas, solicitudes, seguimiento, cliente, administración y cuentas ──
export const getProyectos = (...args) => fuente.getProyectos(...args)
export const getProyecto = (...args) => fuente.getProyecto(...args)
export const getLotesDeProyecto = (...args) => fuente.getLotesDeProyecto(...args)
export const getLote = (...args) => fuente.getLote(...args)
export const getTodosLosLotes = (...args) => fuente.getTodosLosLotes(...args)
export const getComunicados = (...args) => fuente.getComunicados(...args)
export const getAsesores = (...args) => fuente.getAsesores(...args)
export const crearSolicitud = (...args) => fuente.crearSolicitud(...args)
export const actualizarSolicitud = (...args) => fuente.actualizarSolicitud(...args)
export const getSolicitudesDeCliente = (...args) => fuente.getSolicitudesDeCliente(...args)
export const getSolicitudesDeAsesor = (...args) => fuente.getSolicitudesDeAsesor(...args)
export const getDisponibilidadDeAsesor = (...args) => fuente.getDisponibilidadDeAsesor(...args)
export const guardarHorarioSemanal = (...args) => fuente.guardarHorarioSemanal(...args)
export const guardarHorarioDeFecha = (...args) => fuente.guardarHorarioDeFecha(...args)
export const getFechasDisponibles = (...args) => fuente.getFechasDisponibles(...args)
export const getHorariosVisita = (...args) => fuente.getHorariosVisita(...args)
export const crearVisita = (...args) => fuente.crearVisita(...args)
export const actualizarVisita = (...args) => fuente.actualizarVisita(...args)
export const getVisitasDeCliente = (...args) => fuente.getVisitasDeCliente(...args)
export const getAgendaDeAsesor = (...args) => fuente.getAgendaDeAsesor(...args)
export const getCarteraDeAsesor = (...args) => fuente.getCarteraDeAsesor(...args)
export const actualizarSeguimiento = (...args) => fuente.actualizarSeguimiento(...args)
export const getHistorialDeCliente = (...args) => fuente.getHistorialDeCliente(...args)
export const getNotificaciones = (...args) => fuente.getNotificaciones(...args)
export const marcarNotificacionesLeidas = (...args) => fuente.marcarNotificacionesLeidas(...args)
export const getCliente = (...args) => fuente.getCliente(...args)
export const getClienteDeSesion = (...args) => fuente.getClienteDeSesion(...args)
export const actualizarPerfilCliente = (...args) => fuente.actualizarPerfilCliente(...args)
export const getLotesDeCliente = (...args) => fuente.getLotesDeCliente(...args)
export const getDocumentosDeCliente = (...args) => fuente.getDocumentosDeCliente(...args)
export const getResumenCliente = (...args) => fuente.getResumenCliente(...args)
export const getAsesor = (...args) => fuente.getAsesor(...args)
export const getResumenAsesor = (...args) => fuente.getResumenAsesor(...args)
export const getResumenAdmin = (...args) => fuente.getResumenAdmin(...args)
export const getClientesAdmin = (...args) => fuente.getClientesAdmin(...args)
export const getAsesoresAdmin = (...args) => fuente.getAsesoresAdmin(...args)
export const getSolicitudesAdmin = (...args) => fuente.getSolicitudesAdmin(...args)
export const getVisitasAdmin = (...args) => fuente.getVisitasAdmin(...args)
export const getSeparaciones = (...args) => fuente.getSeparaciones(...args)
export const reasignarCliente = (...args) => fuente.reasignarCliente(...args)
export const registrarSeparacion = (...args) => fuente.registrarSeparacion(...args)
export const crearCliente = (...args) => fuente.crearCliente(...args)
export const verificarCodigoActivacion = (...args) => fuente.verificarCodigoActivacion(...args)
export const activarCuentaCliente = (...args) => fuente.activarCuentaCliente(...args)

// ── Autenticación (la sesión local se lee desde ./sesion.js) ──
export const iniciarSesion = (...args) => fuente.iniciarSesion(...args)
export const cerrarSesion = (...args) => fuente.cerrarSesion(...args)

// ── Contenido público ──
export const getPreguntasFrecuentes = (...args) => fuente.getPreguntasFrecuentes(...args)
export const getPreguntasFrecuentesAdmin = (...args) => fuente.getPreguntasFrecuentesAdmin(...args)
export const crearPreguntaFrecuente = (...args) => fuente.crearPreguntaFrecuente(...args)
export const actualizarPreguntaFrecuente = (...args) => fuente.actualizarPreguntaFrecuente(...args)
export const eliminarPreguntaFrecuente = (...args) => fuente.eliminarPreguntaFrecuente(...args)
export const getTestimoniosPublicados = (...args) => fuente.getTestimoniosPublicados(...args)
export const getResumenSatisfaccion = (...args) => fuente.getResumenSatisfaccion(...args)
export const getMisTestimonios = (...args) => fuente.getMisTestimonios(...args)
export const crearTestimonio = (...args) => fuente.crearTestimonio(...args)
export const getTestimoniosAdmin = (...args) => fuente.getTestimoniosAdmin(...args)
export const cambiarEstadoTestimonio = (...args) => fuente.cambiarEstadoTestimonio(...args)
export const eliminarTestimonio = (...args) => fuente.eliminarTestimonio(...args)
export const getNoticias = (...args) => fuente.getNoticias(...args)
export const getGaleria = (...args) => fuente.getGaleria(...args)
export const getHistoriasCompradores = (...args) => fuente.getHistoriasCompradores(...args)
export const getReconocimientos = (...args) => fuente.getReconocimientos(...args)
export const getContenidoInversionistas = (...args) => fuente.getContenidoInversionistas(...args)
export const getRedesSociales = (...args) => fuente.getRedesSociales(...args)
export const getProyectosParaContenido = (...args) => fuente.getProyectosParaContenido(...args)

// ── Reportes de administración ──
export const getIndicadoresComerciales = (...args) => fuente.getIndicadoresComerciales(...args)
export const getIndiceConversion = (...args) => fuente.getIndiceConversion(...args)
export const getRankingAsesores = (...args) => fuente.getRankingAsesores(...args)
export const getEstadisticasGenerales = (...args) => fuente.getEstadisticasGenerales(...args)
export const getActividadReciente = (...args) => fuente.getActividadReciente(...args)
export const suscribirActividad = (...args) => fuente.suscribirActividad(...args)

// ── Solo desarrollo: reconstruye los datos de prueba (en la estrategia http no hace nada) ──
export const resetMockData = (...args) => fuente.resetMockData(...args)
