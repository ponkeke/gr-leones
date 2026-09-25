// Lectura/escritura segura de localStorage: en modo privado, con el almacenamiento bloqueado o con
// un valor corrupto, las funciones no rompen la página (devuelven `respaldo` / no hacen nada).
export const CLAVES = {
  sesion: 'usuarioSesion',
  // Cambios del cliente en "Mi perfil" ({ [clienteId]: { nombre, telefono, ... } }). Solo en este navegador.
  perfilesClientes: 'perfilesClientesMock',
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
