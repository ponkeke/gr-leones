import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import leonAnimacion from '../assets/animacion/leon.lottie?url'

// León animado (mascota de la marca). Se reproduce solo y en bucle.
// width / height son opcionales: aceptan número (px) o cualquier valor CSS.
function LeonAnimado({ width = 220, height = 220 }) {
  return (
    <div style={{ width, height }} aria-hidden="true">
      <DotLottieReact
        src={leonAnimacion}
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default LeonAnimado
