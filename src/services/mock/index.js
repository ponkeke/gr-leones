// ESTRATEGIA MOCK de la fuente de datos: implementa el contrato de `services/api.js` guardando todo
// en el navegador (almacén mock). Es la que se usa mientras no haya API real configurada.
// Debe exportar EXACTAMENTE los mismos nombres que `../http/index.js` (lo verifica `../fuenteDatos.js`).
import { registrarSuscriptores } from './suscriptores'

export * from './auth'
export * from './comercial'
export * from './contenido'
export * from './reportes'
export { resetMockData } from './almacen'

// Historial y notificaciones nacen de los eventos de dominio (observer interno del Mock, ver ./eventosDominio.js).
registrarSuscriptores()
