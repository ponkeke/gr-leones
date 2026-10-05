// VISITAS AGENDADAS (datos de DEMOSTRACIÓN) para el área interna. No representan disponibilidad
// real de los asesores: esa vendrá del backend. `estado` usa ESTADOS_VISITA de `./procesoComercial.js`.
// Son solo los datos INICIALES: `services/api.js` los copia una vez al almacén mock (localStorage)
// y desde ahí se agregan las visitas nuevas y los cambios de estado.
export const visitasMock = [
  {
    id: 1,
    clienteId: 1,
    asesorId: 'asesora-ventas-1',
    loteCodigo: 'CHALAY-II-MZA-03',
    fecha: '2026-09-28',
    hora: '10:00',
    tipo: 'Visita al proyecto',
    estado: 'CONFIRMADA',
  },
  {
    id: 5,
    clienteId: 1,
    asesorId: 'asesora-ventas-1',
    loteCodigo: 'CHALAY-II-MZA-05',
    fecha: '2026-09-15',
    hora: '16:00',
    tipo: 'Visita al proyecto',
    estado: 'CANCELADA',
  },
]
