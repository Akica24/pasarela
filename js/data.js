/**
 * data.js
 * ----------------------------------------------------------------------------
 * Datos estáticos complementarios al catálogo: categorías para la home,
 * testimonios, ubicaciones (departamentos/ciudades) para el checkout y
 * enlaces de navegación. Al igual que products.js, queda aislado para poder
 * sustituirse por una API.
 * ----------------------------------------------------------------------------
 */

/* ---------------------------------------------------------------------------
 * Categorías mostradas en la página de inicio. El campo `type` determina la
 * silueta usada por image.js para ilustrar la categoría.
 * --------------------------------------------------------------------------- */
export const CATEGORIES = [
  { slug: "deportivos", name: "Deportivos", description: "Rendimiento y comodidad para correr y entrenar.", type: "deportivos", icon: "👟" },
  { slug: "urbanos", name: "Urbanos", description: "Estilo cotidiano con actitud deportiva.", type: "urbanos", icon: "🏙️" },
  { slug: "casuales", name: "Casuales", description: "Versátiles que combinan con todo tu outfits.", type: "casuales", icon: "🧦" },
  { slug: "formales", name: "Formales", description: "Elegancia para la oficina y ocasiones especiales.", type: "formales", icon: "🤵" },
  { slug: "botas", name: "Botas", description: "Resistentes y duraderas para toda ocasión.", type: "botas", icon: "🥾" },
  { slug: "tacones", name: "Tacones", description: "Diseños que realzan tu estilo.", type: "tacones", icon: "👠" },
  { slug: "sandalias", name: "Sandalias", description: "Ligereza y frescura para el calor.", type: "sandalias", icon: "🩴" },
];

/* ---------------------------------------------------------------------------
 * Marcas disponibles (para la sección de marcas en la home). Se muestran como
 * texto-marca con estilo propio en lugar de logos externos.
 * --------------------------------------------------------------------------- */
export const BRANDS = [
  "Nike",
  "Adidas",
  "Puma",
  "New Balance",
  "Vans",
  "Converse",
  "Reebok",
  "Clarks",
  "Timberland",
  "Caterpillar",
  "Steve Madden",
  "Birkenstock",
];

/* ---------------------------------------------------------------------------
 * Testimonios de ejemplo para la sección social.
 * --------------------------------------------------------------------------- */
export const TESTIMONIALS = [
  {
    name: "Laura Gómez",
    role: "Cliente verificada",
    quote:
      "Pedí unos Nike por WhatsApp y el proceso fue súper claro. Llegaron al día siguiente y la talla era perfecta.",
    rating: 5,
  },
  {
    name: "Carlos Ríos",
    role: "Cliente verificado",
    quote:
      "Excelente atención. Me asesoraron por WhatsApp para elegir la talla correcta. El calzado es de muy buena calidad.",
    rating: 5,
  },
  {
    name: "Daniela Torres",
    role: "Cliente verificada",
    quote:
      "Me encantó la variedad de marcas. La página es fácil de usar y el checkout por WhatsApp hace todo muy rápido.",
    rating: 4,
  },
];

/* ---------------------------------------------------------------------------
 * Ubicaciones para el formulario de checkout (Colombia). Estructurado como
 * departamento -> ciudades, para alimentar selects dependientes.
 * --------------------------------------------------------------------------- */
export const LOCATIONS = {
  Amazonas: ["Leticia", "Puerto Nariño"],
  Antioquia: ["Medellín", "Bello", "Itagüí", "Envigado", "Rionegro"],
  Atlántico: ["Barranquilla", "Soledad", "Sabanalarga"],
  Bolívar: ["Cartagena", "Magangué", "Turbaco"],
  Boyacá: ["Tunja", "Duitama", "Sogamoso"],
  Caldas: ["Manizales", "La Dorada", "Chinchiná"],
  Caquetá: ["Florencia", "San Vicente del Cagúán"],
  Cauca: ["Popayán", "Patía", "Santander de Quilichao"],
  Cesar: ["Valledupar", "Aguachica", "Codazzi"],
  Córdoba: ["Montería", "Cereté", "Lorica"],
  Cundinamarca: ["Bogotá", "Soacha", "Chía", "Zipaquirá", "Fusagasugá", "Mosquera", "Madrid", "Facatativá"],
  Chocó: ["Quibdó", "Istmina"],
  Huila: ["Neiva", "Pitalito", "Garzón"],
  La_Guajira: ["Riohacha", "Maicao", "Uribia"],
  Magdalena: ["Santa Marta", "Ciénaga", "Fundación"],
  Meta: ["Villavicencio", "Acacías", "Granada"],
  Nariño: ["Pasto", "Tumaco", "Ipiales"],
  Norte_de_Santander: ["Cúcuta", "Ocaña", "Pamplona"],
  Quindío: ["Armenia", "Calarcá", "Montenegro"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  Santander: ["Bucaramanga", "Floridablanca", "Girón", "Barrancabermeja"],
  Sucre: ["Sincelejo", "Corozal", "Sampués"],
  Tolima: ["Ibagué", "Espinal", "Honda"],
  Valle_del_Cauca: ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Yumbo"],
};

/* ---------------------------------------------------------------------------
 * Enlaces de navegación principal (reutilizables en header y footer).
 * `route` corresponde al hash de la SPA (#/catalogo).
 * --------------------------------------------------------------------------- */
export const NAV_LINKS = [
  { label: "Inicio", route: "" },
  { label: "Catálogo", route: "catalogo" },
  { label: "Marcas", route: "marcas" },
  { label: "Nosotros", route: "nosotros" },
  { label: "Contacto", route: "contacto" },
];
