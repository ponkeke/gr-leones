// SEGUIMIENTO COMERCIAL (datos de DEMOSTRACIÓN). Un registro por cliente: en qué etapa está
// (`etapa`, ver ETAPAS_CLIENTE en `./procesoComercial.js`), qué lotes le interesan y las notas del
// asesor. Los lotes se referencian por su `codigo` real (`./lotes/`), así área, precio y estado
// salen siempre del plano y no se copian aquí. No describe procesos de compra reales.
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
  {
    id: 2,
    clienteId: 2,
    asesorId: 'asesora-ventas-1',
    etapa: 'VISITA',
    lotesInteres: ['CHALAY-II-MZB-04'],
    ultimaInteraccion: '2026-09-23',
    notas: [
      { fecha: '2026-09-18', tipo: 'CONTACTO', texto: 'Solicitó agendar una visita al lote B-04.' },
      { fecha: '2026-09-20', tipo: 'NOTA', texto: 'Visita realizada. Interesado en separar el lote.' },
    ],
  },
  {
    id: 3,
    clienteId: 3,
    asesorId: 'asesora-ventas-1',
    etapa: 'NUEVO',
    lotesInteres: ['SAN-AGUSTIN-II-MZA-10'],
    ultimaInteraccion: '2026-09-24',
    notas: [],
  },
  {
    id: 4,
    clienteId: 4,
    asesorId: 'asesora-ventas-2',
    etapa: 'CONTACTADO',
    lotesInteres: ['SAN-AGUSTIN-I-MZB-03'],
    ultimaInteraccion: '2026-09-21',
    notas: [
      { fecha: '2026-09-21', tipo: 'CONTACTO', texto: 'Contacto por WhatsApp: pidió cotización.' },
    ],
  },
]
