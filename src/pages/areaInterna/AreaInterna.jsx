import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  History,
  LayoutDashboard,
  MapPinned,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import PanelLayout from '../../components/areaInterna/PanelLayout'
import { AreaInternaContext } from '../../components/areaInterna/contexto'
import { AvisoDemo } from '../../components/areaInterna/Partes'
import { normalizarRuta } from '../../utils/rutas'
import { TIPOS_USUARIO, cerrarSesion, obtenerUsuarioSesion, rutaDeInicio } from '../../utils/authMock'

import DashboardCliente from '../cliente/DashboardCliente'
import PerfilCliente from '../cliente/PerfilCliente'
import MisLotes from '../cliente/MisLotes'
import MisSolicitudes from '../cliente/MisSolicitudes'
import MisVisitas from '../cliente/MisVisitas'
import HistorialComprador from '../cliente/HistorialComprador'
import Documentos from '../cliente/Documentos'
import Notificaciones from '../cliente/Notificaciones'

import DashboardAsesor from '../asesor/DashboardAsesor'
import Clientes from '../asesor/Clientes'
import Solicitudes from '../asesor/Solicitudes'
import Agenda from '../asesor/Agenda'
import Seguimiento from '../asesor/Seguimiento'
import MisProyectos from '../asesor/MisProyectos'
import PerfilAsesor from '../asesor/PerfilAsesor'

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
    { a: '/cliente/notificaciones', etiqueta: 'Notificaciones', icono: Bell, Pagina: Notificaciones },
  ],
  asesor: [
    { a: '/asesor/dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard, Pagina: DashboardAsesor },
    { a: '/asesor/clientes', etiqueta: 'Clientes', icono: Users, Pagina: Clientes },
    { a: '/asesor/solicitudes', etiqueta: 'Solicitudes', icono: ClipboardList, Pagina: Solicitudes },
    { a: '/asesor/agenda', etiqueta: 'Agenda', icono: CalendarClock, Pagina: Agenda },
    { a: '/asesor/seguimiento', etiqueta: 'Seguimiento comercial', icono: TrendingUp, Pagina: Seguimiento },
    { a: '/asesor/proyectos', etiqueta: 'Mis lotes / proyectos', icono: Building2, Pagina: MisProyectos },
    { a: '/asesor/perfil', etiqueta: 'Mi perfil', icono: UserRound, Pagina: PerfilAsesor },
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

  const salir = useCallback(() => {
    cerrarSesion()
    window.location.href = '/login'
  }, [])

  const contexto = useMemo(
    () => ({ usuario, ruta: rutaActiva, navegar, refrescarSesion, salir }),
    [usuario, rutaActiva, navegar, refrescarSesion, salir],
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
        subtituloUsuario={usuario.tipo === 'asesor' ? usuario.cargo ?? 'Asesor comercial' : TIPOS_USUARIO.cliente.etiqueta}
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
