import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react'
import animacion from '../../assets/Lottie/JamesLeon.lottie?url'
import motorWasm from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url'
import './Preloader.css'

// El motor WASM del reproductor sale del propio sitio (Vite lo copia a `assets/`), no del CDN. Con una
// URL explícita la librería también desactiva su respaldo a jsdelivr/unpkg: si falla, se muestra el
// indicador de respaldo. Debe llamarse antes de crear cualquier reproductor.
setWasmUrl(motorWasm)

// Pantalla de carga inicial: se muestra UNA vez por sesión del navegador (los enlaces del sitio
// recargan la página, así que sin esta marca volvería a salir en cada navegación) y se oculta en
// cuanto el navegador termina de cargar la página, sin esperas artificiales.
const CLAVE_VISTO = 'leones_preloader_visto'
const SALIDA_MS = 450
// Red de seguridad: si el evento `load` no llega (un recurso colgado), la página no queda tapada.
const TIEMPO_MAXIMO_MS = 10000

const yaMostrado = () => {
  try {
    return window.sessionStorage.getItem(CLAVE_VISTO) === '1'
  } catch {
    return false
  }
}

const marcarComoMostrado = () => {
  try {
    window.sessionStorage.setItem(CLAVE_VISTO, '1')
  } catch {
    // Sin almacenamiento: puede volver a mostrarse en la siguiente página, sin otro efecto.
  }
}

const prefiereMenosMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

function Preloader() {
  // 'visible' → 'saliendo' (fundido) → 'oculto' (ya no se renderiza). Solo avanza, nunca vuelve.
  const [fase, setFase] = useState(() => (yaMostrado() || document.readyState === 'complete' ? 'oculto' : 'visible'))
  const [reducirMovimiento] = useState(prefiereMenosMovimiento)
  const [animacionFallo, setAnimacionFallo] = useState(false)

  // Mientras el preloader está en pantalla la página no se desplaza ni muestra su barra de desplazamiento.
  // Si la página tenía barra, se reserva su ancho (`scrollbar-gutter`) para que nada se mueva al quitarla
  // ni al devolverla. Se libera al ocultarse el preloader (carga normal, tiempo límite o movimiento
  // reducido) y si el componente se desmonta.
  const enPantalla = fase !== 'oculto'
  useLayoutEffect(() => {
    if (!enPantalla) return undefined

    const raiz = document.documentElement
    const teniaBarra = window.innerWidth > raiz.clientWidth
    raiz.classList.add('preloader-activo')
    if (teniaBarra) raiz.classList.add('preloader-con-barra')
    return () => raiz.classList.remove('preloader-activo', 'preloader-con-barra')
  }, [enPantalla])

  // Termina la carga inicial → empieza el fundido.
  useEffect(() => {
    if (fase !== 'visible') return undefined

    const terminar = () => setFase('saliendo')
    if (document.readyState === 'complete') {
      const inmediato = setTimeout(terminar, 0)
      return () => clearTimeout(inmediato)
    }

    window.addEventListener('load', terminar, { once: true })
    const limite = setTimeout(terminar, TIEMPO_MAXIMO_MS)
    return () => {
      window.removeEventListener('load', terminar)
      clearTimeout(limite)
    }
  }, [fase])

  // Fundido → se quita del árbol (con movimiento reducido, sin fundido).
  useEffect(() => {
    if (fase !== 'saliendo') return undefined

    marcarComoMostrado()
    const quitar = setTimeout(() => setFase('oculto'), reducirMovimiento ? 0 : SALIDA_MS)
    return () => clearTimeout(quitar)
  }, [fase, reducirMovimiento])

  // Si el archivo .lottie o su reproductor no cargan, se muestra el indicador de respaldo.
  const vincularAnimacion = useCallback((dotLottie) => {
    if (!dotLottie) return
    dotLottie.addEventListener('loadError', () => setAnimacionFallo(true))
    dotLottie.addEventListener('renderError', () => setAnimacionFallo(true))
  }, [])

  if (fase === 'oculto') return null

  return (
    <div
      className={`preloader${fase === 'saliendo' ? ' preloader--saliendo' : ''}`}
      style={{ '--preloader-salida': `${SALIDA_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Cargando Grupo Inmobiliario Leones del Sur"
    >
      {animacionFallo ? (
        <span className="preloader-respaldo" aria-hidden="true" />
      ) : (
        <DotLottieReact
          className="preloader-animacion"
          src={animacion}
          autoplay={!reducirMovimiento}
          loop={!reducirMovimiento}
          dotLottieRefCallback={vincularAnimacion}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default Preloader
