import './Footer.css'

import peru from '../../assets/images/peru.png'

function Footer() {
  return (
    <footer id="contacto" className="footer">

      <div className="container footer-container">

        {/* MARCA */}
        <div className="footer-brand">

          <h2>LEONES</h2>

          <span>GRUPO INMOBILIARIO</span>

          <p>
            Construimos oportunidades
            para tu futuro.
          </p>

        </div>


        {/* NAVEGACIÓN */}
        <div className="footer-column">

          <h3>Navegación</h3>

          <a href="/inicio">Inicio</a>

          <a href="/proyectospage">
            Proyectos
          </a>

          <a href="/lotes">
            Lotes
          </a>

          <a href="/nosotros">
            Nosotros
          </a>

        </div>


        {/* INFORMACIÓN */}
        <div className="footer-column">

          <h3>Información</h3>

          <a href="/comunicados">
            Comunicados
          </a>

          <a href="/promociones">
            Promociones
          </a>

          <a href="#contacto">
            Contacto
          </a>

        </div>


        {/* CONTACTO */}
        <div className="footer-contact">

          <h3>Contáctanos</h3>

          <p>📍 Huancayo, Junín - Perú</p>

          <p>📞 +51 999 999 999</p>

          <p>✉ contacto@leones.com</p>

        </div>


        {/* PERÚ */}
        <div className="footer-peru">

          <img
            src={peru}
            alt="Mapa del Perú"
          />

        </div>

      </div>


      {/* FOOTER INFERIOR */}

      <div className="footer-bottom">

        <div className="container footer-bottom-container">

          <p>
            © 2026 Grupo Inmobiliario Leones.
            Todos los derechos reservados.
          </p>

          <p>
            Términos y condiciones
          </p>

        </div>

      </div>

    </footer>
  )
}

export default Footer
