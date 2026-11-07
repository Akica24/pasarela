/**
 * image.js
 * ----------------------------------------------------------------------------
 * Generador de imágenes de producto a partir de SVG (inline como data-URI).
 *
 * En esta fase del proyecto no se cuenta con fotografías reales, por lo que
 * se generan ilustraciones vectoriales limpias, coherentes y de apariencia
 * premium, coloreadas según el color principal de cada zapato.
 *
 * Ventajas:
 *  - Siempre se renderizan (sin riesgo de imágenes rotas en GitHub Pages).
 *  - Reflejan el color seleccionado del producto.
 *  - Son ligeras y escalables.
 *
 * Cuando se integre el backend, basta con sustituir la función
 * `productImageUrl()` por la URL de la foto real devuelta por la API, sin
 * tocar el resto del código de presentación.
 * ----------------------------------------------------------------------------
 */

/* ---------------------------------------------------------------------------
 * Utilidades de color.
 * --------------------------------------------------------------------------- */

/* Convierte un hex (#rrggbb) a {r,g,b}. */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/* Oscurece un color hex por un porcentaje (0..1). */
function darken(hex, amount = 0.18) {
  const { r, g, b } = hexToRgb(hex);
  const d = (v) => Math.max(0, Math.round(v * (1 - amount)));
  return `rgb(${d(r)}, ${d(g)}, ${d(b)})`;
}

/* ACLARA un color hex hacia blanco. */
function lighten(hex, amount = 0.2) {
  const { r, g, b } = hexToRgb(hex);
  const l = (v) => Math.round(v + (255 - v) * amount);
  return `rgb(${l(r)}, ${l(g)}, ${l(b)})`;
}

/* Determina si un color es claro (para elegir texto/sombra adecuados). */
function isLight(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

/* ---------------------------------------------------------------------------
 * Siluetas de zapato por categoría.
 * Cada función recibe {primary, dark, light} y devuelve el contenido SVG
 * interno (sin el fondo ni el wrapper).
 * Sistema de coordenadas: 0..400 (ancho) x 0..260 (alto), zapato apuntando
 * a la izquierda.
 * --------------------------------------------------------------------------- */

function sneakerBody(c) {
  // Silueta tipo tenis/urbano con suela, cordones y acento.
  return `
    <path d="M58,186 C52,158 70,140 112,132 L212,130 C228,130 240,141 242,158 C243,169 248,173 254,173 L262,173 C262,138 304,113 318,120 C338,128 342,152 342,180 L342,186 Z" fill="${c.primary}"/>
    <path d="M58,186 C52,158 70,140 112,132 L150,132 L150,186 Z" fill="${c.dark}" opacity="0.22"/>
    <path d="M150,140 C176,140 196,140 224,140" stroke="${c.light}" stroke-width="9" stroke-linecap="round" opacity="0.55"/>
    <path d="M150,150 C176,150 196,150 224,150" stroke="${c.light}" stroke-width="9" stroke-linecap="round" opacity="0.55"/>
    <path d="M150,160 C176,160 196,160 222,160" stroke="${c.light}" stroke-width="9" stroke-linecap="round" opacity="0.55"/>
    <circle cx="160" cy="140" r="4" fill="${c.light}"/>
    <circle cx="178" cy="140" r="4" fill="${c.light}"/>
    <circle cx="196" cy="140" r="4" fill="${c.light}"/>
    <circle cx="214" cy="140" r="4" fill="${c.light}"/>
    <path d="M70,176 C150,150 250,150 320,176" stroke="${c.dark}" stroke-width="14" stroke-linecap="round" fill="none"/>
  `;
}

function bootBody(c) {
  // Bota: collar alto que sube por encima del tobillo.
  return `
    <path d="M58,186 C52,160 70,144 112,140 L210,140 L210,86 C210,70 226,62 252,62 C286,62 300,78 300,104 L300,140 C324,140 342,154 342,180 L342,186 Z" fill="${c.primary}"/>
    <path d="M58,186 C52,160 70,144 112,140 L150,140 L150,186 Z" fill="${c.dark}" opacity="0.22"/>
    <path d="M244,66 C278,66 292,82 292,108" stroke="${c.dark}" stroke-width="6" fill="none" opacity="0.5"/>
    <rect x="200" y="120" width="40" height="10" rx="5" fill="${c.light}" opacity="0.8"/>
    <rect x="200" y="138" width="40" height="10" rx="5" fill="${c.light}" opacity="0.8"/>
    <path d="M70,178 C150,154 250,154 320,178" stroke="${c.dark}" stroke-width="14" stroke-linecap="round" fill="none"/>
  `;
}

function formalBody(c) {
  // Zapato formal tipo Oxford: perfil bajo, lengüeta y costuras.
  return `
    <path d="M52,186 C48,168 64,156 120,150 L240,150 C288,150 330,162 344,182 L344,186 Z" fill="${c.primary}"/>
    <path d="M120,150 C170,150 200,150 240,150 C260,150 280,156 286,168 L120,168 Z" fill="${c.dark}" opacity="0.2"/>
    <path d="M120,168 C150,160 190,160 230,168" stroke="${c.dark}" stroke-width="4" fill="none" opacity="0.6"/>
    <path d="M150,150 C176,150 196,150 222,150" stroke="${c.dark}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.7"/>
    <circle cx="158" cy="150" r="3.5" fill="${c.dark}"/>
    <circle cx="176" cy="150" r="3.5" fill="${c.dark}"/>
    <circle cx="194" cy="150" r="3.5" fill="${c.dark}"/>
    <circle cx="212" cy="150" r="3.5" fill="${c.dark}"/>
    <path d="M70,180 C150,162 252,162 322,180" stroke="${c.dark}" stroke-width="12" stroke-linecap="round" fill="none"/>
  `;
}

function sandalBody(c) {
  // Sandalia: plantilla abierta con tiras.
  return `
    <path d="M52,186 C48,168 70,150 130,146 L300,146 C334,146 348,166 348,186 Z" fill="${c.primary}"/>
    <path d="M150,150 C176,150 250,150 290,150" stroke="${c.light}" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path d="M120,150 C140,120 200,120 220,150" stroke="${c.light}" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M150,176 C190,176 250,176 300,176" stroke="${c.light}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.9"/>
    <path d="M70,186 C150,170 252,170 322,186" stroke="${c.dark}" stroke-width="12" stroke-linecap="round" fill="none"/>
  `;
}

function heelBody(c) {
  // Tacones: punta redonda y tacón fino.
  return `
    <path d="M50,176 C46,160 66,150 120,148 L268,148 C300,148 322,160 330,176 L330,180 L50,180 Z" fill="${c.primary}"/>
    <path d="M120,148 C170,148 230,148 268,148 C286,148 300,156 300,168 L120,168 Z" fill="${c.dark}" opacity="0.18"/>
    <path d="M150,156 C176,156 196,156 230,156" stroke="${c.light}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.85"/>
    <path d="M300,180 L300,232 L320,232 L320,180 Z" fill="${c.dark}"/>
    <path d="M60,180 C150,164 252,164 322,180" stroke="${c.dark}" stroke-width="10" stroke-linecap="round" fill="none"/>
  `;
}

/* ---------------------------------------------------------------------------
 * Mapa categoría -> silueta.
 * --------------------------------------------------------------------------- */
const SILHOUETTES = {
  deportivos: sneakerBody,
  running: sneakerBody,
  casuales: sneakerBody,
  urbanos: sneakerBody,
  formales: formalBody,
  botas: bootBody,
  sandalias: sandalBody,
  tacones: heelBody,
};

/* ---------------------------------------------------------------------------
 * Paletas de fondo para las distintas "vistas" de la galería (4 por producto).
 * Se derivan de tonos suaves y armónicos.
 * --------------------------------------------------------------------------- */
const BACKGROUNDS = [
  { from: "#f3efe8", to: "#e7e0d4" },
  { from: "#eef1f5", to: "#dfe4ec" },
  { from: "#f6efe9", to: "#ecdfd2" },
  { from: "#ecefe7", to: "#dde3d6" },
];

/* ---------------------------------------------------------------------------
 * Construye el SVG completo de un producto.
 *  product  -> objeto producto
 *  colorHex -> hex del color a representar
 *  view     -> índice 0..3 para variar el fondo de la galería
 * --------------------------------------------------------------------------- */
function buildSvg(product, colorHex, view = 0) {
  const primary = colorHex || (product.colors && product.colors[0]?.hex) || "#3b3b40";
  const dark = darken(primary, 0.26);
  const light = isLight(primary) ? darken(primary, 0.12) : lighten(primary, 0.45);
  const sole = "#f4f1ec";
  const bg = BACKGROUNDS[view % BACKGROUNDS.length];

  const type = (product.categorySlug || "deportivos").toLowerCase();
  const bodyFn = SILHOUETTES[type] || sneakerBody;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="g${view}${(product.id || "").replace(/\W/g, "")}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg.from}"/>
      <stop offset="1" stop-color="${bg.to}"/>
    </linearGradient>
    <radialGradient id="r${view}${(product.id || "").replace(/\W/g, "")}" cx="0.5" cy="0.62" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g${view}${(product.id || "").replace(/\W/g, "")})"/>
  <rect width="400" height="300" fill="url(#r${view}${(product.id || "").replace(/\W/g, "")})"/>
  <ellipse cx="200" cy="250" rx="150" ry="16" fill="#000000" opacity="0.08"/>
  <g transform="translate(0,22)">
    ${bodyFn({ primary, dark, light })}
    <path d="M52,186 L344,186 L344,210 C344,222 332,228 320,228 L76,228 C64,228 52,222 52,210 Z" fill="${sole}"/>
    <path d="M52,196 L344,196" stroke="${darken(sole, 0.18)}" stroke-width="3" opacity="0.6"/>
  </g>
  <text x="32" y="40" font-family="Georgia, serif" font-size="20" font-weight="700" fill="#1b1b1f" opacity="0.55">${(product.brand || "").toUpperCase()}</text>
  <text x="32" y="62" font-family="Inter, system-ui, sans-serif" font-size="13" fill="#6b6b73">${(product.model || product.name || "").slice(0, 24)}</text>
</svg>`.trim();

  return svg;
}

/* ---------------------------------------------------------------------------
 * API pública del módulo.
 * --------------------------------------------------------------------------- */

/* Devuelve un data-URI listo para usar en <img src>. */
export function productImage(product, view = 0, colorHex = null) {
  const hex = colorHex || (product.colors && product.colors[0]?.hex) || null;
  const svg = buildSvg(product, hex, view);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* Devuelve un arreglo con N imágenes (para la galería). */
export function productGallery(product, count = 4) {
  const hex = product.colors && product.colors[0]?.hex;
  return Array.from({ length: count }, (_, i) => productImage(product, i, hex));
}

/* Miniatura de producto (variante compacta, usada en tarjetas y carrito). */
export function productThumb(product) {
  return productImage(product, 0);
}
