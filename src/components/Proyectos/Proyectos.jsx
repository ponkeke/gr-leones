import './Proyectos.css'

import tituloProyectos from '../../assets/images/E-terreno.png'
import leon from '../../assets/images/chat.png'

function Proyectos() {
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
            {/* Aquí después irán los proyectos de la base de datos */}
          </div>

          <button className="proyectos-button">
            Elegir mi lote →
          </button>

        </div>

      </div>

    </section>
  )
}

export default Proyectos