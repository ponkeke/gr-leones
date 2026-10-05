import { useState } from 'react'
import { BookOpenText, MessageSquareQuote, PenLine, Share2, Smile } from 'lucide-react'
import Estrellas from '../../components/Estrellas/Estrellas'
import RedesSociales from '../../components/RedesSociales/RedesSociales'
import { getHistoriasCompradores, getResumenSatisfaccion, getTestimoniosPublicados } from '../../services/api'
import { obtenerUsuarioSesion } from '../../services/sesion'
import { formatearFecha } from '../../utils/formato'
import { Cargando, EncabezadoContenido, EstadoVacio, EtiquetaEjemplo } from '../contenido/PartesContenido'
import { useCarga } from '../contenido/useCarga'

const fechaCorta = (iso) => formatearFecha(String(iso ?? '').slice(0, 10))

/**
 * Comunidad Leones: clientes satisfechos (calculado SOLO con testimonios publicados), testimonios,
 * historias de compradores y redes sociales. Ningún número ni testimonio es inventado: sin
 * contenido publicado se muestran estados vacíos.
 */
function Testimonios() {
  const resumen = useCarga(getResumenSatisfaccion)
  const testimonios = useCarga(getTestimoniosPublicados)
  const historias = useCarga(getHistoriasCompradores)
  // Solo un cliente con sesión puede escribir un testimonio (la API lo vuelve a validar).
  const [esCliente] = useState(() => obtenerUsuarioSesion()?.tipo === 'cliente')

  return (
    <section className="contenido">
      <div className="contenido-contenedor">
        <EncabezadoContenido eyebrow="Comunidad Leones" titulo="La experiencia de" destacado="nuestros clientes">
          Opiniones reales de clientes de Grupo Inmobiliario Leones del Sur. Cada testimonio es enviado por un cliente con
          cuenta y revisado antes de publicarse.
        </EncabezadoContenido>

        <div className="contenido-cta">
          <p>
            {esCliente
              ? '¿Cómo ha sido tu experiencia con nosotros? Cuéntanos.'
              : '¿Ya eres cliente de Grupo Leones? Ingresa a tu cuenta para compartir tu experiencia.'}
          </p>
          <a className="btn-buscar" href={esCliente ? '/cliente/testimonio' : '/login'}>
            <PenLine size={15} aria-hidden="true" /> {esCliente ? 'Escribir mi testimonio' : 'Ingresar como cliente'}
          </a>
        </div>

        {/* CLIENTES SATISFECHOS */}
        <section className="contenido-seccion" aria-labelledby="titulo-satisfechos">
          <h2 id="titulo-satisfechos" className="contenido-seccion-titulo">Clientes satisfechos</h2>
          <p className="contenido-seccion-descripcion">
            Calculado únicamente con los testimonios publicados. Una opinión de 4 o 5 estrellas cuenta como cliente satisfecho.
          </p>
          {resumen.estado !== 'listo' ? (
            <Cargando estado={resumen.estado} />
          ) : resumen.datos.total === 0 ? (
            <EstadoVacio titulo="Todavía no hay opiniones publicadas" icono={Smile}>
              Las cifras de satisfacción aparecerán cuando nuestros clientes compartan su experiencia.
            </EstadoVacio>
          ) : (
            <ResumenSatisfaccion resumen={resumen.datos} />
          )}
        </section>

        {/* TESTIMONIOS */}
        <section className="contenido-seccion" aria-labelledby="titulo-testimonios">
          <h2 id="titulo-testimonios" className="contenido-seccion-titulo">Testimonios</h2>
          {testimonios.estado !== 'listo' ? (
            <Cargando estado={testimonios.estado} />
          ) : testimonios.datos.length === 0 ? (
            <EstadoVacio titulo="Aún no hay testimonios publicados" icono={MessageSquareQuote}>
              Pronto verás aquí las experiencias de nuestros clientes.
            </EstadoVacio>
          ) : (
            <div className="contenido-rejilla">
              {testimonios.datos.map((t) => (
                <article key={t.id} className="contenido-tarjeta">
                  <Estrellas valor={t.puntuacion} />
                  <p className="contenido-cita">“{t.comentario}”</p>
                  {t.proyecto && <span className="contenido-meta">{t.proyecto}</span>}
                  <div className="contenido-autor">
                    <span>{t.nombreVisible}</span>
                    <span className="contenido-meta">{fechaCorta(t.fecha)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* HISTORIAS DE COMPRADORES */}
        <section className="contenido-seccion" aria-labelledby="titulo-historias">
          <h2 id="titulo-historias" className="contenido-seccion-titulo">Historias de compradores</h2>
          <p className="contenido-seccion-descripcion">Experiencias contadas por quienes ya eligieron su terreno con nosotros.</p>
          {historias.estado !== 'listo' ? (
            <Cargando estado={historias.estado} />
          ) : historias.datos.length === 0 ? (
            <EstadoVacio titulo="Estamos preparando las primeras historias" icono={BookOpenText}>
              Aquí publicaremos, con su autorización, las historias de nuestros compradores.
            </EstadoVacio>
          ) : (
            <div className="contenido-rejilla">
              {historias.datos.map((h) => (
                <article key={h.id} className="contenido-tarjeta">
                  {h.imagen && <img className="contenido-imagen" src={h.imagen} alt="" loading="lazy" />}
                  {h.esEjemplo && <EtiquetaEjemplo />}
                  <h3>{h.titulo}</h3>
                  {h.historia && <p>{h.historia}</p>}
                  <span className="contenido-meta">{[h.proyecto?.nombre, h.fecha ? fechaCorta(h.fecha) : null].filter(Boolean).join(' · ')}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* REDES SOCIALES */}
        <section className="contenido-seccion" aria-labelledby="titulo-redes">
          <h2 id="titulo-redes" className="contenido-seccion-titulo">
            <Share2 size={22} aria-hidden="true" /> Síguenos
          </h2>
          <p className="contenido-seccion-descripcion">Nuestras redes sociales oficiales.</p>
          <div className="contenido-tarjeta">
            <RedesSociales variante="seccion" />
          </div>
        </section>
      </div>
    </section>
  )
}

function ResumenSatisfaccion({ resumen }) {
  const maximo = Math.max(...resumen.distribucion.map((d) => d.cantidad), 1)
  return (
    <div className="contenido-satisfaccion">
      <div className="contenido-tarjeta contenido-promedio">
        <span className="contenido-promedio-valor">{resumen.promedio.toLocaleString('es-PE')}</span>
        <Estrellas valor={Math.round(resumen.promedio)} tamano={18} />
        <p>
          {resumen.satisfechos} de {resumen.total} {resumen.total === 1 ? 'opinión' : 'opiniones'} con 4 o 5 estrellas
        </p>
      </div>
      <div className="contenido-tarjeta" aria-label="Distribución de puntuaciones">
        {resumen.distribucion.map((d) => (
          <div key={d.puntuacion} className="contenido-barra">
            <span>{d.puntuacion} {d.puntuacion === 1 ? 'estrella' : 'estrellas'}</span>
            <span className="contenido-barra-fondo" aria-hidden="true">
              <span className="contenido-barra-relleno" style={{ display: 'block', width: `${(d.cantidad / maximo) * 100}%` }} />
            </span>
            <span>{d.cantidad}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonios
