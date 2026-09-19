/**
 * Ruta normalizada para comparar: sin barra final ("/nosotros/" -> "/nosotros") y con
 * "/index.html" tratado como la raíz. Solo mira el path: el query string (?id=1) y el
 * hash (#contacto) no forman parte de `pathname`.
 */
export function normalizarRuta(pathname) {
  const sinBarraFinal = pathname.replace(/\/+$/, '')

  if (sinBarraFinal === '' || sinBarraFinal === '/index.html') return '/'

  return sinBarraFinal
}
