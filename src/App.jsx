import { useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Footer from './components/Footer/Footer'
import ProyectosPage from './pages/proyectos/Proyectospage'
import Comunicados from './pages/comunicados/comunicados'
import Nosotros from './pages/nosotros/Nosotros'
import Promociones from './pages/promociones/Promociones'

function App() {
  const ruta = window.location.pathname

  const esProyectos = ruta === '/proyectospage'
  const esComunicados = ruta === '/comunicados'
  const esNosotros = ruta === '/nosotros'
  const esPromociones = ruta === '/promociones'
  const esOtraPagina = esProyectos || esComunicados || esNosotros || esPromociones

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

  return (
    <div
      className={`page ${esProyectos ? 'pagina-proyectos' : ''}`}
    >
      <Navbar />

      <main>
        {esProyectos && <ProyectosPage />}
        {esComunicados && <Comunicados />}
        {esNosotros && <Nosotros />}
        {esPromociones && <Promociones />}
        {!esOtraPagina && <Hero />}
      </main>

      <Footer />
    </div>
  )
}

export default App
