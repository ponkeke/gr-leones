// DOCUMENTOS DEL CLIENTE (datos de DEMOSTRACIÓN). Todavía no hay archivos reales ni subida de
// documentos: la interfaz solo lista estos registros. `estado` usa ESTADOS_DOCUMENTO.
export const documentosMock = [
  { id: 1, clienteId: 1, tipo: 'Cotización', loteCodigo: 'CHALAY-II-MZA-03', fecha: '2026-09-14', estado: 'DISPONIBLE' },
  { id: 2, clienteId: 1, tipo: 'Ficha del lote', loteCodigo: 'CHALAY-II-MZA-03', fecha: '2026-09-14', estado: 'DISPONIBLE' },
  { id: 3, clienteId: 1, tipo: 'Documento de separación', loteCodigo: 'CHALAY-II-MZA-03', fecha: null, estado: 'PENDIENTE' },
  { id: 4, clienteId: 1, tipo: 'Comprobante', loteCodigo: 'CHALAY-II-MZA-03', fecha: null, estado: 'PENDIENTE' },
  { id: 5, clienteId: 2, tipo: 'Ficha del lote', loteCodigo: 'CHALAY-II-MZB-04', fecha: '2026-09-18', estado: 'DISPONIBLE' },
  { id: 6, clienteId: 2, tipo: 'Documento de separación', loteCodigo: 'CHALAY-II-MZB-04', fecha: null, estado: 'PENDIENTE' },
  { id: 7, clienteId: 4, tipo: 'Cotización', loteCodigo: 'SAN-AGUSTIN-I-MZB-03', fecha: null, estado: 'PENDIENTE' },
]
