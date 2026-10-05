// Estado COMERCIAL de los lotes: el del plano, salvo que exista una separación vigente registrada
// en el sistema. Lo usan la API pública, el área interna y los reportes de administración.
// Con el backend real será una vista/consulta SQL (lotes LEFT JOIN separaciones vigentes).
import { CLAVES } from '../../utils/almacenamiento'
import { leerColeccion } from './almacen'

/** Separaciones vigentes del almacén mock, por código de lote. */
export function separacionesVigentesPorLote() {
  return new Map(
    leerColeccion(CLAVES.separaciones)
      .filter((separacion) => separacion.estado === 'VIGENTE')
      .map((separacion) => [separacion.loteCodigo, separacion]),
  )
}

/**
 * Disponibilidad comercial de un lote: la del plano, salvo que el sistema tenga registrada una
 * separación vigente; entonces figura SEPARADO para todos (sitio público, cliente, asesor y admin)
 * y ya no se puede cotizar ni volver a separar. `estadoFuente` dice de dónde sale el estado.
 */
export function conEstadoComercial(lote, vigentes = separacionesVigentesPorLote()) {
  const separacion = lote ? vigentes.get(lote.codigo) : null
  return separacion ? { ...lote, estado: 'SEPARADO', estadoFuente: 'separacion', estadoFecha: separacion.fecha } : lote
}

export function lotesConEstado(lista) {
  const vigentes = separacionesVigentesPorLote()
  return lista.map((lote) => conEstadoComercial(lote, vigentes))
}
