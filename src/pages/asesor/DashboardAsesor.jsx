import { BadgeCheck, CalendarClock, ClipboardList, FileText, Handshake, Users } from 'lucide-react'
import { useAreaInterna } from '../../components/areaInterna/contexto'
import { useDatos } from '../../components/areaInterna/useDatos'
import { EncabezadoPagina, EstadoCarga, Indicador, Vacio } from '../../components/areaInterna/Partes'
import { primerNombre, textoLote, textoProyecto } from '../../components/areaInterna/formatoPanel'
import { getResumenAsesor } from '../../services/api'
import { formatearFecha } from '../../utils/formato'

function DashboardAsesor() {
  const { usuario } = useAreaInterna()
  const { datos, estado, error } = useDatos(`resumen-asesor-${usuario.id}`, () => getResumenAsesor(usuario.id))

  const encabezado = (
    <EncabezadoPagina
      titulo={`Hola, ${primerNombre(usuario.nombre)}`}
      subtitulo="Resumen de tu cartera. Las cifras se calculan con datos de demostración y no son indicadores reales de la empresa."
    />
  )

  if (estado !== 'listo') {
    return (
      <>
        {encabezado}
        <EstadoCarga estado={estado} error={error} />
      </>
    )
  }

  const { indicadores, actividad } = datos

  return (
    <>
      {encabezado}

      <div className="panel-rejilla">
        <Indicador icono={Users} etiqueta="Clientes asignados" valor={indicadores.clientes} a="/asesor/clientes" />
        <Indicador icono={ClipboardList} etiqueta="Solicitudes pendientes" valor={indicadores.solicitudesPendientes} a="/asesor/solicitudes" />
        <Indicador icono={CalendarClock} etiqueta="Visitas programadas" valor={indicadores.visitasProgramadas} a="/asesor/agenda" />
        <Indicador icono={FileText} etiqueta="Cotizaciones" valor={indicadores.cotizaciones} />
        <Indicador icono={Handshake} etiqueta="Separaciones" valor={indicadores.separaciones} />
        <Indicador icono={BadgeCheck} etiqueta="Ventas" valor={indicadores.ventas} a="/asesor/seguimiento" />
      </div>

      <section className="panel-seccion">
        <h2 className="panel-seccion-titulo">Actividad reciente</h2>
        {actividad.length === 0 ? (
          <Vacio texto="Sin actividad reciente." />
        ) : (
          <section className="panel-tarjeta">
            <ol className="panel-linea">
              {actividad.map((item) => (
                <li key={item.id} className="panel-linea-item">
                  <time className="panel-linea-fecha" dateTime={item.fecha}>{formatearFecha(item.fecha)}</time>
                  <div className="panel-linea-cuerpo">
                    <p className="panel-linea-titulo">{item.titulo}</p>
                    <p className="panel-linea-detalle">
                      {item.cliente?.nombre ?? 'Cliente'} · {textoProyecto(item)} · {textoLote(item)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </section>
    </>
  )
}

export default DashboardAsesor
