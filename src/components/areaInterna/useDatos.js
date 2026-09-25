import { useEffect, useEffectEvent, useState } from 'react'

/**
 * Carga datos con una función async de `services/api.js`. Vuelve a cargar cuando cambia `clave`
 * (p. ej. `cliente-1`). Devuelve `{ datos, estado, error }` con estado 'cargando' | 'listo' | 'error'.
 */
export function useDatos(clave, cargar) {
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null })
  const ejecutarCarga = useEffectEvent(() => cargar())

  useEffect(() => {
    let cancelado = false

    ejecutarCarga()
      .then((datos) => {
        if (!cancelado) setResultado({ clave, datos, error: null })
      })
      .catch((error) => {
        if (!cancelado) setResultado({ clave, datos: null, error: error.message || 'No se pudo cargar la información.' })
      })

    return () => {
      cancelado = true
    }
  }, [clave])

  if (resultado.clave !== clave) return { datos: null, estado: 'cargando', error: null }
  return { datos: resultado.datos, estado: resultado.error ? 'error' : 'listo', error: resultado.error }
}
