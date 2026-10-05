// PREGUNTAS FRECUENTES INICIALES (tabla futura `preguntas_frecuentes`). Solo explican cómo funciona
// ESTE sitio (flujos que ya existen en el código); no afirman nada sobre precios, plazos ni
// condiciones comerciales de la empresa. Administración puede editarlas, desactivarlas o borrarlas.
// Forma: { id, pregunta, respuesta, categoria, orden, activa, fechaCreacion, fechaActualizacion }
// (`activa` es el estado: true = se muestra en el sitio).
const FECHA_INICIAL = '2026-09-28'

export const preguntasFrecuentesIniciales = [
  {
    id: 1,
    categoria: 'Visitas',
    orden: 1,
    pregunta: '¿Cómo agendo una visita a un proyecto?',
    respuesta:
      'Entra a Proyectos, elige un proyecto y un lote y pulsa “Agendar visita”. Elige al asesor que te acompañará, uno de los días resaltados en el calendario y un horario libre. La visita queda pendiente hasta que tu asesor la confirme.',
    activa: true,
    fechaCreacion: FECHA_INICIAL,
    fechaActualizacion: FECHA_INICIAL,
  },
  {
    id: 2,
    categoria: 'Mi cuenta',
    orden: 2,
    pregunta: '¿Cómo activo mi cuenta de cliente?',
    respuesta:
      'Grupo Leones te entrega un código de cliente. En “Área cliente” elige “Activar mi cuenta”, escribe tu código y tu DNI y crea tu contraseña. Desde entonces ingresas con tu código y esa contraseña.',
    activa: true,
    fechaCreacion: FECHA_INICIAL,
    fechaActualizacion: FECHA_INICIAL,
  },
  {
    id: 3,
    categoria: 'Lotes',
    orden: 3,
    pregunta: '¿Solicitar información o una cotización separa el lote?',
    respuesta:
      'No. El lote queda como “de interés” en tu cuenta. La separación la registra la empresa y, cuando ocurre, el lote aparece en Mis lotes → Lotes separados.',
    activa: true,
    fechaCreacion: FECHA_INICIAL,
    fechaActualizacion: FECHA_INICIAL,
  },
  {
    id: 4,
    categoria: 'Simulador',
    orden: 4,
    pregunta: '¿El simulador de costos es una cotización oficial?',
    respuesta:
      'No. El simulador es referencial: reparte el saldo del lote en cuotas para darte una idea. Para conocer el precio y las condiciones oficiales, solicita una cotización a un asesor.',
    activa: true,
    fechaCreacion: FECHA_INICIAL,
    fechaActualizacion: FECHA_INICIAL,
  },
]
