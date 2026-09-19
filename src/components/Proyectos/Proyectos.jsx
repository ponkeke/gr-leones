import { useEffect, useState } from 'react'
import './Proyectos.css'

import tituloProyectos from '../../assets/images/E-terreno.png'
import leon from '../../assets/images/chat.png'
import { getProyectos } from '../../services/api'
import { formatearPrecio } from '../../utils/formato'

const MAX_DESTACADOS = 4

function Proyectos() {
  const [destacados, setDestacados] = useState([])

  useEffect(() => {
    let cancelado = false
    getProyectos()
      .then((data) => {
        if (!cancelado) setDestacados(data.slice(0, MAX_DESTACADOS))
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <section className="proyectos" id="proyectos">

      <div className="container proyectos-container">

        <div className="proyectos-left">

          <img
            className="proyectos-title"
            src={tituloProyectos}
            alt="Encuentra tu próximo terreno"
          />

          <p className="proyectos-description">
            Lotes en una ubicación estratégica para construir tu futuro.
            <br />
            Conoce disponibilidad, metraje, precio y beneficios.
          </p>

          <div className="proyectos-leon">
            <img src={leon} alt="León" />
          </div>

        </div>

        <div className="proyectos-right">

          <h2>PROYECTOS DESTACADOS</h2>

          <div className="proyectos-list">
            {destacados.map((item) => (
              <a
                key={item.id}
                className="proyecto-destacado-item"
                href={`/detalle-proyecto?id=${item.id}`}
              >
                <span className="proyecto-destacado-nombre">{item.nombre}</span>
                <span className="proyecto-destacado-ubicacion">
                  {item.lotesDisponibles} disponibles
                </span>
                <span className="proyecto-destacado-precio">
                  {item.precioDesde === null ? 'Precio por confirmar' : `Desde ${formatearPrecio(item.precioDesde)}`}
                </span>
              </a>
            ))}
          </div>

          <button
            className="proyectos-button"
            onClick={() => { window.location.href = '/proyectospage' }}
          >
            Elegir mi lote →
          </button>

        </div>

      </div>

    </section>
  )
}

export default Proyectos