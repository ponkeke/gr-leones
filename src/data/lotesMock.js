// Datos mock para el visor de planos (`PlanoInteractivo`) mientras no existe la API/PostgreSQL.
//
// Se derivan del mismo mock que ya usan la vista Lista, el Simulador y las Solicitudes
// (`src/data/lotes/`), en vez de escribirse aparte: así no quedan dos copias de los lotes de un
// mismo proyecto (con el riesgo de que alguien actualice el estado de un lote en un solo lugar y
// las dos vistas queden desincronizadas). `chalayII`/`estadosPlano` (en `./lotes/`) siguen siendo
// la única fuente de verdad; este archivo solo la reexporta con el nombre que usa `Lotes.jsx`.
//
// Cuando exista PostgreSQL, `Lotes.jsx` dejará de necesitar este archivo (`lotes` ya no estará
// vacío) sin tocar `PlanoInteractivo`: ver `lotesParaPlano` en `pages/lotes/Lotes.jsx`.
import { getLotesByProyecto } from './lotes'

// Chalay II = proyecto id 1 (ver `./proyectos.js`): es el único proyecto con plano interactivo
// (polígonos SVG de Map My Img) por ahora. Incluye los 38 lotes (MZ A: 16, MZ B: 16, MZ C: 6),
// con CHALAY-II-MZA-02 como VENDIDO y CHALAY-II-MZB-01/02 como SEPARADO (ver `./lotes/estados-plano.js`).
export const lotesMock = getLotesByProyecto(1)
