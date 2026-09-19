// LOTES DE SAN AGUSTÍN I — transcritos del plano comercial fechado 28/08/26
// (assets/proyectos/san-agustin-i/plano-lotes.jpg). Solo manzana, número de lote y área;
// precios, medidas y geometría no aparecen en el plano (quedan null; ver `./chalay-ii.js`
// para el formato de una fila con precio).
export const sanAgustinI = {
  proyectoId: 2,
  prefijoCodigo: 'SAN-AGUSTIN-I',
  manzanas: [
    {
      nombre: 'MZ A',
      lotes: [
        { numero: 1, area_m2: 150 },
        { numero: 2, area_m2: 125 },
        { numero: 3, area_m2: 125 },
        { numero: 4, area_m2: 125 },
        { numero: 5, area_m2: 115 },
        { numero: 6, area_m2: 115 },
        { numero: 7, area_m2: 102 },
        { numero: 8, area_m2: 102 },
        { numero: 9, area_m2: 120 },
        { numero: 10, area_m2: 125 },
        { numero: 11, area_m2: 118 },
        { numero: 12, area_m2: 119 },
        { numero: 13, area_m2: 113 },
        { numero: 14, area_m2: 103 },
      ],
    },
    {
      nombre: 'MZ B',
      lotes: [
        { numero: 1, area_m2: 125 },
        { numero: 2, area_m2: 118 },
        { numero: 3, area_m2: 111 },
        { numero: 4, area_m2: 115 },
        { numero: 5, area_m2: 115 },
        { numero: 6, area_m2: 115 },
        { numero: 7, area_m2: 119 },
        { numero: 8, area_m2: 120 },
      ],
    },
  ],
}
