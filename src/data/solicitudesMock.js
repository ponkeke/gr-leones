// SOLICITUDES DE CLIENTES (datos de DEMOSTRACIÓN) para el área interna. `tipo` y `estado` usan
// los catálogos de `./procesoComercial.js`; el lote se referencia por su `codigo` real.
// Son solo los datos INICIALES: `services/api.js` los copia una vez al almacén mock (localStorage);
// las solicitudes de los formularios públicos (`crearSolicitud()`) se agregan a ese mismo almacén.
export const solicitudesMock = [
  {
    id: 1,
    clienteId: 1,
    asesorId: 'asesora-ventas-1',
    tipo: 'INFORMACION',
    loteCodigo: 'CHALAY-II-MZA-03',
    fecha: '2026-09-12',
    estado: 'ATENDIDA',
    mensaje: 'Quisiera información sobre el proyecto y las formas de pago.',
  },
  {
    id: 2,
    clienteId: 1,
    asesorId: 'asesora-ventas-1',
    tipo: 'COTIZACION',
    loteCodigo: 'CHALAY-II-MZA-03',
    fecha: '2026-09-14',
    estado: 'ATENDIDA',
    mensaje: 'Solicito la cotización del lote A-03.',
  },
  {
    id: 3,
    clienteId: 1,
    asesorId: 'asesora-ventas-1',
    tipo: 'VISITA',
    loteCodigo: 'CHALAY-II-MZA-03',
    fecha: '2026-09-16',
    estado: 'EN_ATENCION',
    mensaje: 'Me gustaría conocer el lote en persona.',
  },
  {
    id: 4,
    clienteId: 1,
    asesorId: 'asesora-ventas-1',
    tipo: 'INFORMACION',
    loteCodigo: 'CHALAY-II-MZA-05',
    fecha: '2026-09-22',
    estado: 'PENDIENTE',
    mensaje: '¿El lote A-05 tiene las mismas condiciones que el A-03?',
  },
]
