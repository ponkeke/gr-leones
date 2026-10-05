import { useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Footer from './components/Footer/Footer'
import ProyectosPage from './pages/proyectos/Proyectospage'
import Lotes from './pages/lotes/Lotes'
import Comunicados from './pages/comunicados/comunicados'
import Nosotros from './pages/nosotros/Nosotros'
import Promociones from './pages/promociones/Promociones'
import Login from './pages/login/Login'
import SimuladorCostos from './pages/simuladorCostos/SimuladorCostos'
import NoEncontrada from './pages/noEncontrada/NoEncontrada'
import AreaInterna from './pages/areaInterna/AreaInterna'
import Testimonios from './pages/testimonios/Testimonios'
import Inversionistas from './pages/inversionistas/Inversionistas'
import PreguntasFrecuentes from './pages/preguntasFrecuentes/PreguntasFrecuentes'
import Reconocimientos from './pages/reconocimientos/Reconocimientos'
import Galeria from './pages/galeria/Galeria'
import { esRutaInterna, normalizarRuta } from './utils/rutas'

// Rutas conocidas: cada una con la clase que aísla los estilos de su página.
// "/inicio" es un alias de "/". Cualquier otra ruta muestra la vista 404.
const RUTAS = {
  '/': { clase: 'pagina-inicio', Pagina: Hero },
  '/inicio': { clase: 'pagina-inicio', Pagina: Hero },
  '/proyectospage': { clase: 'pagina-proyectos', Pagina: ProyectosPage },
  '/lotes': { clase: 'pagina-lotes', Pagina: Lotes },
  '/comunicados': { clase: 'pagina-comunicados', Pagina: Comunicados },
  '/nosotros': { clase: 'pagina-nosotros', Pagina: Nosotros },
  '/promociones': { clase: 'pagina-promociones', Pagina: Promociones },
  '/login': { clase: 'pagina-login', Pagina: Login },
  '/simulador-costos': { clase: 'pagina-simulador', Pagina: SimuladorCostos },
  // Contenido público (FAQ, testimonios/clientes satisfechos/historias/redes, inversionistas, logros).
  '/testimonios': { clase: 'pagina-testimonios', Pagina: Testimonios },
  '/inversionistas': { clase: 'pagina-inversionistas', Pagina: Inversionistas },
  '/preguntas-frecuentes': { clase: 'pagina-preguntas-frecuentes', Pagina: PreguntasFrecuentes },
  '/reconocimientos': { clase: 'pagina-reconocimientos', Pagina: Reconocimientos },
  '/galeria': { clase: 'pagina-galeria', Pagina: Galeria },
}

function App() {
  const ruta = normalizarRuta(window.location.pathname)
  const rutaConocida = Object.hasOwn(RUTAS, ruta)
  const Pagina = rutaConocida ? RUTAS[ruta].Pagina : NoEncontrada
  const claseDePagina = rutaConocida ? RUTAS[ruta].clase : 'pagina-no-encontrada'

  // Permite enlaces tipo "/inicio#contacto": al montar, si hay hash,
  // baja suavemente hasta ese elemento (el Footer, con id="contacto",
  // está presente en todas las páginas).
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const destino = document.getElementById(hash.replace('#', ''))
    if (destino) {
      destino.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // /cliente/*, /asesor/* y /admin/*: área interna con su propio layout (sidebar + topbar), sin Navbar ni Footer.
  if (esRutaInterna(ruta)) return <AreaInterna />

  return (
    <div className={`page ${claseDePagina}`}>
      <Navbar />

      <main>
        <Pagina />
      </main>
      
      <Footer />

     
    </div>
  )
}

export default App
