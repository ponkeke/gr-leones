// SEGUIMIENTO COMERCIAL (datos de DEMOSTRACIÓN). Un registro por cliente: en qué etapa está
// (`etapa`, ver ETAPAS_CLIENTE en `./procesoComercial.js`), qué lotes le interesan y las notas del
// asesor. Los lotes se referencian por su `codigo` real (`./lotes/`), así área, precio y estado
// salen siempre del plano y no se copian aquí. No describe procesos de compra reales.
// Son los datos INICIALES: los cambios del asesor se guardan en el almacén mock (`services/api.js`).
export const seguimientoMock = [
  {
    id: 1,
    clienteId: 1,
    asesorId: 'asesora-ventas-1',
    etapa: 'COTIZACION',
    lotesInteres: ['CHALAY-II-MZA-03', 'CHALAY-II-MZA-05'],
    ultimaInteraccion: '2026-09-22',
    notas: [
      { fecha: '2026-09-12', tipo: 'CONTACTO', texto: 'Primer contacto por la web: pidió información del proyecto.' },
      { fecha: '2026-09-14', tipo: 'NOTA', texto: 'Se envió la cotización del lote A-03.' },
      { fecha: '2026-09-20', tipo: 'CONTACTO', texto: 'Llamada de seguimiento: confirmó la visita al proyecto.' },
    ],
  },
]
