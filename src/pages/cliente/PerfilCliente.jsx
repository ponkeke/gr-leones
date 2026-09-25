import { useState } from 'react'
import { Pencil, Save } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Dato, EncabezadoPagina, EstadoCarga } from '../../components/areaInterna/Partes'
import { actualizarPerfilCliente, getCliente } from '../../services/api'
import { actualizarSesion } from '../../utils/authMock'

function PerfilCliente() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`cliente-${usuario.id}`, () => getCliente(usuario.id))

  if (estado !== 'listo') return <EstadoCarga estado={estado} error={error} />
  return <FichaCliente clienteInicial={datos} />
}

function FichaCliente({ clienteInicial }) {
  const { refrescarSesion } = useAreaInterna()
  const [cliente, setCliente] = useState(clienteInicial)
  const [editando, setEditando] = useState(false)
  const [formulario, setFormulario] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'exito' | 'error', texto }

  const empezarEdicion = () => {
    setFormulario({ nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email ?? '' })
    setMensaje(null)
    setEditando(true)
  }

  const cambiar = (campo) => (evento) => setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))

  const guardar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setMensaje(null)
    try {
      const actualizado = await actualizarPerfilCliente(cliente.id, formulario)
      setCliente(actualizado)
      actualizarSesion({ nombre: actualizado.nombre })
      refrescarSesion()
      setEditando(false)
      setMensaje({ tipo: 'exito', texto: 'Cambios guardados solo en este navegador (demostración).' })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <EncabezadoPagina titulo="Mi perfil" subtitulo="Tus datos de contacto como cliente de Grupo Leones.">
        {!editando && (
          <button type="button" className="btn-buscar panel-boton" onClick={empezarEdicion}>
            <Pencil size={15} aria-hidden="true" /> Editar perfil
          </button>
        )}
      </EncabezadoPagina>

      <section className="panel-tarjeta">
        {editando ? (
          <form className="panel-formulario" onSubmit={guardar} noValidate>
            <label className="panel-campo">
              Nombre completo
              <input required value={formulario.nombre} onChange={cambiar('nombre')} autoComplete="name" />
            </label>
            <label className="panel-campo">
              Teléfono
              <input
                required
                inputMode="numeric"
                maxLength={9}
                value={formulario.telefono}
                onChange={cambiar('telefono')}
                autoComplete="tel"
              />
            </label>
            <label className="panel-campo">
              Correo
              <input type="email" value={formulario.email} onChange={cambiar('email')} autoComplete="email" />
            </label>
            <label className="panel-campo">
              DNI
              <input value={cliente.dni} disabled />
            </label>
            <label className="panel-campo">
              Código de cliente
              <input value={cliente.codigo} disabled />
            </label>

            {mensaje?.tipo === 'error' && <p className="panel-error" role="alert">{mensaje.texto}</p>}

            <div className="panel-formulario-acciones">
              <button type="submit" className="btn-buscar panel-boton" disabled={guardando}>
                <Save size={15} aria-hidden="true" /> {guardando ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button type="button" className="panel-boton-secundario" onClick={() => setEditando(false)} disabled={guardando}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <dl className="panel-datos">
            <Dato etiqueta="Nombre">{cliente.nombre}</Dato>
            <Dato etiqueta="DNI">{cliente.dni}</Dato>
            <Dato etiqueta="Teléfono">{cliente.telefono}</Dato>
            <Dato etiqueta="Correo">{cliente.email || <span className="panel-pendiente">Sin registrar</span>}</Dato>
            <Dato etiqueta="Código de cliente">{cliente.codigo}</Dato>
          </dl>
        )}

        {mensaje?.tipo === 'exito' && <p className="panel-exito" role="status">{mensaje.texto}</p>}
      </section>
    </>
  )
}

export default PerfilCliente
