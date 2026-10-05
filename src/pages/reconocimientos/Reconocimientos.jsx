import { Award } from 'lucide-react'
import { getReconocimientos } from '../../services/api'
import { Cargando, EncabezadoContenido, EstadoVacio, EtiquetaEjemplo } from '../contenido/PartesContenido'
import { useCarga } from '../contenido/useCarga'

/**
 * Reconocimientos y logros de la empresa (tabla futura `reconocimientos`). No hay ninguno inventado:
 * sin contenido publicado se muestra un estado vacío. Cualquier dato de demostración debe llevar
 * `esEjemplo: true` y se marca como "Contenido de ejemplo".
 */
function Reconocimientos() {
  const { estado, datos } = useCarga(getReconocimientos)

  return (
    <section className="contenido">
      <div className="contenido-contenedor">
        <EncabezadoContenido eyebrow="Trayectoria" titulo="Reconocimientos" destacado="y logros">
          Los hitos y reconocimientos de Grupo Inmobiliario Leones del Sur.
        </EncabezadoContenido>

        <section className="contenido-seccion" aria-label="Reconocimientos">
          {estado !== 'listo' ? (
            <Cargando estado={estado} />
          ) : datos.length === 0 ? (
            <EstadoVacio titulo="Próximamente" icono={Award}>
              Aquí publicaremos los reconocimientos y logros de la empresa.
            </EstadoVacio>
          ) : (
            <div className="contenido-rejilla">
              {datos.map((r) => (
                <article key={r.id} className="contenido-tarjeta">
                  {r.imagen && <img className="contenido-imagen" src={r.imagen} alt="" loading="lazy" />}
                  {r.esEjemplo && <EtiquetaEjemplo />}
                  <h3>
                    <Award size={16} aria-hidden="true" /> {r.titulo}
                  </h3>
                  {r.descripcion && <p>{r.descripcion}</p>}
                  <span className="contenido-meta">{[r.institucion, r.anio].filter(Boolean).join(' · ')}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default Reconocimientos
