import { useEffect, useEffectEvent, useState } from 'react'

/**
 * Carga pública con una función de `services/api.js` (una vez, al entrar a la página):
 * { datos, estado } con estado 'cargando' | 'listo' | 'error'. El área interna usa `useDatos`.
 */
export function useCarga(cargar) {
  const [resultado, setResultado] = useState({ estado: 'cargando', datos: null })
  const ejecutar = useEffectEvent(() => cargar())

  useEffect(() => {
    let cancelado = false
    ejecutar()
      .then((datos) => {
        if (!cancelado) setResultado({ estado: 'listo', datos })
      })
      .catch(() => {
        if (!cancelado) setResultado({ estado: 'error', datos: null })
      })
    return () => {
      cancelado = true
    }
  }, [])

  return resultado
}
