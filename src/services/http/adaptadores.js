// ADAPTER: traduce las respuestas de la API real a la forma EXACTA que esperan las pantallas (la misma
// que devuelve la estrategia mock). Es el único lugar a ajustar si la API usa otros nombres o formas.
//
// Criterio de cada adaptador:
//   - Conserva los campos que envíe la API (no se pierde información nueva).
//   - Garantiza los campos que usa el frontend con su nombre en camelCase, aceptando también la
//     variante snake_case (`fecha_registro` → `fechaRegistro`) y la inversa (`areaM2` → `area_m2`).
//     Si la API no envía un campo, queda en null (nunca se inventa un valor).
//   - Adapta las relaciones anidadas (cliente, asesor, proyecto, lote…) con su propio adaptador.
//   - Las listas aceptan un arreglo o un objeto paginado `{ items }` / `{ data }`.

const aSnake = (nombre) => nombre.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`)
const aCamel = (nombre) => nombre.replace(/_([a-z0-9])/g, (_, letra) => letra.toUpperCase())

/** Valor de `campo` en el objeto de la API, con su nombre en camelCase o en snake_case. */
export function leer(dto, campo) {
  if (dto === null || dto === undefined) return null
  for (const nombre of [campo, aSnake(campo), aCamel(campo)]) {
    if (dto[nombre] !== undefined) return dto[nombre]
  }
  return null
}

/** Crea un adaptador de entidad: `campos` que el frontend usa + `relaciones` { campo: adaptador }. */
function entidad(campos, relaciones = {}) {
  return (dto) => {
    if (dto === null || dto === undefined) return null
    const salida = { ...dto }
    campos.forEach((campo) => {
      salida[campo] = leer(dto, campo)
    })
    Object.entries(relaciones).forEach(([campo, adaptar]) => {
      const valor = leer(dto, campo)
      salida[campo] = Array.isArray(valor) ? valor.map(adaptar) : valor === null ? null : adaptar(valor)
    })
    return salida
  }
}

/** Lista de la API (arreglo o `{ items }` / `{ data }`) adaptada elemento por elemento. */
export const lista = (adaptar) => (respuesta) => {
  const elementos = Array.isArray(respuesta) ? respuesta : respuesta?.items ?? respuesta?.data ?? []
  return elementos.map(adaptar)
}

/** Objeto que la API envía tal cual en la forma documentada (reportes, resúmenes). */
export const sinCambios = (respuesta) => respuesta

// ── Entidades ──────────────────────────────────────────────────────────────────────────────────

export const adaptarPersona = entidad(['id', 'nombre', 'telefono', 'correo'])

export const adaptarProyecto = entidad([
  'id', 'slug', 'nombre', 'ubicacion', 'descripcion', 'estado', 'latitud', 'longitud', 'imagen', 'imagenPlano',
  'planoFecha', 'avanceObras', 'avanceVentas', 'totalLotes', 'lotesDisponibles', 'areaDesde', 'areaHasta', 'precioDesde',
])

// Los lotes conservan los nombres de columna de la BD (area_m2, precio_total…), igual que el mock.
export const adaptarLote = entidad([
  'id', 'proyectoId', 'codigo', 'manzana', 'numero', 'area_m2', 'precio_total', 'precio_m2', 'estado', 'estadoFuente',
  'estadoFecha', 'frente_m', 'fondo_m', 'lado_izquierdo_m', 'lado_derecho_m', 'poligono', 'centroide',
])

export const adaptarAsesor = entidad(['id', 'codigo', 'nombre', 'cargo', 'telefono', 'foto', 'disponible', 'perfil'])

/** Lote de un cliente con su relación (INTERES / SEPARADO). */
export const adaptarLoteDeCliente = entidad(['loteCodigo', 'relacion', 'separacion'], {
  lote: adaptarLote,
  proyecto: adaptarProyecto,
})

export const adaptarCliente = entidad(
  ['id', 'codigo', 'nombre', 'dni', 'telefono', 'email', 'asesorId', 'activado', 'cuenta', 'etapa', 'seguimientoId', 'fechaAlta', 'fechaActivacion'],
  { asesor: adaptarPersona, lotes: adaptarLoteDeCliente },
)

/** Solicitudes, visitas, documentos y separaciones: comparten la forma "registro comercial". */
export const adaptarRegistroComercial = entidad(
  [
    'id', 'tipo', 'estado', 'fecha', 'hora', 'clienteId', 'asesorId', 'proyectoId', 'loteId', 'loteCodigo', 'mensaje',
    'motivo', 'observaciones', 'contacto', 'registradoPor', 'fechaRegistro', 'fechaActualizacion', 'titulo',
  ],
  { cliente: adaptarPersona, asesor: adaptarPersona, proyecto: adaptarProyecto, lote: adaptarLote },
)

export const adaptarSeguimiento = entidad(
  ['id', 'clienteId', 'asesorId', 'etapa', 'lotesInteres', 'ultimaInteraccion', 'notas'],
  { cliente: adaptarCliente, lotes: adaptarLoteDeCliente },
)

export const adaptarNotificacion = entidad(['id', 'destinatarioTipo', 'destinatarioId', 'fecha', 'titulo', 'mensaje', 'leida'])
export const adaptarEventoHistorial = entidad(['id', 'clienteId', 'fecha', 'titulo', 'detalle'])
export const adaptarHorario = entidad(['hora', 'disponible'])
export const adaptarEventoActividad = entidad(['id', 'tipo', 'fecha', 'titulo', 'detalle'])

/** Disponibilidad de un asesor: siempre con `semanal` y `excepciones` (objetos vacíos si no hay). */
export function adaptarDisponibilidad(dto) {
  return { semanal: { ...(leer(dto, 'semanal') ?? {}) }, excepciones: { ...(leer(dto, 'excepciones') ?? {}) } }
}

/** Días agendables: { desde, hasta, fechas: [{ fecha, libres }] }. */
export function adaptarFechasDisponibles(dto) {
  return {
    desde: leer(dto, 'desde'),
    hasta: leer(dto, 'hasta'),
    fechas: lista(entidad(['fecha', 'libres']))(leer(dto, 'fechas') ?? []),
  }
}

// ── Contenido ──────────────────────────────────────────────────────────────────────────────────

export const adaptarTestimonio = entidad([
  'id', 'clienteId', 'proyectoId', 'nombreVisible', 'puntuacion', 'comentario', 'estado', 'fechaCreacion', 'fechaRevision',
  'revisadoPor', 'nombreCliente', 'codigoCliente', 'proyecto', 'fecha',
])
export const adaptarPregunta = entidad(['id', 'pregunta', 'respuesta', 'categoria', 'orden', 'activa', 'fechaCreacion', 'fechaActualizacion'])
export const adaptarNoticia = entidad(['id', 'titulo', 'contenido', 'imagen', 'fecha', 'categoria', 'estado', 'orden', 'enlace'])
export const adaptarMultimedia = entidad(['id', 'titulo', 'descripcion', 'tipo', 'url', 'miniatura', 'proyectoId', 'orden', 'estado', 'proyecto'])
export const adaptarHistoria = entidad(['id', 'clienteId', 'titulo', 'historia', 'imagen', 'proyectoId', 'fecha', 'estado', 'esEjemplo', 'proyecto'])
export const adaptarReconocimiento = entidad(['id', 'titulo', 'descripcion', 'institucion', 'anio', 'imagen', 'estado', 'esEjemplo'])
export const adaptarBloqueInversionista = entidad(['id', 'titulo', 'contenido', 'imagen', 'orden', 'estado'])
export const adaptarRedSocial = entidad(['plataforma', 'url', 'icono', 'estado'])

// ── Resúmenes de paneles ───────────────────────────────────────────────────────────────────────

export const adaptarResumenCliente = entidad(
  ['etapa', 'totalSolicitudes', 'solicitudesAbiertas'],
  { cliente: adaptarCliente, asesor: adaptarPersona, lotes: adaptarLoteDeCliente, proximaVisita: adaptarRegistroComercial },
)

export const adaptarResumenAsesor = entidad(['indicadores'], { actividad: adaptarRegistroComercial })

// ── Errores ────────────────────────────────────────────────────────────────────────────────────

/**
 * Traduce errores de la API a los que ya entiende la interfaz. Un 409 al agendar significa que el
 * horario se ocupó mientras el cliente revisaba: la pantalla lo reconoce por `codigo`.
 */
export function adaptarErrorDeHorario(error) {
  if (error?.estado === 409) return Object.assign(error, { codigo: 'HORARIO_NO_DISPONIBLE' })
  return error
}
