import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Dato, EncabezadoPagina, EstadoCarga } from '../../components/areaInterna/Partes'
import { esEnlacePendiente } from '../../components/areaInterna/formatoPanel'
import { getAsesor } from '../../services/api'

// Reutiliza el perfil público del equipo (`data/equipo.js`, el mismo que muestra "Nosotros").
// Los enlaces de ejemplo (wa.me/51XXXX…, instagram.com/...) se muestran como "Por confirmar".
const REDES = [
  { clave: 'instagram', etiqueta: 'Instagram' },
  { clave: 'facebook', etiqueta: 'Facebook' },
  { clave: 'linkedin', etiqueta: 'LinkedIn' },
]

const Pendiente = () => <span className="panel-pendiente">Por confirmar</span>

function EnlacePerfil({ url, children }) {
  if (esEnlacePendiente(url)) return <Pendiente />
  return (
    <a className="panel-enlace" href={url} target={/^https?:/i.test(url) ? '_blank' : undefined} rel="noreferrer">
      {children}
    </a>
  )
}

function PerfilAsesor() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`asesor-${usuario.id}`, () => getAsesor(usuario.id))

  if (estado !== 'listo') return <EstadoCarga estado={estado} error={error} />

  const perfil = datos.perfil ?? {}
  const redes = perfil.redes ?? {}
  const correo = redes.email?.replace(/^mailto:/i, '')
  const idiomas = Array.isArray(perfil.idiomas) ? perfil.idiomas.join(', ') : perfil.idiomas

  return (
    <>
      <EncabezadoPagina
        titulo="Mi perfil"
        subtitulo="Es el mismo perfil que ven los clientes en la sección Nosotros. Para actualizarlo, comunícate con administración."
      />

      <section className="panel-tarjeta panel-perfil">
        <img className="panel-perfil-foto" src={datos.foto ?? perfil.imagen} alt={datos.nombre} />
        <div className="panel-perfil-datos">
          <h2 className="panel-perfil-nombre">{datos.nombre}</h2>
          <p className="panel-perfil-cargo">{datos.cargo}</p>
          {perfil.frase && <p className="panel-linea-detalle">“{perfil.frase}”</p>}
        </div>
      </section>

      <section className="panel-seccion panel-tarjeta">
        <dl className="panel-datos">
          <Dato etiqueta="Código">{datos.codigo}</Dato>
          <Dato etiqueta="Experiencia">{perfil.experiencia ?? <Pendiente />}</Dato>
          <Dato etiqueta="Especialidad">{perfil.especialidad ?? <Pendiente />}</Dato>
          <Dato etiqueta="Zona de atención">{perfil.zona ?? <Pendiente />}</Dato>
          <Dato etiqueta="Idiomas">{idiomas || <Pendiente />}</Dato>
          <Dato etiqueta="Teléfono">{datos.telefono ?? <Pendiente />}</Dato>
          <Dato etiqueta="WhatsApp"><EnlacePerfil url={redes.whatsapp}>Abrir WhatsApp</EnlacePerfil></Dato>
          <Dato etiqueta="Correo"><EnlacePerfil url={redes.email}>{correo}</EnlacePerfil></Dato>
          {REDES.map((red) => (
            <Dato key={red.clave} etiqueta={red.etiqueta}>
              <EnlacePerfil url={redes[red.clave]}>Ver perfil</EnlacePerfil>
            </Dato>
          ))}
        </dl>
      </section>
    </>
  )
}

export default PerfilAsesor
