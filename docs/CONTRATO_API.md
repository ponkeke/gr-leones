# Contrato frontend ↔ API — Grupo Inmobiliario Leones del Sur

Este documento dice qué necesita el frontend de la API real. Los endpoints son **propuestos**: salen
de las funciones que ya existen en `src/services/` y todavía deben confirmarse con el equipo de la
API. Cuando algo cambie, se ajusta aquí y en la función correspondiente, no en las pantallas.

## 1. Cómo se conecta

```
Pantallas (React) ──► services/api.js (fachada)
                          │  fuenteDatos.js elige la estrategia (patrón Strategy)
                          ├─► mock/  datos de prueba en el navegador (almacén local)
                          └─► http/  cliente.js ──► API REST ──► PostgreSQL/PostGIS
                                     adaptadores.js convierte cada respuesta a la forma del frontend (patrón Adapter)
```

- Las pantallas **solo** importan `services/api.js`. Ninguna sabe si los datos vienen del mock o de la API.
- **mock** (`services/mock/`) y **http** (`services/http/index.js`) exportan **exactamente los mismos
  nombres** y devuelven la misma forma. En desarrollo, `fuenteDatos.js` avisa en consola si no coinciden.
- **Activar la API real**: copiar `.env.example` como `.env.local` y completar `VITE_API_URL`. Opcional:
  `VITE_FUENTE_DATOS=mock|http` fuerza una estrategia.
- **Si la API usa otros nombres o formas**: se ajusta solo `services/http/adaptadores.js` (acepta camelCase y
  snake_case, listas como arreglo o `{ items }`/`{ data }`, y traduce el 409 de visitas a "horario ocupado").
- **Si cambia una ruta**: se ajusta solo la función de `services/http/index.js`.
- `services/compartido.js` tiene la lógica pura que usan las dos estrategias (tarjetas de comunicados,
  próxima visita, redes confirmadas).
- La autenticación ya pasa por la fachada: `iniciarSesion` y `cerrarSesion` de `services/api.js` (mock y http). La sesión local
  (`services/sesion.js`) es independiente de la estrategia; `utils/authMock.js` queda solo como capa de compatibilidad temporal.
  Las cuentas del mock (contraseñas en archivos del frontend) son de demostración y **no** representan autenticación de producción.
- Historial del comprador y notificaciones: con la API real las genera el **servidor** (el frontend solo las lee con
  `GET /clientes/:id/historial` y `GET /notificaciones`). En el mock salen de eventos de dominio (observer interno,
  `services/mock/eventosDominio.js` y `suscriptores.js`); es un detalle del mock y no forma parte del contrato.

## 2. Convenciones que proponemos a la API

| Tema | Propuesta |
|---|---|
| Formato | JSON; nombres de campos en español y camelCase, como hoy en el frontend (se pueden mapear si la API usa snake_case). |
| Fechas | Día: `YYYY-MM-DD`. Momento: ISO 8601 con zona (`2026-09-30T15:04:00Z`). Hora de visita: `HH:mm` (24 h). |
| Ids | Numéricos para clientes, solicitudes, visitas, etc. Hoy asesores usan texto (`asesora-ventas-1`): **definir**. |
| Errores | Código HTTP + `{ "message": "texto para el usuario" }`. El frontend muestra `message` tal cual. |
| Autenticación | Login devuelve un token (JWT) + datos mínimos del usuario `{ id, codigo, nombre, tipo, cargo }`. `tipo`: `cliente` \| `asesor` \| `admin`. |
| Permisos | La API debe validar el rol en cada endpoint (el frontend ya lo hace, pero no es seguridad). |
| Estados | Usar los mismos valores que el frontend (ver sección 4). |

## 3. Endpoints que usa el frontend

Rol: **P** público · **C** cliente · **A** asesor · **Ad** administrador.

### Autenticación y cuentas
| Método y ruta | Rol | Función del frontend | Para qué |
|---|---|---|---|
| POST `/api/auth/login` | P | `iniciarSesion` | Usuario o código + contraseña → token + usuario. El frontend envía `{ usuario, password, tipo }`; `tipo` es la pestaña elegida y **la API debe verificarlo** (el frontend rechaza una respuesta de otro tipo). Credenciales incorrectas → 401 con mensaje genérico (que no permita enumerar cuentas). |
| POST `/api/auth/activacion/verificar` | P | `verificarCodigoActivacion` | Código + DNI → `{ codigo, nombre, faltaCorreo }`. |
| POST `/api/auth/activacion` | P | `activarCuentaCliente` | Código + DNI + contraseña (+correo) → activa la cuenta. La API guarda el **hash**. |
| POST `/api/admin/clientes` | Ad | `crearCliente` | Alta de cliente (nombre, DNI, teléfono, correo, asesor) → genera código, cuenta PENDIENTE. |
| GET `/api/clientes/me` | C | `getClienteDeSesion` | Datos del cliente en sesión (para precargar formularios). |
| GET / PUT `/api/clientes/:id` | C | `getCliente` / `actualizarPerfilCliente` | Ver y editar su perfil (nombre, teléfono, correo). |

### Proyectos y lotes
| Método y ruta | Rol | Función | Para qué |
|---|---|---|---|
| GET `/api/proyectos` | P | `getProyectos` | Lista con resumen (totalLotes, lotesDisponibles, áreaDesde/Hasta, precioDesde). |
| GET `/api/proyectos/:id` | P | `getProyecto` | Detalle de un proyecto. |
| GET `/api/proyectos/:id/lotes` | P | `getLotesDeProyecto` | Lotes con estado comercial actual. |
| GET `/api/lotes` · `/api/lotes/:id` | P | `getTodosLosLotes` · `getLote` | Todos los lotes / uno (simulador). |

### Asesores, disponibilidad y visitas (Agenda de visitas)
| Método y ruta | Rol | Función | Para qué |
|---|---|---|---|
| GET `/api/asesores` · `/api/asesores/:id` | P / A | `getAsesores` · `getAsesor` | Lista para formularios / perfil. |
| GET `/api/asesores/:id/disponibilidad` | A | `getDisponibilidadDeAsesor` | Horario semanal + excepciones. |
| PUT `/api/asesores/me/disponibilidad/semanal/:dia` | A | `guardarHorarioSemanal` | Horas de un día de la semana. |
| PUT `/api/asesores/me/disponibilidad/fechas/:fecha` | A | `guardarHorarioDeFecha` | Horario especial, día no disponible o quitar excepción (`null`). |
| GET `/api/asesores/:id/fechas-disponibles` | P | `getFechasDisponibles` | Días con horarios libres (hasta 60 días). |
| GET `/api/visitas/horarios?asesorId=&fecha=` | P | `getHorariosVisita` | `[{ hora, disponible }]` del día. |
| POST `/api/visitas` | P/C | `crearVisita` | Agenda (la API debe **revalidar** que el horario sigue libre → 409). |
| PATCH `/api/visitas/:id` | A / C | `actualizarVisita` | Confirmar, realizar, cancelar (cliente solo cancela las suyas). |
| GET `/api/clientes/:id/visitas` · `/api/asesores/:id/visitas` | C / A | `getVisitasDeCliente` · `getAgendaDeAsesor` | Visitas de cada uno. |

### Solicitudes, seguimiento, separaciones
| Método y ruta | Rol | Función | Para qué |
|---|---|---|---|
| POST `/api/solicitudes` | P/C | `crearSolicitud` | Información o cotización, asignada a UN asesor. |
| PATCH `/api/solicitudes/:id` | A | `actualizarSolicitud` | Cambiar estado. |
| GET `/api/clientes/:id/solicitudes` · `/api/asesores/:id/solicitudes` | C / A | `getSolicitudesDeCliente` · `getSolicitudesDeAsesor` | Listas. |
| GET `/api/asesores/:id/clientes` | A | `getCarteraDeAsesor` | Cartera con seguimiento (etapa, lotes, notas). |
| PATCH `/api/seguimiento/:id` | A | `actualizarSeguimiento` | Cambiar etapa o agregar nota/contacto. |
| POST `/api/separaciones` | Ad | `registrarSeparacion` | Lote de interés → SEPARADO. |
| PATCH `/api/admin/clientes/:id/asesor` | Ad | `reasignarCliente` | Reasignación manual. |

### Cliente y paneles
| Método y ruta | Rol | Función |
|---|---|---|
| GET `/api/clientes/:id/resumen` | C | `getResumenCliente` |
| GET `/api/clientes/:id/lotes` | C | `getLotesDeCliente` (con `relacion`: INTERES / SEPARADO) |
| GET `/api/clientes/:id/historial` | C | `getHistorialDeCliente` |
| GET `/api/clientes/:id/documentos` | C | `getDocumentosDeCliente` (falta la descarga de archivos) |
| GET `/api/notificaciones` · PATCH `/api/notificaciones/leidas` | C / A | `getNotificaciones` · `marcarNotificacionesLeidas` |
| GET `/api/asesores/:id/resumen` | A | `getResumenAsesor` |
| GET `/api/admin/resumen` · `/clientes` · `/asesores` · `/solicitudes` · `/visitas` · `/separaciones` | Ad | `getResumenAdmin`, `getClientesAdmin`, … |

### Contenido
| Método y ruta | Rol | Función |
|---|---|---|
| GET `/api/preguntas-frecuentes` | P | `getPreguntasFrecuentes` (solo activas, por `orden`) |
| GET / POST `/api/admin/preguntas-frecuentes`, PATCH / DELETE `…/:id` | Ad | CRUD de FAQ |
| GET `/api/testimonios` · `/api/testimonios/resumen` | P | Publicados · "Clientes satisfechos" |
| GET `/api/clientes/me/testimonios` · POST `/api/testimonios` | C | Mis testimonios · enviar |
| GET `/api/admin/testimonios`, PATCH / DELETE `…/:id` | Ad | Revisar, publicar/ocultar, eliminar |
| GET `/api/noticias` | P | `getNoticias` (se muestran en /comunicados) |
| GET `/api/galeria?proyectoId=` | P | `getGaleria` |
| GET `/api/historias-compradores` · `/api/reconocimientos` · `/api/contenido-inversionistas` | P | Contenido publicado |
| GET `/api/redes-sociales` | P | `getRedesSociales` |

### Reportes (solo administración)
| Método y ruta | Función |
|---|---|
| GET `/api/admin/indicadores` | `getIndicadoresComerciales` |
| GET `/api/admin/conversion` | `getIndiceConversion` |
| GET `/api/admin/ranking-asesores` | `getRankingAsesores` |
| GET `/api/admin/estadisticas` | `getEstadisticasGenerales` |
| GET `/api/admin/actividad?tipo=&limite=` | `getActividadReciente` |
| SSE / WebSocket (a definir) | `suscribirActividad` — hoy escucha cambios del propio navegador |

### Propuestos, todavía sin pantalla conectada
| Método y ruta | Uso previsto |
|---|---|
| GET `/api/empresa` | Nombre, logo, descripción, misión, visión, valores, historia, contacto, ubicación, horarios. Hoy están escritos en `Footer.jsx`, `Nosotros.jsx` y `Hero.jsx`. |
| GET `/api/equipo` | Hoy `data/equipo.js` (Nosotros). |
| GET `/api/promociones`, `/api/banners`, `/api/campanas` | Hoy Promociones muestra los proyectos en venta (no hay promociones reales). |
| GET `/api/proyectos/:id/geometria` | Polígonos/coordenadas de lotes (hoy solo Chalay II, en `components/PlanoInteractivo/planos/`). |
| `/api/ventas`, `/api/pagos`, `/api/comisiones` | Futuro: ventas completan el índice de conversión y el ranking. |

## 4. Entidades y valores que el frontend ya espera

| Entidad | Campos | Estados |
|---|---|---|
| usuarios / roles | id, codigo, nombre, tipo (`cliente`/`asesor`/`admin`), cargo, hash de contraseña | — |
| clientes | id, codigo (`CLI001`), nombre, dni, telefono, email, asesorId, activado, fechaAlta, fechaActivacion | cuenta: PENDIENTE / ACTIVADA |
| asesores | id, codigo, nombre, cargo, telefono, foto, disponible | — |
| disponibilidad | asesorId, semanal `{ día 0-6: ['HH:mm'] }`, excepciones `{ 'YYYY-MM-DD': [...] }` | Horario de atención 10:00–19:00, visitas de 60 min |
| proyectos | id, slug, nombre, ubicacion, descripcion, latitud, longitud, imagen, imagenPlano, planoFecha, avanceObras, avanceVentas | — |
| lotes | id, proyectoId, codigo, manzana, numero, area_m2, precio_total, precio_m2, estado, frente/fondo/lados, poligono (GeoJSON), centroide | DISPONIBLE / RESERVADO / SEPARADO / VENDIDO |
| solicitudes | id, tipo, clienteId\|null, asesorId, proyectoId, loteCodigo, fecha, estado, mensaje, motivo, contacto | tipo: INFORMACION / COTIZACION / VISITA / SEPARACION · estado: PENDIENTE / EN_ATENCION / ATENDIDA / CANCELADA |
| visitas | id, clienteId\|null, asesorId, proyectoId, loteCodigo, fecha, hora, tipo, estado, observaciones, contacto | PENDIENTE / CONFIRMADA / REALIZADA / CANCELADA |
| seguimiento | id, clienteId, asesorId, etapa, lotesInteres[], ultimaInteraccion, notas[{ fecha, tipo, texto }] | NUEVO / CONTACTADO / EN_SEGUIMIENTO / COTIZACION / VISITA / SEPARACION / VENTA |
| separaciones | id, clienteId, loteCodigo, proyectoId, asesorId, fecha, estado, registradoPor | VIGENTE |
| ventas | (a definir) — necesaria para la etapa "Venta" | — |
| historial | id, clienteId, fecha, titulo, detalle | — |
| notificaciones | id, destinatarioTipo, destinatarioId, fecha, titulo, mensaje, leida | — |
| documentos | id, clienteId, tipo, loteCodigo, fecha, estado, (url del archivo) | DISPONIBLE / PENDIENTE |
| testimonios | id, clienteId, proyectoId\|null, nombreVisible, puntuacion 1-5, comentario, estado, fechaCreacion, fechaRevision, revisadoPor | PENDIENTE / PUBLICADO / OCULTO |
| preguntas_frecuentes | id, pregunta, respuesta, categoria, orden, activa, fechaCreacion, fechaActualizacion | activa: true/false |
| noticias | id, titulo, contenido, imagen, fecha, categoria, estado, orden, enlace | BORRADOR / PUBLICADO / OCULTO · categoría: Novedad / Evento / Avance de obra / Consejos / Importante |
| galeria | id, titulo, descripcion, tipo, url, miniatura, proyectoId, orden, estado | tipo: IMAGEN / VIDEO |
| historias_compradores | id, clienteId, titulo, historia, imagen, proyectoId, fecha, estado | BORRADOR / PUBLICADO / OCULTO |
| reconocimientos | id, titulo, descripcion, institucion, anio, imagen, estado | BORRADOR / PUBLICADO / OCULTO |
| contenido_inversionistas | id, titulo, contenido, imagen, orden, estado | BORRADOR / PUBLICADO / OCULTO |
| redes_sociales | plataforma, url, icono, estado | ACTIVA / POR_CONFIRMAR |

Los catálogos están en `src/data/procesoComercial.js`, `src/data/estados.js` y `src/data/contenido.js`.

## 5. Puntos a definir con el equipo de la API

1. **Autenticación** (el frontend ya llama a `POST /api/auth/login`; falta confirmar):
   - **Transporte del token**: hoy se guarda en `localStorage` y viaja como `Authorization: Bearer` (lo que ya preveía `http/cliente.js`). El contrato no define si será Bearer o cookie `HttpOnly` (más segura ante XSS); **decisión pendiente**, no se implementó ningún otro mecanismo.
   - **Expiración y refresco**: no definidos. Hoy un HTTP 401 con token enviado (fuera de `/auth/*`) borra la sesión local y lleva a `/login`; 403, 404, 5xx y errores de red no la borran.
   - **Cierre de sesión**: `POST /api/auth/logout` **pendiente de confirmar**; hoy cerrar sesión solo borra la sesión local.
   - **Validación de sesión**: `GET /api/auth/me` **pendiente de confirmar**; hoy no se usa.
   - **Cuenta pendiente**: el frontend reconoce `403` con `{ "codigo": "CUENTA_PENDIENTE" }` para mostrar "Activar mi cuenta" (**propuesta**, sin confirmar). Decidir si se revela ese estado, porque permite saber que un código existe.
   - ¿El login acepta usuario **o** código como hoy? ¿Se envía/valida `tipo`?
   - El servidor debe validar identidad, tipo de usuario y permisos en **cada** endpoint; las rutas protegidas del frontend no son seguridad.
2. **Activación**: ¿quién genera el código (API o admin)? ¿Caduca? ¿Se permite reenviarlo?
3. **Ids de asesor**: numéricos o texto. Hoy el frontend usa texto.
4. **Horarios**: la API debe impedir dos visitas del mismo asesor a menos de 60 min (hoy lo valida el frontend) y responder 409 si el horario se ocupó.
5. **Estados de lote**: ¿la separación cambia `lotes.estado` en la BD o se calcula con una vista? El frontend espera recibir el estado ya resuelto.
6. **Ventas**: qué tabla/estado marca una venta. Sin eso, "Venta" queda "No disponible" en conversión y ranking.
7. **Reportes**: ¿los calcula la API (recomendado) o el frontend con listas completas?
8. **Tiempo real**: la estrategia http ya se suscribe por SSE a `/api/admin/actividad/stream` (propuesto); confirmar si será SSE o WebSocket y cómo se autentica.
9. **Archivos**: dónde se guardan imágenes, videos y documentos (URLs públicas o firmadas).
10. **Empresa, equipo y promociones**: textos que hoy están escritos en el código (Footer, Nosotros, Hero, Promociones).
11. **Geometría de lotes**: formato (GeoJSON 4326) y cómo se relaciona con el plano de cada proyecto.
12. **Paginación y filtros** para listas grandes (solicitudes, visitas, actividad).
