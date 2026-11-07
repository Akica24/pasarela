/**
 * products.js
 * ----------------------------------------------------------------------------
 * Datos de demostración del catálogo de zapatos.
 *
 * Estructura cada producto para que pueda sustituirse 1:1 por una respuesta de
 * API en una fase posterior. Cada propiedad corresponde a un campo que el
 * backend devolvería (id, nombre, marca, categoría, precios, descripción,
 * colores, tallas, stock, destacado, popularidad, fecha).
 *
 * Las imágenes se generan con image.js a partir del color del producto, por lo
 * que no se almacenan URLs de fotos aquí; cuando exista backend, cada producto
 * incluirá además un campo `images: [url...]`.
 * ----------------------------------------------------------------------------
 */

export const PRODUCTS = [
  {
    id: "nike-air-stride-01",
    name: "Air Stride Pro",
    model: "Air Stride Pro",
    brand: "Nike",
    category: "Deportivos",
    categorySlug: "deportivos",
    price: 429000,
    oldPrice: 499000,
    description:
      "Tenis de running con amortiguación responsiva y malla transpirable. Diseñados para entrenamientos de media y larga distancia con un ajuste envolvente.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Azul marino", hex: "#1f2a44" },
      { name: "Rojo", hex: "#c0392b" },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    stock: 24,
    featured: true,
    popularity: 96,
    dateAdded: "2026-10-20",
  },
  {
    id: "adidas-runflux-02",
    name: "RunFlux 3.0",
    model: "RunFlux 3.0",
    brand: "Adidas",
    category: "Deportivos",
    categorySlug: "deportivos",
    price: 389000,
    oldPrice: null,
    description:
      "Zapatillas ligeras con suela de espuma RETURN que devuelve energía en cada paso. Capellada de tejido reciclado de alta durabilidad.",
    colors: [
      { name: "Blanco", hex: "#f4f1ec" },
      { name: "Gris", hex: "#6b6b73" },
      { name: "Verde", hex: "#2f7d5b" },
    ],
    sizes: [38, 39, 40, 41, 42, 43],
    stock: 17,
    featured: true,
    popularity: 88,
    dateAdded: "2026-10-12",
  },
  {
    id: "puma-fastlane-03",
    name: "Fastlane Street",
    model: "Fastlane Street",
    brand: "Puma",
    category: "Urbanos",
    categorySlug: "urbanos",
    price: 319000,
    oldPrice: 359000,
    description:
      "Tenis urbanos de perfil bajo con suela de goma resistente. Ideales para uso diario con un toque deportivo y versátil.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Naranja", hex: "#d35400" },
    ],
    sizes: [39, 40, 41, 42, 43, 44],
    stock: 12,
    featured: false,
    popularity: 74,
    dateAdded: "2026-09-30",
  },
  {
    id: "newbalance-990-04",
    name: "990 Heritage",
    model: "990 Heritage",
    brand: "New Balance",
    category: "Urbanos",
    categorySlug: "urbanos",
    price: 649000,
    oldPrice: null,
    description:
      "Modelo icónico de la línea 990 con combinación de gamuza y malla. Confort premium y estética atemporal para el día a día.",
    colors: [
      { name: "Gris", hex: "#6b6b73" },
      { name: "Beige", hex: "#cdbb9a" },
    ],
    sizes: [40, 41, 42, 43, 44],
    stock: 8,
    featured: true,
    popularity: 92,
    dateAdded: "2026-10-25",
  },
  {
    id: "vans-oldskool-05",
    name: "Old Skool Classic",
    model: "Old Skool Classic",
    brand: "Vans",
    category: "Casuales",
    categorySlug: "casuales",
    price: 259000,
    oldPrice: 299000,
    description:
      "El clásico skate con la franja lateral característica. Suela vulcanizada y construcción duradera, perfecto para el estilo casual.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Blanco", hex: "#f4f1ec" },
      { name: "Azul marino", hex: "#1f2a44" },
    ],
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    stock: 30,
    featured: false,
    popularity: 81,
    dateAdded: "2026-09-18",
  },
  {
    id: "converse-allstar-06",
    name: "Chuck Taylor All Star",
    model: "Chuck Taylor All Star",
    brand: "Converse",
    category: "Casuales",
    categorySlug: "casuales",
    price: 229000,
    oldPrice: null,
    description:
      "El icónico zapato de lona de caña alta. Ligero, transpirable y atemporal, combina con cualquier look casual.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Rojo", hex: "#c0392b" },
      { name: "Blanco", hex: "#f4f1ec" },
    ],
    sizes: [37, 38, 39, 40, 41, 42, 43],
    stock: 26,
    featured: true,
    popularity: 85,
    dateAdded: "2026-10-05",
  },
  {
    id: "clarks-desert-07",
    name: "Desert Oxford",
    model: "Desert Oxford",
    brand: "Clarks",
    category: "Formales",
    categorySlug: "formales",
    price: 419000,
    oldPrice: 469000,
    description:
      "Zapato formal en gamuza con construcción cosida Goodyear. Elegante, cómodo y apto para oficina y ocasiones formales.",
    colors: [
      { name: "Café", hex: "#6e3c1e" },
      { name: "Negro", hex: "#1b1b1f" },
    ],
    sizes: [40, 41, 42, 43, 44],
    stock: 14,
    featured: false,
    popularity: 70,
    dateAdded: "2026-09-22",
  },
  {
    id: "clarks-trego-08",
    name: "Trego Brogue",
    model: "Trego Brogue",
    brand: "Clarks",
    category: "Formales",
    categorySlug: "formales",
    price: 459000,
    oldPrice: null,
    description:
      "Oxford con perforaciones brogue y suela de cuero pulido. Un básico de vestir para el caballero moderno.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Café", hex: "#6e3c1e" },
    ],
    sizes: [40, 41, 42, 43, 44],
    stock: 9,
    featured: true,
    popularity: 78,
    dateAdded: "2026-10-28",
  },
  {
    id: "timberland-6inch-09",
    name: "6-Inch Premium",
    model: "6-Inch Premium",
    brand: "Timberland",
    category: "Botas",
    categorySlug: "botas",
    price: 689000,
    oldPrice: 749000,
    description:
      "Bota impermeable de cuero nubuck con cordones resistentes y acolchado interno. Construcción robusta para todo terreno.",
    colors: [
      { name: "Café", hex: "#6e3c1e" },
      { name: "Negro", hex: "#1b1b1f" },
    ],
    sizes: [40, 41, 42, 43, 44],
    stock: 11,
    featured: true,
    popularity: 90,
    dateAdded: "2026-10-15",
  },
  {
    id: "caterpillar-renvar-10",
    name: "Renvar Composite",
    model: "Renvar Composite",
    brand: "Caterpillar",
    category: "Botas",
    categorySlug: "botas",
    price: 529000,
    oldPrice: null,
    description:
      "Bota de trabajo con puntera reforzada y suela antideslizante. Resistente, segura y cómoda para largas jornadas.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Café", hex: "#6e3c1e" },
    ],
    sizes: [40, 41, 42, 43, 44],
    stock: 7,
    featured: false,
    popularity: 66,
    dateAdded: "2026-09-10",
  },
  {
    id: "reebok-club-11",
    name: "Club C 85",
    model: "Club C 85",
    brand: "Reebok",
    category: "Casuales",
    categorySlug: "casuales",
    price: 249000,
    oldPrice: 279000,
    description:
      "Tenis de cuero con inspiración tenística. Minimalista y limpio, un básico que combina con todo.",
    colors: [
      { name: "Blanco", hex: "#f4f1ec" },
      { name: "Verde", hex: "#2f7d5b" },
    ],
    sizes: [38, 39, 40, 41, 42, 43],
    stock: 19,
    featured: false,
    popularity: 72,
    dateAdded: "2026-09-26",
  },
  {
    id: "steve-jolie-12",
    name: "Jolie Stiletto",
    model: "Jolie Stiletto",
    brand: "Steve Madden",
    category: "Tacones",
    categorySlug: "tacones",
    price: 289000,
    oldPrice: 329000,
    description:
      "Tacones de aguja con punta afilada y acabado satinado. Elegancia para ocasiones especiales y eventos formales.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Burdeos", hex: "#7a1f2b" },
      { name: "Beige", hex: "#cdbb9a" },
    ],
    sizes: [35, 36, 37, 38, 39, 40],
    stock: 16,
    featured: true,
    popularity: 84,
    dateAdded: "2026-10-22",
  },
  {
    id: "steve-block-13",
    name: "Block Heel Pump",
    model: "Block Heel Pump",
    brand: "Steve Madden",
    category: "Tacones",
    categorySlug: "tacones",
    price: 259000,
    oldPrice: null,
    description:
      "Tacones de bloque estables y confortables, ideales para el día a la noche. Confort sin sacrificar el estilo.",
    colors: [
      { name: "Beige", hex: "#cdbb9a" },
      { name: "Negro", hex: "#1b1b1f" },
    ],
    sizes: [35, 36, 37, 38, 39, 40],
    stock: 13,
    featured: false,
    popularity: 69,
    dateAdded: "2026-09-14",
  },
  {
    id: "birkenstock-arizona-14",
    name: "Arizona EVA",
    model: "Arizona EVA",
    brand: "Birkenstock",
    category: "Sandalias",
    categorySlug: "sandalias",
    price: 189000,
    oldPrice: 219000,
    description:
      "Sandalia ergonómica de EVA ligero y resistente al agua. Plantilla anatómica que se adapta al pie con el uso.",
    colors: [
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Beige", hex: "#cdbb9a" },
      { name: "Verde", hex: "#2f7d5b" },
    ],
    sizes: [38, 39, 40, 41, 42, 43],
    stock: 22,
    featured: true,
    popularity: 80,
    dateAdded: "2026-10-18",
  },
  {
    id: "havaianas-top-15",
    name: "Top Flip Flop",
    model: "Top Flip Flop",
    brand: "Havaianas",
    category: "Sandalias",
    categorySlug: "sandalias",
    price: 69000,
    oldPrice: null,
    description:
      "Clásica sandalia de goma ligera y resistente. Perfecta para el calor y la playa, con gran durabilidad.",
    colors: [
      { name: "Azul", hex: "#1f4e8c" },
      { name: "Negro", hex: "#1b1b1f" },
      { name: "Naranja", hex: "#d35400" },
    ],
    sizes: [38, 39, 40, 41, 42, 43, 44],
    stock: 40,
    featured: false,
    popularity: 62,
    dateAdded: "2026-08-30",
  },
  {
    id: "nike-court-16",
    name: "Court Vision Low",
    model: "Court Vision Low",
    brand: "Nike",
    category: "Urbanos",
    categorySlug: "urbanos",
    price: 299000,
    oldPrice: 339000,
    description:
      "Inspirado en el básquet clásico, con cuero sintético y perfil bajo. Comodidad y estilo retro para el día a día.",
    colors: [
      { name: "Blanco", hex: "#f4f1ec" },
      { name: "Negro", hex: "#1b1b1f" },
    ],
    sizes: [39, 40, 41, 42, 43, 44],
    stock: 21,
    featured: false,
    popularity: 77,
    dateAdded: "2026-10-02",
  },
];

/* ---------------------------------------------------------------------------
 * Helpers de acceso a los productos.
 * Centralizados aquí para que el resto de la app no dependa del arreglo
 * directamente y sea trivial cambiar el origen de los datos.
 * --------------------------------------------------------------------------- */
export function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function featuredProducts() {
  return PRODUCTS.filter((p) => p.featured);
}

/* Marca, categorías, tallas y colores únicos (para construir filtros). */
export function allBrands() {
  return [...new Set(PRODUCTS.map((p) => p.brand))].sort();
}

export function allCategories() {
  const seen = new Map();
  PRODUCTS.forEach((p) => {
    if (!seen.has(p.categorySlug)) {
      seen.set(p.categorySlug, { slug: p.categorySlug, name: p.category });
    }
  });
  return [...seen.values()];
}

export function allSizes() {
  return [...new Set(PRODUCTS.flatMap((p) => p.sizes))].sort((a, b) => a - b);
}

export function allColors() {
  const seen = new Map();
  PRODUCTS.forEach((p) =>
    p.colors.forEach((c) => {
      if (!seen.has(c.name)) seen.set(c.name, c);
    })
  );
  return [...seen.values()];
}
