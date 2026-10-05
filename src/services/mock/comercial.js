// ESTRATEGIA MOCK — dominio comercial (proyectos, lotes, asesores, disponibilidad, visitas,
// solicitudes, seguimiento, cliente, administración y activación de cuentas). Es la implementación
// que usa el sitio mientras no haya API real: guarda todo en el almacén del navegador (`./almacen.js`).
// Sus funciones tienen los MISMOS nombres y la misma forma de respuesta que `../http/index.js`;
// la fachada `services/api.js` elige una u otra (ver `services/fuenteDatos.js`).
import { proyectos, getProyectoById as buscarProyectoPorId } from '../../data/proyectos'
import { lotes, getLotesByProyecto as buscarLotesPorProyecto, getLoteById as buscarLotePorId } from '../../data/lotes'
import { asesoresMock } from '../../data/asesoresMock'
import { DIAS_AGENDABLES, DURACION_VISITA_MIN, HORAS_DE_ATENCION, aMinutos, horasDelDia } from '../../data/disponibilidad'
import { ESTADO_LABEL } from '../../data/estados'
import { fechaLocalISO, formatearFechaConDia, formatearHora, formatearLote, sumarDias } from '../../utils/formato'
import { cuentaActivada, getClienteMockById, getClientes } from '../../data/clientesMock'
import { getIntegranteById } from '../../data/equipo'
import { documentosMock } from '../../data/documentosMock'
import {
  ESTADOS_SOLICITUD,
  ESTADOS_VISITA,
  ESTADOS_VISITA_ACTIVOS,
  ETAPAS_CLIENTE,
  PUEDEN_REGISTRAR_SEPARACION,
  TIPOS_SOLICITUD,
  TRANSICIONES_VISITA,
  buscarEstado,
} from '../../data/procesoComercial'
import { CLAVES, guardarJSON, leerJSON } from '../../utils/almacenamiento'
import {
  esCelularConNueveInicial,
  esCorreoValido,
  esDniValido,
  esNumeroDeNueveDigitos,
} from '../../utils/validadores'
import { obtenerUsuarioSesion } from '../sesion'
import {
  asesorDeSesion,
  clienteDeSesion,
  esperar,
  guardarColeccion,
  leerColeccion,
  mismoId,
  siguienteId,
} from './almacen'
import { EVENTOS, publicar } from './eventosDominio'
import { conEstadoComercial, lotesConEstado } from './lotesComerciales'
import { getNoticias } from './contenido'
import { proximaVisita, tarjetaDeNoticia, tarjetasDelPlano } from '../compartido'


/**
 * Campos agregados de un proyecto calculados a partir de sus lotes. Con el backend real
 * los devolverá la propia consulta SQL de /api/proyectos (COUNT / MIN sobre `lotes`).
 * `precioDesde` es null mientras ningún lote tenga precio cargado.
 */
function resumirLotes(lotesDelProyecto) {
  const preciosCargados = lotesDelProyecto.map((l) => l.precio_total).filter((p) => p !== null)
  const areas = lotesDelProyecto.map((l) => l.area_m2)

  return {
    totalLotes: lotesDelProyecto.length,
    lotesDisponibles: lotesDelProyecto.filter((l) => l.estado === 'DISPONIBLE').length,
    areaDesde: areas.length ? Math.min(...areas) : null,
    areaHasta: areas.length ? Math.max(...areas) : null,
    precioDesde: preciosCargados.length ? Math.min(...preciosCargados) : null,
  }
}


function conResumen(proyecto) {
  return { ...proyecto, ...resumirLotes(lotesConEstado(buscarLotesPorProyecto(proyecto.id))) }
}

// Solo la primera consulta simula latencia de red. El resumen se recalcula siempre, porque las
// separaciones cambian la cantidad de lotes disponibles.
let proyectosCargados = false

/** Equivalente simulado de GET /api/proyectos */
export async function getProyectos() {
  if (!proyectosCargados) {
    await esperar()
    proyectosCargados = true
  }
  return proyectos.map(conResumen)
}

/** Equivalente simulado de GET /api/proyectos/:id */
export async function getProyecto(id) {
  await esperar()
  const proyecto = buscarProyectoPorId(id)
  if (!proyecto) throw new Error('No encontramos ese proyecto.')
  return conResumen(proyecto)
}

/** Equivalente simulado de GET /api/proyectos/:id/lotes */
export async function getLotesDeProyecto(proyectoId) {
  await esperar()
  return lotesConEstado(buscarLotesPorProyecto(proyectoId))
}

/** Equivalente simulado de GET /api/lotes/:id */
export async function getLote(id) {
  await esperar()
  const lote = buscarLotePorId(id)
  if (!lote) throw new Error('No encontramos ese lote.')
  return conEstadoComercial(lote)
}

/** Equivalente simulado de GET /api/lotes */
export async function getTodosLosLotes() {
  await esperar()
  return lotesConEstado(lotes)
}

/**
 * Lista que muestra /comunicados (Novedades y noticias). Junta dos fuentes, sin inventar nada:
 *   1. Noticias PUBLICADAS por la empresa (`getNoticias()`, endpoint GET /api/noticias). Hoy vacío.
 *   2. Hechos que ya figuran en los datos de cada proyecto: fecha del plano comercial y avance
 *      impreso en él (`origen: 'plano'`). Con la API, estos pueden venir como noticias normales.
 * Forma de cada tarjeta: { id, origen, categoria, fecha (YYYY-MM-DD), titulo, descripcion, imagen, enlace }.
 */
export async function getComunicados() {
  const noticias = (await getNoticias()).map((noticia) => tarjetaDeNoticia(noticia, proyectos[0]?.imagen ?? null))
  return [...noticias, ...tarjetasDelPlano(proyectos)]
}

// Campos de login mock que nunca deben salir de la "base de datos" hacia las pantallas.
const CAMPOS_PRIVADOS = ['usuario', 'password']

function sinCredenciales(registro) {
  return Object.fromEntries(Object.entries(registro).filter(([campo]) => !CAMPOS_PRIVADOS.includes(campo)))
}

/** Equivalente simulado de GET /api/asesores */
export async function getAsesores() {
  await esperar()
  return asesoresMock.map(sinCredenciales)
}



// ── Relaciones: agrega proyecto, lote, cliente y asesor a cada registro ────────────────────────

function datosDeLote(loteCodigo, proyectoId = null) {
  const lote = loteCodigo ? conEstadoComercial(lotes.find((l) => l.codigo === loteCodigo) ?? null) : null
  const proyecto = buscarProyectoPorId(lote?.proyectoId ?? proyectoId)
  return { loteCodigo, lote, proyecto }
}

/** Cliente con los cambios guardados desde "Mi perfil" en este navegador, sin credenciales. */
function clienteConCambios(cliente) {
  if (!cliente) return null
  const cambios = leerJSON(CLAVES.perfilesClientes, {})?.[cliente.id] ?? {}
  return sinCredenciales({ ...cliente, ...cambios })
}

function resumenPersona(persona) {
  return persona
    ? { id: persona.id, nombre: persona.nombre, telefono: persona.telefono ?? null, correo: persona.email ?? null }
    : null
}

/** Cliente registrado o, si la solicitud vino de un visitante sin cuenta, los datos que dejó. */
function personaCliente(registro) {
  const registrado = clienteConCambios(getClienteMockById(registro.clienteId))
  if (registrado) return resumenPersona(registrado)
  const contacto = registro.contacto
  return contacto ? { id: null, nombre: contacto.nombre, telefono: contacto.celular ?? null, correo: contacto.correo ?? null } : null
}

const buscarAsesor = (asesorId) => asesoresMock.find((a) => a.id === asesorId) ?? null

function enriquecer(registro) {
  return {
    ...registro,
    ...datosDeLote(registro.loteCodigo, registro.proyectoId),
    cliente: personaCliente(registro),
    asesor: resumenPersona(buscarAsesor(registro.asesorId)),
  }
}

function enriquecerSeguimiento(seguimiento) {
  return {
    ...seguimiento,
    notas: [...seguimiento.notas],
    cliente: clienteConCambios(getClienteMockById(seguimiento.clienteId)),
    // Con su `relacion` (INTERES / SEPARADO): el asesor ve qué lotes de su cliente están separados.
    lotes: lotesDelCliente(seguimiento),
  }
}

/** "RESIDENCIAL CHALAY II · Lote MZ A - 03" (para historial y notificaciones). */
function descripcionLote(registro) {
  const { lote, proyecto } = datosDeLote(registro.loteCodigo, registro.proyectoId)
  return [proyecto?.nombre, lote ? `Lote ${formatearLote(lote)}` : null].filter(Boolean).join(' · ') || 'Proyecto por confirmar'
}

const cuandoVisita = (visita) => `${formatearFechaConDia(visita.fecha)} a las ${formatearHora(visita.hora)}`

// Orden: por fecha (y hora); a igual fecha, por id (el registro más nuevo tiene el id mayor).
const claveFecha = (r) => `${r.fecha ?? ''} ${r.hora ?? ''}`
const porFechaAsc = (a, b) => claveFecha(a).localeCompare(claveFecha(b)) || a.id - b.id
const porFechaDesc = (a, b) => porFechaAsc(b, a)

const deCliente = (lista, clienteId) => lista.filter((r) => mismoId(r.clienteId, clienteId))
const deAsesor = (lista, asesorId) => lista.filter((r) => r.asesorId === asesorId)

function seguimientoDeCliente(clienteId) {
  return leerColeccion(CLAVES.seguimiento).find((s) => mismoId(s.clienteId, clienteId)) ?? null
}

/**
 * Lotes del cliente con su `relacion` (RELACIONES_LOTE). Consultar, cotizar o agendar una visita
 * lo deja de INTERES; una separación vigente (la registra administración) lo pasa a SEPARADO y
 * deja de figurar como interés. COMPRADO todavía no existe (vendrá con la venta).
 */
function lotesDelCliente(seguimiento) {
  if (!seguimiento) return []
  const separaciones = leerColeccion(CLAVES.separaciones).filter(
    (separacion) => separacion.estado === 'VIGENTE' && mismoId(separacion.clienteId, seguimiento.clienteId),
  )
  const separados = separaciones.map((separacion) => separacion.loteCodigo)

  return [
    ...separaciones.map((separacion) => ({ ...datosDeLote(separacion.loteCodigo), relacion: 'SEPARADO', separacion })),
    ...seguimiento.lotesInteres
      .filter((codigo) => !separados.includes(codigo))
      .map((codigo) => ({ ...datosDeLote(codigo), relacion: 'INTERES' })),
  ]
}


// ── Eventos: historial del comprador y notificaciones ──────────────────────────────────────────


/**
 * Si un cliente registrado consulta, cotiza o agenda la visita de un lote, ese lote queda como
 * "de interés" (NO separado ni comprado) y como su última interacción. Si todavía no tenía seguimiento, se le abre uno en etapa NUEVO con
 * el asesor que eligió (la etapa solo la cambia el asesor).
 */
function registrarInteres(clienteId, asesorId, loteCodigo) {
  if (clienteId === null || clienteId === undefined) return
  const lista = leerColeccion(CLAVES.seguimiento)
  const hoy = fechaLocalISO()
  const existente = lista.find((s) => mismoId(s.clienteId, clienteId))

  if (existente) {
    const lotesInteres = loteCodigo && !existente.lotesInteres.includes(loteCodigo)
      ? [...existente.lotesInteres, loteCodigo]
      : existente.lotesInteres
    guardarColeccion(
      CLAVES.seguimiento,
      lista.map((s) => (s === existente ? { ...s, lotesInteres, ultimaInteraccion: hoy } : s)),
    )
    return
  }

  guardarColeccion(CLAVES.seguimiento, [
    ...lista,
    {
      id: siguienteId(lista),
      clienteId,
      asesorId,
      etapa: 'NUEVO',
      lotesInteres: loteCodigo ? [loteCodigo] : [],
      ultimaInteraccion: hoy,
      notas: [],
    },
  ])
}

function datosDeContacto(datos) {
  const texto = (valor) => String(valor ?? '').trim() || null
  return {
    nombre: texto(datos.nombre),
    celular: texto(datos.celular),
    correo: texto(datos.correo),
    tipoDocumento: texto(datos.tipoDocumento),
    numeroDocumento: texto(datos.numeroDocumento),
    direccion: texto(datos.direccion),
  }
}

function exigirCampos(datos, campos) {
  const faltante = campos.find((campo) => !String(datos[campo] ?? '').trim())
  if (faltante) throw new Error(`El campo "${faltante}" es obligatorio.`)
}

// ── Solicitudes ────────────────────────────────────────────────────────────────────────────────

const TIPOS_SOLICITUD_PUBLICA = ['INFORMACION', 'COTIZACION']

/**
 * Equivalente simulado de POST /api/solicitudes.
 * Cubre "solicitar información" y "solicitar cotización": ambas quedan asociadas a UN asesor
 * (`asesorId`) y se distinguen por `tipo`. Si hay sesión de cliente, la solicitud queda a su
 * nombre (`clienteId`); si no, se guardan los datos de contacto del visitante.
 */
export async function crearSolicitud(datos) {
  await esperar()

  const tipo = String(datos.tipo ?? '').toUpperCase()
  if (!TIPOS_SOLICITUD_PUBLICA.includes(tipo)) throw new Error('El tipo de solicitud no es válido.')
  exigirCampos(datos, ['nombre', 'celular', 'asesorId'])
  if (!buscarAsesor(datos.asesorId)) throw new Error('El asesor elegido no existe.')

  const clienteId = clienteDeSesion()?.id ?? null
  const lista = leerColeccion(CLAVES.solicitudes)
  const solicitud = {
    id: siguienteId(lista),
    tipo,
    clienteId,
    asesorId: datos.asesorId,
    proyectoId: datos.proyectoId ?? null,
    loteId: datos.loteId ?? null,
    loteCodigo: datos.loteCodigo ?? null,
    fecha: fechaLocalISO(),
    fechaRegistro: new Date().toISOString(),
    estado: 'PENDIENTE',
    mensaje: String(datos.mensaje ?? '').trim() || null,
    motivo: datos.motivo || null,
    simulacion: datos.simulacion ?? null,
    contacto: datosDeContacto(datos),
  }
  guardarColeccion(CLAVES.solicitudes, [...lista, solicitud])

  const resultado = enriquecer(solicitud)
  const tipoTexto = TIPOS_SOLICITUD[tipo]
  const donde = descripcionLote(solicitud)

  publicar(EVENTOS.solicitudCreada, {
    clienteId,
    asesorId: solicitud.asesorId,
    tipoTexto,
    donde,
    asesorNombre: resultado.asesor?.nombre,
    clienteNombre: resultado.cliente?.nombre,
  })
  registrarInteres(clienteId, solicitud.asesorId, solicitud.loteCodigo)

  return resultado
}

/**
 * Equivalente simulado de PATCH /api/solicitudes/:id (solo el asesor asignado).
 * Hoy solo cambia el `estado` (ESTADOS_SOLICITUD) y avisa al cliente.
 */
export async function actualizarSolicitud(id, { estado }) {
  await esperar()
  const asesor = asesorDeSesion()
  const lista = leerColeccion(CLAVES.solicitudes)
  const solicitud = lista.find((s) => mismoId(s.id, id))

  if (!solicitud) throw new Error('No encontramos esa solicitud.')
  if (!asesor || solicitud.asesorId !== asesor.id) throw new Error('Esta solicitud no está asignada a ti.')
  if (!ESTADOS_SOLICITUD.some((e) => e.value === estado)) throw new Error('El estado no es válido.')
  if (solicitud.estado === estado) return enriquecer(solicitud)

  const actualizada = { ...solicitud, estado, fechaActualizacion: new Date().toISOString() }
  guardarColeccion(CLAVES.solicitudes, lista.map((s) => (s === solicitud ? actualizada : s)))

  const etiqueta = buscarEstado(ESTADOS_SOLICITUD, estado).label
  const detalle = `${TIPOS_SOLICITUD[solicitud.tipo] ?? 'Solicitud'} · ${descripcionLote(solicitud)}: ${etiqueta}.`
  publicar(EVENTOS.solicitudActualizada, { clienteId: solicitud.clienteId, detalle })

  return enriquecer(actualizada)
}

/** Equivalente simulado de GET /api/clientes/:id/solicitudes (más recientes primero). */
export async function getSolicitudesDeCliente(clienteId) {
  await esperar()
  return deCliente(leerColeccion(CLAVES.solicitudes), clienteId).map(enriquecer).sort(porFechaDesc)
}

/** Equivalente simulado de GET /api/asesores/:id/solicitudes (solo las asignadas; recientes primero). */
export async function getSolicitudesDeAsesor(asesorId) {
  await esperar()
  return deAsesor(leerColeccion(CLAVES.solicitudes), asesorId).map(enriquecer).sort(porFechaDesc)
}

// ── Disponibilidad de los asesores ─────────────────────────────────────────────────────────────
// Un registro por asesor en `leones_disponibilidad`: { id, asesorId, semanal, excepciones,
// fechaActualizacion } (forma en `data/disponibilidad.js`). Un horario está OCUPADO si el asesor
// ya tiene una visita vigente (PENDIENTE o CONFIRMADA) a menos de DURACION_VISITA_MIN minutos.

function disponibilidadDe(asesorId) {
  const registro = leerColeccion(CLAVES.disponibilidad).find((d) => d.asesorId === asesorId)
  return { semanal: { ...registro?.semanal }, excepciones: { ...registro?.excepciones } }
}

function visitasVigentesDeAsesor(asesorId) {
  return deAsesor(leerColeccion(CLAVES.visitas), asesorId).filter((v) => ESTADOS_VISITA_ACTIVOS.includes(v.estado))
}

/**
 * Horarios de un asesor para una fecha: [{ hora, disponible }]. No incluye los que ya pasaron;
 * los ocupados por otra visita vienen con `disponible: false`.
 */
function horariosDelDia(asesorId, fecha, disponibilidad = disponibilidadDe(asesorId), visitas = visitasVigentesDeAsesor(asesorId)) {
  const hoy = fechaLocalISO()
  if (!fecha || fecha < hoy || fecha > sumarDias(hoy, DIAS_AGENDABLES)) return []

  const ahora = new Date()
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
  const visitasDelDia = visitas.filter((v) => v.fecha === fecha)

  return horasDelDia(disponibilidad, fecha)
    .filter((hora) => fecha !== hoy || aMinutos(hora) > minutosAhora)
    .map((hora) => ({
      hora,
      disponible: !visitasDelDia.some((v) => Math.abs(aMinutos(v.hora) - aMinutos(hora)) < DURACION_VISITA_MIN),
    }))
}

/** Equivalente simulado de GET /api/asesores/:id/disponibilidad (horario semanal + excepciones). */
export async function getDisponibilidadDeAsesor(asesorId) {
  await esperar()
  return disponibilidadDe(asesorId)
}

/** Guarda la disponibilidad del asesor en sesión; `cambiar` recibe una copia y la modifica. */
function modificarDisponibilidad(cambiar) {
  const asesor = asesorDeSesion()
  if (!asesor) throw new Error('Solo el asesor puede cambiar su disponibilidad.')

  const lista = leerColeccion(CLAVES.disponibilidad)
  const existente = lista.find((d) => d.asesorId === asesor.id)
  const disponibilidad = disponibilidadDe(asesor.id)
  cambiar(disponibilidad)

  // Las excepciones de días que ya pasaron no sirven para nada: se limpian al guardar.
  const hoy = fechaLocalISO()
  const excepciones = Object.fromEntries(Object.entries(disponibilidad.excepciones).filter(([fecha]) => fecha >= hoy))
  const registro = {
    id: existente?.id ?? siguienteId(lista),
    asesorId: asesor.id,
    semanal: disponibilidad.semanal,
    excepciones,
    fechaActualizacion: new Date().toISOString(),
  }
  guardarColeccion(CLAVES.disponibilidad, existente ? lista.map((d) => (d === existente ? registro : d)) : [...lista, registro])
  return { semanal: registro.semanal, excepciones: registro.excepciones }
}

function validarHoras(horas) {
  if (!Array.isArray(horas) || horas.some((hora) => !HORAS_DE_ATENCION.includes(hora))) {
    throw new Error('Alguno de los horarios no es válido.')
  }
  return [...new Set(horas)].sort()
}

/**
 * Equivalente simulado de PUT /api/asesores/me/disponibilidad/semanal/:dia. Horario que se repite
 * todas las semanas ese día (0 = domingo … 6 = sábado); sin horas, ese día deja de atender.
 */
export async function guardarHorarioSemanal(diaSemana, horas) {
  await esperar()
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) throw new Error('El día no es válido.')
  const validas = validarHoras(horas)
  return modificarDisponibilidad((d) => {
    if (validas.length) d.semanal[diaSemana] = validas
    else delete d.semanal[diaSemana]
  })
}

/**
 * Equivalente simulado de PUT /api/asesores/me/disponibilidad/fechas/:fecha. Excepción para un
 * solo día: `horas` con horarios = horario especial; [] = no disponible; null = quitar la
 * excepción (ese día vuelve a su horario semanal).
 */
export async function guardarHorarioDeFecha(fecha, horas) {
  await esperar()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha)) || fecha < fechaLocalISO()) throw new Error('Elige un día de hoy en adelante.')
  const validas = horas === null ? null : validarHoras(horas)
  return modificarDisponibilidad((d) => {
    if (validas === null) delete d.excepciones[fecha]
    else d.excepciones[fecha] = validas
  })
}

/**
 * Equivalente simulado de GET /api/asesores/:id/fechas-disponibles. Días (desde hoy y hasta
 * DIAS_AGENDABLES) en que el asesor tiene al menos un horario libre: { desde, hasta, fechas }.
 */
export async function getFechasDisponibles(asesorId) {
  await esperar()
  const desde = fechaLocalISO()
  const hasta = sumarDias(desde, DIAS_AGENDABLES)
  const disponibilidad = disponibilidadDe(asesorId)
  const visitas = visitasVigentesDeAsesor(asesorId)

  const fechas = []
  for (let fecha = desde; fecha <= hasta; fecha = sumarDias(fecha, 1)) {
    const libres = horariosDelDia(asesorId, fecha, disponibilidad, visitas).filter((h) => h.disponible).length
    if (libres > 0) fechas.push({ fecha, libres })
  }
  return { desde, hasta, fechas }
}

/**
 * Equivalente simulado de GET /api/visitas/horarios?asesorId=&fecha=
 * Horarios configurados por el asesor para ese día: [{ hora, disponible }] (ocupados = false).
 */
export async function getHorariosVisita({ asesorId, fecha }) {
  await esperar()
  return horariosDelDia(asesorId, fecha)
}

// ── Visitas ────────────────────────────────────────────────────────────────────────────────────

/** Error de horario que la interfaz reconoce para pedir otro horario sin perder lo escrito. */
function errorDeHorario(mensaje) {
  return Object.assign(new Error(mensaje), { codigo: 'HORARIO_NO_DISPONIBLE' })
}

/**
 * Equivalente simulado de POST /api/visitas. Queda asociada a un asesor (`asesorId`) y, si hay
 * sesión de cliente, a ese cliente. Nace PENDIENTE: el asesor la confirma desde su agenda.
 * El horario se vuelve a validar aquí (no basta con lo que mostró el calendario): debe estar en
 * la disponibilidad del asesor y no chocar con otra visita vigente suya.
 */
export async function crearVisita(datos) {
  await esperar()

  exigirCampos(datos, ['nombre', 'celular', 'fecha', 'hora', 'asesorId'])
  if (datos.fecha < fechaLocalISO()) throw new Error('La fecha de la visita ya pasó.')
  if (!buscarAsesor(datos.asesorId)) throw new Error('El asesor elegido no existe.')

  const horario = horariosDelDia(datos.asesorId, datos.fecha).find((h) => h.hora === datos.hora)
  if (!horario) throw errorDeHorario('El asesor ya no atiende en ese horario. Elige otro horario.')
  if (!horario.disponible) throw errorDeHorario('Ese horario acaba de ser reservado por otra persona. Elige otro horario.')

  const clienteId = clienteDeSesion()?.id ?? null
  const lista = leerColeccion(CLAVES.visitas)
  const visita = {
    id: siguienteId(lista),
    clienteId,
    asesorId: datos.asesorId,
    proyectoId: datos.proyectoId ?? null,
    loteId: datos.loteId ?? null,
    loteCodigo: datos.loteCodigo ?? null,
    fecha: datos.fecha,
    hora: datos.hora,
    tipo: 'Visita al proyecto',
    estado: 'PENDIENTE',
    observaciones: String(datos.observaciones ?? '').trim() || null,
    fechaRegistro: new Date().toISOString(),
    contacto: datosDeContacto(datos),
  }
  guardarColeccion(CLAVES.visitas, [...lista, visita])

  const resultado = enriquecer(visita)
  const detalle = `${descripcionLote(visita)} · ${cuandoVisita(visita)}`

  publicar(EVENTOS.visitaAgendada, {
    clienteId,
    asesorId: visita.asesorId,
    detalle,
    asesorNombre: resultado.asesor?.nombre,
    clienteNombre: resultado.cliente?.nombre,
  })
  registrarInteres(clienteId, visita.asesorId, visita.loteCodigo)

  return resultado
}

// Eventos que genera cada cambio de estado de una visita (historial del cliente + aviso).
const EVENTOS_VISITA = {
  CONFIRMADA: 'Visita confirmada',
  REALIZADA: 'Visita realizada',
  CANCELADA: 'Visita cancelada',
}

/**
 * Equivalente simulado de PATCH /api/visitas/:id. El asesor asignado puede confirmar, marcar como
 * realizada o cancelar (según TRANSICIONES_VISITA); el cliente solo puede cancelar las suyas.
 */
export async function actualizarVisita(id, { estado }) {
  await esperar()
  const sesion = obtenerUsuarioSesion()
  const lista = leerColeccion(CLAVES.visitas)
  const visita = lista.find((v) => mismoId(v.id, id))
  if (!visita) throw new Error('No encontramos esa visita.')

  const esAsesor = sesion?.tipo === 'asesor' && visita.asesorId === sesion.id
  const esCliente = sesion?.tipo === 'cliente' && mismoId(visita.clienteId, sesion.id)
  if (!esAsesor && !(esCliente && estado === 'CANCELADA')) throw new Error('No puedes modificar esta visita.')
  if (!(TRANSICIONES_VISITA[visita.estado] ?? []).includes(estado)) {
    const actual = buscarEstado(ESTADOS_VISITA, visita.estado).label.toLowerCase()
    throw new Error(`Una visita ${actual} no se puede pasar a ese estado.`)
  }

  const actualizada = { ...visita, estado, fechaActualizacion: new Date().toISOString() }
  guardarColeccion(CLAVES.visitas, lista.map((v) => (v === visita ? actualizada : v)))

  const resultado = enriquecer(actualizada)
  const titulo = EVENTOS_VISITA[estado]
  const detalle = `${descripcionLote(visita)} · ${cuandoVisita(visita)}`

  publicar(EVENTOS.visitaActualizada, {
    clienteId: visita.clienteId,
    asesorId: visita.asesorId,
    estado,
    titulo,
    detalle,
    esAsesor,
    esCliente,
    asesorNombre: resultado.asesor?.nombre,
    clienteNombre: resultado.cliente?.nombre,
  })

  return resultado
}

/** Equivalente simulado de GET /api/clientes/:id/visitas */
export async function getVisitasDeCliente(clienteId) {
  await esperar()
  const lista = deCliente(leerColeccion(CLAVES.visitas), clienteId).map(enriquecer).sort(porFechaAsc)
  return { visitas: lista, proxima: proximaVisita(lista) }
}

/** Equivalente simulado de GET /api/asesores/:id/visitas (agenda en orden cronológico). */
export async function getAgendaDeAsesor(asesorId) {
  await esperar()
  return deAsesor(leerColeccion(CLAVES.visitas), asesorId).map(enriquecer).sort(porFechaAsc)
}

// ── Seguimiento comercial ──────────────────────────────────────────────────────────────────────

/**
 * Equivalente simulado de GET /api/asesores/:id/clientes: cada cliente asignado con su
 * seguimiento comercial (etapa, lotes de interés, notas y última interacción).
 */
export async function getCarteraDeAsesor(asesorId) {
  await esperar()
  return deAsesor(leerColeccion(CLAVES.seguimiento), asesorId)
    .map(enriquecerSeguimiento)
    .sort((a, b) => b.ultimaInteraccion.localeCompare(a.ultimaInteraccion))
}

/**
 * Equivalente simulado de PATCH /api/seguimiento/:id (solo el asesor asignado).
 *   etapa: nueva etapa (ETAPAS_CLIENTE) → nota de cambio + historial + aviso al cliente
 *   nota:  { tipo: 'CONTACTO' | 'NOTA', texto } → las notas son internas; un CONTACTO actualiza
 *          la última interacción y aparece en el historial del cliente (sin el texto interno).
 */
export async function actualizarSeguimiento(id, { etapa, nota } = {}) {
  await esperar()
  const asesor = asesorDeSesion()
  const lista = leerColeccion(CLAVES.seguimiento)
  const seguimiento = lista.find((s) => mismoId(s.id, id))

  if (!seguimiento) throw new Error('No encontramos ese seguimiento.')
  if (!asesor || seguimiento.asesorId !== asesor.id) throw new Error('Este cliente no está asignado a ti.')

  const hoy = fechaLocalISO()
  let actualizado = { ...seguimiento, notas: [...seguimiento.notas] }

  if (nota) {
    const texto = String(nota.texto ?? '').trim()
    if (!['CONTACTO', 'NOTA'].includes(nota.tipo)) throw new Error('El tipo de nota no es válido.')
    if (!texto) throw new Error('Escribe el texto de la nota.')
    actualizado.notas.push({ fecha: hoy, tipo: nota.tipo, texto })
    if (nota.tipo === 'CONTACTO') {
      actualizado.ultimaInteraccion = hoy
      publicar(EVENTOS.contactoRegistrado, { clienteId: seguimiento.clienteId, asesorNombre: asesor.nombre })
    }
  }

  if (etapa && etapa !== seguimiento.etapa) {
    const nueva = ETAPAS_CLIENTE.find((e) => e.value === etapa)
    if (!nueva) throw new Error('La etapa no es válida.')
    actualizado = {
      ...actualizado,
      etapa,
      notas: [...actualizado.notas, { fecha: hoy, tipo: 'ESTADO', texto: `Estado actualizado a "${nueva.label}".` }],
    }
    publicar(EVENTOS.etapaActualizada, { clienteId: seguimiento.clienteId, etapa: nueva.label })
  }

  guardarColeccion(CLAVES.seguimiento, lista.map((s) => (s === seguimiento ? actualizado : s)))
  return enriquecerSeguimiento(actualizado)
}

// ── Historial y notificaciones ─────────────────────────────────────────────────────────────────

/** Equivalente simulado de GET /api/clientes/:id/historial (orden cronológico). */
export async function getHistorialDeCliente(clienteId) {
  await esperar()
  return deCliente(leerColeccion(CLAVES.historial), clienteId).sort(porFechaAsc)
}

const esDestinatario = (tipo, id) => (n) => n.destinatarioTipo === tipo && mismoId(n.destinatarioId, id)

/** Equivalente simulado de GET /api/notificaciones (del cliente o asesor indicado, recientes primero). */
export async function getNotificaciones(tipoUsuario, usuarioId) {
  await esperar()
  return leerColeccion(CLAVES.notificaciones).filter(esDestinatario(tipoUsuario, usuarioId)).sort(porFechaDesc)
}

/** Equivalente simulado de PATCH /api/notificaciones/leidas. Solo marca las del usuario en sesión. */
export async function marcarNotificacionesLeidas(ids) {
  await esperar()
  const sesion = obtenerUsuarioSesion()
  if (!sesion) throw new Error('Tu sesión terminó. Vuelve a ingresar.')
  const propia = esDestinatario(sesion.tipo, sesion.id)
  const marcar = new Set(ids.map(String))

  const lista = leerColeccion(CLAVES.notificaciones).map((n) =>
    propia(n) && marcar.has(String(n.id)) ? { ...n, leida: true } : n,
  )
  guardarColeccion(CLAVES.notificaciones, lista)
  return lista.filter(propia).sort(porFechaDesc)
}

// ── Cliente ────────────────────────────────────────────────────────────────────────────────────

/** Equivalente simulado de GET /api/clientes/:id */
export async function getCliente(id) {
  await esperar()
  const cliente = clienteConCambios(getClienteMockById(id))
  if (!cliente) throw new Error('No encontramos tus datos de cliente.')
  return cliente
}

/**
 * Equivalente simulado de GET /api/clientes/me (propuesto).
 * Cliente de la sesión actual (o null si no hay sesión de cliente). Los formularios públicos lo
 * usan para completar solos los datos de contacto que ya conocemos.
 */
export async function getClienteDeSesion() {
  const sesion = clienteDeSesion()
  return sesion ? clienteConCambios(getClienteMockById(sesion.id)) : null
}

/**
 * Equivalente simulado de PUT /api/clientes/:id. Hoy guarda los cambios solo en el localStorage de
 * este navegador (no hay base de datos). El DNI y el código no se editan.
 */
export async function actualizarPerfilCliente(id, cambios) {
  await esperar()
  const nombre = String(cambios.nombre ?? '').trim()
  const telefono = String(cambios.telefono ?? '').trim()
  const email = String(cambios.email ?? '').trim()

  if (!nombre) throw new Error('El nombre es obligatorio.')
  if (!esNumeroDeNueveDigitos(telefono)) throw new Error('El teléfono debe tener 9 dígitos.')
  if (email && !esCorreoValido(email)) throw new Error('El correo no es válido.')

  const todos = leerJSON(CLAVES.perfilesClientes, {}) ?? {}
  todos[id] = { nombre, telefono, email }
  if (!guardarJSON(CLAVES.perfilesClientes, todos)) {
    throw new Error('Este navegador no permite guardar los cambios.')
  }
  return clienteConCambios(getClienteMockById(id))
}

/** Equivalente simulado de GET /api/clientes/:id/lotes (cada lote con su `relacion`). */
export async function getLotesDeCliente(clienteId) {
  await esperar()
  return lotesDelCliente(seguimientoDeCliente(clienteId))
}

/** Equivalente simulado de GET /api/clientes/:id/documentos (todavía sin archivos reales). */
export async function getDocumentosDeCliente(clienteId) {
  await esperar()
  return deCliente(documentosMock, clienteId).map(enriquecer)
}

/** Equivalente simulado de GET /api/clientes/:id/resumen (propuesto): dashboard del cliente en una sola consulta. */
export async function getResumenCliente(clienteId) {
  await esperar()
  const cliente = clienteConCambios(getClienteMockById(clienteId))
  if (!cliente) throw new Error('No encontramos tus datos de cliente.')

  const seguimiento = seguimientoDeCliente(clienteId)
  const visitas = deCliente(leerColeccion(CLAVES.visitas), clienteId).map(enriquecer).sort(porFechaAsc)
  const solicitudes = deCliente(leerColeccion(CLAVES.solicitudes), clienteId)

  return {
    cliente,
    // El asesor que lleva su seguimiento; si aún no tiene, el asignado en su ficha.
    asesor: resumenPersona(buscarAsesor(seguimiento?.asesorId ?? cliente.asesorId)),
    etapa: seguimiento?.etapa ?? 'NUEVO',
    lotes: lotesDelCliente(seguimiento),
    totalSolicitudes: solicitudes.length,
    solicitudesAbiertas: solicitudes.filter((s) => s.estado === 'PENDIENTE' || s.estado === 'EN_ATENCION').length,
    proximaVisita: proximaVisita(visitas),
  }
}

// ── Asesor ─────────────────────────────────────────────────────────────────────────────────────

/** Equivalente simulado de GET /api/asesores/:id (perfil del equipo en `data/equipo.js`, sin credenciales). */
export async function getAsesor(id) {
  await esperar()
  const asesor = buscarAsesor(id)
  if (!asesor) throw new Error('No encontramos tu perfil de asesor.')
  return { ...sinCredenciales(asesor), perfil: getIntegranteById(id) }
}

const TITULO_ACTIVIDAD = {
  INFORMACION: 'Nueva solicitud de información',
  COTIZACION: 'Nueva solicitud de cotización',
  VISITA: 'Nueva visita agendada',
  SEPARACION: 'Nueva solicitud de separación',
}

/** Equivalente simulado de GET /api/asesores/:id/resumen (propuesto): indicadores y actividad del dashboard del asesor. */
export async function getResumenAsesor(asesorId) {
  await esperar()
  const hoy = fechaLocalISO()
  const solicitudes = deAsesor(leerColeccion(CLAVES.solicitudes), asesorId)
  const visitas = deAsesor(leerColeccion(CLAVES.visitas), asesorId)
  const cartera = deAsesor(leerColeccion(CLAVES.seguimiento), asesorId)
  const visitasVigentes = visitas.filter((v) => ESTADOS_VISITA_ACTIVOS.includes(v.estado) && v.fecha >= hoy)

  // Actividad: solicitudes recibidas + visitas agendadas desde el sitio (fechadas el día en que
  // se registraron; las visitas iniciales del mock no tienen esa fecha y no aparecen aquí).
  const actividadSolicitudes = solicitudes
    .filter((s) => s.estado !== 'CANCELADA')
    .map((s) => ({ ...enriquecer(s), id: `solicitud-${s.id}`, orden: s.id, titulo: TITULO_ACTIVIDAD[s.tipo] }))
  const actividadVisitas = visitas
    .filter((v) => v.fechaRegistro && v.estado !== 'CANCELADA')
    .map((v) => ({
      ...enriquecer(v),
      id: `visita-${v.id}`,
      orden: v.id,
      fecha: fechaLocalISO(new Date(v.fechaRegistro)),
      hora: null,
      titulo: TITULO_ACTIVIDAD.VISITA,
    }))

  return {
    indicadores: {
      clientes: cartera.length,
      solicitudesPendientes: solicitudes.filter((s) => s.estado === 'PENDIENTE').length,
      visitasProgramadas: visitasVigentes.length,
      visitasPorConfirmar: visitasVigentes.filter((v) => v.estado === 'PENDIENTE').length,
      cotizaciones: solicitudes.filter((s) => s.tipo === 'COTIZACION').length,
      separaciones: solicitudes.filter((s) => s.tipo === 'SEPARACION').length,
      ventas: cartera.filter((s) => s.etapa === 'VENTA').length,
    },
    actividad: [...actividadSolicitudes, ...actividadVisitas]
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.orden - a.orden)
      .slice(0, 6),
  }
}

// ── Administración ─────────────────────────────────────────────────────────────────────────────
// Rol ADMIN mínimo: supervisa (clientes, asesores, solicitudes, visitas), reasigna clientes y
// registra separaciones. El "asesor asignado" de un cliente es el de su seguimiento comercial
// (`leones_seguimiento`); `cliente.asesorId` es solo el valor inicial si aún no tiene uno.

function exigirAdmin() {
  const sesion = obtenerUsuarioSesion()
  if (sesion?.tipo !== 'admin') throw new Error('Esta acción es solo para administración.')
  return sesion
}

function asesorAsignadoId(cliente, seguimientos = leerColeccion(CLAVES.seguimiento)) {
  return seguimientos.find((s) => mismoId(s.clienteId, cliente.id))?.asesorId ?? cliente.asesorId ?? null
}

function fichaClienteAdmin(clienteBase) {
  const seguimiento = seguimientoDeCliente(clienteBase.id)
  const asesorId = asesorAsignadoId(clienteBase)
  return {
    ...clienteConCambios(clienteBase),
    asesorId,
    asesor: resumenPersona(buscarAsesor(asesorId)),
    etapa: seguimiento?.etapa ?? 'NUEVO',
    // ESTADOS_CUENTA: los clientes de demostración ya están activos; los dados de alta nacen PENDIENTE.
    cuenta: estadoCuenta(clienteBase),
    seguimientoId: seguimiento?.id ?? null,
    lotes: lotesDelCliente(seguimiento),
  }
}

/** Equivalente simulado de GET /api/admin/resumen (solo conteos; sin indicadores ni ranking). */
export async function getResumenAdmin() {
  await esperar()
  exigirAdmin()
  return {
    clientes: getClientes().length,
    asesores: asesoresMock.length,
    solicitudesPendientes: leerColeccion(CLAVES.solicitudes).filter((s) => s.estado === 'PENDIENTE').length,
    visitasPendientes: leerColeccion(CLAVES.visitas).filter((v) => v.estado === 'PENDIENTE').length,
    lotesSeparados: leerColeccion(CLAVES.separaciones).filter((s) => s.estado === 'VIGENTE').length,
  }
}

/** Equivalente simulado de GET /api/admin/clientes (con asesor asignado, etapa y lotes). */
export async function getClientesAdmin() {
  await esperar()
  exigirAdmin()
  return getClientes().map(fichaClienteAdmin)
}

/** Equivalente simulado de GET /api/admin/asesores (cuántos clientes y pendientes tiene cada uno). */
export async function getAsesoresAdmin() {
  await esperar()
  exigirAdmin()
  const seguimientos = leerColeccion(CLAVES.seguimiento)
  const solicitudes = leerColeccion(CLAVES.solicitudes)
  const visitas = leerColeccion(CLAVES.visitas)

  return asesoresMock.map((asesor) => ({
    ...sinCredenciales(asesor),
    clientesAsignados: getClientes().filter((c) => asesorAsignadoId(c, seguimientos) === asesor.id).length,
    solicitudesPendientes: deAsesor(solicitudes, asesor.id).filter((s) => s.estado === 'PENDIENTE').length,
    visitasPendientes: deAsesor(visitas, asesor.id).filter((v) => v.estado === 'PENDIENTE').length,
  }))
}

/** Equivalente simulado de GET /api/admin/solicitudes (todas; recientes primero). */
export async function getSolicitudesAdmin() {
  await esperar()
  exigirAdmin()
  return leerColeccion(CLAVES.solicitudes).map(enriquecer).sort(porFechaDesc)
}

/** Equivalente simulado de GET /api/admin/visitas (todas; en orden cronológico). */
export async function getVisitasAdmin() {
  await esperar()
  exigirAdmin()
  return leerColeccion(CLAVES.visitas).map(enriquecer).sort(porFechaAsc)
}

/** Equivalente simulado de GET /api/admin/separaciones (recientes primero). */
export async function getSeparaciones() {
  await esperar()
  exigirAdmin()
  return leerColeccion(CLAVES.separaciones).map(enriquecer).sort(porFechaDesc)
}

/**
 * Equivalente simulado de PATCH /api/admin/clientes/:id/asesor. Reasignación MANUAL: el
 * seguimiento del cliente (etapa, notas, lotes) pasa al nuevo asesor. Las solicitudes y visitas
 * ya recibidas siguen con el asesor al que el cliente se las envió.
 */
export async function reasignarCliente(clienteId, nuevoAsesorId) {
  await esperar()
  const admin = exigirAdmin()
  const clienteBase = getClienteMockById(clienteId)
  const nuevo = buscarAsesor(nuevoAsesorId)
  if (!clienteBase) throw new Error('No encontramos ese cliente.')
  if (!nuevo) throw new Error('El asesor elegido no existe.')

  const anteriorId = asesorAsignadoId(clienteBase)
  if (anteriorId === nuevoAsesorId) throw new Error(`${nuevo.nombre} ya es el asesor de este cliente.`)
  const anterior = buscarAsesor(anteriorId)
  const cliente = clienteConCambios(clienteBase)
  const hoy = fechaLocalISO()
  const nota = {
    fecha: hoy,
    tipo: 'ASIGNACION',
    texto: `Cliente reasignado de ${anterior?.nombre ?? 'sin asesor'} a ${nuevo.nombre} por ${admin.nombre}.`,
  }

  const lista = leerColeccion(CLAVES.seguimiento)
  const existente = lista.find((s) => mismoId(s.clienteId, clienteBase.id))
  guardarColeccion(
    CLAVES.seguimiento,
    existente
      ? lista.map((s) => (s === existente ? { ...s, asesorId: nuevoAsesorId, notas: [...s.notas, nota] } : s))
      : [
          ...lista,
          { id: siguienteId(lista), clienteId: clienteBase.id, asesorId: nuevoAsesorId, etapa: 'NUEVO', lotesInteres: [], ultimaInteraccion: hoy, notas: [nota] },
        ],
  )

  publicar(EVENTOS.clienteReasignado, {
    clienteId: clienteBase.id,
    nuevoAsesorId,
    anteriorAsesorId: anteriorId,
    nuevoAsesorNombre: nuevo.nombre,
    clienteNombre: cliente.nombre,
    clienteCodigo: cliente.codigo,
  })

  return fichaClienteAdmin(clienteBase)
}

const ordenEtapa = (valor) => ETAPAS_CLIENTE.findIndex((e) => e.value === valor)

/**
 * Equivalente simulado de POST /api/separaciones. Primera transición del lote: INTERES → SEPARADO.
 * Solo puede registrarla quien figure en PUEDEN_REGISTRAR_SEPARACION (hoy, administración), y
 * solo sobre un lote de interés del cliente que siga DISPONIBLE. No hay ventas ni pagos todavía.
 */
export async function registrarSeparacion(clienteId, loteCodigo) {
  await esperar()
  const sesion = obtenerUsuarioSesion()
  if (!PUEDEN_REGISTRAR_SEPARACION.includes(sesion?.tipo)) throw new Error('No tienes permiso para registrar separaciones.')

  const clienteBase = getClienteMockById(clienteId)
  if (!clienteBase) throw new Error('No encontramos ese cliente.')
  const seguimientos = leerColeccion(CLAVES.seguimiento)
  const seguimiento = seguimientos.find((s) => mismoId(s.clienteId, clienteBase.id))
  if (!seguimiento?.lotesInteres.includes(loteCodigo)) throw new Error('Ese lote no está entre los lotes de interés del cliente.')

  const loteBase = lotes.find((l) => l.codigo === loteCodigo)
  if (!loteBase) throw new Error('No encontramos ese lote.')
  const lote = conEstadoComercial(loteBase)
  if (lote.estadoFuente === 'separacion') throw new Error('Este lote ya tiene una separación vigente.')
  if (lote.estado !== 'DISPONIBLE') {
    throw new Error(`El lote figura como "${ESTADO_LABEL[lote.estado] ?? lote.estado}" en el plano: no se puede separar.`)
  }

  const hoy = fechaLocalISO()
  const separaciones = leerColeccion(CLAVES.separaciones)
  const separacion = {
    id: siguienteId(separaciones),
    clienteId: clienteBase.id,
    loteCodigo,
    loteId: loteBase.id,
    proyectoId: loteBase.proyectoId,
    asesorId: seguimiento.asesorId,
    fecha: hoy,
    fechaRegistro: new Date().toISOString(),
    estado: 'VIGENTE',
    registradoPor: { tipo: sesion.tipo, id: sesion.id, nombre: sesion.nombre },
  }
  guardarColeccion(CLAVES.separaciones, [...separaciones, separacion])

  // El seguimiento refleja la separación: nota y, si todavía no llegaba, etapa SEPARACION.
  const donde = descripcionLote(separacion)
  const avanzaEtapa = ordenEtapa(seguimiento.etapa) < ordenEtapa('SEPARACION')
  guardarColeccion(
    CLAVES.seguimiento,
    seguimientos.map((s) =>
      s === seguimiento
        ? {
            ...s,
            etapa: avanzaEtapa ? 'SEPARACION' : s.etapa,
            ultimaInteraccion: hoy,
            notas: [...s.notas, { fecha: hoy, tipo: 'SEPARACION', texto: `Separación del lote (${donde}) registrada por ${sesion.nombre}.` }],
          }
        : s,
    ),
  )

  const cliente = clienteConCambios(clienteBase)
  publicar(EVENTOS.separacionRegistrada, {
    clienteId: clienteBase.id,
    asesorId: seguimiento.asesorId,
    donde,
    avanzaEtapa,
    clienteNombre: cliente.nombre,
    registradoPor: sesion.nombre,
  })

  return enriquecer(separacion)
}

// ── Alta y activación de cuentas de cliente ────────────────────────────────────────────────────
// El cliente NO se registra solo: administración lo da de alta (datos básicos + asesor) y el
// sistema le asigna un código con el patrón existente (CLI001, CLI002…). La cuenta queda
// PENDIENTE (`activado: false`, sin contraseña) hasta que el cliente la activa con ese código.
// Solo los clientes nuevos se guardan en `leones_clientes`; los de `clientesMock` no se tocan.

/** Siguiente código libre: CLI + número correlativo de 3 dígitos (como los de clientesMock). */
/**
 * Id y código del próximo cliente. Nunca reutiliza un id que ya aparezca en algún registro
 * (solicitudes, visitas, seguimiento, historial, separaciones, testimonios, documentos,
 * notificaciones): si se quitó un cliente de los mocks, sus datos no pasan al cliente nuevo.
 * El código sigue el patrón existente CLI + 3 dígitos (CLI001 ↔ id 1) y tampoco se repite.
 * Con PostgreSQL esto lo resuelve una secuencia (SERIAL / IDENTITY).
 */
function siguienteIdentidadCliente(clientes) {
  const idsUsados = [
    ...clientes.map((c) => c.id),
    ...[CLAVES.solicitudes, CLAVES.visitas, CLAVES.seguimiento, CLAVES.historial, CLAVES.separaciones, CLAVES.testimonios]
      .flatMap((clave) => leerColeccion(clave).map((r) => r.clienteId)),
    ...documentosMock.map((d) => d.clienteId),
    ...leerColeccion(CLAVES.notificaciones).filter((n) => n.destinatarioTipo === 'cliente').map((n) => n.destinatarioId),
  ]
  const codigosUsados = new Set(clientes.map((c) => normalizarCodigo(c.codigo)))
  let id = idsUsados.reduce((maximo, valor) => Math.max(maximo, Number(valor) || 0), 0) + 1
  const codigoDe = (numero) => `CLI${String(numero).padStart(3, '0')}`
  while (codigosUsados.has(codigoDe(id))) id += 1
  return { id, codigo: codigoDe(id) }
}

const estadoCuenta = (cliente) => (cuentaActivada(cliente) ? 'ACTIVADA' : 'PENDIENTE')
const normalizarCodigo = (codigo) => String(codigo ?? '').trim().toUpperCase()

/** Cliente pendiente de activación con ese código y DNI, o un error explicado en lenguaje sencillo. */
function clienteParaActivar(codigo, dni) {
  const cliente = getClientes().find((c) => normalizarCodigo(c.codigo) === normalizarCodigo(codigo))
  if (!cliente) throw new Error('No encontramos ese código de cliente. Revisa que esté escrito tal como te lo entregaron.')
  if (cuentaActivada(cliente)) throw new Error('Esta cuenta ya fue activada. Ingresa con tu código y tu contraseña.')
  // El DNI (que registró la empresa) confirma que quien activa es el titular del código.
  if (String(dni ?? '').trim() !== cliente.dni) throw new Error('El DNI no coincide con el registrado para ese código.')
  return cliente
}

/**
 * Equivalente simulado de POST /api/admin/clientes. Da de alta un cliente con su asesor; nace con
 * la cuenta pendiente de activación. También le abre su seguimiento comercial (etapa NUEVO) con ese
 * asesor, igual que el resto de clientes, para que el asesor lo vea desde el primer momento.
 */
export async function crearCliente(datos) {
  await esperar()
  const admin = exigirAdmin()

  const nombre = String(datos.nombre ?? '').trim()
  const dni = String(datos.dni ?? '').trim()
  const telefono = String(datos.telefono ?? '').replace(/\s/g, '')
  const email = String(datos.email ?? '').trim()
  const asesor = buscarAsesor(datos.asesorId)

  if (nombre.length < 3) throw new Error('Escribe el nombre completo del cliente.')
  if (!esDniValido(dni)) throw new Error('El DNI debe tener 8 dígitos.')
  if (!esCelularConNueveInicial(telefono)) throw new Error('El teléfono debe tener 9 dígitos y empezar con 9.')
  if (email && !esCorreoValido(email)) throw new Error('El correo no es válido.')
  if (!asesor) throw new Error('Elige el asesor que atenderá al cliente.')

  const todos = getClientes()
  if (todos.some((c) => c.dni === dni)) throw new Error('Ya existe un cliente con ese DNI.')

  const nuevos = leerColeccion(CLAVES.clientes)
  const cliente = {
    ...siguienteIdentidadCliente(todos),
    nombre,
    // Sin usuario propio: el cliente ingresa con su código (el login ya acepta usuario o código).
    usuario: null,
    password: null,
    dni,
    telefono,
    email: email || null,
    asesorId: asesor.id,
    activado: false,
    fechaAlta: fechaLocalISO(),
    fechaActivacion: null,
    altaPor: { tipo: admin.tipo, id: admin.id, nombre: admin.nombre },
  }
  guardarColeccion(CLAVES.clientes, [...nuevos, cliente])

  const seguimientos = leerColeccion(CLAVES.seguimiento)
  guardarColeccion(CLAVES.seguimiento, [
    ...seguimientos,
    {
      id: siguienteId(seguimientos),
      clienteId: cliente.id,
      asesorId: asesor.id,
      etapa: 'NUEVO',
      lotesInteres: [],
      ultimaInteraccion: cliente.fechaAlta,
      notas: [{ fecha: cliente.fechaAlta, tipo: 'ALTA', texto: `Cliente dado de alta por ${admin.nombre} con el código ${cliente.codigo}.` }],
    },
  ])

  publicar(EVENTOS.clienteDadoDeAlta, { clienteId: cliente.id, asesorId: asesor.id, nombre: cliente.nombre, codigo: cliente.codigo })

  return fichaClienteAdmin(cliente)
}

/**
 * Equivalente simulado de POST /api/auth/activacion/verificar (propuesto).
 * Paso 1 de "Activar mi cuenta": comprueba código + DNI y dice qué datos faltan completar.
 * Nunca devuelve credenciales.
 */
export async function verificarCodigoActivacion({ codigo, dni }) {
  await esperar()
  const cliente = clienteParaActivar(codigo, dni)
  return { codigo: cliente.codigo, nombre: cliente.nombre, faltaCorreo: !cliente.email }
}

/**
 * Equivalente simulado de POST /api/auth/activacion (propuesto; la API guarda el HASH, nunca la contraseña).
 * Paso 2 de "Activar mi cuenta": guarda la contraseña (misma forma que el login mock actual) y, si
 * faltaba, el correo. La cuenta pasa a ACTIVADA y ya puede iniciar sesión con código + contraseña.
 */
export async function activarCuentaCliente({ codigo, dni, password, confirmacion, email }) {
  await esperar()
  const cliente = clienteParaActivar(codigo, dni)

  if (String(password ?? '').length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.')
  if (password !== confirmacion) throw new Error('Las contraseñas no coinciden.')
  const correo = String(email ?? '').trim()
  if (correo && !esCorreoValido(correo)) throw new Error('El correo no es válido.')

  const hoy = fechaLocalISO()
  const nuevos = leerColeccion(CLAVES.clientes)
  if (!nuevos.some((c) => mismoId(c.id, cliente.id))) throw new Error('Esta cuenta no se puede activar desde aquí.')
  guardarColeccion(
    CLAVES.clientes,
    nuevos.map((c) =>
      mismoId(c.id, cliente.id)
        ? { ...c, password, email: c.email ?? (correo || null), activado: true, fechaActivacion: hoy }
        : c,
    ),
  )

  const asesorId = seguimientoDeCliente(cliente.id)?.asesorId ?? cliente.asesorId
  const asesor = buscarAsesor(asesorId)
  publicar(EVENTOS.cuentaActivada, {
    clienteId: cliente.id,
    asesorId,
    nombre: cliente.nombre,
    codigo: cliente.codigo,
    asesorNombre: asesor?.nombre,
  })

  return { codigo: cliente.codigo, nombre: cliente.nombre }
}
