import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  Building2,
  CalendarClock,
  CalendarCog,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Handshake,
  History,
  LayoutDashboard,
  MapPinned,
  TrendingUp,
  UserCog,
  UserRound,
  Users,
  MessageSquareQuote,
  CircleHelp,
  Gauge,
  Funnel,
  ListOrdered,
  ChartColumn,
  Activity,
} from 'lucide-react'
import PanelLayout from '../../components/areaInterna/PanelLayout'
import { AreaInternaContext } from '../../components/areaInterna/contexto'
import { AvisoDemo } from '../../components/areaInterna/Partes'
import { normalizarRuta } from '../../utils/rutas'
import { TIPOS_USUARIO, EVENTO_SESION_EXPIRADA, borrarSesion, obtenerUsuarioSesion, rutaDeInicio } from '../../services/sesion'
import { cerrarSesion, getNotificaciones } from '../../services/api'

import DashboardCliente from '../cliente/DashboardCliente'
import PerfilCliente from '../cliente/PerfilCliente'
import MisLotes from '../cliente/MisLotes'
import MisSolicitudes from '../cliente/MisSolicitudes'
import MisVisitas from '../cliente/MisVisitas'
import HistorialComprador from '../cliente/HistorialComprador'
import Documentos from '../cliente/Documentos'
import Notificaciones from '../cliente/Notificaciones'
import MiTestimonio from '../cliente/MiTestimonio'

import DashboardAsesor from '../asesor/DashboardAsesor'
import Clientes from '../asesor/Clientes'
import Solicitudes from '../asesor/Solicitudes'
import Agenda from '../asesor/Agenda'
import Disponibilidad from '../asesor/Disponibilidad'
import Seguimiento from '../asesor/Seguimiento'
import MisProyectos from '../asesor/MisProyectos'
import PerfilAsesor from '../asesor/PerfilAsesor'

import DashboardAdmin from '../admin/DashboardAdmin'
import ClientesAdmin from '../admin/ClientesAdmin'
import AsesoresAdmin from '../admin/AsesoresAdmin'
import SolicitudesAdmin from '../admin/SolicitudesAdmin'
import VisitasAdmin from '../admin/VisitasAdmin'
import SeparacionesAdmin from '../admin/SeparacionesAdmin'
import TestimoniosAdmin from '../admin/TestimoniosAdmin'
import PreguntasFrecuentesAdmin from '../admin/PreguntasFrecuentesAdmin'
import IndicadoresAdmin from '../admin/IndicadoresAdmin'
import ConversionAdmin from '../admin/ConversionAdmin'
import RankingAdmin from '../admin/RankingAdmin'
import EstadisticasAdmin from '../admin/EstadisticasAdmin'
import ActividadAdmin from '../admin/ActividadAdmin'

// Menú (y rutas válidas) de cada tipo de usuario. Cada entrada es una página del área.
const MENUS = {
  cliente: [
    { a: '/cliente/dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard, Pagina: DashboardCliente },
    { a: '/cliente/perfil', etiqueta: 'Mi perfil', icono: UserRound, Pagina: PerfilCliente },
    { a: '/cliente/lotes', etiqueta: 'Mis lotes', icono: MapPinned, Pagina: MisLotes },
    { a: '/cliente/solicitudes', etiqueta: 'Mis solicitudes', icono: ClipboardList, Pagina: MisSolicitudes },
    { a: '/cliente/visitas', etiqueta: 'Agenda de visitas', icono: CalendarDays, Pagina: MisVisitas },
    { a: '/cliente/historial', etiqueta: 'Historial', icono: History, Pagina: HistorialComprador },
    { a: '/cliente/documentos', etiqueta: 'Documentos', icono: FolderOpen, Pagina: Documentos },
    { a: '/cliente/notificaciones', etiqueta: 'Notificaciones', icono: Bell, Pagina: Notificaciones, notificaciones: true },
    { a: '/cliente/testimonio', etiqueta: 'Mi testimonio', icono: MessageSquareQuote, Pagina: MiTestimonio },
  ],
  asesor: [
    { a: '/asesor/dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard, Pagina: DashboardAsesor },
    { a: '/asesor/clientes', etiqueta: 'Clientes', icono: Users, Pagina: Clientes },
    { a: '/asesor/solicitudes', etiqueta: 'Solicitudes', icono: ClipboardList, Pagina: Solicitudes },
    { a: '/asesor/agenda', etiqueta: 'Agenda', icono: CalendarClock, Pagina: Agenda },
    { a: '/asesor/disponibilidad', etiqueta: 'Mi disponibilidad', icono: CalendarCog, Pagina: Disponibilidad },
    { a: '/asesor/seguimiento', etiqueta: 'Seguimiento comercial', icono: TrendingUp, Pagina: Seguimiento },
    { a: '/asesor/proyectos', etiqueta: 'Mis lotes / proyectos', icono: Building2, Pagina: MisProyectos },
    // Misma página que la del cliente: muestra las notificaciones del usuario en sesión.
    { a: '/asesor/notificaciones', etiqueta: 'Notificaciones', icono: Bell, Pagina: Notificaciones, notificaciones: true },
    { a: '/asesor/perfil', etiqueta: 'Mi perfil', icono: UserRound, Pagina: PerfilAsesor },
  ],
  // Administrador mínimo: supervisión, reasignación de clientes y separación de lotes.
  admin: [
    { a: '/admin/dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard, Pagina: DashboardAdmin },
    { a: '/admin/clientes', etiqueta: 'Clientes', icono: Users, Pagina: ClientesAdmin },
    { a: '/admin/asesores', etiqueta: 'Asesores', icono: UserCog, Pagina: AsesoresAdmin },
    { a: '/admin/solicitudes', etiqueta: 'Solicitudes', icono: ClipboardList, Pagina: SolicitudesAdmin },
    { a: '/admin/visitas', etiqueta: 'Visitas', icono: CalendarClock, Pagina: VisitasAdmin },
    { a: '/admin/separaciones', etiqueta: 'Separaciones', icono: Handshake, Pagina: SeparacionesAdmin },
    // Contenido del sitio que administra solo ADMIN.
    { a: '/admin/testimonios', etiqueta: 'Testimonios', icono: MessageSquareQuote, Pagina: TestimoniosAdmin },
    { a: '/admin/preguntas-frecuentes', etiqueta: 'Preguntas frecuentes', icono: CircleHelp, Pagina: PreguntasFrecuentesAdmin },
    // Reportes calculados con los datos existentes (services/reportes.js).
    { a: '/admin/indicadores', etiqueta: 'Indicadores', icono: Gauge, Pagina: IndicadoresAdmin },
    { a: '/admin/conversion', etiqueta: 'Índice de conversión', icono: Funnel, Pagina: ConversionAdmin },
    { a: '/admin/ranking', etiqueta: 'Ranking de asesores', icono: ListOrdered, Pagina: RankingAdmin },
    { a: '/admin/estadisticas', etiqueta: 'Estadísticas', icono: ChartColumn, Pagina: EstadisticasAdmin },
    { a: '/admin/actividad', etiqueta: 'Actividad reciente', icono: Activity, Pagina: ActividadAdmin },
  ],
}

/**
 * Protección de navegación MOCK (no es seguridad real: la sesión vive en localStorage).
 * Devuelve a dónde redirigir, o null si el usuario puede ver `ruta`:
 *   - sin sesión ......................... /login
 *   - cliente en ruta de asesor (o al revés) → su propio dashboard
 *   - '/cliente', '/asesor' o subruta que no existe → su propio dashboard
 */
function redireccionPara(ruta, usuario) {
  if (!usuario) return '/login'
  const area = ruta.split('/')[1]
  if (area !== usuario.tipo) return rutaDeInicio(usuario)
  return MENUS[area].some((item) => item.a === ruta) ? null : rutaDeInicio(usuario)
}

function AreaInterna() {
  const [ruta, setRuta] = useState(() => normalizarRuta(window.location.pathname))
  const [usuario, setUsuario] = useState(obtenerUsuarioSesion)

  const redireccion = redireccionPara(ruta, usuario)
  const rutaActiva = redireccion && redireccion !== '/login' ? redireccion : ruta

  // Refleja la redirección en la barra de direcciones (sin dejar la ruta prohibida en el historial).
  useEffect(() => {
    if (!redireccion) return
    if (redireccion === '/login') window.location.replace('/login')
    else window.history.replaceState(null, '', redireccion)
  }, [redireccion])

  // Botones atrás/adelante del navegador dentro del área.
  useEffect(() => {
    const alCambiarHistorial = () => {
      setUsuario(obtenerUsuarioSesion())
      setRuta(normalizarRuta(window.location.pathname))
    }
    window.addEventListener('popstate', alCambiarHistorial)
    return () => window.removeEventListener('popstate', alCambiarHistorial)
  }, [])

  const navegar = useCallback((destino) => {
    const url = new URL(destino, window.location.origin)
    window.history.pushState(null, '', `${url.pathname}${url.search}`)
    // Se relee la sesión: si se cerró en otra pestaña, la protección redirige a /login.
    setUsuario(obtenerUsuarioSesion())
    setRuta(normalizarRuta(url.pathname))
    window.scrollTo(0, 0)
  }, [])

  const refrescarSesion = useCallback(() => setUsuario(obtenerUsuarioSesion()), [])

  // Contador de notificaciones sin leer (badge del menú y de la barra superior). Se vuelve a
  // contar con `getNotificaciones()` al entrar, al cambiar de página, cuando una página lo pide
  // (p. ej. tras "Marcar todas como leídas") y si otra pestaña modifica el almacén mock.
  const [noLeidas, setNoLeidas] = useState(0)
  const [versionNotificaciones, setVersionNotificaciones] = useState(0)
  const ultimaConsulta = useRef(0)
  const refrescarNotificaciones = useCallback(() => setVersionNotificaciones((v) => v + 1), [])

  useEffect(() => {
    if (!usuario) return
    const consulta = ++ultimaConsulta.current
    getNotificaciones(usuario.tipo, usuario.id)
      .then((lista) => {
        if (consulta === ultimaConsulta.current) setNoLeidas(lista.filter((n) => !n.leida).length)
      })
      .catch(() => {})
  }, [usuario, rutaActiva, versionNotificaciones])

  useEffect(() => {
    const alCambiarAlmacen = (evento) => {
      if (evento.key === null || evento.key.startsWith('leones_')) refrescarNotificaciones()
    }
    window.addEventListener('storage', alCambiarAlmacen)
    return () => window.removeEventListener('storage', alCambiarAlmacen)
  }, [refrescarNotificaciones])

  // La API rechazó el token (401): la sesión ya se borró; la protección de rutas lleva a /login.
  useEffect(() => {
    const alExpirar = () => setUsuario(obtenerUsuarioSesion())
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
  }, [])

  const salir = useCallback(async () => {
    // Cierra la sesión según la estrategia; aunque falle, la sesión local siempre se borra.
    try {
      await cerrarSesion()
    } finally {
      borrarSesion()
      window.location.href = '/login'
    }
  }, [])

  const contexto = useMemo(
    () => ({ usuario, ruta: rutaActiva, navegar, refrescarSesion, salir, noLeidas, refrescarNotificaciones }),
    [usuario, rutaActiva, navegar, refrescarSesion, salir, noLeidas, refrescarNotificaciones],
  )

  if (redireccion === '/login') return null

  const menu = MENUS[usuario.tipo]
  const { Pagina } = menu.find((item) => item.a === rutaActiva)

  return (
    <AreaInternaContext.Provider value={contexto}>
      {/* Sin el wrapper `.page` del sitio público: su overflow-x: hidden anularía el sticky del sidebar. */}
      <PanelLayout
        menu={menu}
        etiquetaArea={`Área ${TIPOS_USUARIO[usuario.tipo].etiqueta.toLowerCase()}`}
        subtituloUsuario={usuario.cargo ?? TIPOS_USUARIO[usuario.tipo].etiqueta}
      >
        <AvisoDemo>
          Entorno de demostración: la información de esta área es simulada y no corresponde a registros reales de la empresa.
        </AvisoDemo>
        {/* key: cada página se monta de cero al navegar (también al cambiar ?cliente= en Seguimiento). */}
        <Pagina key={`${rutaActiva}${window.location.search}`} />
      </PanelLayout>
    </AreaInternaContext.Provider>
  )
}

export default AreaInterna
