// Ensambla los lotes de cada proyecto en una sola lista plana, cada lote con su `proyectoId`.
// Forma de cada lote (mismos nombres que usará PostgreSQL para las columnas equivalentes):
//   id, proyectoId, codigo, manzana, numero, area_m2, precio_total, precio_m2, estado,
//   frente_m, fondo_m, lado_izquierdo_m, lado_derecho_m, poligono, centroide
// Todo lo que no figura en los planos queda en null (pendiente); NADA se estima ni se inventa.
import { chalayII } from './chalay-ii'
import { sanAgustinI } from './san-agustin-i'
import { sanAgustinII } from './san-agustin-ii'
import { ESTADOS_PLANO } from './estados-plano'

// Para sumar otro proyecto: crea su archivo de manzanas, impórtalo aquí y agrégalo a esta lista.
const PROYECTOS_CON_LOTES = [chalayII, sanAgustinI, sanAgustinII]

function construirLotes({ proyectoId, prefijoCodigo, manzanas }) {
  const estados = ESTADOS_PLANO[proyectoId]
  let contador = 0

  return manzanas.flatMap(({ nombre, lotes: lotesManzana }) => {
    const letra = nombre.replace('MZ ', '')

    return lotesManzana.map(({ numero, area_m2, precio_total = null }) => {
      const codigo = `${prefijoCodigo}-MZ${letra}-${String(numero).padStart(2, '0')}`
      contador += 1

      return {
        id: proyectoId * 1000 + contador,
        proyectoId,
        codigo,
        manzana: nombre,
        numero,
        area_m2,
        // Opcional en cada fila de manzana: { numero, area_m2, precio_total }. precio_m2 se calcula.
        precio_total,
        precio_m2: precio_total === null ? null : Math.round((precio_total / area_m2) * 100) / 100,
        estado: estados?.excepciones[codigo] ?? estados?.porDefecto ?? 'DISPONIBLE',
        estadoFuente: 'plano',
        estadoFecha: estados?.fecha ?? null,
        frente_m: null,
        fondo_m: null,
        lado_izquierdo_m: null,
        lado_derecho_m: null,
        // GeoJSON Polygon (SRID 4326) y punto { latitud, longitud }: pendientes del levantamiento.
        poligono: null,
        centroide: null,
      }
    })
  })
}

export const lotes = PROYECTOS_CON_LOTES.flatMap(construirLotes)

export function getLotesByProyecto(proyectoId) {
  return lotes.filter((l) => String(l.proyectoId) === String(proyectoId))
}

export function getLoteById(id) {
  return lotes.find((l) => String(l.id) === String(id)) ?? null
}
