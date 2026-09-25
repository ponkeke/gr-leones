import { createContext, useContext } from 'react'

// Lo provee `pages/areaInterna/AreaInterna.jsx`:
//   usuario ........... sesión mock actual ({ id, codigo, nombre, tipo, cargo })
//   ruta .............. ruta interna activa (p. ej. '/cliente/lotes')
//   navegar(destino) .. cambia de página sin recargar
//   refrescarSesion() . vuelve a leer la sesión (tras editar el perfil)
//   salir() ........... cierra la sesión y vuelve a /login
export const AreaInternaContext = createContext(null)

export function useAreaInterna() {
  const contexto = useContext(AreaInternaContext)
  if (!contexto) throw new Error('useAreaInterna debe usarse dentro de <AreaInterna>.')
  return contexto
}
