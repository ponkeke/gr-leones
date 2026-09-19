import './Footer.css'

import peru from '../../assets/images/peru.png'

// Datos de contacto. `confirmado: false` los muestra como texto; al pasar a `true` se
// vuelven enlaces (tel: / mailto:) generados con el mismo valor. Ponlos en `true` solo
// cuando los datos sean los definitivos. WhatsApp no está definido: no se muestra.
const CONTACTO = {
  direccion: 'Huancayo, Junín - Perú',
  telefono: { texto: '+51 925 281 766', confirmado: false },
  correo: { texto: 'contacto@leones.com', confirmado: false },
}

// PENDIENTE: ruta o URL de la página de "Términos y condiciones" (aún no existe).
// Con un valor, el texto del pie se convierte en enlace.
const URL_TERMINOS = null

// Devuelve el href (o null si el dato aún no está confirmado).
const hrefTelefono = ({ texto, confirmado }) =>
  confirmado ? `tel:${texto.replace(/[^\d+]/g, '')}` : null

const hrefCorreo = ({ texto, confirmado }) =>
  confirmado ? `mailto:${texto}` : null

function Footer() {
  const enlaceTelefono = hrefTelefono(CONTACTO.telefono)
  const enlaceCorreo = hrefCorreo(CONTACTO.correo)

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

          <p>📍 {CONTACTO.direccion}</p>

          <p>
            📞{' '}
            {enlaceTelefono ? (
              <a href={enlaceTelefono}>{CONTACTO.telefono.texto}</a>
            ) : (
              CONTACTO.telefono.texto
            )}
          </p>

          <p>
            ✉{' '}
            {enlaceCorreo ? (
              <a href={enlaceCorreo}>{CONTACTO.correo.texto}</a>
            ) : (
              CONTACTO.correo.texto
            )}
          </p>

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
            {URL_TERMINOS ? (
              <a href={URL_TERMINOS}>Términos y condiciones</a>
            ) : (
              'Términos y condiciones'
            )}
          </p>

        </div>

      </div>

    </footer>
  )
}

export default Footer
