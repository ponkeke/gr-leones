import './Hero.css'
import {
  MapPin,
  ChartNoAxesColumnIncreasing,
  Leaf,
  ShieldCheck
} from 'lucide-react'
import tituloHero from '../../assets/images/Encuentra-titulo.png'
import fondoLeon from '../../assets/images/fondo-leon.png'

function Hero() {
  return (
    <section className="hero">

      <div className="container hero-container">

        <img
          className="hero-leon"
          src={fondoLeon}
          alt=""
          aria-hidden="true"
        />

        <div className="hero-content">

          <div className="hero-title">
            <img
              src={tituloHero}
              alt="Invierte en el terreno que te vio nacer"
            />
          </div>

          <p className="hero-description">
            Lotes urbanos con alta proyección, plusvalía y oportunidades para
            construir tu futuro.
          </p>

          <div className="hero-buttons">

            <button className="primary-button">
              Ver proyectos <span>→</span>
            </button>

            <button className="secondary-button">
              Conoce más <span>→</span>
            </button>

          </div>
//
          <div className="hero-features">

            <div className="feature">
              <MapPin className="feature-icon" />

              <p>
                Ubicaciones
                <br />
                estratégicas
              </p>
            </div>

            <div className="feature">
              <ChartNoAxesColumnIncreasing className="feature-icon" />

              <p>
                Alta
                <br />
                plusvalía
              </p>
            </div>

            <div className="feature">
              <Leaf className="feature-icon" />

              <p>
                Entorno natural
                <br />
                y sostenible
              </p>
            </div>

            <div className="feature">
              <ShieldCheck className="feature-icon" />

              <p>
                Inversión
                <br />
                segura
              </p>
            </div>

          </div>
          


        </div>

      </div>

    </section>
  )
}

export default Hero