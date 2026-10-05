import { useEffect, useState } from 'react'
import { getRedesSociales } from '../../services/api'

/**
 * Redes sociales OFICIALES (`data/redesSociales.js`, vía `getRedesSociales()`). Solo las confirmadas
 * se muestran como enlace; mientras no haya ninguna, se indica "por confirmar". Nunca un enlace falso.
 *   variante 'pie' ..... una línea para el pie de página
 *   variante 'seccion' . lista para una sección de página (una fila por red)
 */
function RedesSociales({ variante = 'pie' }) {
  const [redes, setRedes] = useState([])

  useEffect(() => {
    let cancelado = false
    getRedesSociales().then((lista) => {
      if (!cancelado) setRedes(lista)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const confirmadas = redes.filter((red) => red.confirmada)
  const enlace = (red) => (
    <a href={red.url} target="_blank" rel="noopener noreferrer">
      {red.plataforma}
    </a>
  )

  if (variante === 'pie') {
    return (
      <>
        🌐 Redes sociales:{' '}
        {confirmadas.length === 0
          ? 'por confirmar'
          : confirmadas.map((red, indice) => (
              <span key={red.plataforma}>
                {indice > 0 && ' · '}
                {enlace(red)}
              </span>
            ))}
      </>
    )
  }

  return (
    <ul className="redes-lista">
      {redes.map((red) => (
        <li key={red.plataforma} className="contenido-dato">
          <span>{red.plataforma}</span>
          <strong>{red.confirmada ? enlace(red) : 'Por confirmar'}</strong>
        </li>
      ))}
    </ul>
  )
}

export default RedesSociales
