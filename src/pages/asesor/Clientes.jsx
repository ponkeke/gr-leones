import { useState } from 'react'
import { Phone } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, Enlace, EstadoCarga, Insignia, Tabla } from '../../components/areaInterna/Partes'
import { textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getCarteraDeAsesor } from '../../services/api'
import { ETAPAS_CLIENTE, buscarEstado } from '../../data/procesoComercial'
import { formatearFecha } from '../../utils/formato'

const COLUMNAS = [
  {
    titulo: 'Cliente',
    render: (r) => (
      <span>
        {r.cliente?.nombre ?? '—'}
        <span className="panel-texto-secundario">{r.cliente?.codigo}</span>
      </span>
    ),
  },
  { titulo: 'Teléfono', render: (r) => r.cliente?.telefono ?? '—' },
  { titulo: 'Proyecto', render: (r) => textoProyecto(r.lotes[0]) },
  { titulo: 'Lote de interés', render: (r) => (r.lotes.length ? r.lotes.map(textoLote).join(', ') : '—') },
  { titulo: 'Estado', render: (r) => <Insignia estado={buscarEstado(ETAPAS_CLIENTE, r.etapa)} /> },
  { titulo: 'Última interacción', render: (r) => formatearFecha(r.ultimaInteraccion) },
  {
    titulo: 'Acciones',
    render: (r) => (
      <span className="panel-acciones">
        <Enlace a={`/asesor/seguimiento?cliente=${r.clienteId}`} className="panel-boton-secundario">
          Ver seguimiento
        </Enlace>
        {r.cliente?.telefono && (
          <a className="panel-boton-secundario" href={`tel:+51${r.cliente.telefono}`} aria-label={`Llamar a ${r.cliente.nombre}`}>
            <Phone size={14} aria-hidden="true" />
          </a>
        )}
      </span>
    ),
  },
]

function Clientes() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`cartera-${usuario.id}`, () => getCarteraDeAsesor(usuario.id))
  const [busqueda, setBusqueda] = useState('')
  const [filtroEtapa, setFiltroEtapa] = useState('')

  const texto = busqueda.trim().toLowerCase()
  const filas = (datos ?? []).filter(
    (r) =>
      (!filtroEtapa || r.etapa === filtroEtapa) &&
      (!texto || `${r.cliente?.nombre} ${r.cliente?.codigo} ${r.cliente?.telefono}`.toLowerCase().includes(texto)),
  )

  return (
    <>
      <EncabezadoPagina titulo="Clientes" subtitulo="Clientes asignados a ti y en qué etapa se encuentran." />

      <div className="panel-formulario panel-filtros">
        <label className="panel-campo">
          Buscar
          <input type="search" placeholder="Nombre, código o teléfono" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>
        <label className="panel-campo">
          Estado
          <select value={filtroEtapa} onChange={(e) => setFiltroEtapa(e.target.value)}>
            <option value="">Todos</option>
            {ETAPAS_CLIENTE.map((etapa) => (
              <option key={etapa.value} value={etapa.value}>{etapa.label}</option>
            ))}
          </select>
        </label>
      </div>

      {estado === 'listo' ? (
        <Tabla columnas={COLUMNAS} filas={filas} vacio="No hay clientes que coincidan con el filtro." />
      ) : (
        <EstadoCarga estado={estado} error={error} />
      )}
    </>
  )
}

export default Clientes
