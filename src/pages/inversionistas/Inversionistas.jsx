import { Building2, FileText, Landmark, MessageCircle } from 'lucide-react'
import { getContenidoInversionistas, getProyectos } from '../../services/api'
import { formatearFecha } from '../../utils/formato'
import { Cargando, EncabezadoContenido, EstadoVacio } from '../contenido/PartesContenido'
import { useCarga } from '../contenido/useCarga'

/**
 * Información para inversionistas. La cartera de proyectos usa SOLO datos que ya existen en el
 * sistema (lotes y avance impreso en cada plano). La información específica para inversionistas
 * (tabla futura `contenido_inversionistas`) la publicará la empresa: sin ella, estado vacío.
 * No se publican rentabilidades, proyecciones ni promesas de ningún tipo.
 */
function Inversionistas() {
  const proyectos = useCarga(getProyectos)
  const bloques = useCarga(getContenidoInversionistas)

  return (
    <section className="contenido">
      <div className="contenido-contenedor">
        <EncabezadoContenido eyebrow="Inversionistas" titulo="Invierte con" destacado="Grupo Leones">
          Conoce los proyectos que desarrollamos y la información disponible para evaluar una inversión en terrenos junto a
          nuestro equipo comercial.
        </EncabezadoContenido>

        <section className="contenido-seccion" aria-labelledby="titulo-cartera">
          <h2 id="titulo-cartera" className="contenido-seccion-titulo">Nuestros proyectos</h2>
          <p className="contenido-seccion-descripcion">Datos tomados del plano comercial vigente de cada proyecto.</p>
          {proyectos.estado !== 'listo' ? (
            <Cargando estado={proyectos.estado} />
          ) : (
            <div className="contenido-rejilla">
              {proyectos.datos.map((p) => (
                <article key={p.id} className="contenido-tarjeta">
                  <h3>
                    <Building2 size={16} aria-hidden="true" /> {p.nombre}
                  </h3>
                  <div>
                    <div className="contenido-dato"><span>Ubicación</span><strong>{p.ubicacion ?? 'Por confirmar'}</strong></div>
                    <div className="contenido-dato"><span>Lotes</span><strong>{p.totalLotes}</strong></div>
                    <div className="contenido-dato"><span>Lotes disponibles</span><strong>{p.lotesDisponibles}</strong></div>
                    <div className="contenido-dato"><span>Avance de obras</span><strong>{p.avanceObras ?? '—'}%</strong></div>
                    <div className="contenido-dato"><span>Avance de ventas</span><strong>{p.avanceVentas ?? '—'}%</strong></div>
                  </div>
                  {p.planoFecha && <span className="contenido-meta">Según el plano del {formatearFecha(p.planoFecha)}</span>}
                  <a className="btn-buscar" href={`/lotes?id=${p.id}`}>Ver lotes</a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="contenido-seccion" aria-labelledby="titulo-info-inversionistas">
          <h2 id="titulo-info-inversionistas" className="contenido-seccion-titulo">Información para inversionistas</h2>
          {bloques.estado !== 'listo' ? (
            <Cargando estado={bloques.estado} />
          ) : bloques.datos.length === 0 ? (
            <EstadoVacio titulo="Información en preparación" icono={FileText}>
              Estamos preparando la información para inversionistas. Mientras tanto, un asesor puede resolver tus consultas.
            </EstadoVacio>
          ) : (
            <div className="contenido-rejilla">
              {bloques.datos.map((b) => (
                <article key={b.id} className="contenido-tarjeta">
                  {b.imagen && <img className="contenido-imagen" src={b.imagen} alt="" loading="lazy" />}
                  <h3>{b.titulo}</h3>
                  <p>{b.contenido}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="contenido-cta">
          <p>
            <Landmark size={16} aria-hidden="true" /> ¿Quieres evaluar una inversión? Conversa con un asesor comercial.
          </p>
          <a className="btn-buscar" href="#contacto">
            <MessageCircle size={15} aria-hidden="true" /> Contactar
          </a>
        </div>

        <p className="contenido-aviso">
          La información de esta página es referencial y no constituye una oferta ni garantiza rentabilidad, plusvalía ni
          resultados. Las condiciones de cada operación se confirman con la empresa.
        </p>
      </div>
    </section>
  )
}

export default Inversionistas
