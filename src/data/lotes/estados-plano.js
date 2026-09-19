// ESTADOS DE LOS LOTES (DATOS MOCK) — foto tomada de los colores de la leyenda de cada plano
// comercial (VENDIDO / SEPARADO / LIBRE = DISPONIBLE / RESERVADO), con la fecha impresa en él.
// Es una instantánea, no el estado en vivo: cuando exista la base de datos, este archivo se
// elimina y el estado pasa a venir de la columna `estado` de la tabla `lotes`.
//
// Cómo leerlo: todo lote que NO aparezca en `excepciones` toma `porDefecto` (verde en el plano).
// Las llaves son el `codigo` del lote, p. ej. 'CHALAY-II-MZA-02' (ver ./index.js).
// Para cambiar el estado de un lote, agrega o edita su línea en `excepciones`.
export const ESTADOS_PLANO = {
  // Residencial Chalay II — plano 03/09/26
  1: {
    fecha: '2026-09-03',
    porDefecto: 'DISPONIBLE',
    excepciones: {
      'CHALAY-II-MZA-02': 'VENDIDO',
      'CHALAY-II-MZB-01': 'SEPARADO',
      'CHALAY-II-MZB-02': 'SEPARADO',
    },
  },

  // San Agustín I — plano 28/08/26
  2: {
    fecha: '2026-08-28',
    porDefecto: 'DISPONIBLE',
    excepciones: {
      'SAN-AGUSTIN-I-MZA-01': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-04': 'RESERVADO',
      'SAN-AGUSTIN-I-MZA-05': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-06': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-07': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-08': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-09': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-10': 'SEPARADO',
      'SAN-AGUSTIN-I-MZA-11': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-12': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-13': 'VENDIDO',
      'SAN-AGUSTIN-I-MZA-14': 'VENDIDO',
      'SAN-AGUSTIN-I-MZB-01': 'VENDIDO',
      'SAN-AGUSTIN-I-MZB-02': 'VENDIDO',
      'SAN-AGUSTIN-I-MZB-04': 'VENDIDO',
      'SAN-AGUSTIN-I-MZB-05': 'VENDIDO',
      'SAN-AGUSTIN-I-MZB-07': 'VENDIDO',
      'SAN-AGUSTIN-I-MZB-08': 'SEPARADO',
    },
  },

  // San Agustín II — plano 02/06/26 (todos los lotes aparecen libres)
  3: {
    fecha: '2026-06-02',
    porDefecto: 'DISPONIBLE',
    excepciones: {},
  },
}
