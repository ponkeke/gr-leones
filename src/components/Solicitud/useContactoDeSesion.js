import { useEffect, useEffectEvent, useState } from 'react'
import { getClienteDeSesion } from '../../services/api'

const contactoDelCliente = (cliente) => ({
  nombre: cliente.nombre ?? '',
  celular: cliente.telefono ?? '',
  correo: cliente.email ?? '',
})

/**
 * Si hay sesión de cliente, completa en el formulario los datos que ya conocemos (siguen siendo
 * editables) para no pedírselos otra vez. `mapear(cliente)` agrega campos propios del formulario.
 * Devuelve los valores de partida, para que "hay cambios" se compare contra ellos y no contra vacío.
 * La solicitud queda a nombre del cliente por su sesión (`services/api.js`), no por estos campos.
 */
export function useContactoDeSesion(camposIniciales, setDatos, mapear = () => ({})) {
  const [base, setBase] = useState(camposIniciales)

  const aplicar = useEffectEvent((cliente) => {
    const precargados = { ...camposIniciales, ...contactoDelCliente(cliente), ...mapear(cliente) }
    setBase(precargados)
    // Solo si la persona todavía no empezó a escribir.
    setDatos((actual) =>
      Object.keys(camposIniciales).every((campo) => actual[campo] === camposIniciales[campo]) ? precargados : actual,
    )
  })

  useEffect(() => {
    let cancelado = false
    getClienteDeSesion()
      .then((cliente) => {
        if (!cancelado && cliente) aplicar(cliente)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [])

  return base
}
