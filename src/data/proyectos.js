// PROYECTOS (datos mock). Un objeto por proyecto; los lotes viven aparte en `./lotes/` y se
// relacionan por `lote.proyectoId === proyecto.id`. Los nombres de campo replican los de la
// tabla `proyectos` de PostgreSQL para que luego solo cambie `src/services/api.js`.
//
// Todo dato que no figura en los planos o no fue entregado va en null (pendiente):
//   - ubicacion / latitud / longitud de San Agustín I y II
//   - estado (estado comercial del proyecto) y precios
// Los campos calculados (totalLotes, lotesDisponibles, areaDesde, precioDesde...) NO se
// escriben aquí: los agrega `services/api.js` a partir de los lotes.
import portadaGenerica from '../assets/images/terreno1.png'
import planoChalayII from '../assets/proyectos/chalay-ii/plano-lotes.jpg'
import planoSanAgustinI from '../assets/proyectos/san-agustin-i/plano-lotes.jpg'
import planoSanAgustinII from '../assets/proyectos/san-agustin-ii/plano-lotes.jpg'

export const proyectos = [
  {
    id: 1,
    slug: 'chalay-ii',
    nombre: 'RESIDENCIAL CHALAY II',
    ubicacion: 'Huancayo, Junín',
    descripcion: 'Según el plano del proyecto, contempla agua, desagüe, pistas y veredas.',
    estado: null,
    // Ubicación general del proyecto (centro de mapa / marcador). NO son vértices de lotes.
    latitud: -11.94266,
    longitud: -75.299988,
    // Portada de la tarjeta: imagen genérica compartida hasta tener una foto propia del proyecto.
    imagen: portadaGenerica,
    imagenPlano: planoChalayII,
    planoFecha: '2026-09-03',
    // Barras "Avance de obras / ventas" impresas en el plano (porcentaje).
    avanceObras: 0,
    avanceVentas: 2,
  },
  {
    id: 2,
    slug: 'san-agustin-i',
    nombre: 'SAN AGUSTÍN I',
    ubicacion: null,
    descripcion: 'Según el plano del proyecto, contempla agua, desagüe, pistas y veredas.',
    estado: null,
    latitud: null,
    longitud: null,
    imagen: portadaGenerica,
    imagenPlano: planoSanAgustinI,
    planoFecha: '2026-08-28',
    avanceObras: 50,
    avanceVentas: 67,
  },
  {
    id: 3,
    slug: 'san-agustin-ii',
    nombre: 'SAN AGUSTÍN II',
    ubicacion: null,
    descripcion:
      'Según el plano del proyecto, contempla agua, desagüe, postes, pistas, veredas, ciclovías, alameda y áreas verdes.',
    estado: null,
    latitud: null,
    longitud: null,
    imagen: portadaGenerica,
    imagenPlano: planoSanAgustinII,
    planoFecha: '2026-06-02',
    avanceObras: 0,
    avanceVentas: 0,
  },
]

export function getProyectoById(id) {
  return proyectos.find((p) => String(p.id) === String(id)) ?? null
}
