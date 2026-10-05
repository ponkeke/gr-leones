import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import Modal from '../../components/Modal/Modal'
import { useDatos } from '../../components/areaInterna/useDatos'
import { Dato, EncabezadoPagina, EstadoCarga, Insignia, InsigniaLote, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { crearCliente, getAsesores, getClientesAdmin, reasignarCliente, registrarSeparacion } from '../../services/api'
import { ESTADOS_CUENTA, ETAPAS_CLIENTE, RELACIONES_LOTE, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

async function cargar() {
  const [clientes, asesores] = await Promise.all([getClientesAdmin(), getAsesores()])
  return { clientes, asesores }
}

const SUBTITULO = 'Da de alta clientes o selecciona uno para reasignar su asesor o registrar la separación de un lote.'

function ClientesAdmin() {
  const { datos, estado, error } = useDatos('clientes-admin', cargar)

  if (estado !== 'listo') {
    return (
      <>
        <EncabezadoPagina titulo="Clientes" subtitulo={SUBTITULO} />
        <EstadoCarga estado={estado} error={error} />
      </>
    )
  }
  return <ListaClientes inicial={datos} />
}

function ListaClientes({ inicial }) {
  const [clientes, setClientes] = useState(inicial.clientes)
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [creando, setCreando] = useState(false)
  const seleccionado = clientes.find((c) => c.id === seleccionadoId) ?? null

  // Tras reasignar o separar se vuelve a pedir la lista: así todo sale del almacén mock.
  const recargar = async () => setClientes(await getClientesAdmin())

  const columnas = [
    { titulo: 'Código', render: (c) => c.codigo },
    { titulo: 'Nombre', render: (c) => c.nombre },
    { titulo: 'Teléfono', render: (c) => c.telefono ?? '—' },
    { titulo: 'Correo', render: (c) => c.email || '—' },
    { titulo: 'Asesor asignado', render: (c) => c.asesor?.nombre ?? 'Sin asesor' },
    { titulo: 'Etapa comercial', render: (c) => <Insignia estado={buscarEstado(ETAPAS_CLIENTE, c.etapa)} /> },
    { titulo: 'Cuenta', render: (c) => <Insignia estado={buscarEstado(ESTADOS_CUENTA, c.cuenta)} /> },
    {
      titulo: 'Acción',
      render: (c) => (
        <button type="button" className="panel-boton-secundario" onClick={() => setSeleccionadoId(c.id)}>
          Gestionar
        </button>
      ),
    },
  ]

  return (
    <>
      <EncabezadoPagina titulo="Clientes" subtitulo={SUBTITULO}>
        <button type="button" className="btn-buscar panel-boton" onClick={() => setCreando(true)}>
          <UserPlus size={15} aria-hidden="true" /> Nuevo cliente
        </button>
      </EncabezadoPagina>
      <Tabla columnas={columnas} filas={clientes} vacio="No hay clientes registrados." />
      {creando && <NuevoCliente asesores={inicial.asesores} onCreado={recargar} onCerrar={() => setCreando(false)} />}
      {seleccionado && (
        <FichaCliente
          key={seleccionado.id}
          cliente={seleccionado}
          asesores={inicial.asesores}
          onCambio={recargar}
          onCerrar={() => setSeleccionadoId(null)}
        />
      )}
    </>
  )
}

function FichaCliente({ cliente, asesores, onCambio, onCerrar }) {
  const [nuevoAsesorId, setNuevoAsesorId] = useState('')
  // Acción esperando confirmación: { tipo: 'reasignar' } | { tipo: 'separar', fila } | null
  const [confirmando, setConfirmando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'exito' | 'error', texto }

  const nuevoAsesor = asesores.find((a) => a.id === nuevoAsesorId)
  const otrosAsesores = asesores.filter((a) => a.id !== cliente.asesorId)

  const ejecutar = async (accion, textoExito) => {
    setGuardando(true)
    setMensaje(null)
    try {
      await accion()
      await onCambio()
      setMensaje({ tipo: 'exito', texto: textoExito })
      setNuevoAsesorId('')
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message })
    } finally {
      setGuardando(false)
      setConfirmando(null)
    }
  }

  const confirmar = () => {
    if (confirmando?.tipo === 'reasignar') {
      ejecutar(() => reasignarCliente(cliente.id, nuevoAsesorId), `${cliente.nombre} ahora está a cargo de ${nuevoAsesor?.nombre}.`)
    } else if (confirmando?.tipo === 'separar') {
      const { fila } = confirmando
      ejecutar(
        () => registrarSeparacion(cliente.id, fila.loteCodigo),
        `Separación registrada: ${textoProyecto(fila)} · ${textoLote(fila)}.`,
      )
    }
  }

  const columnasLotes = [
    { titulo: 'Proyecto', render: textoProyecto },
    { titulo: 'Lote', render: textoLote },
    { titulo: 'Disponibilidad', render: (f) => <InsigniaLote estado={f.lote?.estado} /> },
    { titulo: 'Relación', render: (f) => <Insignia estado={buscarEstado(RELACIONES_LOTE, f.relacion)} /> },
    {
      titulo: 'Acción',
      render: (f) => {
        if (f.relacion === 'SEPARADO') {
          return (
            <span className="panel-texto-secundario">
              Separado el {formatearFecha(f.separacion.fecha)} por {f.separacion.registradoPor.nombre}
            </span>
          )
        }
        if (f.lote?.estado !== 'DISPONIBLE') return <span className="panel-texto-secundario">No disponible</span>
        return (
          <button
            type="button"
            className="panel-boton-secundario"
            disabled={guardando || confirmando !== null}
            onClick={() => {
              setMensaje(null)
              setConfirmando({ tipo: 'separar', fila: f })
            }}
          >
            Registrar separación
          </button>
        )
      },
    },
  ]

  return (
    <Modal
      titulo={cliente.nombre}
      descripcion={`${cliente.codigo} · Etapa: ${buscarEstado(ETAPAS_CLIENTE, cliente.etapa).label}`}
      onCerrar={onCerrar}
      tamano="grande"
      className="panel-modal"
    >
      <dl className="panel-datos">
        <Dato etiqueta="Teléfono">{cliente.telefono ?? '—'}</Dato>
        <Dato etiqueta="Correo">{cliente.email || '—'}</Dato>
        <Dato etiqueta="DNI">{cliente.dni ?? '—'}</Dato>
        <Dato etiqueta="Asesor asignado">{cliente.asesor?.nombre ?? 'Sin asesor'}</Dato>
        <Dato etiqueta="Cuenta"><Insignia estado={buscarEstado(ESTADOS_CUENTA, cliente.cuenta)} /></Dato>
      </dl>
      {cliente.cuenta === 'PENDIENTE' && (
        <p className="panel-texto-secundario">
          Entrega al cliente su código <strong>{cliente.codigo}</strong>: lo usará en “Activar mi cuenta”, en el acceso de clientes.
        </p>
      )}

      <section className="panel-seccion">
        <h3 className="panel-seccion-titulo">Reasignar asesor</h3>
        <div className="panel-formulario panel-filtros">
          <label className="panel-campo">
            Nuevo asesor
            <select
              value={nuevoAsesorId}
              disabled={guardando || confirmando !== null}
              onChange={(e) => {
                setNuevoAsesorId(e.target.value)
                setMensaje(null)
              }}
            >
              <option value="">Elige un asesor</option>
              {otrosAsesores.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </label>
          <div className="panel-formulario-acciones">
            <button
              type="button"
              className="btn-buscar panel-boton"
              disabled={!nuevoAsesorId || guardando || confirmando !== null}
              onClick={() => setConfirmando({ tipo: 'reasignar' })}
            >
              Reasignar
            </button>
          </div>
        </div>
      </section>

      <section className="panel-seccion">
        <h3 className="panel-seccion-titulo">Lotes del cliente</h3>
        <Tabla
          columnas={columnasLotes}
          filas={cliente.lotes}
          claveFila={(f) => f.loteCodigo}
          vacio="Este cliente todavía no tiene lotes de interés."
        />
      </section>

      {confirmando && (
        <section className="panel-seccion panel-tarjeta panel-no-leida" role="alertdialog" aria-label="Confirmar acción">
          <h3 className="panel-seccion-titulo">
            {confirmando.tipo === 'reasignar' ? 'Confirmar reasignación' : 'Confirmar separación'}
          </h3>
          {confirmando.tipo === 'reasignar' ? (
            <p className="panel-linea-detalle">
              {cliente.nombre} pasará de <strong>{cliente.asesor?.nombre ?? 'sin asesor'}</strong> a{' '}
              <strong>{nuevoAsesor?.nombre}</strong>. Su seguimiento comercial pasa al nuevo asesor; ambos asesores y el
              cliente recibirán un aviso.
            </p>
          ) : (
            <dl className="panel-datos">
              <Dato etiqueta="Cliente">{cliente.nombre}</Dato>
              <Dato etiqueta="Proyecto">{textoProyecto(confirmando.fila)}</Dato>
              <Dato etiqueta="Lote">{textoLote(confirmando.fila)}</Dato>
              <Dato etiqueta="Asesor">{cliente.asesor?.nombre ?? '—'}</Dato>
            </dl>
          )}
          {confirmando.tipo === 'separar' && (
            <p className="panel-texto-secundario">
              El lote pasará de “De interés” a “Separado” y dejará de estar disponible en el sitio.
            </p>
          )}
          <div className="panel-formulario-acciones">
            <button type="button" className="btn-buscar panel-boton" disabled={guardando} onClick={confirmar}>
              {guardando ? 'Guardando…' : 'Confirmar'}
            </button>
            <button type="button" className="panel-boton-secundario" disabled={guardando} onClick={() => setConfirmando(null)}>
              Cancelar
            </button>
          </div>
        </section>
      )}

      {mensaje && (
        <p className={mensaje.tipo === 'exito' ? 'panel-exito' : 'panel-error'} role={mensaje.tipo === 'exito' ? 'status' : 'alert'}>
          {mensaje.texto}
        </p>
      )}
    </Modal>
  )
}

const CAMPOS_NUEVO_CLIENTE = { nombre: '', dni: '', telefono: '', email: '', asesorId: '' }

/**
 * Alta de cliente por administración: solo los datos que usa el modelo actual (nombre, DNI,
 * teléfono, correo opcional y asesor). El código se genera solo (CLI + correlativo) y la cuenta
 * queda pendiente hasta que el cliente la active.
 */
function NuevoCliente({ asesores, onCreado, onCerrar }) {
  const [datos, setDatos] = useState(CAMPOS_NUEVO_CLIENTE)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [creado, setCreado] = useState(null)

  const cambiar = (campo) => (evento) => {
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }))
    setError(null)
  }

  const guardar = async (evento) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      const cliente = await crearCliente(datos)
      await onCreado()
      setCreado(cliente)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const hayCambios = Object.keys(CAMPOS_NUEVO_CLIENTE).some((c) => datos[c] !== CAMPOS_NUEVO_CLIENTE[c])

  if (creado) {
    return (
      <Modal titulo="Cliente dado de alta" descripcion={creado.nombre} onCerrar={onCerrar} className="panel-modal">
        <dl className="panel-datos">
          <Dato etiqueta="Código de cliente"><strong>{creado.codigo}</strong></Dato>
          <Dato etiqueta="Asesor asignado">{creado.asesor?.nombre ?? '—'}</Dato>
          <Dato etiqueta="Cuenta"><Insignia estado={buscarEstado(ESTADOS_CUENTA, creado.cuenta)} /></Dato>
        </dl>
        <p className="panel-exito" role="status">
          Entrega el código {creado.codigo} al cliente. Con ese código y su DNI activará su cuenta en “Activar mi cuenta”.
        </p>
        <div className="panel-formulario-acciones">
          <button type="button" className="btn-buscar panel-boton" onClick={onCerrar}>Listo</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      titulo="Nuevo cliente"
      descripcion="El código de cliente se asigna automáticamente al guardar."
      onCerrar={onCerrar}
      cerrarAlClicFuera={!hayCambios}
      className="panel-modal"
    >
      <form className="panel-formulario" onSubmit={guardar} noValidate>
        <label className="panel-campo panel-campo-ancho">
          Nombre completo
          <input required value={datos.nombre} onChange={cambiar('nombre')} autoComplete="off" />
        </label>
        <label className="panel-campo">
          DNI
          <input required inputMode="numeric" maxLength={8} value={datos.dni} onChange={cambiar('dni')} />
        </label>
        <label className="panel-campo">
          Teléfono
          <input required inputMode="numeric" maxLength={9} value={datos.telefono} onChange={cambiar('telefono')} />
        </label>
        <label className="panel-campo">
          Correo (opcional)
          <input type="email" value={datos.email} onChange={cambiar('email')} />
        </label>
        <label className="panel-campo">
          Asesor asignado
          <select required value={datos.asesorId} onChange={cambiar('asesorId')}>
            <option value="">Elige un asesor</option>
            {asesores.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </label>

        {error && <p className="panel-error" role="alert">{error}</p>}

        <div className="panel-formulario-acciones">
          <button type="submit" className="btn-buscar panel-boton" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Dar de alta'}
          </button>
          <button type="button" className="panel-boton-secundario" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ClientesAdmin
