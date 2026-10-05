// LÓGICA PURA COMPARTIDA por las dos estrategias de datos (mock y http). No lee ni guarda nada:
// recibe datos y devuelve datos, así el resultado es el mismo venga de donde venga la información.
import { ESTADOS_VISITA_ACTIVOS } from '../data/procesoComercial'
import { esEnlacePendiente, fechaLocalISO, formatearFecha } from '../utils/formato'

/**
 * Tarjetas de /comunicados que salen de hechos ya registrados en cada proyecto (fecha del plano
 * comercial y avance impreso en él). Nada se inventa: sin fecha de plano, el proyecto no aporta tarjetas.
 * Forma: { id, origen: 'plano', categoria, fecha, titulo, descripcion, imagen, enlace }.
 */
export function tarjetasDelPlano(proyectos) {
  return proyectos.flatMap((proyecto) => {
    if (!proyecto.planoFecha) return []
    const fechaPlano = formatearFecha(proyecto.planoFecha)
    const comunes = { origen: 'plano', fecha: proyecto.planoFecha, imagen: proyecto.imagen, enlace: `/lotes?id=${proyecto.id}` }

    const items = [
      {
        ...comunes,
        id: `plano-${proyecto.id}`,
        categoria: 'Novedad',
        titulo: `PLANO COMERCIAL ACTUALIZADO – ${proyecto.nombre}`,
        descripcion: `Consulta la disponibilidad de lotes según el plano comercial del ${fechaPlano}.`,
      },
    ]

    if (proyecto.avanceObras || proyecto.avanceVentas) {
      items.push({
        ...comunes,
        id: `avance-${proyecto.id}`,
        categoria: 'Avance de obra',
        titulo: `AVANCE DEL PROYECTO – ${proyecto.nombre}`,
        descripcion: `Según el plano del ${fechaPlano}: ${proyecto.avanceObras ?? 0}% de avance de obras y ${proyecto.avanceVentas ?? 0}% de avance de ventas.`,
      })
    }
    return items
  })
}

/** Noticia publicada → tarjeta de /comunicados. Sin imagen propia usa `imagenPorDefecto` (nunca una foto inventada). */
export function tarjetaDeNoticia(noticia, imagenPorDefecto = null) {
  return {
    id: `noticia-${noticia.id}`,
    origen: 'noticia',
    categoria: noticia.categoria,
    fecha: noticia.fecha,
    titulo: noticia.titulo,
    descripcion: noticia.contenido,
    imagen: noticia.imagen ?? imagenPorDefecto,
    enlace: noticia.enlace ?? null,
  }
}

/** Una red solo se muestra como enlace si está ACTIVA y su URL es real (no de ejemplo). */
export const conRedConfirmada = (red) => ({ ...red, confirmada: red.estado === 'ACTIVA' && !esEnlacePendiente(red.url) })

/** Próxima visita vigente (pendiente o confirmada, de hoy en adelante) de una lista ordenada por fecha. */
export function proximaVisita(visitasOrdenadas) {
  const hoy = fechaLocalISO()
  return visitasOrdenadas.find((v) => ESTADOS_VISITA_ACTIVOS.includes(v.estado) && v.fecha >= hoy) ?? null
}

// ── Autenticación ──────────────────────────────────────────────────────────────────────────────

/** Códigos de `error.codigo` que `iniciarSesion()` puede lanzar en cualquiera de las dos estrategias. */
export const ERRORES_AUTENTICACION = {
  credenciales: 'CREDENCIALES_INVALIDAS',
  cuentaPendiente: 'CUENTA_PENDIENTE',
}

/** Mensaje único para credenciales incorrectas: no dice si falló el usuario, la contraseña o el tipo. */
export const MENSAJE_CREDENCIALES_INVALIDAS = 'Usuario o contraseña incorrectos.'

/** Error de inicio de sesión con `codigo` (ver ERRORES_AUTENTICACION) para que la pantalla lo distinga. */
export function errorDeAutenticacion(codigo, mensaje = MENSAJE_CREDENCIALES_INVALIDAS) {
  const error = new Error(mensaje)
  error.codigo = codigo
  return error
}
