
import './Proyectospage.css'
import terreno1 from '../../assets/images/terreno1.png'
import {
  MapPin,
  Grid2X2,
  House,
} from 'lucide-react'
const proyectos = [
  {
    nombre: 'URBANIZACIÓN VELAMAR',
    ubicacion: 'Huancayo',
    estado: 'Nueva etapa',
    area: '90 m²',
    precio: 'S/ 78,412',
    imagen: terreno1,
  },
  {
    nombre: 'LOS SAUCES',
    ubicacion: 'Pilcomayo',
    estado: 'Entrega inmediata',
    area: '100 m²',
    precio: 'S/ 85,000',
    imagen: terreno1,
  },
  {
    nombre: 'VALLE DEL SOL',
    ubicacion: 'El Tambo',
    estado: 'Últimos lotes',
    area: '120 m²',
    precio: 'S/ 92,000',
    imagen: terreno1,
  },
  {
    nombre: 'LOS PORTALES',
    ubicacion: 'Huancayo',
    estado: 'Próximo lanzamiento',
    area: '90 m²',
    precio: 'S/ 80,000',
    imagen: terreno1,
  },
  {
    nombre: 'VALLE VERDE',
    ubicacion: 'Pilcomayo',
    estado: 'En preventa',
    area: '100 m²',
    precio: 'S/ 88,000',
    imagen: terreno1,
  },
  {
    nombre: 'RESIDENCIAL LEONES',
    ubicacion: 'Chilca',
    estado: 'Entrega inmediata',
    area: '120 m²',
    precio: 'S/ 95,000',
    imagen: terreno1,
  },
]

function ProyectosPage() {
  return (
    <section className="proyectos-page">
      <div className="proyectos-page-contenido">

        {/* Encabezado */}
        <div className="proyectos-intro">
          <div>
            <h1>
              ENCUENTRA TU
              <span> PRÓXIMO TERRENO</span>
            </h1>

            <p className="proyectos-descripcion">
              Descubre nuestros proyectos pensados
              <br />
              para construir tu futuro.
            </p>
          </div>

          <div className="proyectos-frase">
            <span>Más</span>
            <span>que terrenos,</span>
            <span>hogares</span>
          </div>
        </div>

        {/* Indicadores */}
         <div className="proyectos-indicadores">
              <div className="indicador">
                <MapPin className="indicador-icono" />

                <div>
                  <strong>4</strong>
                  <span>Ubicaciones</span>
                </div>
              </div>

              <div className="indicador">
                <Grid2X2 className="indicador-icono" />

                <div>
                  <strong>+500</strong>
                  <span>Lotes disponibles</span>
                </div>
              </div>

              <div className="indicador">
                <House className="indicador-icono" />

                <div>
                  <strong>12</strong>
                  <span>Proyectos</span>
                </div>
              </div>
          </div>

        {/* Filtros y búsqueda */}
        <div className="proyectos-panel">
          <div className="proyectos-filtros">
            <button className="filtro-activo">Todos</button>
            <button>Huancayo</button>
            <button>Pilcomayo</button>
            <button>El Tambo</button>
            <button>Chilca</button>
          </div>

          <div className="proyectos-formulario">
            <div className="proyectos-input">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Buscar un proyecto o ubicación..."
              />
            </div>

            <select defaultValue="">
              <option value="" disabled>
                Área del lote
              </option>
              <option>90 m²</option>
              <option>100 m²</option>
              <option>120 m²</option>
            </select>

            <select defaultValue="">
              <option value="" disabled>
                Rango de precio
              </option>
              <option>Menos de S/ 80,000</option>
              <option>S/ 80,000 - S/ 90,000</option>
              <option>Más de S/ 90,000</option>
            </select>

            <select defaultValue="">
              <option value="" disabled>
                Estado
              </option>
              <option>Nueva etapa</option>
              <option>Entrega inmediata</option>
              <option>En preventa</option>
            </select>

            <button className="btn-buscar">
              Buscar <span>→</span>
            </button>
          </div>
        </div>

        {/* Título de resultados */}
        <div className="proyectos-resultados">
          <strong>12 proyectos encontrados</strong>

          <select defaultValue="recientes">
            <option value="recientes">☷ Ordenar por Más recientes</option>
            <option value="precio-menor">Precio menor</option>
            <option value="precio-mayor">Precio mayor</option>
          </select>
        </div>

        {/* Tarjetas */}
        <div className="proyectos-grid">
          {proyectos.map((proyecto, index) => (
            <article className="proyecto-card" key={index}>
              <div className="proyecto-imagen">
                <img src={proyecto.imagen} alt={proyecto.nombre} />

                <span className="proyecto-estado">
                  {proyecto.estado}
                </span>

                <button className="proyecto-favorito" aria-label="Agregar a favoritos">
                  ♡
                </button>
              </div>

              <div className="proyecto-info">
                <h2>{proyecto.nombre}</h2>

                <p className="proyecto-ubicacion">
                   {proyecto.ubicacion}
                </p>

                <div className="proyecto-detalles">
                  <div>
                    <small>Área desde</small>
                    <strong>{proyecto.area}</strong>
                  </div>

                  <div>
                    <small>Precio desde</small>
                    <strong>{proyecto.precio}</strong>
                  </div>

                  <div>
                    <small>Tipo</small>
                    <strong>Residencial</strong>
                  </div>
                </div>

                <p className="proyecto-descripcion">
                  Un entorno moderno y seguro, ideal para construir
                  tu futuro hogar.
                </p>

                <div className="proyecto-acciones">
                  <button className="btn-detalles">
                    Ver más detalles →
                  </button>

                  <button className="btn-proyecto">
                    Ver proyecto <span>→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}


export default ProyectosPage