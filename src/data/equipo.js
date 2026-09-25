// EQUIPO DE GRUPO LEONES (datos mock). Lo muestra el carrusel de `pages/nosotros/Nosotros.jsx` y
// lo reutiliza el perfil del asesor en el área interna (`pages/asesor/PerfilAsesor.jsx`), que lo
// cruza por `id` con `./asesoresMock.js`. Es la única fuente de estos perfiles: no duplicarlos.
import asVen1 from '../assets/images/asVentas1.png'
import asVen2 from '../assets/images/asVentas2.png'
import asVen3 from '../assets/images/asVentas3.png'
import asVen4 from '../assets/images/asVentas4.png'
import drCom from '../assets/images/drComercial.png'

/*
  Datos del panel que aparece al pasar el mouse (o tocar) la tarjeta.

  Todavía NO existen en el proyecto, por eso están en null y el panel
  no muestra esas filas. Para completarlos, sobrescribe el campo en el
  integrante correspondiente (después del `...PERFIL_PENDIENTE`):

    descripcion:   'Texto de "Más sobre mí"'
    experiencia:   '+ 6 años'
    especialidad:  'Venta de lotes residenciales y comerciales'
    zona:          'Huancayo y alrededores'
    idiomas:       ['Español', 'Inglés básico']   (o un texto simple)
    redes: {                                       (solo las que existan;
      whatsapp:  'https://wa.me/51XXXXXXXXX',       enlaces completos)
      linkedin:  'https://www.linkedin.com/in/...',
      instagram: 'https://www.instagram.com/...',
      facebook:  'https://www.facebook.com/...',
      email:     'mailto:correo@dominio.com',
    }
    contacto:      'https://wa.me/51XXXXXXXXX'     (enlace del botón "Contáctame")
*/
export const PERFIL_PENDIENTE = {
  descripcion: null,
  experiencia: null,
  especialidad: null,
  zona: null,
  idiomas: null,
  redes: null,
  contacto: null,
}

export const integrantes = [
  {
    // TODO: reemplazar por la fotografía real del Director General
    id: 'director-general',
    nombre: 'Nombre del integrante',
    cargo: 'Director General',
    frase: 'Construimos confianza para crear grandes proyectos.',
    categoria: 'Directivos',
    imagen: '/images/equipo-director-general.jpg',
    
    descripcion: 'Lidera la estrategia comercial y el crecimiento de los proyectos inmobiliarios.',
    experiencia: '+ 8 años',
    especialidad: 'Gestión comercial inmobiliaria',
    zona: 'Huancayo y alrededores',
    idiomas: ['Español'],

    redes: {
      whatsapp: 'https://wa.me/51XXXXXXXXX',
      instagram: 'https://www.instagram.com/...',
      facebook: 'https://www.facebook.com/...',
      linkedin: 'https://www.linkedin.com/in/...',
      email: 'mailto:correo@dominio.com',
    },

    contacto: 'https://wa.me/51XXXXXXXXX',
  },
  {
    id: 'director-comercial',
    nombre: 'ALEX CRISTOBAL',
    cargo: 'Director Comercial',
    frase: 'Cada cliente merece un proyecto pensado a su medida.',
    categoria: 'Directivos',
    imagen: drCom,
    
        descripcion: 'Lidera la estrategia comercial y el crecimiento de los proyectos inmobiliarios.',
    experiencia: '+ 8 años',
    especialidad: 'Gestión comercial inmobiliaria',
    zona: 'Huancayo y alrededores',
    idiomas: ['Español'],

    redes: {
      whatsapp: 'https://wa.me/51XXXXXXXXX',
      instagram: 'https://www.instagram.com/...',
      facebook: 'https://www.facebook.com/...',
      linkedin: 'https://www.linkedin.com/in/...',
      email: 'mailto:correo@dominio.com',
    },

    contacto: 'https://wa.me/51XXXXXXXXX',
  },
  {
    id: 'asesora-ventas-1',
    nombre: 'ROMELY SCHIPPER',
    cargo: 'Asesora de ventas',
    frase: 'La planificación es la base de todo gran resultado.',
    categoria: 'Asesores',
    imagen: asVen1,
    
        descripcion: 'Lidera la estrategia comercial y el crecimiento de los proyectos inmobiliarios.',
    experiencia: '+ 8 años',
    especialidad: 'Gestión comercial inmobiliaria',
    zona: 'Huancayo y alrededores',
    idiomas: ['Español'],

    redes: {
      whatsapp: 'https://wa.me/51XXXXXXXXX',
      instagram: 'https://www.instagram.com/...',
      facebook: 'https://www.facebook.com/...',
      linkedin: 'https://www.linkedin.com/in/...',
      email: 'mailto:correo@dominio.com',
    },

    contacto: 'https://wa.me/51XXXXXXXXX',
  },
  {
    id: 'asesora-ventas-2',
    nombre: 'NAHOMY LIMAS',
    cargo: 'Asesora de ventas',
    frase: 'La planificación es la base de todo gran resultado.',
    categoria: 'Asesores',
    imagen: asVen2,
    
        descripcion: 'Lidera la estrategia comercial y el crecimiento de los proyectos inmobiliarios.',
    experiencia: '+ 8 años',
    especialidad: 'Gestión comercial inmobiliaria',
    zona: 'Huancayo y alrededores',
    idiomas: ['Español'],

    redes: {
      whatsapp: 'https://wa.me/51XXXXXXXXX',
      instagram: 'https://www.instagram.com/...',
      facebook: 'https://www.facebook.com/...',
      linkedin: 'https://www.linkedin.com/in/...',
      email: 'mailto:correo@dominio.com',
    },

    contacto: 'https://wa.me/51XXXXXXXXX',
  },
  {
    id: 'asesora-ventas-3',
    nombre: 'LUCERO BELTRÁN',
    cargo: 'Asesora de ventas',
    frase: 'La transparencia legal protege cada inversión.',
    categoria: 'Asesores',
    imagen: asVen3,
    
        descripcion: 'Lidera la estrategia comercial y el crecimiento de los proyectos inmobiliarios.',
    experiencia: '+ 8 años',
    especialidad: 'Gestión comercial inmobiliaria',
    zona: 'Huancayo y alrededores',
    idiomas: ['Español'],

    redes: {
      whatsapp: 'https://wa.me/51XXXXXXXXX',
      instagram: 'https://www.instagram.com/...',
      facebook: 'https://www.facebook.com/...',
      linkedin: 'https://www.linkedin.com/in/...',
      email: 'mailto:correo@dominio.com',
    },

    contacto: 'https://wa.me/51XXXXXXXXX',
  },
  {
    id: 'asesora-ventas-4',
    nombre: 'ALESSANDRA MERCADO',
    cargo: 'Asesora de ventas',
    frase: 'La transparencia legal protege cada inversión.',
    categoria: 'Asesores',
    imagen: asVen4,
    
        descripcion: 'Lidera la estrategia comercial y el crecimiento de los proyectos inmobiliarios.',
    experiencia: '+ 8 años',
    especialidad: 'Gestión comercial inmobiliaria',
    zona: 'Huancayo y alrededores',
    idiomas: ['Español'],

    redes: {
      whatsapp: 'https://wa.me/51XXXXXXXXX',
      instagram: 'https://www.instagram.com/...',
      facebook: 'https://www.facebook.com/...',
      linkedin: 'https://www.linkedin.com/in/...',
      email: 'mailto:correo@dominio.com',
    },

    contacto: 'https://wa.me/51XXXXXXXXX',
  },
  {
    // TODO: reemplazar por la fotografía real de la Gerencia de Administración
    id: 'gerente-administracion',
    nombre: 'Nombre del integrante',
    cargo: 'Gerente de Administración',
    frase: 'La organización interna sostiene el crecimiento del grupo.',
    categoria: 'Administración',
    imagen: '/images/equipo-gerente-administracion.jpg',
    
        descripcion: 'Lidera la estrategia comercial y el crecimiento de los proyectos inmobiliarios.',
    experiencia: '+ 8 años',
    especialidad: 'Gestión comercial inmobiliaria',
    zona: 'Huancayo y alrededores',
    idiomas: ['Español'],

    redes: {
      whatsapp: 'https://wa.me/51XXXXXXXXX',
      instagram: 'https://www.instagram.com/...',
      facebook: 'https://www.facebook.com/...',
      linkedin: 'https://www.linkedin.com/in/...',
      email: 'mailto:correo@dominio.com',
    },

    contacto: 'https://wa.me/51XXXXXXXXX',
  },
]

export function getIntegranteById(id) {
  return integrantes.find((integrante) => integrante.id === id) ?? null
}
