import { useEffect, useState } from 'react'
import { Images } from 'lucide-react'
import { getGaleria, getProyectosParaContenido } from '../../services/api'
import { Cargando, EncabezadoContenido, EstadoVacio } from '../contenido/PartesContenido'

/**
 * Galería multimedia (tabla `galeria`): imágenes y videos PUBLICADOS por la empresa, que pueden
 * filtrarse por proyecto. No hay contenido de relleno: sin datos de la API se muestra un estado vacío.
 * Forma de cada elemento: ver `data/contenido.js`.
 */
function Galeria() {
  const [proyectos, setProyectos] = useState([])
  const [proyectoId, setProyectoId] = useState(null)
  const [resultado, setResultado] = useState({ clave: null, estado: 'cargando', datos: [] })

  useEffect(() => {
    let cancelado = false
    getProyectosParaContenido().then((lista) => {
      if (!cancelado) setProyectos(lista)
    })
    return () => {
      cancelado = true
    }
  }, [])

  // Cada cambio de proyecto vuelve a pedir la galería filtrada.
  useEffect(() => {
    let cancelado = false
    getGaleria({ proyectoId })
      .then((datos) => {
        if (!cancelado) setResultado({ clave: proyectoId, estado: 'listo', datos })
      })
      .catch(() => {
        if (!cancelado) setResultado({ clave: proyectoId, estado: 'error', datos: [] })
      })
    return () => {
      cancelado = true
    }
  }, [proyectoId])

  const estado = resultado.clave === proyectoId ? resultado.estado : 'cargando'

  return (
    <section className="contenido">
      <div className="contenido-contenedor">
        <EncabezadoContenido eyebrow="Galería" titulo="Nuestros proyectos en" destacado="imágenes y videos">
          Fotos y videos de los proyectos de Grupo Inmobiliario Leones del Sur.
        </EncabezadoContenido>

        {proyectos.length > 0 && (
          <div className="contenido-filtros" role="group" aria-label="Filtrar por proyecto">
            <button type="button" aria-pressed={proyectoId === null} onClick={() => setProyectoId(null)}>
              Todos
            </button>
            {proyectos.map((p) => (
              <button key={p.id} type="button" aria-pressed={proyectoId === p.id} onClick={() => setProyectoId(p.id)}>
                {p.nombre}
              </button>
            ))}
          </div>
        )}

        <section className="contenido-seccion" aria-label="Galería">
          {estado !== 'listo' ? (
            <Cargando estado={estado} />
          ) : resultado.datos.length === 0 ? (
            <EstadoVacio titulo="Galería en preparación" icono={Images}>
              Pronto publicaremos imágenes y videos de nuestros proyectos.
            </EstadoVacio>
          ) : (
            <div className="contenido-rejilla">
              {resultado.datos.map((m) => (
                <figure key={m.id} className="contenido-tarjeta contenido-multimedia">
                  {m.tipo === 'VIDEO' ? (
                    <video className="contenido-imagen" src={m.url} poster={m.miniatura ?? undefined} controls preload="none" />
                  ) : (
                    <img className="contenido-imagen" src={m.miniatura ?? m.url} alt={m.titulo} loading="lazy" />
                  )}
                  <figcaption>
                    <h3>{m.titulo}</h3>
                    {m.descripcion && <p>{m.descripcion}</p>}
                    {m.proyecto && <span className="contenido-meta">{m.proyecto.nombre}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default Galeria
