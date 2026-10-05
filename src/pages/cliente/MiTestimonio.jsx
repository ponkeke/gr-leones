import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import Estrellas from '../../components/Estrellas/Estrellas'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Insignia } from '../../components/areaInterna/Partes'
import { crearTestimonio, getMisTestimonios, getProyectosParaContenido } from '../../services/api'
import { ESTADOS_TESTIMONIO, LARGO_COMENTARIO } from '../../data/contenido'
import { buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

const fechaCorta = (iso) => formatearFecha(String(iso ?? '').slice(0, 10))

/**
 * "Mi testimonio": el cliente puntúa de 1 a 5 y comenta su experiencia. El testimonio queda
 * pendiente hasta que administración lo publique; solo los publicados se ven en el sitio.
 */
function MiTestimonio() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`testimonios-${usuario.id}`, getMisTestimonios)

  return (
    <>
      <EncabezadoPagina
        titulo="Mi testimonio"
        subtitulo="Cuéntanos cómo fue tu experiencia. Revisamos cada testimonio antes de publicarlo en el sitio."
      >
        <a className="panel-boton-secundario" href="/testimonios">Ver testimonios publicados</a>
      </EncabezadoPagina>
      {estado !== 'listo' ? <EstadoCarga estado={estado} error={error} /> : <FormularioTestimonio inicial={datos} />}
    </>
  )
}

function FormularioTestimonio({ inicial }) {
  const [testimonios, setTestimonios] = useState(inicial)
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [proyectoId, setProyectoId] = useState('')
  const [proyectos, setProyectos] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'exito' | 'error', texto }

  const pendiente = testimonios.find((t) => t.estado === 'PENDIENTE')

  useEffect(() => {
    let cancelado = false
    getProyectosParaContenido().then((lista) => {
      if (!cancelado) setProyectos(lista)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const enviar = async (evento) => {
    evento.preventDefault()
    setEnviando(true)
    setMensaje(null)
    try {
      const nuevo = await crearTestimonio({ puntuacion, comentario, proyectoId: proyectoId || null })
      setTestimonios((lista) => [nuevo, ...lista])
      setPuntuacion(0)
      setComentario('')
      setProyectoId('')
      setMensaje({ tipo: 'exito', texto: '¡Gracias! Tu testimonio quedó pendiente de revisión.' })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <section className="panel-tarjeta">
        {pendiente ? (
          <p className="panel-texto-secundario">
            Tu testimonio del {fechaCorta(pendiente.fechaCreacion)} está pendiente de revisión. Podrás enviar otro cuando sea revisado.
          </p>
        ) : (
          <form className="panel-formulario" onSubmit={enviar} noValidate>
            <div className="panel-campo panel-campo-ancho">
              <span id="testimonio-puntuacion-etiqueta">¿Qué puntuación le das a tu experiencia?</span>
              <Estrellas valor={puntuacion} onCambiar={setPuntuacion} tamano={26} etiqueta="Puntuación de 1 a 5 estrellas" />
            </div>
            <label className="panel-campo">
              Proyecto (opcional)
              <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
                <option value="">Sin indicar</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </label>
            <label className="panel-campo panel-campo-ancho">
              Tu comentario
              <textarea
                value={comentario}
                maxLength={LARGO_COMENTARIO.maximo}
                placeholder="Cuéntanos cómo te atendimos y cómo fue tu experiencia."
                onChange={(e) => setComentario(e.target.value)}
              />
              <span className="panel-texto-secundario">
                {comentario.trim().length}/{LARGO_COMENTARIO.maximo} caracteres (mínimo {LARGO_COMENTARIO.minimo})
              </span>
            </label>
            {mensaje?.tipo === 'error' && <p className="panel-error" role="alert">{mensaje.texto}</p>}
            <div className="panel-formulario-acciones">
              <button type="submit" className="btn-buscar panel-boton" disabled={enviando}>
                <Send size={15} aria-hidden="true" /> {enviando ? 'Enviando…' : 'Enviar testimonio'}
              </button>
            </div>
          </form>
        )}
        {mensaje?.tipo === 'exito' && <p className="panel-exito" role="status">{mensaje.texto}</p>}
      </section>

      <section className="panel-seccion">
        <h2 className="panel-seccion-titulo">Mis testimonios</h2>
        {testimonios.length === 0 ? (
          <p className="panel-mensaje">Todavía no enviaste ningún testimonio.</p>
        ) : (
          <ul className="panel-lista">
            {testimonios.map((t) => (
              <li key={t.id} className="panel-tarjeta panel-lista-item">
                <div>
                  <p className="panel-lista-titulo">
                    <Estrellas valor={t.puntuacion} /> <Insignia estado={buscarEstado(ESTADOS_TESTIMONIO, t.estado)} />
                  </p>
                  <p className="panel-linea-detalle">“{t.comentario}”</p>
                  <p className="panel-texto-secundario">Enviado el {fechaCorta(t.fechaCreacion)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default MiTestimonio
