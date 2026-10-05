// CATÁLOGOS Y MODELOS DEL CONTENIDO PÚBLICO. Aquí NO hay contenido: solo estados, reglas y la forma
// de cada entidad (así debe entregarla la API). El contenido real llega de la base de datos; hasta
// entonces cada sección muestra un estado vacío. `tono` usa las mismas insignias del panel.

// Estado de publicación común a noticias, galería, historias, reconocimientos e inversionistas.
// Solo lo PUBLICADO se muestra en el sitio.
export const ESTADOS_PUBLICACION = [
  { value: 'BORRADOR', label: 'Borrador', tono: 'neutro' },
  { value: 'PUBLICADO', label: 'Publicado', tono: 'ok' },
  { value: 'OCULTO', label: 'Oculto', tono: 'neutro' },
]
export const esPublicado = (registro) => registro?.estado === 'PUBLICADO'

// Testimonios (tabla `testimonios`):
//   { id, clienteId, proyectoId|null, nombreVisible, puntuacion (1-5), comentario, estado,
//     fechaCreacion, fechaRevision, revisadoPor }
// El cliente lo envía PENDIENTE; administración lo PUBLICA u OCULTA (o lo elimina).
export const ESTADOS_TESTIMONIO = [
  { value: 'PENDIENTE', label: 'Pendiente de revisión', tono: 'pendiente' },
  { value: 'PUBLICADO', label: 'Publicado', tono: 'ok' },
  { value: 'OCULTO', label: 'Oculto', tono: 'neutro' },
]

export const PUNTUACION_MAXIMA = 5
export const LARGO_COMENTARIO = { minimo: 10, maximo: 600 }

// Una opinión de 4 o 5 estrellas cuenta como "cliente satisfecho" en el resumen público.
export const PUNTUACION_SATISFECHO = 4

// Noticias / novedades (tabla `noticias`; se muestran en /comunicados):
//   { id, titulo, contenido, imagen, fecha (YYYY-MM-DD), categoria, estado, orden, enlace|null }
// `categoria` debe ser una de CATEGORIAS_NOTICIA (son los filtros de la página).
export const CATEGORIAS_NOTICIA = ['Novedad', 'Evento', 'Avance de obra', 'Consejos', 'Importante']

// Galería multimedia (tabla `galeria`; /galeria):
//   { id, titulo, descripcion, tipo ('IMAGEN' | 'VIDEO'), url, miniatura|null, proyectoId|null,
//     orden, estado }
export const TIPOS_MULTIMEDIA = ['IMAGEN', 'VIDEO']

// Historias de compradores (tabla `historias_compradores`):
//   { id, clienteId|null, titulo, historia, imagen|null, proyectoId|null, fecha, estado, esEjemplo }
// Reconocimientos (tabla `reconocimientos`):
//   { id, titulo, descripcion, institucion, anio, imagen|null, estado, esEjemplo }
// Contenido para inversionistas (tabla `contenido_inversionistas`):
//   { id, titulo, contenido, imagen|null, orden, estado }
// `esEjemplo: true` obliga a mostrar la etiqueta "Contenido de ejemplo" en el sitio.
