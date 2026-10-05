// Almacén de datos del frontend (repositorio mock). Es la ÚNICA capa que toca localStorage para
// datos de negocio. Con el backend real, este archivo desaparece: los módulos de `src/services/`
// pasan a llamar a Express (`fetch`) y las colecciones son tablas de PostgreSQL.
import { seguimientoMock } from '../../data/seguimientoMock'
import { solicitudesMock } from '../../data/solicitudesMock'
import { visitasMock } from '../../data/visitasMock'
import { historialMock } from '../../data/historialMock'
import { notificacionesMock } from '../../data/notificacionesMock'
import { preguntasFrecuentesIniciales } from '../../data/preguntasFrecuentes'
import { fechaLocalISO } from '../../utils/formato'
import { CLAVES, borrar, guardarJSON, leerJSON } from '../../utils/almacenamiento'
import { obtenerUsuarioSesion } from '../sesion'

// Latencia de red simulada para que las pantallas muestren sus estados de carga como con el backend.
const LATENCIA_SIMULADA_MS = 250

export function esperar(ms = LATENCIA_SIMULADA_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


// ─────────────────────────────────────────────────────────────────────────────────────────────
// ALMACÉN MOCK PERSISTENTE (localStorage). Cada colección de aquí equivale a una tabla futura de
// PostgreSQL (solicitudes, visitas, seguimiento, historial, notificaciones, separaciones,
// disponibilidad, clientes, testimonios, preguntas_frecuentes, historias_compradores,
// reconocimientos, contenido_inversionistas, noticias, galeria). Solo lo usan los módulos de `src/services/`: las
// pantallas NUNCA leen localStorage, siempre pasan por `services/api.js`. La primera vez se cargan
// los datos iniciales; después no se sobrescriben.
// ─────────────────────────────────────────────────────────────────────────────────────────────

const DATOS_INICIALES = {
  [CLAVES.solicitudes]: solicitudesMock,
  [CLAVES.visitas]: visitasMock,
  [CLAVES.seguimiento]: seguimientoMock,
  [CLAVES.historial]: historialMock,
  [CLAVES.notificaciones]: notificacionesMock,
  // No hay separaciones de ejemplo: solo existen las que registre administración.
  [CLAVES.separaciones]: [],
  // Sin horarios de ejemplo: solo existen los que cada asesor configure en "Mi disponibilidad".
  [CLAVES.disponibilidad]: [],
  // Solo los clientes que da de alta administración (los de clientesMock no se copian).
  [CLAVES.clientes]: [],
  // Contenido público: vacío hasta que administración (o la BD) lo cargue. Nada se inventa.
  [CLAVES.testimonios]: [],
  [CLAVES.historiasCompradores]: [],
  [CLAVES.reconocimientos]: [],
  [CLAVES.contenidoInversionistas]: [],
  [CLAVES.noticias]: [],
  [CLAVES.galeria]: [],
  // Preguntas frecuentes sobre cómo funciona este sitio (ver data/preguntasFrecuentes.js).
  [CLAVES.preguntasFrecuentes]: preguntasFrecuentesIniciales,
}

// Subir este número cuando cambie la FORMA de los datos iniciales: al detectarlo, el almacén se
// vuelve a construir con los mocks (se pierden los cambios hechos en el navegador).
const VERSION_DATOS = 2

// Respaldo en memoria si el navegador no permite localStorage (modo privado estricto): la demo
// sigue funcionando durante la visita, solo que sin persistir.
const memoria = {}
let versionRevisada = false

const copiar = (valor) => structuredClone(valor)

/**
 * Borra el almacén mock (y los perfiles editados) y lo reconstruye con los datos iniciales.
 * Utilidad de desarrollo: en `yarn dev` también está en la consola como `leonesResetMockData()`.
 */
export function resetMockData() {
  Object.entries(DATOS_INICIALES).forEach(([clave, datos]) => {
    memoria[clave] = copiar(datos)
    guardarJSON(clave, memoria[clave])
  })
  borrar(CLAVES.perfilesClientes)
  guardarJSON(CLAVES.versionDatos, VERSION_DATOS)
  versionRevisada = true
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.leonesResetMockData = resetMockData
}

function asegurarVersion() {
  if (versionRevisada) return
  versionRevisada = true
  if (leerJSON(CLAVES.versionDatos) !== VERSION_DATOS) resetMockData()
}

export function leerColeccion(clave) {
  asegurarVersion()
  const guardado = leerJSON(clave)
  if (Array.isArray(guardado)) return guardado
  // Sin datos guardados (o bloqueado): se usa la copia en memoria, sembrada con los mocks.
  memoria[clave] ??= copiar(DATOS_INICIALES[clave])
  guardarJSON(clave, memoria[clave])
  return memoria[clave]
}

// Evento del navegador que avisa que una colección cambió (en esta pestaña). Las demás pestañas
// reciben el evento nativo 'storage'. Con el backend, este aviso lo dará el servidor (SSE/WebSocket).
export const EVENTO_ALMACEN = 'leones:almacen'

export function guardarColeccion(clave, lista) {
  memoria[clave] = lista
  guardarJSON(clave, lista)
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENTO_ALMACEN, { detail: { clave } }))
}

export const siguienteId = (lista) => lista.reduce((maximo, r) => Math.max(maximo, Number(r.id) || 0), 0) + 1
export const mismoId = (a, b) => a !== null && a !== undefined && String(a) === String(b)

/** Sesión actual solo si es de cliente / de asesor / de admin (la identidad la da `usuarioSesion`). */
export function clienteDeSesion() {
  const sesion = obtenerUsuarioSesion()
  return sesion?.tipo === 'cliente' ? sesion : null
}

export function asesorDeSesion() {
  const sesion = obtenerUsuarioSesion()
  return sesion?.tipo === 'asesor' ? sesion : null
}

export function adminDeSesion() {
  const sesion = obtenerUsuarioSesion()
  return sesion?.tipo === 'admin' ? sesion : null
}

// ── Eventos: historial del comprador y notificaciones ──────────────────────────────────────────

/** Agrega un evento al historial del cliente (los visitantes sin cuenta no tienen historial). */
export function crearEventoHistorial(clienteId, titulo, detalle) {
  if (clienteId === null || clienteId === undefined) return
  const lista = leerColeccion(CLAVES.historial)
  guardarColeccion(CLAVES.historial, [
    ...lista,
    { id: siguienteId(lista), clienteId, fecha: fechaLocalISO(), titulo, detalle },
  ])
}

/** Crea una notificación para un cliente o un asesor (`destinatarioTipo`: 'cliente' | 'asesor'). */
export function crearNotificacion(destinatarioTipo, destinatarioId, titulo, mensaje) {
  if (destinatarioId === null || destinatarioId === undefined) return
  const lista = leerColeccion(CLAVES.notificaciones)
  guardarColeccion(CLAVES.notificaciones, [
    ...lista,
    { id: siguienteId(lista), destinatarioTipo, destinatarioId, fecha: fechaLocalISO(), titulo, mensaje, leida: false },
  ])
}
