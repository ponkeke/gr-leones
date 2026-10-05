import { useState } from 'react'
import { CircleHelp } from 'lucide-react'
import { getPreguntasFrecuentes } from '../../services/api'
import { Cargando, EncabezadoContenido, EstadoVacio } from '../contenido/PartesContenido'
import { useCarga } from '../contenido/useCarga'

// Para buscar sin distinguir mayúsculas ni tildes.
const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Preguntas frecuentes (públicas): solo las activas. Las administra el panel de administración. */
function PreguntasFrecuentes() {
  const { estado, datos } = useCarga(getPreguntasFrecuentes)
  const [busqueda, setBusqueda] = useState('')

  const texto = normalizar(busqueda.trim())
  const visibles = (datos ?? []).filter((p) => !texto || normalizar(`${p.pregunta} ${p.respuesta} ${p.categoria ?? ''}`).includes(texto))

  return (
    <section className="contenido">
      <div className="contenido-contenedor">
        <EncabezadoContenido eyebrow="Ayuda" titulo="Preguntas" destacado="frecuentes">
          Respuestas rápidas sobre cómo consultar proyectos, agendar visitas y usar tu cuenta de cliente.
        </EncabezadoContenido>

        {estado !== 'listo' ? (
          <Cargando estado={estado} />
        ) : datos.length === 0 ? (
          <div className="contenido-seccion">
            <EstadoVacio titulo="Aún no hay preguntas publicadas" icono={CircleHelp}>
              Si tienes una consulta, escríbenos o conversa con un asesor.
            </EstadoVacio>
          </div>
        ) : (
          <>
            <input
              type="search"
              className="contenido-buscador"
              placeholder="Buscar una pregunta…"
              aria-label="Buscar una pregunta"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {visibles.length === 0 ? (
              <p className="contenido-cargando">No encontramos preguntas con esa búsqueda.</p>
            ) : (
              <div className="contenido-faq">
                {visibles.map((p) => (
                  <details key={p.id}>
                    <summary>
                      <span>
                        {p.categoria && <span className="contenido-categoria">{p.categoria}</span>}
                        {p.pregunta}
                      </span>
                    </summary>
                    <p>{p.respuesta}</p>
                  </details>
                ))}
              </div>
            )}
          </>
        )}

        <div className="contenido-cta">
          <p>¿No encontraste tu respuesta?</p>
          <a className="btn-buscar" href="#contacto">Contáctanos</a>
        </div>
      </div>
    </section>
  )
}

export default PreguntasFrecuentes
