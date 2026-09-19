// LOTES DE RESIDENCIAL CHALAY II — transcritos del plano comercial fechado 03/09/26
// (assets/proyectos/chalay-ii/plano-lotes.jpg). Solo se registra lo que se lee con claridad
// en el plano: manzana, número de lote y área. Precios, medidas de linderos y geometría NO
// aparecen en el plano y quedan en null (ver `./index.js`) hasta tener el dato real.
//
// Para cargar un precio: { numero: 1, area_m2: 107, precio_total: 95000 } (precio_m2 se calcula).
// Para agregar un lote: añade { numero, area_m2 } dentro de la manzana que corresponda.
// Para agregar una manzana: añade { nombre: 'MZ D', lotes: [ ... ] }.
export const chalayII = {
  proyectoId: 1,
  prefijoCodigo: 'CHALAY-II',
  manzanas: [
    {
      nombre: 'MZ A',
      lotes: [
        { numero: 1, area_m2: 107 },
        { numero: 2, area_m2: 120 },
        { numero: 3, area_m2: 95 },
        { numero: 4, area_m2: 95 },
        { numero: 5, area_m2: 95 },
        { numero: 6, area_m2: 95 },
        { numero: 7, area_m2: 95 },
        { numero: 8, area_m2: 95 },
        { numero: 9, area_m2: 95 },
        { numero: 10, area_m2: 95 },
        { numero: 11, area_m2: 95 },
        { numero: 12, area_m2: 95 },
        { numero: 13, area_m2: 95 },
        { numero: 14, area_m2: 95 },
        { numero: 15, area_m2: 100 },
        { numero: 16, area_m2: 123 },
      ],
    },
    {
      nombre: 'MZ B',
      lotes: [
        { numero: 1, area_m2: 120 },
        { numero: 2, area_m2: 120 },
        { numero: 3, area_m2: 110 },
        { numero: 4, area_m2: 110 },
        { numero: 5, area_m2: 110 },
        { numero: 6, area_m2: 110 },
        { numero: 7, area_m2: 110 },
        { numero: 8, area_m2: 110 },
        { numero: 9, area_m2: 110 },
        { numero: 10, area_m2: 110 },
        { numero: 11, area_m2: 110 },
        { numero: 12, area_m2: 110 },
        { numero: 13, area_m2: 110 },
        { numero: 14, area_m2: 110 },
        { numero: 15, area_m2: 110 },
        { numero: 16, area_m2: 100 },
      ],
    },
    {
      nombre: 'MZ C',
      lotes: [
        { numero: 1, area_m2: 115 },
        { numero: 2, area_m2: 115 },
        { numero: 3, area_m2: 111 },
        { numero: 4, area_m2: 110 },
        { numero: 5, area_m2: 115 },
        { numero: 6, area_m2: 115 },
      ],
    },
  ],
}
