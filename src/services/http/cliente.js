// CLIENTE HTTP PARA LA API REAL (Express + PostgreSQL). Todavía NO lo usa ninguna función: hoy los
// datos salen del almacén mock (`almacen.js`). Cuando llegue la API, cada función de
// `services/*.js` reemplaza su cuerpo por una llamada a `solicitar()` con el endpoint que ya figura
// en su comentario ("GET /api/…"), sin cambiar su nombre ni la forma de lo que devuelve: así las
// pantallas no se tocan.
//
// Configuración: copiar `.env.example` como `.env.local` y completar VITE_API_URL
// (p. ej. https://api.leones.pe). Sin esa variable, `hayApiConfigurada` es false.
import { expirarSesion, obtenerTokenSesion } from '../sesion'

export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '') || null
export const hayApiConfigurada = Boolean(API_URL)

/** Error de la API con el código HTTP y el cuerpo recibido (para mostrar `message` al usuario). */
export class ErrorApi extends Error {
  constructor(mensaje, { estado, datos } = {}) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.datos = datos
  }
}

/**
 * Llama a la API: `solicitar('/proyectos')`, `solicitar('/solicitudes', { metodo: 'POST', cuerpo })`.
 *   consulta: objeto para el query string (se omiten null/undefined)
 *   cuerpo:   objeto que se envía como JSON
 * Envía `Authorization: Bearer <token>` si la sesión lo tiene. PENDIENTE con el equipo de la API: el
 * contrato habla de un token (JWT) pero no define si viaja como Bearer o en una cookie HttpOnly, ni su
 * expiración ni su refresco; hasta confirmarlo se usa Bearer, que es lo que ya estaba previsto aquí.
 * Devuelve el JSON de la respuesta (o null si viene vacía).
 */
export async function solicitar(ruta, { metodo = 'GET', cuerpo, consulta, senal } = {}) {
  if (!hayApiConfigurada) throw new ErrorApi('La API todavía no está configurada (falta VITE_API_URL).')

  const url = new URL(`${API_URL}/api${ruta.startsWith('/') ? ruta : `/${ruta}`}`)
  Object.entries(consulta ?? {}).forEach(([clave, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') url.searchParams.set(clave, valor)
  })

  const token = obtenerTokenSesion()
  let respuesta
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: senal,
    })
  } catch {
    throw new ErrorApi('No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo nuevamente.')
  }

  const texto = await respuesta.text()
  let datos
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    datos = texto
  }

  if (!respuesta.ok) {
    // 401 con token enviado = sesión vencida o revocada: se cierra la sesión local. No aplica a /auth/*
    // (ahí un 401 son credenciales incorrectas) ni a otros errores (403, 5xx, red), que no invalidan la sesión.
    if (respuesta.status === 401 && token && !/^\/?auth\//.test(ruta)) expirarSesion(token)
    // Convención propuesta a la API: { message: 'texto para el usuario' } en los errores.
    const mensaje = datos?.message ?? datos?.mensaje ?? `Error ${respuesta.status} al consultar el servidor.`
    throw new ErrorApi(mensaje, { estado: respuesta.status, datos })
  }
  return datos
}
