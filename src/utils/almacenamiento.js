// Lectura/escritura segura de localStorage: en modo privado, con el almacenamiento bloqueado o con
// un valor corrupto, las funciones no rompen la página (devuelven `respaldo` / no hacen nada).
export const CLAVES = {
  sesion: 'usuarioSesion',
  // Cambios del cliente en "Mi perfil" ({ [clienteId]: { nombre, telefono, ... } }). Solo en este navegador.
  perfilesClientes: 'perfilesClientesMock',
  // Almacén mock persistente del área interna (lo lee y escribe solo `services/api.js`).
  solicitudes: 'leones_solicitudes',
  visitas: 'leones_visitas',
  seguimiento: 'leones_seguimiento',
  historial: 'leones_historial',
  notificaciones: 'leones_notificaciones',
  // Clientes dados de alta por administración (los de clientesMock NO se copian aquí).
  clientes: 'leones_clientes',
  // Separaciones de lotes (quién, cuándo, qué lote, qué cliente y asesor).
  separaciones: 'leones_separaciones',
  // Horarios en que cada asesor recibe visitas (semanal + excepciones por fecha). Ver data/disponibilidad.js.
  disponibilidad: 'leones_disponibilidad',
  // Contenido público (tablas futuras: testimonios, preguntas_frecuentes, historias_compradores,
  // reconocimientos, contenido_inversionistas).
  testimonios: 'leones_testimonios',
  preguntasFrecuentes: 'leones_preguntas_frecuentes',
  historiasCompradores: 'leones_historias_compradores',
  reconocimientos: 'leones_reconocimientos',
  contenidoInversionistas: 'leones_contenido_inversionistas',
  noticias: 'leones_noticias',
  galeria: 'leones_galeria',
  // Versión de los datos iniciales: si cambia, `api.js` vuelve a cargar los mocks.
  versionDatos: 'leones_mock_version',
}

export function leerJSON(clave, respaldo = null) {
  try {
    const texto = window.localStorage.getItem(clave)
    return texto === null ? respaldo : JSON.parse(texto)
  } catch {
    return respaldo
  }
}

export function guardarJSON(clave, valor) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

export function borrar(clave) {
  try {
    window.localStorage.removeItem(clave)
  } catch {
    // Sin acceso al almacenamiento no hay nada que borrar.
  }
}
