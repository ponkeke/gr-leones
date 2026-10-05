// Reglas de formato compartidas de DNI, celular/teléfono y correo. Funciones puras: reciben un texto
// YA preparado por quien las llama (con `trim`, sin espacios, etc., según el formulario o servicio) y
// solo responden si cumple el formato. NO deciden mensajes, ni qué es "vacío", ni cómo se normaliza:
// eso sigue en cada formulario (`components/Solicitud/utilidades.js`) y en cada servicio del Mock
// (`services/mock/comercial.js`), que hoy normalizan distinto a propósito (p. ej. el celular de los
// formularios públicos acepta +51, espacios y guiones; el del alta de clientes solo espacios).

/** Correo con forma `algo@algo.algo`, sin espacios. */
export const esCorreoValido = (texto) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)

/** DNI peruano: exactamente 8 dígitos. */
export const esDniValido = (texto) => /^\d{8}$/.test(texto)

/** Celular peruano: 9 dígitos y el primero es 9. */
export const esCelularConNueveInicial = (texto) => /^9\d{8}$/.test(texto)

/** Teléfono de exactamente 9 dígitos, sin exigir el primero (regla de "Mi perfil"). */
export const esNumeroDeNueveDigitos = (texto) => /^\d{9}$/.test(texto)

/**
 * Preparación del celular de los formularios públicos: quita espacios y guiones, y el prefijo `+51` /
 * `51` solo cuando lo que queda es un celular de 9 dígitos que empieza con 9.
 */
export const quitarSeparadoresYPrefijoDeCelular = (valor) => valor.replace(/[\s-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '')
