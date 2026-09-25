import { useEffect, useState } from 'react'
import { getAsesores } from '../../services/api'

/** Lista de asesores para los formularios. `estado`: 'cargando' | 'listo' | 'error'. */
export function useAsesores() {
  const [asesores, setAsesores] = useState([])
  const [estado, setEstado] = useState('cargando')

  useEffect(() => {
    let cancelado = false

    getAsesores()
      .then((datos) => {
        if (cancelado) return
        setAsesores(datos)
        setEstado('listo')
      })
      .catch(() => {
        if (!cancelado) setEstado('error')
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { asesores, estado }
}
