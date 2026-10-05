// SELECCIÓN DE LA ESTRATEGIA DE DATOS (patrón Strategy). Las dos estrategias implementan el mismo
// contrato —los mismos nombres de función y la misma forma de respuesta—:
//   mock → `./mock/index.js`: datos de prueba guardados en el navegador (sin API).
//   http → `./http/index.js`: API REST real; las respuestas pasan por `./http/adaptadores.js` (Adapter).
//
// Regla de selección:
//   1. VITE_FUENTE_DATOS=mock|http, si está definida (para forzar una u otra al probar).
//   2. Si no, `http` cuando existe VITE_API_URL; en cualquier otro caso, `mock`.
// Las pantallas no saben cuál está activa: siempre usan `services/api.js`.
import * as mock from './mock/index.js'
import * as http from './http/index.js'
import { hayApiConfigurada } from './http/cliente'

const ESTRATEGIAS = { mock, http }

const pedida = import.meta.env.VITE_FUENTE_DATOS
const elegida = pedida ?? (hayApiConfigurada ? 'http' : 'mock')

/** Nombre de la estrategia activa: 'mock' | 'http'. */
export const nombreFuente = ESTRATEGIAS[elegida] ? elegida : 'mock'

/** Estrategia activa (objeto con todas las funciones del contrato). */
export const fuente = ESTRATEGIAS[nombreFuente]

/** Nombres exportados por una estrategia y no por la otra (ambas listas deben quedar vacías). */
export function diferenciasDeContrato() {
  const nombres = (modulo) => new Set(Object.keys(modulo))
  const deMock = nombres(mock)
  const deHttp = nombres(http)
  return {
    faltanEnHttp: [...deMock].filter((nombre) => !deHttp.has(nombre)),
    faltanEnMock: [...deHttp].filter((nombre) => !deMock.has(nombre)),
  }
}

if (import.meta.env.DEV) {
  if (pedida && !ESTRATEGIAS[pedida]) console.warn(`VITE_FUENTE_DATOS="${pedida}" no existe; se usa "mock".`)
  const { faltanEnHttp, faltanEnMock } = diferenciasDeContrato()
  if (faltanEnHttp.length || faltanEnMock.length) {
    console.error('Las estrategias de datos no cumplen el mismo contrato:', { faltanEnHttp, faltanEnMock })
  }
}
